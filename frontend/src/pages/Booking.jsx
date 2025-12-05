import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

// ✅ PortOne V2 SDK
import * as PortOne from "@portone/browser-sdk/v2";

import { getLodgingDetail, getRooms } from '../api/lodgingApi';
import { createBooking } from '../api/bookingApi';
import { getMe } from '../api/authApi';

import './style/Booking.scss';

const Booking = () => {
  const { id, roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const roomsCount = parseInt(searchParams.get('rooms') || '1', 10);
  const guestsCount = parseInt(searchParams.get('guests') || '2', 10);

  // 백엔드 데이터 State
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 입력값 State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // UI State
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const isEditing = !isSummaryVisible;

  // 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hotelRes, roomsRes, userRes] = await Promise.all([
          getLodgingDetail(id),
          getRooms(id),
          getMe()
        ]);

        if (hotelRes.success) setHotel(hotelRes.data);
        if (roomsRes.success) {
          const foundRoom = roomsRes.data.find(r => r._id === roomId);
          setRoom(foundRoom || roomsRes.data[0]);
        }
        if (userRes && userRes.success) {
          setUser(userRes.data);
          if (userRes.data.phoneNumber) {
            setPhoneNumber(userRes.data.phoneNumber);
          }
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, roomId]);

  // 가격 계산
  const baseFare = room?.price || 0;
  const taxes = 0;
  const serviceFee = 0;
  const total = baseFare - discountAmount + taxes + serviceFee;

  // 쿠폰 로직
  const handleApplyCoupon = () => {
    const trimmedCode = couponCode.trim();
    if (!trimmedCode) {
      setCouponMessage('쿠폰 코드를 입력해주세요.');
      setDiscountAmount(0);
      return;
    }
    const upperCode = trimmedCode.toUpperCase();
    if (upperCode === 'WELCOME10') {
      const newDiscount = Math.floor(baseFare * 0.1);
      setDiscountAmount(newDiscount);
      setCouponMessage('10% 할인 쿠폰이 적용되었습니다.');
    } else {
      setDiscountAmount(0);
      setCouponMessage('사용할 수 없는 쿠폰입니다.');
    }
  };

  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return '날짜 선택';
    const date = new Date(dateString);
    return format(date, 'MM.dd (EEE)', { locale: ko });
  };

  const formatTicketDate = (dateString) => {
    if (!dateString) return '날짜 미정';
    const date = new Date(dateString);
    return format(date, "MMM d (EEE)", { locale: ko });
  };

  const handlePhoneChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    setPhoneNumber(digits);
  };

  // ============================================================
  // 🚀 포트원 결제 및 예약 요청
  // ============================================================
  const handlePortOnePayment = async () => {
    const storeId = import.meta.env.VITE_PORTONE_STORE_ID;
    const channelKey = import.meta.env.VITE_PORTONE_CHANNEL_KEY;

    if (!storeId || !channelKey) {
      alert("결제 설정 오류: Store ID 또는 Channel Key가 확인되지 않습니다.");
      return;
    }

    try {
      const paymentId = `payment-${crypto.randomUUID()}`;

      const response = await PortOne.requestPayment({
        storeId: storeId,
        channelKey: channelKey,
        paymentId: paymentId,
        orderName: `${hotel.lodgingName} - ${room.roomName}`,
        totalAmount: total,
        currency: "CURRENCY_KRW",
        
        // ✅ 카카오페이 등 간편결제용 설정
        payMethod: "EASY_PAY", 
        easyPay: {
            provider: "KAKAO_PAY",
        },

        customer: {
          fullName: user?.name || "Guest",
          phoneNumber: phoneNumber,
          email: user?.email || "",
        },
      });

      if (response.code != null) {
        return alert(`결제 실패: ${response.message}`);
      }

      // 백엔드 전송 데이터 준비
      const bookingData = {
        lodgingId: hotel._id,
        roomId: room._id,
        checkIn,
        checkOut,
        price: total,
        userName: user?.name || 'Guest',
        userPhone: phoneNumber,
        paymentId: response.paymentId
      };

      // 백엔드 검증 요청
      const serverRes = await createBooking(bookingData);

      if (serverRes && (serverRes.success || serverRes.resultCode === 201)) {
        // 성공 시 완료 페이지 이동 payload
        const payload = {
          bookingNumber: serverRes.data._id,
          hotelName: hotel.lodgingName,
          roomName: room.roomName,
          checkInDateLabel: formatTicketDate(checkIn),
          checkOutDateLabel: formatTicketDate(checkOut),
          totalPrice: total,
          guestName: user?.name || 'Guest',
          image: (hotel.images && hotel.images.length > 0) ? hotel.images[0] : '',
          address: hotel.address
        };

        setIsPaymentModalOpen(false);
        navigate('/booking-confirmation', { state: payload });
      } else {
        alert(serverRes.message || "예약 처리에 실패했습니다. 관리자에게 문의하세요.");
      }

    } catch (error) {
      alert(`결제 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>로딩 중...</div>;
  if (!hotel || !room) {
    return (
      <div className="booking-page">
        <Header />
        <div className="not-found"><p>정보를 찾을 수 없습니다.</p></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="booking-page">
      <Header />
      <div className="booking-container">
        <div className="booking-main">
          {/* Breadcrumbs & Title & Hotel Info */}
          <div className="breadcrumbs">
            <span>{hotel.country}</span> <span className="separator">&gt;</span> <span>{hotel.lodgingName}</span>
          </div>
          <div className="room-title-section">
            <h1 className="room-title">{room.roomName}</h1>
            <span className="room-price-header">₩{baseFare.toLocaleString()}/night</span>
          </div>
          <div className="hotel-info-card">
            <h2 className="card-title">{hotel.lodgingName}</h2>
            <p className="hotel-address"><FiMapPin /> {hotel.address}</p>
          </div>

          {/* Date Selection */}
          <div className="date-selection-card">
            <div className="date-item">
              <FiCalendar />
              <div className="date-info">
                <span className="date-label">체크인</span>
                <span className="date-value">{checkIn ? formatDate(checkIn) : '날짜 선택'}</span>
              </div>
            </div>
            <div className="date-building-icon"><div className="building-icon">🏢</div></div>
            <div className="date-item">
              <FiCalendar />
              <div className="date-info">
                <span className="date-label">체크아웃</span>
                <span className="date-value">{checkOut ? formatDate(checkOut) : '날짜 선택'}</span>
              </div>
            </div>
          </div>

          <div className="payment-method-section">
            <h2 className="section-title">결제 정보</h2>
            <p style={{ color: '#666', fontSize: '14px' }}>
              안전한 결제를 위해 포트원(카카오페이 등) 결제 모듈을 사용합니다.<br />
              '결제하기' 버튼을 누르면 결제창이 호출됩니다.
            </p>
          </div>

          {/* Coupon Section */}
          <div className="coupon-section">
            <h2 className="section-title">쿠폰 적용</h2>
            <div className="coupon-form">
              <input
                type="text"
                className="coupon-input"
                placeholder="WELCOME10 입력 시 10% 할인"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!isEditing}
              />
              <button className="btn primary coupon-button" onClick={handleApplyCoupon} disabled={!isEditing}>
                적용
              </button>
            </div>
            {couponMessage && (
              <p className={`coupon-message ${discountAmount > 0 ? 'success' : 'error'}`}>
                {couponMessage}
              </p>
            )}
          </div>

          {/* Contact Info */}
          <div className="contact-info-section">
            <h2 className="section-title">예약자 연락처</h2>
            <label className="contact-input-label">
              핸드폰 번호
              <input
                className="contact-input"
                type="tel"
                placeholder="'-' 없이 입력해주세요"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                maxLength={11}
                disabled={!isEditing}
              />
            </label>
            <p className="contact-info-helper">입력하신 번호로 예약 확인 문자가 전송됩니다.</p>
          </div>

          {/* Navigation Buttons */}
          <div className="next-button-container">
            {isEditing ? (
              <button
                className="btn primary next-button"
                onClick={() => setIsSummaryVisible(true)}
                disabled={phoneNumber.length < 10}
              >
                다음 단계
              </button>
            ) : (
              <>
                <p className="next-button-helper">예약정보 요약을 확인한 후 결제를 진행하세요.</p>
                <button className="btn secondary prev-button" onClick={() => setIsSummaryVisible(false)}>
                  이전 단계
                </button>
              </>
            )}
          </div>
        </div>

        {/* Booking Summary Panel */}
        <div className={`booking-summary ${isSummaryVisible ? 'active' : 'inactive'}`}>
          <div className="summary-image">
            <img
              src={(hotel.images && hotel.images.length > 0) ? hotel.images[0] : 'https://via.placeholder.com/400x300'}
              alt={hotel.lodgingName}
            />
          </div>
          <div className="summary-content">
            <h2 className="summary-title">예약정보 요약</h2>
            <h3 className="summary-hotel-name">{hotel.lodgingName}</h3>
            <p className="summary-room-name">{room.roomName}</p>

            <div className="summary-guest-info">
              <FiUsers />
              <span>객실 {roomsCount}개 · 투숙객 {guestsCount}명</span>
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>기본 요금</span>
                <span>₩{baseFare.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span>할인</span>
                <span>-₩{discountAmount.toLocaleString()}</span>
              </div>
              <div className="price-row total">
                <span>총 금액</span>
                <span>₩{total.toLocaleString()}</span>
              </div>
            </div>
            <div className="summary-actions">
              <button
                className="btn primary pay-button"
                disabled={isEditing}
                onClick={() => setIsPaymentModalOpen(true)}
              >
                결제하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Confirmation Modal */}
      {isPaymentModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPaymentModalOpen(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>결제를 진행하시겠습니까?</h2>
            <p>총 결제 금액: <strong>₩{total.toLocaleString()}</strong></p>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setIsPaymentModalOpen(false)}>
                취소
              </button>
              <button className="btn primary" onClick={handlePortOnePayment}>
                결제 진행
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;