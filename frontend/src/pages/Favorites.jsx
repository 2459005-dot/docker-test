import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HotelCard from '../components/HotelCard';
import Footer from '../components/Footer';
import { getLodgingDetail } from '../api/lodgingApi';
import { getFavorites } from '../api/favoriteApi';
import './style/Favorites.scss';

const Favorites = () => {
  const [favoriteHotels, setFavoriteHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyFavorites = async () => {
      try {
        setLoading(true);
        
        // 1. 백엔드에서 찜 목록 가져오기
        const response = await getFavorites();
        
        // 데이터 안전하게 꺼내기
        const bookmarks = response.data || response || [];

        // 🚨 [추가된 부분] DB 데이터를 가져오자마자 로컬스토리지도 똑같이 맞춰줍니다!
        // 이렇게 하면 HotelCard가 로컬스토리지를 확인할 때 "어? 나 찜 되어있네!" 하고 하트를 채웁니다.
        const latestIds = bookmarks.map(item => item._id || item.lodgingId);
        localStorage.setItem('favorites', JSON.stringify(latestIds));
        // 다른 컴포넌트(헤더 등)에도 변경사항 알리기
        window.dispatchEvent(new Event('storage'));


        if (bookmarks.length === 0) {
          setFavoriteHotels([]);
          setLoading(false);
          return;
        }

        // 2. 상세 정보 로딩 (기존 로직 유지)
        // CASE A: 백엔드가 상세 정보를 다 준 경우
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
        // CASE B: ID만 준 경우
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