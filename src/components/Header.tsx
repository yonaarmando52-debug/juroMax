import { TrendingUp, User, Landmark, Settings, Flame } from 'lucide-react';
import { UserProfile, CURRENCIES } from '../types';
import { ThemePalette } from '../theme';

interface HeaderProps {
  profile: UserProfile;
  palette: ThemePalette;
  onNavigateToProfile: () => void;
  openSettingsModal: () => void;
}

export default function Header({ profile, palette, onNavigateToProfile, openSettingsModal }: HeaderProps) {
  const activeCurrency = CURRENCIES[profile.currency];

  return (
    <header className={`w-full py-4 px-6 border-b flex items-center justify-between transition-colors duration-300 ${palette.card} ${palette.border} ${palette.shadow} relative z-20`}>
      {/* Brand logo & name */}
      <div className="flex items-center space-x-3 select-none">
        <div className={`p-2.5 rounded-xl ${palette.accentLight} flex items-center justify-center transition-all duration-300 shadow-sm border ${palette.accentBorder}`}>
          <TrendingUp className="h-6 w-6 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center space-x-1">
            <span className={`text-2xl font-extrabold tracking-tight ${palette.textPrimary}`}>
              Juro<span className="text-yellow-500">Max</span>
            </span>
          </div>
          <p className={`text-[10px] uppercase tracking-wider font-semibold font-mono ${palette.textMuted}`}>
            Foco Financeiro Real
          </p>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-3">
        {/* Currency Badge */}
        <div className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${palette.inputBg} border ${palette.border}`}>
          <Landmark className="h-3.5 w-3.5 text-yellow-500" />
          <span className={palette.textSecondary}>{activeCurrency.code} ({activeCurrency.symbol})</span>
        </div>

        {/* Action Buttons */}
        <button
          id="btn-settings-modal"
          onClick={openSettingsModal}
          className={`p-2 rounded-xl transition-all duration-200 border ${palette.border} ${palette.inputBg} hover:opacity-80 flex items-center justify-center`}
          title="Opções Futuras e Recursos"
        >
          <Settings className="h-4 w-4" />
        </button>

        <button
          id="btn-navigate-profile"
          onClick={onNavigateToProfile}
          className={`flex items-center space-x-2 p-1.5 pr-3 rounded-xl border ${palette.border} ${palette.inputBg} hover:opacity-85 transition-all duration-200 group`}
          title="Ver o Perfil"
        >
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-900 font-extrabold text-sm shadow-sm">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className={`text-xs font-medium hidden sm:inline-block ${palette.textSecondary} group-hover:text-yellow-500 transition-colors`}>
            {profile.name || 'Minha Conta'}
          </span>
        </button>
      </div>
    </header>
  );
}
