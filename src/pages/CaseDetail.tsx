import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import StackedAreaPlotly from '@/components/ui/StackedAreaPlotly';
import Plot from 'react-plotly.js';
import { InjectorIcon, ProducerIcon, CalendarIcon, LayersIcon } from '@/components/ui/Icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import { queryDataExplorer } from '@/lib/api';
import { convertVolume, convertRate, convertGasRate, convertPressure, convertGOR, UnitSystem } from '@/lib/unitConversion';
import { useChartTheme } from '@/hooks/useChartTheme';
import { getThemeColors } from '@/lib/chartThemes';

interface CaseData {
  id: string;
  name: string;
  submittedby: string;
  resultstatus: string;
  submittedtime: string;
  caseid?: string;
}

interface ProductionData {
  caseid: string;
  Date: string;
  Identifier: string;
  Layer: string;
  Oil: number;
  Water: number;
  Gas: number;
  Liquid: number
}

interface InjectionData {
  caseid: string;
  Date: string;
  Identifier: string;
  Layer: string;
  Water: number;
  Gas: number;
}

interface PressureSaturationData {
  caseid: string;
  Date: string;
  Layer: string;
  p: number;
  sw: number;
  sg: number;
  rs: number;
}

interface CompletionData {
  caseid: string;
  Identifier: string;
  Layer: string;
  Type: string;
  LocationX: number;
  LocationY: number;
}

