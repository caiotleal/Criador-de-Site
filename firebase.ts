// Fixed: Using modular named imports instead of namespace import to solve property access errors in Firebase v9+
import { initializeApp, getApps, getApp } from 'firebase/app';
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

// Fixed: Using the correct initialization pattern for Firebase JS SDK v9+ modular syntax
// This avoids "Property does not exist" errors on the firebase namespace
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);