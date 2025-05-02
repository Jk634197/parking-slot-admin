'use client';

import * as React from 'react';
import { useState } from 'react';
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

import { ParkingLayoutDesigner } from '@/components/parking-layout/ParkingLayoutDesigner';
import type { Node } from '@/components/parking-layout/types';

export default function LayoutDesignerPage() {
  const [selectedSlot, setSelectedSlot] = useState<Node | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSlotClick = (slot: Node) => {
    setSelectedSlot(slot);
    setIsDialogOpen(true);
  };

  // const handleSave = (data: Node[]) => {
  //   // Here you would typically save the layout to your backend
  //   console.log('Saving layout:', data);
  // };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Parking Layout Designer
        </Typography>

        {/* handleSave={handleSave} for parking layout save */}
        <ParkingLayoutDesigner onSlotClick={handleSlotClick} />

        <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>Slot Details</DialogTitle>
          <DialogContent>
            {selectedSlot ? <Box sx={{ pt: 1 }}>
                <Typography variant="body1">
                  <strong>ID:</strong> {selectedSlot.id}
                </Typography>
                <Typography variant="body1">
                  <strong>Label:</strong> {selectedSlot.label}
                </Typography>
                <Typography variant="body1">
                  <strong>Status:</strong> {selectedSlot.status || 'N/A'}
                </Typography>
                <Typography variant="body1">
                  <strong>Position:</strong> ({selectedSlot.x}, {selectedSlot.y})
                </Typography>
              </Box> : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
