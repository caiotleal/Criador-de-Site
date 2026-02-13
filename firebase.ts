import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions'; // Importação necessária

// Configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBwmlFaONdzX69AUMd9ybA8ljngO1t_0bw",
  authDomain: "criador-de-site-1a91d.firebaseapp.com",
  projectId: "criador-de-site-1a91d",
  storageBucket: "criador-de-site-1a91d.firebasestorage.app",
  messagingSenderId: "777420488661",
  appId: "1:777420488661:web:5319808a98b4f056d68884"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta as ferramentas para o App.tsx usar
export const db = getFirestore(app);
export const auth = getAuth(app);

// --- A CORREÇÃO ESTÁ AQUI EMBAIXO ---
// Inicializa e exporta as Functions para que o App.tsx consiga chamar o Backend
export const functions = getFunctions(app); 

// NOTA: Removi a linha do "genAI" daqui. 
// Motivo: Agora quem chama a IA é o Backend (functions/index.js), 
// então não precisamos (e não devemos) deixar a chave exposta aqui no Frontend.

export default app;
