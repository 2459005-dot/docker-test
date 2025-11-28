import api from './client';

/**
 * 인증 관련 API
 */

// 로그인
export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', {
    email,
    password,
  });
  return data;
};

// 회원가입
// 기존: firstName, lastName → 통합: name
export const signup = async ({ name, email, phone, password }) => {
  const { data } = await api.post('/auth/register', {
    name,
    email,
    phoneNumber: phone,
    password,
  });
  return data;
};

// 비밀번호 찾기
export const forgotPassword = async ({ email, name }) => {
  const { data } = await api.post('/auth/forgot-password', {
    email,
    name,
  });
  return data;
};

// 현재 사용자 정보 조회
export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

// 로그아웃
export const logout = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

