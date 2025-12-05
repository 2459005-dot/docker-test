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

  // URL 쿼리 파라미터에서 검색 값 읽기
  const destinationParam = searchParams.get('destination') || '';
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const roomsParam = searchParams.get('rooms') || '1';
  const guestsParam = searchParams.get('guests') || '2';

  const [destination, setDestination] = useState(destinationParam);
  const [destinationQuery, setDestinationQuery] = useState(destinationParam);
  const [isDestinationOpen, setDestinationOpen] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const from = checkInParam ? parseISO(checkInParam) : undefined;
    const to = checkOutParam ? parseISO(checkOutParam) : undefined;
    return { from, to };
  });
  const [isCalendarOpen, setCalendarOpen] = useState(false);
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
      }

      if (guestRef.current && !guestRef.current.contains(event.target)) {
        setGuestOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isCalendarOpen]);

  useEffect(() => {
    if (checkIn && checkOut && checkOut <= checkIn) {
      setDateRange({ from: checkIn, to: addDays(checkIn, 1) });
    }
  }, [checkIn, checkOut]);

  const formatDateLabel = (date, fallback) =>
    date ? format(date, 'MM.dd (EEE)', { locale: ko }) : fallback;

  const formattedCheckIn = formatDateLabel(checkIn, '날짜 선택');
  const formattedCheckOut = formatDateLabel(checkOut, '날짜 선택');

  // ✅ [수정] 날짜 선택 핸들러
  const handleCalendarChange = (range, selectedDay) => {

    // 1. [핵심] '체크인' 입력창이 활성화된 상태라면?
    // 라이브러리가 계산한 range는 무시하고, 클릭한 날짜를 무조건 '새로운 시작일'로 설정
    if (activeDateInput === 'from' && selectedDay) {
      setDateRange({ from: selectedDay, to: undefined }); // 끝 날짜 초기화
      setActiveDateInput('to'); // 바로 체크아웃 선택 모드로 전환
      return;
    }

    // 2. '체크아웃' 입력창이 활성화된 상태라면?
    // 기존 로직대로 range를 따라가되, 날짜 순서가 꼬이면 라이브러리가 알아서 뒤집어준 걸 씁니다.
    setDateRange(range || { from: undefined, to: undefined });

    // 3. 둘 다 선택되면 닫기 (0.2초 딜레이)
    if (range?.from && range?.to) {
      setTimeout(() => {
        setCalendarOpen(false);
        setActiveDateInput(null);
      }, 200);
    }
  };

  const handleCalendarOpen = (event) => {
    event.stopPropagation();
    setCalendarOpen(true);
    setDestinationOpen(false);
    setGuestOpen(false);
  };

  // ✅ [수정] '완료' 버튼은 유지하되, 필요성은 줄어듦 (수동 닫기 용도)
  const handleApplyDates = () => {
    // 만약 체크인만 찍고 닫으려 할 때, 체크아웃을 다음날로 자동 설정
    if (checkIn && !checkOut) {
      setDateRange({ from: checkIn, to: addDays(checkIn, 1) });
    }
    setCalendarOpen(false);
  };

  const handleApplyGuests = () => {
    setGuestOpen(false);
    // URL 쿼리 파라미터 업데이트
    const params = new URLSearchParams(searchParams);
    params.set('rooms', guestOption.rooms.toString());
    params.set('guests', guestOption.guests.toString());
    setSearchParams(params);
  };

  const handleResetDates = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const handleSearch = () => {
    // URL 쿼리 파라미터 업데이트
    // destinationQuery가 최신 값이므로 우선 사용, 없으면 destination 사용
    const finalDestination = (destinationQuery?.trim()) || (destination?.trim());

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

    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // URL 쿼리 파라미터가 변경될 때 상태 업데이트 (초기 로드 및 쿼리 변경 시)
  // useMemo로 파라미터 값들을 메모이제이션하여 무한 루프 방지
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

    // destination이 URL에 있고 현재 상태와 다를 때만 업데이트
    if (dest && dest !== destination) {
      setDestination(dest);
      setDestinationQuery(dest);
    }

    // 날짜 업데이트
    if (checkInParam && checkOutParam) {
      const from = parseISO(checkInParam);
      const to = parseISO(checkOutParam);
      // 날짜가 실제로 변경되었을 때만 업데이트
      const currentCheckIn = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
      const currentCheckOut = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;
      if (currentCheckIn !== checkInParam || currentCheckOut !== checkOutParam) {
        setDateRange({ from, to });
      }
    }

    // 객실 수 업데이트
    if (rooms) {
      const roomsNum = parseInt(rooms);
      if (roomsNum !== guestOption.rooms) {
        setGuestOption((prev) => ({ ...prev, rooms: roomsNum }));
      }
    }

    // 투숙객 수 업데이트
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
                      const value = event.target.value;
                      setDestinationQuery(value);
                      setDestinationOpen(true);
                      // 입력 중일 때는 destination을 업데이트하지 않음 (드롭다운에서 선택할 때만 업데이트)
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
                <div
                  className="destination-dropdown"
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <div className="destination-search-wrapper">
                    <input
                      className="destination-search"
                      ref={destinationSearchRef}
                      type="text"
                      placeholder="도시 검색"
                      value={destinationQuery}
                      onChange={(event) => setDestinationQuery(event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                    />
                    {destinationQuery && (
                      <button
                        className="clear-search-button"
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setDestination('');
                          setDestinationQuery('');
                          requestAnimationFrame(() => {
                            destinationSearchRef.current?.focus();
                          });
                        }}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
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
                            // 도시 선택 시 즉시 검색 (선택사항)
                            // 또는 검색 버튼을 눌러야 검색되도록 유지
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
              {isCalendarOpen ? (
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
                    <button className="btn reset" type="button" onClick={handleResetDates}>
                      초기화
                    </button>
                    <button className="btn primary apply" type="button" onClick={handleApplyDates}>
                      완료
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="field" ref={guestRef}>
              <FiUsers />
              <div className="field-content">
                <span>객실 및 투숙객</span>
                <button
                  className="guest-button"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setGuestOpen((prev) => !prev);
                    setDestinationOpen(false);
                    setCalendarOpen(false);
                  }}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                >
                  객실 {guestOption.rooms}개, 투숙객 {guestOption.guests}명
                </button>
              </div>
              {isGuestOpen ? (
                <div
                  className="guest-dropdown"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="guest-row">
                    <span className="guest-label">객실</span>
                    <div className="counter-controls">
                      <button
                        className="counter-button"
                        type="button"
                        onClick={() =>
                          setGuestOption((prev) => ({
                            ...prev,
                            rooms: Math.max(1, prev.rooms - 1),
                          }))
                        }
                      >
                        -
                      </button>
                      <span>{guestOption.rooms}</span>
                      <button
                        className="counter-button"
                        type="button"
                        onClick={() =>
                          setGuestOption((prev) => ({
                            ...prev,
                            rooms: prev.rooms + 1,
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="guest-row">
                    <span className="guest-label">투숙객</span>
                    <div className="counter-controls">
                      <button
                        className="counter-button"
                        type="button"
                        onClick={() =>
                          setGuestOption((prev) => ({
                            ...prev,
                            guests: Math.max(1, prev.guests - 1),
                          }))
                        }
                      >
                        -
                      </button>
                      <span>{guestOption.guests}</span>
                      <button
                        className="counter-button"
                        type="button"
                        onClick={() =>
                          setGuestOption((prev) => ({
                            ...prev,
                            guests: prev.guests + 1,
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button className="btn primary apply" type="button" onClick={handleApplyGuests}>
                    완료
                  </button>
                </div>
              ) : null}
            </div>
            <button
              className="btn primary search-button"
              type="button"
              onClick={handleSearch}
            >
              검색
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;

