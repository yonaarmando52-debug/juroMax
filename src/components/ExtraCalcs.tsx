import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Percent, 
  Target, 
  ShieldAlert, 
  Building, 
  ArrowRightLeft, 
  TrendingUp, 
  HelpCircle, 
  Check, 
  Save, 
  Plus, 
  AlertTriangle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { UserProfile, CURRENCIES, SimulationHistory } from '../types';
import { ThemePalette } from '../theme';
import { 
  formatCurrency, 
  calculateSimpleInterest, 
  calculateMeta, 
  calculateInflation, 
  calculateLoan 
} from '../utils';

interface ExtraCalcsProps {
  profile: UserProfile;
  palette: ThemePalette;
  activeExtraTab: string;
  onSelectExtraTab: (tabId: string) => void;
  onSaveSimulation: (sim: Omit<SimulationHistory, 'id' | 'date'>) => void;
  simulationToLoad: SimulationHistory | null;
  onClearLoadedSimulation: () => void;
}

export default function ExtraCalcs({
  profile,
  palette,
  activeExtraTab,
  onSelectExtraTab,
  onSaveSimulation,
  simulationToLoad,
  onClearLoadedSimulation,
}: ExtraCalcsProps) {
  // Common visual feedbacks
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);
  const triggerSaveFeedback = () => {
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  // 1. STATE FOR SIMPLE INTEREST
  const [simpleParams, setSimpleParams] = useState({
    initialValue: '10000',
    interestRate: '8',
    rateType: 'yearly' as 'monthly' | 'yearly',
    periodValue: '10',
    periodType: 'years' as 'months' | 'years',
  });
  const [simpleResult, setSimpleResult] = useState<any>(null);

  // 2. STATE FOR GOAL CALCULATOR
  const [metaParams, setMetaParams] = useState({
    targetValue: '100000',
    initialValue: '5000',
    expectedRate: '12',
    rateType: 'yearly' as 'monthly' | 'yearly',
    periodValue: '15',
    periodType: 'years' as 'months' | 'years',
  });
  const [metaResult, setMetaResult] = useState<any>(null);

  // 3. STATE FOR INFLATION CALCULATOR
  const [inflationParams, setInflationParams] = useState({
    currentAmount: '50000',
    inflationRate: '6.5',
    years: '10',
  });
  const [inflationResult, setInflationResult] = useState<any>(null);

  // 4. STATE FOR LOAN CALCULATOR
  const [loanParams, setLoanParams] = useState({
    amount: '40000',
    annualRate: '14',
    periodValue: '5',
    periodType: 'years' as 'months' | 'years',
  });
  const [loanResult, setLoanResult] = useState<any>(null);

  // 5. STATE FOR CONVERTER
  const [converterParams, setConverterParams] = useState({
    sourceRate: '12',
    conversionType: 'annualToMonthly' as 'annualToMonthly' | 'monthlyToAnnual',
  });
  const [converterResult, setConverterResult] = useState<number | null>(null);

  // TRIGGERS ON TAB CHANGE / CURRENCY CHANGE
  useEffect(() => {
    runSimpleInterestCalculations();
    runMetaCalculations();
    runInflationCalculations();
    runLoanCalculations();
    runConverterCalculations();
  }, [profile.currency, activeExtraTab]);

  // LOAD SIMULATION FROM USER PROFILE HISTORY
  useEffect(() => {
    if (simulationToLoad) {
      const { type, inputs } = simulationToLoad;
      if (type === 'simple' && inputs) {
        const params = {
          initialValue: String(inputs.initialValue ?? '10000'),
          interestRate: String(inputs.interestRate ?? '8'),
          rateType: (inputs.rateType ?? 'yearly') as 'monthly' | 'yearly',
          periodValue: String(inputs.periodValue ?? '10'),
          periodType: (inputs.periodType ?? 'years') as 'months' | 'years',
        };
        setSimpleParams(params);
        const res = calculateSimpleInterest(
          Number(params.initialValue) || 0,
          Number(params.interestRate) || 0,
          params.rateType,
          Number(params.periodValue) || 1,
          params.periodType
        );
        setSimpleResult(res);
        onClearLoadedSimulation();
      } else if (type === 'meta' && inputs) {
        const params = {
          targetValue: String(inputs.targetValue ?? '100000'),
          initialValue: String(inputs.initialValue ?? '5000'),
          expectedRate: String(inputs.expectedRate ?? '12'),
          rateType: (inputs.rateType ?? 'yearly') as 'monthly' | 'yearly',
          periodValue: String(inputs.periodValue ?? '15'),
          periodType: (inputs.periodType ?? 'years') as 'months' | 'years',
        };
        setMetaParams(params);
        const res = calculateMeta(
          Number(params.targetValue) || 100000,
          Number(params.initialValue) || 0,
          Number(params.expectedRate) || 0,
          params.rateType,
          Number(params.periodValue) || 1,
          params.periodType
        );
        setMetaResult(res);
        onClearLoadedSimulation();
      } else if (type === 'inflation' && inputs) {
        const params = {
          currentAmount: String(inputs.currentAmount ?? '50000'),
          inflationRate: String(inputs.inflationRate ?? '6.5'),
          years: String(inputs.years ?? '10'),
        };
        setInflationParams(params);
        const res = calculateInflation(
          Number(params.currentAmount) || 10000,
          Number(params.inflationRate) || 0,
          Number(params.years) || 1
        );
        setInflationResult(res);
        onClearLoadedSimulation();
      } else if (type === 'loan' && inputs) {
        const params = {
          amount: String(inputs.amount ?? '40000'),
          annualRate: String(inputs.annualRate ?? '14'),
          periodValue: String(inputs.periodValue ?? '5'),
          periodType: (inputs.periodType ?? 'years') as 'months' | 'years',
        };
        setLoanParams(params);
        const res = calculateLoan(
          Number(params.amount) || 10000,
          Number(params.annualRate) || 0,
          Number(params.periodValue) || 1,
          params.periodType
        );
        setLoanResult(res);
        onClearLoadedSimulation();
      } else if (type === 'converter' && inputs) {
        const params = {
          sourceRate: String(inputs.sourceRate ?? '12'),
          conversionType: (inputs.conversionType ?? 'annualToMonthly') as 'annualToMonthly' | 'monthlyToAnnual',
        };
        setConverterParams(params);
        const rate = Number(params.sourceRate) || 0;
        const dec = rate / 100;
        let resVal = 0;
        if (params.conversionType === 'annualToMonthly') {
          resVal = (Math.pow(1 + dec, 1 / 12) - 1) * 100;
        } else {
          resVal = (Math.pow(1 + dec, 12) - 1) * 100;
        }
        setConverterResult(Math.round(resVal * 10000) / 10000);
        onClearLoadedSimulation();
      }
    }
  }, [simulationToLoad, onClearLoadedSimulation]);

  // CALCULATIONS RUNNERS
  const runSimpleInterestCalculations = () => {
    const init = Number(simpleParams.initialValue) || 0;
    const rate = Number(simpleParams.interestRate) || 0;
    const period = Number(simpleParams.periodValue) || 1;
    const res = calculateSimpleInterest(init, rate, simpleParams.rateType, period, simpleParams.periodType);
    setSimpleResult(res);
  };

  const runMetaCalculations = () => {
    const target = Number(metaParams.targetValue) || 100000;
    const init = Number(metaParams.initialValue) || 0;
    const rate = Number(metaParams.expectedRate) || 0;
    const period = Number(metaParams.periodValue) || 1;
    const res = calculateMeta(target, init, rate, metaParams.rateType, period, metaParams.periodType);
    setMetaResult(res);
  };

  const runInflationCalculations = () => {
    const current = Number(inflationParams.currentAmount) || 10000;
    const infl = Number(inflationParams.inflationRate) || 0;
    const years = Number(inflationParams.years) || 1;
    const res = calculateInflation(current, infl, years);
    setInflationResult(res);
  };

  const runLoanCalculations = () => {
    const loanVal = Number(loanParams.amount) || 10000;
    const r = Number(loanParams.annualRate) || 0;
    const pVal = Number(loanParams.periodValue) || 1;
    const res = calculateLoan(loanVal, r, pVal, loanParams.periodType);
    setLoanResult(res);
  };

  const runConverterCalculations = () => {
    const rate = Number(converterParams.sourceRate) || 0;
    const dec = rate / 100;
    if (converterParams.conversionType === 'annualToMonthly') {
      // (1 + a_r)^(1/12) - 1
      const res = (Math.pow(1 + dec, 1 / 12) - 1) * 100;
      setConverterResult(Math.round(res * 10000) / 10000);
    } else {
      // (1 + m_r)^12 - 1
      const res = (Math.pow(1 + dec, 12) - 1) * 100;
      setConverterResult(Math.round(res * 10000) / 10000);
    }
  };

  // SAVE WORKERS
  const saveSimpleInterest = () => {
    if (!simpleResult) return;
    onSaveSimulation({
      type: 'simple',
      title: `Juros Simples - Final ${formatCurrency(simpleResult.finalBalance, profile.currency)}`,
      inputs: { ...simpleParams },
      results: {
        totalInvested: simpleResult.totalInvested,
        totalInterest: simpleResult.totalInterest,
        finalBalance: simpleResult.finalBalance,
      }
    });
    triggerSaveFeedback();
  };

  const saveMetaGoal = () => {
    if (!metaResult) return;
    onSaveSimulation({
      type: 'meta',
      title: `Meta Financeira - Aporte ${formatCurrency(metaResult.monthlyInvestmentRequired, profile.currency)}/mês`,
      inputs: { ...metaParams },
      results: {
        monthlyInvestmentRequired: metaResult.monthlyInvestmentRequired,
        totalInvested: metaResult.totalInvested,
        totalInterest: metaResult.totalInterest,
      }
    });
    triggerSaveFeedback();
  };

  const saveInflation = () => {
    if (!inflationResult) return;
    onSaveSimulation({
      type: 'inflation',
      title: `Simulador Inflação - Perda de ${formatCurrency(inflationResult.lossValue, profile.currency)}`,
      inputs: { ...inflationParams },
      results: {
        lossValue: inflationResult.lossValue,
        realValueAfter: inflationResult.realValueAfter,
        purchasingPowerPercentage: inflationResult.purchasingPowerPercentage,
      }
    });
    triggerSaveFeedback();
  };

  const saveLoan = () => {
    if (!loanResult) return;
    onSaveSimulation({
      type: 'loan',
      title: `Empréstimo - Parcela ${formatCurrency(loanResult.monthlyPayment, profile.currency)}/mês`,
      inputs: { ...loanParams },
      results: {
        monthlyPayment: loanResult.monthlyPayment,
        totalInterest: loanResult.totalInterest,
        totalPaid: loanResult.totalPaid,
      }
    });
    triggerSaveFeedback();
  };

  // Shortcuts handler for quick Meta values (1M, 10M, 100M)
  const setQuickMetaValue = (val: number) => {
    setMetaParams(prev => ({ ...prev, targetValue: val.toString() }));
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Scrollable Tabs */}
      <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2 select-none">
        {[
          { id: 'simple', label: 'Juros Simples', icon: Percent },
          { id: 'meta', label: 'Meta Financeira', icon: Target },
          { id: 'inflation', label: 'Perda p/ Inflação', icon: ShieldAlert },
          { id: 'loan', label: 'Empréstimos', icon: Building },
          { id: 'converter', label: 'Conversor de Taxas', icon: ArrowRightLeft },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeExtraTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-extra-${tab.id}`}
              onClick={() => onSelectExtraTab(tab.id)}
              className={`flex items-center space-x-2 shrink-0 px-4 py-2.5 rounded-full text-xs font-bold border transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md'
                  : `${palette.card} ${palette.border} ${palette.textSecondary} hover:bg-slate-500/10`
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* VIEW 1: JUROS SIMPLES */}
        {activeExtraTab === 'simple' && (
          <motion.div
            key="tabpanel-simple"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            <div className={`p-6 rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow}`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <Percent className="h-5 w-5 text-yellow-500" />
                  <h3 className={`text-base font-extrabold ${palette.textPrimary}`}>
                    Cálculo de Juros Simples
                  </h3>
                </div>
                <button
                  id="btn-save-simple-calc"
                  onClick={saveSimpleInterest}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-yellow-500 flex items-center gap-1 active:scale-95 transition-all"
                >
                  {showSavedFeedback ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
                  <span>{showSavedFeedback ? 'Salvo' : 'Salvar Simulação'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Valor Inicial</span>
                  <input
                    id="input-simple-initial"
                    type="number"
                    value={simpleParams.initialValue}
                    onChange={(e) => {
                      setSimpleParams(prev => ({ ...prev, initialValue: e.target.value }));
                    }}
                    className={`w-full px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold`}
                  />
                </div>

                <div className="space-y-2">
                  <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Taxa de Juros (%)</span>
                  <div className="flex space-x-2">
                    <input
                      id="input-simple-rate"
                      type="number"
                      value={simpleParams.interestRate}
                      onChange={(e) => {
                        setSimpleParams(prev => ({ ...prev, interestRate: e.target.value }));
                      }}
                      className={`flex-1 px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold`}
                    />
                    <select
                      id="select-simple-rate-type"
                      value={simpleParams.rateType}
                      onChange={(e) => setSimpleParams(prev => ({ ...prev, rateType: e.target.value as any }))}
                      className={`px-3 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-xs font-bold`}
                    >
                      <option value="monthly">Mensal</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Período de Tempo</span>
                  <div className="flex space-x-2">
                    <input
                      id="input-simple-period"
                      type="number"
                      value={simpleParams.periodValue}
                      onChange={(e) => {
                        setSimpleParams(prev => ({ ...prev, periodValue: e.target.value }));
                      }}
                      className={`flex-1 px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold`}
                    />
                    <select
                      id="select-simple-period-type"
                      value={simpleParams.periodType}
                      onChange={(e) => setSimpleParams(prev => ({ ...prev, periodType: e.target.value as any }))}
                      className={`px-3 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-xs font-bold`}
                    >
                      <option value="months">Meses</option>
                      <option value="years">Anos</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                id="btn-calculate-simple"
                onClick={runSimpleInterestCalculations}
                className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 border border-amber-400 hover:brightness-105 transition-all"
              >
                Calcular Juros Simples
              </button>
            </div>

            {simpleResult && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-5 rounded-2xl ${palette.card} border ${palette.border} ${palette.shadow}`}>
                  <span className={`text-[10px] font-black uppercase ${palette.textMuted}`}>Valor Investido</span>
                  <p className={`text-xl font-extrabold ${palette.textPrimary}`}>{formatCurrency(simpleResult.totalInvested, profile.currency)}</p>
                </div>
                <div className={`p-5 rounded-2xl ${palette.card} border ${palette.border} ${palette.shadow}`}>
                  <span className={`text-[10px] font-black uppercase ${palette.textMuted}`}>Juros Totais Obtidos</span>
                  <p className="text-xl font-extrabold text-yellow-500">+{formatCurrency(simpleResult.totalInterest, profile.currency)}</p>
                </div>
                <div className={`p-5 rounded-2xl ${palette.card} border ${palette.border} ${palette.shadow} bg-gradient-to-br from-amber-500/5 to-amber-500/15`}>
                  <span className="text-[10px] font-black uppercase text-yellow-500">Montante Total Final</span>
                  <p className={`text-xl font-black ${palette.textPrimary}`}>{formatCurrency(simpleResult.finalBalance, profile.currency)}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 2: META FINANCEIRA */}
        {activeExtraTab === 'meta' && (
          <motion.div
            key="tabpanel-meta"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            <div className={`p-6 rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-yellow-500" />
                  <h3 className={`text-base font-extrabold ${palette.textPrimary}`}>
                    Meta Financeira JuroMax
                  </h3>
                </div>
                <button
                  id="btn-save-meta"
                  onClick={saveMetaGoal}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-yellow-500 flex items-center gap-1 active:scale-95 transition-all"
                >
                  {showSavedFeedback ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
                  <span>{showSavedFeedback ? 'Salvo' : 'Salvar Simulação'}</span>
                </button>
              </div>

              <p className={`text-xs ${palette.textSecondary} mb-5`}>
                "Quanto preciso poupar e investir mensalmente para atingir determinado valor final?"
              </p>

              {/* Quick Suggestion Goal Targets */}
              <div className="space-y-2 mb-6">
                <span className={`text-[10px] font-bold tracking-wider uppercase ${palette.textMuted}`}>
                  Metas Rápidas Sugeridas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '1 Milhão', val: 1000000 },
                    { label: '10 Milhões', val: 10000000 },
                    { label: '100 Milhões', val: 100000000 },
                  ].map((targetItem) => {
                    const activeSym = CURRENCIES[profile.currency].symbol;
                    return (
                      <button
                        key={targetItem.val}
                        id={`btn-quick-goal-${targetItem.val}`}
                        onClick={() => setQuickMetaValue(targetItem.val)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          metaParams.targetValue === targetItem.val.toString()
                            ? 'bg-yellow-500 text-slate-950 border-amber-400 font-extrabold'
                            : `${palette.inputBg} ${palette.border} ${palette.textSecondary} hover:bg-slate-500/10`
                        }`}
                      >
                        {targetItem.label} {activeSym}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Meta Financeira Alvo</span>
                  <input
                    id="input-meta-target"
                    type="number"
                    value={metaParams.targetValue}
                    onChange={(e) => setMetaParams(prev => ({ ...prev, targetValue: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold`}
                    placeholder="Ex. 1.000.000"
                  />
                </div>

                <div className="space-y-2">
                  <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Já Possuo Guardado (Valor Inicial)</span>
                  <input
                    id="input-meta-initial"
                    type="number"
                    value={metaParams.initialValue}
                    onChange={(e) => setMetaParams(prev => ({ ...prev, initialValue: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold`}
                    placeholder="Ex. 5.000"
                  />
                </div>

                <div className="space-y-2">
                  <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Rentabilidade de Investimentos (%)</span>
                  <div className="flex space-x-2">
                    <input
                      id="input-meta-rate"
                      type="number"
                      value={metaParams.expectedRate}
                      onChange={(e) => setMetaParams(prev => ({ ...prev, expectedRate: e.target.value }))}
                      className={`flex-1 px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold`}
                    />
                    <select
                      id="select-meta-rate-type"
                      value={metaParams.rateType}
                      onChange={(e) => setMetaParams(prev => ({ ...prev, rateType: e.target.value as any }))}
                      className={`px-3 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-xs font-bold`}
                    >
                      <option value="monthly">Mensal</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Prazo Estimado</span>
                  <div className="flex space-x-2">
                    <input
                      id="input-meta-period"
                      type="number"
                      value={metaParams.periodValue}
                      onChange={(e) => setMetaParams(prev => ({ ...prev, periodValue: e.target.value }))}
                      className={`flex-1 px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold`}
                    />
                    <select
                      id="select-meta-period-type"
                      value={metaParams.periodType}
                      onChange={(e) => setMetaParams(prev => ({ ...prev, periodType: e.target.value as any }))}
                      className={`px-3 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-xs font-bold`}
                    >
                      <option value="months">Meses</option>
                      <option value="years">Anos</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                id="btn-calculate-meta"
                onClick={runMetaCalculations}
                className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 border border-amber-400 hover:brightness-105 transition-all"
              >
                Desenhar Plano de Metas
              </button>
            </div>

            {metaResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow} bg-gradient-to-br from-amber-500/5 to-amber-500/10 space-y-4`}
              >
                <div className="text-center py-4 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-yellow-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                    Aporte Mensal Necessário
                  </span>
                  
                  {metaResult.monthlyInvestmentRequired <= 0 ? (
                    <div className="py-2">
                      <p className={`text-2xl font-black ${palette.textPrimary}`}>Você já atingiu seu objetivo!</p>
                      <p className={`text-xs ${palette.textSecondary} max-w-sm mx-auto`}>
                        O seu saldo inicial capitalizado por juros compostos renderá o suficiente para cruzar seu alvo de {formatCurrency(Number(metaParams.targetValue), profile.currency)} de forma totalmente passiva!
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h2 className={`text-3xl font-black ${palette.textPrimary} tracking-tight`}>
                        {formatCurrency(metaResult.monthlyInvestmentRequired, profile.currency)} <span className="text-sm font-normal text-slate-400">/mês</span>
                      </h2>
                      <p className={`text-xs ${palette.textSecondary} max-w-[420px] mx-auto mt-2 leading-relaxed`}>
                        Aportando este valor fixo todos os meses durante {metaParams.periodValue} {metaParams.periodType === 'years' ? 'anos' : 'meses'} a uma taxa de {metaParams.expectedRate}% {metaParams.rateType === 'yearly' ? 'anual' : 'mensal'}, você alcançará o montante de <span className="font-extrabold text-white">{formatCurrency(Number(metaParams.targetValue), profile.currency)}</span>.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/25">
                  <div className="text-center">
                    <span className={`text-[10px] font-mono text-slate-400 uppercase`}>Capital Poupado</span>
                    <p className={`text-sm font-bold ${palette.textPrimary}`}>{formatCurrency(metaResult.totalInvested, profile.currency)}</p>
                  </div>
                  <div className="text-center">
                    <span className={`text-[10px] font-mono text-slate-400 uppercase`}>Porção de Juros</span>
                    <p className="text-sm font-bold text-yellow-500">{formatCurrency(metaResult.totalInterest, profile.currency)}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* VIEW 3: INFLATION CALCULATOR */}
        {activeExtraTab === 'inflation' && (
          <motion.div
            key="tabpanel-inflation"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            <div className={`p-6 rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow}`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  <h3 className={`text-base font-extrabold ${palette.textPrimary}`}>
                    Calculadora de Perda por Inflação
                  </h3>
                </div>
                <button
                  id="btn-save-inflation"
                  onClick={saveInflation}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-yellow-500 flex items-center gap-1 active:scale-95 transition-all"
                >
                  {showSavedFeedback ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
                  <span>{showSavedFeedback ? 'Salvo' : 'Salvar Simulação'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Patrimônio Atual Guardado</span>
                  <input
                    id="input-inflation-amount"
                    type="number"
                    value={inflationParams.currentAmount}
                    onChange={(e) => setInflationParams(prev => ({ ...prev, currentAmount: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold`}
                    placeholder="Ex. 50.000"
                  />
                </div>

                <div className="space-y-2">
                  <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Inflação Média Anual (%)</span>
                  <input
                    id="input-inflation-avg"
                    type="number"
                    step="0.1"
                    value={inflationParams.inflationRate}
                    onChange={(e) => setInflationParams(prev => ({ ...prev, inflationRate: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold`}
                    placeholder="Ex. 6.5"
                  />
                </div>

                <div className="space-y-2">
                  <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Tempo (Anos)</span>
                  <input
                    id="input-inflation-years"
                    type="number"
                    value={inflationParams.years}
                    onChange={(e) => setInflationParams(prev => ({ ...prev, years: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold`}
                    placeholder="Ex. 10"
                  />
                </div>
              </div>

              <button
                id="btn-calculate-inflation"
                onClick={runInflationCalculations}
                className="w-full py-3 rounded-xl font-bold text-xs bg-red-600 text-white border border-red-500 hover:brightness-105 transition-all shadow-md shadow-red-500/10"
              >
                Medir Perda de Poder de Compra
              </button>
            </div>

            {inflationResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Result Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-5 rounded-2xl ${palette.card} border ${palette.border} ${palette.shadow} space-y-1`}>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${palette.textMuted}`}>
                      Poder de Compra Sobrou
                    </span>
                    <h3 className="text-xl font-black text-emerald-500 tracking-tight">
                      {inflationResult.purchasingPowerPercentage}%
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Do valor real original ao término do prazo
                    </p>
                  </div>

                  <div className={`p-5 rounded-2xl ${palette.card} border ${palette.border} ${palette.shadow} space-y-1`}>
                    <span className={`text-[10px] font-black uppercase tracking-wider text-red-400`}>
                      Perda em Dinheiro (Corrosão)
                    </span>
                    <h3 className="text-xl font-black text-red-500 tracking-tight">
                      -{formatCurrency(inflationResult.lossValue, profile.currency)}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      O montante de valor perdido para os preços altos
                    </p>
                  </div>

                  <div className={`p-5 rounded-2xl ${palette.card} border ${palette.border} ${palette.shadow} bg-gradient-to-tr from-red-500/5 to-red-500/10 space-y-1`}>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${palette.textMuted}`}>
                      Valor Real Equivalente
                    </span>
                    <h3 className={`text-xl font-black ${palette.textPrimary} tracking-tight`}>
                      {formatCurrency(inflationResult.realValueAfter, profile.currency)}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Quanto seu dinheiro valerá futuramente na prática
                    </p>
                  </div>
                </div>

                {/* Inflation Chart */}
                <div className={`p-6 rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow} space-y-3`}>
                  <h4 className={`text-sm font-extrabold ${palette.textPrimary}`}>
                    Gráfico de Corrosão do Dinheiro ao Longo dos Anos
                  </h4>
                  
                  <div className="h-64 w-full text-xs font-semibold">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={inflationResult.history}
                        margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorRealVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                        <XAxis 
                          dataKey="year" 
                          stroke="#94A3B8" 
                          tickFormatter={(y) => `Ano ${y}`}
                        />
                        <YAxis stroke="#94A3B8" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0F172A', borderColor: '#2D3748', borderRadius: '12px' }}
                          formatter={(value) => [formatCurrency(Number(value), profile.currency), '']}
                        />
                        <Legend />
                        
                        <Area 
                          type="monotone" 
                          name="Valor Nominal (Sem Inflação)" 
                          dataKey="nominalValue" 
                          stroke="#94A3B8" 
                          fill="url(#colorNominal)" 
                        />
                        <Area 
                          type="monotone" 
                          name="Poder de Compra Real (Corroído)" 
                          dataKey="realValue" 
                          stroke="#EF4444" 
                          fill="url(#colorRealVal)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* VIEW 4: LOAN CALCULATOR */}
        {activeExtraTab === 'loan' && (
          <motion.div
            key="tabpanel-loan"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            <div className={`p-6 rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow}`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-yellow-500" />
                  <h3 className={`text-base font-extrabold ${palette.textPrimary}`}>
                    Calculadora de Empréstimos e Financiamentos
                  </h3>
                </div>
                <button
                  id="btn-save-loan"
                  onClick={saveLoan}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-yellow-500 flex items-center gap-1 active:scale-95 transition-all"
                >
                  {showSavedFeedback ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
                  <span>{showSavedFeedback ? 'Salvo' : 'Salvar Simulação'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Valor Solicitado</span>
                  <input
                    id="input-loan-amount"
                    type="number"
                    value={loanParams.amount}
                    onChange={(e) => setLoanParams(prev => ({ ...prev, amount: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold`}
                    placeholder="Ex. 40.000"
                  />
                </div>

                <div className="space-y-2">
                  <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Taxa de Juros Especial (Anual %)</span>
                  <input
                    id="input-loan-rate"
                    type="number"
                    value={loanParams.annualRate}
                    onChange={(e) => setLoanParams(prev => ({ ...prev, annualRate: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold`}
                    placeholder="Ex. 14"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Prazo de Pagamento</span>
                  <div className="flex space-x-2">
                    <input
                      id="input-loan-period"
                      type="number"
                      value={loanParams.periodValue}
                      onChange={(e) => setLoanParams(prev => ({ ...prev, periodValue: e.target.value }))}
                      className={`flex-1 px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold`}
                      placeholder="Ex. 5"
                    />
                    <select
                      id="select-loan-period-type"
                      value={loanParams.periodType}
                      onChange={(e) => setLoanParams(prev => ({ ...prev, periodType: e.target.value as any }))}
                      className={`px-3 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-xs font-bold`}
                    >
                      <option value="months">Meses</option>
                      <option value="years">Anos</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                id="btn-calculate-loan"
                onClick={runLoanCalculations}
                className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 border border-amber-400 hover:brightness-105 transition-all"
              >
                Simular Amortização Price
              </button>
            </div>

            {loanResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Result totals */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-5 rounded-2xl ${palette.card} border ${palette.border} ${palette.shadow}`}>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${palette.textMuted}`}>
                      Parcela Mensal Estimada
                    </span>
                    <h3 className={`text-xl font-black ${palette.textPrimary} tracking-tight`}>
                      {formatCurrency(loanResult.monthlyPayment, profile.currency)}
                    </h3>
                  </div>

                  <div className={`p-5 rounded-2xl ${palette.card} border ${palette.border} ${palette.shadow}`}>
                    <span className={`text-[10px] font-black uppercase tracking-wider text-red-400`}>
                      Juros Cobrados Totais
                    </span>
                    <h3 className="text-xl font-black text-red-500 tracking-tight">
                      {formatCurrency(loanResult.totalInterest, profile.currency)}
                    </h3>
                  </div>

                  <div className={`p-5 rounded-2xl ${palette.card} border ${palette.border} ${palette.shadow} bg-gradient-to-br from-yellow-500/5 to-amber-500/10`}>
                    <span className="text-[10px] font-black uppercase text-yellow-500">
                      Capital Pago Totalizado
                    </span>
                    <h3 className={`text-xl font-black ${palette.textPrimary} tracking-tight`}>
                      {formatCurrency(loanResult.totalPaid, profile.currency)}
                    </h3>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* VIEW 5: CONVERSOR DE TAXAS */}
        {activeExtraTab === 'converter' && (
          <motion.div
            key="tabpanel-converter"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className={`p-6 rounded-3xl ${palette.card} border ${palette.border} ${palette.shadow} space-y-6`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ArrowRightLeft className="h-5 w-5 text-yellow-500" />
                <h3 className={`text-base font-extrabold ${palette.textPrimary}`}>
                  Conversor de Taxas Equivalentes
                </h3>
              </div>
            </div>

            <p className={`text-xs ${palette.textSecondary} leading-relaxed`}>
              No mundo das finanças, os juros são compostos. Consequentemente, para converter taxas, é incorreto simplesmente multiplicar ou dividir por 12. É preciso aplicar a fórmula de equivalência exponencial.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Estrutura do Fluxo</span>
                <select
                  id="select-converter-type"
                  value={converterParams.conversionType}
                  onChange={(e) => {
                    setConverterParams(prev => ({ 
                      ...prev, 
                      conversionType: e.target.value as any 
                    }));
                  }}
                  className={`w-full px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold`}
                >
                  <option value="annualToMonthly">Converter Taxa Anual ➜ Mensal</option>
                  <option value="monthlyToAnnual">Converter Taxa Mensal ➜ Anual</option>
                </select>
              </div>

              <div className="space-y-2">
                <span className={`text-xs font-bold uppercase ${palette.textSecondary}`}>Taxa de Entrada (%)</span>
                <input
                  id="input-converter-rate"
                  type="number"
                  step="0.01"
                  value={converterParams.sourceRate}
                  onChange={(e) => setConverterParams(prev => ({ ...prev, sourceRate: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${palette.border} ${palette.inputBg} ${palette.inputText} text-sm font-bold`}
                  placeholder="Ex. 12"
                />
              </div>
            </div>

            <button
              id="btn-calculate-conversion"
              onClick={runConverterCalculations}
              className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 border border-amber-400 hover:brightness-105 transition-all"
            >
              Comprovar Equivalência
            </button>

            {converterResult !== null && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl ${palette.inputBg} border ${palette.border} text-center space-y-3`}
              >
                <span className={`text-[10px] font-black uppercase tracking-wider ${palette.textMuted}`}>
                  Taxa Equivalente Obtida
                </span>
                
                {converterParams.conversionType === 'annualToMonthly' ? (
                  <div>
                    <h2 className={`text-3xl font-black ${palette.textPrimary}`}>
                      {converterResult}% <span className="text-sm font-normal text-slate-400">ao mês</span>
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-2 font-mono">
                      Equivalente exponencial de uma taxa nominal de {converterParams.sourceRate}% ao ano.
                      <br />
                      Fórmula: (1 + {Number(converterParams.sourceRate) / 100})^(1/12) - 1
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className={`text-3xl font-black ${palette.textPrimary}`}>
                      {converterResult}% <span className="text-sm font-normal text-slate-400">ao ano</span>
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-2 font-mono">
                      Equivalente exponencial de uma taxa nominal de {converterParams.sourceRate}% ao mês.
                      <br />
                      Fórmula: (1 + {Number(converterParams.sourceRate) / 100})^12 - 1
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
