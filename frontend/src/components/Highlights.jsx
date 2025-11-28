import React, { useMemo } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { allHotelsData } from '../pages/SearchResults';
import './style/Highlights.scss';
import { useNavigate } from 'react-router-dom';

// 랜덤으로 숙소 추천 (매번 다른 숙소 표시)
const getRandomHotels = () => {
  const shuffled = [...allHotelsData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
};

const Highlights = () => {
  const recommendedHotels = useMemo(() => getRandomHotels(), []);
  const navigate = useNavigate();

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <span className="section-badge">숙소 추천</span>
          <h2 className="section-title">인기 있는 숙소를 확인하고 예약해보세요</h2>
        </div>
      </div>

      <div className="card-grid">
        {recommendedHotels.map((hotel) => (
          <div
            key={hotel.id}
            className="destination-card"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(5, 18, 13, 0.2), rgba(8, 30, 22, 0.75)), url(${hotel.image})`,
            }}
          >
            <div className="destination-meta">
              <h3>{hotel.name}</h3>
              <p>{hotel.address}</p>
              <span className="price">₩{hotel.price.toLocaleString()}</span>
              <button
                className="btn action-button"
                onClick={() => navigate(`/hotel/${hotel.id}`)}
              >
                숙소 예약 <FiArrowRight />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Highlights;

