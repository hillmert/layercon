import React, { useMemo, useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { useChartTheme } from '@/hooks/useChartTheme';
import { getThemeColors } from '@/lib/chartThemes';

export interface StackedAreaPlotlyProps {
  data: Record<string, Array<{ date: string; value: number }>>;
  categories: string[];
  yAxisLabel?: string;
  xAxisLabel?: string;
  showLegend?: boolean;
  height?: number;
  theme?: 'light' | 'dark';
}

const StackedAreaPlotly: React.FC<StackedAreaPlotlyProps> = ({
  data,
  categories,
  yAxisLabel = 'Rate (bbl)',
  xAxisLabel = 'Date',
  showLegend = true,
  height = 400,
  theme: initialTheme = 'light',
}) => {
  const { theme: chartTheme } = useChartTheme();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(initialTheme);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tableData, setTableData] = useState<Array<{ layer: string; value: number; percentage: number }>>([]);

  // Detect theme changes automatically
  useEffect(() => {
    const detectTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setCurrentTheme(isDark ? 'dark' : 'light');
    };

    detectTheme();

    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Helper function to convert hex to rgba with transparency
  const hexToRgba = (hex: string, alpha: number = 0.7) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const isDark = currentTheme === 'dark';

  const traces = useMemo(() => {
    // Get colors from selected theme
    const COLORS = getThemeColors(chartTheme, 50);

    // Group data by date for each category
    const dateData: Record<string, Map<string, number>> = {};
    
    categories.forEach(cat => {
      const series = data[cat] ?? [];
      const dateMap = new Map<string, number>();
      
      series.forEach(point => {
        const date = point.date;
        const currentValue = dateMap.get(date) ?? 0;
        dateMap.set(date, currentValue + point.value);
      });
      
      dateData[cat] = dateMap;
    });

    // Get all unique dates across all categories
    const allDatesSet = new Set<string>();
    categories.forEach(cat => {
      dateData[cat].forEach((_, date) => allDatesSet.add(date));
    });
    
    const allDates = Array.from(allDatesSet).sort();

    // Calculate total sum per category for ordering (descending)
    const categorySums = categories.map(cat => ({
      category: cat,
      sum: Array.from(dateData[cat].values()).reduce((a, b) => a + b, 0)
    }));
    
    const orderedCategories = categorySums
      .sort((a, b) => b.sum - a.sum)
      .map(item => item.category);

    // Calculate percentages for each date
    const totalsPerDate = new Map<string, number>();
    allDates.forEach(date => {
      let total = 0;
      categories.forEach(cat => {
        total += dateData[cat].get(date) ?? 0;
      });
      totalsPerDate.set(date, total);
    });

    // Create traces ordered by total sum (descending)
    return orderedCategories.map((cat, i) => {
      const dateMap = dateData[cat];
      const yValues = allDates.map(date => dateMap.get(date) ?? 0);
      
      // Calculate percentages for hover
      const percentages = allDates.map(date => {
        const value = dateMap.get(date) ?? 0;
        const total = totalsPerDate.get(date) ?? 1;
        return total > 0 ? (value / total) * 100 : 0;
      });
      
      const color = COLORS[i % COLORS.length];
      const fillColorWithAlpha = hexToRgba(color, 0.65);
      const lineColorWithAlpha = hexToRgba(color, 0.9);

      return {
        x: allDates,
        y: yValues,
        type: 'scatter',
        mode: 'lines',
        name: cat,
        stackgroup: 'one',
        fillcolor: fillColorWithAlpha,
        line: {
          shape: 'linear',
          width: 2,
          color: lineColorWithAlpha,
        },
        hovertemplate: `<b>${cat}</b><br>%{y:.2f}<extra></extra>`,
      } as Partial<Plotly.PlotData>;
    });
  }, [data, categories, isDark, chartTheme]);

  const shouldShowLegend = showLegend && categories.length <= 10;

  // Handle click on chart
  const handlePlotClick = (event: any) => {
    console.log('Plot clicked:', event);
    if (event.points && event.points.length > 0) {
      const clickedDate = event.points[0].x;
      console.log('Clicked date:', clickedDate);
      setSelectedDate(clickedDate);
      
      // Get all layer values for this date
      const dateValues: Array<{ layer: string; value: number; percentage: number }> = [];
      let total = 0;
      
      // First pass: calculate total for all categories
      categories.forEach(cat => {
        const series = data[cat] ?? [];
        // Try to find exact match or closest date
        const point = series.find(p => p.date === clickedDate || new Date(p.date).toISOString().split('T')[0] === new Date(clickedDate).toISOString().split('T')[0]);
        if (point) {
          total += point.value;
        }
      });
      
      console.log('Total for date:', total);
      
      // Second pass: create table data with percentages
      categories.forEach(cat => {
        const series = data[cat] ?? [];
        const point = series.find(p => p.date === clickedDate || new Date(p.date).toISOString().split('T')[0] === new Date(clickedDate).toISOString().split('T')[0]);
        if (point) {
          dateValues.push({
            layer: cat,
            value: point.value,
            percentage: total > 0 ? (point.value / total) * 100 : 0
          });
        }
      });
      
      console.log('Date values:', dateValues);
      
      // Sort by value descending
      dateValues.sort((a, b) => b.value - a.value);
      setTableData(dateValues);
    }
  };

  return (
    <div className="flex gap-4 w-full">
      <div className={selectedDate ? "flex-1 min-w-0" : "w-full"}>
        <Plot
        data={traces}
        layout={{
          autosize: true,
          height: height,
          margin: { l: 60, r: 20, t: 20, b: shouldShowLegend ? 120 : 60 },
          showlegend: shouldShowLegend,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: {
            color: isDark ? '#e5e7eb' : '#111827',
            family: 'system-ui, -apple-system, sans-serif',
          },
          xaxis: {
            type: 'date',
            title: {
              text: xAxisLabel,
              font: { size: 12 },
            },
            showgrid: true,
            gridcolor: isDark
              ? 'rgba(148,163,184,0.2)'
              : 'rgba(148,163,184,0.3)',
            zeroline: false,
            tickfont: { size: 10 },
            color: isDark ? '#94a3b8' : '#64748b',
          },
          yaxis: {
            title: {
              text: yAxisLabel,
              font: { size: 12 },
            },
            rangemode: 'tozero',
            showgrid: true,
            gridcolor: isDark
              ? 'rgba(148,163,184,0.2)'
              : 'rgba(148,163,184,0.3)',
            zeroline: true,
            zerolinecolor: isDark
              ? 'rgba(148,163,184,0.4)'
              : 'rgba(148,163,184,0.5)',
            tickfont: { size: 10 },
            color: isDark ? '#94a3b8' : '#64748b',
          },
          legend: {
            orientation: 'h',
            y: -0.25,
            yanchor: 'top',
            x: 0.5,
            xanchor: 'center',
            bgcolor: isDark
              ? 'rgba(15,23,42,0.8)'
              : 'rgba(255,255,255,0.8)',
            bordercolor: isDark
              ? 'rgba(148,163,184,0.3)'
              : 'rgba(148,163,184,0.4)',
            borderwidth: 1,
            font: { size: 10 },
          },
          hovermode: 'closest',
          hoverlabel: {
            bgcolor: isDark
              ? 'rgba(15,23,42,0.95)'
              : 'rgba(255,255,255,0.95)',
            bordercolor: isDark
              ? 'rgba(148,163,184,0.5)'
              : 'rgba(148,163,184,0.6)',
            font: {
              color: isDark ? '#e5e7eb' : '#111827',
              size: 10,
            },
          },
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
          toImageButtonOptions: {
            format: 'png',
            filename: 'stacked_area_chart',
            height: 800,
            width: 1200,
            scale: 2,
          },
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        onClick={handlePlotClick}
      />
      </div>
      
      {/* Data Table */}
      {selectedDate && tableData.length > 0 && (
        <div 
          className="w-80 flex-shrink-0 border-l border-slate-200 dark:border-slate-700 pl-4 flex flex-col"
          style={{ height: `${height}px`, maxHeight: `${height}px` }}
        >
          <div className="mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {new Date(selectedDate).toLocaleDateString()}
              </h3>
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setTableData([]);
                }}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Total: {tableData.reduce((sum, item) => sum + item.value, 0).toFixed(2)}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-2 px-2 font-semibold text-slate-700 dark:text-slate-300">Layer</th>
                  <th className="text-right py-2 px-2 font-semibold text-slate-700 dark:text-slate-300">Value</th>
                  <th className="text-right py-2 px-2 font-semibold text-slate-700 dark:text-slate-300">%</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((item, idx) => (
                  <tr 
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-2 px-2 text-slate-900 dark:text-slate-100 font-medium">
                      {item.layer}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-700 dark:text-slate-300">
                      {item.value.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-600 dark:text-slate-400">
                      {item.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StackedAreaPlotly;
