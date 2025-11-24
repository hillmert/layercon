import { useMemo, useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { PlusIcon, AlertIcon } from '@/components/ui/Icons';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { Link, useSearchParams } from 'react-router-dom';
import { routes } from '@/lib/routes';
import { queryDataExplorer } from '@/lib/api';

interface CaseData {
  id: string;
  name: string;
  submittedby: string;
  resultstatus: string;
  submittedtime: string;
}

type SortField = 'name' | 'submittedby' | 'status' | 'date';
type SortOrder = 'asc' | 'desc';

export default function Cases() {
  const [searchParams] = useSearchParams();
  const projectField = searchParams.get('project') || '';
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [q, setQ] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = useMemo(() => {
    let result = cases.filter((c) => c.name && c.name.toLowerCase().includes(q.toLowerCase()));
    
    // Sort
    result.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case 'name':
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
          break;
        case 'submittedby':
          aVal = a.submittedby?.toLowerCase() || '';
          bVal = b.submittedby?.toLowerCase() || '';
          break;
        case 'status':
          aVal = a.resultstatus?.toLowerCase() || '';
          bVal = b.resultstatus?.toLowerCase() || '';
          break;
        case 'date':
          aVal = new Date(a.submittedtime).getTime();
          bVal = new Date(b.submittedtime).getTime();
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [cases, q, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [q]);

  useEffect(() => {
    async function fetchCases() {
      try {
        setLoading(true);
        setError(undefined);

        const query = `SELECT replace(replace(displayname, 'Run Case', 'case'),' (queued)', '') as id, meta->>'case_name' as name, submittedby, resultstatus, submittedtime::DATE as submittedtime FROM workflowrepository WHERE workflowtemplate LIKE '%strateon%' ORDER BY submittedtime::date DESC`;

        console.log('Fetching cases with query:', query);
        const result = await queryDataExplorer<CaseData[]>(query);
        console.log('Query result:', result);
        
        // Handle different response formats
        const data = Array.isArray(result) ? result : (result as any).data || [];
        console.log('Parsed data:', data);
        setCases(data);
      } catch (err) {
        console.error('Error fetching cases:', err);
        setError(err instanceof Error ? err.message : 'Failed to load cases');
      } finally {
        setLoading(false);
      }
    }

    fetchCases();
  }, []);

  const handleDelete = async (caseId: string, caseName: string) => {
    if (!confirm(`Are you sure you want to delete "${caseName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(caseId);
      // TODO: Implement DELETE API call
      // await apiRequest(`${endpoints.strateon}/${caseId}`, { method: 'DELETE' });
      
      // Remove from local state
      setCases(cases.filter(c => c.id !== caseId));
      console.log('Case deleted:', caseId);
    } catch (err) {
      console.error('Error deleting case:', err);
      alert('Failed to delete case. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClone = async (caseId: string, caseName: string) => {
    try {
      setCloningId(caseId);
      // TODO: Implement CLONE API call
      // const result = await apiRequest(`${endpoints.strateon}/${caseId}/clone`, { method: 'POST' });
      
      console.log('Cloning case:', caseId);
      alert(`Case "${caseName}" will be cloned. (API not implemented yet)`);
      
      // Refresh the list after cloning
      // fetchCases();
    } catch (err) {
      console.error('Error cloning case:', err);
      alert('Failed to clone case. Please try again.');
    } finally {
      setCloningId(null);
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4" /></svg>;
    }
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
    ) : (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Link to={`${routes.createCase}?field=${projectField}`}>
          <Button className="text-base px-5 py-2 flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            New Simulation
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search cases by name..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent"
                />
              </div>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
              {loading ? (
                'Loading...'
              ) : (
                <>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{paginatedCases.length}</span> of{' '}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{filtered.length}</span>
                  {filtered.length !== cases.length && (
                    <> / {cases.length} total</>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertIcon className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-x-auto">
        <Table>
          <THead>
            <TR>
              <TH className="w-32">Actions</TH>
              <TH>
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  Simulation Name
                  <SortIcon field="name" />
                </button>
              </TH>
              <TH>
                <button
                  onClick={() => handleSort('submittedby')}
                  className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  Submitted By
                  <SortIcon field="submittedby" />
                </button>
              </TH>
              <TH>
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  Status
                  <SortIcon field="status" />
                </button>
              </TH>
              <TH>
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  Submitted
                  <SortIcon field="date" />
                </button>
              </TH>
            </TR>
          </THead>
          <TBody>
            {loading ? (
              <TR>
                <TD colSpan={5} className="text-center text-slate-500">
                  Loading cases...
                </TD>
              </TR>
            ) : filtered.length === 0 ? (
              <TR>
                <TD colSpan={5} className="text-center text-slate-500">
                  {q ? 'No cases match your search' : 'No cases found'}
                </TD>
              </TR>
            ) : (
              paginatedCases.map((c) => (
                <TR key={c.id}>
                  <TD>
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/cases/${c.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white hover:shadow-lg hover:scale-110 transition-all duration-200"
                        title="View case details"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleClone(c.id, c.name)}
                        disabled={cloningId === c.id}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 hover:shadow-lg hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Clone case"
                      >
                        {cloningId === c.id ? (
                          <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                            <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        disabled={deletingId === c.id}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 hover:shadow-lg hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete case"
                      >
                        {deletingId === c.id ? (
                          <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </TD>
                  <TD>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{c.name || 'Unnamed Case'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ID: {c.id}</div>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary dark:text-secondary">
                        {c.submittedby?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm">{c.submittedby}</span>
                    </div>
                  </TD>
                  <TD>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        c.resultstatus?.toLowerCase() === 'success'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : c.resultstatus?.toLowerCase() === 'running' || c.resultstatus?.toLowerCase() === 'queued'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : c.resultstatus?.toLowerCase() === 'failed' || c.resultstatus?.toLowerCase() === 'error'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {c.resultstatus?.toLowerCase() === 'success' && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      {(c.resultstatus?.toLowerCase() === 'running' || c.resultstatus?.toLowerCase() === 'queued') && (
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {(c.resultstatus?.toLowerCase() === 'failed' || c.resultstatus?.toLowerCase() === 'error') && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      {c.resultstatus || 'Unknown'}
                    </span>
                  </TD>
                  <TD>
                    <div className="flex flex-col">
                      <span className="text-sm">{getTimeAgo(c.submittedtime)}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(c.submittedtime).toLocaleDateString()}</span>
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4 flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Page <span className="font-semibold text-slate-900 dark:text-slate-100">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
