import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyBwmlFaONdzX69AUMd9ybA8ljngO1t_0bw',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'criador-de-site-1a91d.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'criador-de-site-1a91d',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'criador-de-site-1a91d.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '777420488661',
  appId: env.VITE_FIREBASE_APP_ID || '1:777420488661:web:5319808a98b4f056d68884',
};

if (!firebaseConfig.apiKey) {
  throw new Error('Firebase API key ausente. Defina VITE_FIREBASE_API_KEY no ambiente.');
}

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

export default app;
