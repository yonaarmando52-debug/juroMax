import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  Table, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Save, 
  Check,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { UserProfile, CURRENCIES, EvolutionRow, SimulationHistory } from '../types';
import { ThemePalette } from '../theme';
import { formatCurrency, calculateCompoundInterest } from '../utils';

interface CompoundCalcProps {
  profile: UserProfile;
  palette: ThemePalette;
  onSaveSimulation: (sim: Omit<SimulationHistory, 'id' | 'date'>) => void;
  simulationToLoad: SimulationHistory | null;
  onClearLoadedSimulation: () => void;
}

export default function CompoundCalc({ 
  profile, 
  palette, 
  onSaveSimulation,
  simulationToLoad,
  onClearLoadedSimulation
}: CompoundCalcProps) {
  // Input states
  const [initialValue, setInitialValue] = useState<string>('10000');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('500');
  const [interestRate, setInterestRate] = useState<string>('10');
  const [rateType, setRateType] = useState<'monthly' | 'yearly'>('yearly');
  const [periodValue, setPeriodValue] = useState<string>('10');
  const [periodType, setPeriodType] = useState<'months' | 'years'>('years');
  const [inflationRate, setInflationRate] = useState<string>('4.5');
  const [applyInflation, setApplyInflation] = useState<boolean>(false);

  // Result state
  const [results, setResults] = useState<{
    totalInvested: number;
    totalInterest: number;
    finalBalance: number;
    evolution: EvolutionRow[];
  } | null>(null);

  // Pagination for table
  const [currentPage, setCurrentPage] = useState<number>(0);
  const rowsPerPage = 12;

  // Notification state
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);

  // Validate inputs
  const isValid = 
    !isNaN(Number(initialValue)) && Number(initialValue) >= 0 &&
    !isNaN(Number(monthlyContribution)) && Number(monthlyContribution) >= 0 &&
    !isNaN(Number(interestRate)) && 
    !isNaN(Number(periodValue)) && Number(periodValue) > 0;

  // Perform initial calculation on load
  useEffect(() => {
    handleCalculate();
  }, [profile.currency]); // Re-calculate if primary currency changes

  // Handle simulation loading from profile history
  useEffect(() => {
    if (simulationToLoad && simulationToLoad.type === 'compound') {
      const { inputs } = simulationToLoad;
      if (inputs) {
        const initVal = String(inputs.initialValue ?? '10000');
        const monthlyContrib = String(inputs.monthlyContribution ?? '500');
        const rate = String(inputs.interestRate ?? '10');
        const rType = inputs.rateType ?? 'yearly';
        const pVal = String(inputs.periodValue ?? '10');
        const pType = inputs.periodType ?? 'years';
        const hasInflation = inputs.inflationRate !== undefined && inputs.inflationRate !== 0;
        const infRate = String(inputs.inflationRate ?? '4.5');

        setInitialValue(initVal);
        setMonthlyContribution(monthlyContrib);
        setInterestRate(rate);
        setRateType(rType);
        setPeriodValue(pVal);
        setPeriodType(pType);
        setApplyInflation(hasInflation);
        setInflationRate(infRate);

        // Calculate immediately to guarantee fresh visual state
        const compResults = calculateCompoundInterest(
          Number(initVal) || 0,
          Number(monthlyContrib) || 0,
          Number(rate) || 0,
          rType,
          Number(pVal) || 1,
          pType,
          hasInflation ? Number(infRate) || 0 : 0
        );
        setResults(compResults);
        setCurrentPage(0);
      }
      onClearLoadedSimulation();
    }
  }, [simulationToLoad, onClearLoadedSimulation]);

  const handleCalculate = () => {
    if (!isValid) return;

    const init = Number(initialValue) || 0;
    const contribution = Number(monthlyContribution) || 0;
    const rate = Number(interestRate);
    const period = Number(periodValue) || 1;
    const infRate = applyInflation ? Number(inflationRate) || 0 : 0;

    const compResults = calculateCompoundInterest(
      init,
      contribution,
      rate,
      rateType,
      period,
      periodType,
      infRate
    );

    setResults(compResults);
    setCurrentPage(0); // Reset page on recalculate
  };

  const handleClear = () => {
    setInitialValue('');
    setMonthlyContribution('');
    setInterestRate('');
    setPeriodValue('');
    setApplyInflation(false);
    setInflationRate('4.5');
    setResults(null);
  };

  const handleSave = () => {
    if (!results) return;
    onSaveSimulation({
      type: 'compound',
      title: `Simulação de Juros Compostos - ${formatCurrency(results.finalBalance, profile.currency)}`,
      inputs: {
        initialValue: Number(initialValue) || 0,
        monthlyContribution: Number(monthlyContribution) || 0,
        interestRate: Number(interestRate) || 0,
        rateType,
        periodValue: Number(periodValue) || 1,
        periodType,
        inflationRate: applyInflation ? Number(inflationRate) || 0 : 0,
      },
      results: {
        totalInvested: results.totalInvested,
        totalInterest: results.totalInterest,
        finalBalance: results.finalBalance,
      }
    });

    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
    }, 2500);
  };

  // Prepare chart data: For long durations (e.g., 30 years -> 360 months),
  // showing every month is crowded. Let's sample or aggregate yearly.
  const chartData = React.useMemo(() => {
    if (!results) return [];
    
    const raw = results.evolution;
    const totalPoints = raw.length;
    
    // Choose sampling frequency to keep chart neat (< 25 points)
    let step = 1;
    if (totalPoints > 24) {
      step = Math.ceil(totalPoints / 16);
    }

    const sampled = [];
    for (let i = 0; i < totalPoints; i += step) {
      sampled.push(raw[i]);
    }
    
    // Ensure last point is always included
    if ((totalPoints - 1) % step !== 0) {
      sampled.push(raw[totalPoints - 1]);
    }

    // Map keys for Recharts in Portuguese
    return sampled.map((row) => {
      const isYearlyPeriod = periodType === 'years';
      let label = '';
      if (isYearlyPeriod) {
        // e.g. if period matches exact years
        const y = Math.floor(row.period / 12);
        const m = row.period % 12;
        label = m === 0 ? `Ano ${y}` : `Mês ${row.period}`;
      } else {
        label = `Mês ${row.period}`;
      }

      const totalInterests = Math.max(0, row.interest);
      
      return {
        label,
        'Capital Investido': row.invested,
        'Juros Compostos': totalInterests,
        'Patrimônio Total': row.total,
        'Poder de Compra Real': row.realWealth || row.total,
        'Perda por Inflação': row.lossPurchasingPower || 0,
      };
    });
  }, [results, periodType]);

  // Pagination for evolution table
  const paginatedRows = React.useMemo(() => {
    if (!results) return [];
    const start = currentPage * rowsPerPage;
    return results.evolution.slice(start, start + rowsPerPage);
  }, [results, currentPage]);

  const totalPages = results ? Math.ceil(results.evolution.length / rowsPerPage) : 0;

  // Custom formats for currency rendering in table
  const renderMoney = (val: number) => formatCurrency(val, profile.currency);

  const isGrowthNegative = Number(interestRate) < 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Simulation Form Card */}
      <div className={`p-6 rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow} relative overflow-hidden transition-all duration-300`}>
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
            <Calculator className="h-5 w-5" />
          </div>
          <h2 className={`text-lg font-extrabold tracking-tight ${palette.textPrimary}`}>
            Simular Juros Compostos
          </h2>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Valor Inicial */}
          <div className="space-y-2">
            <label className={`text-xs font-bold tracking-wide uppercase flex items-center justify-between ${palette.textSecondary}`}>
              <span>Valor Inicial</span>
              <span className="text-yellow-500 font-mono">({CURRENCIES[profile.currency].symbol})</span>
            </label>
            <div className="relative">
              <input
                id="input-initial-value"
                type="number"
                value={initialValue}
                onChange={(e) => setInitialValue(e.target.value)}
                placeholder="Ex. 10.000"
                className={`w-full px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold focus:outline-none focus:ring-1 focus:ring-yellow-500`}
              />
            </div>
          </div>

          {/* Investimento Mensal */}
          <div className="space-y-2">
            <label className={`text-xs font-bold tracking-wide uppercase flex items-center justify-between ${palette.textSecondary}`}>
              <span>Investimento Mensal (Aporte)</span>
              <span className="text-yellow-500/80 font-mono">({CURRENCIES[profile.currency].symbol})</span>
            </label>
            <input
              id="input-monthly-contribution"
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              placeholder="Ex. 500 (Opcional)"
              className={`w-full px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold focus:outline-none focus:ring-1 focus:ring-yellow-500`}
            />
          </div>

          {/* Taxa de Juros */}
          <div className="space-y-2">
            <label className={`text-xs font-bold tracking-wide uppercase flex items-center justify-between ${palette.textSecondary}`}>
              <span>Taxa de Juros (%)</span>
              <span className="text-slate-400 font-mono italic">Negativo simula queda</span>
            </label>
            <div className="flex space-x-2">
              <input
                id="input-interest-rate"
                type="number"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="Ex. 10"
                className={`flex-1 px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold focus:outline-none focus:ring-1 focus:ring-yellow-500`}
              />
              <select
                id="select-rate-type"
                value={rateType}
                onChange={(e) => setRateType(e.target.value as 'monthly' | 'yearly')}
                className={`px-3 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-xs font-bold focus:outline-none`}
              >
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

          {/* Período */}
          <div className="space-y-2">
            <label className={`text-xs font-bold tracking-wide uppercase flex items-center justify-between ${palette.textSecondary}`}>
              <span>Período de Tempo</span>
              <span className="text-xs font-mono font-bold">Resolução</span>
            </label>
            <div className="flex space-x-2">
              <input
                id="input-period-value"
                type="number"
                value={periodValue}
                onChange={(e) => setPeriodValue(e.target.value)}
                placeholder="Ex. 10"
                className={`flex-1 px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold focus:outline-none focus:ring-1 focus:ring-yellow-500`}
              />
              <select
                id="select-period-type"
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as 'months' | 'years')}
                className={`px-3 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-xs font-bold focus:outline-none`}
              >
                <option value="months">Meses</option>
                <option value="years">Anos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inflation Settings Toggle */}
        <div className={`p-4 rounded-2xl ${palette.inputBg} border ${palette.border} mb-6 space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-yellow-500" />
              <span className={`text-xs font-bold uppercase tracking-wider ${palette.textSecondary}`}>
                Ajustar pela Inflação (Poder de Compra Real)
              </span>
            </div>
            <input
              id="checkbox-apply-inflation"
              type="checkbox"
              checked={applyInflation}
              onChange={(e) => setApplyInflation(e.target.checked)}
              className="h-4.5 w-4.5 rounded text-amber-500 accent-amber-500"
            />
          </div>

          {applyInflation && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/30 items-center"
            >
              <div className="space-y-0.5">
                <span className={`text-[11px] font-semibold ${palette.textMuted}`}>
                  Taxa de Inflação Média Anual (%)
                </span>
                <p className="text-[10px] text-slate-400">
                  Desconta a desvalorização do dinheiro ao longo do tempo.
                </p>
              </div>
              <input
                id="input-inflation-rate"
                type="number"
                step="0.1"
                value={inflationRate}
                onChange={(e) => setInflationRate(e.target.value)}
                placeholder="Ex. 4.5"
                className={`px-4 py-2 rounded-lg border ${palette.border} ${palette.card} ${palette.inputText} text-xs font-bold focus:outline-none focus:ring-1 focus:ring-yellow-500 text-right`}
              />
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            id="btn-clear-compound"
            onClick={handleClear}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs border ${palette.border} ${palette.inputBg} ${palette.textSecondary} flex items-center justify-center space-x-2 hover:opacity-85 active:scale-98 transition-all`}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Limpar Campos</span>
          </button>
          
          <button
            id="btn-calculate-compound"
            onClick={handleCalculate}
            disabled={!isValid}
            className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs text-slate-950 bg-gradient-to-r from-yellow-500 to-amber-500 border border-yellow-400 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 active:scale-98 transition-all shadow-md shadow-amber-500/10`}
          >
            <Calculator className="h-4 w-4" />
            <span>Calcular Projeção</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-6"
          >
            {/* Growth or Loss warning alert */}
            {isGrowthNegative && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex gap-3 items-start">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <div className="text-xs space-y-1 font-medium leading-relaxed">
                  <p className="font-bold">Cenário com Rendimento Negativo Detectado</p>
                  <p className="text-slate-400">
                    Sua taxa de juros composta está negativa ({interestRate}%). O gráfico demonstrará retornos desfavoráveis e queda de patrimônio sob essa taxa de perda financeira recorrente.
                  </p>
                </div>
              </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Total Investido */}
              <div className={`p-5 rounded-2xl ${palette.card} border ${palette.border} ${palette.shadow} space-y-1.5`}>
                <span className={`text-[10px] font-black uppercase tracking-wider ${palette.textMuted}`}>
                  Total Investido
                </span>
                <h3 className={`text-xl font-black ${palette.textPrimary} tracking-tight`}>
                  {renderMoney(results.totalInvested)}
                </h3>
                <p className="text-[10px] font-medium text-slate-400">
                  Soma do valor inicial + aportes mensais
                </p>
              </div>

              {/* Card 2: Total Juros Obtidos */}
              <div className={`p-5 rounded-2xl ${palette.card} border ${palette.border} ${palette.shadow} space-y-1.5`}>
                <span className={`text-[10px] font-black uppercase tracking-wider ${palette.textMuted} flex items-center gap-1`}>
                  Juros Acumulados
                  {isGrowthNegative ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-yellow-500" />
                  )}
                </span>
                <h3 className={`text-xl font-black ${isGrowthNegative ? 'text-red-400' : 'text-yellow-500'} tracking-tight`}>
                  {isGrowthNegative ? '-' : '+'}{renderMoney(Math.abs(results.totalInterest))}
                </h3>
                <p className="text-[10px] font-medium text-slate-400">
                  Rendimento gerado {isGrowthNegative ? 'perdido' : 'de juros compostos'}
                </p>
              </div>

              {/* Card 3: Patrimônio Final */}
              <div className={`p-5 rounded-2xl ${palette.card} border ${palette.border} bg-gradient-to-br from-yellow-500/5 to-amber-500/10 ${palette.shadow} space-y-1.5`}>
                <span className="text-[10px] font-black uppercase tracking-wider text-yellow-500 flex items-center justify-between">
                  <span>Patrimônio Final</span>
                  <button 
                    id="btn-save-compound-simulation"
                    onClick={handleSave}
                    className="flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-bold bg-yellow-500/25 text-yellow-500 cursor-pointer border border-yellow-500/20 active:scale-95 transition-all"
                  >
                    {showSavedFeedback ? (
                      <>
                        <Check className="h-2.5 w-2.5" />
                        <span>Salvo!</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-2.5 w-2.5" />
                        <span>Salvar</span>
                      </>
                    )}
                  </button>
                </span>
                <h3 className={`text-2xl font-black ${palette.textPrimary} tracking-tight`}>
                  {renderMoney(results.finalBalance)}
                </h3>
                {applyInflation ? (
                  <p className="text-[10px] font-bold text-amber-500">
                    Poder de Compra Real: <span className="underline">{renderMoney(results.evolution[results.evolution.length-1].realWealth || 0)}</span>
                  </p>
                ) : (
                  <p className="text-[10px] font-medium text-slate-400">
                    Montante acumulado ao fim do período
                  </p>
                )}
              </div>
            </div>

            {/* Interactive Charts Area */}
            <div className={`p-6 rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow} space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-base font-extrabold tracking-tight ${palette.textPrimary}`}>
                    Gráfico de Crescimento {isGrowthNegative && 'ou Queda'}
                  </h3>
                  <p className={`text-[11px] ${palette.textMuted}`}>
                    Evolução do seu capital investido vs juros ao longo do tempo
                  </p>
                </div>
                {applyInflation && (
                  <span className="text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/25 text-yellow-500 px-2 py-0.5 rounded-full">
                    Ajustado pela inflação
                  </span>
                )}
              </div>

              {/* Chart Element */}
              <div className="h-72 w-full text-xs font-semibold">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorJuros" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isGrowthNegative ? "#EF4444" : "#EAB308"} stopOpacity={0.35}/>
                        <stop offset="95%" stopColor={isGrowthNegative ? "#EF4444" : "#EAB308"} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                    <XAxis 
                      dataKey="label" 
                      stroke="#94A3B8" 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#94A3B8" 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                        return value;
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0F172A', 
                        borderColor: '#2D3748', 
                        borderRadius: '12px', 
                        color: '#F8FAFC' 
                      }} 
                      formatter={(value: any) => [renderMoney(Number(value)), '']}
                    />
                    <Legend iconType="circle" />
                    
                    <Area 
                      type="monotone" 
                      dataKey="Capital Investido" 
                      stroke="#4F46E5" 
                      fillOpacity={1} 
                      fill="url(#colorCapital)" 
                      strokeWidth={2.5}
                    />

                    {/* Plot Juros Obtidos (can represent negative too) */}
                    <Area 
                      type="monotone" 
                      dataKey="Juros Compostos" 
                      stroke={isGrowthNegative ? "#EF4444" : "#EAB308"} 
                      fillOpacity={1} 
                      fill="url(#colorJuros)" 
                      strokeWidth={2.5}
                    />

                    {/* If inflation is applied, plot actual real return */}
                    {applyInflation && (
                      <Area 
                        type="monotone" 
                        dataKey="Poder de Compra Real" 
                        stroke="#10B981" 
                        fillOpacity={1} 
                        fill="url(#colorReal)" 
                        strokeWidth={2.5}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Evolution Table Card */}
            <div className={`p-6 rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow} space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Table className="h-4.5 w-4.5 text-yellow-500" />
                  <h3 className={`text-base font-extrabold tracking-tight ${palette.textPrimary}`}>
                    Tabela de Evolução Periódica
                  </h3>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center space-x-1.5 bg-slate-800/10 p-1 rounded-lg border border-slate-700/15">
                    <button
                      id="btn-table-prev"
                      onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="p-1 rounded hover:bg-slate-700 hover:text-white disabled:opacity-35 transition-all text-slate-400"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-bold px-1.5 text-slate-400 font-mono">
                      {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      id="btn-table-next"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="p-1 rounded hover:bg-slate-700 hover:text-white disabled:opacity-35 transition-all text-slate-400"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Table rendering */}
              <div className="w-full overflow-x-auto rounded-2xl border border-slate-700/15">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className={`border-b border-slate-700/20 ${palette.cardHeader} text-[10px] font-bold uppercase tracking-wider text-slate-400`}>
                      <th className="py-3.5 px-4 font-mono">Mês / Período</th>
                      <th className="py-3.5 px-4">Investido</th>
                      <th className="py-3.5 px-4">Juros Acumulados</th>
                       {applyInflation && <th className="py-3.5 px-4 text-emerald-400">Poder Compra Real</th>}
                      <th className="py-3.5 px-4 text-right">Patrimônio Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/10 text-xs font-semibold">
                    {paginatedRows.map((row) => (
                      <tr 
                        key={row.period} 
                        className={`hover:bg-slate-500/5 transition-colors ${
                          row.period % 12 === 0 && row.period !== 0 ? 'bg-yellow-500/2 border-y border-yellow-500/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {row.period === 0 ? 'Início' : `Mês ${row.period}`}
                          {row.period !== 0 && row.period % 12 === 0 && (
                            <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[8px] font-bold bg-yellow-500/15 text-yellow-500 border border-yellow-500/10">
                              {row.period / 12} {row.period / 12 === 1 ? 'Ano' : 'Anos'}
                            </span>
                          )}
                        </td>
                        <td className={`py-3 px-4 ${palette.textSecondary}`}>
                          {renderMoney(row.invested)}
                        </td>
                        <td className={`py-3 px-4 ${isGrowthNegative ? 'text-red-400' : 'text-yellow-500'}`}>
                          {row.period === 0 ? '-' : renderMoney(row.interest)}
                        </td>
                        {applyInflation && (
                          <td className="py-3 px-4 text-emerald-500 font-bold">
                            {renderMoney(row.realWealth || 0)}
                          </td>
                        )}
                        <td className="py-3 px-4 text-right font-extrabold text-slate-100 font-mono">
                          <span className={palette.textPrimary}>{renderMoney(row.total)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
