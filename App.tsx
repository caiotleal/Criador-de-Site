import React, { useState } from 'react';
import { BusinessForm } from './components/BusinessForm';
import { PreviewPanel } from './components/PreviewPanel'; // Novo: Painel visual antes do deploy
import { AuthModal } from './components/AuthModal';       // Novo: Login/Cadastro
import { FormData } from './types';

// Definindo as fases do App
type AppStep = 'FORM' | 'PREVIEW' | 'AUTH' | 'DEPLOYING';

function App() {
  const [step, setStep] = useState<AppStep>('FORM');
  const [formData, setFormData] = useState<FormData>(INITIAL_STATE);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // Integrar com Firebase Auth

  // 1. Após preencher, ele vai para o Preview (não para o Deploy)
  const handleGoToPreview = () => {
    // Aqui podemos validar se os campos básicos estão ok
    setStep('PREVIEW');
  };

  // 2. No Preview, ele clica em "Publicar Site" e pedimos Login
  const handlePublishRequest = () => {
    if (!isUserLoggedIn) {
      setStep('AUTH');
    } else {
      startDeployProcess();
    }
  };

  // 3. O Deploy real só acontece aqui
  const startDeployProcess = async () => {
    setStep('DEPLOYING');
    // Chamada para Firebase Function...
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER DINÂMICO CONFORME O PASSO */}
      <nav className="p-4 border-b bg-white flex justify-between items-center">
        <span className="font-bold text-xl text-blue-600 italic">SiteCraft</span>
        <div className="flex gap-2">
          <StepIndicator currentStep={step} />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        
        {/* PASSO 1: FORMULÁRIO */}
        {step === 'FORM' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <BusinessForm data={formData} updateData={handleUpdateForm} />
            <button 
              onClick={handleGoToPreview}
              className="mt-6 w-full bg-blue-600 text-white py-4 rounded-xl font-bold"
            >
              Visualizar rascunho do site →
            </button>
          </div>
        )}

        {/* PASSO 2: PREVIEW (A IA mostra como vai ficar) */}
        {step === 'PREVIEW' && (
          <div className="animate-in zoom-in-95">
            <PreviewPanel data={formData} onBack={() => setStep('FORM')} />
            <div className="fixed bottom-0 left-0 w-full p-6 bg-white border-t flex justify-center gap-4">
               <button onClick={() => setStep('FORM')} className="px-6 py-2 border rounded-lg">Editar</button>
               <button 
                onClick={handlePublishRequest}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold shadow-lg"
               >
                 Tudo pronto! Publicar meu site agora
               </button>
            </div>
          </div>
        )}

        {/* PASSO 3: LOGIN / AUTH (Só aparece se não logado) */}
        {step === 'AUTH' && (
          <AuthModal 
            onSuccess={() => {
              setIsUserLoggedIn(true);
              startDeployProcess();
            }} 
          />
        )}

        {/* PASSO 4: TELA DE DEPLOY (Status da GitHub Action) */}
        {step === 'DEPLOYING' && (
          <div className="text-center py-20">
            <div className="loader..." />
            <h2 className="text-2xl font-bold mt-4">Criando sua estrutura blindada...</h2>
            <p className="text-slate-500">Configurando Firebase Hosting e GitHub Actions.</p>
          </div>
        )}

      </main>
    </div>
  );
}
