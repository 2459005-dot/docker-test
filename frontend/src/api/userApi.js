import api from './client';

/**
 * 사용자 정보 관련 API
 */

// 사용자 정보 조회
export const getUserInfo = async () => {
  const { data } = await api.get('/user/info');
  return data;
};

// 사용자 정보 수정
export const updateUserInfo = async (userInfo) => {
  const { data } = await api.put('/user/info', userInfo);
  return data;
};

// 비밀번호 변경
export const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await api.put('/user/password', {
    currentPassword,
    newPassword,
  });
  return data;
};

