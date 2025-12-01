// hotelApi.js를 이름 맞추기 위해 lodgingApi.js로 변경
import api from './client';

// 1. 숙소 목록 조회 (메인, 검색결과 페이지용)
// params 예시: { loc: '서울', category: '호텔', page: 1 }
export const getLodgings = async (params) => {
  const { data } = await api.get('/lodgings', { params });
  return data;
};

// 2. 숙소 상세 조회 (상세 페이지용)
export const getLodgingDetail = async (id) => {
  const { data } = await api.get(`/lodgings/${id}`);
  return data;
};

// 3. 객실 목록 조회 (상세 페이지용)
export const getRooms = async (lodgingId) => {
  const { data } = await api.get(`/rooms/${lodgingId}`);
  return data;
};