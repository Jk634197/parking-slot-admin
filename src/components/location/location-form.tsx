'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import mapboxgl from 'mapbox-gl';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import 'mapbox-gl/dist/mapbox-gl.css';

import { type LocationFormData, locationSchema } from '@/schemas/location';
import { getPlaceDetails } from '@/services/mapbox';
import { Card, CardContent } from '@mui/material';
import { Plus as PlusIcon, X as XIcon } from '@phosphor-icons/react/dist/ssr';

import { MapSearch } from './map-search';

interface LocationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: LocationFormData) => Promise<void>;
  initialData?: LocationFormData | null;
}

export function LocationForm({ open, onClose, onSubmit, initialData }: LocationFormProps): React.JSX.Element {
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [isMapLoading, setIsMapLoading] = React.useState<boolean>(true);
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);
  const marker = React.useRef<mapboxgl.Marker | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<LocationFormData>({
    defaultValues: {
      name: '',
      address: {
        address1: '',
        address2: '',
        city: '',
        state: '',
        country: '',
        zip: '',

        latitude: 23.0225,
        longitude: 72.5714,

        status: 'active',
      },
      parkingZones: [
        {
          name: '',
          price: 0,
          minutes: 60,
          totalSlots: 1,
          availableSlots: 1,
          status: 'active',
        },
      ],
    },
    resolver: zodResolver(locationSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parkingZones',
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        name: '',
        address: {
          address1: '',
          address2: '',
          city: '',
          state: '',
          country: '',
          zip: '',
          latitude: 23.0225,
          longitude: 72.5714,

          status: 'active',
        },
        parkingZones: [
          {
            name: '',
            price: 0,
            minutes: 60,
            totalSlots: 1,
            availableSlots: 1,
            status: 'active',
          },
        ],
      });
    }
  }, [initialData, reset]);

  const updateFormWithPlaceDetails = async (lng: number, lat: number) => {
    const details = await getPlaceDetails(lng, lat);

    if (details.name) {
      setValue('name', details.name);
    }

    if (details.address) {
      if (details.address.address1) {
        setValue('address.address1', details.address.address1);
      }
      if (details.address.address2) {
        setValue('address.address2', details.address.address2);
      }
      if (details.address.city) {
        setValue('address.city', details.address.city);
      }
      if (details.address.state) {
        setValue('address.state', details.address.state);
      }
      if (details.address.country) {
        setValue('address.country', details.address.country);
      }
      if (details.address.zip) {
        setValue('address.zip', details.address.zip);
      }
    }
  };

  React.useEffect(() => {
    if (!open) return;

    const initializeMap = () => {
      if (!mapContainer.current) {
        setTimeout(initializeMap, 100);
        return;
      }

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        setIsMapLoading(false);
        return;
      }

      mapboxgl.accessToken = token;

      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [72.5714, 23.0225],
          zoom: 12,
        });

        map.current.on('load', () => {
          marker.current = new mapboxgl.Marker({
            draggable: true,
          })
            .setLngLat([72.5714, 23.0225])
            .addTo(map.current!);

          marker.current.on('dragend', async () => {
            const lngLat = marker.current?.getLngLat();
            if (lngLat) {
              setValue('address.latitude', lngLat.lat);
              setValue('address.longitude', lngLat.lng);
              await updateFormWithPlaceDetails(lngLat.lng, lngLat.lat);
            }
          });

          map.current!.on('click', async (e) => {
            const { lng, lat } = e.lngLat;
            marker.current?.setLngLat([lng, lat]);
            setValue('address.latitude', lat);
            setValue('address.longitude', lng);
            await updateFormWithPlaceDetails(lng, lat);
          });

          setIsMapLoading(false);
        });
      } catch (error) {
        setIsMapLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [open, setValue]);

  const handleLocationSelect = async (latitude: number, longitude: number) => {
    setValue('address.latitude', latitude);
    setValue('address.longitude', longitude);
    map.current?.flyTo({
      center: [longitude, latitude],
      zoom: 12,
    });
    marker.current?.setLngLat([longitude, latitude]);
    await updateFormWithPlaceDetails(longitude, latitude);
  };

  const onFormSubmit = async (values: LocationFormData): Promise<void> => {
    try {
      setIsPending(true);
      await onSubmit(values);
      onClose();
    } catch (error) {
      setError('root', {
        type: 'server',
        message: error instanceof Error ? error.message : 'Failed to save location',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initialData ? 'Edit Location' : 'Add New Location'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}

            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <FormControl error={Boolean(errors.name)}>
                  <InputLabel>Location Name</InputLabel>
                  <OutlinedInput {...field} label="Location Name" />
                  {errors.name ? <FormHelperText>{errors.name.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="address.address1"
              render={({ field }) => (
                <FormControl error={Boolean(errors.address?.address1)} fullWidth>
                  <InputLabel>Address 1</InputLabel>
                  <OutlinedInput {...field} label="Address 1" />
                  {errors.address?.address1 ? <FormHelperText>{errors.address.address1.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="address.address2"
              render={({ field }) => (
                <FormControl error={Boolean(errors.address?.address2)} fullWidth>
                  <InputLabel>Address 2</InputLabel>
                  <OutlinedInput {...field} label="Address 2" />
                  {errors.address?.address2 ? <FormHelperText>{errors.address.address2.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Stack direction="row" spacing={2}>
              <Controller
                control={control}
                name="address.city"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.address?.city)} fullWidth>
                    <InputLabel>City</InputLabel>
                    <OutlinedInput {...field} label="City" />
                    {errors.address?.city ? <FormHelperText>{errors.address.city.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="address.zip"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.address?.zip)} fullWidth>
                    <InputLabel>ZIP Code</InputLabel>
                    <OutlinedInput {...field} label="ZIP Code" />
                    {errors.address?.zip ? <FormHelperText>{errors.address.zip.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <Controller
                control={control}
                name="address.state"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.address?.state)} fullWidth>
                    <InputLabel>State</InputLabel>
                    <OutlinedInput {...field} label="State" />
                    {errors.address?.state ? <FormHelperText>{errors.address.state.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="address.country"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.address?.country)} fullWidth>
                    <InputLabel>Country</InputLabel>
                    <OutlinedInput {...field} label="Country" />
                    {errors.address?.country ? <FormHelperText>{errors.address.country.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Stack>

            <Divider>Parking Zones</Divider>

            {fields.map((field, index) => (
              <Stack
                key={field.id}
                spacing={2}
                sx={{ position: 'relative', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              >
                {index > 0 && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      remove(index);
                    }}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <XIcon />
                  </IconButton>
                )}

                <Stack direction="row" spacing={2}>
                  <Controller
                    control={control}
                    name={`parkingZones.${index}.name`}
                    render={({ field: fieldProps }) => (
                      <FormControl error={Boolean(errors.parkingZones?.[index]?.name)} fullWidth>
                        <InputLabel>Zone Name</InputLabel>
                        <OutlinedInput {...fieldProps} label="Zone Name" />
                        {errors.parkingZones?.[index]?.name ? (
                          <FormHelperText>{errors.parkingZones[index].name?.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                  <Controller
                    control={control}
                    name={`parkingZones.${index}.price`}
                    render={({ field: fieldProps }) => (
                      <FormControl error={Boolean(errors.parkingZones?.[index]?.price)} fullWidth>
                        <InputLabel>Price</InputLabel>
                        <OutlinedInput
                          {...fieldProps}
                          type="number"
                          label="Price"
                          onChange={(e) => {
                            fieldProps.onChange(Number(e.target.value));
                          }}
                        />
                        {errors.parkingZones?.[index]?.price ? (
                          <FormHelperText>{errors.parkingZones[index].price?.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Controller
                    control={control}
                    name={`parkingZones.${index}.minutes`}
                    render={({ field: fieldProps }) => (
                      <FormControl error={Boolean(errors.parkingZones?.[index]?.minutes)} fullWidth>
                        <InputLabel>Minutes</InputLabel>
                        <OutlinedInput
                          {...fieldProps}
                          type="number"
                          label="Minutes"
                          onChange={(e) => {
                            fieldProps.onChange(Number(e.target.value));
                          }}
                        />
                        {errors.parkingZones?.[index]?.minutes ? (
                          <FormHelperText>{errors.parkingZones[index].minutes?.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                  <Controller
                    control={control}
                    name={`parkingZones.${index}.totalSlots`}
                    render={({ field: fieldProps }) => (
                      <FormControl error={Boolean(errors.parkingZones?.[index]?.totalSlots)} fullWidth>
                        <InputLabel>Total Slots</InputLabel>
                        <OutlinedInput
                          {...fieldProps}
                          type="number"
                          label="Total Slots"
                          onChange={(e) => {
                            fieldProps.onChange(Number(e.target.value));
                          }}
                        />
                        {errors.parkingZones?.[index]?.totalSlots ? (
                          <FormHelperText>{errors.parkingZones[index].totalSlots?.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Stack>
              </Stack>
            ))}

            <Button
              startIcon={<PlusIcon />}
              onClick={() => {
                append({
                  name: '',
                  price: 0,
                  minutes: 60,
                  totalSlots: 1,
                  availableSlots: 1,
                  status: 'active',
                });
              }}
              variant="outlined"
            >
              Add Parking Zone
            </Button>

            <MapSearch onSelect={handleLocationSelect} />

            <div style={{ position: 'relative', height: '400px', width: '100%' }}>
              {isMapLoading ? <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 1,
                  }}
                >
                  Loading map...
                </div> : null}

              <Card sx={{ height: '100%', width: '100%' }}>
                <CardContent ref={mapContainer} sx={{ height: '100%', width: '100%' }} />
              </Card>
            </div>
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit(onFormSubmit)} disabled={isPending} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
