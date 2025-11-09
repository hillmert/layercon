import Button from '@/components/ui/Button';
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

const toggleLanguage = () => {
const newLang = i18n.language === 'en' ? 'es' : 'en';
i18n.changeLanguage(newLang);
localStorage.setItem('language', newLang);
document.documentElement.lang = newLang;
const skipLink = document.getElementById('skip-link');
if (skipLink) skipLink.textContent = t('nav.skipToContent');
};

return (
<nav className="sticky top-0 z-20 bg-white dark:bg-[#0B1020] border-b border-gray-200 dark:border-gray-800">
<div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
<div className="flex items-center gap-3">
<Button aria-label={t('nav.openMenu')} variant="ghost" onClick={onToggleSidebar}>☰</Button>
<h1 className="text-lg font-bold">{t('app.name')}</h1>
</div>
<div className="flex items-center gap-2">
<Button variant="ghost" onClick={toggleLanguage} aria-label="Change language">
{i18n.language === 'en' ? '🇪🇸 ES' : '🇺🇸 EN'}
</Button>
<Button variant="ghost" onClick={toggle} aria-label={t('nav.changeTheme')}>
{dark ? `🌙 ${t('nav.dark')}` : `☀️ ${t('nav.light')}`}
</Button>
<a className="text-sm text-primary underline" href="https://tachyus.com" target="_blank" rel="noreferrer">{t('nav.help')}</a>
</div>
</div>
</nav>
);
}