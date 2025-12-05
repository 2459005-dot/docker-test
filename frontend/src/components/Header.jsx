import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../api/authApi'; // ✅ 로그아웃 API 연동 유지
import {
  FiHeart,
  FiUser,
  FiBell,
  FiLogOut,
  FiCalendar,
  FiChevronRight,
} from 'react-icons/fi';
import './style/Header.scss';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const isSearchPage = location.pathname === '/search';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 초기값 설정 (내 코드의 로직 유지)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // localStorage에서 사용자 정보 불러오기
  const loadUserName = () => {
    // 안전하게 이름 가져오기
    const name = localStorage.getItem('userName');
    return name || 'Tomhoon';
  };

  const [userName, setUserName] = useState(loadUserName);
  const profileMenuRef = useRef(null);

  // ✅ 로그인 상태 감지 및 사용자 정보 업데이트 (내 코드의 로직 유지)
  useEffect(() => {
    const updateAuthStatus = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
      const name = localStorage.getItem('userName');
      setUserName(name || 'Tomhoon');
    };

    window.addEventListener('loginStatusChanged', updateAuthStatus);
    window.addEventListener('storage', updateAuthStatus);

    updateAuthStatus();

    return () => {
      window.removeEventListener('loginStatusChanged', updateAuthStatus);
      window.removeEventListener('storage', updateAuthStatus);
    };
  }, []);

  const handleFavoritesClick = () => {
    navigate('/favorites');
  };

  const handleBookingHistoryClick = () => {
    navigate('/booking-confirmation');
  };

  const handleProfileToggle = (event) => {
    event?.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  // ✅ 로그아웃 로직 (내 코드의 API 연동 유지)
  const handleLogoutClick = async () => {
    setIsDropdownOpen(false);
    await logout(); // 백엔드 세션 종료 및 로컬스토리지 클리어
    navigate('/login'); 
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="inner">
        {/* ✨ 로고 디자인 교체 (최신 코드의 디자인 적용) */}
        <Link to="/" className="logo-link">
          <div className="logo-mark">
            <span className="logo-mark__initial">H</span>
            <span className="logo-mark__dot" />
          </div>
          <div className="logo-text">
            <h1 className="logo">HotelBnB</h1>
            <span className="logo-tagline">Stay better with HotelBnB</span>
          </div>
        </Link>
        
        <div className="header-actions">
          {isLoggedIn ? (
            <>
              <div className={`profile-menu ${isDropdownOpen ? 'dropdown-open' : ''}`} ref={profileMenuRef}>
                <button
                  type="button"
                  className="profile-trigger"
                  onClick={handleProfileToggle}
                  onMouseDown={(e) => e.stopPropagation()}
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <div className="avatar"></div>
                  <div className="profile-info">
                    <strong>{userName}</strong>
                    <span>Online</span>
                  </div>
                </button>
                <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="menu-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/account');
                    }}
                  >
                    <div className="menu-main">
                      <FiUser />
                      <span>계정</span>
                    </div>
                    <FiChevronRight className="menu-arrow" />
                  </button>
                  <button
                    type="button"
                    className="menu-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleFavoritesClick();
                    }}
                  >
                    <div className="menu-main">
                      <FiHeart />
                      <span>찜 내역</span>
                    </div>
                    <FiChevronRight className="menu-arrow" />
                  </button>
                  <button
                    type="button"
                    className="menu-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleBookingHistoryClick();
                    }}
                  >
                    <div className="menu-main">
                      <FiCalendar />
                      <span>예약내역</span>
                    </div>
                    <FiChevronRight className="menu-arrow" />
                  </button>
                </div>
              </div>
              <div className="divider"></div>
              <button className="btn icon" onClick={handleLogoutClick}>
                <FiLogOut />
                <span>로그아웃</span>
              </button>
            </>
          ) : (
            <button className="btn primary" onClick={handleLoginClick}>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;