import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FaFacebook, FaGoogle, FaApple } from 'react-icons/fa';
import { RiKakaoTalkFill } from 'react-icons/ri';

// ✅ 내 코드(mine.txt)의 핵심 기능 Import
import { login } from '../api/authApi';
import { getErrorMessage } from '../api/client'; // 이제 사용 가능!
import './style/Login.scss';

const Login = () => {
  const navigate = useNavigate();
  
  // 상태 관리 (mine.txt 로직)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // 디자인 요소: 슬라이드 이미지 (new.txt)
  const slides = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
  ];

  // 슬라이드 타이머 (mine.txt 로직)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  // ✅ 로그인 핸들러 (mine.txt 기능 100% 복구)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 실제 로그인 API 호출
      const response = await login({ email, password });

      // 로그인 성공 시 토큰 및 사용자 정보 저장
      // Backend 응답 구조 대응: response.data.token 또는 response.data.data.token
      // (mine.txt에 있던 안전한 로직 그대로 적용)
      if (response.data?.token || (response.data?.data && response.data.data.token)) {
        const token = response.data?.token || response.data?.data?.token;
        const user = response.data?.user || response.data?.data?.user || response.data?.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('isLoggedIn', 'true');
        if (user) {
          localStorage.setItem('userInfo', JSON.stringify(user));
        }
        
        // 전역 상태 업데이트 트리거
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('loginStatusChanged'));
        
        navigate('/');
      } else {
          // 성공 응답이지만 토큰이 없는 경우 (예외 처리)
          setError('로그인 처리에 실패했습니다. (토큰 없음)');
      }
    } catch (err) {
      // ✅ api/client.js의 헬퍼 함수 사용
      setError(getErrorMessage(err, '이메일 또는 비밀번호가 올바르지 않습니다.'));
    }
  };

  // ✅ 소셜 로그인 핸들러 (mine.txt 기능)
  const handleSocialLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/${provider}`;
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-container">
        {/* 왼쪽: 로그인 폼 섹션 */}
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <h1 className="auth-title">Login</h1>
            <p className="auth-subtitle">로그인해주세요</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                {/* 비밀번호 토글 디자인 적용 (new.txt 구조) */}
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>비밀번호기억하기</span>
                </label>
                <Link to="/forgot-password" className="forgot-password">
                  비밀번호 찾기
                </Link>
              </div>

              <button type="submit" className="btn-primary">
                Login
              </button>
            </form>

            <div className="auth-footer">
              <Link to="/signup" className="signup-link">
                회원가입
              </Link>
            </div>

            <div className="divider">
              <span>Or login with</span>
            </div>

            {/* 소셜 로그인 버튼: 디자인 new.txt + 기능 mine.txt */}
            <div className="social-login">
              <button 
                type="button" 
                className="social-btn google" 
                onClick={() => handleSocialLogin('google')}
              >
                <FaGoogle />
              </button>

              <button 
                type="button" 
                className="social-btn kakao" 
                onClick={() => handleSocialLogin('kakao')}
                style={{ backgroundColor: '#FEE500', color: '#000', border: 'none' }}
              >
                <RiKakaoTalkFill />
              </button>

              <button 
                type="button" 
                className="social-btn facebook" 
                onClick={() => alert("준비 중입니다.")}
              >
                <FaFacebook />
              </button>
              
              <button 
                type="button" 
                className="social-btn apple" 
                onClick={() => alert("준비 중입니다.")}
              >
                <FaApple />
              </button>
            </div>
          </div>
        </div>

        {/* 오른쪽: 이미지 슬라이더 (new.txt 디자인) */}
        <div className="auth-image-section">
          <div className="image-carousel">
            {slides.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`Resort ${index + 1}`}
                className={index === currentSlide ? 'active' : ''}
              />
            ))}
            <div className="carousel-indicators">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`이미지 ${index + 1} 보기`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;