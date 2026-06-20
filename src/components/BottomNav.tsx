import { Home, LineChart, Wallet, UserCircle2, Landmark } from 'lucide-react';
import { motion } from 'motion/react';
import { ThemePalette } from '../theme';

export type TabID = 'home' | 'simulator' | 'extras' | 'profile';

interface BottomNavProps {
  currentTab: TabID;
  onChangeTab: (tab: TabID) => void;
  palette: ThemePalette;
}

export default function BottomNav({ currentTab, onChangeTab, palette }: BottomNavProps) {
  const tabs = [
    { id: 'home' as TabID, label: 'Início', icon: Home },
    { id: 'simulator' as TabID, label: 'Simulador', icon: Wallet },
    { id: 'extras' as TabID, label: 'Gráficos', icon: LineChart },
    { id: 'profile' as TabID, label: 'Perfil', icon: UserCircle2 },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t ${palette.card} ${palette.border} ${palette.shadow} py-2 px-4 flex justify-around items-center backdrop-blur-md bg-opacity-95 rounded-t-2xl sm:max-w-xl sm:mx-auto sm:mb-4 sm:rounded-2xl sm:border`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onChangeTab(tab.id)}
            className="flex flex-col items-center justify-center flex-1 py-1 relative min-h-[46px] select-none cursor-pointer outline-none group text-center"
          >
            {/* Active Indicator Background */}
            {isActive && (
              <motion.div
                layoutId="active-nav-indicator"
                className="absolute inset-[2px] rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}

            {/* Icon & Label */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <Icon
                className={`h-5.5 w-5.5 transition-all duration-200 ${
                  isActive
                    ? 'text-yellow-500 scale-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]'
                    : `text-slate-400 group-hover:text-yellow-400 group-hover:scale-105`
                }`}
              />
              <span
                className={`text-[10px] mt-1 font-semibold tracking-wide transition-colors ${
                  isActive ? 'text-yellow-500 font-bold' : `${palette.textMuted} group-hover:text-slate-200`
                }`}
              >
                {tab.label}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
