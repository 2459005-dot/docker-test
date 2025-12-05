import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // ✅ 페이지 새로고침 방지
import { FiUser, FiHeart, FiArrowUp, FiGlobe, FiPlus, FiX } from 'react-icons/fi'; // ✅ 아이콘 통일
import './style/QuickActions.scss';

const QuickActions = () => {
  const [open, setOpen] = useState(false);

  // 최상단으로 스크롤 이동
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setOpen(false); // 동작 후 메뉴 닫기
  };

  // 링크 클릭 시 메뉴 닫기
  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <div className={`quick-actions ${open ? 'quick-actions--open' : ''}`}>
      {/* 토글 버튼 */}
      <button
        className="quick-actions__toggle"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="퀵 액션 열기"
      >
        {/* 열려있으면 X, 닫혀있으면 + 아이콘 표시 */}
        {open ? <FiX size={24} /> : <FiPlus size={24} />}
      </button>

      <div className="quick-actions__items">
        {/* 1. 마이페이지 */}
        <Link 
          to="/account" 
          className="quick-actions__item" 
          aria-label="마이페이지"
          onClick={handleLinkClick}
        >
          <FiUser />
        </Link>

        {/* 2. 찜 내역 */}
        <Link 
          to="/favorites" 
          className="quick-actions__item" 
          aria-label="찜 내역"
          onClick={handleLinkClick}
        >
          <FiHeart />
        </Link>

        {/* 3. 상단 이동 */}
        <button
          type="button"
          className="quick-actions__item"
          onClick={handleScrollTop}
          aria-label="맨 위로 이동"
        >
          <FiArrowUp />
        </button>

        {/* 4. 검색/탐색 (기존 Globe 아이콘) */}
        <Link 
          to="/search" 
          className="quick-actions__item" 
          aria-label="검색 결과 목록"
          onClick={handleLinkClick}
        >
          <FiGlobe />
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;