import axios from 'axios';

// API 기본 URL (환경 변수에서 가져오거나 기본값 사용)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const code = error?.response?.status;

    // 401, 403 에러 시 로그아웃 처리
    if (code === 401 || code === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('isLoggedIn');
      window.dispatchEvent(new Event('loginStatusChanged'));
    }

    return Promise.reject(error);
  }
);

// 에러 메시지 추출 헬퍼 함수
export function getErrorMessage(error, fallback = '요청 실패') {
  return error.response?.data?.message || error.message || fallback;
}

export default api;

