import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBwmlFaONdzX69AUMd9ybA8ljngO1t_0bw", // Sua chave de API principal
  authDomain: "criador-de-site-1a91d.firebaseapp.com",
  projectId: "criador-de-site-1a91d",
  storageBucket: "criador-de-site-1a91d.firebasestorage.app",
  messagingSenderId: "777420488661",
  appId: "1:777420488661:web:5319808a98b4f056d68884"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o Banco de Dados para o App.tsx usar
export const db = getFirestore(app);

// Inicializa a IA com a chave que você criou no Default Gemini Project
export const genAI = new GoogleGenerativeAI("AIzaSyCaSWUQkoNNf7I3Qt_mz7rTDFkZ8WBvl9g");
