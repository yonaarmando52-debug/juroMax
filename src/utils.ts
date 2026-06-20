import { CurrencyType, EvolutionRow } from './types';

export function formatCurrency(value: number, currency: CurrencyType): string {
  if (isNaN(value)) value = 0;
  if (currency === 'AOA') {
    const formatted = new Intl.NumberFormat('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    return `${formatted} Kz`;
  } else if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  } else if (currency === 'EUR') {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }
}

// Convert annual rate to monthly rate: (1 + i_a)^(1/12) - 1
export function annualRateToMonthly(annualRatePercent: number): number {
  let i_a = annualRatePercent / 100;
  if (i_a <= -0.999) i_a = -0.999; // Cap rate drop to avoid negative or zero base root issues
  const i_m = Math.pow(1 + i_a, 1 / 12) - 1;
  return i_m * 100;
}

// Convert monthly rate to annual rate: (1 + i_m)^12 - 1
export function monthlyRateToAnnual(monthlyRatePercent: number): number {
  let i_m = monthlyRatePercent / 100;
  if (i_m <= -0.999) i_m = -0.999; // Cap to avoid negative or zero base root issues
  const i_a = Math.pow(1 + i_m, 12) - 1;
  return i_a * 100;
}

export interface CompoundResult {
  totalInvested: number;
  totalInterest: number;
  finalBalance: number;
  evolution: EvolutionRow[];
}

export function calculateCompoundInterest(
  initialValue: number,
  monthlyContribution: number,
  interestRatePercent: number,
  rateType: 'monthly' | 'yearly',
  periodValue: number,
  periodType: 'months' | 'years',
  inflationRatePercent: number = 0
): CompoundResult {
  // Guard values of initial & contribution to avoid NaN
  const initVal = Math.max(0, initialValue || 0);
  const mContrib = Math.max(0, monthlyContribution || 0);

  // 1. Uniform period to months and apply a safety cap of 1200 months (100 years) to prevent browser-freezing loops
  const rawMonths = periodType === 'years' ? periodValue * 12 : periodValue;
  const totalMonths = Math.min(1200, Math.max(1, rawMonths || 1));

  // 2. Uniform interest rate to monthly decimal
  let i_m = 0;
  if (rateType === 'yearly') {
    i_m = annualRateToMonthly(interestRatePercent) / 100;
  } else {
    let r = interestRatePercent / 100;
    if (r <= -0.999) r = -0.999;
    i_m = r;
  }

  // 3. Uniform monthly inflation rate decimal
  const i_inf_m = annualRateToMonthly(Math.max(-99.9, inflationRatePercent)) / 100;

  const evolution: EvolutionRow[] = [];
  let currentBalance = initVal;
  let totalInvestedSoFar = initVal;
  let accumulatedInterest = 0;

  // Add month 0
  evolution.push({
    period: 0,
    invested: totalInvestedSoFar,
    interest: 0,
    total: currentBalance,
    lossPurchasingPower: 0,
    realWealth: currentBalance,
  });

  for (let m = 1; m <= totalMonths; m++) {
    const interestEarned = currentBalance * i_m;
    accumulatedInterest += interestEarned;
    currentBalance = currentBalance + interestEarned + mContrib;
    totalInvestedSoFar += mContrib;

    // Calculate real wealth adjusted for inflation (purchasing power)
    // Discount factor: (1 + i_inf_m)^m
    let discountFactor = Math.pow(1 + i_inf_m, m);
    if (discountFactor <= 0) discountFactor = 1; // Safeguard against zero/negative base
    const realWealth = currentBalance / discountFactor;
    const lossPurchasingPower = Math.max(0, currentBalance - realWealth);

    evolution.push({
      period: m,
      invested: Math.round(totalInvestedSoFar * 100) / 100,
      interest: Math.round(accumulatedInterest * 100) / 100,
      total: Math.round(currentBalance * 100) / 100,
      lossPurchasingPower: Math.round(lossPurchasingPower * 100) / 100,
      realWealth: Math.round(realWealth * 100) / 100,
    });
  }

  return {
    totalInvested: Math.round(totalInvestedSoFar * 100) / 100,
    totalInterest: Math.round(accumulatedInterest * 100) / 100,
    finalBalance: Math.round(currentBalance * 100) / 100,
    evolution,
  };
}

