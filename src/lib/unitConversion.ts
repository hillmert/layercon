/**
 * Unit Conversion Utilities
 * Database stores data in Field Units (US Oilfield Units)
 * This module converts between Field Units and SI Units
 */

// Conversion factors from Field Units to SI Units
const CONVERSION_FACTORS = {
  // Pressure: psia to kPa
  pressure: 6.89476,
  
  // Volume: bbl (barrels) to m³
  volume: 0.158987,
  
  // Rate: bbl/day to m³/day
  rate: 0.158987,
  
  // Gas volume: Mscf (thousand standard cubic feet) to m³
  gasVolume: 28.3168,
  
  // Gas rate: Mscf/day to m³/day
  gasRate: 28.3168,
  
  // Solution Gas-Oil Ratio: scf/bbl to m³/m³
  gor: 0.178108,
  
  // Temperature: °F to °C (requires offset)
  temperature: (f: number) => (f - 32) * 5 / 9,
};

export type UnitSystem = 'field' | 'si';

/**
 * Convert pressure value
 * @param value - Pressure value
 * @param from - Source unit system
 * @param to - Target unit system
 * @returns Converted value
 */
export function convertPressure(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  if (from === 'field' && to === 'si') {
    return value * CONVERSION_FACTORS.pressure;
  }
  return value / CONVERSION_FACTORS.pressure;
}

/**
 * Convert volume value
 * @param value - Volume value
 * @param from - Source unit system
 * @param to - Target unit system
 * @returns Converted value
 */
export function convertVolume(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  if (from === 'field' && to === 'si') {
    return value * CONVERSION_FACTORS.volume;
  }
  return value / CONVERSION_FACTORS.volume;
}

/**
 * Convert rate value
 * @param value - Rate value
 * @param from - Source unit system
 * @param to - Target unit system
 * @returns Converted value
 */
export function convertRate(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  if (from === 'field' && to === 'si') {
    return value * CONVERSION_FACTORS.rate;
  }
  return value / CONVERSION_FACTORS.rate;
}

/**
 * Convert gas volume value
 * @param value - Gas volume value
 * @param from - Source unit system
 * @param to - Target unit system
 * @returns Converted value
 */
export function convertGasVolume(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  if (from === 'field' && to === 'si') {
    return value * CONVERSION_FACTORS.gasVolume;
  }
  return value / CONVERSION_FACTORS.gasVolume;
}

/**
 * Convert gas rate value
 * @param value - Gas rate value
 * @param from - Source unit system
 * @param to - Target unit system
 * @returns Converted value
 */
export function convertGasRate(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  if (from === 'field' && to === 'si') {
    return value * CONVERSION_FACTORS.gasRate;
  }
  return value / CONVERSION_FACTORS.gasRate;
}

/**
 * Convert GOR (Gas-Oil Ratio) value
 * @param value - GOR value
 * @param from - Source unit system
 * @param to - Target unit system
 * @returns Converted value
 */
export function convertGOR(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  if (from === 'field' && to === 'si') {
    return value * CONVERSION_FACTORS.gor;
  }
  return value / CONVERSION_FACTORS.gor;
}

/**
 * Convert WOR (Water-Oil Ratio) value - dimensionless, no conversion needed
 * @param value - WOR value
 * @returns Same value (dimensionless)
 */
export function convertWOR(value: number): number {
  return value;
}

/**
 * Convert saturation value - dimensionless, no conversion needed
 * @param value - Saturation value
 * @returns Same value (dimensionless)
 */
export function convertSaturation(value: number): number {
  return value;
}

/**
 * Convert temperature value
 * @param value - Temperature value
 * @param from - Source unit system
 * @param to - Target unit system
 * @returns Converted value
 */
export function convertTemperature(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  if (from === 'field' && to === 'si') {
    return CONVERSION_FACTORS.temperature(value);
  }
  // Reverse: °C to °F
  return (value * 9 / 5) + 32;
}

/**
 * Convert array of data points
 * @param data - Array of data points with numeric values
 * @param converter - Conversion function to apply
 * @param from - Source unit system
 * @param to - Target unit system
 * @returns Converted data array
 */
export function convertDataArray<T extends Record<string, any>>(
  data: T[],
  converter: (value: number, from: UnitSystem, to: UnitSystem) => number,
  valueKey: string,
  from: UnitSystem,
  to: UnitSystem
): T[] {
  if (from === to) return data;
  
  return data.map(item => ({
    ...item,
    [valueKey]: converter(item[valueKey], from, to),
  }));
}

/**
 * Get unit label for a given property and unit system
 * @param property - Property name (pressure, volume, rate, etc.)
 * @param unitSystem - Unit system
 * @returns Unit label string
 */
export function getUnitLabel(property: string, unitSystem: UnitSystem): string {
  const labels: Record<string, Record<UnitSystem, string>> = {
    pressure: { field: 'psia', si: 'kPa' },
    volume: { field: 'bbl', si: 'm³' },
    rate: { field: 'bbl/day', si: 'm³/day' },
    gasVolume: { field: 'Mscf', si: 'm³' },
    gasRate: { field: 'Mscf/day', si: 'm³/day' },
    gor: { field: 'scf/bbl', si: 'm³/m³' },
    wor: { field: '-', si: '-' },
    saturation: { field: '-', si: '-' },
    temperature: { field: '°F', si: '°C' },
  };
  
  return labels[property]?.[unitSystem] || '';
}
