import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn } from 'lucide-react';

interface LoginPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) return;
    onSuccess(email);
    setPassword('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-white shadow-2xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Entrar na plataforma</h2>
              <button onClick={onClose} className="p-1 rounded hover:bg-zinc-800" aria-label="Fechar login">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-zinc-400 mb-5">
              Faça login para desbloquear a publicação por <strong>5 dias grátis</strong> e gerar domínio.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                required
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                <LogIn size={16} /> Entrar e liberar publicação
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginPage;
