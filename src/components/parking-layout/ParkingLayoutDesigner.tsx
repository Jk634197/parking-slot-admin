import * as React from 'react';
import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getZoneSlotLayout, saveZoneSlotLayout } from '@/services/locations';
import { slotBookingService } from '@/services/slot-booking';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';

import { Canvas } from './components/Canvas';
import { PropertyEditor } from './components/PropertyEditor';
import { Toolbar } from './components/Toolbar';
import { NODE_SPECS, STATUS_COLORS } from './constants';
import { type Node, type NodeStatus, type NodeType, type ParkingLayoutDesignerProps } from './types';

// Vehicle number validation regex
const VEHICLE_NUMBER_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;

export function ParkingLayoutDesigner({
  initialData = [],
  onSave,
  previewMode = false,
  readOnly = false,
}: ParkingLayoutDesignerProps) {
  const searchParams = useSearchParams();
  const zoneId = searchParams.get('zoneId');
  const locationId = searchParams.get('locationId');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleNumberError, setVehicleNumberError] = useState<string | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // State management
  const [nodes, setNodes] = useState<Node[]>(initialData);
  const [viewMode, setViewMode] = useState(previewMode || readOnly);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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
    // If slotSeries is set, use it as the starting point
    if (slotSeries && typeof slotSeries === 'number') {
      return Math.max(slotSeries, maxNumber + 1);
    }
    return maxNumber + 1;
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
        slotid: type.startsWith('slot') ? parseInt(`${Date.now()}`, 10) : 0,
      };
      setNodes((prev) => [...prev, node]);
    },
    [slotSuffix, getNextSlotNumber]
  );

  // Event handlers
  const handleNodeClick = useCallback(
    (node: Node) => {
      if (viewMode) {
        if (node.type.startsWith('slot')) {
          // Only allow booking available slots and releasing reserved/occupied slots
          if (node.status === 'available' || node.status === 'booked') {
            setSelectedNode(node);
          }
        }
      } else {
        setSelectedNode(node);
      }
    },
    [viewMode]
  );

  const handleNodeLabelEdit = useCallback((node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleNodeDoubleClick = useCallback(
    (node: Node) => {
      if (!viewMode && !node.type.startsWith('arrow')) {
        handleNodeLabelEdit(node);
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

  const handleSave = useCallback(async () => {
    if (onSave) {
      onSave(nodes);
    }

    // Save to localStorage if we have both IDs
    if (zoneId && locationId) {
      localStorage.setItem(`zone-layout-${locationId}-${zoneId}`, JSON.stringify(nodes));
    }

    // Save to API if we have zoneId
    if (zoneId) {
      try {
        setIsSaving(true);
        setSaveError(null);
        await saveZoneSlotLayout(parseInt(zoneId, 10), nodes);
      } catch (err) {
        setSaveError('Failed to save layout to server');
      } finally {
        setIsSaving(false);
      }
    }
  }, [nodes, onSave, zoneId, locationId]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loaded = JSON.parse(e.target?.result as string) as Node[];
        if (Array.isArray(loaded)) {
          setNodes(loaded);
          setSaveError(null);
        }
      } catch (err) {
        setSaveError('Failed to parse JSON file. Please check the file format.');
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

  const handleNodeDelete = useCallback(() => {
    if (selectedNode) {
      setNodes((prev) => prev.filter((node) => node.id !== selectedNode.id));
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const handleSlotSuffixChange = useCallback((newSuffix: string) => {
    setSlotSuffix(newSuffix);
  }, []);

  const handleSlotSeriesChange = useCallback((newSeries: number | '') => {
    setSlotSeries(newSeries);
  }, []);

  const fetchLayoutData = useCallback(async () => {
    if (!zoneId) return;
    try {
      const fetched = await getZoneSlotLayout(parseInt(zoneId, 10));
      setNodes(fetched.slots.map((n) => ({ ...n, status: (n.status?.toLowerCase() as NodeStatus) ?? 'available' })));
    } catch (error) {
      if (locationId) {
        const saved = localStorage.getItem(`zone-layout-${locationId}-${zoneId}`);
        if (saved) {
          try {
            const local = JSON.parse(saved) as Node[];
            setNodes(local.map((n) => ({ ...n, status: (n.status?.toLowerCase() as NodeStatus) ?? 'available' })));
          } catch {
            // ignore JSON parse errors
          }
        }
      }
    }
  }, [zoneId, locationId]);

  // Load layout from API or fallback to localStorage
  React.useEffect(() => {
    if (!zoneId) return;

    // Initial fetch
    void fetchLayoutData();

    // Set up interval for periodic updates
    const intervalId = setInterval(() => {
      void fetchLayoutData();
    }, 10000); // 10 seconds

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [zoneId, locationId, fetchLayoutData]);

  // Handle slot booking
  const handleSlotBooking = useCallback(async () => {
    if (!selectedNode || !zoneId) return;

    if (!validateVehicleNumber(vehicleNumber)) {
      return;
    }

    try {
      setBookingError(null);
      const userData = localStorage.getItem('user');
      const userId = userData ? (JSON.parse(userData) as { userId: number }).userId : 1;
      await slotBookingService.bookSlot({
        userId,
        parkingSlotsId: selectedNode.slotid,
        vehicleNumber,
      });

      // Fetch updated layout after booking
      await fetchLayoutData();

      setIsBookingDialogOpen(false);
      setVehicleNumber('');
      setVehicleNumberError(null);
      setSelectedNode(null);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Failed to book slot');
    }
  }, [selectedNode, zoneId, vehicleNumber, fetchLayoutData]);

  const handleDialogClose = () => {
    setIsBookingDialogOpen(false);
    setVehicleNumber('');
    setVehicleNumberError(null);
    setBookingError(null);
  };

  // Handle slot release
  const handleSlotRelease = useCallback(async () => {
    if (!selectedNode || !zoneId) return;

    try {
      setBookingError(null);
      const userData = localStorage.getItem('user');
      const userId = userData ? (JSON.parse(userData) as { userId: number }).userId : 1;
      await slotBookingService.bookSlot({
        userId,
        parkingSlotsId: selectedNode.slotid,
      });

      // Fetch updated layout after releasing
      await fetchLayoutData();

      setSelectedNode(null);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Failed to release slot');
    }
  }, [selectedNode, zoneId, fetchLayoutData]);

  // Helper functions
  const getStatusCount = (status: string) => {
    return nodes.filter((node) => node.type.startsWith('slot') && node.status === status).length;
  };

  const validateVehicleNumber = (value: string): boolean => {
    if (!value.trim()) {
      setVehicleNumberError('Vehicle number is required');
      return false;
    }
    if (!VEHICLE_NUMBER_REGEX.test(value)) {
      setVehicleNumberError('Please enter a valid vehicle number (e.g., KA01AB1234)');
      return false;
    }
    setVehicleNumberError(null);
    return true;
  };

  const handleVehicleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setVehicleNumber(value);
    validateVehicleNumber(value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '70vh' }}>
      {!previewMode && (
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
          isSaving={isSaving}
        />
      )}

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          gap: 2,
          position: 'relative',
          height: '1000px',
          minHeight: '400px',
        }}
      >
        <Canvas
          nodes={nodes}
          viewMode={viewMode}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={(node, _index) => {
            handleNodeDoubleClick(node);
          }}
          onNodeDragStart={handleMouseDown}
          onNodeDrag={handleMouseMove}
          onNodeDragEnd={handleMouseUp}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
        />

        {!viewMode && selectedNode ? (
          <PropertyEditor selectedNode={selectedNode} onNodeUpdate={handleNodeUpdate} onNodeDelete={handleNodeDelete} />
        ) : null}

        {viewMode && selectedNode?.type.startsWith('slot') ? (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'background.paper',
              padding: 2,
              borderRadius: 1,
              boxShadow: 1,
              minWidth: 200,
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Slot Actions
            </Typography>
            {selectedNode.status === 'available' ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setIsBookingDialogOpen(true);
                }}
                fullWidth
              >
                Book Slot
              </Button>
            ) : (
              <Button variant="contained" color="secondary" onClick={handleSlotRelease} fullWidth>
                Release Slot
              </Button>
            )}
          </Box>
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
                backgroundColor: NODE_SPECS.security.fill,
                borderRadius: 0.5,
              }}
            />
            <Typography variant="body2">Security Cabin</Typography>
          </Box>
        </Box>
      </Box>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Book Parking Slot</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Vehicle Number"
            type="text"
            fullWidth
            value={vehicleNumber}
            onChange={handleVehicleNumberChange}
            error={Boolean(vehicleNumberError) || Boolean(bookingError)}
            helperText={vehicleNumberError || bookingError}
            placeholder="e.g., KA01AB1234"
            inputProps={{
              maxLength: 10,
              style: { textTransform: 'uppercase' },
            }}
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Format: 2 letters + 2 numbers + 2 letters + 4 numbers (e.g., KA01AB1234)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSlotBooking}
            variant="contained"
            disabled={!vehicleNumber.trim() || Boolean(vehicleNumberError)}
          >
            Book
          </Button>
        </DialogActions>
      </Dialog>

      {saveError ? (
        <Typography color="error" sx={{ mt: 2 }}>
          {saveError}
        </Typography>
      ) : null}
    </Box>
  );
}
