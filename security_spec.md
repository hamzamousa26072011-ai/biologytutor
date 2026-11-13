# da7ee7-biology — Firestore Security Specification

## 1. Data Invariants
1. **User Profile Ownership & PII Isolation**: A `/users/{userId}` document can only be read, created, or updated by the authenticated owner whose `request.auth.uid == userId` and `request.auth.token.email_verified == true`, or by the verified admin (`hamzamousa26072011@gmail.com`).
2. **Subcollection Master Gate**: A `/users/{userId}/papers/{paperId}` document can only exist if the parent `/users/{userId}` document exists and `request.auth.uid == userId`.
3. **Strict Schema & Volumetric Limits**: All string fields enforce `minLength`, `maxLength`, and regex patterns defined in `firebase-blueprint.json`. `dailyUsedCount` is bounded between `0` and `10` for standard users, and up to `1000000` exclusively for the verified admin (`hamzamousa26072011@gmail.com`).
4. **Temporal Integrity**: `createdAt` and `updatedAt` must equal `request.time`, and `uid`, `email`, and `createdAt` are immutable across updates.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: Writing to `/users/user_1` with `request.auth == null` -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: Writing to `/users/user_1` with `email_verified == false` -> `PERMISSION_DENIED`.
3. **Cross-User PII Read**: Authenticated `user_2` reading `/users/user_1` -> `PERMISSION_DENIED`.
4. **Identity Spoofing on Create**: `user_1` creating `/users/user_1` with `data.uid = "user_2"` -> `PERMISSION_DENIED`.
5. **Shadow Field Injection on Create**: Creating `/users/user_1` with extra field `isAdmin: true` -> `PERMISSION_DENIED`.
6. **Shadow Field Injection on Update**: Updating `/users/user_1` with extra field `role: "admin"` -> `PERMISSION_DENIED`.
7. **Immutable Field Mutation**: Updating `/users/user_1` where `createdAt` or `uid` changes -> `PERMISSION_DENIED`.
8. **Forged Client Timestamp**: Creating `/users/user_1` with `createdAt != request.time` -> `PERMISSION_DENIED`.
9. **Daily Quota Overflow**: Updating `/users/user_1` with `dailyUsedCount: 999` for standard non-admin user -> `PERMISSION_DENIED`.
10. **Path ID Poisoning**: Creating `/users/{invalid$id}/papers/p1` with non-alphanumeric ID or length > 128 -> `PERMISSION_DENIED`.
11. **Orphaned Paper Write**: Creating `/users/user_1/papers/paper_1` when `/users/user_1` does not exist -> `PERMISSION_DENIED`.
12. **Value Poisoning on Paper**: Creating `/users/user_1/papers/paper_1` with a 1MB `examinerSummary` string -> `PERMISSION_DENIED`.
