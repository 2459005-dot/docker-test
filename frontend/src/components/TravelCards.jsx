import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import './style/TravelCards.scss';

const travelCards = [
  {
    city: '멜버른',
    destination: '멜버른, 호주',
    description: 'Amazing journey',
    price: '₩130,000',
    image:
      'https://images.unsplash.com/photo-1503803548695-c2a7b4a5b875?auto=format&fit=crop&w=1200&q=80',
  },
  {
    city: '파리',
    destination: '파리, 프랑스',
    description: 'A Paris adventure',
    price: '₩150,000',
    image:
      'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?auto=format&fit=crop&w=880&q=80',
  },
  {
    city: '런던',
    destination: '런던, 영국',
    description: 'London eye adventure',
    price: '₩130,000',
    image:
      'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=880&q=80',
  },
  {
    city: '콜롬비아',
    destination: '콜롬비아, 콜롬비아',
    description: 'Amazing streets',
    price: '₩150,000',
    image:
      'https://images.unsplash.com/photo-1525253086316-d0c936c814f8?auto=format&fit=crop&w=1200&q=80',
  },
];

const TravelCards = () => {
  const navigate = useNavigate();

  const handleCountryClick = (destination) => {
    const params = new URLSearchParams();
    params.set('destination', destination);
    navigate(`/search?${params.toString()}`);
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <span className="section-badge">나라 추천</span>
          <h2 className="section-title">인기있는 여행지를 확인해보세요</h2>
        </div>
      </div>

      <div className="card-grid">
        {travelCards.map((card) => (
          <div key={card.city} className="destination-card" style={{ backgroundImage: `linear-gradient(180deg, rgba(5, 18, 13, 0.2), rgba(8, 30, 22, 0.75)), url(${card.image})` }}>
            <div className="destination-meta">
              <h3>{card.city}</h3>
              <p>{card.description}</p>
              <span className="price">{card.price}</span>
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

