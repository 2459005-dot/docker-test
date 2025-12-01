import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HotelCard from '../components/HotelCard';
import Footer from '../components/Footer';
// ❌ 가짜 데이터 import 삭제: import { allHotelsData } from './SearchResults';
import { getLodgingDetail } from '../api/lodgingApi'; // ✅ API import
import './style/Favorites.scss';

const Favorites = () => {
  // 찜한 숙소 ID 목록 (로컬 스토리지)
  const [favoriteIds, setFavoriteIds] = useState(() => {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  });

  // 실제 숙소 데이터를 담을 State
  const [favoriteHotels, setFavoriteHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 로컬 스토리지 변경 감지 (다른 탭이나 헤더에서 변경 시 동기화)
  useEffect(() => {
    const handleStorageChange = () => {
      setFavoriteIds(JSON.parse(localStorage.getItem('favorites') || '[]'));
    };

    window.addEventListener('storage', handleStorageChange);
    // 같은 탭 내 변경 감지용 (커스텀 이벤트)
    window.addEventListener('favoritesChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesChanged', handleStorageChange);
    };
  }, []);

  // 2. ID 목록이 바뀔 때마다 백엔드에서 데이터 새로 불러오기
  useEffect(() => {
    const fetchFavoriteHotels = async () => {
      if (favoriteIds.length === 0) {
        setFavoriteHotels([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 저장된 모든 ID에 대해 상세 정보 요청을 병렬로 보냄
        const promises = favoriteIds.map(id => getLodgingDetail(id));
        const responses = await Promise.all(promises);

        // 성공한 응답만 추려서 데이터 변환
        const validHotels = responses
          .filter(res => res && res.success) // 응답이 성공인 것만 필터링
          .map(res => {
            const hotel = res.data;
            // HotelCard 형식에 맞게 데이터 매핑
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
              // 이미지가 있으면 첫 번째 것, 없으면 기본 이미지
              image: (hotel.images && hotel.images.length > 0) 
                ? hotel.images[0] 
                : 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
              freebies: { wifi: true } // UI 깨짐 방지용
            };
          });

        setFavoriteHotels(validHotels);
      } catch (error) {
        console.error("찜 목록 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteHotels();
  }, [favoriteIds]);

  return (
    <div className="favorites-page">
      <Header />
      <div className="favorites-container">
        <div className="favorites-header">
          <h1 className="favorites-title">찜한 숙소</h1>
          <p className="favorites-count">{favoriteHotels.length}개의 숙소</p>
        </div>

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