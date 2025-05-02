'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { type LocationResponse } from '@/schemas/location';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Trash } from '@phosphor-icons/react';
import { PencilSimple as EditIcon, Layout as LayoutIcon } from '@phosphor-icons/react/dist/ssr';

import type { Node } from '@/components/parking-layout/types';

interface LocationCardProps {
  location: LocationResponse;
  onEdit: (location: LocationResponse) => void;
  onDelete: (id: number) => void;
}

export function LocationCard({ location, onEdit, onDelete }: LocationCardProps): React.JSX.Element {
  const router = useRouter();

  const handleEdit = () => {
    onEdit(location);
  };

  const handleDelete = () => {
    if (location.id) {
      if (onDelete) onDelete(location.id);
    }
  };

  const generateSlotLayout = (zone: LocationResponse['parkingZone'][0]): Node[] | null => {
    if (!zone.totalSlots) return null;
    if (zone.slots) {
      return JSON.parse(zone.slots) as Node[];
    }

    const slots: Node[] = [];
    const slotsPerRow = 5; // Number of slots per row
    const slotWidth = 60;
    const slotHeight = 30;
    const spacing = 20;

    for (let i = 0; i < zone.totalSlots; i++) {
      const row = Math.floor(i / slotsPerRow);
      const col = i % slotsPerRow;

      // Alternate between horizontal and vertical slots
      const slotType = 'slot-h';

      slots.push({
        id: `${i + 1}`,
        type: slotType,
        x: col * (slotWidth + spacing) + 50, // Start with some padding
        y: row * (slotHeight + spacing) + 50,
        width: slotWidth,
        height: slotHeight,
        label: `${i + 1}`,
        status: 'available',
        slotid: i + 1,
      });
    }

    // Add security cabin
    slots.push({
      id: `security-${zone.id}`,
      type: 'security',
      x: slotsPerRow * (slotWidth + spacing) + 100,
      y: 50,
      width: 40,
      height: 40,
      label: '',
      slotid: zone.id || 650,
    });

    return slots;
  };

  const handleViewLayout = (zone: LocationResponse['parkingZone'][0]) => {
    if (!zone.id || !location.id) return;

    // Generate slot layout if not exists
    const slotLayout = generateSlotLayout(zone);

    // Store the layout data in localStorage
    if (slotLayout) {
      localStorage.setItem(`zone-layout-${location.id}-${zone.id}`, JSON.stringify(slotLayout));
      router.push(`/dashboard/locations/layout?locationId=${location.id}&zoneId=${zone.id}`);
    }
  };

  const renderAddress = () => (
    <Stack direction="column" spacing={1}>
      <Typography variant="body2" color="text.secondary">
        {location.address.address1}
        {location.address.address2 ? `, ${location.address.address2}` : ''}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {`${location.address.city}, ${location.address.state} ${location.address.zip}`}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {location.address.country}
      </Typography>
    </Stack>
  );

  const renderParkingZone = (zone: LocationResponse['parkingZone'][0]) => (
    <Grid item xs={12} sm={6} key={zone.id} sx={{ p: 1 }}>
      <Card variant="outlined">
        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
          <Stack spacing={1} sx={{ p: 1 }}>
            <Typography variant="subtitle2">{zone.name}</Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={`₹${zone.price}/${zone.minutes} minutes`} size="small" color="primary" variant="outlined" />
              <Chip
                label={`${zone.totalSlots || 0} slots`}
                size="small"
                color={zone.availableSlots && zone.availableSlots > 0 ? 'success' : 'error'}
                variant="outlined"
              />
            </Stack>
            <Button
              startIcon={<LayoutIcon />}
              onClick={() => {
                handleViewLayout(zone);
              }}
              size="small"
              color="primary"
              variant="outlined"
              fullWidth
            >
              View Layout
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{location.name}</Typography>
            <Chip
              label={location.isActive ? 'Active' : 'Inactive'}
              color={location.isActive ? 'success' : 'error'}
              size="small"
            />
          </Stack>

          {renderAddress()}

          <Stack direction="column" spacing={1}>
            <Typography variant="subtitle2">Parking Zones</Typography>
            <Grid container spacing={1}>
              {location.parkingZone.map(renderParkingZone)}
            </Grid>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {/* Last updated: {location.updatedAt?.toLocaleDateString()} */}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<EditIcon />} onClick={handleEdit} size="small" color="primary">
                Edit
              </Button>
              <Button startIcon={<Trash />} onClick={handleDelete} size="small" color="error">
                Delete
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
