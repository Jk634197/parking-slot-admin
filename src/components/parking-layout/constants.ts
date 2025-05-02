import { type NodeSpec, type NodeStatus, type NodeType } from './types';

export const ICON_PATHS = {
  car: 'M6.5 0C5.81 0 5.17.38 4.92 1L4.37 2.5H1.5A1.5 1.5 0 0 0 0 4v7.5A1.5 1.5 0 0 0 1.5 13h1.55a2.5 2.5 0 0 0 4.9 0h4.1a2.5 2.5 0 0 0 4.9 0h1.55a1.5 1.5 0 0 0 1.5-1.5v-5l-2.1-4.2A1.5 1.5 0 0 0 16.5 1h-3l-.55-1.5A1.5 1.5 0 0 0 11.5 0h-5zM5 2h8.5l2 4H5V2zm-2 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm12 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z',
  text: 'M3 3v2h14V3H3zm0 4v2h14V7H3zm0 4v2h14v-2H3zm0 4v2h14v-2H3z',
  user: 'M10 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM8 9a4 4 0 0 0-4 4v1h12v-1a4 4 0 0 0-4-4H8z',
  arrowRight: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
  arrowLeft: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  arrowUp: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z',
  arrowDown: 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z',
};

export const STATUS_COLORS: Record<NodeStatus, string> = {
  available: '#6366f1',
  booked: '#ef4444',
  // reserved: '#f59e0b',
  // maintenance: '#f59e0b',
};

export const NODE_SPECS: Record<NodeType, NodeSpec> = {
  'slot-h': {
    width: 60,
    height: 30,
    fill: '#4CAF50',
    iconPath: 'M10,10 L50,10 L50,20 L10,20 Z',
  },
  'slot-v': {
    width: 30,
    height: 60,
    fill: '#4CAF50',
    iconPath: 'M10,10 L20,10 L20,50 L10,50 Z',
  },
  'slot-diagonal': {
    width: 60,
    height: 30,
    fill: '#4CAF50',
    iconPath: 'M10,10 L50,20 L50,30 L10,20 Z',
  },
  'arrow-h': {
    width: 40,
    height: 20,
    fill: '#FFA726',
    iconPath: 'M5,10 L35,10 L35,20 L5,20 Z M35,10 L25,5 L25,25 L35,20 Z',
  },
  'arrow-v': {
    width: 20,
    height: 40,
    fill: '#FFA726',
    iconPath: 'M10,5 L20,5 L20,35 L10,35 Z M10,35 L5,25 L25,25 L20,35 Z',
  },
  'arrow-diagonal': {
    width: 40,
    height: 40,
    fill: '#FFA726',
    iconPath: 'M5,5 L35,35 L35,40 L5,10 Z M35,35 L25,25 L30,20 L40,30 Z',
  },
  security: {
    width: 40,
    height: 40,
    fill: '#9C27B0',
    iconPath:
      'M20,10 C15,10 10,15 10,20 C10,25 15,30 20,30 C25,30 30,25 30,20 C30,15 25,10 20,10 Z M20,25 C17,25 15,23 15,20 C15,17 17,15 20,15 C23,15 25,17 25,20 C25,23 23,25 20,25 Z',
  },
  text: {
    width: 100,
    height: 30,
    fill: '#2196F3',
    iconPath: 'M10,10 L90,10 L90,30 L10,30 Z',
  },
  'arrow-right': {
    width: 40,
    height: 20,
    fill: '#FFA726',
    iconPath: 'M5,10 L35,10 L35,20 L5,20 Z M35,10 L25,5 L25,25 L35,20 Z',
  },
  'arrow-left': {
    width: 40,
    height: 20,
    fill: '#FFA726',
    iconPath: 'M5,10 L35,10 L35,20 L5,20 Z M5,10 L15,5 L15,25 L5,20 Z',
  },
  'arrow-up': {
    width: 20,
    height: 40,
    fill: '#FFA726',
    iconPath: 'M10,5 L20,5 L20,35 L10,35 Z M10,5 L5,15 L25,15 L20,5 Z',
  },
  'arrow-down': {
    width: 20,
    height: 40,
    fill: '#FFA726',
    iconPath: 'M10,5 L20,5 L20,35 L10,35 Z M10,35 L5,25 L25,25 L20,35 Z',
  },
};
