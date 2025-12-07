import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HotelCard from '../components/HotelCard';
import Footer from '../components/Footer';
// ✅ 기능 핵심: API 및 스타일 import (mine.txt 유지)
import { getLodgingDetail } from '../api/lodgingApi';
import { getFavorites } from '../api/favoriteApi';
import './style/Favorites.scss';

const Favorites = () => {
  // 상태 관리 (mine.txt 로직: 가짜 데이터 대신 실제 State 사용)
  const [favoriteHotels, setFavoriteHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 1. 백엔드 데이터 불러오기 (mine.txt의 핵심 로직)
  useEffect(() => {
    const fetchMyFavorites = async () => {
      try {
        setLoading(true);

        // 1-1. 백엔드에서 찜 목록 가져오기
        const response = await getFavorites();
        const bookmarks = response.data || response || [];

        // 1-2. DB 데이터를 로컬스토리지와 동기화 (헤더 하트 표시 등 다른 UI를 위해)
        const latestIds = bookmarks.map(item => item._id || item.lodgingId);
        localStorage.setItem('favorites', JSON.stringify(latestIds));
        window.dispatchEvent(new Event('storage')); // UI 업데이트 트리거

        if (bookmarks.length === 0) {
          setFavoriteHotels([]);
          setLoading(false);
          return;
        }

        // 1-3. 상세 정보 매핑 (사용자 코드 로직 유지)
        // CASE A: 백엔드가 상세 정보를 다 준 경우 (Populate 된 경우)
        if (bookmarks[0].lodgingName || bookmarks[0].name) {
          const mappedHotels = bookmarks.map(hotel => ({
            id: hotel._id || hotel.lodgingId,
            name: hotel.lodgingName || hotel.name,
            price: hotel.minPrice || 0,
            address: hotel.address,
            destination: hotel.country,
            type: hotel.category,
            starRating: hotel.starRating,
            reviewScore: hotel.rating || 0,
            reviewCount: hotel.reviewCount || 0,
            image: (hotel.images && hotel.images.length > 0)
              ? hotel.images[0]
              : 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
            freebies: { wifi: true }
          }));
          setFavoriteHotels(mappedHotels);
        }
        // CASE B: ID만 준 경우 -> 상세 조회 API 호출 필요
        else {
          const promises = latestIds.map(id => getLodgingDetail(id));
          const responses = await Promise.all(promises);

          const validHotels = responses
            .filter(res => res && res.success)
            .map(res => {
              const hotel = res.data;
              return {
                id: hotel._id,
                name: hotel.lodgingName,
                price: hotel.minPrice || 0,
                address: hotel.address,
                destination: hotel.country,
                type: hotel.category,
                starRating: hotel.starRating,
                reviewScore: hotel.rating || 0,
                reviewCount: hotel.reviewCount || 0,
                image: (hotel.images && hotel.images.length > 0)
                  ? hotel.images[0]
                  : 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
                freebies: { wifi: true }
              };
            });
          setFavoriteHotels(validHotels);
        }

      } catch (error) {
        console.error("찜 목록 로딩 실패:", error);
        setFavoriteHotels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyFavorites();
  }, []);

  // ✅ 2. 실시간 상태 감지 (mine.txt 로직)
  // 사용자가 리스트에서 '하트'를 눌러 찜 해제 시 목록에서 즉시 제거
  useEffect(() => {
    const handleStorageChange = () => {
      const currentFavoritesIds = JSON.parse(localStorage.getItem('favorites') || '[]');

      // 현재 화면에 있는 호텔 중, 로컬스토리지(찜 목록)에 없는 것은 제거 (필터링)
      setFavoriteHotels(prevHotels =>
        prevHotels.filter(hotel => currentFavoritesIds.includes(hotel.id))
      );
    };

    // 다른 탭에서의 변경 감지
    window.addEventListener('storage', handleStorageChange);
    // 같은 탭 내에서의 변경 감지 (Polling)
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="favorites-page">
      <Header />
      <div className="favorites-container">
        {/* Header Section: 디자인 new.txt */}
        <div className="favorites-header">
          <h1 className="favorites-title">찜한 숙소</h1>
          <p className="favorites-count">{favoriteHotels.length}개의 숙소</p>
        </div>

        {/* Content Section: 
            new.txt의 구조를 따르되, mine.txt의 기능인 'loading' 상태 처리를 포함시킴 
        */}
        {loading ? (
          <div style={{ padding: '100px 0', textAlign: 'center', color: '#666' }}>
            불러오는 중...
          </div>
        ) : favoriteHotels.length > 0 ? (
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