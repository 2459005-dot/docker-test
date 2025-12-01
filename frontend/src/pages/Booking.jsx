import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FiMapPin, FiCalendar, FiUsers, FiCreditCard, FiPlus } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

// ✅ API Import (경로 정확함)
import { getLodgingDetail, getRooms } from '../api/lodgingApi';
import { createBooking } from '../api/bookingApi';
import { getMe } from '../api/authApi';

import './style/Booking.scss';

const Booking = () => {
  const { id, roomId } = useParams(); // URL 파라미터 (숙소ID, 방ID)
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const roomsCount = parseInt(searchParams.get('rooms') || '1', 10);
  const guestsCount = parseInt(searchParams.get('guests') || '2', 10);
  
  // ✅ 백엔드 데이터 State
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 결제 관련 State
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedCard, setSelectedCard] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expDate: '',
    cvc: '',
    cardName: '',
    country: '대한민국',
    saveInfo: true,
  });
  
  const isEditing = !isSummaryVisible;

  // ✅ 1. 데이터 불러오기 (숙소, 방, 유저 정보 병렬 호출)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 3가지 정보를 동시에 가져옵니다.
        const [hotelRes, roomsRes, userRes] = await Promise.all([
          getLodgingDetail(id),
          getRooms(id),
          getMe() // 로그인한 유저 정보 (이름, 폰번호 자동입력용)
        ]);

        if (hotelRes.success) setHotel(hotelRes.data);
        
        if (roomsRes.success) {
          // roomId에 해당하는 방 찾기
          // (주의: DB ID는 _id 이므로 비교)
          const foundRoom = roomsRes.data.find(r => r._id === roomId);
          setRoom(foundRoom || roomsRes.data[0]); // 혹시 없으면 첫번째 방
        }

        // 유저 정보가 있으면 전화번호 미리 채워주기
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

  // 로컬 스토리지에서 결제수단 불러오기 (UI용)
  useEffect(() => {
    const stored = localStorage.getItem('paymentMethods');
    if (stored) {
      try {
        const methods = JSON.parse(stored);
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedCard(methods[0].id);
        }
      } catch (error) {
        console.error('Failed to load payment methods', error);
      }
    }
  }, []);

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

  // 카드 관련 핸들러들
  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpDateValue = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleNewCardChange = (field, value) => {
    setNewCard((prev) => {
      let nextValue = value;
      if (field === 'cardNumber') nextValue = formatCardNumber(value);
      else if (field === 'expDate') nextValue = formatExpDateValue(value);
      return { ...prev, [field]: nextValue };
    });
  };

  const handlePhoneChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    setPhoneNumber(digits);
  };

  const handleAddCardSubmit = (event) => {
    event.preventDefault();
    if (!newCard.cardNumber.trim() || !newCard.cardName.trim() || !newCard.expDate.trim() || !newCard.cvc.trim()) {
      alert('카드 정보를 모두 입력해주세요.');
      return;
    }

    const sanitizedNumber = newCard.cardNumber.replace(/\s+/g, '');
    const last4 = sanitizedNumber.slice(-4);
    const newId = `card-${Date.now()}`;

    const newMethod = {
      id: newId,
      label: `${newCard.cardName} ****${last4} ${newCard.expDate}`,
      brand: sanitizedNumber.startsWith('4') ? 'VISA' : 'Card',
      cardNumber: sanitizedNumber,
      expDate: newCard.expDate,
      cardName: newCard.cardName,
      country: newCard.country,
    };

    const updatedMethods = [...paymentMethods, newMethod];
    setPaymentMethods(updatedMethods);
    setSelectedCard(newId);
    localStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));
    setIsAddCardModalOpen(false);
    setNewCard({ cardNumber: '', expDate: '', cvc: '', cardName: '', country: '대한민국', saveInfo: true });
  };

  const handleDeleteCard = (cardId, e) => {
    e.stopPropagation();
    const updatedMethods = paymentMethods.filter((method) => method.id !== cardId);
    setPaymentMethods(updatedMethods);
    localStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));
    if (selectedCard === cardId) {
      setSelectedCard(updatedMethods.length > 0 ? updatedMethods[0].id : '');
    }
  };

  // ✅ 결제 확정 및 예약 생성 (백엔드 전송)
  const handleConfirmPayment = async () => {
    try {
      // 1. 백엔드로 보낼 데이터 구성
      const bookingData = {
        lodgingId: hotel._id,
        roomId: room._id,
        checkIn,
        checkOut,
        price: total,
        userName: user?.name || 'Guest', // 로그인 유저 이름 (없으면 Guest)
        userPhone: phoneNumber,
        paymentKey: selectedCard || 'temp_payment_key', // 실제 PG 연동 시엔 결제키 필요
        paymentAmount: total
      };

      console.log("🚀 예약 요청 데이터:", bookingData);

      // 2. API 호출
      const response = await createBooking(bookingData);

      if (response && (response.success || response.resultCode === 201)) {
        // 3. 예약 성공 후 완료 페이지로 이동
        // 완료 페이지에 보여줄 정보를 state로 넘겨줍니다.
        const payload = {
          bookingNumber: response.data._id, // DB 예약 ID 사용
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
        alert(response.message || "예약에 실패했습니다.");
      }

    } catch (error) {
      console.error("예약 생성 에러:", error);
      // 에러 메시지 추출
      const errorMsg = error.response?.data?.message || error.message || "예약 중 오류가 발생했습니다.";
      alert(errorMsg);
    }
  };

  // 로딩 및 에러 처리
  if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>로딩 중...</div>;
  if (!hotel || !room) {
    return (
      <div className="booking-page">
        <Header />
        <div className="not-found">
          <p>예약 정보를 불러올 수 없습니다.</p>
          <button onClick={() => navigate(-1)} className="btn primary">뒤로 가기</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="booking-page">
      <Header />
      
      <div className="booking-container">
        <div className="booking-main">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            <span>{hotel.country}</span>
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

          {/* Payment Method */}
          <div className="payment-method-section">
            <h2 className="section-title">결제 방법</h2>
            <div className="payment-methods">
              {paymentMethods.map((method) => (
                <label className="payment-method" key={method.id}>
                  <div className="method-main">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedCard === method.id}
                      onChange={(e) => setSelectedCard(e.target.value)}
                      disabled={!isEditing}
                    />
                    <div className="method-content">
                      <FiCreditCard />
                      <span>{method.label}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="method-delete"
                    onClick={(e) => handleDeleteCard(method.id, e)}
                    disabled={!isEditing}
                  >
                    삭제
                  </button>
                </label>
              ))}
              <div
                className={`add-card-option ${!isEditing ? 'disabled' : ''}`}
                onClick={() => isEditing && setIsAddCardModalOpen(true)}
              >
                <FiPlus />
                <span>새 카드 추가</span>
              </div>
            </div>
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

        {/* Booking Summary */}
        <div className={`booking-summary ${isSummaryVisible ? 'active' : 'inactive'}`}>
          <div className="summary-image">
            {/* 이미지가 없으면 빈 문자열 또는 기본 이미지 */}
            <img 
              src={(hotel.images && hotel.images.length > 0) ? hotel.images[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} 
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

      {/* Payment Confirmation Modal */}
      {isPaymentModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPaymentModalOpen(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>결제를 진행하시겠습니까?</h2>
            <p>결제 완료 후 예약이 확정됩니다.</p>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setIsPaymentModalOpen(false)}>
                취소
              </button>
              <button
                className="btn primary"
                onClick={handleConfirmPayment}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Modal (UI 유지) */}
      {isAddCardModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCardModalOpen(false)}>
          <div className="add-card-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsAddCardModalOpen(false)}>×</button>
            <h2 className="add-card-title">카드 추가</h2>
            <form className="add-card-form" onSubmit={handleAddCardSubmit}>
               <label className="modal-field">카드 번호<input type="text" value={newCard.cardNumber} onChange={(e) => handleNewCardChange('cardNumber', e.target.value)} required /></label>
               <div className="modal-field inline">
                 <label>만료일<input type="text" value={newCard.expDate} onChange={(e) => handleNewCardChange('expDate', e.target.value)} required /></label>
                 <label>CVC<input type="text" value={newCard.cvc} onChange={(e) => handleNewCardChange('cvc', e.target.value)} required /></label>
               </div>
               <label className="modal-field">카드 명의자<input type="text" value={newCard.cardName} onChange={(e) => handleNewCardChange('cardName', e.target.value)} required /></label>
               <div className="modal-actions">
                 <button type="button" className="btn secondary" onClick={() => setIsAddCardModalOpen(false)}>취소</button>
                 <button type="submit" className="btn primary">카드 추가</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;