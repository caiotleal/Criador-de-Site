
// Fix: Use correct named imports from 'firebase/app' for the modular SDK (v9+)
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCQgMh6GiO25SYbjbg91AJGfTDGn8ESS7U",
  authDomain: "criador-de-site-1a91d.firebaseapp.com",
  projectId: "criador-de-site-1a91d",
  storageBucket: "criador-de-site-1a91d.firebasestorage.app",
  messagingSenderId: "303869540380",
  appId: "1:303869540380:web:fcd128e04c3b6de14687d9",
  measurementId: "G-P21NE965SC"
};

// Initialize Firebase only if there are no existing app instances to prevent errors during hot-reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore using the existing app instance
const db = getFirestore(app);

export { app, db };
