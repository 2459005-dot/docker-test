import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FiCalendar, FiMapPin, FiUsers, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
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

const SearchCard = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('서울, 대한민국');
  const [destinationQuery, setDestinationQuery] = useState(destination);
  const [isDestinationOpen, setDestinationOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date('2025-12-02'),
    to: addDays(new Date('2025-12-02'), 2),
  });
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [guestOption, setGuestOption] = useState({ rooms: 1, guests: 2 });
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

  const handleCalendarChange = (range) => {
    setDateRange(range || { from: undefined, to: undefined });
  };

  const handleCalendarOpen = (event) => {
    event.stopPropagation();
    setCalendarOpen(true);
    setDestinationOpen(false);
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

  const handleSearch = () => {
    // URL 쿼리 파라미터로 검색 값 전달
    const params = new URLSearchParams();
    if (destination) params.set('destination', destination);
    if (checkIn) params.set('checkIn', format(checkIn, 'yyyy-MM-dd'));
    if (checkOut) params.set('checkOut', format(checkOut, 'yyyy-MM-dd'));
    params.set('rooms', guestOption.rooms.toString());
    params.set('guests', guestOption.guests.toString());
    
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div
      className="search-card"
      onClick={(event) => event.stopPropagation()}
    >
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
  );
};

export default SearchCard;

