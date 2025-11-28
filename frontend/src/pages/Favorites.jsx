import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import HotelCard from '../components/HotelCard';
import Footer from '../components/Footer';
import { allHotelsData } from './SearchResults';
import './style/Favorites.scss';

const Favorites = () => {
  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  });

  // 찜한 숙소 필터링
  const favoriteHotels = useMemo(() => {
    return allHotelsData.filter((hotel) => favorites.includes(hotel.id));
  }, [favorites]);

  // localStorage 변경 감지 (다른 페이지에서 찜하기 변경 시)
  React.useEffect(() => {
    const handleStorageChange = () => {
      setFavorites(JSON.parse(localStorage.getItem('favorites') || '[]'));
    };

    window.addEventListener('storage', handleStorageChange);
    // 같은 탭에서의 변경도 감지하기 위해 interval 사용
    const interval = setInterval(() => {
      const currentFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (JSON.stringify(currentFavorites) !== JSON.stringify(favorites)) {
        setFavorites(currentFavorites);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [favorites]);

  return (
    <div className="favorites-page">
      <Header />
      <div className="favorites-container">
        <div className="favorites-header">
          <h1 className="favorites-title">찜한 숙소</h1>
          <p className="favorites-count">{favoriteHotels.length}개의 숙소</p>
        </div>
        {favoriteHotels.length > 0 ? (
          <div className="favorites-list">
            {favoriteHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        ) : (
          <div className="no-favorites">
            <p>찜한 숙소가 없습니다.</p>
            <p>숙소를 찜하면 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;

