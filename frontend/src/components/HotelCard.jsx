import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import './style/HotelCard.scss';

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);

  // localStorage에서 찜한 숙소 목록 불러오기
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorited(favorites.includes(hotel.id));
  }, [hotel.id]);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    if (isFavorited) {
      // 찜 해제
      const updatedFavorites = favorites.filter((id) => id !== hotel.id);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorited(false);
    } else {
      // 찜하기
      const updatedFavorites = [...favorites, hotel.id];
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorited(true);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < rating ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="hotel-card">
      <div className="hotel-image-wrapper">
        <img src={hotel.image} alt={hotel.name} className="hotel-image" />
        <div className="image-badge">{hotel.imageCount} images</div>
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
          ₩{hotel.price.toLocaleString()}/night excl. tax
        </p>
        <p className="hotel-address">{hotel.address}</p>
        <div className="hotel-rating">
          <div className="stars">{renderStars(hotel.starRating)}</div>
          <span className="rating-text">{hotel.starRating} Star Hotel</span>
        </div>
        <p className="hotel-amenities">{hotel.amenitiesCount}+ Amenities</p>
        <div className="hotel-reviews">
          <span className="review-score">{hotel.reviewScore}</span>
          <span className="review-text">{hotel.reviewText}</span>
          <span className="review-count">{hotel.reviewCount} reviews</span>
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

