import { type NodeSpec, type NodeType } from './types';

export const ICON_PATHS = {
  car: 'M6.5 0C5.81 0 5.17.38 4.92 1L4.37 2.5H1.5A1.5 1.5 0 0 0 0 4v7.5A1.5 1.5 0 0 0 1.5 13h1.55a2.5 2.5 0 0 0 4.9 0h4.1a2.5 2.5 0 0 0 4.9 0h1.55a1.5 1.5 0 0 0 1.5-1.5v-5l-2.1-4.2A1.5 1.5 0 0 0 16.5 1h-3l-.55-1.5A1.5 1.5 0 0 0 11.5 0h-5zM5 2h8.5l2 4H5V2zm-2 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm12 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z',
  text: 'M3 3v2h14V3H3zm0 4v2h14V7H3zm0 4v2h14v-2H3zm0 4v2h14v-2H3z',
  user: 'M10 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM8 9a4 4 0 0 0-4 4v1h12v-1a4 4 0 0 0-4-4H8z',
  arrowRight: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
  arrowLeft: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  arrowUp: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z',
  arrowDown: 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z',
};

export const STATUS_COLORS = {
  available: '#6366f1',
  booked: '#ef4444',
  reserved: '#f59e0b',
};

export const NODE_SPECS: Record<NodeType, NodeSpec> = {
  'slot-h': { width: 60, height: 30, fill: '#6366f1', iconPath: ICON_PATHS.car, rotation: 0 },
  'slot-v': { width: 30, height: 60, fill: '#6366f1', iconPath: ICON_PATHS.car, rotation: 90 },
  text: { width: 100, height: 30, fill: '#ffffff', iconPath: ICON_PATHS.text, rotation: 0 },
  manager: { width: 40, height: 40, fill: '#8b5cf6', iconPath: ICON_PATHS.user, rotation: 0 },
  'arrow-right': { width: 30, height: 30, fill: '#f59e0b', iconPath: ICON_PATHS.arrowRight, rotation: 0 },
  'arrow-left': { width: 30, height: 30, fill: '#f59e0b', iconPath: ICON_PATHS.arrowLeft, rotation: 0 },
  'arrow-up': { width: 30, height: 30, fill: '#f59e0b', iconPath: ICON_PATHS.arrowUp, rotation: 0 },
  'arrow-down': { width: 30, height: 30, fill: '#f59e0b', iconPath: ICON_PATHS.arrowDown, rotation: 0 },
};
