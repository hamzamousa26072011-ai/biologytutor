import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

const eslintConfig = [
  {
    ignores: [
      'dist/**/*',
      '.next/**/*',
      '.next-dev/**/*',
      'node_modules/**/*',
      '.playwright-cli/**/*',
    ],
  },
  ...nextVitals,
  ...nextTs,
  firebaseRulesPlugin.configs['flat/recommended'],
];

export default eslintConfig;
