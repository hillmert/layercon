import { useMemo, useState } from 'react';

function movingAverage(
  series: Array<number | undefined>,
  window: number
): Array<number | undefined> {
  if (window <= 1) return series;

  const half = Math.floor(window / 2);
  const smoothed: Array<number | undefined> = [];

  for (let i = 0; i < series.length; i++) {
    const original = series[i];

    let hasZero = false;
    let sum = 0;
    let count = 0;

    for (let j = i - half; j <= i + half; j++) {
      if (j < 0 || j >= series.length) continue;
      const v = series[j];

      if (v !== undefined && !Number.isNaN(v)) {
        if (v === 0) {
          hasZero = true;
        } else {
          sum += v;
          count++;
        }
      }
    }

    // Regla clave:
    //  - Si en la ventana hay algún cero -> NO suavizamos: devolvemos el valor original.
    //    (para que no haya interpolación entre ceros y valores)
    if (hasZero) {
      smoothed.push(original);
      continue;
    }

    // Si no hay ceros en la ventana, sí suavizamos normalmente
    if (count > 0) {
      smoothed.push(sum / count);
    } else {
      // si la ventana está vacía (todo undefined), dejamos lo que hubiera
      smoothed.push(original);
    }
  }

  return smoothed;
}


export interface StackedAreaChartProps {
  data: Record<string, Array<{ date: string; value: number }>>;
  categories: string[];
  maxValue?: number;
  yAxisLabel?: string;
  xAxisLabel?: string;
  colors?: string[];
  height?: string;
  showLegend?: boolean;
  dateFormat?: Intl.DateTimeFormatOptions;
  smoothingWindow?: number; // e.g. 7 = ~semana, 1 = sin suavizado
}

const DEFAULT_COLORS = [
  'rgba(59, 130, 246, 0.7)',
  'rgba(16, 185, 129, 0.7)',
  'rgba(245, 158, 11, 0.7)',
  'rgba(239, 68, 68, 0.7)',
  'rgba(168, 85, 247, 0.7)',
  'rgba(236, 72, 153, 0.7)',
  'rgba(20, 184, 166, 0.7)',
  'rgba(251, 146, 60, 0.7)',
  'rgba(99, 102, 241, 0.7)',
  'rgba(14, 165, 233, 0.7)',
  'rgba(34, 197, 94, 0.7)',
  'rgba(132, 204, 22, 0.7)',
  'rgba(234, 179, 8, 0.7)',
  'rgba(249, 115, 22, 0.7)',
  'rgba(244, 63, 94, 0.7)',
  'rgba(219, 39, 119, 0.7)',
  'rgba(147, 51, 234, 0.7)',
  'rgba(124, 58, 237, 0.7)',
  'rgba(79, 70, 229, 0.7)',
  'rgba(37, 99, 235, 0.7)',
  'rgba(3, 105, 161, 0.7)',
  'rgba(13, 148, 136, 0.7)',
  'rgba(5, 150, 105, 0.7)',
  'rgba(22, 163, 74, 0.7)',
  'rgba(101, 163, 13, 0.7)',
  'rgba(202, 138, 4, 0.7)',
  'rgba(217, 119, 6, 0.7)',
  'rgba(194, 65, 12, 0.7)',
  'rgba(220, 38, 38, 0.7)',
  'rgba(190, 18, 60, 0.7)',
  'rgba(157, 23, 77, 0.7)',
  'rgba(126, 34, 206, 0.7)',
  'rgba(88, 28, 135, 0.7)',
  'rgba(67, 56, 202, 0.7)',
  'rgba(30, 64, 175, 0.7)',
  'rgba(12, 74, 110, 0.7)',
  'rgba(6, 78, 59, 0.7)',
  'rgba(20, 83, 45, 0.7)',
  'rgba(77, 124, 15, 0.7)',
  'rgba(161, 98, 7, 0.7)',
];

