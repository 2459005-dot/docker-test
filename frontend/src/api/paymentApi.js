import api from './client';

/**
 * 결제수단 관련 API
 */

// 결제수단 목록 조회
export const getPaymentMethods = async () => {
  const { data } = await api.get('/user/payment-methods');
  return data;
};

// 결제수단 추가
export const addPaymentMethod = async (cardInfo) => {
  const { data } = await api.post('/user/payment-methods', cardInfo);
  return data;
};

// 결제수단 삭제
export const deletePaymentMethod = async (cardId) => {
  const { data } = await api.delete(`/user/payment-methods/${cardId}`);
  return data;
};

