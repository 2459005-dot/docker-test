import React, { useMemo, useState } from 'react';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './style/Highlights.scss';

// 기본 이미지 URL (이미지가 없을 경우 대비)
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

const Highlights = ({ data = [], loading }) => {
  const navigate = useNavigate();
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4; // 한 번에 보여줄 카드 개수

  // ✅ [데이터 로직 합치기]
  // 내 코드의 로직(props 데이터 사용) + 최신 코드의 로직(12개 슬라이스)
  const recommendedHotels = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // 원본 배열 복사 후 랜덤 섞기
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    
    // 슬라이더를 위해 넉넉히 12개 정도 가져오기 (데이터가 적으면 그만큼만)
    return shuffled.slice(0, 12);
  }, [data]);

  const total = recommendedHotels.length;

  // ✅ [UI 로직] 최신 코드의 슬라이더 핸들러
  const handlePrev = () => {
    if (total <= visibleCount) return;
    setStartIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    if (total <= visibleCount) return;
    setStartIndex((prev) => (prev + 1) % total);
  };

  // ✅ [UI 로직] 내 코드의 로딩 상태 처리
  if (loading) {
    return (
      <section className="section">
        <div style={{ textAlign: 'center', padding: '50px' }}>추천 숙소를 불러오는 중...</div>
      </section>
    );
  }

  // 데이터가 아예 없을 경우 처리
  if (!loading && total === 0) {
    return null; // 혹은 "숙소가 없습니다" UI 표시
  }

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <span className="section-badge">숙소 추천</span>
          <h2 className="section-title">인기 있는 숙소를 확인하고 예약해보세요</h2>
        </div>
      </div>

      {/* ✅ [UI 구조] 최신 코드의 Carousel 구조 사용 */}
      <div className="highlights-carousel">
        <button
          type="button"
          className="highlights-arrow left"
          onClick={handlePrev}
          aria-label="이전 숙소 보기"
          disabled={total <= visibleCount}
        >
          <FiChevronLeft />
        </button>

        <div className="card-wrapper">
          <div
            className="card-slider"
            style={{
              // 슬라이더 애니메이션 계산식
              transform: `translateX(calc(-${startIndex} * ((100% - 6rem) / ${visibleCount} + 2rem)))`,
            }}
          >
            {recommendedHotels.map((hotel) => {
              // 🚨 [데이터 필드 매핑] 백엔드 데이터 필드명(_id, lodgingName 등) 사용
              const imageUrl = (hotel.images && hotel.images.length > 0) 
                ? hotel.images[0] 
                : DEFAULT_IMAGE;

              return (
                <div
                  key={hotel._id} // ID는 _id
                  className="destination-card"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(5, 18, 13, 0.2), rgba(8, 30, 22, 0.75)), url(${imageUrl})`,
                  }}
                >
                  <div className="destination-meta">
                    {/* 숙소 이름: lodgingName */}
                    <h3>{hotel.lodgingName}</h3>
                    {/* 주소: address */}
                    <p>{hotel.address}</p>
                    {/* 가격: minPrice */}
                    <span className="price">
                      ₩{hotel.minPrice ? hotel.minPrice.toLocaleString() : '가격 문의'}
                    </span>
                    <button
                      className="btn action-button"
                      onClick={() => navigate(`/hotel/${hotel._id}`)}
                    >
                      숙소 예약 <FiArrowRight />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="highlights-arrow right"
          onClick={handleNext}
          aria-label="다음 숙소 보기"
          disabled={total <= visibleCount}
        >
          <FiChevronRight />
        </button>
      </div>
    </section>
  );
};

export default Highlights;