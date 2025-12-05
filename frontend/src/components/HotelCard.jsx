import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
// ✅ API 및 로직 유지
import { addFavorite, removeFavorite } from '../api/favoriteApi';
import './style/HotelCard.scss';

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();
  
  // ✅ State 병합: 찜 기능 + 이미지 로딩 UI 상태
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // 1. 찜 상태 초기화 (내 코드 로직 유지)
  useEffect(() => {
    const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (localFavorites.includes(hotel.id)) {
      setIsFavorited(true);
    }
  }, [hotel.id]);

  // ✅ 2. 이미지 처리 로직 (최신 코드 적용)
  const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
  // 이미지가 없거나 에러가 났으면 defaultImage 사용
  const imageUrl = imageError || !hotel.image ? defaultImage : hotel.image;

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // ✅ 3. 하트 클릭 핸들러 (내 코드의 API 로직 유지)
  const handleHeartClick = async (e) => {
    e.stopPropagation();
    
    // 로그인 체크
    const token = localStorage.getItem('token');
    if (!token) {
      alert("로그인이 필요합니다.");
      return; 
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
        {/* ✅ 최신 코드의 로딩 UI 적용: 이미지가 로딩 중일 때 텍스트 표시 */}
        {imageLoading && (
          <div className="image-placeholder">
            <span>{hotel.name}</span>
          </div>
        )}
        
        <img
          src={imageUrl}
          alt={hotel.name}
          className={`hotel-image ${imageLoading ? 'loading' : ''}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
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
        {/* 안전한 데이터 접근 (내 코드 방식 유지) */}
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