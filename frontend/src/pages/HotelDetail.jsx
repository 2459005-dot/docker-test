import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FiHeart, FiShare2, FiMapPin, FiUsers, FiClock, FiChevronLeft, FiChevronRight, FiWifi, FiCalendar } from 'react-icons/fi';
import { MdPool, MdSpa, MdRestaurant, MdRoomService, MdFitnessCenter, MdLocalBar, MdCoffee, MdBusinessCenter, MdLocalParking, MdAirportShuttle, MdCancel, MdPets, MdSmokingRooms, MdHotTub, MdBeachAccess, MdGolfCourse, MdCasino, MdShoppingCart, MdLocalLaundryService, MdRoom, MdElevator, MdSecurity, MdSupportAgent, MdChildCare } from 'react-icons/md';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getLodgingDetail, getRooms } from '../api/lodgingApi'; // ✅ API import
import 'react-day-picker/dist/style.css';
import './style/HotelDetail.scss';
import { addFavorite, removeFavorite, getFavorites } from '../api/favoriteApi';

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ 백엔드 데이터 State
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // 기존 State들
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [roomImageIndices, setRoomImageIndices] = useState({});
  const [selectedRoomImages, setSelectedRoomImages] = useState(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [visibleRoomsCount, setVisibleRoomsCount] = useState(4);

  // 날짜 및 게스트 선택
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 1),
  });
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [guestOption, setGuestOption] = useState({ rooms: 1, guests: 2 });
  const [isGuestOpen, setGuestOpen] = useState(false);

  const checkInFieldRef = useRef(null);
  const checkOutFieldRef = useRef(null);
  const calendarRef = useRef(null);
  const guestRef = useRef(null);
  const roomsSectionRef = useRef(null);

  // ✅ 1. 백엔드 데이터 불러오기 (useEffect)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 숙소 상세 정보 & 객실 목록 병렬 호출
        const [hotelRes, roomsRes] = await Promise.all([
          getLodgingDetail(id),
          getRooms(id)
        ]);

        if (hotelRes.success) {
          setHotel(hotelRes.data);
        }

        if (roomsRes.success) {
          setRooms(roomsRes.data);
        }

      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 게스트 수에 따라 객실 필터링
  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    const totalGuests = guestOption.guests;
    // capacityMax가 없으면 기본값 2로 처리 (안전장치)
    return rooms.filter(room => (room.capacityMax || 2) >= totalGuests);
  }, [rooms, guestOption.guests]);

  const visibleRooms = useMemo(() => filteredRooms.slice(0, visibleRoomsCount), [filteredRooms, visibleRoomsCount]);

  const handleLoadMoreRooms = () => {
    setVisibleRoomsCount((prev) => Math.min(prev + 4, filteredRooms.length));
  };

  // 날짜 포맷팅
  const checkIn = dateRange?.from;
  const checkOut = dateRange?.to;
  const formatDateLabel = (date, fallback) =>
    date ? format(date, 'MM.dd (EEE)', { locale: ko }) : fallback;
  const formattedCheckIn = formatDateLabel(checkIn, '날짜 선택');
  const formattedCheckOut = formatDateLabel(checkOut, '날짜 선택');

  // 외부 클릭 감지 (달력, 게스트 팝업 닫기)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideCalendar =
        calendarRef.current?.contains(event.target) ||
        checkInFieldRef.current?.contains(event.target) ||
        checkOutFieldRef.current?.contains(event.target);

      if (isCalendarOpen && !isInsideCalendar) {
        setCalendarOpen(false);
      }

      if (guestRef.current && !guestRef.current.contains(event.target)) {
        setGuestOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isCalendarOpen]);

  // 날짜 자동 조정
  useEffect(() => {
    if (checkIn && checkOut && checkOut <= checkIn) {
      setDateRange({ from: checkIn, to: addDays(checkIn, 1) });
    }
  }, [checkIn, checkOut]);

  const handleCalendarChange = (range) => {
    setDateRange(range || { from: undefined, to: undefined });
  };

  const handleCalendarOpen = (event) => {
    event.stopPropagation();
    setCalendarOpen(true);
    setGuestOpen(false);
  };

  const handleApplyDates = () => {
    if (checkIn && !checkOut) {
      setDateRange({ from: checkIn, to: addDays(checkIn, 1) });
    }
    setCalendarOpen(false);
  };

  const handleResetDates = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const handleApplyGuests = () => {
    setGuestOpen(false);
  };

  const handleBookButtonClick = () => {
    roomsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRoomBooking = (roomId, e) => {
    e.stopPropagation();
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', format(checkIn, 'yyyy-MM-dd'));
    if (checkOut) params.set('checkOut', format(checkOut, 'yyyy-MM-dd'));
    params.set('rooms', guestOption.rooms.toString());
    params.set('guests', guestOption.guests.toString());

    navigate(`/hotel/${id}/booking/${roomId}?${params.toString()}`);
  };

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      // 로그인 안했으면 패스
      const token = localStorage.getItem('token');
      if (!token || !hotel) return;

      try {
        // 내 찜 목록을 가져와서 현재 호텔이 있는지 확인
        const response = await getFavorites();
        if (response.success) {
          // 백엔드가 찜 목록을 객체 배열로 줄지, ID 배열로 줄지에 따라 다름
          // 일단 ID 비교로 가정
          const isFav = response.data.some(fav =>
            (typeof fav === 'string' ? fav : fav._id) === hotel._id
          );
          setIsFavorited(isFav);
        }
      } catch (error) {
        console.error("찜 상태 확인 실패:", error);
      }
    };

    checkFavoriteStatus();
  }, [hotel]);

  // 하트 클릭 핸들러 수정
  const handleHeartClick = async () => {
    if (!localStorage.getItem('token')) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
      return;
    }

    try {
      if (isFavorited) {
        // 찜 해제 API
        await removeFavorite(hotel._id);
        setIsFavorited(false);
      } else {
        // 찜 추가 API
        await addFavorite(hotel._id);
        setIsFavorited(true);
      }
      // 헤더나 다른 곳의 찜 목록 갱신을 위해 이벤트 발생 (선택사항)
      window.dispatchEvent(new Event('favoritesChanged'));
    } catch (error) {
      console.error("찜 변경 실패:", error);
      alert("오류가 발생했습니다.");
    }
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
  };

  const closeRoomModal = () => {
    setSelectedRoom(null);
  };

  // 별점 렌더링
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < Math.floor(rating || 0) ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  // 로딩 중 UI
  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>로딩 중...</div>;

  // 데이터 없음 UI
  if (!hotel) {
    return (
      <div className="hotel-detail-page">
        <Header />
        <div className="not-found">
          <p>호텔을 찾을 수 없습니다.</p>
          <button onClick={() => navigate('/')} className="btn primary">
            메인으로 돌아가기
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // 이미지 배열 안전하게 가져오기 (없으면 기본 이미지)
  const hotelImages = hotel.images && hotel.images.length > 0
    ? hotel.images
    : ['https://images.unsplash.com/photo-1566073771259-6a8506099945'];

  return (
    <div className="hotel-detail-page">
      <Header />
      <div className="hotel-detail-content">

        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <span>{hotel.country}</span>
          <span className="separator">&gt;</span>
          <span className="hotel-name-breadcrumb">{hotel.lodgingName}</span>
        </div>

        {/* Header Section */}
        <div className="hotel-header">
          <div className="hotel-header-left">
            <div className="hotel-title-section">
              <h1 className="hotel-name">{hotel.lodgingName}</h1>
              <div className="hotel-stars">{renderStars(hotel.starRating)}</div>
            </div>
            <div className="hotel-rating-section">
              <span className="rating-score">{hotel.rating || 0}</span>
              <span className="rating-count">{hotel.reviewCount || 0}개 리뷰</span>
            </div>
            <p className="hotel-address">
              <FiMapPin /> {hotel.address}
            </p>
          </div>
          <div className="hotel-header-right">
            <div className="header-actions">
              <button className="icon-button" onClick={handleHeartClick}>
                <FiHeart className={isFavorited ? 'favorited' : ''} />
              </button>
              <button className="icon-button">
                <FiShare2 />
              </button>
            </div>
            <div className="price-section">
              <span className="price">₩{(hotel.minPrice || 0).toLocaleString()}/night</span>
              <button className="btn primary book-button" onClick={handleBookButtonClick}>예약하기</button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image">
            <img src={hotelImages[0]} alt={hotel.lodgingName} />
          </div>
          <div className="thumbnail-grid">
            {hotelImages.slice(1, 5).map((img, idx) => (
              <div key={idx} className="thumbnail">
                <img src={img} alt={`${hotel.lodgingName} ${idx + 2}`} />
              </div>
            ))}
            {hotelImages.length > 5 && (
              <div className="thumbnail view-all" onClick={() => setIsGalleryOpen(true)}>
                <span>더보기</span>
              </div>
            )}
          </div>
        </div>

        {/* Overview Section */}
        <section className="overview-section">
          <h2 className="section-title">개요</h2>
          <p className="overview-text">
            {hotel.description || `${hotel.lodgingName}은(는) 훌륭한 서비스를 제공합니다.`}
          </p>
        </section>

        {/* Available Rooms Section */}
        <section className="rooms-section" ref={roomsSectionRef}>
          <h2 className="section-title">잔여 객실</h2>

          {/* 날짜/인원 선택 필드 (UI 유지) */}
          <div className="room-booking-selector">
            <div className="date-range-wrapper" ref={checkInFieldRef}>
              <div className="date-range-container">
                <div className="field">
                  <FiCalendar />
                  <div className="field-content">
                    <span>체크인</span>
                    <button className="date-toggle" type="button" onClick={handleCalendarOpen}>
                      {formattedCheckIn}
                    </button>
                  </div>
                </div>
                <div className="field" ref={checkOutFieldRef}>
                  <FiCalendar />
                  <div className="field-content">
                    <span>체크아웃</span>
                    <button className="date-toggle" type="button" onClick={handleCalendarOpen}>
                      {formattedCheckOut}
                    </button>
                  </div>
                </div>
              </div>
              {isCalendarOpen && (
                <div className="calendar-dropdown" ref={calendarRef} onMouseDown={(event) => event.stopPropagation()}>
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={handleCalendarChange}
                    numberOfMonths={2}
                    locale={ko}
                    disabled={{ before: new Date() }}
                    className="rdp"
                  />
                  <div className="calendar-actions">
                    <button className="btn reset" type="button" onClick={handleResetDates}>초기화</button>
                    <button className="btn primary apply" type="button" onClick={handleApplyDates}>완료</button>
                  </div>
                </div>
              )}
            </div>

            <div className="field" ref={guestRef}>
              <FiUsers />
              <div className="field-content">
                <span>객실 및 투숙객</span>
                <button className="guest-button" type="button" onClick={(event) => {
                  event.stopPropagation();
                  setGuestOpen((prev) => !prev);
                  setCalendarOpen(false);
                }}>
                  객실 {guestOption.rooms}개, 투숙객 {guestOption.guests}명
                </button>
              </div>
              {isGuestOpen && (
                <div className="guest-dropdown" onClick={(event) => event.stopPropagation()}>
                  <div className="guest-row">
                    <span className="guest-label">객실</span>
                    <div className="counter-controls">
                      <button type="button" onClick={() => setGuestOption(p => ({ ...p, rooms: Math.max(1, p.rooms - 1) }))}>-</button>
                      <span>{guestOption.rooms}</span>
                      <button type="button" onClick={() => setGuestOption(p => ({ ...p, rooms: p.rooms + 1 }))}>+</button>
                    </div>
                  </div>
                  <div className="guest-row">
                    <span className="guest-label">투숙객</span>
                    <div className="counter-controls">
                      <button type="button" onClick={() => setGuestOption(p => ({ ...p, guests: Math.max(1, p.guests - 1) }))}>-</button>
                      <span>{guestOption.guests}</span>
                      <button type="button" onClick={() => setGuestOption(p => ({ ...p, guests: p.guests + 1 }))}>+</button>
                    </div>
                  </div>
                  <button className="btn primary apply" type="button" onClick={handleApplyGuests}>완료</button>
                </div>
              )}
            </div>
          </div>

          {/* 객실 리스트 */}
          <div className="rooms-grid">
            {visibleRooms.length > 0 ? (
              visibleRooms.map((room) => (
                <div key={room._id} className="room-card" onClick={() => handleRoomClick(room)}>
                  <div className="room-image-wrapper">
                    <div className="room-image">
                      <img
                        // 1순위: DB에 있는 roomImage
                        // 2순위: DB에 없다면 기본 이미지 (unsplash)
                        src={room.roomImage ? room.roomImage : 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                        alt={room.roomName}
                        // 3순위: 이미지 주소가 깨졌을 때를 대비한 안전장치 (onError)
                        onError={(e) => {
                          e.target.onerror = null; // 무한루프 방지
                          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; // 회색 박스 이미지
                        }}
                      />
                    </div>
                  </div>
                  <div className="room-info">
                    <h3 className="room-name">{room.roomName}</h3>
                    <p className="room-description">{room.roomSize} / 기준 {room.capacityMin}명</p>
                    <div className="room-details">
                      <span><FiUsers /> 최대 {room.capacityMax}명</span>
                      <span><FiClock /> 입실 {room.checkInTime}</span>
                      <span><FiClock /> 퇴실 {room.checkOutTime}</span>
                    </div>
                    <div className="room-price-section">
                      <span className="room-price">₩{(room.price || 0).toLocaleString()}/night</span>
                      <button className="btn primary" onClick={(e) => handleRoomBooking(room._id, e)}>예약하기</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ width: '100%', textAlign: 'center', padding: '20px' }}>
                조건에 맞는 객실이 없습니다.
              </div>
            )}
          </div>

          {visibleRoomsCount < filteredRooms.length && (
            <div className="rooms-load-more">
              <span className="load-more-text" onClick={handleLoadMoreRooms}>
                더보기
              </span>
            </div>
          )}
        </section>

        {/* Map Section (좌표가 있다면 표시) */}
        {hotel.lat && hotel.lng && (
          <section className="map-section">
            <h2 className="section-title">지도보기</h2>
            <div className="map-container">
              {/* 구글 맵 임베드 (좌표 기준) */}
              <iframe
                src={`https://maps.google.com/maps?q=${hotel.lat},${hotel.lng}&hl=ko&z=15&output=embed`}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${hotel.lodgingName} 위치`}
              ></iframe>
            </div>
            <p className="map-address">
              <FiMapPin /> {hotel.address}
            </p>
          </section>
        )}

      </div>

      {/* Room Detail Modal (선택 시) */}
      {selectedRoom && (
        <div className="room-modal-overlay" onClick={closeRoomModal}>
          <div className="room-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeRoomModal}>×</button>
            <div className="room-modal-content">
              <div className="room-modal-image">
                <img src={selectedRoom.roomImage || 'https://images.unsplash.com/photo-1631049307264-da0f29a2622e'} alt={selectedRoom.roomName} />
              </div>
              <div className="room-modal-info">
                <h2>{selectedRoom.roomName}</h2>
                <div className="room-modal-details">
                  <div className="detail-item">
                    <FiUsers /> <span>최대 인원: {selectedRoom.capacityMax}명</span>
                  </div>
                  <div className="detail-item">
                    <FiClock /> <span>체크인: {selectedRoom.checkInTime}</span>
                  </div>
                  <div className="detail-item">
                    <FiClock /> <span>체크아웃: {selectedRoom.checkOutTime}</span>
                  </div>
                </div>
                <div className="room-modal-price">
                  <h3>₩{(selectedRoom.price || 0).toLocaleString()} / 1박</h3>
                </div>
                <button
                  className="btn primary full-width"
                  onClick={(e) => {
                    handleRoomBooking(selectedRoom._id, e);
                    closeRoomModal();
                  }}
                >
                  지금 예약하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default HotelDetail;