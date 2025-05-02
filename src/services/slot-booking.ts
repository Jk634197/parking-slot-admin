import { apiService } from '@/lib/api-service';

interface BookSlotRequest {
  userId: number;
  parkingSlotsId: number;
  vehicleNumber?: string;
  startTime?: string;
  endTime?: string;
  minutes?: number;
  [key: string]: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface BookSlotResponse {
  id: number;
  parkingSlotsId: number;
  userId: number;
  vehicleNumber: string;
  startTime: string;
  endTime: string;
  minutes: number;
  price: number;
}

export const slotBookingService = {
  async bookSlot(request: BookSlotRequest): Promise<ApiResponse<BookSlotResponse>> {
    const response = await apiService.post<ApiResponse<BookSlotResponse>>('/SlotBooking/AddEditBookSlot', request);
    return response;
  },
};
