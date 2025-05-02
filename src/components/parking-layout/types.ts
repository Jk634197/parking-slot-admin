export type NodeType =
  | 'slot-h'
  | 'slot-v'
  | 'slot-diagonal'
  | 'arrow-h'
  | 'arrow-v'
  | 'arrow-diagonal'
  | 'security'
  | 'text'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down';

export type NodeStatus = 'available' | 'booked';

export interface Node {
  id: string;
  slotid: number;
  type: NodeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  label: string;
  status?: NodeStatus;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  vehicleNumber?: string;
}

export interface NodeSpec {
  width: number;
  height: number;
  fill: string;
  iconPath: string;
  rotation?: number;
}

export interface ParkingLayoutDesignerProps {
  /** Initial layout data in JSON format */
  initialData?: Node[];
  /** Callback when layout is saved */
  onSave?: (layout: Node[]) => void;
  /** Callback when a slot is clicked (in preview mode) */
  onSlotClick?: (node: Node) => void;
  /** Whether the component is in preview mode (true) or edit mode (false) */
  previewMode?: boolean;
  /** Whether the component is in read-only mode */
  readOnly?: boolean;
}
