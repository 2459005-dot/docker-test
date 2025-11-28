import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { FaFacebook, FaGoogle, FaApple } from 'react-icons/fa';
import './style/Login.scss';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 간단한 사용자 데이터베이스 (실제로는 서버에서 가져와야 함)
  const users = [
    { email: '1111@gmail.com', name: '김우진', password: '1111' },
    { email: 'john.doe@gmail.com', name: 'John', password: '1111' },
    { email: 'test@test.com', name: 'Test', password: 'test123' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitted(false);

    if (!email || !name) {
      setError('이메일과 이름을 모두 입력해주세요.');
      return;
    }

    // 사용자 찾기
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.name.toLowerCase() === name.toLowerCase()
    );

    if (user) {
      setPassword(user.password);
      setIsSubmitted(true);
    } else {
      setError('일치하는 사용자 정보를 찾을 수 없습니다.');
    }
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
            <p className="auth-subtitle">비밀번호를 찾아보세요</p>

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
                    placeholder="이름을 입력하세요"
                    required
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn-primary">
                  제출
                </button>
              </form>
            ) : (
              <div className="password-result">
                <div className="result-box">
                  <h2>비밀번호 찾기 결과</h2>
                  <p className="result-label">귀하의 비밀번호는:</p>
                  <div className="password-display">
                    <strong>{password}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigate('/login')}
                  >
                    로그인하기
                  </button>
                </div>
              </div>
            )}

            <div className="divider">
              <span>Or login with</span>
            </div>

            <div className="social-login">
              <button type="button" className="social-btn facebook">
                <FaFacebook />
              </button>
              <button type="button" className="social-btn google">
                <FaGoogle />
              </button>
              <button type="button" className="social-btn apple">
                <FaApple />
              </button>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default ForgotPassword;

