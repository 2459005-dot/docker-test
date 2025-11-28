import api from './client';

/**
 * 예약 관련 API
 */

// 예약 생성
export const createBooking = async (bookingData) => {
  const { data } = await api.post('/bookings', bookingData);
  return data;
};

// 예약 내역 조회
export const getBookings = async () => {
  const { data } = await api.get('/bookings');
  return data;
};

// 예약 상세 조회
export const getBookingDetail = async (bookingId) => {
  const { data } = await api.get(`/bookings/${bookingId}`);
  return data;
};

// 예약 취소
export const cancelBooking = async (bookingId) => {
  const { data } = await api.delete(`/bookings/${bookingId}`);
  return data;
};

