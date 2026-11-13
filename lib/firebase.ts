import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  setLogLevel,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { GradingResult, getTodayDateKey, isAdminEmail } from './marking-engine';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: Array<{
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }>;
  };
}

export interface StoredAccountSummary {
  uid: string;
  email: string;
  name: string;
  provider: 'google' | 'email';
  lastSignedInAt: string;
}

export interface FirebaseSavedPaper {
  id: string;
  uid: string;
  title: string;
  awardedMarks: number;
  totalMarks: number;
  percentage: number;
  examinerSummary: string;
  correctedVersion: string;
  createdAtMs: number;
}

const SAVED_ACCOUNTS_STORAGE_KEY = 'da7ee7_biology_saved_accounts_v1';
const LOCAL_USAGE_STORAGE_KEY = 'da7ee7_biology_usage_v1';
const LOCAL_USER_SESSION_KEY = 'da7ee7_biology_active_user_v1';

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;
let connectionTested = false;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig &&
      firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

export function getFirebaseServices(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  googleProvider: GoogleAuthProvider | null;
} {
  if (typeof window === 'undefined' || !isFirebaseConfigured()) {
    return { app: null, auth: null, db: null, googleProvider: null };
  }

  try {
    if (!appInstance) {
      appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }
    if (!authInstance) {
      authInstance = getAuth(appInstance);
    }
    if (!dbInstance) {
      // Silence verbose Firestore WebChannel transport errors in Next.js dev overlay
      setLogLevel('silent');
      dbInstance = firebaseConfig.firestoreDatabaseId
        ? getFirestore(appInstance, firebaseConfig.firestoreDatabaseId)
        : getFirestore(appInstance);
    }
    if (!googleProviderInstance) {
      googleProviderInstance = new GoogleAuthProvider();
      googleProviderInstance.setCustomParameters({ prompt: 'select_account' });
    }
    return {
      app: appInstance,
      auth: authInstance,
      db: dbInstance,
      googleProvider: googleProviderInstance,
    };
  } catch (err) {
    console.warn('Firebase initialization warning:', err);
    return { app: null, auth: null, db: null, googleProvider: null };
  }
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  const { auth } = getFirebaseServices();
  const currentUser = auth?.currentUser;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo:
        currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };

  console.warn('Firestore operation notice:', JSON.stringify(errInfo));
  return errInfo;
}

export async function testFirestoreConnection(): Promise<boolean> {
  if (typeof window === 'undefined' || connectionTested) return true;
  connectionTested = true;

  const { db } = getFirebaseServices();
  if (!db) return false;

  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes('the client is offline')
    ) {
      console.warn('Firestore client is currently offline or unreachable.');
      return false;
    }
    // Permission denied on nonexistent /test/connection is expected under default-deny rules
    return true;
  }
}

