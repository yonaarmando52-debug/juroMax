import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Trash2, 
  Coins, 
  Moon, 
  Sun, 
  Layers, 
  FileCheck, 
  Check, 
  History, 
  ArrowRight, 
  AlertCircle,
  FileSpreadsheet,
  FileUp,
  Bookmark,
  Sparkles,
  RefreshCw,
  Home
} from 'lucide-react';
import { UserProfile, CURRENCIES, CurrencyType, ThemeMode, ThemeScheme, SimulationHistory } from '../types';
import { ThemePalette } from '../theme';
import { formatCurrency } from '../utils';

interface ProfileProps {
  profile: UserProfile;
  palette: ThemePalette;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  savedSimulations: SimulationHistory[];
  onLoadSimulation: (sim: SimulationHistory) => void;
  onDeleteSimulation: (id: string) => void;
  onClearHistory: () => void;
}

export default function Profile({
  profile,
  palette,
  onUpdateProfile,
  savedSimulations,
  onLoadSimulation,
  onDeleteSimulation,
  onClearHistory,
}: ProfileProps) {
  // Local edit states
  const [tempName, setTempName] = useState(profile.name);
  const [tempEmail, setTempEmail] = useState(profile.email);
  const [showStatusMessage, setShowStatusMessage] = useState(false);

  const handleSaveProfileData = () => {
    onUpdateProfile({ 
      name: tempName, 
      email: tempEmail 
    });
    setShowStatusMessage(true);
    setTimeout(() => setShowStatusMessage(false), 2500);
  };

  const upcomingFeatures = [
    { title: 'Exportar Simulação em PDF', desc: 'Gere relatórios personalizados e gráficos elegantes de evolução prontos a imprimir.', icon: FileUp },
    { title: 'Exportar Planilha Excel', desc: 'Exporte a tabela de evolução detalhada em formato XLSX para editar onde preferir.', icon: FileSpreadsheet },
    { title: 'Simulador de Aposentadoria', desc: 'Calcule quanto você precisa acumular de patrimônio para viver exclusivamente de renda passiva.', icon: Bookmark },
    { title: 'Simulador de Compra de Casa', desc: 'Compare aluguel vs financiamento imobiliário e planeje a entrada de forma sustentável.', icon: Home },
    { title: 'Planejamento Financeiro Integrado', desc: 'Estabeleça orçamentos mensais divididos nas categorias de despesas de forma intuitiva.', icon: Sparkles }
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* User Information & Editing */}
      <div className={`p-6 rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow} space-y-5 transition-all duration-300`}>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
            <User className="h-5 w-5" />
          </div>
          <h3 className={`text-base font-extrabold ${palette.textPrimary}`}>
            Meus Dados e Preferências
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-900 font-extrabold text-2xl shadow-md border-2 border-yellow-300/40 select-none">
            {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'JM'}
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h4 className={`text-lg font-extrabold ${palette.textPrimary}`}>
              {profile.name || 'Usuário JuroMax'}
            </h4>
            <p className={`text-xs ${palette.textMuted}`}>
              {profile.email || 'planejador@juromax.com'}
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-slate-700/15">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Nome Completo</span>
              <input
                id="profile-input-name"
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Insira seu nome"
                className={`w-full px-4 py-2.5 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-xs font-bold focus:outline-none focus:ring-1 focus:ring-yellow-500`}
              />
            </div>

            <div className="space-y-2">
              <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>E-mail de Contato</span>
              <input
                id="profile-input-email"
                type="email"
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                placeholder="Insira seu e-mail"
                className={`w-full px-4 py-2.5 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-xs font-bold focus:outline-none focus:ring-1 focus:ring-yellow-500`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-emerald-500 font-bold">
              {showStatusMessage && "✓ Atualizado localmente com sucesso!"}
            </span>
            <button
              id="profile-btn-save"
              onClick={handleSaveProfileData}
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md active:scale-98 transition-all"
            >
              Salvar Dados
            </button>
          </div>
        </div>
      </div>

      {/* Visual Identity Selection */}
      <div className={`p-6 rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow} space-y-4`}>
        <div className="flex items-center space-x-2.5">
          <Layers className="h-5 w-5 text-yellow-500" />
          <h3 className={`text-base font-extrabold ${palette.textPrimary}`}>
            Visual do Aplicativo
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Theme mode selection */}
          <div className="space-y-2">
            <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Modo de Luz</span>
            <div className={`p-1 rounded-xl bg-slate-800/20 border border-slate-700/15 grid grid-cols-2 gap-1`}>
              <button
                id="btn-theme-light"
                onClick={() => onUpdateProfile({ themeMode: 'light' })}
                className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  profile.themeMode === 'light'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                    : `text-slate-400 hover:text-white`
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Claro</span>
              </button>
              <button
                id="btn-theme-dark"
                onClick={() => onUpdateProfile({ themeMode: 'dark' })}
                className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  profile.themeMode === 'dark'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                    : `text-slate-400 hover:text-white`
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Escuro</span>
              </button>
            </div>
          </div>

          {/* Color Schemes selection */}
          <div className="space-y-2">
            <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Paleta de Cores</span>
            <div className={`p-1 rounded-xl bg-slate-800/20 border border-slate-700/15 grid grid-cols-2 gap-1`}>
              <button
                id="btn-scheme-gold"
                onClick={() => onUpdateProfile({ themeScheme: 'gold' })}
                className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  profile.themeScheme === 'gold'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                    : `text-slate-400 hover:text-white`
                }`}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <span>Ouro Real (Azul)</span>
              </button>
              <button
                id="btn-scheme-green"
                onClick={() => onUpdateProfile({ themeScheme: 'green' })}
                className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  profile.themeScheme === 'green'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-extrabold'
                    : `text-slate-400 hover:text-white`
                }`}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Verde Money</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History of Simulations */}
      <div className={`p-6 rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow} space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <History className="h-5 w-5 text-yellow-500" />
            <h3 className={`text-base font-extrabold ${palette.textPrimary}`}>
              Histórico de Simulações
            </h3>
          </div>
          {savedSimulations.length > 0 && (
            <button
              id="profile-btn-clear-history"
              onClick={onClearHistory}
              className="text-[10px] font-bold text-red-500 hover:underline flex items-center space-x-1"
            >
              <Trash2 className="h-3 w-3" />
              <span>Limpar Tudo</span>
            </button>
          )}
        </div>

        {savedSimulations.length === 0 ? (
          <div className="text-center py-8 space-y-2 border-2 border-dashed border-slate-700/20 rounded-2xl">
            <Bookmark className="h-8 w-8 text-slate-500 mx-auto opacity-35" />
            <p className={`text-xs ${palette.textSecondary} max-w-xs mx-auto leading-relaxed`}>
              Nenhuma simulação no histórico ainda. Salve seus cálculos no botão "Salvar" das calculadoras!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
            <AnimatePresence>
              {savedSimulations.map((sim) => {
                let badgeColor = 'bg-indigo-500/10 text-indigo-400';
                if (sim.type === 'compound') badgeColor = 'bg-yellow-500/10 text-yellow-500';
                if (sim.type === 'simple') badgeColor = 'bg-blue-500/10 text-blue-400';
                if (sim.type === 'meta') badgeColor = 'bg-amber-500/15 text-amber-500';
                if (sim.type === 'inflation') badgeColor = 'bg-red-500/10 text-red-400';
                if (sim.type === 'loan') badgeColor = 'bg-violet-500/10 text-violet-400';

                return (
                  <motion.div
                    key={sim.id}
                    id={`history-sim-item-${sim.id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-3.5 rounded-xl ${palette.inputBg} border ${palette.border} flex items-center justify-between space-x-3 hover:border-slate-500/20 transition-all`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${badgeColor} font-mono shrink-0`}>
                          {sim.type}
                        </span>
                        <span className={`text-[10px] font-mono ${palette.textMuted} truncate`}>
                          {sim.date}
                        </span>
                      </div>
                      <p className={`text-xs font-black truncate leading-tight ${palette.textPrimary}`}>
                        {sim.title}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        id={`btn-load-sim-${sim.id}`}
                        onClick={() => onLoadSimulation(sim)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold bg-amber-500/10 text-yellow-500 border border-amber-500/20 hover:bg-yellow-500 hover:text-slate-950 transition-all flex items-center space-x-1 shrink-0`}
                      >
                        <span>Carregar</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>

                      <button
                        id={`btn-delete-sim-${sim.id}`}
                        onClick={() => onDeleteSimulation(sim.id)}
                        className={`p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Future Roadmap / Preparações de Estrutura */}
      <div className={`p-6 rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow} space-y-4`}>
        <div className="flex items-center space-x-2.5">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <h3 className={`text-base font-extrabold ${palette.textPrimary}`}>
            Funcionalidades e Recursos Futuros
          </h3>
        </div>

        <p className={`text-xs ${palette.textSecondary} leading-relaxed`}>
          A infraestrutura do JuroMax está sendo equipada para o suporte aos seguintes módulos de gestão avançada na próxima atualização.
        </p>

        <div className="space-y-3.5 pt-2">
          {upcomingFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className={`p-4 rounded-2xl ${palette.inputBg} border ${palette.border} flex items-start space-x-3.5 relative overflow-hidden`}
              >
                <div className="p-2.5 rounded-xl bg-slate-700/15 text-slate-400 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-extrabold tracking-tight ${palette.textPrimary}`}>
                      {feat.title}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider bg-slate-800/60 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded font-mono">
                      EM BREVE
                    </span>
                  </div>
                  <p className={`text-xs ${palette.textMuted} leading-relaxed font-semibold`}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
