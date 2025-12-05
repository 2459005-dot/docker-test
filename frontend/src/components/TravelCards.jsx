import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
// ✅ API import (내 코드의 핵심 로직 유지)
import { getLodgings } from '../api/lodgingApi';
import './style/TravelCards.scss';

const TravelCards = () => {
  const navigate = useNavigate();
  // 데이터 상태 관리 (내 코드)
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // 슬라이더 상태 관리 (최신 코드 UI 로직)
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4;

  // ✅ 데이터 불러오기 (내 코드 로직 유지)
  useEffect(() => {
    const fetchTravelDestinations = async () => {
      try {
        setLoading(true);
        // 1. 백엔드에서 숙소 목록 가져오기
        const response = await getLodgings();

        if (response.success) {
          const allLodgings = response.data;

          // 2. 랜덤 섞기
          const shuffled = [...allLodgings].sort(() => 0.5 - Math.random());
          // 슬라이더를 위해 넉넉히 가져옵니다 (최대 12개 등)
          const selected = shuffled.slice(0, 12);

          // 3. UI 매핑
          const mappedCards = selected.map((hotel) => ({
            id: hotel._id,
            city: hotel.country || '대한민국',
            destination: hotel.country || '대한민국',
            description: hotel.lodgingName,
            price: `₩${(hotel.minPrice || 0).toLocaleString()}`,
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
    params.set('destination', destination);
    navigate(`/search?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const total = cards.length;

  if (loading) {
    // 로딩 중일 때 (공간 유지)
    return <section className="section" style={{ height: '400px' }} />;
  }

  if (total === 0) return null;

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <span className="section-badge">나라 추천</span>
          <h2 className="section-title">인기있는 여행지를 확인해보세요</h2>
        </div>
      </div>

      {/* ✅ 최신 코드의 슬라이더 UI 적용 */}
      <div className="travel-carousel">
        <button
          type="button"
          className="travel-arrow left"
          onClick={() =>
            total > visibleCount &&
            setStartIndex((prev) => (prev - 1 + total) % total)
          }
          aria-label="이전 나라 보기"
          disabled={total <= visibleCount}
        >
          <FiChevronLeft />
        </button>

        <div className="card-wrapper">
          <div
            className="card-slider"
            style={{
              transform: `translateX(calc(-${startIndex} * ((100% - 6rem) / ${visibleCount} + 2rem)))`,
            }}
          >
            {cards.map((card) => (
              <div
                key={card.id}
                className="destination-card"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(5, 18, 13, 0.2), rgba(8, 30, 22, 0.75)), url(${card.image})`,
                }}
              >
                <div className="destination-meta">
                  <h3>{card.city}</h3>
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
        </div>

        <button
          type="button"
          className="travel-arrow right"
          onClick={() =>
            total > visibleCount &&
            setStartIndex((prev) => (prev + 1) % total)
          }
          aria-label="다음 나라 보기"
          disabled={total <= visibleCount}
        >
          <FiChevronRight />
        </button>
      </div>
    </section>
  );
};

export default TravelCards;