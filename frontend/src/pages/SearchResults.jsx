import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import SearchHeader from '../components/SearchHeader';
import SearchFilters from '../components/SearchFilters';
import HotelCard from '../components/HotelCard';
import Footer from '../components/Footer';

// ✅ [내 코드 기준] API 함수 (mine.txt 기능 유지)
import { getLodgings } from '../api/lodgingApi'; 
import './style/SearchResults.scss';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  
  // ✅ [내 코드 기준] 실제 데이터 상태 관리
  const [hotels, setHotels] = useState([]); 
  const [loading, setLoading] = useState(true);

  // URL 파라미터 가져오기
  const locationParam = searchParams.get('destination') || searchParams.get('location') || '';

  // ✅ [디자인 요소 추가] new.txt에 있던 필터링/정렬/페이지네이션 상태만 가져옴
  const [activeTab, setActiveTab] = useState('All'); 
  const [sortBy, setSortBy] = useState('Recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 사이드바 필터 상태 (디자인 기능 작동을 위해 추가)
  const [priceRange, setPriceRange] = useState([0, 1000000]); 
  const [filters, setFilters] = useState({
    freebies: {
      breakfast: false,
      parking: false,
      wifi: false,
      swimmingPool: false,
      gym: false,
    },
    amenities: {
      // 필요 시 추가
    },
  });

  // ✅ [내 코드 기준] API 호출 로직 (100% 유지)
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await getLodgings(); 
        
        if (response.success) {
          setHotels(response.data); // 실제 DB 데이터 저장
        }
      } catch (error) {
        console.error("호텔 목록 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [locationParam]); // 검색어가 바뀌면 재호출

  // ✅ [데이터 연결] 백엔드 데이터(mine.txt)를 디자인(new.txt) 필터가 이해하도록 연결
  // (기능 변경이 아니라, 화면에 뿌리기 위한 변수명 매칭 작업입니다)
  const filteredHotels = useMemo(() => {
    // 1. 데이터 매핑 (DB 필드명 -> UI 필드명)
    const mapped = hotels.map(hotel => {
        const amenities = hotel.amenityId || {}; // 백엔드 모델 구조 반영
        return {
            ...hotel, // 원본 데이터 유지
            id: hotel._id,
            name: hotel.lodgingName, // UI는 name을 찾으므로 매핑
            price: hotel.minPrice || 0, // UI는 price를 찾으므로 매핑
            type: hotel.category,
            // 필터링을 위한 편의시설 정보 연결
            hasWifi: amenities.wifi,
            hasPool: amenities.swimmingPool,
            hasGym: amenities.fitnessCenter,
            hasBreakfast: amenities.breakfast,
            hasParking: amenities.parking
        };
    });

    // 2. 필터링 로직 (new.txt의 디자인 기능을 위해 적용)
    return mapped.filter((hotel) => {
      // 탭 필터 (호텔, 모텔 등)
      if (activeTab !== 'All') {
         const tabMap = { 'Hotel': '호텔', 'Motel': '모텔', 'Resort': '리조트' };
         // 탭이 한글이거나 영어일 경우 모두 대응
         const targetType = tabMap[activeTab] || activeTab;
         if (hotel.type !== targetType) return false;
      }

      // 가격 필터
      if (hotel.price < priceRange[0] || hotel.price > priceRange[1]) return false;

      // 체크박스 필터 (하나라도 체크되면 해당 시설 있는 곳만)
      if (filters.freebies.wifi && !hotel.hasWifi) return false;
      if (filters.freebies.swimmingPool && !hotel.hasPool) return false;
      if (filters.freebies.gym && !hotel.hasGym) return false;
      if (filters.freebies.breakfast && !hotel.hasBreakfast) return false;
      if (filters.freebies.parking && !hotel.hasParking) return false;

      // 지역 검색 필터
      if (locationParam) {
          const searchLower = locationParam.toLowerCase();
          const addr = (hotel.address || '').toLowerCase();
          const dest = (hotel.country || '').toLowerCase();
          const name = (hotel.name || '').toLowerCase();
          if (!addr.includes(searchLower) && !dest.includes(searchLower) && !name.includes(searchLower)) {
              return false;
          }
      }

      return true;
    }).sort((a, b) => {
      // 정렬 로직
      switch (sortBy) {
        case 'Price Low': return a.price - b.price;
        case 'Price High': return b.price - a.price;
        case 'Rating': return (b.rating || 0) - (a.rating || 0);
        default: return 0;
      }
    });
  }, [hotels, activeTab, priceRange, filters, sortBy, locationParam]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const currentHotels = filteredHotels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="search-results-page">
      <Header />
      {/* 검색 헤더 */}
      <SearchHeader />

      <div className="search-content">
        {/* ✅ [디자인 요소] 사이드바 필터 (new.txt 디자인 적용) */}
        <aside className="filters-sidebar">
          <SearchFilters
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            filters={filters}
            setFilters={setFilters}
          />
        </aside>

        <main className="results-main">
          {/* 리스트 상단 컨트롤 (탭, 정렬) */}
          <div className="results-header">
            <div className="results-count">
              {loading 
                ? <span>검색 중...</span> 
                : <span>Showing {filteredHotels.length} places</span>
              }
            </div>
            
            <div className="results-controls">
              <div className="tabs">
                {['All', 'Hotel', 'Motel', 'Resort'].map((tab) => (
                  <button
                    key={tab}
                    className={`tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              <div className="sort-dropdown">
                <span>Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="Recommended">추천순</option>
                  <option value="Price Low">가격: 낮은 순</option>
                  <option value="Price High">가격: 높은 순</option>
                  <option value="Rating">평점순</option>
                </select>
              </div>
            </div>
          </div>

          {/* ✅ [내 코드 기준] 데이터 렌더링 */}
          {loading ? (
             <div className="loading-state" style={{padding: '50px', textAlign: 'center'}}>
               데이터를 불러오는 중입니다...
             </div>
          ) : (
            <div className="hotels-list">
              {filteredHotels.length > 0 ? (
                currentHotels.map((hotel) => (
                  // hotel 데이터는 mine.txt의 DB 데이터를 그대로 가짐
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))
              ) : (
                <div className="no-results">
                  <p>검색 결과가 없습니다.</p>
                  <p>다른 검색 조건이나 필터를 변경해보세요.</p>
                </div>
              )}
            </div>
          )}

          {/* ✅ [디자인 요소] 페이지네이션 (new.txt 디자인 적용) */}
          {filteredHotels.length > 0 && totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              <span className="pagination-info">
                {currentPage} of {totalPages}
              </span>
              <button
                className="pagination-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SearchResults;