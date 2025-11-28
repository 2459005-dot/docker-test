import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const isSearchPage = location.pathname === '/search';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // localStorage에서 사용자 정보 불러오기
  const loadUserName = () => {
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      try {
        const userInfo = JSON.parse(stored);
        return userInfo.name || 'Tomhoon';
      } catch (error) {
        console.error('Failed to load user info', error);
      }
    }
    return 'Tomhoon';
  };

  const [userName, setUserName] = useState(loadUserName);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    // localStorage 변경 감지
    const checkLoginStatus = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    };

    // 사용자 정보 변경 감지
    const checkUserInfo = () => {
      const stored = localStorage.getItem('userInfo');
      if (stored) {
        try {
          const userInfo = JSON.parse(stored);
          setUserName(userInfo.name || 'Tomhoon');
        } catch (error) {
          console.error('Failed to load user info', error);
        }
      }
    };

    // storage 이벤트 리스너 (다른 탭에서 변경 시)
    const handleStorage = (e) => {
      if (e.key === 'isLoggedIn') {
        checkLoginStatus();
      } else if (e.key === 'userInfo') {
        checkUserInfo();
      }
    };

    // 커스텀 이벤트 리스너 (같은 탭에서의 변경 감지)
    window.addEventListener('loginStatusChanged', checkLoginStatus);
    // 사용자 정보 변경 이벤트 리스너
    window.addEventListener('userInfoChanged', checkUserInfo);
    // storage 이벤트 리스너
    window.addEventListener('storage', handleStorage);

    // 초기 로드
    checkUserInfo();

    return () => {
      window.removeEventListener('loginStatusChanged', checkLoginStatus);
      window.removeEventListener('userInfoChanged', checkUserInfo);
      window.removeEventListener('storage', handleStorage);
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

  const handleLogoutClick = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    // 로그인 상태 변경 이벤트 발생
    window.dispatchEvent(new Event('loginStatusChanged'));
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

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
        <Link to="/" className="logo-link">
          <h1 className="logo">Hotels</h1>
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

