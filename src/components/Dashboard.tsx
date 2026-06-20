import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Coins, 
  Sparkles, 
  ChevronRight, 
  HelpCircle, 
  Target, 
  ArrowRightLeft, 
  Percent, 
  ShieldAlert, 
  Building
} from 'lucide-react';
import { UserProfile, CURRENCIES, CurrencyType } from '../types';
import { ThemePalette } from '../theme';
import { formatCurrency } from '../utils';

interface DashboardProps {
  profile: UserProfile;
  palette: ThemePalette;
  onChangeTab: (tab: 'home' | 'simulator' | 'extras' | 'profile') => void;
  onSelectExtraCalculator: (calcId: string) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  savedSimulationsCount: number;
}

export default function Dashboard({
  profile,
  palette,
  onChangeTab,
  onSelectExtraCalculator,
  onUpdateProfile,
  savedSimulationsCount,
}: DashboardProps) {
  const activeCurrency = CURRENCIES[profile.currency];

  const financialQuotes = [
    { text: "Os juros compostos são a oitava maravilha do mundo. Quem entende, ganha; quem não entende, paga.", author: "Albert Einstein" },
    { text: "Não economize o que resta depois de gastar; gaste o que resta depois de economizar.", author: "Warren Buffett" },
    { text: "Investir em conhecimento rende sempre os melhores juros.", author: "Benjamin Franklin" },
    { text: "O tempo é o amigo do negócio excelente, o inimigo do medíocre.", author: "Warren Buffett" }
  ];

  // Pick quote based on date/hour
  const quoteIndex = new Date().getHours() % financialQuotes.length;
  const quote = financialQuotes[quoteIndex];

  const quickCalculators = [
    {
      id: 'simple',
      title: 'Juros Simples',
      description: 'Retornos lineares e cálculos diretos para empréstimos rápidos ou investimentos simples.',
      icon: Percent,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'meta',
      title: 'Meta Financeira',
      description: 'Descubra quanto precisa poupar por mês para atingir o seu primeiro milhão ou objetivos personalizados.',
      icon: Target,
      color: 'from-amber-400 to-orange-500',
    },
    {
      id: 'inflation',
      title: 'Perda por Inflação',
      description: 'Entenda como a inflação corrói o seu poder de compra se o seu dinheiro ficar guardado sob o colchão.',
      icon: ShieldAlert,
      color: 'from-red-500 to-pink-600',
    },
    {
      id: 'loan',
      title: 'Simulador de Empréstimos',
      description: 'Calcule as parcelas mensais, juros totais cobrados e o valor final pago de financiamentos.',
      icon: Building,
      color: 'from-violet-500 to-purple-600',
    },
    {
      id: 'converter',
      title: 'Conversor de Taxas',
      description: 'Converta taxas de juros anuais para mensais e vice-versa usando fórmulas financeiras precisas.',
      icon: ArrowRightLeft,
      color: 'from-emerald-500 to-teal-600',
    }
  ];

  // Quick Currency List helper
  const handleCurrencyChange = (currCode: CurrencyType) => {
    onUpdateProfile({ currency: currCode });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow} relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <TrendingUp className="h-40 w-40" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-md ${palette.accentLight} border ${palette.accentBorder} flex items-center gap-1.5`}>
              <Sparkles className="h-3 w-3 text-yellow-500" />
              PLANEJADOR INTELIGENTE
            </span>
          </div>

          <div className="space-y-1">
            <h1 className={`text-3xl font-black tracking-tight ${palette.textPrimary}`}>
              Olá, <span className="text-yellow-500">{profile.name || 'Investidor'}</span>!
            </h1>
            <p className={`text-sm ${palette.textSecondary}`}>
              Bem-vindo ao <span className="font-bold">JuroMax</span>. Pronto para simular a sua independência financeira hoje?
            </p>
          </div>

          {/* Quick Currency Selector on Home */}
          <div className={`p-4 rounded-2xl ${palette.inputBg} border ${palette.border} grid grid-cols-2 md:grid-cols-4 gap-2 items-center`}>
            <div className="col-span-2 md:col-span-1">
              <span className={`text-xs font-bold uppercase tracking-wider block ${palette.textMuted}`}>
                Moeda Ativa
              </span>
              <span className={`text-sm font-semibold ${palette.textSecondary}`}>
                {activeCurrency.name}
              </span>
            </div>
            
            <div className="col-span-2 md:col-span-3 flex flex-wrap gap-1.5 justify-end">
              {(Object.keys(CURRENCIES) as CurrencyType[]).map((cCode) => (
                <button
                  key={cCode}
                  id={`btn-currency-${cCode}`}
                  onClick={() => handleCurrencyChange(cCode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    profile.currency === cCode
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold scale-102 border border-amber-400'
                      : `${palette.card} border ${palette.border} ${palette.textMuted} hover:text-white`
                  }`}
                >
                  {cCode} ({CURRENCIES[cCode].symbol})
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Call To Action: Compound Interest Simulator */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => onChangeTab('simulator')}
        className="group relative cursor-pointer p-6 rounded-3xl bg-gradient-to-tr from-indigo-950 via-[#1C2541] to-[#0A192F] text-white overflow-hidden shadow-xl border border-blue-900/40 hover:scale-[1.01] transition-transform duration-200"
      >
        <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 p-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
          <Coins className="h-44 w-44 text-yellow-500" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-black tracking-widest font-mono bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/30">
              DESTAQUE PRINCIPAL
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-yellow-500">
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight">Simulador de Juros Compostos</h2>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              Descubra o incrível efeito bola de neve no seu dinheiro! Projete rendimentos com base no seu valor inicial, aporte mensal, período de tempo e taxas planejadas.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-bold text-yellow-500/90 pt-1">
            <span className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-lg">
              📊 Gráfico Interativo
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-lg">
              📅 Tabela de Evolução
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-lg">
              📉 Cenários Negativos
            </span>
          </div>
        </div>
      </motion.div>

      {/* Grid of Quick Calculators */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-extrabold tracking-tight ${palette.textPrimary}`}>
            Calculadoras Financeiras Extra
          </h3>
          <span className={`text-[11px] font-mono font-bold ${palette.textMuted}`}>
            {quickCalculators.length} MÓDULOS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickCalculators.map((calc, idx) => {
            const Icon = calc.icon;
            return (
              <motion.div
                key={calc.id}
                id={`card-quick-calc-${calc.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                onClick={() => {
                  onSelectExtraCalculator(calc.id);
                  onChangeTab('extras');
                }}
                className={`p-5 rounded-2xl ${palette.card} border ${palette.border} ${palette.shadow} hover:scale-[1.01] cursor-pointer transition-all duration-200 group flex items-start space-x-4`}
              >
                <div className={`p-3 rounded-xl bg-gradient-to-tr ${calc.color} text-white flex items-center justify-center shrink-0`}>
                  <Icon className="h-5 w-5 stroke-[2.2]" />
                </div>
                
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-extrabold tracking-tight ${palette.textPrimary} group-hover:text-yellow-500 transition-colors`}>
                      {calc.title}
                    </h4>
                    <ChevronRight className={`h-3.5 w-3.5 ${palette.textMuted} group-hover:translate-x-1 group-hover:text-yellow-500 transition-all`} />
                  </div>
                  <p className={`text-xs ${palette.textSecondary} leading-relaxed font-medium line-clamp-2`}>
                    {calc.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Smart Quote & Dashboard stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`p-5 rounded-2xl bg-gradient-to-br ${palette.gradientBg} border ${palette.border} relative overflow-hidden`}
      >
        <div className="absolute top-0 left-0 p-3 opacity-5 pointer-events-none">
          <HelpCircle className="h-20 w-20" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-yellow-500">
            <span>INSIGHT FINANCEIRO DO DIA</span>
            <span>JuroMax</span>
          </div>
          <p className={`text-sm italic font-medium leading-relaxed ${palette.textSecondary}`}>
            "{quote.text}"
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className={`text-[11px] font-bold ${palette.textPrimary}`}>
              — {quote.author}
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-yellow-500`}>
              {savedSimulationsCount} simulações salvas no histórico
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
