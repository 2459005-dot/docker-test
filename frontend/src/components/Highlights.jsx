import React, { useMemo } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './style/Highlights.scss';

const Highlights = ({ data = [], loading }) => {
  const navigate = useNavigate();

  // 데이터를 랜덤으로 섞어서 4개만 뽑는 로직 (props로 받은 data 사용)
  const recommendedHotels = useMemo(() => {
    if (!data || data.length === 0) return [];
    // 원본 배열 복사 후 섞기
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [data]);

  // 로딩 중일 때 보여줄 UI (선택사항)
  if (loading) {
    return (
      <section className="section">
        <div style={{ textAlign: 'center', padding: '50px' }}>추천 숙소를 불러오는 중...</div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <span className="section-badge">숙소 추천</span>
          <h2 className="section-title">인기 있는 숙소를 확인하고 예약해보세요</h2>
        </div>
      </div>

      <div className="card-grid">
        {recommendedHotels.length > 0 ? (
          recommendedHotels.map((hotel) => (
            <div
              key={hotel._id} // 🚨 백엔드 ID는 _id 입니다!
              className="destination-card"
              style={{
                // 🚨 백엔드 이미지는 배열(images)이므로 첫 번째 것([0])을 사용
                // 이미지가 없을 경우 대비용 기본 이미지 설정 추천
                backgroundImage: `linear-gradient(180deg, rgba(5, 18, 13, 0.2), rgba(8, 30, 22, 0.75)), url(${
                  hotel.images && hotel.images.length > 0 
                    ? hotel.images[0] 
                    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945' 
                })`,
              }}
            >
              <div className="destination-meta">
                {/* 🚨 백엔드 필드명: lodgingName */}
                <h3>{hotel.lodgingName}</h3>
                
                {/* 백엔드 필드명: address */}
                <p>{hotel.address}</p>
                
                {/* 🚨 백엔드 필드명: minPrice */}
                <span className="price">
                  ₩{hotel.minPrice ? hotel.minPrice.toLocaleString() : '가격 정보 없음'}
                </span>
                
                <button
                  className="btn action-button"
                  // 상세 페이지 이동 시 _id 사용
                  onClick={() => navigate(`/hotel/${hotel._id}`)}
                >
                  숙소 예약 <FiArrowRight />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ width: '100%', textAlign: 'center' }}>
            등록된 추천 숙소가 없습니다.
          </div>
        )}
      </div>
    </section>
  );
};

export default Highlights;