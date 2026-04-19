import { motion } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';

export function QuickActionsGrid() {
  const language = useSettingsStore((s) => s.language);
  const isAr = language === 'ar';

  const actions = [
    {
      label: isAr ? 'القرآن الكريم' : 'Holy Quran',
      sublabel: isAr ? 'المصحف' : "Mus'haf",
      color: 'from-amber-600/20 to-amber-900/10',
      borderColor: 'border-amber-600/20 hover:border-amber-500/40',
      iconColor: 'text-amber-400',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => import('@/store/app-store').then(m => m.useAppStore.getState().setActiveTab('quran')),
    },
    {
      label: isAr ? 'الأذكار' : 'Azkar',
      sublabel: isAr ? 'أذكار الصباح والمساء' : 'Morning & Evening',
      color: 'from-teal-600/20 to-teal-900/10',
      borderColor: 'border-teal-600/20 hover:border-teal-500/40',
      iconColor: 'text-teal-400',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => import('@/store/app-store').then(m => m.useAppStore.getState().setActiveTab('azkar')),
    },
    {
      label: isAr ? 'الصلاة على النبي ﷺ' : 'Salawat',
      sublabel: isAr ? 'السلام عليك أيها النبي' : 'Salawat Counter',
      color: 'from-rose-600/20 to-rose-900/10',
      borderColor: 'border-rose-600/20 hover:border-rose-500/40',
      iconColor: 'text-rose-400',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => import('@/store/app-store').then(m => {
        const state = m.useAppStore.getState();
        state.setActiveTab('more');
        state.setMoreView('salawat');
      }),
    },
    {
      label: isAr ? 'مواقيت الصلاة' : 'Prayer Times',
      sublabel: isAr ? 'أوقات الصلوات الخمس' : 'Five daily prayers',
      color: 'from-cyan-600/20 to-cyan-900/10',
      borderColor: 'border-cyan-600/20 hover:border-cyan-500/40',
      iconColor: 'text-cyan-400',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => import('@/store/app-store').then(m => m.useAppStore.getState().setActiveTab('prayer')),
    },
    {
      label: isAr ? 'الأحاديث' : 'Hadith',
      sublabel: isAr ? 'حديث اليوم' : "Today's Hadith",
      color: 'from-emerald-600/20 to-emerald-900/10',
      borderColor: 'border-emerald-600/20 hover:border-emerald-500/40',
      iconColor: 'text-emerald-400',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 7h8M8 11h6" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => import('@/store/app-store').then(m => {
        const state = m.useAppStore.getState();
        state.setActiveTab('more');
        state.setMoreView('hadith');
      }),
    },
    {
      label: isAr ? 'الراديو القرآني' : 'Quran Radio',
      sublabel: isAr ? 'إذاعة القرآن الكريم' : 'Live Quran Stream',
      color: 'from-purple-600/20 to-purple-900/10',
      borderColor: 'border-purple-600/20 hover:border-purple-500/40',
      iconColor: 'text-purple-400',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
          <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="2" />
          <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => import('@/store/app-store').then(m => {
        const state = m.useAppStore.getState();
        state.setActiveTab('more');
        state.setMoreView('radio');
      }),
    },
  ];

  return (
    <div>
      <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        className="arabic-display mb-3 text-center text-lg text-text-secondary">
        {isAr ? 'أدواتك الروحية' : 'Your Spiritual Tools'}
      </motion.h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((action, i) => (
          <motion.button 
            key={i} 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05, duration: 0.35 }} 
            onClick={action.onClick}
            aria-label={action.label}
            className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 text-right transition-all active:scale-[0.97] ${action.borderColor} ${action.color}`}
          >
            <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-zad-midnight/50 ${action.iconColor}`}>{action.icon}</div>
            <p className="text-sm font-semibold text-text-primary">{action.label}</p>
            <p className="mt-0.5 text-[11px] leading-tight text-text-muted">{action.sublabel}</p>
            <div className="pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full bg-white/[0.03] opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
