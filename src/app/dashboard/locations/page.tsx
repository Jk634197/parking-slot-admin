'use client';

import * as React from 'react';
import { type LocationFormData } from '@/schemas/location';
import { createLocation, deleteLocation, getLocations, updateLocation } from '@/services/locations';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MagnifyingGlass as SearchIcon } from '@phosphor-icons/react/dist/ssr';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { LocationCard } from '@/components/location/location-card';
import { LocationForm } from '@/components/location/location-form';

// export const metadata = { title: `Locations | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [locations, setLocations] = React.useState<LocationFormData[]>([]);
  const [filteredLocations, setFilteredLocations] = React.useState<LocationFormData[]>([]);
  const [selectedLocation, setSelectedLocation] = React.useState<LocationFormData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const loadLocations = React.useCallback(async () => {
    try {
      const data = await getLocations();
      setLocations(data);
      setFilteredLocations(data);
    } catch (err) {
      setError('Failed to load locations');
    }
  }, []);

  React.useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  React.useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = locations.filter((location) => {
      const nameMatch = location.name.toLowerCase().includes(query);
      const addressMatch =
        location.address.address1.toLowerCase().includes(query) ||
        location.address.city.toLowerCase().includes(query) ||
        location.address.state.toLowerCase().includes(query) ||
        location.address.zip.toLowerCase().includes(query);
      const zoneMatch = location.parkingZones.some((zone) => {
        return zone.name.toLowerCase().includes(query);
      });

      return nameMatch || addressMatch || zoneMatch;
    });
    setFilteredLocations(filtered);
  }, [searchQuery, locations]);

  const handleOpen = () => {
    setSelectedLocation(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedLocation(null);
  };

  const handleEdit = (location: LocationFormData) => {
    setSelectedLocation(location);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLocation(id);
      await loadLocations();
    } catch (err) {
      setError('Failed to delete location');
    }
  };

  const handleSubmit = async (data: LocationFormData): Promise<void> => {
    try {
      if (selectedLocation?.id) {
        await updateLocation(selectedLocation.id, data);
      } else {
        await createLocation(data);
      }
      await loadLocations();
      handleClose();
    } catch (err) {
      setError('Failed to save location');
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Locations</Typography>
        </Stack>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleOpen}>
            Add Location
          </Button>
        </div>
      </Stack>

      {error ? <Alert
          severity="error"
          onClose={() => {
            setError(null);
          }}
        >
          {error}
        </Alert> : null}

      <OutlinedInput
        placeholder="Search locations..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
        fullWidth
      />

      <Grid container spacing={3}>
        {filteredLocations.map((location) => (
          <Grid item xs={12} md={6} key={location.id}>
            <LocationCard location={location} onEdit={handleEdit} onDelete={handleDelete} />
          </Grid>
        ))}
        {filteredLocations.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">No locations found matching your search.</Alert>
          </Grid>
        )}
      </Grid>

      <LocationForm open={open} onClose={handleClose} onSubmit={handleSubmit} initialData={selectedLocation} />
    </Stack>
  );
}
