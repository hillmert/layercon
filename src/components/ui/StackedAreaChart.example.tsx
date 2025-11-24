/**
 * Example usage of StackedAreaChart component
 * 
 * This is a generalized stacked area chart that can be used for any time-series data
 * where you want to show multiple categories stacked on top of each other.
 */

import StackedAreaChart from './StackedAreaChart';

// Example 1: Simple usage with default settings
export function BasicExample() {
  const data = {
    'Category A': [
      { date: '2024-01-01', value: 100 },
      { date: '2024-02-01', value: 150 },
      { date: '2024-03-01', value: 120 },
    ],
    'Category B': [
      { date: '2024-01-01', value: 80 },
      { date: '2024-02-01', value: 90 },
      { date: '2024-03-01', value: 110 },
    ],
    'Category C': [
      { date: '2024-01-01', value: 60 },
      { date: '2024-02-01', value: 70 },
      { date: '2024-03-01', value: 85 },
    ],
  };

  return (
    <StackedAreaChart
      data={data}
      categories={['Category A', 'Category B', 'Category C']}
      yAxisLabel="Value"
      xAxisLabel="Date"
    />
  );
}

// Example 2: Custom colors and height
export function CustomizedExample() {
  const data = {
    'Layer 1': [
      { date: '2024-01-01', value: 50 },
      { date: '2024-02-01', value: 60 },
    ],
    'Layer 2': [
      { date: '2024-01-01', value: 30 },
      { date: '2024-02-01', value: 40 },
    ],
  };

  const customColors = [
    'rgba(255, 99, 132, 0.7)',  // red
    'rgba(54, 162, 235, 0.7)',  // blue
  ];

  return (
    <StackedAreaChart
      data={data}
      categories={['Layer 1', 'Layer 2']}
      colors={customColors}
      height="h-64"
      yAxisLabel="Production (bbl)"
      xAxisLabel="Time"
      dateFormat={{ month: 'long', day: 'numeric' }}
    />
  );
}

// Example 3: Without legend
export function NoLegendExample() {
  const data = {
    'Series 1': [
      { date: '2024-01-01', value: 100 },
      { date: '2024-02-01', value: 120 },
    ],
  };

  return (
    <StackedAreaChart
      data={data}
      categories={['Series 1']}
      showLegend={false}
      yAxisLabel="Value"
      xAxisLabel="Date"
    />
  );
}

// Example 4: With explicit max value
export function ExplicitMaxExample() {
  const data = {
    'Metric A': [
      { date: '2024-01-01', value: 50 },
      { date: '2024-02-01', value: 60 },
    ],
    'Metric B': [
      { date: '2024-01-01', value: 30 },
      { date: '2024-02-01', value: 40 },
    ],
  };

  return (
    <StackedAreaChart
      data={data}
      categories={['Metric A', 'Metric B']}
      maxValue={200}  // Force Y-axis to go up to 200
      yAxisLabel=