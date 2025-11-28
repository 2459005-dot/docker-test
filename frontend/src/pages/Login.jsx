import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/authApi'; // ✅ 우리가 만든 API 함수 import
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FaFacebook, FaGoogle, FaApple } from 'react-icons/fa';
import { RiKakaoTalkFill } from 'react-icons/ri';
import './style/Login.scss';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  // ✅ 실제 로그인 요청 함수
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. 백엔드 API 호출
      const response = await login({ email, password });

      // 🚨 [디버깅] F12 콘솔에서 이 내용을 확인해보세요!
      console.log("👉 로그인 응답 전체:", response);

      // 2. 성공 처리
      // success가 true이거나, resultCode가 200이면 성공으로 취급
      if (response.success || response.resultCode === 200) {
        
        // 토큰 저장
        localStorage.setItem('token', response.data.token);
        
        if (response.data.user) {
           localStorage.setItem('userEmail', response.data.user.email);
           localStorage.setItem('userName', response.data.user.name);
        }
        localStorage.setItem('isLoggedIn', 'true');

        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('loginStatusChanged'));

        // alert("로그인 되었습니다"); // 확인용 얼럿
        navigate('/'); // 메인으로 이동
      } else {
        // 성공 응답이 아닌 경우
        setError(response.message || '로그인에 실패했습니다.');
        console.log("❌ 성공 조건 통과 못함:", response);
      }
    } catch (err) {
      console.error("Login Error:", err);
      const errorMsg = err.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.';
      setError(errorMsg);
    }
  };

  // ✅ 소셜 로그인 핸들러
  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:3000/api/auth/${provider}`;
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-container">
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

            <div className="social-login">
              {/* 구글 */}
              <button type="button" className="social-btn google" onClick={() => handleSocialLogin('google')}>
                <FaGoogle />
              </button>

              {/* 카카오 (아이콘이 없으면 텍스트 K로 대체하거나 RiKakaoTalkFill 사용) */}
              <button type="button" className="social-btn kakao" onClick={() => handleSocialLogin('kakao')} style={{ backgroundColor: '#FEE500', color: '#000' }}>
                <RiKakaoTalkFill />
              </button>

              {/* 페이스북, 애플 (미구현) */}
              <button type="button" className="social-btn facebook" onClick={() => alert("준비 중입니다.")}>
                <FaFacebook />
              </button>
              <button type="button" className="social-btn apple" onClick={() => alert("준비 중입니다.")}>
                <FaApple />
              </button>
            </div>
          </div>
        </div>

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