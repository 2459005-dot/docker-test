import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiShare2,
  FiDownload,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUsers,
} from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getMyBookings } from '../api/bookingApi'; // ✅ API import
import './style/BookingConfirmation.scss';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 방금 예약한 정보 (Booking.jsx에서 넘어옴)
  const [booking, setBooking] = useState(location.state || null);
  
  // DB에서 가져온 내 예약 내역
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // 기본값은 닫힘으로 변경
  const [loading, setLoading] = useState(true);

  // 금액 포맷 함수
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '-';
    return `₩${Number(value).toLocaleString()}`;
  };

  // 날짜 포맷 함수 (ISO String -> 보기 좋은 날짜)
  const formatHistoryDate = (isoString) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return '-';
    }
  };

  // ✅ 1. 내 예약 목록 불러오기 (DB 연동)
  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        setLoading(true);
        const response = await getMyBookings();
        
        if (response.success && response.data.length > 0) {
          // 백엔드 데이터를 프론트 UI에 맞게 변환 (매핑)
          const mappedHistory = response.data.map(item => ({
            bookingNumber: item._id, // 예약 ID
            hotelName: item.lodgingId?.lodgingName || '숙소 정보 없음',
            roomName: item.roomId?.roomName || '객실 정보 없음',
            address: item.lodgingId?.address || '',
            city: item.lodgingId?.country || '', // 도시 정보가 없으면 국가로 대체
            country: item.lodgingId?.country || '대한민국',
            image: (item.lodgingId?.images && item.lodgingId.images.length > 0) ? item.lodgingId.images[0] : '',
            
            checkInDateLabel: item.checkIn ? new Date(item.checkIn).toLocaleDateString() : '-',
            checkOutDateLabel: item.checkOut ? new Date(item.checkOut).toLocaleDateString() : '-',
            checkInTime: '15:00', // DB에 시간이 없으면 기본값
            checkOutTime: '11:00',
            
            arrivalInfo: item.status === 'confirmed' ? '예약 확정' : '결제 대기',
            guestName: item.userName || 'Guest',
            guestCount: 2, // 인원 정보 없으면 기본값
            
            barcode: '|| ||| | |||| |||',
            totalPrice: item.price,
            paymentMethod: '카드 결제',
            createdAt: item.createdAt
          }));

          setBookingHistory(mappedHistory);

          // 만약 방금 넘어온 state가 없다면, 가장 최근 예약을 보여줌
          if (!location.state && mappedHistory.length > 0) {
            setBooking(mappedHistory[0]);
          }
        }
      } catch (error) {
        console.error("예약 내역 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [location.state]);

  const breadcrumbItems = [
    booking?.country || '대한민국',
    booking?.city || '서울',
    booking?.hotelName || '숙소',
  ];

  const handleDownload = () => {
    window.print();
  };

  const handleBackToSearch = () => {
    navigate('/search');
  };

  const handleSelectBooking = (item) => {
    setBooking(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 로딩 중이거나 예약 정보가 아예 없을 때
  if (loading && !booking) return <div style={{padding: '100px', textAlign: 'center'}}>로딩 중...</div>;
  if (!booking && !loading) {
    return (
        <div className="booking-confirmation-page">
            <Header />
            <div className="booking-confirmation-container">
                <div className="not-found" style={{textAlign: 'center', padding: '100px 0'}}>
                    <h2>예약된 내역이 없습니다.</h2>
                    <button className="btn primary" onClick={() => navigate('/')} style={{marginTop: '20px'}}>홈으로 가기</button>
                </div>
            </div>
            <Footer />
        </div>
    );
  }

  return (
    <div className="booking-confirmation-page">
      <Header />
      <div className="booking-confirmation-container">
        <div className="breadcrumbs">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              <span>{item}</span>
              {index < breadcrumbItems.length - 1 && <span className="separator">&gt;</span>}
            </React.Fragment>
          ))}
        </div>

        {/* 예약 내역 리스트 (토글) */}
        {bookingHistory.length > 0 && (
          <section className="booking-history-section">
            <div className="section-header">
              <div className="section-copy">
                <h2>예약 내역</h2>
                <p>최근 예약 내역을 확인할 수 있습니다.</p>
              </div>
              <button
                type="button"
                className="toggle-history"
                onClick={() => setIsHistoryOpen((prev) => !prev)}
                aria-expanded={isHistoryOpen}
              >
                {isHistoryOpen ? '접기' : '펼치기'}
              </button>
            </div>
            {isHistoryOpen && (
              <div className="history-list">
                {bookingHistory.map((item) => {
                  const isActive = item.bookingNumber === booking.bookingNumber;
                  return (
                    <article
                      key={item.bookingNumber}
                      className={`history-card ${isActive ? 'active' : ''}`}
                    >
                      <div className="history-main">
                        <strong>{item.hotelName}</strong>
                        <span>{item.roomName}</span>
                      </div>
                      <div className="history-meta">
                        <span>
                          {item.checkInDateLabel} - {item.checkOutDateLabel}
                        </span>
                        <span>{formatHistoryDate(item.createdAt)}</span>
                      </div>
                      <button type="button" onClick={() => handleSelectBooking(item)}>
                        상세 보기
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <div className="confirmation-header">
          <div className="header-info">
            <h1>{booking.hotelName}</h1>
            <p>
              <FiMapPin />
              {booking.address}
            </p>
          </div>
          <div className="header-actions">
            <span className="price">{formatCurrency(booking.totalPrice)}</span>
            <div className="action-buttons">
              <button className="icon-button" aria-label="공유하기">
                <FiShare2 />
              </button>
              <button className="btn primary" onClick={handleDownload}>
                <FiDownload />
                Download
              </button>
            </div>
          </div>
        </div>

        <div className="ticket-card">
          <div className="ticket-main">
            <div className="ticket-dates">
              <div className="date-block">
                <span className="label">체크인</span>
                <strong>{booking.checkInDateLabel}</strong>
              </div>
              <div className="date-divider"></div>
              <div className="date-block">
                <span className="label">체크아웃</span>
                <strong>{booking.checkOutDateLabel}</strong>
              </div>
            </div>

            <div className="ticket-body">
              <div className="guest-info">
                <div className="avatar">{booking.guestName?.[0] || 'G'}</div>
                <div className="guest-details">
                  <span className="guest-name">{booking.guestName}</span>
                  <span className="room-name">{booking.roomName}</span>
                </div>
                <div className="stay-meta">
                  <div>
                    <span className="label">체크인 시간</span>
                    <strong>{booking.checkInTime || '15:00'}</strong>
                  </div>
                  <div>
                    <span className="label">체크아웃 시간</span>
                    <strong>{booking.checkOutTime || '11:00'}</strong>
                  </div>
                  <div>
                    <span className="label">결제 상태</span>
                    <strong>{booking.arrivalInfo || '예약 확정'}</strong>
                  </div>
                </div>
              </div>

              <div className="ticket-footer">
                <div className="ticket-code">
                  <span className="label">예약 코드</span>
                  <strong>{booking.bookingNumber?.slice(-8).toUpperCase()}</strong>
                </div>
                <div className="barcode">{booking.barcode || '|| ||| | |||| |||'}</div>
              </div>
            </div>
          </div>

          <div className="ticket-side">
            {booking.image && (
              <div className="ticket-photo">
                <img src={booking.image} alt={`${booking.hotelName} 이미지`} />
              </div>
            )}
            <div className="logo-placeholder">
              <span className="brand">{booking.hotelName}</span>
              <p>{booking.address}</p>
            </div>
            <div className="ticket-summary">
              <div>
                <FiCalendar />
                <span>
                  {booking.checkInDateLabel} - {booking.checkOutDateLabel}
                </span>
              </div>
              <div>
                <FiClock />
                <span>
                  {booking.checkInTime || '15:00'} · {booking.checkOutTime || '11:00'}
                </span>
              </div>
              <div>
                <FiUsers />
                <span>최대 {parseInt(booking.guestCount || 2, 10)}명</span>
              </div>
            </div>
          </div>
        </div>

        <section className="payment-section">
          <article className="info-card">
            <div className="info-card-header">
              <h2>결제 상세</h2>
              <span>{booking.arrivalInfo || '결제 완료'}</span>
            </div>
            <dl>
              <div>
                <dt>총 결제 금액</dt>
                <dd>{formatCurrency(booking.totalPrice)}</dd>
              </div>
              <div>
                <dt>결제 수단</dt>
                <dd>{booking.paymentMethod || '카드 결제'}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section className="terms-section">
          <h2>이용 약관</h2>
          <div className="terms-columns">
            <div>
              <h3>결제 안내</h3>
              <ul>
                <li>결제 정보가 정확하지 않은 경우 예약이 취소될 수 있습니다.</li>
                <li>체크인 시 사용한 카드와 신분증을 지참해 주세요.</li>
              </ul>
            </div>
            <div>
              <h3>취소 및 변경</h3>
              <ul>
                <li>호텔 정책에 따라 취소 수수료가 발생할 수 있습니다.</li>
                <li>추가 문의는 help@golobe.com 으로 연락 주세요.</li>
              </ul>
            </div>
          </div>
        </section>

        <button className="btn primary back-button" onClick={handleBackToSearch}>
          다른 숙소 둘러보기
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default BookingConfirmation;