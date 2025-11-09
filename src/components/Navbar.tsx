import Button from '@/components/ui/Button';
import { useEffect, useState } from 'react';


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
return (
<nav className="sticky top-0 z-20 bg-white dark:bg-[#0B1020] border-b border-gray-200 dark:border-gray-800">
<div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
<div className="flex items-center gap-3">
<Button aria-label="Abrir menú" variant="ghost" onClick={onToggleSidebar}>☰</Button>
<h1 className="text-lg font-bold">Layercon</h1>
</div>
<div className="flex items-center gap-2">
<Button variant="ghost" onClick={toggle} aria-label="Cambiar tema">
{dark ? '🌙 Dark' : '☀️ Light'}
</Button>
<a className="text-sm text-primary underline" href="https://tachyus.com" target="_blank" rel="noreferrer">Ayuda</a>
</div>
</div>
</nav>
);
}