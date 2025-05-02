import { type LocationFormData } from '@/schemas/location';

// import { apiClient } from './api-client';

const locations: LocationFormData[] = [
  {
    id: '1',
    name: 'Downtown Parking',
    address: {
      address1: '123 Main St',
      address2: 'Suite 100',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zip: '10001',
      status: 'active',
      latitude: 40.7128,
      longitude: -74.006,
    },
    parkingZones: [
      {
        id: 'zone1',
        name: 'Zone A',
        price: 25,
        minutes: 60,
        totalSlots: 50,
        availableSlots: 35,
        status: 'active',
      },
      {
        id: 'zone2',
        name: 'Zone B',
        price: 30,
        minutes: 120,
        totalSlots: 30,
        availableSlots: 20,
        status: 'active',
      },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Central Parking',
    address: {
      address1: '456 Main St',
      address2: 'Suite 200',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      zip: '90038',
      status: 'active',
      latitude: 34.0522,
      longitude: -118.2437,
    },
    parkingZones: [
      {
        id: 'zone1',
        name: 'Zone A',
        price: 10,
        minutes: 60,
        totalSlots: 40,
        availableSlots: 25,
        status: 'active',
      },
      {
        id: 'zone2',
        name: 'Zone B',
        price: 15,
        minutes: 120,
        totalSlots: 30,
        availableSlots: 15,
        status: 'active',
      },
    ],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

export async function createLocation(data: LocationFormData): Promise<LocationFormData> {
  // try {
  // console.log('Creating location:', data);
  // const response = await apiClient.post<ApiResponse<LocationFormData>>('/api/Location/create', data);
  // console.log('Create location response:', response);
  locations.push(data);
  return data;
  // } catch (error) {
  //   throw error;
  // }
}

export async function getLocations(): Promise<LocationFormData[]> {
  // try {
  // console.log('Fetching locations...');
  // const response = await apiClient.get<ApiResponse<LocationFormData[]>>('/api/Location/getAll');
  // console.log('Get locations response:', response);
  // return response.data;
  return locations;
  // } catch (error) {
  //   throw error;
  // }
}

export async function updateLocation(id: string, data: LocationFormData): Promise<LocationFormData> {
  // try {
  // console.log('Updating location:', { id, data });
  // const response = await apiClient.put<ApiResponse<LocationFormData>>(`/api/Location/update/${id}`, data);
  // console.log('Update location response:', response);
  // return response.data;
  const index = locations.findIndex((location) => location.id === id);
  if (index !== -1) {
    locations[index] = data;
  }
  return data;
  // } catch (error) {
  //   throw error;
  // }
}

export async function deleteLocation(id: string): Promise<void> {
  // try {
  // console.log('Deleting location:', id);
  // await apiClient.delete<ApiResponse<void>>(`/api/Location/delete/${id}`);
  // console.log('Location deleted successfully');
  const index = locations.findIndex((location) => location.id === id);
  if (index !== -1) {
    locations.splice(index, 1);
  }

  // } catch (error) {
  //   throw error;
  // }
}
