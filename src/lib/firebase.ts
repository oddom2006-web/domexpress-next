import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth }      from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            '.........',
  authDomain:        '.........',
  projectId:         '.........',
  storageBucket:     '.........',
  messagingSenderId: '.........',
  appId:             '..........',
};

// Singleton — prevent re-initializing on hot reload
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
