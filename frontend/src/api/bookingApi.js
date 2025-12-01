import api from './client';

/**
 * 예약 관련 API
 */

// 1. 예약 생성
// 백엔드: POST / (라우터가 /bookings에 연결됨) -> /api/bookings
// 프론트: /bookings 로 요청
export const createBooking = async (bookingData) => {
  const { data } = await api.post('/bookings', bookingData);
  return data;
};

// 2. 내 예약 목록 조회 (수정됨 🚨)
// 백엔드: GET /me (라우터가 /bookings에 연결됨) -> /api/bookings/me
// 프론트: 그냥 /me로 하면 /api/me로 감 -> /bookings/me 로 수정해야 함
export const getMyBookings = async () => {
  const { data } = await api.get('/bookings/me'); 
  return data;
};

// 3. 예약 상세 조회 (참고: 백엔드 코드에 이 라우트가 없는 것 같습니다!)
// 만약 백엔드에 router.get("/:id", ...)가 없다면 에러(404)가 납니다.
// 필요하다면 백엔드 route.js에 추가해야 합니다.
export const getBookingDetail = async (bookingId) => {
  const { data } = await api.get(`/bookings/${bookingId}`);
  return data;
};

// 4. 예약 취소 (수정됨 🚨)
// 백엔드: PATCH /:id/cancel -> /api/bookings/:id/cancel
// 프론트: DELETE /bookings/:id (틀림) -> PATCH /bookings/:id/cancel (맞음)
export const cancelBooking = async (bookingId) => {
  // 메소드: delete -> patch
  // 주소: /bookings/${bookingId} -> /bookings/${bookingId}/cancel
  const { data } = await api.patch(`/bookings/${bookingId}/cancel`);
  return data;
};