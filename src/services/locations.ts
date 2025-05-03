import {
  type ApiResponse,
  type LocationFormData,
  type LocationResponse,
  type ParkingListData,
} from '@/schemas/location';

import { type Node } from '@/components/parking-layout/types';

import { apiClient } from './api-client';

// import { apiClient } from './api-client';

export async function createLocation(data: LocationFormData): Promise<LocationResponse> {
  const response = await apiClient.post<ApiResponse<LocationResponse>>('/Parking/AddEditParking', data);
  return response.data;
}

export async function getLocations(): Promise<ParkingListData> {
  const response = await apiClient.post<ApiResponse<ParkingListData>>('/Parking/GetAllParking', {});
  return response.data;
}

export async function updateLocation(data: LocationFormData): Promise<LocationResponse> {
  const response = await apiClient.post<ApiResponse<LocationResponse>>('/Parking/AddEditParking', data);
  return response.data;
}

export async function deleteLocation(id: string): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/Parking/DeleteParking/${id}`);
}

export async function saveZoneSlotLayout(zoneId: number, nodes: Node[]): Promise<void> {
  await apiClient.post(`/ParkingSlot/AddEditSlot`, {
    id: zoneId,
    parkingSlotItemDto: nodes.map((node) => ({
      id: node.id,
      label: node.label,
      type: node.type,
      x: node.x,
      y: node.y,
      width: node.width || 60,
      height: node.height || 30,
    })),
  });
}

export async function getZoneSlotLayout(zoneId: number): Promise<{ slots: Node[] }> {
  const response = await apiClient.post<{ data: { slots: Node[] } }>(`/ParkingSlot/GetSlot/${zoneId}`, {});
  return response.data;
}
