import api from './client';

/**
 * 숙소 관련 API
 */

// 숙소 검색
export const searchHotels = async (searchParams) => {
  const { data } = await api.get('/hotels/search', { params: searchParams });
  return data;
};

// 숙소 상세 정보 조회
export const getHotelDetail = async (hotelId) => {
  const { data } = await api.get(`/hotels/${hotelId}`);
  return data;
};

// 인기 숙소 추천
export const getRecommendedHotels = async (limit = 4) => {
  const { data } = await api.get('/hotels/recommended', { params: { limit } });
  return data;
};

