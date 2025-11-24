import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'file' | 'toggle';
  accept?: string;
  optional?: boolean;
  requiredIf?: any;
  scope?: string;
  options?: string[] | {
    value: string;
    label?: string;
    showIf?: {
      field: string;
      value: any;
    } | {
      operator: 'AND' | 'OR';
      conditions: Array<{
        field: string;
        value: any;
      }>;
    };
    hideIf?: {
      field: string;
      value: any;
    } | {
      operator: 'AND' | 'OR';
      conditions: Array<{
        field: string;
        value: any;
      }>;
    };
  }[];
  required?: boolean;
  step?: number;
  defaultValue: any;
  showIf?: {
    field: string;
    value: any;
  } | {
    operator: 'AND' | 'OR';
    conditions: Array<{
      field: string;
      value: any;
    }>;
  };
}

export interface FormSection {
  title?: string;
  columns: number;
  fields: FormField[];
}

export interface FormTab {
  id: string;
  label: string;
  sections: FormSection[];
}

interface DynamicFormProps {
  schema: { tabs: FormTab[] };
  onSubmit: (data: Record<string, any>, files?: Record<string, File>) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
  showScope?: boolean;
}

export default function DynamicForm({ schema, onSubmit, onCancel, loading, error, showScope = true }: DynamicFormProps) {
  const [activeTab, setActiveTab] = useState(schema.tabs[0]?.id || '');
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    schema.tabs.forEach(tab => {
      tab.sections.forEach(section => {
        section.fields.forEach(field => {
          initial[field.name] = field.defaultValue;
        });
      });
    });
    return initial;
  });

  // Build scope map from field definitions
  const scopeMap = new Map<string, string>();
  schema.tabs.forEach(tab => {
    tab.sections.forEach(section => {
      section.fields.forEach(field => {
        // Use scope from field if defined, otherwise use tab/field pattern
        const scope = (field as any).scope || `${tab.id}/${field.name}`;
        scopeMap.set(field.name, scope);
      });
    });
  });

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateInputJson = () => {
    const inputJson: Record<string, any> = {};
    
    // Build nested structure based on scope
    Object.entries(formData).forEach(([fieldName, value]) => {
      const scope = scopeMap.get(fieldName);
      if (scope) {
        const parts = scope.split('/');
        let current = inputJson;
        
        // Navigate/create nested structure
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        
        // Set the value at the final key
        current[parts[parts.length - 1]] = value;
      }
    });
    
    return inputJson;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputJson = generateInputJson();
    
    // Create input.json file
    const inputJsonFile = new File(
      [JSON.stringify(inputJson, null, 2)],
      'input.json',
      { type: 'application/json' }
    );
    
    onSubmit(formData, { ...uploadedFiles, input_json: inputJsonFile });
  };

  const shouldShowField = (field: FormField): boolean => {
    if (!field.showIf) return true;
    
    // Check if it's a simple condition
    if ('field' in field.showIf) {
      const conditionValue = formData[field.showIf.field];
      return conditionValue === field.showIf.value;
    }
    
    // Check if it's a complex condition with AND/OR
    if ('operator' in field.showIf && 'conditions' in field.showIf) {
      const results = field.showIf.conditions.map(condition => {
        const conditionValue = formData[condition.field];
        return conditionValue === condition.value;
      });
      
      if (field.showIf.operator === 'AND') {
        return results.every(result => result);
      } else {
        return results.some(result => result);
      }
    }
    
    return true;
  };

  const evaluateCondition = (condition: any): boolean => {
    const fieldValue = formData[condition.field];
    
    // Handle NOT operator
    if (condition.not !== undefined) {
      return fieldValue !== condition.value;
    }
    
    return fieldValue === condition.value;
  };

  const shouldHideOption = (hideIf: any): boolean => {
    if (!hideIf) return false;
    
    // Check if it's a simple condition
    if ('field' in hideIf && !('operator' in hideIf)) {
      return evaluateCondition(hideIf);
    }
    
    // Check if it's a complex condition with AND/OR
    if ('operator' in hideIf && 'conditions' in hideIf) {
      const results = hideIf.conditions.map((condition: any) => evaluateCondition(condition));
      
      if (hideIf.operator === 'AND') {
        return results.every(result => result);
      } else if (hideIf.operator === 'OR') {
        return results.some(result => result);
      } else if (hideIf.operator === 'NOT') {
        return !results[0];
      }
    }
    
    return false;
  };

  const evaluateComplexCondition = (condition: any): boolean => {
    // If it's a simple field condition
    if ('field' in condition && !('operator' in condition)) {
      return evaluateCondition(condition);
    }
    
    // If it's a nested operator condition
    if ('operator' in condition && 'conditions' in condition) {
      const results = condition.conditions.map((c: any) => evaluateComplexCondition(c));
      
      if (condition.operator === 'AND') {
        return results.every((r: boolean) => r);
      } else if (condition.operator === 'OR') {
        return results.some((r: boolean) => r);
      }
    }
    
    return true;
  };

  const shouldShowOption = (showIf: any): boolean => {
    if (!showIf) return true;
    return evaluateComplexCondition(showIf);
  };

  const getVisibleOptions = (field: FormField): string[] => {
    if (!field.options) return [];
    
    // If options is a simple string array
    if (typeof field.options[0] === 'string') {
      return field.options as string[];
    }
    
    // If options is an array of objects with showIf/hideIf conditions
    return (field.options as any[])
      .filter(option => {
        if (option.showIf && !shouldShowOption(option.showIf)) return false;
        if (option.hideIf && shouldHideOption(option.hideIf)) return false;
        return true;
      })
      .map(option => option.value);
  };

  const renderField = (field: FormField) => {
    if (!shouldShowField(field)) return null;
    
    const value = formData[field.name];
    const scope = scopeMap.get(field.name);

    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
        return (
          <Input
            key={field.name}
            label={field.label}
            type={field.type}
            value={value}
            onChange={(e) => handleChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
            required={field.required}
            step={field.step}
          />
        );

      case 'select':
        const visibleOptions = getVisibleOptions(field);
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
              {field.label}
            </label>
            <select
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              disabled={visibleOptions.length === 0}
            >
              {visibleOptions.length === 0 ? (
                <option value="">No options available</option>
              ) : (
                visibleOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))
              )}
            </select>
          </div>
        );

      case 'checkbox':
        return (
          <label key={field.name} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary dark:text-secondary focus:ring-primary dark:focus:ring-secondary"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{field.label}</span>
          </label>
        );

      case 'toggle':
        const toggleOptions = (field.options as any[]).map(opt => ({
          value: opt.value,
          label: opt.label || opt.value,
        }));
        
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              {field.label}
            </label>
            <Toggle
              value={value}
              onChange={(newValue) => handleChange(field.name, newValue)}
              options={toggleOptions}
            />
          </div>
        );

      case 'file':
        const isRequired = field.requiredIf ? evaluateComplexCondition(field.requiredIf) : !field.optional;
        const uploadedFile = uploadedFiles[field.name];
        
        return (
          <div key={field.name} className="col-span-full">
            <div className="flex items-start gap-4 p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800">
              <div className="flex-shrink-0 p-2 bg-primary/10 dark:bg-secondary/10 rounded">
                <svg className="w-6 h-6 text-primary dark:text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {field.label}
                  </label>
                  {isRequired ? (
                    <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                      Required
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                      Optional
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="file"
                    id={`file-${field.name}`}
                    className="hidden"
                    accept={field.accept || '.csv,.xlsx,.xls,.json'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const newFiles = { ...uploadedFiles, [field.name]: file };
                        setUploadedFiles(newFiles);
                      }
                    }}
                  />
                  <label
                    htmlFor={`file-${field.name}`}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                  {uploadedFile && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-xs">
                        {uploadedFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = { ...uploadedFiles };
                          delete newFiles[field.name];
                          setUploadedFiles(newFiles);
                        }}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        {schema.tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2.5 font-medium transition-all duration-200 rounded-md ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-primary dark:text-secondary shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {schema.tabs.map(tab => {
        if (activeTab !== tab.id) return null;
        
        return (
          <div key={tab.id} className="space-y-8 animate-fadeIn">
            {tab.sections && tab.sections.length > 0 && tab.sections.map((section, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                {section.title && (
                  <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    {section.title}
                  </h3>
                )}
                <div className={`grid grid-cols-1 ${section.columns > 1 ? `md:grid-cols-${section.columns}` : ''} gap-4`}>
                  {section.fields.map(field => renderField(field))}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        <Button type="submit" disabled={loading} className="px-8">
          {loading ? 'Running...' : 'Run Simulation'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
