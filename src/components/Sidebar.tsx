import { NavLink } from 'react-router-dom';
import { routes } from '@/lib/routes';
import { useTranslation } from 'react-i18next';
import { HomeIcon, ChartIcon, DocumentIcon, DatabaseIcon, MapIcon, SettingsIcon } from '@/components/ui/Icons';
import { ReactNode } from 'react';

export default function Sidebar({ open }: { open: boolean }) {
  const { t } = useTranslation();
  const item = (to: string, label: string, icon: ReactNode) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium min-w-0 ${
          isActive
            ? 'bg-primary text-white shadow-md'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white hover:translate-x-1'
        }`
      }
      title={label}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span
        className={`whitespace-nowrap transition-opacity duration-200 overflow-hidden text-ellipsis ${
          open ? 'opacity-100' : 'opacity-0 w-0'
        }`}
      >
        {label}
      </span>
    </NavLink>
  );
  return (
    <aside
      aria-label="Sidebar"
      className={`flex-shrink-0 transition-all duration-300 ${
        open ? 'w-64' : 'w-16'
      } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto overflow-x-hidden flex flex-col`}
    >
      <nav className="p-2 flex flex-col gap-2 min-w-0 flex-1">
        {item(routes.home, t('nav.home'), <HomeIcon className="w-5 h-5" />)}
        {item(routes.cases, t('nav.cases'), <DocumentIcon className="w-5 h-5" />)}
        {item(routes.data, t('nav.dataManagement'), <DatabaseIcon className="w-5 h-5" />)}
        {item(routes.config, t('nav.configuration'), <SettingsIcon className="w-5 h-5" />)}
      </nav>
      
      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3 mt-auto">
        <p className={`text-xs text-slate-500 dark:text-slate-400 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}>
          © {new Date().getFullYear()} Tachyus Corporation.
        </p>
        <p className={`text-xs text-slate-500 dark:text-slate-400 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}>
          All rights reserved.
        </p>
        <p className={`text-xs text-slate-400 dark:text-slate-500 mt-1 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}>
          Layercon
        </p>
      </div>
    </aside>
  );
}
