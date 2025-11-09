import { NavLink } from 'react-router-dom';
import { routes } from '@/lib/routes';


export default function Sidebar({ open }: { open: boolean }) {
const item = (to: string, label: string) => (
<NavLink to={to} className={({isActive}) => `px-3 py-2 rounded-2xl ${isActive ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}>{label}</NavLink>
);
return (
<aside aria-label="Sidebar" className={`transition-all duration-200 ${open ? 'w-64' : 'w-0'} overflow-hidden bg-white border-r border-gray-200`}>
<nav className="p-4 flex flex-col gap-2">
{item(routes.home, 'Inicio')}
{item(routes.summary, 'Analíticas')}
{item(routes.cases, 'Casos')}
{item(routes.data, 'Data Management')}
{item(routes.mapping, 'Mapping')}
{item(routes.config, 'Config')}
</nav>
</aside>
);
}