import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../api/authApi'; // ✅ 우리가 만든 로그아웃 함수 import
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
  
  // 초기값 설정
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // localStorage에서 사용자 정보 불러오기
  const loadUserName = () => {
    const stored = localStorage.getItem('userInfo'); // Login.jsx 등에서 userInfo 저장 여부 확인 필요
    // 만약 userInfo 객체로 저장 안했다면 userName, userEmail 각각 가져와야 함.
    // 일단 안전하게 각각 가져오는 로직으로 수정
    const name = localStorage.getItem('userName');
    return name || 'Tomhoon';
  };

  const [userName, setUserName] = useState(loadUserName);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    // 상태 업데이트 함수
    const updateAuthStatus = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
      const name = localStorage.getItem('userName');
      setUserName(name || 'Tomhoon');
    };

    // 이벤트 리스너 등록
    window.addEventListener('loginStatusChanged', updateAuthStatus);
    window.addEventListener('storage', updateAuthStatus);

    // 초기 실행
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

  // ✅ [수정됨] 로그아웃 로직 교체
  const handleLogoutClick = async () => {
    setIsDropdownOpen(false); // 드롭다운 닫기
    await logout(); // authApi.js의 logout 함수 호출 (백엔드 요청 + 로컬스토리지 청소)
    // logout 함수 내부에서 window.location.href = '/login' 등을 할 수도 있지만,
    // 여기서 navigate를 써도 무방함 (authApi.js 구현에 따라 다름)
    navigate('/login'); 
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