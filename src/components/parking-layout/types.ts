export type NodeType =
  | 'slot-h'
  | 'slot-v'
  | 'text'
  | 'manager'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down';

export interface Node {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  label: string;
  status?: 'available' | 'booked' | 'reserved';
  width?: number;
  height?: number;
  radius?: number;
  size?: number;
  fill?: string;
  rotation?: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
}

export interface NodeSpec {
  width: number;
  height: number;
  fill: string;
  iconPath: string;
  rotation?: number;
}

export interface ParkingLayoutDesignerProps {
  initialData?: Node[];
  onSave?: (data: Node[]) => void;
  onSlotClick?: (slot: Node) => void;
  readOnly?: boolean;
}
