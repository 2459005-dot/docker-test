import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
// ✅ API 불러오기
import { addFavorite, removeFavorite, getFavorites } from '../api/favoriteApi';
import './style/HotelCard.scss';

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);

  // 1. 찜 상태 확인 (API + 로컬스토리지 병행 확인)
  useEffect(() => {
    // 일단 로컬 스토리지로 빠르게 UI 반영 (깜빡임 방지)
    const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (localFavorites.includes(hotel.id)) {
      setIsFavorited(true);
    }

    // (선택사항) 로그인 상태라면 진짜 찜 목록 가져와서 확인
    // const checkServer = async () => { ... } 
  }, [hotel.id]);

  // 2. 하트 클릭 핸들러 (API 호출)
  const handleHeartClick = async (e) => {
    e.stopPropagation();
    
    // 로그인 체크
    const token = localStorage.getItem('token');
    if (!token) {
      alert("로그인이 필요합니다.");
      return; // 로그인 페이지로 보내거나 여기서 멈춤
    }

    try {
      if (isFavorited) {
        // 찜 해제 API
        await removeFavorite(hotel.id);
        setIsFavorited(false);
        
        // 로컬 스토리지 동기화
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const updated = favorites.filter(id => id !== hotel.id);
        localStorage.setItem('favorites', JSON.stringify(updated));
      } else {
        // 찜 추가 API
        await addFavorite(hotel.id);
        setIsFavorited(true);
        
        // 로컬 스토리지 동기화
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        localStorage.setItem('favorites', JSON.stringify([...favorites, hotel.id]));
      }
      
      // 다른 컴포넌트(Header 등)에 알림
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('favoritesChanged'));

    } catch (error) {
      console.error("찜 변경 실패:", error);
      alert("오류가 발생했습니다.");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < Math.floor(rating || 0) ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="hotel-card">
      <div className="hotel-image-wrapper">
        {/* 이미지가 없을 때를 대비한 기본 이미지 처리 */}
        <img 
          src={hotel.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={hotel.name} 
          className="hotel-image"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Error'; }}
        />
        <div className="image-badge">{hotel.imageCount || 0} images</div>
        <button
          className={`heart-button ${isFavorited ? 'favorited' : ''}`}
          onClick={handleHeartClick}
        >
          <FiHeart />
        </button>
      </div>
      <div className="hotel-info">
        <h3 className="hotel-name">{hotel.name}</h3>
        <p className="hotel-price">
          ₩{(hotel.price || 0).toLocaleString()}/night excl. tax
        </p>
        <p className="hotel-address">{hotel.address}</p>
        <div className="hotel-rating">
          <div className="stars">{renderStars(hotel.starRating)}</div>
          <span className="rating-text">{hotel.starRating} Star Hotel</span>
        </div>
        <p className="hotel-amenities">{hotel.amenitiesCount || 0}+ Amenities</p>
        <div className="hotel-reviews">
          <span className="review-score">{hotel.reviewScore || 0}</span>
          <span className="review-text">{hotel.reviewText || 'Good'}</span>
          <span className="review-count">{hotel.reviewCount || 0} reviews</span>
        </div>
        <button
          className="btn primary view-button"
          onClick={() => navigate(`/hotel/${hotel.id}`)}
        >
          보러가기
        </button>
      </div>
    </div>
  );
};

export default HotelCard;