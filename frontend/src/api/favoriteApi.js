import api from './client';

/**
 * 찜하기(북마크) 관련 API
 * 백엔드 라우트: /api/bookmarks
 */

// 1. 찜한 숙소 목록 조회
export const getFavorites = async () => {
  // GET /api/bookmarks
  const { data } = await api.get('/bookmarks');
  return data;
};

// 2. 찜하기 추가
export const addFavorite = async (lodgingId) => {
  // POST /api/bookmarks, body: { lodgingId: "..." }
  const { data } = await api.post('/bookmarks', { lodgingId });
  return data;
};

// 3. 찜하기 삭제
export const removeFavorite = async (lodgingId) => {
  // DELETE /api/bookmarks/:lodgingId
  const { data } = await api.delete(`/bookmarks/${lodgingId}`);
  return data;
};