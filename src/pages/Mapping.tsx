import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import formSchema from '@/config/formSchema.json';
import { getProjects } from '@/lib/api';

interface Field {
  name: string;
  displayname: string;
  basin?: string;
  country?: string;
  operator?: string;
}

interface FieldMapping {
  fieldName: string;
  mappings: Record<string, string>; // { requiredFileName: actualFileName }
  createdAt: string;
  updatedAt: string;
}

export default function Mapping() {
  const { t } = useTranslation();
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<string>('');
  const [fieldMappings, setFieldMappings] = useState<FieldMapping | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Extract all file type fields from the schema
  const fileFields = formSchema.tabs
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
        if (data.length > 0 && !selectedField) {
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

  // Load mappings for selected field
  useEffect(() => {
    if (selectedField) {
      const stored = localStorage.getItem(`mapping_${selectedField}`);
      if (stored) {
        setFieldMappings(JSON.parse(stored));
      } else {
        // Initialize with empty mappings
        setFieldMappings({
          fieldName: selectedField,
          mappings: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }, [selectedField]);

  const handleSaveMapping = (mappings: Record<string, string>) => {
    if (!selectedField || !fieldMappings) return;

    const updated: FieldMapping = {
      ...fieldMappings,
      mappings,
      updatedAt: new Date().toISOString(),
    };

    setFieldMappings(updated);
    localStorage.setItem(`mapping_${selectedField}`, JSON.stringify(updated));
    setShowModal(false);
  };

  const getMappingStatus = () => {
    if (!fieldMappings) return 0;
    return Object.keys(fieldMappings.mappings).length;
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
          {t('mapping.title')}
        </h1>
      </div>

      {/* Field Selector */}
      <Card className="p-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Field
            </label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
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
          <Button
            onClick={() => setShowModal(true)}
            disabled={!selectedField}
            className="px-6"
          >
            Add/Edit Mapping
          </Button>
        </div>
      </Card>

      {/* Field Info */}
      {selectedField && (
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
                Mappings Configured
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {getMappingStatus()} / {fileFields.length}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Mappings List */}
      {fieldMappings && Object.keys(fieldMappings.mappings).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Current Mappings
          </h2>
          <div className="grid gap-4">
            {Object.entries(fieldMappings.mappings).map(([requiredFile, actualFile]) => (
              <Card key={requiredFile} className="p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {fileFields.find(f => f.name === requiredFile)?.label || requiredFile}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Required: <span className="font-mono">{requiredFile}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Mapped to:</p>
                    <p className="text-sm font-mono text-primary dark:text-secondary">
                      {actualFile}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {fieldMappings && Object.keys(fieldMappings.mappings).length === 0 && selectedField && (
        <Card className="p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            No mappings configured yet. Click "Add/Edit Mapping" to get started.
          </p>
        </Card>
      )}

      {/* Mapping Modal */}
      <MappingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveMapping}
        fileFields={fileFields}
        currentMappings={fieldMappings?.mappings || {}}
      />
    </div>
  );
}

interface MappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mappings: Record<string, string>) => void;
  fileFields: any[];
  currentMappings: Record<string, string>;
}

function MappingModal({ isOpen, onClose, onSave, fileFields, currentMappings }: MappingModalProps) {
  const [mappings, setMappings] = useState<Record<string, string>>(currentMappings);

  useEffect(() => {
    setMappings(currentMappings);
  }, [currentMappings, isOpen]);

  const handleMappingChange = (requiredFile: string, actualFile: string) => {
    setMappings(prev => ({
      ...prev,
      [requiredFile]: actualFile,
    }));
  };

  const handleRemoveMapping = (requiredFile: string) => {
    setMappings(prev => {
      const updated = { ...prev };
      delete updated[requiredFile];
      return updated;
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure File Mappings">
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {fileFields.map(field => (
          <div key={field.name} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {field.label}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {field.optional ? 'Optional' : 'Required'}
                </p>
              </div>
              {mappings[field.name] && (
                <button
                  onClick={() => handleRemoveMapping(field.name)}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              type="text"
              value={mappings[field.name] || ''}
              onChange={(e) => handleMappingChange(field.name, e.target.value)}
              placeholder={`e.g., ${field.name}_data.csv`}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <Button
          onClick={onClose}
          variant="ghost"
        >
          Cancel
        </Button>
        <Button
          onClick={() => onSave(mappings)}
        >
          Save Mappings
        </Button>
      </div>
    </Modal>
  );
}