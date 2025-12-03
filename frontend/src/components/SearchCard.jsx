import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FiCalendar, FiMapPin, FiUsers, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import 'react-day-picker/dist/style.css';
import './style/SearchCard.scss';

// ... (destinationOptions 배열은 그대로 유지) ...
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
  const [destination, setDestination] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [isDestinationOpen, setDestinationOpen] = useState(false);

  // ✅ [수정 1] 날짜 기본값을 비워둠 (undefined)
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

  const [isCalendarOpen, setCalendarOpen] = useState(false);
  // ✅ [추가] 어떤 필드를 클릭했는지 추적 ('from' | 'to' | null)
  const [activeDateInput, setActiveDateInput] = useState(null);

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

  // ... (filteredDestinations useMemo 그대로 유지) ...
  const filteredDestinations = useMemo(() => {
    if (!destinationQuery.trim()) return destinationOptions;
    return destinationOptions.filter((item) =>
      item.toLowerCase().includes(destinationQuery.toLowerCase())
    );
  }, [destinationQuery]);

  // ... (handleClickOutside useEffect 그대로 유지) ...
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
        setActiveDateInput(null); // 닫히면 포커스 해제
      }

      if (guestRef.current && !guestRef.current.contains(event.target)) {
        setGuestOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isCalendarOpen]);

  // ✅ [수정] 날짜 자동 조정 로직 (역전 방지)
  useEffect(() => {
    if (checkIn && checkOut && checkOut <= checkIn) {
        // 체크아웃이 체크인보다 빠르면 체크아웃을 초기화
        setDateRange({ from: checkIn, to: undefined });
    }
  }, [checkIn, checkOut]);

  const formatDateLabel = (date, fallback) =>
    date ? format(date, 'MM.dd (EEE)', { locale: ko }) : fallback;

  const formattedCheckIn = formatDateLabel(checkIn, '날짜 선택');
  const formattedCheckOut = formatDateLabel(checkOut, '날짜 선택');

  // ✅ [수정] 달력 날짜 선택 핸들러
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

  // ✅ [수정] 체크인/체크아웃 버튼 클릭 핸들러 분리
  const handleOpenCheckIn = (event) => {
    event.stopPropagation();
    setCalendarOpen(true);
    setActiveDateInput('from'); // 체크인 활성화
    setDestinationOpen(false);
    setGuestOpen(false);
    
    // 체크인을 누르면 "새로운 여행 시작"의 의미가 강하므로 기존 날짜 리셋 (선택사항)
    // setDateRange({ from: undefined, to: undefined }); 
  };

  const handleOpenCheckOut = (event) => {
    event.stopPropagation();
    
    // 체크인이 없는데 체크아웃을 누르면 -> 체크인부터 찍게 유도
    if (!checkIn) {
        setCalendarOpen(true);
        setActiveDateInput('from');
        setDestinationOpen(false);
        setGuestOpen(false);
        return;
    }

    setCalendarOpen(true);
    setActiveDateInput('to'); // 체크아웃 활성화
    setDestinationOpen(false);
    setGuestOpen(false);
  };

  const handleResetDates = () => {
    setDateRange({ from: undefined, to: undefined });
    setActiveDateInput('from'); // 초기화하면 체크인부터 다시
  };

  const handleApplyDates = () => {
    setCalendarOpen(false);
    setActiveDateInput(null);
  };

  // ... (나머지 handleApplyGuests, handleSearch 등 그대로 유지) ...
  const handleApplyGuests = () => {
    setGuestOpen(false);
  };

  const handleSearch = () => {
    // 🚨 [수정 2] 검색 우선순위 정리
    // 1순위: 지금 입력창에 있는 글자 (destinationQuery)
    // 2순위: 드롭다운에서 선택했던 글자 (destination)
    // trim()으로 앞뒤 공백 제거
    const finalDestination = destinationQuery?.trim() || destination?.trim();

    if (!finalDestination) {
      alert('목적지를 입력해주세요.'); // 도시 선택 안 하고 검색 누르면 경고
      return;
    }

    const params = new URLSearchParams();
    params.set('destination', finalDestination);

    if (checkIn) params.set('checkIn', format(checkIn, 'yyyy-MM-dd'));
    if (checkOut) params.set('checkOut', format(checkOut, 'yyyy-MM-dd'));
    params.set('rooms', guestOption.rooms.toString());
    params.set('guests', guestOption.guests.toString());
    
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="search-card" onClick={(event) => event.stopPropagation()}>
      <div className="search-field">
        <label>어디에 머무르시나요?</label>
        <div className="search-row">
          
          {/* ... (목적지 필드 부분 그대로 유지) ... */}
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
                 {/* ... 드롭다운 내용 그대로 ... */}
                 <div className="destination-list">
                  {filteredDestinations.map(item => (
                      <button className="destination-item" key={item} type="button" 
                        onMouseDown={() => {
                            setDestination(item);
                            setDestinationQuery(item);
                            setDestinationOpen(false);
                        }}>{item}</button>
                  ))}
                 </div>
              </div>
            )}
          </div>

          <div className="date-range-wrapper" ref={checkInFieldRef}>
            <div className="date-range-container">
              {/* ✅ [수정] 체크인 필드 - 클릭 시 handleOpenCheckIn 실행 */}
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

              {/* ✅ [수정] 체크아웃 필드 - 클릭 시 handleOpenCheckOut 실행 */}
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

          {/* ... (인원 선택 필드 그대로 유지) ... */}
          <div className="field" ref={guestRef}>
            <FiUsers />
            <div className="field-content">
              <span>객실 및 투숙객</span>
              <button className="guest-button" type="button" onClick={(e) => {
                  e.stopPropagation();
                  setGuestOpen(!isGuestOpen);
                  setDestinationOpen(false);
                  setCalendarOpen(false);
              }}>
                객실 {guestOption.rooms}개, 투숙객 {guestOption.guests}명
              </button>
            </div>
            {isGuestOpen && (
                <div className="guest-dropdown" onClick={(e) => e.stopPropagation()}>
                    {/* ... (카운터 UI 그대로 유지) ... */}
                    <div className="guest-row">
                        <span className="guest-label">객실</span>
                        <div className="counter-controls">
                            <button type="button" onClick={() => setGuestOption(p => ({...p, rooms: Math.max(1, p.rooms-1)}))}>-</button>
                            <span>{guestOption.rooms}</span>
                            <button type="button" onClick={() => setGuestOption(p => ({...p, rooms: p.rooms+1}))}>+</button>
                        </div>
                    </div>
                    <div className="guest-row">
                        <span className="guest-label">투숙객</span>
                        <div className="counter-controls">
                            <button type="button" onClick={() => setGuestOption(p => ({...p, guests: Math.max(1, p.guests-1)}))}>-</button>
                            <span>{guestOption.guests}</span>
                            <button type="button" onClick={() => setGuestOption(p => ({...p, guests: p.guests+1}))}>+</button>
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
  );
};

export default SearchCard;