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
import './style/BookingConfirmation.scss';

const defaultBooking = {
  hotelName: '해튼호텔',
  roomName: 'Superior room - 1 double bed or 2 twin beds',
  address: 'Gümüssuyu Mah. İnönü Cad. No:8, Istanbul 34437',
  city: 'Istanbul',
  country: 'Turkey',
  image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  checkInDateLabel: 'Dec 8 (Thu)',
  checkOutDateLabel: 'Dec 9 (Fri)',
  checkInTime: '12:00pm',
  checkOutTime: '11:30pm',
  arrivalInfo: '결제 완료',
  guestName: 'James Doe',
  guestCount: 2,
  bookingNumber: '20250123',
  barcode: '|| ||| | |||| |||',
  totalPrice: 240000,
  guestEmail: 'james.doe@email.com',
  guestPhone: '+82 10-2345-6789',
  specialRequests: '늦은 체크아웃 요청',
  paymentMethod: 'Visa •••• 9421',
  paymentStatus: '결제 완료',
  roomCharge: 320000,
  serviceFee: 15000,
  taxes: 15000,
  hotelPhone: '+82 2-987-6543',
  hotelEmail: 'contact@hatonhotel.com',
  supportHours: '연중무휴 24시간',
};

const getStoredHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('bookingHistory')) || [];
  } catch (error) {
    console.error('Failed to read booking history', error);
    return [];
  }
};

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(location.state || defaultBooking);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '-';
    return `₩${Number(value).toLocaleString()}`;
  };

  useEffect(() => {
    const storedHistory = getStoredHistory();
    if (location.state) {
      setBooking(location.state);
    } else if (storedHistory.length) {
      setBooking(storedHistory[0]);
    }
    setBookingHistory(storedHistory);
  }, [location.state]);

  const breadcrumbItems = [
    booking.country || '대한민국',
    booking.city || '서울',
    booking.hotelName || '해튼호텔',
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

  return (
    <div className="booking-confirmation-page">
      <Header />
      <div className="booking-confirmation-container">
        <div className="breadcrumbs">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item}>
              <span>{item}</span>
              {index < breadcrumbItems.length - 1 && <span className="separator">&gt;</span>}
            </React.Fragment>
          ))}
        </div>

        {bookingHistory.length > 0 && (
          <section className="booking-history-section">
            <div className="section-header">
              <div className="section-copy">
                <h2>예약 내역</h2>
                <p>최신 예약부터 최대 10건까지 확인할 수 있습니다.</p>
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
                      key={`${item.bookingNumber}_${item.createdAt}`}
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
            <span className="price">₩{(booking.totalPrice || 0).toLocaleString()}/night</span>
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
                <div className="avatar">{booking.guestName?.[0] || 'J'}</div>
                <div className="guest-details">
                  <span className="guest-name">{booking.guestName}</span>
                  <span className="room-name">{booking.roomName}</span>
                </div>
                <div className="stay-meta">
                  <div>
                    <span className="label">체크인 시간</span>
                    <strong>{booking.checkInTime}</strong>
                  </div>
                  <div>
                    <span className="label">체크아웃 시간</span>
                    <strong>{booking.checkOutTime}</strong>
                  </div>
                  <div>
                    <span className="label">결제 상태</span>
                    <strong>{booking.arrivalInfo}</strong>
                  </div>
                </div>
              </div>

              <div className="ticket-footer">
                <div className="ticket-code">
                  <span className="label">예약 코드</span>
                  <strong>{booking.bookingNumber}</strong>
                </div>
                <div className="barcode">{booking.barcode}</div>
              </div>

              <div className="ticket-extra">
                <article className="info-card compact">
                  <div className="info-card-header">
                    <h2>게스트 정보</h2>
                    <span>{`${parseInt(booking.guestCount, 10) || 1}명`}</span>
                  </div>
                  <dl>
                    <div>
                      <dt>대표 투숙객</dt>
                      <dd>{booking.guestName}</dd>
                    </div>
                    <div>
                      <dt>이메일</dt>
                      <dd>{booking.guestEmail || '등록되지 않음'}</dd>
                    </div>
                    <div>
                      <dt>연락처</dt>
                      <dd>{booking.guestPhone || '-'}</dd>
                    </div>
                    <div>
                      <dt>특별 요청</dt>
                      <dd>{booking.specialRequests || '없음'}</dd>
                    </div>
                  </dl>
                </article>

                <article className="info-card compact">
                  <div className="info-card-header">
                    <h2>연락처 / 헬프라인</h2>
                    <span>24/7</span>
                  </div>
                  <dl>
                    <div>
                      <dt>호텔 대표번호</dt>
                      <dd>{booking.hotelPhone || '-'}</dd>
                    </div>
                    <div>
                      <dt>이메일</dt>
                      <dd>{booking.hotelEmail || 'info@example.com'}</dd>
                    </div>
                    <div>
                      <dt>운영 시간</dt>
                      <dd>{booking.supportHours || '연중무휴'}</dd>
                    </div>
                    <div>
                      <dt>긴급 지원</dt>
                      <dd>
                        고객센터 앱 채팅 또는 <a href="mailto:help@golobe.com">help@golobe.com</a>
                      </dd>
                    </div>
                  </dl>
                </article>
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
                  {booking.checkInTime} · {booking.checkOutTime}
                </span>
              </div>
              <div>
                <FiUsers />
                <span>최대 {parseInt(booking.guestCount, 10) || 2}명</span>
              </div>
            </div>
          </div>
        </div>

        <section className="payment-section">
          <article className="info-card">
            <div className="info-card-header">
              <h2>결제 상세</h2>
              <span>{booking.paymentStatus || booking.arrivalInfo}</span>
            </div>
            <dl>
              <div>
                <dt>객실 요금</dt>
                <dd>{formatCurrency(booking.roomCharge || booking.totalPrice)}</dd>
              </div>
              <div>
                <dt>서비스 & 수수료</dt>
                <dd>{formatCurrency(booking.serviceFee)}</dd>
              </div>
              <div>
                <dt>세금</dt>
                <dd>{formatCurrency(booking.taxes)}</dd>
              </div>
              <div className="total">
                <dt>총 결제 금액</dt>
                <dd>{formatCurrency(booking.totalPrice)}</dd>
              </div>
              <div>
                <dt>결제 수단</dt>
                <dd>{booking.paymentMethod || '현장 결제'}</dd>
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
                <li>결제 과정에서 이상 거래가 감지되면 추가 인증을 요청드릴 수 있습니다.</li>
                <li>체크인 시 사용한 카드와 신분증을 지참해 주세요.</li>
              </ul>
            </div>
            <div>
              <h3>취소 및 변경</h3>
              <ul>
                <li>호텔 정책에 따라 취소 수수료가 발생할 수 있습니다.</li>
                <li>객실 변경은 고객센터를 통해 요청 가능합니다.</li>
                <li>추가 문의는 help@golobe.com 으로 연락 주세요.</li>
              </ul>
            </div>
          </div>
          <div className="contact-card">
            <h3>문의하기</h3>
            <p>Golobe Group Q.S.C, Doha, State of Qatar</p>
            <p>
              이메일: <a href="mailto:help@golobe.com">help@golobe.com</a>
            </p>
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

