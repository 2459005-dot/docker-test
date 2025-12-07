import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FiHeart, FiShare2, FiMapPin, FiUsers, FiClock, FiChevronLeft, FiChevronRight, FiWifi, FiCalendar } from 'react-icons/fi';
import { MdPool, MdSpa, MdRestaurant, MdRoomService, MdFitnessCenter, MdLocalBar, MdCoffee, MdBusinessCenter, MdLocalParking, MdAirportShuttle, MdCancel, MdPets, MdSmokingRooms, MdHotTub, MdBeachAccess, MdGolfCourse, MdCasino, MdShoppingCart, MdLocalLaundryService, MdRoom, MdElevator, MdSecurity, MdSupportAgent, MdChildCare } from 'react-icons/md';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { getLodgingDetail, getRooms } from '../api/lodgingApi';
import { addFavorite, removeFavorite, getFavorites } from '../api/favoriteApi';

import 'react-day-picker/dist/style.css';
import './style/HotelDetail.scss';

// 기본 이미지
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945';

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  // 예약 관련 State
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 1),
  });
  const [guests, setGuests] = useState(2);
  const [roomsCount, setRoomsCount] = useState(1);
  
  // UI State
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [isGuestOpen, setGuestOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [selectedRoomImages, setSelectedRoomImages] = useState(null);
  const [visibleRoomsCount, setVisibleRoomsCount] = useState(4);

  const datePickerRef = useRef(null);
  const guestRef = useRef(null);
  const roomsSectionRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hotelRes, roomsRes, favRes] = await Promise.all([
          getLodgingDetail(id),
          getRooms(id),
          getFavorites()
        ]);

        if (hotelRes.success) setHotel(hotelRes.data);
        if (roomsRes.success) setRooms(roomsRes.data);
        
        if (favRes && (favRes.data || Array.isArray(favRes))) {
           const favList = favRes.data || favRes;
           const isFav = favList.some(item => (item._id === id || item.lodgingId === id));
           setIsFavorited(isFav);
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await removeFavorite(id);
        setIsFavorited(false);
      } else {
        await addFavorite(id);
        setIsFavorited(true);
      }
      window.dispatchEvent(new Event('storage')); 
    } catch (error) {
      console.error("찜 변경 실패:", error);
      alert("로그인이 필요한 서비스입니다.");
    }
  };

  // ✅ [수정 완료] model.js 구조에 맞춘 편의시설 매핑
  const amenitiesList = useMemo(() => {
    if (!hotel) return [];
    
    // model.js에 따르면 amenityId는 객체(ObjectId reference)입니다.
    // 백엔드에서 populate 되어 온다고 가정합니다.
    const amenities = hotel.amenityId || {}; 

    const mapping = [
      { key: 'swimmingPool', icon: MdPool, label: '수영장' },
      { key: 'spa', icon: MdSpa, label: '스파' },
      { key: 'restaurant', icon: MdRestaurant, label: '레스토랑' },
      { key: 'roomService', icon: MdRoomService, label: '룸서비스' },
      { key: 'fitnessCenter', icon: MdFitnessCenter, label: '피트니스' },
      { key: 'bar', icon: MdLocalBar, label: '바/라운지' },
      { key: 'cafe', icon: MdCoffee, label: '카페' },
      { key: 'businessCenter', icon: MdBusinessCenter, label: '비즈니스' },
      { key: 'parking', icon: MdLocalParking, label: '주차장' },
      { key: 'wifi', icon: FiWifi, label: '와이파이' },
      { key: 'breakfast', icon: MdRestaurant, label: '조식' }
    ];

    // amenities 객체 안에 해당 키값이 true인지 확인
    return mapping.filter(m => amenities[m.key] === true);
  }, [hotel]);

  const handleBooking = (roomId) => {
    const params = new URLSearchParams({
      checkIn: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
      checkOut: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
      rooms: roomsCount.toString(),
      guests: guests.toString()
    });
    navigate(`/booking/${id}/${roomId}?${params.toString()}`);
  };

  const loadMoreRooms = () => {
    setVisibleRoomsCount(prev => Math.min(prev + 4, rooms.length));
  };

  const openGalleryModal = (index) => setSelectedGalleryImage({ index, images: hotel.images || [DEFAULT_IMAGE] });
  const closeGalleryModal = () => setSelectedGalleryImage(null);
  
  const openRoomImagesModal = (room) => setSelectedRoomImages({ name: room.roomName, images: room.images || [room.roomImage] });
  const closeRoomImagesModal = () => setSelectedRoomImages(null);

  const checkInStr = dateRange?.from ? format(dateRange.from, 'MM.dd') : '날짜 선택';
  const checkOutStr = dateRange?.to ? format(dateRange.to, 'MM.dd') : '날짜 선택';

  if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>로딩 중...</div>;
  if (!hotel) return <div style={{padding: '100px', textAlign: 'center'}}>호텔 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="hotel-detail-page">
      <Header />
      
      {/* 1. 이미지 갤러리 */}
      <div className="hotel-images-section">
        <div className="main-image-container" onClick={() => openGalleryModal(0)}>
           <img src={(hotel.images && hotel.images[0]) || DEFAULT_IMAGE} alt="Main" />
        </div>
        <div className="sub-images-grid">
           {[1, 2, 3, 4].map((idx) => (
             <div key={idx} className="sub-image-container" onClick={() => openGalleryModal(idx)}>
               <img 
                 src={(hotel.images && hotel.images[idx]) || DEFAULT_IMAGE} 
                 alt={`Sub ${idx}`} 
               />
               {idx === 4 && (hotel.images?.length > 5) && (
                 <div className="more-overlay">+{hotel.images.length - 5}장 더보기</div>
               )}
             </div>
           ))}
        </div>
      </div>

      <div className="hotel-content-container">
        <div className="hotel-main-info">
          
          {/* 호텔 헤더 */}
          <div className="hotel-header">
            <div className="title-row">
               {/* model.js: lodgingName */}
               <h1>{hotel.lodgingName}</h1> 
               <div className="stars">
                 {/* model.js: starRating */}
                 {[...Array(5)].map((_, i) => (
                   <span key={i} className={i < (hotel.starRating || 0) ? 'star filled' : 'star'}>★</span>
                 ))}
                 <span className="rating-text">{hotel.starRating}성급</span>
               </div>
            </div>
            {/* model.js: address */}
            <p className="address"><FiMapPin /> {hotel.address}</p>
            
            <div className="rating-summary">
               {/* ✅ model.js: rating 사용 */}
               <span className="score-badge">{hotel.rating || 0}</span>
               <span className="score-text">매우 좋음</span>
               {/* ✅ model.js: reviewCount 사용 */}
               <span className="review-count">{hotel.reviewCount || 0}개 이용 후기</span>
            </div>
          </div>

          <div className="divider"></div>

          {/* 숙소 소개 */}
          <div className="section description">
             <h2>숙소 소개</h2>
             {/* model.js: description */}
             <p>{hotel.description}</p>
          </div>

          <div className="divider"></div>

          {/* 편의시설 */}
          <div className="section amenities">
             <h2>편의시설</h2>
             <div className="amenities-grid">
               {amenitiesList.length > 0 ? amenitiesList.map((item, index) => (
                 <div key={index} className="amenity-item">
                   <item.icon className="icon" />
                   <span>{item.label}</span>
                 </div>
               )) : (
                 <div className="amenity-item"><span>등록된 편의시설 정보가 없습니다.</span></div>
               )}
             </div>
          </div>

          <div className="divider"></div>

          {/* 객실 선택 */}
          <div className="section rooms-list" ref={roomsSectionRef}>
            <h2>객실 선택</h2>
            {rooms.length > 0 ? (
              rooms.slice(0, visibleRoomsCount).map((room) => (
                <div key={room._id} className="room-card">
                  <div className="room-image" onClick={() => openRoomImagesModal(room)}>
                    <img 
                      src={room.roomImage || (room.images && room.images[0]) || DEFAULT_IMAGE} 
                      alt={room.roomName} 
                    />
                  </div>
                  <div className="room-info">
                    <h3 className="room-name">{room.roomName}</h3>
                    <div className="room-specs">
                      <span><FiUsers /> 최대 {room.capacityMax || 2}인</span>
                      {room.bedType && <span><MdRoom /> {room.bedType}</span>}
                    </div>
                    <div className="room-price-action">
                      <div className="price-info">
                        <span className="price">₩{(room.price || 0).toLocaleString()}</span>
                        <span className="unit">/ 1박</span>
                      </div>
                      <button className="btn primary book-btn" onClick={() => handleBooking(room._id)}>
                        예약하기
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>예약 가능한 객실이 없습니다.</p>
            )}
            
            {visibleRoomsCount < rooms.length && (
               <button className="btn secondary full-width mt-4" onClick={loadMoreRooms}>
                 객실 더 보기
               </button>
            )}
          </div>
          
          <div className="divider"></div>

          {/* 지도 */}
          <div className="section map-section">
             <h2>위치</h2>
             <p className="map-address">{hotel.address}</p>
             <div className="map-container">
               <iframe
                  title="map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(hotel.address)}&output=embed`}
                  allowFullScreen
               ></iframe>
             </div>
          </div>

          <div className="divider"></div>

          {/* 이용 후기 */}
          <div className="section reviews">
            <div className="reviews-header">
              <h2>이용 후기</h2>
              <div className="rating-big">
                 {/* ✅ model.js: rating, reviewCount */}
                 <span className="score">{hotel.rating || 0}</span>
                 <div className="text-col">
                   <strong>매우 좋음</strong>
                   <span>{hotel.reviewCount || 0}개의 후기</span>
                 </div>
              </div>
            </div>
            <div className="review-list">
               <p className="no-reviews">아직 등록된 후기가 없습니다.</p>
            </div>
          </div>

        </div>

        {/* 사이드바 예약 위젯 */}
        <div className="hotel-sidebar">
           <div className="booking-widget">
              <div className="price-header">
                 {/* ✅ model.js: minPrice */}
                 <span className="start-price">₩{(hotel.minPrice || 0).toLocaleString()}~</span>
                 <span className="unit">/박</span>
              </div>
              
              <div className="widget-form">
                 <div className="field date-field" ref={datePickerRef}>
                    <div className="field-label" onClick={() => setDatePickerOpen(!isDatePickerOpen)}>
                       <div className="date-box">
                          <span className="label">체크인</span>
                          <span className="value">{checkInStr}</span>
                       </div>
                       <div className="seperator">|</div>
                       <div className="date-box">
                          <span className="label">체크아웃</span>
                          <span className="value">{checkOutStr}</span>
                       </div>
                    </div>
                    {isDatePickerOpen && (
                      <div className="picker-popup">
                        <DayPicker
                          mode="range"
                          selected={dateRange}
                          onSelect={(range) => setDateRange(range)}
                          numberOfMonths={1}
                          locale={ko}
                          disabled={{ before: new Date() }}
                        />
                        <button className="btn primary full-width" onClick={() => setDatePickerOpen(false)}>확인</button>
                      </div>
                    )}
                 </div>

                 <div className="field guest-field" ref={guestRef}>
                    <div className="field-label" onClick={() => setGuestOpen(!isGuestOpen)}>
                       <span className="label">인원</span>
                       <span className="value">객실 {roomsCount}, 성인 {guests}</span>
                       <FiChevronRight className={`arrow ${isGuestOpen ? 'up' : ''}`} />
                    </div>
                    {isGuestOpen && (
                       <div className="guest-popup">
                          <div className="counter-row">
                             <span>객실</span>
                             <div className="counter">
                                <button onClick={() => setRoomsCount(Math.max(1, roomsCount - 1))}>-</button>
                                <span>{roomsCount}</span>
                                <button onClick={() => setRoomsCount(roomsCount + 1)}>+</button>
                             </div>
                          </div>
                          <div className="counter-row">
                             <span>성인</span>
                             <div className="counter">
                                <button onClick={() => setGuests(Math.max(1, guests - 1))}>-</button>
                                <span>{guests}</span>
                                <button onClick={() => setGuests(guests + 1)}>+</button>
                             </div>
                          </div>
                          <button className="btn primary full-width" onClick={() => setGuestOpen(false)}>확인</button>
                       </div>
                    )}
                 </div>
              </div>

              <div className="action-buttons">
                 <button className="btn primary full-width book-main-btn" onClick={() => {
                    roomsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                 }}>
                    객실 선택하기
                 </button>
                 <div className="sub-actions">
                    <button className={`btn icon-btn ${isFavorited ? 'active' : ''}`} onClick={toggleFavorite}>
                       <FiHeart className={isFavorited ? 'fill' : ''} />
                       <span>{isFavorited ? '저장됨' : '저장'}</span>
                    </button>
                    <button className="btn icon-btn">
                       <FiShare2 />
                       <span>공유</span>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 갤러리 모달 */}
      {selectedGalleryImage && (
        <div className="gallery-modal-overlay" onClick={closeGalleryModal}>
          <div className="gallery-modal" onClick={e => e.stopPropagation()}>
             <button className="close-btn" onClick={closeGalleryModal}><MdCancel /></button>
             <div className="modal-main-image">
                <img src={selectedGalleryImage.images[selectedGalleryImage.index]} alt="Large" />
             </div>
          </div>
        </div>
      )}

      {/* 객실 모달 */}
      {selectedRoomImages && (
        <div className="gallery-modal-overlay" onClick={closeRoomImagesModal}>
           <div className="gallery-modal room-modal" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={closeRoomImagesModal}><MdCancel /></button>
              <h2>{selectedRoomImages.name}</h2>
              <div className="room-images-grid">
                 {selectedRoomImages.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Room ${idx}`} />
                 ))}
              </div>
           </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default HotelDetail;