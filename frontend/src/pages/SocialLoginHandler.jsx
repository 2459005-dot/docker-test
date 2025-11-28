// frontend/src/pages/SocialLoginHandler.jsx

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SocialLoginHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      console.log("✅ 소셜 로그인 성공! 새 토큰:", token);

      // 🚨 1. 혹시 남아있을지 모르는 기존 쓰레기 청소
      localStorage.clear(); 
      // (또는 필요한 것만 removeItem 하셔도 됩니다)

      // 🚨 2. 새로운 토큰 저장
      localStorage.setItem('token', token);
      localStorage.setItem('isLoggedIn', 'true');
      
      // 3. 상태 갱신 이벤트
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('loginStatusChanged'));

      // 4. 메인으로 이동
      navigate('/');
    } else {
      console.error("❌ 토큰 없음");
      alert("소셜 로그인 실패");
      navigate('/login');
    }
  }, [navigate, searchParams]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>로그인 처리 중입니다...</h2>
    </div>
  );
};

export default SocialLoginHandler;