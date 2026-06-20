import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  X, 
  HelpCircle, 
  Coins, 
  Check, 
  GraduationCap 
} from 'lucide-react';

import Header from './components/Header';
import BottomNav, { TabID } from './components/BottomNav';
import Dashboard from './components/Dashboard';
import CompoundCalc from './components/CompoundCalc';
import ExtraCalcs from './components/ExtraCalcs';
import Profile from './components/Profile';

import { UserProfile, SimulationHistory } from './types';
import { getThemePalette } from './theme';

export default function App() {
  // 1. STATE & PERSISTENCE LOADERS
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('juromax_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return {
      name: 'Yona Armando',
      email: 'yonaarmando52@gmail.com',
      currency: 'AOA',
      themeMode: 'dark',
      themeScheme: 'gold', 
    };
  });

  const [savedSimulations, setSavedSimulations] = useState<SimulationHistory[]>(() => {
    try {
      const saved = localStorage.getItem('juromax_simulations');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return [];
  });

  const [currentTab, setCurrentTab] = useState<TabID>('home');
  const [activeExtraTab, setActiveExtraTab] = useState<string>('simple');
  const [simulationToLoad, setSimulationToLoad] = useState<SimulationHistory | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // 2. SAVING STATES TO LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem('juromax_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('juromax_simulations', JSON.stringify(savedSimulations));
  }, [savedSimulations]);

  // Apply theme attributes to document class for light/dark body controls
  useEffect(() => {
    const root = document.documentElement;
    if (profile.themeMode === 'light') {
      root.classList.remove('dark');
      root.style.backgroundColor = '#F4F6FA';
    } else {
      root.classList.add('dark');
      root.style.backgroundColor = profile.themeScheme === 'gold' ? '#0B132B' : '#09090B';
    }
  }, [profile.themeMode, profile.themeScheme]);

  // Fetch color palette from theme system
  const palette = getThemePalette(profile.themeMode, profile.themeScheme);

  // 3. ACTION WORKERS
  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const handleSaveSimulation = (sim: Omit<SimulationHistory, 'id' | 'date'>) => {
    const newSim: SimulationHistory = {
      ...sim,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    setSavedSimulations(prev => [newSim, ...prev].slice(0, 20)); // Keep max 20
  };

  const handleLoadSimulation = (sim: SimulationHistory) => {
    setSimulationToLoad(sim);
    // Navigate user to the respective page
    if (sim.type === 'compound') {
      setCurrentTab('simulator');
    } else {
      setActiveExtraTab(sim.type === 'loan' ? 'loan' : sim.type);
      setCurrentTab('extras');
    }
  };

  const handleDeleteSimulation = (id: string) => {
    setSavedSimulations(prev => prev.filter(s => s.id !== id));
  };

  const handleClearHistory = () => {
    if (window.confirm('Deseja realmente limpar todo o seu histórico de simulações do JuroMax?')) {
      setSavedSimulations([]);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 pb-16 ${palette.bg}`}>
      {/* Premium Header */}
      <Header
        profile={profile}
        palette={palette}
        onNavigateToProfile={() => setCurrentTab('profile')}
        openSettingsModal={() => setIsSettingsOpen(true)}
      />

      {/* Main Responsive Sandbox Area */}
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-24 md:px-0">
        <AnimatePresence mode="wait">
          {currentTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <Dashboard
                profile={profile}
                palette={palette}
                onChangeTab={setCurrentTab}
                onSelectExtraCalculator={setActiveExtraTab}
                onUpdateProfile={handleUpdateProfile}
                savedSimulationsCount={savedSimulations.length}
              />
            </motion.div>
          )}

          {currentTab === 'simulator' && (
            <motion.div
              key="simulator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <CompoundCalc
                profile={profile}
                palette={palette}
                onSaveSimulation={handleSaveSimulation}
                simulationToLoad={simulationToLoad}
                onClearLoadedSimulation={() => setSimulationToLoad(null)}
              />
            </motion.div>
          )}

          {currentTab === 'extras' && (
            <motion.div
              key="extras"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <ExtraCalcs
                profile={profile}
                palette={palette}
                activeExtraTab={activeExtraTab}
                onSelectExtraTab={setActiveExtraTab}
                onSaveSimulation={handleSaveSimulation}
                simulationToLoad={simulationToLoad}
                onClearLoadedSimulation={() => setSimulationToLoad(null)}
              />
            </motion.div>
          )}

          {currentTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <Profile
                profile={profile}
                palette={palette}
                onUpdateProfile={handleUpdateProfile}
                savedSimulations={savedSimulations}
                onLoadSimulation={handleLoadSimulation}
                onDeleteSimulation={handleDeleteSimulation}
                onClearHistory={handleClearHistory}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Navigator for smart devices */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        palette={palette}
      />

      {/* Settings / Formulas Modal Overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className={`w-full max-w-lg rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow} overflow-hidden max-h-[85vh] flex flex-col`}
            >
              {/* Modal Header */}
              <div className={`p-5 border-b ${palette.border} flex items-center justify-between`}>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-yellow-500" />
                  <span className={`text-base font-extrabold ${palette.textPrimary}`}>
                    Manual do Estudante e Fórmulas
                  </span>
                </div>
                <button
                  id="btn-close-settings-modal"
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-700/20 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Scrollable Contents */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed font-semibold">
                {/* Introduction */}
                <div className="space-y-2">
                  <h4 className={`text-sm font-bold flex items-center gap-1.5 ${palette.textPrimary}`}>
                    <BookOpen className="h-4 w-4 text-yellow-500" />
                    O que são Juros Compostos?
                  </h4>
                  <p className={palette.textSecondary}>
                    Diferente dos juros simples que incidem unicamente sobre o valor inicial, os juros compostos calculam o rendimento sobre o valor acumulado anterior (juros sobre juros). É o verdadeiro dínamo do crescimento patrimonial de longo prazo.
                  </p>
                </div>

                {/* Equation 1: Compound Interest */}
                <div className={`p-4 rounded-xl ${palette.inputBg} border ${palette.border} space-y-2`}>
                  <p className="font-extrabold text-yellow-500">PROJEÇÃO DE JUROS COMPOSTOS</p>
                  <p className={`font-mono text-xs ${palette.textPrimary} bg-slate-900/40 p-2 rounded text-center my-1 select-all font-bold`}>
                    M = P * (1 + i)^n
                  </p>
                  <ul className={`space-y-1 text-[11px] list-disc list-inside ${palette.textSecondary}`}>
                    <li><span className="font-mono font-bold text-white">M</span>: Patrimônio Final Acumulado</li>
                    <li><span className="font-mono font-bold text-white">P</span>: Valor Inicial Aplicado</li>
                    <li><span className="font-mono font-bold text-white">i</span>: taxa de juros (formato decimal)</li>
                    <li><span className="font-mono font-bold text-white">n</span>: número de períodos decorridos</li>
                  </ul>
                </div>

                {/* Equation 2: Simple interest */}
                <div className={`p-4 rounded-xl ${palette.inputBg} border ${palette.border} space-y-2`}>
                  <p className="font-extrabold text-blue-400">PROJEÇÃO DE JUROS SIMPLES</p>
                  <p className={`font-mono text-xs ${palette.textPrimary} bg-slate-900/40 p-2 rounded text-center my-1 select-all font-bold`}>
                    J = P * r * t
                  </p>
                  <ul className={`space-y-1 text-[11px] list-disc list-inside ${palette.textSecondary}`}>
                    <li><span className="font-mono font-bold text-white">J</span>: Juros Totais Obtidos</li>
                    <li><span className="font-mono font-bold text-white">P</span>: Principal (Valor Inicial)</li>
                    <li><span className="font-mono font-bold text-white">r</span>: taxa periódica nominal</li>
                    <li><span className="font-mono font-bold text-white">t</span>: número total de períodos</li>
                  </ul>
                </div>

                {/* Equation 3: Inflation */}
                <div className={`p-4 rounded-xl ${palette.inputBg} border ${palette.border} space-y-2`}>
                  <p className="font-extrabold text-red-400">PODER DE COMPRA REAL (INFLAÇÃO)</p>
                  <p className={`font-mono text-xs ${palette.textPrimary} bg-slate-900/40 p-2 rounded text-center my-1 select-all font-bold`}>
                    Valor Real = Valor Nominal / (1 + inf)^n
                  </p>
                  <p className={palette.textSecondary}>
                    Demonstra a corrosão sofrida pelo seu dinheiro de forma exponencial sob a inflação média periódica do país ou cenário internacional.
                  </p>
                </div>

                {/* Project Specs */}
                <div className="pt-2 border-t border-slate-700/15 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>JuroMax Versão 1.1</span>
                  <span>Angola & Brasil (Lusófono)</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className={`p-4 border-t ${palette.border} flex justify-end ${palette.cardHeader}`}>
                <button
                  id="btn-confirm-settings"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 transition-colors"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
