import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api/authApi';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FaFacebook, FaGoogle, FaApple } from 'react-icons/fa';
import './style/Login.scss';

const SignUp = () => {
  const navigate = useNavigate();
  
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

  // ✅ 회원가입 요청 함수
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
      const response = await signup({
        email: formData.email,
        password: formData.password,
        name: `${formData.lastName}${formData.firstName}`, // 이름 합치기
        phone: formData.phone 
      });

      if (response.success || response.resultCode === 201) { 
        alert('회원가입이 완료되었습니다! 로그인 해주세요.');
        navigate('/login');
      } else {
        console.log("❌ 성공 조건문에 걸리지 않음");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      setError(errorMsg);
      console.error('Signup Error:', err);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:3000/api/auth/${provider}`;
  };

  return (
    <div className="auth-page signup-page">
      <div className="auth-container">
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

        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <h1 className="auth-title">회원가입</h1>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                   <label htmlFor="lastName">성</label>
                   <input
                     type="text"
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
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="이름"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">이메일</label>
                  <input
                    type="email"
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

              {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>동의하기</span>
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

            <div className="social-login">
              <button type="button" className="social-btn google" onClick={() => handleSocialLogin('google')}>
                <FaGoogle />
              </button>
              <button type="button" className="social-btn kakao" onClick={() => handleSocialLogin('kakao')} style={{backgroundColor: '#FEE500', color: '#000'}}>
                 K
              </button>
              <button type="button" className="social-btn facebook" onClick={() => alert("준비 중입니다.")}>
                <FaFacebook />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;