export function subscribeToFirebaseAuth(
  callback: (user: FirebaseUser | null) => void
): () => void {
  const { auth } = getFirebaseServices();
  if (!auth) {
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function signInWithFirebaseGooglePopup(): Promise<{
  uid: string;
  email: string;
  name: string;
  provider: 'google';
}> {
  const { auth, googleProvider } = getFirebaseServices();
  if (!auth || !googleProvider) {
    throw new Error('Firebase Authentication is not initialized yet.');
  }

  const credential = await signInWithPopup(auth, googleProvider);
  const fbUser = credential.user;
  const email = (fbUser.email || '').trim().toLowerCase();
  const name = fbUser.displayName?.trim() || email.split('@')[0] || 'Student';

  const profile = {
    uid: fbUser.uid,
    email,
    name,
    provider: 'google' as const,
  };

  rememberSignedInAccount(profile);
  await syncFirebaseUserProfile(profile);
  return profile;
}

export async function signOutFromFirebase(): Promise<void> {
  const { auth } = getFirebaseServices();
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(LOCAL_USER_SESSION_KEY);
  }
  if (auth && auth.currentUser) {
    await signOut(auth);
  }
}

export function rememberSignedInAccount(account: {
  uid: string;
  email: string;
  name: string;
  provider: 'google' | 'email';
}): void {
  if (typeof window === 'undefined' || !account.email) return;

  try {
    const existing = loadSavedAccounts();
    const cleanEmail = account.email.trim().toLowerCase();
    const updated: StoredAccountSummary[] = [
      {
        uid: account.uid,
        email: cleanEmail,
        name: account.name.trim() || cleanEmail.split('@')[0] || 'Student',
        provider: account.provider,
        lastSignedInAt: new Date().toISOString(),
      },
      ...existing.filter((item) => item.email.toLowerCase() !== cleanEmail),
    ].slice(0, 6);

    window.localStorage.setItem(SAVED_ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
    window.localStorage.setItem(
      LOCAL_USER_SESSION_KEY,
      JSON.stringify({
        uid: account.uid,
        email: cleanEmail,
        name: account.name.trim() || cleanEmail.split('@')[0] || 'Student',
        provider: account.provider,
      })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function loadSavedAccounts(): StoredAccountSummary[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function removeSavedAccount(email: string): StoredAccountSummary[] {
  if (typeof window === 'undefined') return [];
  const next = loadSavedAccounts().filter(
    (item) => item.email.toLowerCase() !== email.trim().toLowerCase()
  );
  try {
    window.localStorage.setItem(SAVED_ACCOUNTS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors
  }
  return next;
}

export function loadActiveLocalSession(): {
  uid: string;
  email: string;
  name: string;
  provider: 'google' | 'email';
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_USER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.email === 'string' && parsed.email.includes('@')) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function loadLocalUsageMap(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_USAGE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveLocalUsageMap(map: Record<string, number>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_USAGE_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage errors
  }
}

export async function syncFirebaseUserProfile(user: {
  uid: string;
  email: string;
  name: string;
  provider: 'google' | 'email';
}): Promise<{ dailyDateKey: string; dailyUsedCount: number }> {
  const today = getTodayDateKey();
  const { auth, db } = getFirebaseServices();
  if (!auth?.currentUser || !db || auth.currentUser.uid !== user.uid) {
    return { dailyDateKey: today, dailyUsedCount: 0 };
  }

  const userRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;

  try {
    const snap = await getDoc(userRef);
    const maxCount = isAdminEmail(user.email) ? 1000000 : 10;

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email.trim().toLowerCase().slice(0, 254),
        name: (user.name || 'Student').trim().slice(0, 120),
        provider: user.provider,
        dailyDateKey: today,
        dailyUsedCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { dailyDateKey: today, dailyUsedCount: 0 };
    }

    const data = snap.data();
    const existingDateKey = typeof data?.dailyDateKey === 'string' ? data.dailyDateKey : today;
    const rawCount = typeof data?.dailyUsedCount === 'number' ? data.dailyUsedCount : 0;
    const syncedCount = existingDateKey === today ? Math.max(0, Math.min(maxCount, rawCount)) : 0;

    await setDoc(
      userRef,
      {
        name: (user.name || data?.name || 'Student').trim().slice(0, 120),
        provider: user.provider,
        dailyDateKey: today,
        dailyUsedCount: syncedCount,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return { dailyDateKey: today, dailyUsedCount: syncedCount };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return { dailyDateKey: today, dailyUsedCount: 0 };
  }
}

export async function updateFirebaseDailyUsage(
  uid: string,
  email: string,
  dailyDateKey: string,
  dailyUsedCount: number
): Promise<void> {
  const { auth, db } = getFirebaseServices();
  if (!auth?.currentUser || !db || auth.currentUser.uid !== uid) return;

  const userRef = doc(db, 'users', uid);
  const maxCount = isAdminEmail(email) ? 1000000 : 10;
  const boundedCount = Math.max(0, Math.min(maxCount, Math.floor(dailyUsedCount)));

  try {
    await setDoc(
      userRef,
      {
        dailyDateKey,
        dailyUsedCount: boundedCount,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function savePaperToFirebase(
  uid: string,
  title: string,
  result: GradingResult
): Promise<string | null> {
  const { auth, db } = getFirebaseServices();
  if (!auth?.currentUser || !db || auth.currentUser.uid !== uid) return null;

  const papersCol = collection(db, 'users', uid, 'papers');
  try {
    const created = await addDoc(papersCol, {
      uid,
      title: (title || 'Biology 0610 Paper Question').slice(0, 200),
      awardedMarks: Math.max(0, Math.min(100, Math.round(result.awardedMarks))),
      totalMarks: Math.max(1, Math.min(100, Math.round(result.totalMarks))),
      percentage: Math.max(0, Math.min(100, Math.round(result.percentage))),
      examinerSummary: (result.examinerSummary || 'Marked submission').slice(0, 4000),
      correctedVersion: (result.correctedVersion || 'Refer to mark scheme').slice(0, 4000),
      createdAt: serverTimestamp(),
    });
    return created.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `users/${uid}/papers`);
    return null;
  }
}

export async function fetchSavedPapersFromFirebase(
  uid: string
): Promise<FirebaseSavedPaper[]> {
  const { auth, db } = getFirebaseServices();
  if (!auth?.currentUser || !db || auth.currentUser.uid !== uid) return [];

  const papersCol = collection(db, 'users', uid, 'papers');
  try {
    const q = query(papersCol, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      const ts = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
      return {
        id: docSnap.id,
        uid: String(data.uid || uid),
        title: String(data.title || 'Saved Biology Paper'),
        awardedMarks: Number(data.awardedMarks || 0),
        totalMarks: Number(data.totalMarks || 1),
        percentage: Number(data.percentage || 0),
        examinerSummary: String(data.examinerSummary || ''),
        correctedVersion: String(data.correctedVersion || ''),
        createdAtMs: ts,
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${uid}/papers`);
    return [];
  }
}

export async function deletePaperFromFirebase(
  uid: string,
  paperId: string
): Promise<void> {
  const { auth, db } = getFirebaseServices();
  if (!auth?.currentUser || !db || auth.currentUser.uid !== uid) return;

  try {
    await deleteDoc(doc(db, 'users', uid, 'papers', paperId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${uid}/papers/${paperId}`);
  }
}
