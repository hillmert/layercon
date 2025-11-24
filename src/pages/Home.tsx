import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { OilFieldIcon, SettingsIcon, DatabaseIcon } from '@/components/ui/Icons';
import { Link } from 'react-router-dom';
import { routes } from '@/lib/routes';
import { useTranslation } from 'react-i18next';
import { getProjects } from '@/lib/api';

interface Field {
  name: string;
  displayname: string;
  basin?: string;
  country?: string;
  operator?: string;
}

export default function Home() {
  const { t } = useTranslation();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFields() {
      try {
        setLoading(true);
        const data = await getProjects();
        setFields(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading fields');
        console.error('Error loading fields:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFields();
  }, []);

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-6 py-12 relative">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                {t('home.title')}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
                {t('home.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Try Again
            </button>
          </Card>
        ) : fields.length === 0 ? (
          <Card className="p-12 text-center">
            <OilFieldIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {t('home.noFields')}
            </p>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => (
              <Link
                key={field.name}
                to={`${routes.cases}?project=${field.name}`}
                className="group"
              >
                <div className="h-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-primary/50 dark:hover:border-secondary/50 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  {/* Header with icon */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                      <OilFieldIcon className="w-5 h-5 text-primary dark:text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                        {field.displayname}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                        {field.name}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-6 py-5 space-y-4">
                    {/* Details Grid */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                          {t('home.basin')}
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                          {field.basin || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                          {t('home.country')}
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                          {field.country || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                          {t('home.operator')}
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                          {field.operator || '—'}
                        </p>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary dark:text-secondary group-hover:gap-3 transition-all">
                        <span>Open Field</span>
                        <span className="text-lg">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Access Section */}
        {fields.length > 0 && (
          <div className="mt-16 pt-8 border-t border-slate-300 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-4">
              Quick Navigation
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                to={routes.data}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary/50 dark:hover:border-secondary/50 hover:shadow-md transition-all text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <DatabaseIcon className="w-4 h-4" />
                {t('home.quickAccess.dataManagement')}
              </Link>
              <Link
                to={routes.config}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary/50 dark:hover:border-secondary/50 hover:shadow-md transition-all text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <SettingsIcon className="w-4 h-4" />
                {t('home.quickAccess.configuration')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}