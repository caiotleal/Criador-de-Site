import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; 
import CPanel from './CPanel';

const isCPanel = window.location.hostname.startsWith('cpanel') || window.location.pathname.startsWith('/cp');

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {isCPanel ? <CPanel /> : <App />}
    </React.StrictMode>
  );
} else {
  console.error("ERRO CRÍTICO: Não encontrei a div com id 'root' no HTML");
}
