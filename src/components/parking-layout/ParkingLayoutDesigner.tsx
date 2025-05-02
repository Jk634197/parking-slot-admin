import * as React from 'react';
import { useCallback, useState } from 'react';
import { Box, Typography } from '@mui/material';

import { Canvas } from './components/Canvas';
import { PropertyEditor } from './components/PropertyEditor';
import { Toolbar } from './components/Toolbar';
import { NODE_SPECS, STATUS_COLORS } from './constants';
import { EditLabelDialog } from './EditLabelDialog';
import { type Node, type NodeType, type ParkingLayoutDesignerProps } from './types';

export function ParkingLayoutDesigner({
  initialData = [],
  onSave,
  onSlotClick,
  readOnly = false,
}: ParkingLayoutDesignerProps) {
  // State management
  const [nodes, setNodes] = useState<Node[]>(initialData);
  const [viewMode, setViewMode] = useState(readOnly);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [editingNode, setEditingNode] = useState<{ node: Node; index: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Drag and drop state
  const [currentDrag, setCurrentDrag] = useState<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDraggingFromToolbar, setIsDraggingFromToolbar] = useState(false);
  const [draggedType, setDraggedType] = useState<NodeType | null>(null);

  // Slot configuration
  const [slotSuffix, setSlotSuffix] = useState('');
  const [slotSeries, setSlotSeries] = useState<number | ''>('');

  // Get next available slot number
  const getNextSlotNumber = useCallback(() => {
    const slotNodes = nodes.filter((node) => node.type.startsWith('slot'));
    const numbers = slotNodes.map((node) => {
      const match = /\d+$/.exec(node.label);
      return match ? parseInt(match[0], 10) : 0;
    });
    const maxNumber = Math.max(0, ...numbers);
    return Math.max(maxNumber + 1, slotSeries || 1);
  }, [nodes, slotSeries]);

  // Add new node to canvas
  const addNode = useCallback(
    (type: NodeType, x: number, y: number) => {
      const node: Node = {
        id: `${type}-${Date.now()}`,
        type,
        x,
        y,
        label: type.startsWith('slot') ? `${slotSuffix}${getNextSlotNumber()}` : type.toUpperCase(),
        status: type.startsWith('slot') ? 'available' : undefined,
      };
      setNodes((prev) => [...prev, node]);
    },
    [slotSuffix, getNextSlotNumber]
  );

  // Event handlers
  const handleNodeClick = useCallback(
    (node: Node) => {
      if (viewMode) {
        if (node.type.startsWith('slot') && onSlotClick) {
          onSlotClick(node);
        }
      } else {
        setSelectedNode(node);
      }
    },
    [viewMode, onSlotClick]
  );

  const handleNodeLabelEdit = useCallback((node: Node, index: number) => {
    setEditingNode({ node, index });
  }, []);

  const handleLabelSave = useCallback(
    (newLabel: string) => {
      if (editingNode) {
        setNodes((prev) => prev.map((n, i) => (i === editingNode.index ? { ...n, label: newLabel } : n)));
        setEditingNode(null);
      }
    },
    [editingNode]
  );

  const handleNodeDoubleClick = useCallback(
    (node: Node, index: number) => {
      if (!viewMode && !node.type.startsWith('arrow')) {
        handleNodeLabelEdit(node, index);
      }
    },
    [viewMode, handleNodeLabelEdit]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, index: number, node: Node) => {
      if (!viewMode) {
        e.preventDefault();
        setCurrentDrag(index);
        setSelectedNode(node);
        const rect = e.currentTarget?.getBoundingClientRect();
        if (rect) {
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          setOffsetX(mouseX - node.x);
          setOffsetY(mouseY - node.y);
        }
      }
    },
    [viewMode]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!viewMode && currentDrag !== null) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setNodes((prev) =>
          prev.map((node, i) =>
            i === currentDrag
              ? {
                  ...node,
                  x: Math.max(0, Math.min(x - offsetX, rect.width - (node.width || 0))),
                  y: Math.max(0, Math.min(y - offsetY, rect.height - (node.height || 0))),
                }
              : node
          )
        );
      }
    },
    [viewMode, currentDrag, offsetX, offsetY]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!viewMode && isDraggingFromToolbar && draggedType) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addNode(draggedType, x, y);
      }
      setCurrentDrag(null);
      setIsDraggingFromToolbar(false);
      setDraggedType(null);
    },
    [viewMode, isDraggingFromToolbar, draggedType, addNode]
  );

  const handleToolbarDragStart = useCallback((type: NodeType) => {
    setIsDraggingFromToolbar(true);
    setDraggedType(type);
  }, []);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(nodes);
    }
  }, [nodes, onSave]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loaded = JSON.parse(e.target?.result as string) as Node[];
        if (Array.isArray(loaded)) {
          setNodes(loaded);
          setError(null);
        }
      } catch (err) {
        setError('Failed to parse JSON file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleNodeUpdate = useCallback(
    (updates: Partial<Node>) => {
      if (selectedNode) {
        setNodes((prev) => prev.map((node) => (node.id === selectedNode.id ? { ...node, ...updates } : node)));
      }
    },
    [selectedNode]
  );

  const handleSlotSuffixChange = useCallback((newSuffix: string) => {
    setSlotSuffix(newSuffix);
  }, []);

  const handleSlotSeriesChange = useCallback((newSeries: number | '') => {
    setSlotSeries(newSeries);
  }, []);

  // Helper functions
  const getStatusCount = (status: string) => {
    return nodes.filter((node) => node.type.startsWith('slot') && node.status === status).length;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        readOnly={readOnly}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onToolbarDragStart={handleToolbarDragStart}
        onSave={handleSave}
        onFileUpload={handleFileUpload}
        slotSuffix={slotSuffix}
        onSlotSuffixChange={handleSlotSuffixChange}
        slotSeries={slotSeries}
        onSlotSeriesChange={handleSlotSeriesChange}
      />

      <Box sx={{ display: 'flex', flex: 1, gap: 2, position: 'relative' }}>
        <Canvas
          nodes={nodes}
          viewMode={viewMode}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeDragStart={handleMouseDown}
          onNodeDrag={handleMouseMove}
          onNodeDragEnd={handleMouseUp}
          // @ts-expect-error - TODO: fix this
          isDraggingFromToolbar={isDraggingFromToolbar}
          draggedType={draggedType}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
        />

        {!viewMode && selectedNode ? (
          <PropertyEditor selectedNode={selectedNode} onNodeUpdate={handleNodeUpdate} />
        ) : null}

        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            display: 'flex',
            gap: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: 1,
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: color,
                  borderRadius: 0.5,
                }}
              />
              <Typography variant="body2">
                {status.charAt(0).toUpperCase() + status.slice(1)}: {getStatusCount(status)}
              </Typography>
            </Box>
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                backgroundColor: NODE_SPECS.manager.fill,
                borderRadius: 0.5,
              }}
            />
            <Typography variant="body2">Manager Cabin</Typography>
          </Box>
        </Box>
      </Box>

      {error ? (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      ) : null}

      <EditLabelDialog
        open={editingNode !== null}
        initialValue={editingNode?.node.label || ''}
        onClose={() => {
          setEditingNode(null);
        }}
        onSave={handleLabelSave}
      />
    </Box>
  );
}
