import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseISO, differenceInDays } from 'date-fns';
import Header from '../components/Header';
import SearchHeader from '../components/SearchHeader';
import SearchFilters from '../components/SearchFilters';
import HotelCard from '../components/HotelCard';
import Footer from '../components/Footer';
import { getLodgings } from '../api/lodgingApi';
import './style/SearchResults.scss';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  
  // ✅ state 초기값을 빈 배열로 확실하게 설정
  const [hotels, setHotels] = useState([]); 
  const [loading, setLoading] = useState(true);

  // URL 파라미터
  const locationParam = searchParams.get('destination') || searchParams.get('location') || '';
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');

  // 필터 State
  const [filters, setFilters] = useState({
    priceRange: [0, 2000000],
    propertyType: [], // 초기값 빈 배열
    amenities: [],
    rating: null,
  });

  const [sortOption, setSortOption] = useState('Recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ 1. API 데이터 가져오기 (작성하신 코드 반영)
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        
        // 검색어 정제 ("서울, 대한민국" -> "서울")
        let cleanLocation = locationParam;
        if (locationParam && locationParam.includes(',')) {
          cleanLocation = locationParam.split(',')[0].trim(); 
        }
        console.log("🔍 실제 백엔드 요청 검색어:", cleanLocation);

        const query = {
          loc: cleanLocation,
          checkIn: checkInParam,
          checkOut: checkOutParam,
        };

        const response = await getLodgings(query);
        console.log("📦 API 응답:", response);

        if (response && response.success) {
          const mappedHotels = response.data.map(hotel => ({
            id: hotel._id, 
            name: hotel.lodgingName,
            price: typeof hotel.minPrice === 'string' ? parseInt(hotel.minPrice, 10) : (hotel.minPrice || 0),
            address: hotel.address || '주소 미등록',
            destination: hotel.country || '대한민국',
            starRating: hotel.starRating || 0,
            
            // HotelCard용 필드 매핑
            amenitiesCount: hotel.hashtag ? hotel.hashtag.length : 0,
            reviewScore: hotel.rating || 0,
            reviewText: (hotel.rating >= 4.5) ? 'Excellent' : 'Good',
            reviewCount: hotel.reviewCount || 0,
            
            image: (hotel.images && hotel.images.length > 0) 
              ? hotel.images[0] 
              : 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
            imageCount: hotel.images ? hotel.images.length : 0,
          }));

          setHotels(mappedHotels);
        } else {
          setHotels([]);
        }
      } catch (error) {
        console.error("숙소 검색 에러:", error);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [locationParam, checkInParam, checkOutParam]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  };

  // ✅ 2. 프론트엔드 필터링 로직 (🚨 여기가 에러의 원인이었음!)
  // 방어 코드를 추가하여 절대 죽지 않도록 수정함
  const filteredHotels = useMemo(() => {
    // hotels가 없거나 배열이 아니면 빈 배열 반환
    if (!hotels || !Array.isArray(hotels)) return [];

    return hotels.filter((hotel) => {
      // filters가 없으면 통과
      if (!filters) return true;

      // 가격 필터 (옵셔널 체이닝 ? 사용)
      const minPrice = filters.priceRange?.[0] ?? 0;
      const maxPrice = filters.priceRange?.[1] ?? Infinity;
      if (hotel.price < minPrice || hotel.price > maxPrice) {
        return false;
      }

      // 숙소 유형 필터 (propertyType이 undefined여도 에러 안 나게 빈 배열 처리)
      const pTypes = filters.propertyType || [];
      if (pTypes.length > 0 && !pTypes.includes(hotel.type)) {
        return false;
      }

      // 평점 필터
      if (filters.rating && hotel.starRating < filters.rating) {
        return false;
      }
      return true;
    });
  }, [hotels, filters]);

  // 정렬 로직
  const sortedHotels = useMemo(() => {
    const result = [...filteredHotels];
    if (sortOption === 'Price Low') result.sort((a, b) => a.price - b.price);
    else if (sortOption === 'Price High') result.sort((a, b) => b.price - a.price);
    else if (sortOption === 'Rating') result.sort((a, b) => b.reviewScore - a.reviewScore);
    return result;
  }, [filteredHotels, sortOption]);

  // 페이지네이션
  const totalPages = Math.ceil(sortedHotels.length / itemsPerPage);
  const currentHotels = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedHotels.slice(start, start + itemsPerPage);
  }, [sortedHotels, currentPage]);

  return (
    <div className="search-results-page">
      <Header />
      <SearchHeader />
      
      <div className="results-container">
        <aside className="filters-sidebar">
          <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
        </aside>

        <main className="results-main">
          <div className="results-header">
            <div className="results-info">
              <h2>
                {locationParam ? `${locationParam.split(',')[0]}: ` : '전체 지역: '}
                {sortedHotels.length}개 숙소 발견
              </h2>
            </div>
            
            <div className="results-sort">
              <select value={sortOption} onChange={handleSortChange} className="sort-select">
                <option value="Recommended">추천순</option>
                <option value="Price Low">가격: 낮은 순</option>
                <option value="Price High">가격: 높은 순</option>
                <option value="Rating">평점순</option>
              </select>
            </div>
          </div>

          {loading ? (
             <div className="loading-state" style={{padding: '50px', textAlign: 'center'}}>검색 중입니다...</div>
          ) : (
            <div className="hotels-list">
              {sortedHotels.length > 0 ? (
                currentHotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))
              ) : (
                <div className="no-results" style={{padding: '50px', textAlign: 'center'}}>
                  <p>검색 결과가 없습니다.</p>
                  <p>다른 검색 조건으로 시도해보세요.</p>
                </div>
              )}
            </div>
          )}

          {sortedHotels.length > 0 && totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              <span className="pagination-info">{currentPage} of {totalPages}</span>
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
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