
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Substitua pelos valores do seu console do Firebase se necessário, 
// mas para o Hosting do Firebase, os valores são injetados automaticamente ou podem ser genéricos se usar o CLI.
const firebaseConfig = {
  apiKey: "AIzaSy...", // O Firebase Hosting gerencia isso em produção
  authDomain: "criador-de-site-1a91d.firebaseapp.com",
  projectId: "criador-de-site-1a91d",
  storageBucket: "criador-de-site-1a91d.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
