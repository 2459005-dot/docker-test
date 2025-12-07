import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
// 디자인(new.txt)에 사용된 아이콘들 추가
import { FiMapPin, FiCalendar, FiUsers, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

// ✅ PortOne V2 SDK (mine.txt의 핵심 기능)
import * as PortOne from "@portone/browser-sdk/v2";

// 백엔드 API (mine.txt 기능 유지)
import { getLodgingDetail, getRooms } from '../api/lodgingApi';
import { createBooking } from '../api/bookingApi';
import { getMe } from '../api/authApi';

import './style/Booking.scss';

const Booking = () => {
  const { id, roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL 파라미터 파싱
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const roomsCount = parseInt(searchParams.get('rooms') || '1', 10);
  const guestsCount = parseInt(searchParams.get('guests') || '2', 10);

  // 백엔드 데이터 State (mine.txt 기능 유지)
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 입력값 State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // UI State (new.txt의 디자인 로직을 위해 isSummaryVisible 활용)
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // 수정 모드 여부 (요약 화면이 아닐 때 수정 가능)
  const isEditing = !isSummaryVisible;

  // 데이터 불러오기 (mine.txt 로직 100% 유지)
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
  const taxes = 0; // 필요시 로직 추가
  const serviceFee = 0;
  const total = baseFare - discountAmount + taxes + serviceFee;

  // 쿠폰 로직 (mine.txt 기능 유지)
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

  // 날짜 포맷 함수
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
  // 🚀 포트원 결제 및 예약 요청 (mine.txt의 핵심 기능 유지)
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
        // 완료 페이지로 이동
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

  if (loading) return <div className="loading-container">데이터를 불러오는 중입니다...</div>;
  if (!hotel || !room) return <div className="error-container">호텔 정보를 찾을 수 없습니다.</div>;
  return (
    <div className="booking-page">
      <Header />

      <div className="booking-container">
        <div className="booking-main">
          {/* Breadcrumbs: 디자인 new.txt 적용 */}
          <div className="breadcrumbs">
            <span>{hotel.country || '대한민국'}</span>
            <span className="separator">&gt;</span>
            <span>{hotel.city || hotel.address.split(' ')[0]}</span>
            <span className="separator">&gt;</span>
            <span>{hotel.lodgingName}</span>
          </div>

          {/* Room Title */}
          <div className="room-title-section">
            <h1 className="room-title">{room.roomName}</h1>
            <span className="room-price-header">₩{baseFare.toLocaleString()}/night</span>
          </div>

          {/* Hotel Info Card */}
          <div className="hotel-info-card">
            <h2 className="card-title">{hotel.lodgingName}</h2>
            <p className="hotel-address">
              <FiMapPin /> {hotel.address}
            </p>
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
            <div className="date-building-icon">
              <div className="building-icon">🏢</div>
            </div>
            <div className="date-item">
              <FiCalendar />
              <div className="date-info">
                <span className="date-label">체크아웃</span>
                <span className="date-value">{checkOut ? formatDate(checkOut) : '날짜 선택'}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Section (new.txt 디자인 + mine.txt 로직 안내) */}
          <div className="payment-method-section">
            <h2 className="section-title">결제 방법</h2>
            <div className="payment-methods-static">
              <div className="payment-method-card selected">
                <FiCreditCard className="method-icon" />
                <div className="method-info">
                  <span className="method-name">포트원 안전 결제</span>
                  <span className="method-desc">카카오페이 / 신용카드 / 간편결제 지원</span>
                </div>
                <FiCheckCircle className="check-icon" />
              </div>
            </div>
            <p className="payment-helper-text">
              * 예약 완료 시 결제창이 호출되며, 안전하게 결제가 진행됩니다.
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
              <button
                className="btn primary coupon-button"
                onClick={handleApplyCoupon}
                disabled={!isEditing}
              >
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

          {/* Next/Prev Buttons (화면 전환 로직) */}
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

        {/* Booking Summary Panel (new.txt 디자인 구조) */}
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
              {/* 결제 버튼: mine.txt의 기능(Modal Open) 연결 */}
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

      {/* Payment Confirmation Modal (mine.txt 기능 + new.txt 스타일) */}
      {isPaymentModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPaymentModalOpen(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>결제를 진행하시겠습니까?</h2>
            <p className="modal-total-price">총 결제 금액: <strong>₩{total.toLocaleString()}</strong></p>
            <p className="modal-desc">확인 버튼을 누르면 카카오페이/카드 결제창이 호출됩니다.</p>

            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setIsPaymentModalOpen(false)}>
                취소
              </button>
              {/* 실제 결제 함수(handlePortOnePayment) 연결 */}
              <button className="btn primary" onClick={handlePortOnePayment}>
                확인 및 결제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;