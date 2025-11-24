import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SQLQueryEditor from '@/components/SQLQueryEditor';
import formSchema from '@/config/formSchema.json';
import { getProjects, queryDataExplorer } from '@/lib/api';

interface Field {
  name: string;
  displayname: string;
  basin?: string;
  country?: string;
  operator?: string;
}

interface FileField {
  name: string;
  label: string;
  type: string;
  optional?: boolean;
}

interface FieldQuery {
  fieldName: string;
  fileField: string;
  query: string;
  createdAt: string;
  updatedAt: string;
}

export default function Data() {
  const { t } = useTranslation();
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedFileField, setSelectedFileField] = useState<string>('');
  const [fieldQuery, setFieldQuery] = useState<FieldQuery | null>(null);
  const [showQueryEditor, setShowQueryEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [queryResults, setQueryResults] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Extract all file type fields from the schema
  const fileFields: FileField[] = formSchema.tabschoco : El término 'choco' no se reconoce como nombre de un cmdlet, función, archivo de script o programa ejecutable. Compruebe si escribió correctamente el nombre o, si incluyó una ruta de acceso, compruebe que dicha 
ruta es correcta e inténtelo de nuevo.
En línea: 1 Carácter: 1
+ choco install heroku-cli
+ ~~~~~
    + CategoryInfo          : ObjectNotFound: (choco:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
    .flatMap((tab: any) => tab.sections || [])
    .flatMap((section: any) => section.fields || [])
    .filter((field: any) => field.type === 'file');

  // Load fields from API
  useEffect(() => {
    async function loadFields() {
      try {
        setLoading(true);
        const data = await getProjects();
        setFields(data);
        if (data.length > 0) {
          setSelectedField(data[0].name);
        }
      } catch (err) {
        console.error('Error loading fields:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFields();
  }, []);

  // Load query for selected field+file from localStorage
  useEffect(() => {
    if (selectedField && selectedFileField) {
      const key = `query_${selectedField}_${selectedFileField}`;
      const stored = localStorage.getItem(key);
      setFieldQuery(stored ? JSON.parse(stored) : null);
    }
  }, [selectedField, selectedFileField]);

  const handleQuerySave = (query: string) => {
    if (!selectedField || !selectedFileField) return;

    const newQuery: FieldQuery = {
      fieldName: selectedField,
      fileField: selectedFileField,
      query,
      createdAt: fieldQuery?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFieldQuery(newQuery);
    const key = `query_${selectedField}_${selectedFileField}`;
    localStorage.setItem(key, JSON.stringify(newQuery));
    setShowQueryEditor(false);
  };

  const handleQueryDelete = () => {
    if (!selectedField || !selectedFileField) return;
    setFieldQuery(null);
    const key = `query_${selectedField}_${selectedFileField}`;
    localStorage.removeItem(key);
  };

  const handleSync = () => {
    console.log('Syncing query for field:', selectedField, fieldQuery);
    // TODO: Implement sync logic
  };

  const handleExecuteQuery = async () => {
    if (!fieldQuery?.query) {
      setQueryError('No query to execute');
      return;
    }

    try {
      setExecuting(true);
      setQueryError(null);
      setQueryResults(null);

      // Add LIMIT 20 to the query if not already present
      let query = fieldQuery.query.trim();
      const upperQuery = query.toUpperCase();
      
      // Check if query already has a LIMIT clause
      if (!upperQuery.includes('LIMIT')) {
        // Add LIMIT 20 at the end
        query = `${query} LIMIT 20`;
      }

      const result = await queryDataExplorer(query);
      const data = Array.isArray(result) ? result : (result as any).data || [];
      
      setQueryResults(data);
    } catch (err) {
      console.error('Error executing query:', err);
      setQueryError(err instanceof Error ? err.message : 'Failed to execute query');
      setQueryResults(null);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t('data.title')}
        </h1>
        <Button onClick={handleSync} disabled={!fieldQuery}>
          Sync Data
        </Button>
      </div>

      {/* Field and File Field Selector */}
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Field
            </label>
            <select
              value={selectedField}
              onChange={(e) => {
                setSelectedField(e.target.value);
                setSelectedFileField('');
              }}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
            >
              <option value="">Choose a field...</option>
              {fields.map(field => (
                <option key={field.name} value={field.name}>
                  {field.displayname} ({field.basin || 'N/A'})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Data Source
            </label>
            <select
              value={selectedFileField}
              onChange={(e) => setSelectedFileField(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
              disabled={!selectedField}
            >
              <option value="">Choose a data source...</option>
              {fileFields.map(field => (
                <option key={field.name} value={field.name}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button
          onClick={() => setShowQueryEditor(true)}
          disabled={!selectedField || !selectedFileField}
          className="px-6"
        >
          {fieldQuery ? 'Edit Query' : 'Add Query'}
        </Button>
      </Card>

      {/* Field Info */}
      {selectedField && selectedFileField && (
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                Field
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {fields.find(f => f.name === selectedField)?.displayname}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                Data Source
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {fileFields.find(f => f.name === selectedFileField)?.label}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Query Display */}
      {selectedField && selectedFileField && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            SQL Query
          </h2>
          {fieldQuery ? (
            <Card className="p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Last updated: {new Date(fieldQuery.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleExecuteQuery}
                    disabled={executing}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed rounded transition-colors flex items-center gap-2"
                  >
                    {executing ? (
                      <>
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Executing...
                      </>
                    ) : (
                      'Execute Query'
                    )}
                  </button>
                  <button
                    onClick={() => setShowQueryEditor(true)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleQueryDelete}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="bg-slate-900 dark:bg-slate-950 rounded p-3 font-mono text-xs text-slate-100 overflow-x-auto max-h-48 overflow-y-auto">
                {fieldQuery.query}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                No query defined for this data source yet.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Query Results */}
      {queryError && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">Query Error</h3>
              <p className="text-sm text-red-700 dark:text-red-300">{queryError}</p>
            </div>
          </div>
        </Card>
      )}

      {queryResults && queryResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Query Preview
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {queryResults.length === 20 ? 'Showing first 20 results (limited)' : `Showing ${queryResults.length} result${queryResults.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Card className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {Object.keys(queryResults[0] || {}).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queryResults.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {Object.values(row).map((value: any, colIdx) => (
                      <td
                        key={colIdx}
                        className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-xs truncate"
                        title={String(value)}
                      >
                        {value === null ? (
                          <span className="text-slate-400 italic">null</span>
                        ) : typeof value === 'boolean' ? (
                          <span className={value ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}>
                            {String(value)}
                          </span>
                        ) : typeof value === 'number' ? (
                          <span className="font-mono text-slate-600 dark:text-slate-400">{value}</span>
                        ) : (
                          String(value)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {queryResults && queryResults.length === 0 && !queryError && (
        <Card className="p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Query executed successfully but returned no results.
          </p>
        </Card>
      )}

      {/* SQL Query Editor Modal */}
      <SQLQueryEditor
        isOpen={showQueryEditor}
        onClose={() => setShowQueryEditor(false)}
        onSave={handleQuerySave}
        initialQuery={fieldQuery?.query || ''}
        title={`SQL Query - ${fileFields.find(f => f.name === selectedFileField)?.label || 'Query'}`}
      />
    </div>
  );
}
