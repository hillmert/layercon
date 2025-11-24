/**
 * Chart Color Themes
 * Includes accessible color palettes for colorblind users
 */

export type ThemeType = 
  | 'default' 
  | 'vibrant' 
  | 'pastel' 
  | 'ocean' 
  | 'sunset' 
  | 'forest' 
  | 'cool' 
  | 'warm' 
  | 'neon' 
  | 'protanopia' 
  | 'deuteranopia' 
  | 'tritanopia' 
  | 'achromatic';

export interface ColorTheme {
  name: string;
  description: string;
  colors: string[];
  accessible: boolean;
  colorblindType?: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatic';
}

export const CHART_THEMES: Record<ThemeType, ColorTheme> = {
  // Default professional theme
  default: {
    name: 'Default',
    description: 'Professional color palette',
    accessible: true,
    colors: [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
      '#0173b2', '#de8f05', '#cc78bc', '#ca9161', '#949494',
      '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    ],
  },

  // Vibrant theme with high contrast
  vibrant: {
    name: 'Vibrant',
    description: 'High contrast vibrant colors',
    accessible: true,
    colors: [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#ABEBC6',
      '#F1948A', '#D7BDE2', '#A9DFBF', '#F9E79F', '#D5F4E6',
      '#FADBD8', '#EBDEF0', '#D5F4E6', '#FCF3CF', '#FDEBD0',
    ],
  },

  // Pastel theme - soft colors
  pastel: {
    name: 'Pastel',
    description: 'Soft pastel colors',
    accessible: true,
    colors: [
      '#FFB3BA', '#FFCCCB', '#FFFFBA', '#BAE1FF', '#BAC2F0',
      '#FFDFBA', '#FFFFCC', '#CCFFCC', '#FFCCFF', '#CCFFFF',
      '#FFE5CC', '#E5CCFF', '#CCFFE5', '#FFCCCC', '#CCCCFF',
      '#E5FFCC', '#FFCCFF', '#CCFFFF', '#FFFFCC', '#FFCCCC',
    ],
  },

  // Ocean theme - blues and teals
  ocean: {
    name: 'Ocean',
    description: 'Ocean-inspired blues and teals',
    accessible: true,
    colors: [
      '#006994', '#0088CC', '#00AADD', '#00CCFF', '#33DDFF',
      '#0055AA', '#0077BB', '#0099DD', '#00BBEE', '#33EEFF',
      '#004477', '#006699', '#0088BB', '#00AADD', '#00CCFF',
      '#003366', '#005588', '#0077AA', '#0099CC', '#00BBEE',
    ],
  },

  // Sunset theme - warm oranges and reds
  sunset: {
    name: 'Sunset',
    description: 'Warm sunset colors',
    accessible: true,
    colors: [
      '#FF6B35', '#FF8C42', '#FFA500', '#FFB84D', '#FFCC66',
      '#FF5722', '#FF7043', '#FF9800', '#FFB74D', '#FFCC80',
      '#E64A19', '#FF6E40', '#FF9100', '#FFA726', '#FFB74D',
      '#D84315', '#FF5722', '#FF8A50', '#FFA726', '#FFB74D',
    ],
  },

  // Forest theme - greens
  forest: {
    name: 'Forest',
    description: 'Forest-inspired greens',
    accessible: true,
    colors: [
      '#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#4CAF50',
      '#0D3818', '#1B5E20', '#2E7D32', '#558B2F', '#689F38',
      '#00695C', '#00796B', '#00897B', '#009688', '#26A69A',
      '#004D40', '#00695C', '#00796B', '#00897B', '#009688',
    ],
  },

  // Cool theme - purples and blues
  cool: {
    name: 'Cool',
    description: 'Cool purples and blues',
    accessible: true,
    colors: [
      '#3F51B5', '#5C6BC0', '#7986CB', '#9FA8DA', '#C5CAE9',
      '#512DA8', '#673AB7', '#7E57C2', '#9575CD', '#B39DDB',
      '#1A237E', '#283593', '#3F51B5', '#5C6BC0', '#7986CB',
      '#4527A0', '#512DA8', '#673AB7', '#7E57C2', '#9575CD',
    ],
  },

  // Warm theme - reds and oranges
  warm: {
    name: 'Warm',
    description: 'Warm reds and oranges',
    accessible: true,
    colors: [
      '#D32F2F', '#E53935', '#F44336', '#EF5350', '#E57373',
      '#C62828', '#D32F2F', '#E53935', '#F44336', '#EF5350',
      '#BF360C', '#D84315', '#E64A19', '#FF5722', '#FF7043',
      '#B71C1C', '#C62828', '#D32F2F', '#E53935', '#F44336',
    ],
  },

  // Neon theme - bright vibrant colors
  neon: {
    name: 'Neon',
    description: 'Bright neon colors',
    accessible: true,
    colors: [
      '#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF',
      '#FF10F0', '#FF006E', '#FB5607', '#FFBE0B', '#8338EC',
      '#06FFA5', '#FF006E', '#FB5607', '#FFBE0B', '#8338EC',
      '#3A86FF', '#06FFA5', '#FF006E', '#FB5607', '#FFBE0B',
    ],
  },

  // Protanopia (Red-Blind) - optimized for red-blind users
  protanopia: {
    name: 'Protanopia (Red-Blind)',
    description: 'Optimized for red-blind colorblindness',
    accessible: true,
    colorblindType: 'protanopia',
    colors: [
      '#0173B2', '#DE8F05', '#CC78BC', '#CA9161', '#949494',
      '#ECE133', '#56B4E9', '#009E73', '#F0E442', '#D55E00',
      '#0072B2', '#E69F00', '#56B4E9', '#009E73', '#F0E442',
      '#D55E00', '#CC79A7', '#999999', '#332288', '#88CCEE',
      '#44AA99', '#117733', '#DDCC77', '#CC6677', '#AA4499',
    ],
  },

  // Deuteranopia (Green-Blind) - optimized for green-blind users
  deuteranopia: {
    name: 'Deuteranopia (Green-Blind)',
    description: 'Optimized for green-blind colorblindness',
    accessible: true,
    colorblindType: 'deuteranopia',
    colors: [
      '#0173B2', '#DE8F05', '#CC78BC', '#CA9161', '#949494',
      '#ECE133', '#56B4E9', '#D55E00', '#F0E442', '#009E73',
      '#0072B2', '#E69F00', '#56B4E9', '#D55E00', '#F0E442',
      '#009E73', '#CC79A7', '#999999', '#332288', '#88CCEE',
      '#44AA99', '#117733', '#DDCC77', '#CC6677', '#AA4499',
    ],
  },

  // Tritanopia (Blue-Yellow Blind) - optimized for blue-yellow blind users
  tritanopia: {
    name: 'Tritanopia (Blue-Yellow Blind)',
    description: 'Optimized for blue-yellow colorblindness',
    accessible: true,
    colorblindType: 'tritanopia',
    colors: [
      '#E60000', '#005FFF', '#00D9FF', '#FF6E3A', '#00B8E6',
      '#FFB84D', '#0099CC', '#FF3333', '#00CCFF', '#FF9999',
      '#0066FF', '#FF6600', '#00FFFF', '#FF0000', '#0099FF',
      '#FFCC00', '#00FF99', '#FF00FF', '#00FFFF', '#FFFF00',
    ],
  },

  // Achromatic (Complete Color Blindness) - grayscale with patterns
  achromatic: {
    name: 'Achromatic (Grayscale)',
    description: 'Grayscale for complete color blindness',
    accessible: true,
    colorblindType: 'achromatic',
    colors: [
      '#000000', '#1A1A1A', '#333333', '#4D4D4D', '#666666',
      '#808080', '#999999', '#B3B3B3', '#CCCCCC', '#E6E6E6',
      '#0D0D0D', '#262626', '#404040', '#595959', '#737373',
      '#8C8C8C', '#A6A6A6', '#BFBFBF', '#D9D9D9', '#F2F2F2',
    ],
  },
};

/**
 * Get a color theme by type
 */
export function getTheme(themeType: ThemeType): ColorTheme {
  return CHART_THEMES[themeType];
}

/**
 * Get all available themes
 */
export function getAllThemes(): ColorTheme[] {
  return Object.values(CHART_THEMES);
}

/**
 * Get accessible themes only
 */
export function getAccessibleThemes(): ColorTheme[] {
  return Object.values(CHART_THEMES).filter(theme => theme.accessible);
}

/**
 * Get color from theme by index
 */
export function getThemeColor(themeType: ThemeType, index: number): string {
  const theme = getTheme(themeType);
  return theme.colors[index % theme.colors.length];
}

/**
 * Get multiple colors from theme
 */
export function getThemeColors(themeType: ThemeType, count: number): string[] {
  const theme = getTheme(themeType);
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(theme.colors[i % theme.colors.length]);
  }
  return colors;
}

/**
 * Simulate colorblind vision for a color (for testing)
 * This is a simplified simulation
 */
export function simulateColorblindness(
  color: string,
  type: 'protanopia' | 'deuteranopia' | 'tritanopia'
): string {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  let newR = r, newG = g, newB = b;

  if (type === 'protanopia') {
    // Red-blind simulation
    newR = Math.round(0.567 * r + 0.433 * g);
    newG = Math.round(0.558 * r + 0.442 * g);
    newB = Math.round(0.0 * r + 0.242 * b);
  } else if (type === 'deuteranopia') {
    // Green-blind simulation
    newR = Math.round(0.625 * r + 0.375 * g);
    newG = Math.round(0.7 * r + 0.3 * g);
    newB = Math.round(0.0 * r + 0.3 * b);
  } else if (type === 'tritanopia') {
    // Blue-yellow blind simulation
    newR = Math.round(0.95 * r + 0.05 * b);
    newG = Math.round(0.433 * r + 0.567 * g);
    newB = Math.round(0.475 * g + 0.525 * b);
  }

  // Clamp values
  newR = Math.max(0, Math.min(255, newR));
  newG = Math.max(0, Math.min(255, newG));
  newB = Math.max(0, Math.min(255, newB));

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}
