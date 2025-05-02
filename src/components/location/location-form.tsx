'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, styled, TextField } from '@mui/material';
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

import { locationRequestSchema, type LocationFormData } from '@/schemas/location';
import { getPlaceDetails } from '@/services/mapbox';
import { Plus as PlusIcon, X as XIcon } from '@phosphor-icons/react/dist/ssr';

import { MapSearch } from './map-search';

interface LocationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: LocationFormData) => Promise<void>;
  initialData?: LocationFormData | null;
}

interface FormError {
  message: string;
  type: string;
}

const TimeTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: theme.palette.background.paper,
    '& fieldset': {
      borderColor: theme.palette.divider,
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
  '& input[type="time"]': {
    padding: '12px 14px',
    fontSize: '1rem',
    '&::-webkit-calendar-picker-indicator': {
      filter: 'invert(0.5)',
      cursor: 'pointer',
      '&:hover': {
        filter: 'invert(0.3)',
      },
    },
  },
}));

export function LocationForm({ open, onClose, onSubmit, initialData }: LocationFormProps): React.JSX.Element {
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [isMapLoading, setIsMapLoading] = React.useState<boolean>(true);
  const [formError, setFormError] = React.useState<FormError | null>(null);
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);
  const marker = React.useRef<mapboxgl.Marker | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LocationFormData>({
    defaultValues: {
      name: '',
      isActive: true,
      isArchived: false,
      addressDto: {
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
      parkingZoneDto: [
        {
          name: '',
          price: 0,
          minutes: 60,
          totalSlots: 1,
          availableSlots: 1,
          status: 'active',
          startTime: '',
          endTime: '',
          slots: '',
        },
      ],
    },
    resolver: zodResolver(locationRequestSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parkingZoneDto',
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        name: '',
        isActive: true,
        isArchived: false,
        addressDto: {
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
        parkingZoneDto: [
          {
            name: '',
            price: 0,
            minutes: 60,
            totalSlots: 1,
            availableSlots: 1,
            status: 'active',
            startTime: '',
            endTime: '',
            slots: '',
          },
        ],
      });
    }
  }, [initialData, reset]);

  const updateFormWithPlaceDetails = async (lng: number, lat: number) => {
    const details = await getPlaceDetails(lng, lat);

    if (details.address) {
      if (details.address.address1) {
        setValue('addressDto.address1', details.address.address1);
      }
      if (details.address.address2) {
        setValue('addressDto.address2', details.address.address2);
      }
      if (details.address.city) {
        setValue('addressDto.city', details.address.city);
      }
      if (details.address.state) {
        setValue('addressDto.state', details.address.state);
      }
      if (details.address.country) {
        setValue('addressDto.country', details.address.country);
      }
      if (details.address.zip) {
        setValue('addressDto.zip', details.address.zip);
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
              setValue('addressDto.latitude', lngLat.lat);
              setValue('addressDto.longitude', lngLat.lng);
              await updateFormWithPlaceDetails(lngLat.lng, lngLat.lat);
            }
          });

          map.current!.on('click', async (e) => {
            const { lng, lat } = e.lngLat;
            marker.current?.setLngLat([lng, lat]);
            setValue('addressDto.latitude', lat);
            setValue('addressDto.longitude', lng);
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
    setValue('addressDto.latitude', latitude);
    setValue('addressDto.longitude', longitude);
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
      setFormError(null);
      await onSubmit(values);
      onClose();
    } catch (error) {
      setFormError({
        message: error instanceof Error ? error.message : 'Failed to save location',
        type: 'error',
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleCloseError = () => {
    setFormError(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initialData ? 'Edit Location' : 'Add New Location'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {formError ? (
              <Alert severity="error" onClose={handleCloseError} sx={{ mb: 2 }}>
                {formError.message}
              </Alert>
            ) : null}

            {Object.keys(errors).length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Please fix the validation errors in the form
              </Alert>
            )}

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
              name="addressDto.address1"
              render={({ field }) => (
                <FormControl error={Boolean(errors.addressDto?.address1)} fullWidth>
                  <InputLabel>Address 1</InputLabel>
                  <OutlinedInput {...field} label="Address 1" />
                  {errors.addressDto?.address1 ? (
                    <FormHelperText>{errors.addressDto.address1.message}</FormHelperText>
                  ) : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="addressDto.address2"
              render={({ field }) => (
                <FormControl error={Boolean(errors.addressDto?.address2)} fullWidth>
                  <InputLabel>Address 2</InputLabel>
                  <OutlinedInput {...field} label="Address 2" />
                  {errors.addressDto?.address2 ? (
                    <FormHelperText>{errors.addressDto.address2.message}</FormHelperText>
                  ) : null}
                </FormControl>
              )}
            />

            <Stack direction="row" spacing={2}>
              <Controller
                control={control}
                name="addressDto.city"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.addressDto?.city)} fullWidth>
                    <InputLabel>City</InputLabel>
                    <OutlinedInput {...field} label="City" />
                    {errors.addressDto?.city ? <FormHelperText>{errors.addressDto.city.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="addressDto.zip"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.addressDto?.zip)} fullWidth>
                    <InputLabel>ZIP Code</InputLabel>
                    <OutlinedInput {...field} label="ZIP Code" />
                    {errors.addressDto?.zip ? <FormHelperText>{errors.addressDto.zip.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <Controller
                control={control}
                name="addressDto.state"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.addressDto?.state)} fullWidth>
                    <InputLabel>State</InputLabel>
                    <OutlinedInput {...field} label="State" />
                    {errors.addressDto?.state ? (
                      <FormHelperText>{errors.addressDto.state.message}</FormHelperText>
                    ) : null}
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="addressDto.country"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.addressDto?.country)} fullWidth>
                    <InputLabel>Country</InputLabel>
                    <OutlinedInput {...field} label="Country" />
                    {errors.addressDto?.country ? (
                      <FormHelperText>{errors.addressDto.country.message}</FormHelperText>
                    ) : null}
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
                    name={`parkingZoneDto.${index}.name`}
                    render={({ field: fieldProps }) => (
                      <FormControl error={Boolean(errors.parkingZoneDto?.[index]?.name)} fullWidth>
                        <InputLabel>Zone Name</InputLabel>
                        <OutlinedInput {...fieldProps} label="Zone Name" />
                        {errors.parkingZoneDto?.[index]?.name ? (
                          <FormHelperText>{errors.parkingZoneDto[index].name?.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                  <Controller
                    control={control}
                    name={`parkingZoneDto.${index}.price`}
                    render={({ field: fieldProps }) => (
                      <FormControl error={Boolean(errors.parkingZoneDto?.[index]?.price)} fullWidth>
                        <InputLabel>Price</InputLabel>
                        <OutlinedInput
                          {...fieldProps}
                          type="number"
                          label="Price"
                          onChange={(e) => {
                            fieldProps.onChange(Number(e.target.value));
                          }}
                        />
                        {errors.parkingZoneDto?.[index]?.price ? (
                          <FormHelperText>{errors.parkingZoneDto[index].price?.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Controller
                    control={control}
                    name={`parkingZoneDto.${index}.minutes`}
                    render={({ field: fieldProps }) => (
                      <FormControl error={Boolean(errors.parkingZoneDto?.[index]?.minutes)} fullWidth>
                        <InputLabel>Minutes</InputLabel>
                        <OutlinedInput
                          {...fieldProps}
                          type="number"
                          label="Minutes"
                          onChange={(e) => {
                            fieldProps.onChange(Number(e.target.value));
                          }}
                        />
                        {errors.parkingZoneDto?.[index]?.minutes ? (
                          <FormHelperText>{errors.parkingZoneDto[index].minutes?.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                  <Controller
                    control={control}
                    name={`parkingZoneDto.${index}.totalSlots`}
                    render={({ field: fieldProps }) => (
                      <FormControl error={Boolean(errors.parkingZoneDto?.[index]?.totalSlots)} fullWidth>
                        <InputLabel>Total Slots</InputLabel>
                        <OutlinedInput
                          {...fieldProps}
                          type="number"
                          label="Total Slots"
                          onChange={(e) => {
                            fieldProps.onChange(Number(e.target.value));
                          }}
                        />
                        {errors.parkingZoneDto?.[index]?.totalSlots ? (
                          <FormHelperText>{errors.parkingZoneDto[index].totalSlots?.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Controller
                    control={control}
                    name={`parkingZoneDto.${index}.startTime`}
                    render={({ field: fieldProps }) => (
                      <FormControl error={Boolean(errors.parkingZoneDto?.[index]?.startTime)} fullWidth>
                        <TimeTextField
                          {...fieldProps}
                          label="Opening Time"
                          type="time"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            step: 300, // 5 min
                          }}
                          fullWidth
                          placeholder="Select time"
                        />
                        {errors.parkingZoneDto?.[index]?.startTime ? (
                          <FormHelperText>{errors.parkingZoneDto[index].startTime?.message}</FormHelperText>
                        ) : null}
                      </FormControl>
                    )}
                  />
                  <Controller
                    control={control}
                    name={`parkingZoneDto.${index}.endTime`}
                    render={({ field: fieldProps }) => (
                      <FormControl error={Boolean(errors.parkingZoneDto?.[index]?.endTime)} fullWidth>
                        <TimeTextField
                          {...fieldProps}
                          label="Closing Time"
                          type="time"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            step: 300, // 5 min
                          }}
                          fullWidth
                          placeholder="Select time"
                        />
                        {errors.parkingZoneDto?.[index]?.endTime ? (
                          <FormHelperText>{errors.parkingZoneDto[index].endTime?.message}</FormHelperText>
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
                  startTime: '',
                  endTime: '',
                });
              }}
              variant="outlined"
            >
              Add Parking Zone
            </Button>

            <MapSearch onSelect={handleLocationSelect} />

            <div style={{ position: 'relative', height: '400px', width: '100%' }}>
              {isMapLoading ? (
                <div
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
                </div>
              ) : null}

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
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