export interface SimpleResult {
  totalInvested: number;
  totalInterest: number;
  finalBalance: number;
  evolution: EvolutionRow[];
}

export function calculateSimpleInterest(
  initialValue: number,
  interestRatePercent: number,
  rateType: 'monthly' | 'yearly',
  periodValue: number,
  periodType: 'months' | 'years'
): SimpleResult {
  const initVal = Math.max(0, initialValue || 0);
  const rawMonths = periodType === 'years' ? periodValue * 12 : periodValue;
  // Cap at 1200 months for UI & calculation safety
  const totalMonths = Math.min(1200, Math.max(1, rawMonths || 1));
  
  let r_monthly = 0;
  if (rateType === 'yearly') {
    // Simple interest annual rate is divided by 12 for monthly
    r_monthly = (interestRatePercent / 12) / 100;
  } else {
    r_monthly = interestRatePercent / 100;
  }

  const evolution: EvolutionRow[] = [];
  const totalInvested = initVal;
  const singleMonthInterest = initVal * r_monthly;

  evolution.push({
    period: 0,
    invested: initVal,
    interest: 0,
    total: initVal,
  });

  for (let m = 1; m <= totalMonths; m++) {
    const interest = singleMonthInterest * m;
    evolution.push({
      period: m,
      invested: initVal,
      interest: Math.round(interest * 100) / 100,
      total: Math.round((initVal + interest) * 100) / 100,
    });
  }

  const totalInterest = singleMonthInterest * totalMonths;
  const finalBalance = initVal + totalInterest;

  return {
    totalInvested: Math.round(totalInvested * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    finalBalance: Math.round(finalBalance * 100) / 100,
    evolution,
  };
}

export interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  amortization: {
    period: number;
    payment: number;
    interest: number;
    principal: number;
    balance: number;
  }[];
}

export function calculateLoan(
  amount: number,
  annualRatePercent: number,
  periodValue: number,
  periodType: 'months' | 'years'
): LoanResult {
  const loanAmount = Math.max(0, amount || 0);
  const rawMonths = periodType === 'years' ? periodValue * 12 : periodValue;
  // Cap at 1200 installments
  const totalMonths = Math.min(1200, Math.max(1, rawMonths || 1));
  
  let rate = annualRatePercent;
  if (rate < 0) rate = 0; // Negative interest rates are not supported for standard loan calculators
  const r_m = (rate / 12) / 100;

  let monthlyPayment = 0;
  if (r_m === 0) {
    monthlyPayment = loanAmount / totalMonths;
  } else {
    // Standard PMT formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const factor = Math.pow(1 + r_m, totalMonths);
    if (factor - 1 === 0) {
      monthlyPayment = loanAmount / totalMonths;
    } else {
      monthlyPayment = (loanAmount * r_m * factor) / (factor - 1);
    }
  }

  let remainingBalance = loanAmount;
  const amortization = [];
  let totalInterest = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const interestPayment = remainingBalance * r_m;
    const principalPayment = Math.min(remainingBalance, monthlyPayment - interestPayment);
    remainingBalance = Math.max(0, remainingBalance - principalPayment);
    totalInterest += interestPayment;

    amortization.push({
      period: m,
      payment: Math.round(monthlyPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      balance: Math.round(remainingBalance * 100) / 100,
    });

    if (remainingBalance <= 0) break; // Fully amortized early
  }

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPaid: Math.round((loanAmount + totalInterest) * 100) / 100,
    amortization,
  };
}

export interface InflationResult {
  purchasingPowerPercentage: number;
  lossValue: number;
  realValueAfter: number;
  history: {
    year: number;
    nominalValue: number;
    realValue: number;
    retainedPowerPercent: number;
  }[];
}

