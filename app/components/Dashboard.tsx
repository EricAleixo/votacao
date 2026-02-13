"use client"

import { useState, useEffect } from 'react';

// Tipo para os candidatos com votos
interface CandidateWithVotes {
  id: number;
  costume: string;
  photo: string;
  voteCount: number;
}

// Credenciais fixas (exemplo - sem backend)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

export const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  
  const [candidates, setCandidates] = useState<CandidateWithVotes[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  
  // Formulário de novo candidato
  const [newCostume, setNewCostume] = useState<string>("");
  const [newPhoto, setNewPhoto] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Carrega candidatos com votos
  const loadCandidates = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/candidature");
      if (!res.ok) throw new Error("Erro ao carregar candidatos");
      const data = await res.json();
      setCandidates(data);
    } catch (error) {
      setErrorMessage("Erro ao carregar candidatos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega candidatos ao autenticar
  useEffect(() => {
    if (isAuthenticated) {
      loadCandidates();
      
      // Atualiza a cada 5 segundos
      const interval = setInterval(loadCandidates, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setLoginError("Usuário ou senha incorretos");
    }
  };

  // Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  // Adicionar candidato
  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCostume.trim() || !newPhoto.trim()) {
      setErrorMessage("Preencha todos os campos");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          costume: newCostume.trim(),
          photo: newPhoto.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao adicionar candidato");
      }

      setSuccessMessage(`Fantasia "${newCostume}" adicionada com sucesso!`);
      setNewCostume("");
      setNewPhoto("");
      
      // Recarrega a lista
      await loadCandidates();
      
      // Remove mensagem de sucesso após 3s
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao adicionar");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deletar candidato
  const handleDeleteCandidate = async (id: number, costume: string) => {
    if (!confirm(`Tem certeza que deseja deletar a fantasia "${costume}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao deletar candidato");
      }

      setSuccessMessage(`Fantasia "${costume}" deletada com sucesso!`);
      await loadCandidates();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao deletar");
    }
  };

  // Calcular total de votos
  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

  // Obter emoji de medalha
  const getMedal = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return null;
  };

  // Tela de Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e1e77] via-[#2a2a9f] to-[#1e1e77] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎭</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
            <p className="text-gray-600">Gerenciamento do Concurso de Fantasias</p>
          </div>

          {loginError && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl">
              <p className="text-sm font-semibold">⚠️ {loginError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="Digite seu usuário"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="Digite sua senha"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform active:scale-95 shadow-lg"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 text-center">
              <strong>Demo:</strong> admin / admin123
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e77] via-[#2a2a9f] to-[#1e1e77] p-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">🎭 Dashboard Admin</h1>
              <p className="text-gray-600">Gerenciamento de Fantasias do Carnaval</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total de Fantasias</p>
                <p className="text-3xl font-bold text-gray-900">{candidates.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total de Votos</p>
                <p className="text-3xl font-bold text-gray-900">{totalVotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-xl">
                <span className="text-3xl">🏆</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Líder Atual</p>
                <p className="text-xl font-bold text-gray-900 truncate">
                  {candidates.length > 0 && candidates[0].voteCount > 0 
                    ? candidates[0].costume 
                    : "Sem votos"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        {errorMessage && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-5 py-4 rounded-2xl animate-slideDown">
            <div className="flex items-center justify-between">
              <span className="font-semibold">⚠️ {errorMessage}</span>
              <button onClick={() => setErrorMessage("")} className="text-red-700 hover:text-red-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-5 py-4 rounded-2xl animate-slideDown">
            <div className="flex items-center justify-between">
              <span className="font-semibold">✅ {successMessage}</span>
              <button onClick={() => setSuccessMessage("")} className="text-green-700 hover:text-green-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Adicionar */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>➕</span> Adicionar Nova Fantasia
            </h2>

            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div>
                <label htmlFor="costume" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome da Fantasia
                </label>
                <input
                  id="costume"
                  type="text"
                  value={newCostume}
                  onChange={(e) => setNewCostume(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="Ex: Pirata, Fada, Super-Herói..."
                  required
                />
              </div>

              <div>
                <label htmlFor="photo" className="block text-sm font-semibold text-gray-700 mb-2">
                  URL da Foto
                </label>
                <input
                  id="photo"
                  type="text"
                  value={newPhoto}
                  onChange={(e) => setNewPhoto(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="/1.png ou https://..."
                  required
                />
              </div>

              {newPhoto && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                  <div className="w-32 h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
                    <img
                      src={newPhoto}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='40'%3E❌%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-bold py-4 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                }`}
              >
                {isSubmitting ? '⏳ Adicionando...' : '✨ Adicionar Fantasia'}
              </button>
            </form>
          </div>

          {/* Lista de Candidatos com Votos */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>📊</span> Ranking de Votos
              </h2>
              <button
                onClick={loadCandidates}
                className="text-indigo-600 hover:text-indigo-800 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                title="Recarregar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
                <p className="text-gray-600">Carregando...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-6xl mb-4">🎭</div>
                <p className="text-gray-600">Nenhuma fantasia cadastrada ainda.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {candidates.map((candidate, index) => {
                  const position = index + 1;
                  const medal = getMedal(position);
                  const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
                  
                  return (
                    <div
                      key={candidate.id}
                      className={`
                        relative flex items-center gap-4 p-4 rounded-2xl transition-colors overflow-hidden
                        ${position <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50 hover:bg-gray-100'}
                      `}
                    >
                      {/* Barra de progresso de fundo */}
                      <div
                        className="absolute inset-0 bg-indigo-200/30 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                      
                      <div className="relative flex items-center gap-4 w-full">
                        {/* Posição */}
                        <div className="shrink-0 w-10 text-center">
                          {medal ? (
                            <span className="text-2xl">{medal}</span>
                          ) : (
                            <span className="text-lg font-bold text-gray-600">{position}º</span>
                          )}
                        </div>

                        {/* Foto */}
                        <div className="w-16 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0">
                          <img
                            src={candidate.photo}
                            alt={candidate.costume}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg truncate">
                            {candidate.costume}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-2xl font-bold text-indigo-600">
                              {candidate.voteCount}
                            </span>
                            <span className="text-sm text-gray-600">
                              {candidate.voteCount === 1 ? 'voto' : 'votos'}
                            </span>
                            {percentage > 0 && (
                              <span className="text-xs text-gray-500">
                                ({percentage.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botão deletar */}
                        <button
                          onClick={() => handleDeleteCandidate(candidate.id, candidate.costume)}
                          className="shrink-0 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                          title="Deletar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {candidates.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  ⏱️ Atualização automática a cada 5 segundos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};