import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { addDays, format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FiCalendar, FiMapPin, FiUsers, FiX } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import 'react-day-picker/dist/style.css';
import './style/SearchCard.scss';

const destinationOptions = [
  '서울, 대한민국',
  '부산, 대한민국',
  '도쿄, 일본',
  '오사카, 일본',
  '파리, 프랑스',
  '런던, 영국',
  '뉴욕, 미국',
  '멜버른, 호주',
  '콜롬비아, 콜롬비아',
];

const SearchHeader = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL 쿼리 파라미터에서 초기값 읽기
  const destinationParam = searchParams.get('destination') || '';
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const roomsParam = searchParams.get('rooms') || '1';
  const guestsParam = searchParams.get('guests') || '2';

  const [destination, setDestination] = useState(destinationParam);
  const [destinationQuery, setDestinationQuery] = useState(destinationParam);
  const [isDestinationOpen, setDestinationOpen] = useState(false);

  // 날짜 초기값 설정
  const [dateRange, setDateRange] = useState(() => {
    const from = checkInParam ? parseISO(checkInParam) : undefined;
    const to = checkOutParam ? parseISO(checkOutParam) : undefined;
    return { from, to };
  });

  const [isCalendarOpen, setCalendarOpen] = useState(false);
  // ✅ [내 코드의 장점] 체크인/체크아웃 입력창 구분 ('from' | 'to' | null)
  const [activeDateInput, setActiveDateInput] = useState(null);

  const [guestOption, setGuestOption] = useState({
    rooms: parseInt(roomsParam),
    guests: parseInt(guestsParam),
  });
  const [isGuestOpen, setGuestOpen] = useState(false);

  const destinationRef = useRef(null);
  const destinationSearchRef = useRef(null);
  const checkInFieldRef = useRef(null);
  const checkOutFieldRef = useRef(null);
  const calendarRef = useRef(null);
  const guestRef = useRef(null);

  const checkIn = dateRange?.from;
  const checkOut = dateRange?.to;

  const filteredDestinations = useMemo(() => {
    if (!destinationQuery.trim()) return destinationOptions;
    return destinationOptions.filter((item) =>
      item.toLowerCase().includes(destinationQuery.toLowerCase())
    );
  }, [destinationQuery]);

  useEffect(() => {
    if (isDestinationOpen) {
      destinationSearchRef.current?.focus();
    }

    const handleClickOutside = (event) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target)) {
        setDestinationOpen(false);
      }

      const isInsideCalendar =
        calendarRef.current?.contains(event.target) ||
        checkInFieldRef.current?.contains(event.target) ||
        checkOutFieldRef.current?.contains(event.target);

      if (isCalendarOpen && !isInsideCalendar) {
        setCalendarOpen(false);
        setActiveDateInput(null);
      }

      if (guestRef.current && !guestRef.current.contains(event.target)) {
        setGuestOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isCalendarOpen]);

  // 체크아웃 날짜 역전 방지
  useEffect(() => {
    if (checkIn && checkOut && checkOut <= checkIn) {
      setDateRange({ from: checkIn, to: addDays(checkIn, 1) });
    }
  }, [checkIn, checkOut]);

  const formatDateLabel = (date, fallback) =>
    date ? format(date, 'MM.dd (EEE)', { locale: ko }) : fallback;

  const formattedCheckIn = formatDateLabel(checkIn, '날짜 선택');
  const formattedCheckOut = formatDateLabel(checkOut, '날짜 선택');

  // ✅ [내 코드의 장점] 날짜 선택 핸들러
  const handleCalendarChange = (range, selectedDay) => {
    // 체크인 입력창이 활성화된 상태라면? -> 무조건 시작일로 설정하고 체크아웃으로 전환
    if (activeDateInput === 'from' && selectedDay) {
      setDateRange({ from: selectedDay, to: undefined });
      setActiveDateInput('to');
      return;
    }

    // 체크아웃 입력창이거나 일반적인 경우
    setDateRange(range || { from: undefined, to: undefined });

    // 둘 다 선택되면 닫기
    if (range?.from && range?.to) {
      setTimeout(() => {
        setCalendarOpen(false);
        setActiveDateInput(null);
      }, 200);
    }
  };

  const handleOpenCheckIn = (event) => {
    event.stopPropagation();
    setCalendarOpen(true);
    setActiveDateInput('from');
    setDestinationOpen(false);
    setGuestOpen(false);
  };

  const handleOpenCheckOut = (event) => {
    event.stopPropagation();
    if (!checkIn) {
      setCalendarOpen(true);
      setActiveDateInput('from');
      setDestinationOpen(false);
      setGuestOpen(false);
      return;
    }
    setCalendarOpen(true);
    setActiveDateInput('to');
    setDestinationOpen(false);
    setGuestOpen(false);
  };

  const handleApplyDates = () => {
    if (checkIn && !checkOut) {
      setDateRange({ from: checkIn, to: addDays(checkIn, 1) });
    }
    setCalendarOpen(false);
    setActiveDateInput(null);
  };

  const handleResetDates = () => {
    setDateRange({ from: undefined, to: undefined });
    setActiveDateInput('from');
  };

  const handleApplyGuests = () => {
    setGuestOpen(false);
  };

  const handleSearch = () => {
    const finalDestination = destinationQuery?.trim() || destination?.trim();

    if (!finalDestination) {
      alert('목적지를 선택해주세요.');
      return;
    }

    const params = new URLSearchParams();
    params.set('destination', finalDestination);

    if (checkIn) params.set('checkIn', format(checkIn, 'yyyy-MM-dd'));
    if (checkOut) params.set('checkOut', format(checkOut, 'yyyy-MM-dd'));
    params.set('rooms', guestOption.rooms.toString());
    params.set('guests', guestOption.guests.toString());

    // navigate를 사용하여 검색 페이지로 이동 (같은 페이지라면 쿼리만 변경됨)
    navigate(`/search?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // URL 파라미터 변경 감지 및 동기화 (내 코드의 로직 유지)
  const urlParams = useMemo(() => ({
    destination: searchParams.get('destination'),
    checkIn: searchParams.get('checkIn'),
    checkOut: searchParams.get('checkOut'),
    rooms: searchParams.get('rooms'),
    guests: searchParams.get('guests'),
  }), [searchParams]);

  useEffect(() => {
    const dest = urlParams.destination;
    const checkInParam = urlParams.checkIn;
    const checkOutParam = urlParams.checkOut;
    const rooms = urlParams.rooms;
    const guests = urlParams.guests;

    if (dest && dest !== destination) {
      setDestination(dest);
      setDestinationQuery(dest);
    }

    if (checkInParam && checkOutParam) {
      const from = parseISO(checkInParam);
      const to = parseISO(checkOutParam);
      const currentCheckIn = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
      const currentCheckOut = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;
      if (currentCheckIn !== checkInParam || currentCheckOut !== checkOutParam) {
        setDateRange({ from, to });
      }
    }

    if (rooms) {
      const roomsNum = parseInt(rooms);
      if (roomsNum !== guestOption.rooms) {
        setGuestOption((prev) => ({ ...prev, rooms: roomsNum }));
      }
    }

    if (guests) {
      const guestsNum = parseInt(guests);
      if (guestsNum !== guestOption.guests) {
        setGuestOption((prev) => ({ ...prev, guests: guestsNum }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlParams]);

  return (
    <div className="search-header-wrapper">
      <div className="search-card">
        <div className="search-field">
          <label>어디에 머무르시나요?</label>
          <div className="search-row">
            
            {/* 목적지 필드 */}
            <div className="field" ref={destinationRef}>
              <FiMapPin />
              <div className="field-content">
                <span>목적지 입력</span>
                <div className="destination-input-wrapper">
                  <input
                    className="destination-input"
                    type="text"
                    value={destinationQuery}
                    placeholder="도시 또는 호텔명을 입력하세요"
                    onFocus={() => setDestinationOpen(true)}
                    onChange={(event) => {
                      setDestinationQuery(event.target.value);
                      setDestinationOpen(true);
                    }}
                    onClick={(event) => event.stopPropagation()}
                  />
                  {destinationQuery && (
                    <button
                      className="clear-input-button"
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setDestination('');
                        setDestinationQuery('');
                      }}
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              </div>
              {isDestinationOpen && (
                <div className="destination-dropdown" onMouseDown={(e) => e.stopPropagation()}>
                  <div className="destination-list">
                    {filteredDestinations.length > 0 ? (
                      filteredDestinations.map((item) => (
                        <button
                          className="destination-item"
                          key={item}
                          type="button"
                          onMouseDown={() => {
                            setDestination(item);
                            setDestinationQuery(item);
                            setDestinationOpen(false);
                          }}
                        >
                          {item}
                        </button>
                      ))
                    ) : (
                      <div className="empty-result">일치하는 결과가 없습니다.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 날짜 필드 */}
            <div className="date-range-wrapper" ref={checkInFieldRef}>
              <div className="date-range-container">
                <div 
                  className={`field ${activeDateInput === 'from' ? 'active-input' : ''}`}
                  onClick={handleOpenCheckIn}
                >
                  <FiCalendar />
                  <div className="field-content">
                    <span>체크인</span>
                    <button className="date-toggle" type="button">
                      {formattedCheckIn}
                    </button>
                  </div>
                </div>
                <div 
                  className={`field ${activeDateInput === 'to' ? 'active-input' : ''}`}
                  ref={checkOutFieldRef}
                  onClick={handleOpenCheckOut}
                >
                  <FiCalendar />
                  <div className="field-content">
                    <span>체크아웃</span>
                    <button className="date-toggle" type="button">
                      {formattedCheckOut}
                    </button>
                  </div>
                </div>
              </div>
              {isCalendarOpen && (
                <div
                  className="calendar-dropdown"
                  ref={calendarRef}
                  onMouseDown={(event) => event.stopPropagation()}
                >
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

            {/* 인원 필드 */}
            <div className="field" ref={guestRef}>
              <FiUsers />
              <div className="field-content">
                <span>객실 및 투숙객</span>
                <button
                  className="guest-button"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGuestOpen(!isGuestOpen);
                    setDestinationOpen(false);
                    setCalendarOpen(false);
                  }}
                >
                  객실 {guestOption.rooms}개, 투숙객 {guestOption.guests}명
                </button>
              </div>
              {isGuestOpen && (
                <div className="guest-dropdown" onClick={(e) => e.stopPropagation()}>
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

            <button className="btn primary search-button" type="button" onClick={handleSearch}>
              검색
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;