export function calculateInflation(
  currentAmount: number,
  annualInflationPercent: number,
  years: number
): InflationResult {
  const amount = Math.max(0, currentAmount || 0);
  let rate = annualInflationPercent / 100;
  if (rate <= -0.99) rate = -0.99; // Cap deflation to avoid negative/zero denominator
  
  // Cap at 100 years
  const totalYears = Math.min(100, Math.max(1, years || 1));
  const history = [];

  history.push({
    year: 0,
    nominalValue: amount,
    realValue: amount,
    retainedPowerPercent: 100,
  });

  let realValue = amount;
  for (let y = 1; y <= totalYears; y++) {
    realValue = realValue / (1 + rate);
    const power = amount > 0 ? (realValue / amount) * 100 : 0;

    history.push({
      year: y,
      nominalValue: amount,
      realValue: Math.round(realValue * 100) / 100,
      retainedPowerPercent: Math.round(power * 100) / 100,
    });
  }

  const realValueAfter = realValue;
  const lossValue = Math.max(0, amount - realValueAfter);
  const purchasingPowerPercentage = amount > 0 ? (realValueAfter / amount) * 100 : 100;

  return {
    purchasingPowerPercentage: Math.round(purchasingPowerPercentage * 100) / 100,
    lossValue: Math.round(lossValue * 100) / 100,
    realValueAfter: Math.round(realValueAfter * 100) / 100,
    history,
  };
}

export interface GoalResult {
  monthlyInvestmentRequired: number;
  totalInvested: number;
  totalInterest: number;
  isAchievable: boolean;
  evolution: EvolutionRow[];
}

export function calculateMeta(
  targetValue: number,
  initialValue: number,
  expectedRatePercent: number,
  rateType: 'monthly' | 'yearly',
  periodValue: number,
  periodType: 'months' | 'years'
): GoalResult {
  const targetVal = Math.max(0, targetValue || 0);
  const initVal = Math.max(0, initialValue || 0);
  const rawMonths = periodType === 'years' ? periodValue * 12 : periodValue;
  // Cap at 1200 months to align with compound capping
  const totalMonths = Math.min(1200, Math.max(1, rawMonths || 1));
  
  let i_m = 0;
  if (rateType === 'yearly') {
    i_m = annualRateToMonthly(expectedRatePercent) / 100;
  } else {
    let r = expectedRatePercent / 100;
    if (r <= -0.999) r = -0.999;
    i_m = r;
  }

  // Future value of initial balance: FV_init = Initial * (1 + i_m)^months
  const factor = Math.pow(1 + i_m, totalMonths);
  const fvInitial = initVal * factor;
  const remainingNeeded = targetVal - fvInitial;

  let monthlyInvestmentRequired = 0;
  if (remainingNeeded <= 0) {
    // Initial balance + compound interest alone hits/exceeds target
    monthlyInvestmentRequired = 0;
  } else if (i_m === 0) {
    monthlyInvestmentRequired = remainingNeeded / totalMonths;
  } else {
    // Sinking fund formula: PMT = FV * r / (((1 + r)^n) - 1)
    if (factor - 1 === 0) {
      monthlyInvestmentRequired = remainingNeeded / totalMonths;
    } else {
      monthlyInvestmentRequired = (remainingNeeded * i_m) / (factor - 1);
    }
  }

  const compoundResult = calculateCompoundInterest(
    initVal,
    monthlyInvestmentRequired,
    expectedRatePercent,
    rateType,
    periodValue,
    periodType
  );

  return {
    monthlyInvestmentRequired: Math.round(monthlyInvestmentRequired * 100) / 100,
    totalInvested: Math.round(compoundResult.totalInvested * 100) / 100,
    totalInterest: Math.round(compoundResult.totalInterest * 100) / 100,
    isAchievable: true,
    evolution: compoundResult.evolution,
  };
}
