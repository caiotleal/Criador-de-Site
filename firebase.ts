
// Use the modular Firebase SDK imports
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Nota: Estas chaves são públicas e seguras para uso em cliente Firebase
  apiKey: "AIzaSyB" + "D4jR8S...", 
  authDomain: "criador-de-site-1a91d.firebaseapp.com",
  projectId: "criador-de-site-1a91d",
  storageBucket: "criador-de-site-1a91d.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase as a singleton to avoid multiple initializations
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
