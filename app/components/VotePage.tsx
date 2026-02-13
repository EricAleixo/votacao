"use client"

import { useState, useEffect } from 'react';

// Tipo para os candidatos
interface Candidate {
  id: number;
  costume: string;
  photo: string;
}

async function fetchCandidates(): Promise<Candidate[]> {
  const res = await fetch("/api/vote");
  if (!res.ok) {
    throw new Error("Erro ao buscar candidatos");
  }
  return res.json();
}

async function votar(candidateId: number) {
  const res = await fetch("/api/vote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ candidateId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Erro ao registrar voto");
  }
  return data;
}

export const VotePage = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [viewingPhoto, setViewingPhoto] = useState<Candidate | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carrega os candidatos ao montar o componente
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCandidates();
        setCandidates(data);
      } catch (error) {
        setErrorMessage("Erro ao carregar candidatos. Tente recarregar a página.");
        console.error("Erro ao carregar candidatos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidates();
  }, []);

  const handleVote = async () => {
    if (!selectedCandidate || isVoting) return;

    setIsVoting(true);
    setErrorMessage("");

    try {
      await votar(selectedCandidate.id);
      
      setHasVoted(true);
      setShowSuccessModal(true);
      setShowConfetti(true);

      // Remove o confetti após a animação
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao registrar voto");
    } finally {
      setIsVoting(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e77] via-[#2a2a9f] to-[#1e1e77]">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}

      {/* Mensagem de erro - FIXA NO TOPO */}
      {errorMessage && (
        <div className="fixed top-0 left-0 right-0 z-40 px-4 pt-4">
          <div className="max-w-md mx-auto">
            <div className="bg-red-500 text-white px-5 py-3 rounded-2xl shadow-lg animate-slideDown">
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-semibold flex-1">⚠️ {errorMessage}</span>
                <button
                  onClick={() => setErrorMessage("")}
                  className="shrink-0 hover:bg-red-600 rounded-full p-1 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status de votação - FIXA NO TOPO */}
      {hasVoted && !showSuccessModal && (
        <div className="fixed top-0 left-0 right-0 z-40 px-4 pt-4">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 py-3 rounded-2xl shadow-lg animate-slideDown">
              <div className="flex items-center justify-between gap-3">
                <span className="text-lg font-semibold flex-1">🎉 Voto registrado com sucesso!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeSuccessModal}
        >
          <div 
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Voto Confirmado! 🎉
              </h2>
              
              <p className="text-gray-600 mb-6 text-lg">
                Seu voto em <span className="font-bold text-indigo-600">{selectedCandidate?.costume}</span> foi registrado com sucesso!
              </p>
              
              <button
                onClick={closeSuccessModal}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all transform active:scale-95 shadow-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização de Foto */}
      {viewingPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setViewingPhoto(null)}
        >
          <div className="relative max-w-sm w-full">
            <button
              onClick={() => setViewingPhoto(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-3/4 bg-gradient-to-br from-indigo-500 to-purple-600">
                <img
                  src={viewingPhoto.photo}
                  alt={viewingPhoto.costume}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal com padding para o botão fixo */}
      <div className="pb-32">
        <div className="max-w-md mx-auto px-4 pt-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎭</div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Concurso de Fantasias
            </h1>
            <p className="text-white/80 text-base">
              Vote na melhor fantasia do Carnaval 2026! 🎊
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mb-4"></div>
              <p className="text-white/80 text-lg">Carregando fantasias...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && candidates.length === 0 && !errorMessage && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">🎭</div>
              <p className="text-white/80 text-lg">Nenhuma fantasia cadastrada ainda.</p>
            </div>
          )}

          {/* Lista de Candidatos - Mobile First */}
          {!isLoading && candidates.length > 0 && (
            <div className="flex flex-col gap-3 mb-6">
              {candidates.map((candidate) => {
                const isSelected = selectedCandidate?.id === candidate.id;

                return (
                  <div
                    key={candidate.id}
                    onClick={() => !hasVoted && setSelectedCandidate(candidate)}
                    className={`
                      bg-white rounded-3xl shadow-xl overflow-hidden
                      transform transition-all duration-200
                      active:scale-98
                      ${isSelected ? 'ring-4 ring-yellow-400 shadow-2xl' : ''}
                      ${hasVoted ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex gap-4 p-4">
                      {/* Foto vertical estilo celular */}
                      <div className="relative shrink-0">
                        <div className="w-20 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                          <img
                            src={candidate.photo}
                            alt={candidate.costume}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Botão para visualizar foto */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingPhoto(candidate);
                          }}
                          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
                        >
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </button>
                        
                        {isSelected && !hasVoted && (
                          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1.5 shadow-lg animate-bounce">
                            <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Informações da fantasia */}
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎭</span>
                          <h3 className="text-lg font-bold text-indigo-600 leading-tight">
                            {candidate.costume}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Botão de Votação - FIXO NO BOTTOM */}
      {!hasVoted && !isLoading && candidates.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#1e1e77] via-[#1e1e77]/95 to-transparent pt-6 pb-6 px-4">
          <div className="max-w-md mx-auto">
            {selectedCandidate && (
              <div className="mb-3 text-center">
                <p className="text-white/90 text-sm font-medium">
                  Você selecionou: <span className="text-yellow-300 font-bold">{selectedCandidate.costume}</span>
                </p>
              </div>
            )}
            <button
              onClick={handleVote}
              disabled={!selectedCandidate || isVoting}
              className={`
                w-full px-8 py-4 rounded-2xl font-bold text-base
                transform transition-all duration-200
                active:scale-95
                ${selectedCandidate && !isVoting
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-xl hover:shadow-2xl'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                }
              `}
            >
              {isVoting 
                ? '⏳ Registrando voto...' 
                : selectedCandidate 
                  ? `🎉 Votar em ${selectedCandidate.costume}` 
                  : '🎭 Selecione uma fantasia'
              }
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        @keyframes confettiFall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: confettiFall 3s linear forwards;
        }
      `}</style>
    </div>
  );
};