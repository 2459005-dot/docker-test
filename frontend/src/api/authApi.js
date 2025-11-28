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

// 🚨 [수정] 로그를 찍어서 확인하는 getMe 함수
export const getMe = async () => {
  // 1. 요청 보내기 전에 토큰이 있는지 확인
  const token = localStorage.getItem('token');

  // 2. API 호출
  const response = await api.get('/auth/me');
  
  return response.data;
};

// 로그아웃
export const logout = async () => {
  try {
    // 1. 백엔드에 쿠키 삭제 요청
    await api.post('/auth/logout');
  } catch (error) {
    console.error("로그아웃 요청 실패:", error);
  } finally {
    // 2. 프론트엔드 정보 싹 지우기 (필수)
    localStorage.clear(); 
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('loginStatusChanged'));

    // 3. 카카오 로그아웃 처리
    // .env 파일에서 키 가져오기
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_API_KEY;
    const LOGOUT_REDIRECT_URI = "http://localhost:5173/login"; // 로그아웃 후 돌아올 주소

    // 키가 있으면 카카오 로그아웃 URL로 이동, 없으면 그냥 로그인 페이지로 이동
    if (KAKAO_CLIENT_ID) {
      window.location.href = `https://kauth.kakao.com/oauth/logout?client_id=${KAKAO_CLIENT_ID}&logout_redirect_uri=${LOGOUT_REDIRECT_URI}`;
    } else {
      // 키 설정이 안 되어있을 경우 대비
      window.location.href = '/login';
    }
  }
};

// 내 정보 수정
export const updateUserInfo = async (data) => {
  const payload = { ...data };
  if (payload.phone) {
    payload.phoneNumber = payload.phone;
    delete payload.phone;
  }

  const { data: responseData } = await api.patch('/auth/me', payload);
  return responseData;
};