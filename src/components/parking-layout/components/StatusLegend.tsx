import * as React from 'react';
import { Box, Typography } from '@mui/material';

import { STATUS_COLORS } from '../constants';

export function StatusLegend() {
  return (
    <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 20, height: 20, bgcolor: STATUS_COLORS.available, borderRadius: 1 }} />
        <Typography variant="body2">Available</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 20, height: 20, bgcolor: STATUS_COLORS.booked, borderRadius: 1 }} />
        <Typography variant="body2">Booked</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 20, height: 20, bgcolor: STATUS_COLORS.reserved, borderRadius: 1 }} />
        <Typography variant="body2">Reserved</Typography>
      </Box>
    </Box>
  );
}