export default function CaseDetail() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [injectionData, setInjectionData] = useState<InjectionData[]>([]);
  const [pressureSaturationData, setPressureSaturationData] = useState<PressureSaturationData[]>([]);
  const [completionData, setCompletionData] = useState<CompletionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProduction, setLoadingProduction] = useState(false);
  const [loadingInjection, setLoadingInjection] = useState(false);
  const [loadingPressureSat, setLoadingPressureSat] = useState(false);
  const [loadingCompletion, setLoadingCompletion] = useState(false);
  const [activeTab, setActiveTab] = useState<'producers' | 'injectors' | 'pressures' | 'maps' | 'gor_wor'>('producers');
  const [selectedWell, setSelectedWell] = useState('all');
  const [selectedLayer, setSelectedLayer] = useState('all');
  const [selectedPSLayer, setSelectedPSLayer] = useState('all');
  const [selectedVariable, setSelectedVariable] = useState<'p' | 'sw' | 'sg' | 'so' | 'rs'>('p');
  const [selectedMapDate, setSelectedMapDate] = useState('');
  const [selectedMapLayer, setSelectedMapLayer] = useState('all');
  const [selectedRatioVariable, setSelectedRatioVariable] = useState<'wor' | 'gor'>('wor');
  const [selectedRatioLayer, setSelectedRatioLayer] = useState('all');
  const [selectedRatioWell, setSelectedRatioWell] = useState('all');
  const [selectedPhase, setSelectedPhase] = useState<'Oil' | 'Water' | 'Gas' | 'Liquid'>('Oil');
  const [dateRange, setDateRange] = useState<'1y' | '5y' | '10y' | '15y' | 'all'>('5y');
  const [runningSimulation, setRunningSimulation] = useState(false);
  const [unitSystem, setUnitSystem] = useState<'field' | 'si'>('field');
  const { theme: chartTheme } = useChartTheme();

  // Update default phase based on active tab
  useEffect(() => {
    if (activeTab === 'producers') {
      setSelectedPhase('Oil');
    } else if (activeTab === 'injectors') {
      setSelectedPhase('Water');
    }
  }, [activeTab]);

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        setLoadingProduction(true);
        setLoadingInjection(true);

        // Build date filter based on selected range
        const dateFilter = dateRange === 'all' 
          ? '' 
          : `AND "Date" >= CURRENT_DATE - INTERVAL '${dateRange.replace('y', ' years')}'`;

        // Fetch all data in parallel
        const [caseResult, productionResult, injectionResult, pressureSatResult, completionResult] = await Promise.all([
          // Case data query
          queryDataExplorer<CaseData[]>(`
            SELECT 
              replace(replace(displayname, 'Run Case', 'case'),' (queued)', '') as id, 
              meta->>'case_name' as name, 
              submittedby, 
              resultstatus, 
              submittedtime::DATE as submittedtime,
              name as caseid
            FROM workflowrepository 
            WHERE replace(replace(displayname, 'Run Case', 'case'),' (queued)', '') = '${id}'
            LIMIT 1
          `),
          // Production data query with date range filter
          queryDataExplorer<ProductionData[]>(`
            SELECT caseid, "Date", "Identifier", "Layer", "Oil", "Water", "Gas", "Water" + "Oil" as "Liquid"
            FROM strateon.layer_production_rates 
            WHERE caseid = '${id}' 
            ${dateFilter}
            ORDER BY "Date"
          `),
          // Injection data query with date range filter
          queryDataExplorer<InjectionData[]>(`
            SELECT caseid, "Date", "Identifier", "Layer", "Rate" as "Water", "GasRate" as "Gas" 
            FROM strateon.injection_data 
            WHERE caseid = '${id}' 
            ${dateFilter}
            ORDER BY "Date"
          `),
          // Pressure and Saturation data query with date range filter
          queryDataExplorer<PressureSaturationData[]>(`
            SELECT caseid, "Date", "Layer", p, sw, sg, 1000*rs as rs
            FROM strateon.layer_pressure_saturation 
            WHERE caseid = '${id}' 
            ${dateFilter}
            ORDER BY "Date"
          `),
          // Completion data query (locations)
          queryDataExplorer<CompletionData[]>(`
            SELECT DISTINCT caseid, "Identifier", "Layer", "Type", "LocationX", "LocationY" 
            FROM strateon.completion_data 
            WHERE caseid = '${id}'
          `)
        ]);

        // Process case data
        const caseDataArray = Array.isArray(caseResult) ? caseResult : (caseResult as any).data || [];
        if (caseDataArray.length > 0) {
          setCaseData(caseDataArray[0]);
        }

        // Process production data
        const productionDataArray = Array.isArray(productionResult) ? productionResult : (productionResult as any).data || [];
        setProductionData(productionDataArray);

        // Process injection data
        const injectionDataArray = Array.isArray(injectionResult) ? injectionResult : (injectionResult as any).data || [];
        setInjectionData(injectionDataArray);

        // Process pressure/saturation data
        const pressureSatDataArray = Array.isArray(pressureSatResult) ? pressureSatResult : (pressureSatResult as any).data || [];
        setPressureSaturationData(pressureSatDataArray);

        // Process completion data
        const completionDataArray = Array.isArray(completionResult) ? completionResult : (completionResult as any).data || [];
        setCompletionData(completionDataArray);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
        setLoadingProduction(false);
        setLoadingInjection(false);
        setLoadingPressureSat(false);
        setLoadingCompletion(false);
      }
    }
    fetchAllData();
  }, [id, dateRange]);

  // Extract unique wells and layers - memoized (MUST be before early returns)
  const wells = useMemo(() => {
    const data = activeTab === 'producers' ? productionData : injectionData;
    return ['all', ...Array.from(new Set(data.map(d => d.Identifier)))];
  }, [productionData, injectionData, activeTab]);
  
  const layersList = useMemo(() => {
    const data = activeTab === 'producers' ? productionData : injectionData;
    return ['all', ...Array.from(new Set(data.map(d => d.Layer)))];
  }, [productionData, injectionData, activeTab]);

  // Filter and aggregate data by layer - memoized (MUST be before early returns)
  const { layerData, maxValue, activeLayers } = useMemo(() => {
    // Use appropriate data based on active tab
    const sourceData = activeTab === 'producers' ? productionData : injectionData;
    
    // Filter data based on selections
    const filteredData = sourceData.filter(d => {
      if (selectedWell !== 'all' && d.Identifier !== selectedWell) return false;
      if (selectedLayer !== 'all' && d.Layer !== selectedLayer) return false;
      return true;
    });

    // Group data by layer and date
    const layerMap: Record<string, Record<string, number>> = {};
    
    filteredData.forEach(d => {
      const layer = d.Layer;
      const date = d.Date;
      // For injection, Oil doesn't exist, so it will be undefined
      let value = d[selectedPhase] || 0;
      
      // Apply unit conversion if needed
      if (unitSystem === 'si') {
        if (selectedPhase === 'Gas') {
          value = convertGasRate(value, 'field', 'si');
        } else {
          value = convertRate(value, 'field', 'si');
        }
      }
      
      if (!layerMap[layer]) {
        layerMap[layer] = {};
      }
      if (!layerMap[layer][date]) {
        layerMap[layer][date] = 0;
      }
      layerMap[layer][date] += value;
    });

    // Convert to array format for each layer
    const layerDataMap: Record<string, Array<{ date: string; value: number }>> = {};
    const layers = Object.keys(layerMap).sort();
    
    layers.forEach(layer => {
      layerDataMap[layer] = Object.entries(layerMap[layer])
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    // Sample data if too many points (keep max 500 points for performance)
    if (layers.length > 0) {
      const firstLayer = layerDataMap[layers[0]];
      if (firstLayer && firstLayer.length > 500) {
        const step = Math.ceil(firstLayer.length / 500);
        layers.forEach(layer => {
          layerDataMap[layer] = layerDataMap[layer].filter((_, i) => i % step === 0);
        });
      }
    }

    // Calculate max cumulative value for chart scaling
    let max = 1;
    if (layers.length > 0) {
      // Get all unique dates
      const allDates = new Set<string>();
      layers.forEach(layer => {
        layerDataMap[layer].forEach(d => allDates.add(d.date));
      });
      
      // For each date, sum all layer values
      allDates.forEach(date => {
        let sum = 0;
        layers.forEach(layer => {
          const dataPoint = layerDataMap[layer].find(d => d.date === date);
          sum += dataPoint?.value || 0;
        });
        max = Math.max(max, sum);
      });
    }

    return { layerData: layerDataMap, maxValue: max, activeLayers: layers };
  }, [productionData, injectionData, activeTab, selectedWell, selectedLayer, selectedPhase, unitSystem]);

  // Calculate real stats from data
  const injectors = useMemo(() => {
    return new Set(injectionData.map(d => d.Identifier)).size;
  }, [injectionData]);
  
  const producers = useMemo(() => {
    return new Set(productionData.map(d => d.Identifier)).size;
  }, [productionData]);
  
  const months = activeLayers.length > 0 ? (layerData[activeLayers[0]]?.length || 36) : 36;
  const layers = layersList.length - 1 || 5;

  // Early returns AFTER all hooks
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-secondary mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading case data...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  if (!caseData) return <p className="text-center text-slate-600 dark:text-slate-400">{t('caseDetail.notFound')}</p>;

  return (
    <div className="space-y-6">
      {/* Header with simulation name and actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{caseData.name}</h1>
        <div className="flex gap-2">
          <Button 
            variant="secondary"
            onClick={() => {
              setRunningSimulation(true);
              // TODO: Execute workflow here
              setTimeout(() => setRunningSimulation(false), 2000);
            }}
            disabled={runningSimulation}
          >
            {runningSimulation ? 'Running...' : 'Run Simulation'}
          </Button>
          <Button variant="secondary">View Inputs</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <InjectorIcon className="w-8 h-8 text-primary dark:text-secondary" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('caseDetail.injectors')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{injectors}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <ProducerIcon className="w-8 h-8 text-primary dark:text-secondary" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('caseDetail.producers')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{producers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <CalendarIcon className="w-8 h-8 text-primary dark:text-secondary" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('caseDetail.months')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{months}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <LayersIcon className="w-8 h-8 text-primary dark:text-secondary" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('caseDetail.layers')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{layers}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('producers')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'producers'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ProducerIcon className="w-5 h-5" />
              <span>Producers</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('injectors')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'injectors'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <InjectorIcon className="w-5 h-5" />
              <span>Injectors</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('pressures')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'pressures'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Layer Properties</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('maps')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'maps'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>Maps</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('gor_wor')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'gor_wor'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <span>GOR & WOR</span>
            </div>
          </button>
        </div>
      </Card>

      {/* Tab Content */}
      <Card className="p-6">
        {/* Date Range Selector and Unit System */}
        <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Date Range
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: '1y', label: '1 Year' },
                  { value: '5y', label: '5 Years' },
                  { value: '10y', label: '10 Years' },
                  { value: '15y', label: '15 Years' },
                  { value: 'all', label: 'All Time' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setDateRange(option.value as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      dateRange === option.value
                        ? 'bg-primary dark:bg-secondary text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="ml-6">
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Units
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setUnitSystem('field')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    unitSystem === 'field'
                      ? 'bg-primary dark:bg-secondary text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Field Units
                </button>
                <button
                  onClick={() => setUnitSystem('si')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    unitSystem === 'si'
                      ? 'bg-primary dark:bg-secondary text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  SI Units
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters for Producers/Injectors */}
        {(activeTab === 'producers' || activeTab === 'injectors') && (
          <div className="flex gap-4 mb-6 flex-wrap">
            <Select
              label={t('caseDetail.filterByPhase')}
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value as 'Oil' | 'Water' | 'Gas'| 'Liquid')}
              className="w-40"
            >
              {activeTab === 'producers' && <option value="Oil">{t('caseDetail.oil')}</option>}
              <option value="Water">{t('caseDetail.water')}</option>
              <option value="Gas">{t('caseDetail.gas')}</option>
              <option value="Liquid">{t('caseDetail.liquid')}</option>
            </Select>
            <Select
              label={t('caseDetail.filterByWell')}
              value={selectedWell}
              onChange={(e) => setSelectedWell(e.target.value)}
              className="w-48"
            >
              <option value="all">{t('caseDetail.allWells')}</option>
              {wells.slice(1).map(well => (
                <option key={well} value={well}>{well}</option>
              ))}
            </Select>
            <Select
              label={t('caseDetail.filterByLayer')}
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              className="w-48"
            >
              <option value="all">{t('caseDetail.allLayers')}</option>
              {layersList.slice(1).map(layer => (
                <option key={layer} value={layer}>{layer}</option>
              ))}
            </Select>
          </div>
        )}

        {/* Filters for Pressures & Saturations */}
        {activeTab === 'pressures' && (
          <div className="flex gap-4 mb-6 flex-wrap">
            <Select
              label="Variable"
              value={selectedVariable}
              onChange={(e) => setSelectedVariable(e.target.value as 'p' | 'sw' | 'sg' | 'so' | 'rs')}
              className="w-48"
            >
              <option value="p">Layer Pressure ({unitSystem === 'field' ? 'psia' : 'kPa'})</option>
              <option value="sw">Water Saturation (-)</option>
              <option value="sg">Gas Saturation (-)</option>
              <option value="so">Oil Saturation (-)</option>
              <option value="rs">Solution Gas-Oil Ratio ({unitSystem === 'field' ? 'scf/bbl' : 'm³/m³'})</option>
            </Select>
            <Select
              label="Layer"
              value={selectedPSLayer}
              onChange={(e) => setSelectedPSLayer(e.target.value)}
              className="w-48"
            >
              <option value="all">All Layers</option>
              {Array.from(new Set(pressureSaturationData.map(d => d.Layer))).sort().map(layer => (
                <option key={layer} value={layer}>{layer}</option>
              ))}
            </Select>
          </div>
        )}

        {/* Filters for Maps */}
        {activeTab === 'maps' && (
          <div className="flex gap-4 mb-6 flex-wrap">
            <Select
              label="Date"
              value={selectedMapDate}
              onChange={(e) => setSelectedMapDate(e.target.value)}
              className="w-48"
            >
              <option value="">Select Date</option>
              {Array.from(new Set(productionData.map(d => d.Date))).sort().map(date => (
                <option key={date} value={date}>{new Date(date).toLocaleDateString()}</option>
              ))}
            </Select>
            <Select
              label="Layer"
              value={selectedMapLayer}
              onChange={(e) => setSelectedMapLayer(e.target.value)}
              className="w-48"
            >
              <option value="all">All Layers</option>
              {Array.from(new Set(completionData.map(d => d.Layer))).sort().map(layer => (
                <option key={layer} value={layer}>{layer}</option>
              ))}
            </Select>
          </div>
        )}

        {/* Filters for GOR & WOR */}
        {activeTab === 'gor_wor' && (
          <div className="flex gap-4 mb-6 flex-wrap">
            <Select
              label="Variable"
              value={selectedRatioVariable}
              onChange={(e) => setSelectedRatioVariable(e.target.value as 'wor' | 'gor')}
              className="w-48"
            >
              <option value="wor">WOR (Water/Oil Ratio)</option>
              <option value="gor">GOR (Gas/Oil Ratio)</option>
            </Select>
            <Select
              label="Layer"
              value={selectedRatioLayer}
              onChange={(e) => setSelectedRatioLayer(e.target.value)}
              className="w-48"
            >
              <option value="all">All Layers</option>
              {Array.from(new Set(productionData.map(d => d.Layer))).sort().map(layer => (
                <option key={layer} value={layer}>{layer}</option>
              ))}
            </Select>
            <Select
              label="Well"
              value={selectedRatioWell}
              onChange={(e) => setSelectedRatioWell(e.target.value)}
              className="w-48"
            >
              <option value="all">All Wells</option>
              {Array.from(new Set(productionData.map(d => d.Identifier))).sort().map(well => (
                <option key={well} value={well}>{well}</option>
              ))}
            </Select>
          </div>
        )}

        {/* Chart for Producers/Injectors */}
        {(activeTab === 'producers' || activeTab === 'injectors') && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              {activeTab === 'producers' ? t('caseDetail.volumeVsTime') : 'Injection Rate vs Time'} - {t(`caseDetail.${selectedPhase.toLowerCase()}`)} (Stacked by Layer)
            </h3>
            {(loadingProduction || loadingInjection) ? (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 h-96 flex items-center justify-center">
                <p className="text-slate-600 dark:text-slate-400">
                  {activeTab === 'producers' ? 'Loading production data...' : 'Loading injection data...'}
                </p>
              </div>
            ) : activeLayers.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 h-96 flex items-center justify-center">
                <p className="text-slate-600 dark:text-slate-400">
                  {activeTab === 'producers' ? 'No production data available' : 'No injection data available'}
                </p>
              </div>
            ) : (
              <StackedAreaPlotly 
                data={layerData} 
                categories={activeLayers}
                yAxisLabel={
                  unitSystem === 'field'
                    ? `${activeTab === 'producers' ? 'Volume' : 'Rate'} (${selectedPhase === 'Gas' ? 'Mscf' : 'bbl'})`
                    : `${activeTab === 'producers' ? 'Volume' : 'Rate'} (${selectedPhase === 'Gas' ? 'm³' : 'm³'})`
                }
                xAxisLabel="Date"
                showLegend={true}
                theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
              />
            )}
            <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
              {activeTab === 'producers' && `${t('caseDetail.producerWells')} - `}
              {activeTab === 'injectors' && `${t('caseDetail.injectorWells')} - `}
              {selectedWell !== 'all' ? selectedWell : t('caseDetail.allWells')} / {selectedLayer !== 'all' ? selectedLayer : t('caseDetail.allLayers')}
              {activeLayers.length > 0 && ` (${activeLayers.length} layers)`}
            </div>
          </div>
        )}

        {/* Chart for Pressures & Saturations */}
        {activeTab === 'pressures' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              {selectedVariable === 'p' && `Layer Pressure (${unitSystem === 'field' ? 'psia' : 'kPa'})`}
              {selectedVariable === 'sw' && 'Water Saturation (-)'}
              {selectedVariable === 'sg' && 'Gas Saturation (-)'}
              {selectedVariable === 'so' && 'Oil Saturation (-)'}
              {selectedVariable === 'rs' && `Solution Gas-Oil Ratio (${unitSystem === 'field' ? 'scf/bbl' : 'm³/m³'})`}
              {' vs Time'}
            </h3>
            {loadingPressureSat ? (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 h-96 flex items-center justify-center">
                <p className="text-slate-600 dark:text-slate-400">Loading pressure/saturation data...</p>
              </div>
            ) : pressureSaturationData.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 h-96 flex items-center justify-center">
                <p className="text-slate-600 dark:text-slate-400">No pressure/saturation data available</p>
              </div>
            ) : (
              <Plot
                data={(() => {
                  // Filter by selected layer
                  const filteredData = selectedPSLayer === 'all' 
                    ? pressureSaturationData 
                    : pressureSaturationData.filter(d => d.Layer === selectedPSLayer);
                  
                  // Group by layer
                  const layerGroups = new Map<string, typeof filteredData>();
                  filteredData.forEach(d => {
                    if (!layerGroups.has(d.Layer)) {
                      layerGroups.set(d.Layer, []);
                    }
                    layerGroups.get(d.Layer)!.push(d);
                  });
                  
                  // Calculate SO (oil saturation) = 1 - SW - SG
                  const getValue = (d: PressureSaturationData) => {
                    let value: number;
                    if (selectedVariable === 'so') {
                      value = 1 - d.sw - d.sg;
                    } else {
                      value = d[selectedVariable];
                    }
                    
                    // Apply unit conversion if needed
                    if (unitSystem === 'si') {
                      if (selectedVariable === 'p') {
                        value = convertPressure(value, 'field', 'si');
                      } else if (selectedVariable === 'rs') {
                        value = convertGOR(value, 'field', 'si');
                      }
                    }
                    
                    return value;
                  };
                  
                  // Create traces for each layer
                  const themeColors = getThemeColors(chartTheme, 20);
                  return Array.from(layerGroups.entries()).map(([layer, data], i) => ({
                    x: data.map(d => d.Date),
                    y: data.map(d => getValue(d)),
                    type: 'scatter',
                    mode: 'lines',
                    name: layer,
                    line: {
                      width: 2,
                      color: themeColors[i % themeColors.length]
                    },
                    hovertemplate: `<b>${layer}</b><br>%{y:.2f}<extra></extra>`,
                  }));
                })()}
                layout={{
                  autosize: true,
                  height: 500,
                  margin: { l: 60, r: 20, t: 20, b: 60 },
                  showlegend: true,
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  font: {
                    color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#111827',
                    family: 'system-ui, -apple-system, sans-serif',
                  },
                  xaxis: {
                    type: 'date',
                    title: { text: 'Date', font: { size: 12 } },
                    showgrid: true,
                    gridcolor: document.documentElement.classList.contains('dark') ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.3)',
                    zeroline: false,
                    tickfont: { size: 10 },
                    color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b',
                  },
                  yaxis: {
                    title: {
                      text: selectedVariable === 'p' 
                        ? `Pressure (${unitSystem === 'field' ? 'psia' : 'kPa'})`
                        : selectedVariable === 'rs' 
                        ? `Solution Gas-Oil Ratio (${unitSystem === 'field' ? 'scf/bbl' : 'm³/m³'})`
                        : 'Saturation (-)',
                      font: { size: 12 }
                    },
                    showgrid: true,
                    gridcolor: document.documentElement.classList.contains('dark') ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.3)',
                    zeroline: true,
                    zerolinecolor: document.documentElement.classList.contains('dark') ? 'rgba(148,163,184,0.4)' : 'rgba(148,163,184,0.5)',
                    tickfont: { size: 10 },
                    color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b',
                  },
                  legend: {
                    orientation: 'v',
                    y: 1,
                    x: 1.02,
                    xanchor: 'left',
                    bgcolor: document.documentElement.classList.contains('dark') ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.8)',
                    bordercolor: document.documentElement.classList.contains('dark') ? 'rgba(148,163,184,0.3)' : 'rgba(148,163,184,0.4)',
                    borderwidth: 1,
                    font: { size: 10 },
                  },
                  hovermode: 'closest',
                }}
                config={{
                  responsive: true,
                  displayModeBar: true,
                  displaylogo: false,
                  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                }}
                style={{ width: '100%', height: '500px' }}
                useResizeHandler={true}
              />
            )}
          </div>
        )}

        {/* Bubble Map */}
        {activeTab === 'maps' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Well Locations Map
            </h3>
            {loadingCompletion ? (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 h-96 flex items-center justify-center">
                <p className="text-slate-600 dark:text-slate-400">Loading map data...</p>
              </div>
            ) : completionData.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 h-96 flex items-center justify-center">
                <p className="text-slate-600 dark:text-slate-400">No location data available</p>
              </div>
            ) : !selectedMapDate ? (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 h-96 flex items-center justify-center">
                <p className="text-slate-600 dark:text-slate-400">Please select a date to view the map</p>
              </div>
            ) : (
              <Plot
                data={(() => {
                  // Filter completion data by layer
                  const filteredCompletions = selectedMapLayer === 'all'
                    ? completionData
                    : completionData.filter(d => d.Layer === selectedMapLayer);

                  // Get production/injection data for the selected date
                  const dateProductionData = productionData.filter(d => d.Date === selectedMapDate);
                  const dateInjectionData = injectionData.filter(d => d.Date === selectedMapDate);

                  // Group by type
                  const producers = filteredCompletions.filter(d => d.Type.toLowerCase().includes('producer'));
                  const injectors = filteredCompletions.filter(d => d.Type.toLowerCase().includes('injector'));

                  // Calculate bubble sizes for producers
                  const producerSizes = producers.map(well => {
                    const prodData = dateProductionData.find(p => p.Identifier === well.Identifier && p.Layer === well.Layer);
                    return prodData ? (prodData.Oil + prodData.Water + prodData.Gas) : 1;
                  });

                  // Calculate bubble sizes for injectors
                  const injectorSizes = injectors.map(well => {
                    const injData = dateInjectionData.find(i => i.Identifier === well.Identifier && i.Layer === well.Layer);
                    return injData ? (injData.Water + injData.Gas) : 1;
                  });

                  return [
                    // Producers trace
                    {
                      x: producers.map(d => d.LocationX),
                      y: producers.map(d => d.LocationY),
                      mode: 'markers',
                      type: 'scatter',
                      name: 'Producers',
                      marker: {
                        size: producerSizes.map(s => Math.max(5, Math.min(50, s / 10))),
                        color: '#10b981',
                        opacity: 0.7,
                        line: {
                          color: '#059669',
                          width: 2
                        }
                      },
                      text: producers.map((d, i) => `${d.Identifier}<br>Layer: ${d.Layer}<br>Production: ${producerSizes[i].toFixed(2)}`),
                      hovertemplate: '<b>%{text}</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<extra></extra>',
                    },
                    // Injectors trace
                    {
                      x: injectors.map(d => d.LocationX),
                      y: injectors.map(d => d.LocationY),
                      mode: 'markers',
                      type: 'scatter',
                      name: 'Injectors',
                      marker: {
                        size: injectorSizes.map(s => Math.max(5, Math.min(50, s / 10))),
                        color: '#3b82f6',
                        opacity: 0.7,
                        line: {
                          color: '#2563eb',
                          width: 2
                        }
                      },
                      text: injectors.map((d, i) => `${d.Identifier}<br>Layer: ${d.Layer}<br>Injection: ${injectorSizes[i].toFixed(2)}`),
                      hovertemplate: '<b>%{text}</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<extra></extra>',
                    }
                  ];
                })()}
                layout={{
                  autosize: true,
                  height: 600,
                  margin: { l: 60, r: 60, t: 20, b: 60 },
                  showlegend: true,
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: document.documentElement.classList.contains('dark') ? 'rgba(15,23,42,0.5)' : 'rgba(248,250,252,1)',
                  font: {
                    color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#111827',
                    family: 'system-ui, -apple-system, sans-serif',
                  },
                  xaxis: {
                    title: { text: 'Location X (ft)', font: { size: 12 } },
                    showgrid: true,
                    gridcolor: document.documentElement.classList.contains('dark') ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.3)',
                    zeroline: true,
                    zerolinecolor: document.documentElement.classList.contains('dark') ? 'rgba(148,163,184,0.4)' : 'rgba(148,163,184,0.5)',
                    tickfont: { size: 10 },
                    color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b',
                  },
                  yaxis: {
                    title: { text: 'Location Y (ft)', font: { size: 12 } },
                    showgrid: true,
                    gridcolor: document.documentElement.classList.contains('dark') ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.3)',
                    zeroline: true,
                    zerolinecolor: document.documentElement.classList.contains('dark') ? 'rgba(148,163,184,0.4)' : 'rgba(148,163,184,0.5)',
                    tickfont: { size: 10 },
                    color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b',
                    scaleanchor: 'x',
                    scaleratio: 1,
                  },
                  legend: {
                    orientation: 'h',
                    y: -0.15,
                    x: 0.5,
                    xanchor: 'center',
                    bgcolor: document.documentElement.classList.contains('dark') ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.8)',
                    bordercolor: document.documentElement.classList.contains('dark') ? 'rgba(148,163,184,0.3)' : 'rgba(148,163,184,0.4)',
                    borderwidth: 1,
                    font: { size: 10 },
                  },
                  hovermode: 'closest',
                }}
                config={{
                  responsive: true,
                  displayModeBar: true,
                  displaylogo: false,
                  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                }}
                style={{ width: '100%', height: '600px' }}
                useResizeHandler={true}
              />
            )}
            <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
              {selectedMapDate && `Date: ${new Date(selectedMapDate).toLocaleDateString()}`}
              {selectedMapLayer !== 'all' && ` | Layer: ${selectedMapLayer}`}
              {selectedMapDate && ` | Bubble size represents production/injection rate`}
            </div>
          </div>
        )}

        {/* GOR & WOR Chart */}
        {activeTab === 'gor_wor' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              {selectedRatioVariable === 'wor' ? 'Water-Oil Ratio (WOR)' : 'Gas-Oil Ratio (GOR)'} vs Time
            </h3>
            {loadingProduction ? (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 h-96 flex items-center justify-center">
                <p className="text-slate-600 dark:text-slate-400">Loading production data...</p>
              </div>
            ) : productionData.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 h-96 flex items-center justify-center">
                <p className="text-slate-600 dark:text-slate-400">No production data available</p>
              </div>
            ) : (
              <Plot
                data={(() => {
                  // Filter production data
                  let filteredData = productionData;
                  if (selectedRatioLayer !== 'all') {
                    filteredData = filteredData.filter(d => d.Layer === selectedRatioLayer);
                  }
                  if (selectedRatioWell !== 'all') {
                    filteredData = filteredData.filter(d => d.Identifier === selectedRatioWell);
                  }

                  // Group by layer only
                  const layerGroups = new Map<string, typeof filteredData>();
                  filteredData.forEach(d => {
                    if (!layerGroups.has(d.Layer)) {
                      layerGroups.set(d.Layer, []);
                    }
                    layerGroups.get(d.Layer)!.push(d);
                  });

                  // Create traces for each layer
                  const themeColors = getThemeColors(chartTheme, 20);
                  return Array.from(layerGroups.entries()).map(([layer, data], i) => {
                    // Group by date and sum all wells in this layer
                    const dateMap = new Map<string, { water: number; oil: number; gas: number }>();
                    data.forEach(d => {
                      if (!dateMap.has(d.Date)) {
                        dateMap.set(d.Date, { water: 0, oil: 0, gas: 0 });
                      }
                      const current = dateMap.get(d.Date)!;
                      current.water += d.Water;
                      current.oil += d.Oil;
                      current.gas += d.Gas;
                    });

                    // Sort by date and calculate ratios
                    const sortedDates = Array.from(dateMap.keys()).sort();
                    const ratios = sortedDates.map(date => {
                      const values = dateMap.get(date)!;
                      if (selectedRatioVariable === 'wor') {
                        return values.oil > 0 ? values.water / values.oil : 0;
                      } else {
                        return values.oil > 0 ? values.gas / values.oil : 0;
                      }
                    });

                    return {
                      x: sortedDates,
                      y: ratios,
                      type: 'scatter',
                      mode: 'lines',
                      name: layer,
                      line: {
                        width: 2,
                        color: themeColors[i % themeColors.length]
                      },
                      hovertemplate: `<b>${layer}</b><br>%{y:.2f}<extra></extra>`,
                    };
                  });
                })()}
                layout={{
                  autosize: true,
                  height: 500,
                  margin: { l: 60, r: 20, t: 20, b: 60 },
                  showlegend: (() => {
                    // Count unique layers - same logic as area plots
                    let filteredData = productionData;
                    if (selectedRatioLayer !== 'all') {
                      filteredData = filteredData.filter(d => d.Layer === selectedRatioLayer);
                    }
                    if (selectedRatioWell !== 'all') {
                      filteredData = filteredData.filter(d => d.Identifier === selectedRatioWell);
                    }
                    const uniqueLayers = new Set(filteredData.map(d => d.Layer));
                    return uniqueLayers.size <= 10;
                  })(),
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  font: {
                    color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#111827',
                    family: 'system-ui, -apple-system, sans-serif',
                  },
                  xaxis: {
                    type: 'date',
                    title: { text: 'Date', font: { size: 12 } },
                    showgrid: true,
                    gridcolor: document.documentElement.classList.contains('dark') ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.3)',
                    zeroline: false,
                    tickfont: { size: 10 },
                    color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b',
                  },
                  yaxis: {
                    title: {
                      text: selectedRatioVariable === 'wor' ? 'WOR (Water/Oil)' : 'GOR (Gas/Oil)',
                      font: { size: 12 }
                    },
                    showgrid: true,
                    gridcolor: document.documentElement.classList.contains('dark') ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.3)',
                    zeroline: true,
                    zerolinecolor: document.documentElement.classList.contains('dark') ? 'rgba(148,163,184,0.4)' : 'rgba(148,163,184,0.5)',
                    tickfont: { size: 10 },
                    color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b',
                  },
                  legend: {
                    orientation: 'v',
                    y: 1,
                    x: 1.02,
                    xanchor: 'left',
                    bgcolor: document.documentElement.classList.contains('dark') ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.8)',
                    bordercolor: document.documentElement.classList.contains('dark') ? 'rgba(148,163,184,0.3)' : 'rgba(148,163,184,0.4)',
                    borderwidth: 1,
                    font: { size: 10 },
                  },
                  hovermode: 'closest',
                }}
                config={{
                  responsive: true,
                  displayModeBar: true,
                  displaylogo: false,
                  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                }}
                style={{ width: '100%', height: '500px' }}
                useResizeHandler={true}
              />
            )}
            <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
              {selectedRatioVariable === 'wor' && 'WOR = Water Rate / Oil Rate'}
              {selectedRatioVariable === 'gor' && 'GOR = Gas Rate / Oil Rate'}
              {selectedRatioWell !== 'all' && ` | Well: ${selectedRatioWell}`}
              {selectedRatioLayer !== 'all' && ` | Layer: ${selectedRatioLayer}`}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}