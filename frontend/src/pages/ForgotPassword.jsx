import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../api/authApi'; // ✅ API import
import { FiArrowLeft } from 'react-icons/fi';
import { FaFacebook, FaGoogle, FaApple } from 'react-icons/fa';
import { RiKakaoTalkFill } from 'react-icons/ri';
import './style/Login.scss';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [tempPassword, setTempPassword] = useState(''); // 임시 비번 저장용
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitted(false);

    if (!email || !name) {
      setError('이메일과 이름을 모두 입력해주세요.');
      return;
    }

    try {
      // ✅ 백엔드 요청
      const response = await forgotPassword({ email, name });

      if (response.success) {
        setTempPassword(response.data.tempPassword); // 임시 비번 받아서 저장
        setIsSubmitted(true);
      } else {
        setError(response.message || '일치하는 사용자 정보를 찾을 수 없습니다.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || '오류가 발생했습니다.';
      setError(errorMsg);
    }
  };

  // ... (소셜 로그인 핸들러 필요 시 추가)
  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:3000/api/auth/${provider}`;
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-container">
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <Link to="/login" className="back-link">
              <FiArrowLeft />
              <span>로그인으로 돌아가기</span>
            </Link>

            <h1 className="auth-title">비밀번호 찾기</h1>
            <p className="auth-subtitle">가입한 이메일과 이름을 입력하세요.<br/>임시 비밀번호가 발급됩니다.</p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">이메일</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력하세요"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="name">이름</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="가입 시 이름을 입력하세요"
                    required
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn-primary">
                  비밀번호 재설정
                </button>
              </form>
            ) : (
              <div className="password-result">
                <div className="result-box">
                  <h2>임시 비밀번호 발급 완료</h2>
                  <p className="result-label">아래 비밀번호로 로그인 후 변경해주세요:</p>
                  <div className="password-display" style={{letterSpacing: '2px', fontSize: '1.2rem'}}>
                    <strong>{tempPassword}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigate('/login')}
                  >
                    로그인하러 가기
                  </button>
                </div>
              </div>
            )}

            <div className="divider">
              <span>Or login with</span>
            </div>

            <div className="social-login">
              <button type="button" className="social-btn google" onClick={() => handleSocialLogin('google')}>
                <FaGoogle />
              </button>
              <button type="button" className="social-btn kakao" onClick={() => handleSocialLogin('kakao')} style={{backgroundColor: '#FEE500', color: '#000'}}>
                 <RiKakaoTalkFill />
              </button>
              <button type="button" className="social-btn facebook" onClick={() => alert("준비 중입니다.")}>
                <FaFacebook />
              </button>
            </div>
          </div>
        </div>

        <div className="auth-image-section">
          {/* 이미지 섹션 그대로 유지 */}
          <div className="image-carousel">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
              alt="Resort"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;