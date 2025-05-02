'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Typography } from '@mui/material';

import { ParkingLayoutDesigner } from '@/components/parking-layout/ParkingLayoutDesigner';
import { type Node } from '@/components/parking-layout/types';

export default function LayoutPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const zoneId = searchParams.get('zoneId');
  const [initialData, setInitialData] = React.useState<Node[]>([]);

  React.useEffect(() => {
    if (zoneId) {
      // Try to get layout from localStorage
      const savedLayout = localStorage.getItem(`zone-layout-${zoneId}`);
      if (savedLayout) {
        try {
          const parsedLayout = JSON.parse(savedLayout) as Node[];
          setInitialData(parsedLayout);
        } catch (error) {
          // Handle error silently
          setInitialData([]);
        }
      }
    }
  }, [zoneId]);

  const handleSave = (nodes: Node[]) => {
    if (zoneId) {
      localStorage.setItem(`zone-layout-${zoneId}`, JSON.stringify(nodes));
    }
  };

  if (!zoneId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">No zone ID provided</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', p: 3 }}>
      <ParkingLayoutDesigner initialData={initialData} onSave={handleSave} previewMode={false} />
    </Box>
  );
}
