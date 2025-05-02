'use client';

import * as React from 'react';
import { type LocationFormData } from '@/schemas/location';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Trash as DeleteIcon, PencilSimple as EditIcon } from '@phosphor-icons/react/dist/ssr';

interface LocationCardProps {
  location: LocationFormData;
  onEdit: (location: LocationFormData) => void;
  onDelete: (id: string) => void;
}

export function LocationCard({ location, onEdit, onDelete }: LocationCardProps): React.JSX.Element {
  const handleEdit = () => {
    onEdit(location);
  };

  const handleDelete = () => {
    if (location.id) {
      onDelete(location.id);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{location.name}</Typography>
            <Chip
              label={location.address.status}
              color={location.address.status === 'active' ? 'success' : 'error'}
              size="small"
            />
          </Stack>

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
          <Stack direction="column" spacing={1}>
            <Typography variant="subtitle2">Parking Zones</Typography>
            <Grid container spacing={1}>
              {location.parkingZones.map((zone) => (
                <Grid item xs={12} sm={6} key={zone.id} sx={{ p: 1 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <Stack spacing={1} sx={{ p: 1 }}>
                        <Typography variant="subtitle2">{zone.name}</Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip label={`₹${zone.price}/hr`} size="small" color="primary" variant="outlined" />
                          <Chip
                            label={`${zone.availableSlots}/${zone.totalSlots} slots`}
                            size="small"
                            color={zone.availableSlots && zone.availableSlots > 0 ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Last updated: {location.updatedAt?.toLocaleDateString()}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<EditIcon />} onClick={handleEdit} size="small" color="primary">
                Edit
              </Button>
              <Button startIcon={<DeleteIcon />} onClick={handleDelete} size="small" color="error">
                Delete
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
