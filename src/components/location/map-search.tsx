'use client';

import * as React from 'react';
import { Autocomplete, TextField } from '@mui/material';

import { useDebounce } from '../../hooks/use-debounce';

interface SearchResult {
  place_name: string;
  center: [number, number];
}

interface MapSearchProps {
  onSelect: (latitude: number, longitude: number) => void;
}

export function MapSearch({ onSelect }: MapSearchProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  React.useEffect(() => {
    const searchPlaces = async () => {
      if (!debouncedSearchTerm) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            debouncedSearchTerm
          )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
        );
        const data = (await response.json()) as { features: SearchResult[] };
        setResults(data.features);
      } catch (error) {
        // Log error to monitoring service instead of console
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    void searchPlaces();
  }, [debouncedSearchTerm]);

  return (
    <Autocomplete
      freeSolo
      options={results}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.place_name)}
      loading={loading}
      inputValue={searchTerm}
      onInputChange={(_, value) => {
        setSearchTerm(value);
      }}
      onChange={(_, value) => {
        if (value && typeof value !== 'string') {
          const [longitude, latitude] = value.center;
          onSelect(latitude, longitude);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search location"
          variant="outlined"
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? 'Loading...' : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}