export default function StackedAreaChart({
  data,
  categories,
  maxValue: providedMaxValue,
  yAxisLabel = 'Value',
  xAxisLabel = 'Date',
  colors = DEFAULT_COLORS,
  height = 'h-96',
  showLegend = true,
  dateFormat = { year: 'numeric' }, // para largos periodos, tipo Plotly
  smoothingWindow = 7,
}: StackedAreaChartProps) {
  const { stackedAreas, allDates, calculatedMaxValue, dataPoints } = useMemo(() => {
    if (categories.length === 0) {
      return { stackedAreas: [], allDates: [], calculatedMaxValue: 1, dataPoints: [] };
    }

    // 1) timestamps de todos los puntos
    const allTimestamps: number[] = [];
    Object.values(data).forEach(series => {
      series.forEach(d => allTimestamps.push(new Date(d.date).getTime()));
    });

    if (!allTimestamps.length) {
      return { stackedAreas: [], allDates: [], calculatedMaxValue: 1, dataPoints: [] };
    }

    const firstTime = Math.min(...allTimestamps);
    const lastTime = Math.max(...allTimestamps);
    const timeRange = Math.max(1, lastTime - firstTime);

    // 2) fechas únicas (solo donde hay datos)
    const dateSet = new Set<string>();
    Object.values(data).forEach(series => {
      series.forEach(d => dateSet.add(d.date));
    });

    const dates = Array.from(dateSet).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    // 3) mapa categoría → valores por fecha
    let categoryMaps = categories.map(category => {
      const dataMap = new Map(data[category]?.map(d => [d.date, d.value]) || []);
      return dates.map(date => dataMap.get(date)); // undefined si no hay dato
    });

    // 4) suavizado opcional
    if (smoothingWindow && smoothingWindow > 1) {
      categoryMaps = categoryMaps.map(series => movingAverage(series, smoothingWindow));
    }

    // 5) acumulado por fecha (stack)
    const cumulativeData = dates.map((_, dateIdx) => {
      const layerValues: number[] = [];
      let cumulative = 0;

      categories.forEach((_, categoryIdx) => {
        const value = categoryMaps[categoryIdx][dateIdx];
        if (value !== undefined) {
          cumulative += value;
        }
        layerValues.push(cumulative);
      });

      return layerValues;
    });

    // 6) max "real" y max "bonito" de eje Y
    let rawMax = providedMaxValue || 1;
    if (!providedMaxValue) {
      dates.forEach((_, dateIdx) => {
        const sum = cumulativeData[dateIdx][categories.length - 1];
        rawMax = Math.max(rawMax, sum);
      });
    }

    const axisMax = (() => {
      if (rawMax <= 0 || !isFinite(rawMax)) return 1;
      const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
      const leading = rawMax / magnitude;
      let niceLeading;
      if (leading <= 1) niceLeading = 1;
      else if (leading <= 2) niceLeading = 2;
      else if (leading <= 5) niceLeading = 5;
      else niceLeading = 10;
      return niceLeading * magnitude;
    })();

    const drawingMax = axisMax * 1.05;

    // 7) paths y puntos para tooltip
    const points: Array<{
      x: number;
      y: number;
      date: string;
      category: string;
      value: number;
      cumulativeValue: number;
      categoryIdx: number;
    }> = [];

    const clampY = (y: number) => Math.max(0, Math.min(300, y));

    const areas = categories.map((category, categoryIdx) => {
      const topPath: string[] = [];
      const bottomPath: string[] = [];
      let hasAnyData = false;
      let started = false;

      dates.forEach((date, dateIdx) => {
        const value = categoryMaps[categoryIdx][dateIdx];

        // posición X proporcional al tiempo (como Plotly)
        const dateTime = new Date(date).getTime();
        const x = ((dateTime - firstTime) / timeRange) * 1000;

        const topValue = cumulativeData[dateIdx][categoryIdx];
        const bottomValue =
          categoryIdx > 0 ? cumulativeData[dateIdx][categoryIdx - 1] : 0;

        const topY = clampY(
          300 - (drawingMax > 0 ? (topValue / drawingMax) * 300 : 0)
        );
        const bottomY = clampY(
          300 - (drawingMax > 0 ? (bottomValue / drawingMax) * 300 : 0)
        );

        if (value !== undefined) {
          hasAnyData = true;
          started = true;

          points.push({
            x,
            y: topY,
            date,
            category,
            value,
            cumulativeValue: topValue,
            categoryIdx,
          });
        }

        if (started) {
          topPath.push(`${topPath.length === 0 ? 'M' : 'L'} ${x} ${topY}`);
          bottomPath.unshift(`L ${x} ${bottomY}`);
        }
      });

      const areaPath =
        hasAnyData && topPath.length > 0
          ? `${topPath.join(' ')} ${bottomPath.join(' ')} Z`
          : '';

      return { category, path: areaPath };
    });

    return {
      stackedAreas: areas,
      allDates: dates,
      calculatedMaxValue: axisMax,
      dataPoints: points,
    };
  }, [data, categories, providedMaxValue, smoothingWindow]);

  const maxValue = providedMaxValue || calculatedMaxValue;

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    date: string;
    category: string;
    value: number;
    cumulativeValue: number;
  } | null>(null);

  const shouldShowLegend = showLegend && categories.length <= 10;

  const yAxisLabels = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
    const value = maxValue * (1 - ratio);
    return value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toFixed(0);
  });

  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 relative">
      <div className={`flex gap-4 ${height}`}>
        {/* Eje Y: nombre + labels */}
        <div className="flex items-stretch h-full">
          <div className="flex items-center justify-center pr-2 h-full">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 transform -rotate-90 whitespace-nowrap">
              {yAxisLabel}
            </span>
          </div>
          <div className="flex flex-col justify-between py-2 text-xs text-slate-600 dark:text-slate-400 font-mono min-w-[3.5rem]">
            {yAxisLabels.map((label, i) => (
              <span key={i} className="text-right w-full">
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Chart + eje X */}
        <div className="flex-1 flex flex-col">
          <div className="relative flex-1 overflow-hidden">
            <svg
              className="w-full h-full"
              viewBox="0 0 1000 300"
              preserveAspectRatio="none"
              onMouseLeave={() => setTooltip(null)}
            >
              {/* grid */}
              <line x1="0" y1="0" x2="1000" y2="0" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-600" />
              <line x1="0" y1="75" x2="1000" y2="75" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-600" strokeDasharray="5,5" />
              <line x1="0" y1="150" x2="1000" y2="150" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-600" strokeDasharray="5,5" />
              <line x1="0" y1="225" x2="1000" y2="225" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-600" strokeDasharray="5,5" />
              <line x1="0" y1="300" x2="1000" y2="300" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-600" />

              {/* áreas apiladas */}
              {[...stackedAreas].reverse().map((area, idx) => {
                const originalIdx = stackedAreas.length - 1 - idx;
                return (
                  <path
                    key={area.category}
                    d={area.path}
                    fill={colors[originalIdx % colors.length]}
                    stroke={colors[originalIdx % colors.length]}
                    strokeWidth="0.3"
                    className="transition-opacity hover:opacity-90 cursor-pointer"
                    onMouseMove={(e) => {
                      const svg = e.currentTarget.ownerSVGElement;
                      if (!svg) return;
                      const rect = svg.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 1000;

                      const candidates = dataPoints.filter(
                        (p) => p.category === area.category
                      );
                      if (!candidates.length) return;

                      const closest = candidates.reduce((prev, curr) =>
                        Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev
                      );

                      setTooltip({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                        date: closest.date,
                        category: closest.category,
                        value: closest.value,
                        cumulativeValue: closest.cumulativeValue,
                      });
                    }}
                  />
                );
              })}
            </svg>

            {/* tooltip */}
            {tooltip && (
              <div
                className="absolute pointer-events-none bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-2 rounded-lg shadow-lg text-xs z-50"
                style={{
                  left: `${tooltip.x + 10}px`,
                  top: `${tooltip.y - 10}px`,
                  transform: tooltip.x > 500 ? 'translateX(-100%)' : 'translateX(0)',
                }}
              >
                <div className="font-semibold">{tooltip.category}</div>
                <div className="text-slate-300 dark:text-slate-600">
                  {new Date(tooltip.date).toLocaleDateString('en-US', dateFormat)}
                </div>
                <div className="mt-1">
                  <span className="font-medium">Value: </span>
                  {tooltip.value.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Total: </span>
                  {tooltip.cumulativeValue.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {/* etiquetas eje X, posicionadas por tiempo */}
          <div className="relative mt-2 h-4 text-xs text-slate-600 dark:text-slate-400">
            {allDates.length > 0 &&
              (() => {
                const times = allDates.map(d => new Date(d).getTime());
                const first = times[0];
                const last = times[times.length - 1];
                const range = Math.max(1, last - first);

                const numTicks = Math.min(8, allDates.length);
                const usedIdx = new Set<number>();
                const labels = [];

                for (let i = 0; i < numTicks; i++) {
                  const target = first + (range * i) / (numTicks - 1 || 1);
                  let bestIdx = 0;
                  let bestDist = Infinity;
                  for (let j = 0; j < times.length; j++) {
                    const dist = Math.abs(times[j] - target);
                    if (dist < bestDist && !usedIdx.has(j)) {
                      bestDist = dist;
                      bestIdx = j;
                    }
                  }
                  usedIdx.add(bestIdx);

                  const pos = (times[bestIdx] - first) / range;

                  labels.push(
                    <span
                      key={bestIdx}
                      className="absolute text-center"
                      style={{
                        left: `${pos * 100}%`,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      {new Date(allDates[bestIdx]).toLocaleDateString('en-US', dateFormat)}
                    </span>
                  );
                }

                return labels;
              })()}
          </div>

          {/* label eje X */}
          <div className="mt-1 text-center">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {xAxisLabel}
            </span>
          </div>
        </div>
      </div>

      {/* leyenda */}
      {shouldShowLegend && (
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {categories.map((category, idx) => (
            <div key={category} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                {category}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
