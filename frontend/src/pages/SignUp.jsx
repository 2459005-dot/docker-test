import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FaFacebook, FaGoogle, FaApple } from 'react-icons/fa';
import { RiKakaoTalkFill } from 'react-icons/ri';

// ✅ 내 코드(mine.txt)의 핵심 기능 Import
import { signup, login } from '../api/authApi';
import { getErrorMessage } from '../api/client';
import './style/Login.scss';

const SignUp = () => {
  const navigate = useNavigate();

  // 상태 관리 (mine.txt 로직)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ 통합된 회원가입 핸들러 (mine.txt 로직 100% 유지)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!agreed) {
      setError('동의하기를 체크해주세요.');
      return;
    }

    try {
      // 1. 회원가입 요청
      const fullName = `${formData.lastName}${formData.firstName}`;

      const signupResponse = await signup({
        email: formData.email,
        password: formData.password,
        name: fullName,
        phone: formData.phone
      });

      // 2. 가입 성공 시 자동 로그인 시도
      if (signupResponse.success || signupResponse.resultCode === 201) {
        try {
          const loginResponse = await login({
            email: formData.email,
            password: formData.password
          });

          if (loginResponse.success || loginResponse.resultCode === 200) {
            // 데이터 구조 안전하게 처리
            const responseData = loginResponse.data?.data || loginResponse.data;
            const token = responseData?.token;
            const user = responseData?.user;

            if (token) {
              localStorage.setItem('token', token);
              localStorage.setItem('isLoggedIn', 'true');
              if (user) {
                localStorage.setItem('userInfo', JSON.stringify(user));
                localStorage.setItem('userName', user.name);
              }

              window.dispatchEvent(new Event('storage'));
              window.dispatchEvent(new Event('loginStatusChanged'));

              navigate('/');
            } else {
              // 토큰이 없는 경우 (드문 케이스)
              navigate('/login');
            }
          }
        } catch (loginError) {
          // 가입은 됐는데 자동 로그인이 실패한 경우
          alert('회원가입이 완료되었습니다! 로그인 해주세요.');
          navigate('/login');
        }
      } else {
        setError(signupResponse.message || '회원가입에 실패했습니다.');
      }

    } catch (err) {
      console.error('Signup Error:', err);
      const errorMsg = getErrorMessage(err, '회원가입 중 오류가 발생했습니다.');
      setError(errorMsg);
    }
  };

  // ✅ 소셜 로그인 핸들러 (mine.txt 로직)
  const handleSocialLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/${provider}`;
  };

  return (
    <div className="auth-page signup-page">
      <div className="auth-container">
        {/* 1. 이미지 섹션 (디자인 new.txt: 왼쪽에 배치) */}
        <div className="auth-image-section">
          <div className="image-carousel">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
              alt="Resort"
            />
            <div className="carousel-indicators">
              <span className="indicator active"></span>
              <span className="indicator"></span>
              <span className="indicator"></span>
            </div>
          </div>
        </div>

        {/* 2. 폼 섹션 (디자인 new.txt: 오른쪽에 배치) */}
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <h1 className="auth-title">회원가입</h1>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* 디자인 new.txt: 이름/성을 한 줄(Row)에 배치 */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="lastName">성</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="성"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="firstName">이름</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="이름"
                    required
                  />
                </div>
              </div>

              {/* 디자인 new.txt: 이메일/전화번호를 한 줄(Row)에 배치 */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">이메일</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">전화번호</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">비밀번호</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="비밀번호"
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

              <div className="form-group">
                <label htmlFor="confirmPassword">비밀번호 확인</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="비밀번호 확인"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>이용약관 및 개인정보 처리방침에 동의합니다.</span>
              </label>

              <button type="submit" className="btn-primary">
                계정 생성
              </button>
            </form>

            <div className="auth-footer">
              <span>이미 계정이 있으신가요? </span>
              <Link to="/login" className="signup-link">
                로그인
              </Link>
            </div>

            <div className="divider">
              <span>또는 다음으로 가입하기</span>
            </div>

            {/* 소셜 로그인: 카카오 포함 (mine.txt 기능 + new.txt 스타일) */}
            <div className="social-login">
              <button type="button" className="social-btn google" onClick={() => handleSocialLogin('google')}>
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
              <button type="button" className="social-btn facebook" onClick={() => alert("준비 중입니다.")}>
                <FaFacebook />
              </button>
              <button type="button" className="social-btn apple" onClick={() => alert("준비 중입니다.")}>
                <FaApple />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;