import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export interface SQLQueryEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (query: string) => void;
  initialQuery?: string;
  title?: string;
}

const SQLQueryEditor: React.FC<SQLQueryEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuery = '',
  title = 'SQL Query Editor',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!query.trim()) {
      setError('Query cannot be empty');
      return;
    }
    onSave(query);
    setQuery('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setQuery(initialQuery);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            SQL Query
          </label>
          <textarea
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError('');
            }}
            placeholder="SELECT * FROM table_name WHERE condition..."
            className="w-full h-64 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Query
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SQLQueryEditor;
