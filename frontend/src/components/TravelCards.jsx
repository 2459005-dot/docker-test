import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { getLodgings } from '../api/lodgingApi'; // ✅ API import
import './style/TravelCards.scss';

const TravelCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTravelDestinations = async () => {
      try {
        setLoading(true);
        // 1. 백엔드에서 숙소 목록 가져오기
        const response = await getLodgings();

        if (response.success) {
          const allLodgings = response.data;

          // 2. 랜덤으로 섞기 (Shuffle)
          // (데이터가 많아지면 백엔드에서 랜덤 API를 만드는 게 좋지만, 지금은 프론트에서 처리해도 충분합니다)
          const shuffled = [...allLodgings].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 4);

          // 3. UI에 맞게 데이터 변환 (Mapping)
          const mappedCards = selected.map((hotel) => ({
            id: hotel._id,
            // UI에는 '도시'처럼 보이기 위해 나라 이름을 크게 표시
            city: hotel.country || '대한민국', 
            // 검색 시 사용할 키워드
            destination: hotel.country || '대한민국', 
            // 설명란에 호텔 이름을 넣어줌
            description: hotel.lodgingName, 
            price: `₩${(hotel.minPrice || 0).toLocaleString()}`,
            // 이미지가 없으면 기본 이미지 사용
            image: (hotel.images && hotel.images.length > 0) 
              ? hotel.images[0] 
              : 'https://images.unsplash.com/photo-1503803548695-c2a7b4a5b875?auto=format&fit=crop&w=1200&q=80',
          }));

          setCards(mappedCards);
        }
      } catch (error) {
        console.error("여행지 추천 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTravelDestinations();
  }, []);

  const handleCountryClick = (destination) => {
    const params = new URLSearchParams();
    // 나라 이름으로 검색하도록 설정
    params.set('destination', destination);
    navigate(`/search?${params.toString()}`);
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return null; // 로딩 중엔 아무것도 안 보여주거나 스켈레톤 UI를 넣을 수 있음
  }

  // 데이터가 없으면 섹션을 숨김
  if (cards.length === 0) return null;

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <span className="section-badge">나라 추천</span>
          <h2 className="section-title">인기있는 여행지를 확인해보세요</h2>
        </div>
      </div>

      <div className="card-grid">
        {cards.map((card) => (
          <div 
            key={card.id} 
            className="destination-card" 
            style={{ 
              backgroundImage: `linear-gradient(180deg, rgba(5, 18, 13, 0.2), rgba(8, 30, 22, 0.75)), url(${card.image})` 
            }}
          >
            <div className="destination-meta">
              {/* 큰 글씨: 나라 이름 */}
              <h3>{card.city}</h3>
              {/* 작은 글씨: 대표 호텔 이름 */}
              <p>{card.description}</p>
              <span className="price">{card.price} ~</span>
              <button
                className="btn action-button"
                onClick={() => handleCountryClick(card.destination)}
              >
                나라보러가기 <FiArrowRight />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TravelCards;