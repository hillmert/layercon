import Button from '@/components/ui/Button';
import { MenuIcon, SunIcon, MoonIcon, GlobeIcon } from '@/components/ui/Icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';


function useTheme() {
const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
useEffect(() => {
const stored = localStorage.getItem('theme');
if (stored === 'dark') { document.documentElement.classList.add('dark'); setDark(true); }
if (stored === 'light') { document.documentElement.classList.remove('dark'); setDark(false); }
}, []);
const toggle = () => {
const next = !dark;
setDark(next);
document.documentElement.classList.toggle('dark', next);
localStorage.setItem('theme', next ? 'dark' : 'light');
};
return { dark, toggle };
}


export default function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
const { dark, toggle } = useTheme();
const { t, i18n } = useTranslation();

const toggleLanguage = async () => {
const newLang = i18n.language === 'en' ? 'es' : 'en';
await i18n.changeLanguage(newLang);
localStorage.setItem('language', newLang);
document.documentElement.lang = newLang;
const skipLink = document.getElementById('skip-link');
if (skipLink) skipLink.textContent = t('nav.skipToContent');
};

return (
    <nav className="flex-shrink-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm w-full overflow-x-hidden">
    <div className="px-4 py-3 flex items-center justify-between min-w-0">
    <div className="flex items-center gap-3">
    <Button aria-label={t('nav.openMenu')} variant="ghost" onClick={onToggleSidebar} className="p-2">
      <MenuIcon className="w-5 h-5" />
    </Button>
    <img src="/src/assets/logo.png" alt={t('app.name')} className="h-8 w-auto" />
    </div>
    <div className="flex items-center gap-2">
    <Button variant="ghost" onClick={toggleLanguage} aria-label={t('nav.changeLanguage')} className="flex items-center gap-2">
      <GlobeIcon className="w-4 h-4" />
      {i18n.language === 'en' ? 'ES' : 'EN'}
    </Button>
    <Button variant="ghost" onClick={toggle} aria-label={t('nav.changeTheme')} className="flex items-center gap-2">
      {dark ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
      {dark ? t('nav.dark') : t('nav.light')}
    </Button>
    <a className="text-sm text-primary dark:text-secondary underline hover:opacity-80 transition-opacity" href="https://tachyus.com" target="_blank" rel="noreferrer">{t('nav.help')}</a>
    </div>
    </div>
    </nav>
);
}