// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth }      from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyCQr8utoyrPkOqdSa_Gr-Xq_1Jrw1I1xVg',
  authDomain:        'dom-express-a84da.firebaseapp.com',
  projectId:         'dom-express-a84da',
  storageBucket:     'dom-express-a84da.firebasestorage.app',
  messagingSenderId: '659512197286',
  appId:             '1:659512197286:web:5b1ae352597349a8743467',
};

// Singleton — prevent re-initializing on hot reload
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
