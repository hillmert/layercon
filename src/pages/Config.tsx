import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CHART_THEMES, ThemeType } from '@/lib/chartThemes';
import { useChartTheme } from '@/hooks/useChartTheme';
import { getProjects } from '@/lib/api';

interface Field {
  name: string;
  displayname: string;
  basin?: string;
  country?: string;
  operator?: string;
}

const THEME_KEYS: ThemeType[] = [
  'default',
  'vibrant',
  'pastel',
  'ocean',
  'sunset',
  'forest',
  'cool',
  'warm',
  'neon',
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'achromatic',
];

export default function Config() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'users' | 'themes'>('hierarchy');
  const { theme: selectedTheme, updateTheme } = useChartTheme();
  const [fields, setFields] = useState<Field[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [editingField, setEditingField] = useState<Field | null>(null);

  useEffect(() => {
    async function loadFields() {
      try {
        setLoadingFields(true);
        const data = await getProjects();
        setFields(data);
        if (data.length > 0) {
          setSelectedField(data[0]);
        }
      } catch (err) {
        console.error('Error loading fields:', err);
      } finally {
        setLoadingFields(false);
      }
    }
    loadFields();
  }, []);

  // Handle theme change
  const handleThemeChange = (themeKey: ThemeType) => {
    updateTheme(themeKey);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t('config.title')}
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
        <nav className="flex gap-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'hierarchy'
                ? 'border-primary text-primary dark:border-secondary dark:text-secondary'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t('config.tabs.hierarchy')}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-primary text-primary dark:border-secondary dark:text-secondary'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t('config.tabs.users')}
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'themes'
                ? 'border-primary text-primary dark:border-secondary dark:text-secondary'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Chart Themes
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'hierarchy' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Fields List Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Fields
                </h3>
                {loadingFields ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {fields.map((field) => (
                      <button
                        key={field.name}
                        onClick={() => {
                          setSelectedField(field);
                          setEditingField(null);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          selectedField?.name === field.name
                            ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-secondary border border-primary/30 dark:border-secondary/30'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="font-medium truncate">{field.displayname}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{field.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Field Details */}
            <div className="lg:col-span-3">
              {selectedField ? (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {editingField ? 'Edit Field' : 'Field Details'}
                    </h2>
                    {!editingField && (
                      <button
                        onClick={() => setEditingField(selectedField)}
                        className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {editingField ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={editingField.displayname}
                          onChange={(e) => setEditingField({ ...editingField, displayname: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Basin
                        </label>
                        <input
                          type="text"
                          value={editingField.basin || ''}
                          onChange={(e) => setEditingField({ ...editingField, basin: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={editingField.country || ''}
                          onChange={(e) => setEditingField({ ...editingField, country: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Operator
                        </label>
                        <input
                          type="text"
                          value={editingField.operator || ''}
                          onChange={(e) => setEditingField({ ...editingField, operator: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
                        />
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => setEditingField(null)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (editingField) {
                              setSelectedField(editingField);
                              setEditingField(null);
                              // TODO: Save to API
                            }
                          }}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 dark:bg-secondary dark:hover:bg-secondary/90 rounded transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                          Display Name
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                          {selectedField.displayname}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                          Field ID
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100 font-mono">
                          {selectedField.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                          Basin
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                          {selectedField.basin || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                          Country
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                          {selectedField.country || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                          Operator
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                          {selectedField.operator || '—'}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-slate-600 dark:text-slate-400">
                    Select a field to view details
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {t('config.users.title')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t('config.users.description')}
            </p>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              <p>Content coming soon...</p>
            </div>
          </Card>
        )}

        {activeTab === 'themes' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Chart Color Themes
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Select a color theme for charts. Includes accessible options for colorblind users.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {THEME_KEYS.map(themeKey => {
                  const theme = CHART_THEMES[themeKey];
                  return (
                    <button
                      key={themeKey}
                      onClick={() => handleThemeChange(themeKey)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedTheme === themeKey
                          ? 'border-primary dark:border-secondary bg-primary/5 dark:bg-secondary/5'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-secondary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {theme.name}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {theme.description}
                          </p>
                          {theme.colorblindType && (
                            <p className="text-xs text-primary dark:text-secondary mt-2 font-medium">
                              ♿ Optimized for {theme.colorblindType}
                            </p>
                          )}
                        </div>
                        {selectedTheme === themeKey && (
                          <div className="text-primary dark:text-secondary text-lg">✓</div>
                        )}
                      </div>

                      {/* Color preview */}
                      <div className="flex gap-1 flex-wrap">
                        {theme.colors.slice(0, 10).map((color, colorIdx) => (
                          <div
                            key={colorIdx}
                            className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                        {theme.colors.length > 10 && (
                          <div className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                            +{theme.colors.length - 10}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Accessibility Note:</strong> The Protanopia, Deuteranopia, Tritanopia, and Achromatic themes are specifically designed for users with color vision deficiency. These themes ensure that all data is distinguishable without relying solely on color.
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
