import React, { useState, useEffect } from 'react';
import './style/SearchFilters.scss';

const SearchFilters = ({ onFilterChange }) => {
  // 상태 관리
  const [priceRange, setPriceRange] = useState([50000, 1200000]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [freebies, setFreebies] = useState({
    breakfast: true,
    parking: false,
    wifi: true,
    shuttle: false,
    cancellation: false,
  });
  const [amenities, setAmenities] = useState({
    frontDesk: false,
    aircon: false,
    fitness: false,
    pool: false,
  });

  // ✅ [최적화] 필터 변경 감지 (여기서만 부모에게 알림을 보냅니다)
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        priceRange,
        selectedRating,
        freebies,
        amenities,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange, selectedRating, freebies, amenities]);

  // 핸들러 함수들 (중복 호출 제거됨)
  const handleFreebieChange = (key) => {
    setFreebies((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAmenityChange = (key) => {
    setAmenities((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleRatingChange = (rating) => {
    setSelectedRating(selectedRating === rating ? null : rating);
  };

  const handleResetAll = () => {
    setPriceRange([50000, 1200000]);
    setSelectedRating(null);
    setFreebies({
      breakfast: false,
      parking: false,
      wifi: false,
      shuttle: false,
      cancellation: false,
    });
    setAmenities({
      frontDesk: false,
      aircon: false,
      fitness: false,
      pool: false,
    });
  };

  return (
    <div className="search-filters">
      <div className="filters-header">
        <h3 className="filters-title">필터</h3>
        <button className="reset-all-button" onClick={handleResetAll}>
          전체 해제
        </button>
      </div>

      {/* 가격 필터 */}
      <div className="filter-section">
        <h4 className="filter-label">가격</h4>
        <div className="price-range">
          <div className="price-inputs">
            <span className="price-value">₩{priceRange[0].toLocaleString()}</span>
            <span className="price-separator">-</span>
            <span className="price-value">₩{priceRange[1].toLocaleString()}</span>
          </div>
          <div className="price-slider-wrapper">
            <input
              type="range"
              min="0"
              max="2000000"
              step="10000"
              value={priceRange[1]}
              onChange={(e) => {
                const newMax = parseInt(e.target.value, 10);
                // 최소값보다 작아지지 않게 방어 코드 추가
                if (newMax >= priceRange[0]) {
                    setPriceRange([priceRange[0], newMax]);
                }
              }}
              className="price-slider"
            />
          </div>
        </div>
      </div>

      {/* 별점 필터 */}
      <div className="filter-section">
        <h4 className="filter-label">별점</h4>
        <div className="rating-buttons">
          {[0, 1, 2, 3, 4].map((rating) => (
            <button
              key={rating}
              className={`rating-button ${selectedRating === rating ? 'active' : ''}`}
              onClick={() => handleRatingChange(rating)}
            >
              {rating}+
            </button>
          ))}
        </div>
      </div>

      {/* 무료 서비스 체크박스 */}
      <div className="filter-section">
        <h4 className="filter-label">무료 서비스</h4>
        <div className="checkbox-list">
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={freebies.breakfast}
              onChange={() => handleFreebieChange('breakfast')}
            />
            <span>조식포함</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={freebies.parking}
              onChange={() => handleFreebieChange('parking')}
            />
            <span>무료주차</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={freebies.wifi}
              onChange={() => handleFreebieChange('wifi')}
            />
            <span>WIFI</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={freebies.shuttle}
              onChange={() => handleFreebieChange('shuttle')}
            />
            <span>공항셔틀버스</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={freebies.cancellation}
              onChange={() => handleFreebieChange('cancellation')}
            />
            <span>무료취소</span>
          </label>
        </div>
      </div>

      {/* 편의시설 체크박스 */}
      <div className="filter-section">
        <h4 className="filter-label">편의시설</h4>
        <div className="checkbox-list">
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={amenities.frontDesk}
              onChange={() => handleAmenityChange('frontDesk')}
            />
            <span>24시 프론트데스크</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={amenities.aircon}
              onChange={() => handleAmenityChange('aircon')}
            />
            <span>에어컨</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={amenities.fitness}
              onChange={() => handleAmenityChange('fitness')}
            />
            <span>피트니스</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={amenities.pool}
              onChange={() => handleAmenityChange('pool')}
            />
            <span>수영장</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;