export type CurrencyType = 'AOA' | 'BRL' | 'USD' | 'EUR';

export interface CurrencyConfig {
  code: CurrencyType;
  symbol: string;
  name: string;
}

export const CURRENCIES: Record<CurrencyType, CurrencyConfig> = {
  AOA: { code: 'AOA', symbol: 'Kz', name: 'Kwanza (Angola)' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Real (Brasil)' },
  USD: { code: 'USD', symbol: '$', name: 'Dólar (USD)' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
};

export type ThemeMode = 'light' | 'dark';
export type ThemeScheme = 'gold' | 'green';

export interface UserProfile {
  name: string;
  email: string;
  currency: CurrencyType;
  themeMode: ThemeMode;
  themeScheme: ThemeScheme;
}

export interface SimulationHistory {
  id: string;
  type: 'compound' | 'simple' | 'meta' | 'inflation' | 'loan' | 'converter';
  title: string;
  date: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
}

export interface EvolutionRow {
  period: number;
  invested: number;
  interest: number;
  total: number;
  lossPurchasingPower?: number; // For negative scenarios (inflation)
  realWealth?: number; // Inflation adjusted wealth
}
