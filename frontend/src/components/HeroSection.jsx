import React from 'react';
import SearchCard from './SearchCard';
import './style/HeroSection.scss';

const heroImage =
  'https://images.unsplash.com/photo-1501117716987-c8e1ecb210ab?auto=format&fit=crop&w=1600&q=80';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-background"></div>
        <div className="hero-content">
          <span className="badge">신청해보세요</span>
          <h1 className="hero-title">호텔 및 다양한 숙소를 확인하세요!</h1>
          <p className="hero-description">
            나라별 숙소 요금을 비교하고 여행 준비를 확인하세요!
          </p>
          <SearchCard />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

