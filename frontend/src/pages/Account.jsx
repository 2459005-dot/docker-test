import React, { useState, useEffect } from 'react';
import { FiUpload, FiEdit2, FiX, FiUser, FiCreditCard, FiPlus, FiTrash2 } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getMe, updateUserInfo } from '../api/authApi'; // ✅ API 함수 불러오기
import './style/Account.scss';

const defaultCoverImages = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=1200&q=80',
];

const defaultProfileOptions = [
  { color: '#2f6a57', icon: FiUser },
  { color: '#5b7a6b', icon: FiUser },
  { color: '#d4e8df', icon: FiUser },
  { color: '#ffe5d9', icon: FiUser },
  { color: '#ffd6e8', icon: FiUser },
  { color: '#d6e5fa', icon: FiUser },
  { color: '#fff4d6', icon: FiUser },
  { color: '#e8d5ff', icon: FiUser },
  { color: '#d5f4e6', icon: FiUser },
  { color: '#ffe0cc', icon: FiUser },
  { color: '#f0e6ff', icon: FiUser },
  { color: '#e0f2f1', icon: FiUser },
];

const Account = () => {
  const [activeTab, setActiveTab] = useState('account');

  // ✅ 사용자 정보 State (초기값은 비워둡니다)
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    password: '********', // 비밀번호는 보안상 마스킹 처리
    phone: '',
    address: '',
    birthDate: '',
  });

  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  // ✅ 1. 페이지 접속 시 DB에서 내 정보 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getMe(); // API 호출
        if (response.success) {
          const user = response.data;

          setUserInfo({
            name: user.name || '',
            email: user.email || '',
            password: '********', // 실제 비번은 안 보여줌
            phone: user.phoneNumber || '', // 백엔드(phoneNumber) -> 프론트(phone)
            address: user.address || '',
            // 날짜 포맷 변환 (YYYY-MM-DDThh:mm... -> YYYY-MM-DD)
            birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
          });

          // 헤더 등 다른 곳 업데이트를 위해 로컬스토리지 동기화
          localStorage.setItem('userName', user.name);
          window.dispatchEvent(new Event('userInfoChanged'));
        }
      } catch (error) {
        console.error('Failed to load user info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');

  // UI용 상태들
  const [coverImage, setCoverImage] = useState(defaultCoverImages[0]);
  const [profileOption, setProfileOption] = useState(defaultProfileOptions[0]);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // 결제 수단 (이건 일단 로컬 스토리지 유지 - 백엔드 연결 안 함)
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expDate: '',
    cvc: '',
    cardName: '',
    country: '대한민국',
    saveInfo: true,
  });

  // ✅ 2. 수정 버튼 클릭 시
  const handleEditClick = (field) => {
    setEditingField(field);
    // 비밀번호 수정일 경우 빈 값으로 시작
    if (field === 'password') {
      setTempValue('');
    } else {
      setTempValue(userInfo[field]);
    }
  };

  // ✅ 3. 저장 버튼 클릭 시 (백엔드로 전송)
  const handleSave = async (field) => {
    try {
      // API에 보낼 데이터 준비
      const payload = { [field]: tempValue };

      // 실제 API 호출
      const response = await updateUserInfo(payload);

      if (response.success) {
        // 성공 시 UI 업데이트
        setUserInfo(prev => ({
          ...prev,
          [field]: field === 'password' ? '********' : tempValue
        }));

        // 이름 변경 시 헤더 업데이트 이벤트 발생
        if (field === 'name') {
          localStorage.setItem('userName', tempValue);
          window.dispatchEvent(new Event('userInfoChanged'));
          window.dispatchEvent(new Event('storage'));
        }

        setEditingField(null);
        setTempValue('');
        alert('정보가 수정되었습니다.');
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('정보 수정에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  // --- 결제 수단 로직 (로컬 스토리지 유지) ---
  useEffect(() => {
    const stored = localStorage.getItem('paymentMethods');
    if (stored) {
      try {
        setPaymentMethods(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load payment methods', error);
      }
    }
  }, []);

  useEffect(() => {
    if (paymentMethods.length > 0) {
      localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
    }
  }, [paymentMethods]);

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpDateValue = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) {
      return digits;
    }
    const month = digits.slice(0, 2);
    const year = digits.slice(2);
    return `${month}/${year}`;
  };

  const handleNewCardChange = (field, value) => {
    setNewCard((prev) => {
      let nextValue = value;
      if (field === 'cardNumber') {
        nextValue = formatCardNumber(value);
      } else if (field === 'expDate') {
        nextValue = formatExpDateValue(value);
      }
      return {
        ...prev,
        [field]: nextValue,
      };
    });
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

    setPaymentMethods((prev) => [...prev, newMethod]);
    setIsAddCardModalOpen(false);
    setNewCard({
      cardNumber: '',
      expDate: '',
      cvc: '',
      cardName: '',
      country: '대한민국',
      saveInfo: true,
    });
  };

  const handleDeleteCard = (cardId) => {
    if (window.confirm('이 카드를 삭제하시겠습니까?')) {
      setPaymentMethods((prev) => prev.filter((method) => method.id !== cardId));
    }
  };

  // 로딩 중 화면
  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>로딩 중...</div>;

  return (
    <div className="account-page">
      <Header />
      <div className="account-container">
        {/* Profile Banner */}
        <div className="profile-banner">
          <div
            className="banner-gradient"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${coverImage})`,
            }}
          >
          </div>
          <div className="profile-picture-wrapper">
            <div className="profile-picture" style={{ background: profileOption.color }}>
              {React.createElement(profileOption.icon, { className: 'profile-icon' })}
              <button className="edit-picture-btn" onClick={() => setShowProfileModal(true)}>
                <FiEdit2 />
              </button>
            </div>
            <div className="profile-info">
              <h1>{userInfo.name}</h1>
              <p>{userInfo.email}</p>
            </div>
          </div>
        </div>

        {/* Cover Image Selection Modal */}
        {showCoverModal && (
          <div className="modal-overlay" onClick={() => setShowCoverModal(false)}>
            <div className="image-select-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>배경 이미지 선택</h3>
                <button className="close-btn" onClick={() => setShowCoverModal(false)}>
                  <FiX />
                </button>
              </div>
              <div className="image-grid">
                {defaultCoverImages.map((image, index) => (
                  <div
                    key={index}
                    className={`image-option ${coverImage === image ? 'selected' : ''}`}
                    onClick={() => {
                      setCoverImage(image);
                      setShowCoverModal(false);
                    }}
                  >
                    <img src={image} alt={`Cover ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Profile Image Selection Modal */}
        {showProfileModal && (
          <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
            <div className="image-select-modal profile-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>프로필 이미지 선택</h3>
                <button className="close-btn" onClick={() => setShowProfileModal(false)}>
                  <FiX />
                </button>
              </div>
              <div className="image-grid profile-grid">
                {defaultProfileOptions.map((option, index) => {
                  const IconComponent = option.icon;
                  return (
                    <div
                      key={index}
                      className={`image-option ${profileOption.color === option.color ? 'selected' : ''}`}
                      onClick={() => {
                        setProfileOption(option);
                        setShowProfileModal(false);
                      }}
                      style={{ background: option.color }}
                    >
                      <IconComponent className="profile-icon" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="account-tabs">
          <button
            className={`tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            계정
          </button>
          <button
            className={`tab ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            결제수단
          </button>
        </div>

        {/* Account Details Section */}
        {activeTab === 'account' && (
          <div className="account-content">
            <section className="account-details">
              <h2>계정</h2>
              <div className="info-item">
                <div className="info-label">이름</div>
                {editingField === 'name' ? (
                  <input
                    type="text"
                    className="info-input"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                  />
                ) : (
                  <div className="info-value">{userInfo.name}</div>
                )}
                {editingField === 'name' ? (
                  <div className="button-group">
                    <button className="save-btn" onClick={() => handleSave('name')}>
                      저장
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                      취소
                    </button>
                  </div>
                ) : (
                  <button className="change-btn" onClick={() => handleEditClick('name')}>
                    수정
                  </button>
                )}
              </div>

              {/* 이메일은 보통 수정 불가로 둡니다 (로그인 ID이므로) */}
              <div className="info-item">
                <div className="info-label">이메일</div>
                <div className="info-value">{userInfo.email}</div>
                {/* 이메일 수정 버튼 제거 or 필요시 추가 */}
              </div>

              <div className="info-item">
                <div className="info-label">비밀번호</div>
                {editingField === 'password' ? (
                  <input
                    type="password"
                    className="info-input"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    placeholder="새 비밀번호 입력"
                  />
                ) : (
                  <div className="info-value">{userInfo.password}</div>
                )}
                {editingField === 'password' ? (
                  <div className="button-group">
                    <button className="save-btn" onClick={() => handleSave('password')}>
                      저장
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                      취소
                    </button>
                  </div>
                ) : (
                  <button className="change-btn" onClick={() => handleEditClick('password')}>
                    수정
                  </button>
                )}
              </div>

              <div className="info-item">
                <div className="info-label">전화번호</div>
                {editingField === 'phone' ? (
                  <input
                    type="tel"
                    className="info-input"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                  />
                ) : (
                  <div className="info-value">{userInfo.phone || '미등록'}</div>
                )}
                {editingField === 'phone' ? (
                  <div className="button-group">
                    <button className="save-btn" onClick={() => handleSave('phone')}>
                      저장
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                      취소
                    </button>
                  </div>
                ) : (
                  <button className="change-btn" onClick={() => handleEditClick('phone')}>
                    수정
                  </button>
                )}
              </div>

              <div className="info-item">
                <div className="info-label">주소</div>
                {editingField === 'address' ? (
                  <input
                    type="text"
                    className="info-input"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                  />
                ) : (
                  <div className="info-value">{userInfo.address || '미등록'}</div>
                )}
                {editingField === 'address' ? (
                  <div className="button-group">
                    <button className="save-btn" onClick={() => handleSave('address')}>
                      저장
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                      취소
                    </button>
                  </div>
                ) : (
                  <button className="change-btn" onClick={() => handleEditClick('address')}>
                    수정
                  </button>
                )}
              </div>

              <div className="info-item">
                <div className="info-label">생년월일</div>
                {editingField === 'birthDate' ? (
                  <input
                    type="date"
                    className="info-input"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                  />
                ) : (
                  <div className="info-value">{userInfo.birthDate || '미등록'}</div>
                )}
                {editingField === 'birthDate' ? (
                  <div className="button-group">
                    <button className="save-btn" onClick={() => handleSave('birthDate')}>
                      저장
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                      취소
                    </button>
                  </div>
                ) : (
                  <button className="change-btn" onClick={() => handleEditClick('birthDate')}>
                    수정
                  </button>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Payment Tab Content */}
        {activeTab === 'payment' && (
          <div className="account-content">
            <section className="account-details">
              <h2>결제수단</h2>
              <div className="payment-methods-list">
                {paymentMethods.length === 0 ? (
                  <p className="no-cards-message">등록된 카드가 없습니다.</p>
                ) : (
                  paymentMethods.map((method) => (
                    <div key={method.id} className="payment-method-item">
                      <div className="method-info">
                        <FiCreditCard className="method-icon" />
                        <div className="method-details">
                          <span className="method-label">{method.label}</span>
                          <span className="method-brand">{method.brand}</span>
                        </div>
                      </div>
                      <button
                        className="delete-card-btn"
                        onClick={() => handleDeleteCard(method.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))
                )}
                <button
                  className="add-card-btn"
                  onClick={() => setIsAddCardModalOpen(true)}
                >
                  <FiPlus />
                  <span>카드 추가</span>
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Add Card Modal */}
      {isAddCardModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCardModalOpen(false)}>
          <div className="image-select-modal add-card-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>카드 추가</h3>
              <button className="close-btn" onClick={() => setIsAddCardModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <form className="add-card-form" onSubmit={handleAddCardSubmit}>
              {/* 카드 입력 폼 내용 (기존 유지) */}
              <label className="modal-field">
                카드 번호
                <input
                  type="text"
                  value={newCard.cardNumber}
                  onChange={(e) => handleNewCardChange('cardNumber', e.target.value)}
                  placeholder="4321 4321 4321 4321"
                  required
                />
              </label>
              <div className="modal-field inline">
                <label>
                  만료일 (MM/YY)
                  <input
                    type="text"
                    value={newCard.expDate}
                    onChange={(e) => handleNewCardChange('expDate', e.target.value)}
                    placeholder="02/27"
                    required
                  />
                </label>
                <label>
                  CVC
                  <input
                    type="text"
                    value={newCard.cvc}
                    onChange={(e) => handleNewCardChange('cvc', e.target.value)}
                    placeholder="123"
                    maxLength={3}
                    required
                  />
                </label>
              </div>
              <label className="modal-field">
                카드 명의자
                <input
                  type="text"
                  value={newCard.cardName}
                  onChange={(e) => handleNewCardChange('cardName', e.target.value)}
                  placeholder="홍길동"
                  required
                />
              </label>
              <label className="modal-field">
                국가 또는 지역
                <select
                  value={newCard.country}
                  onChange={(e) => handleNewCardChange('country', e.target.value)}
                >
                  <option value="대한민국">대한민국</option>
                  <option value="미국">미국</option>
                  <option value="일본">일본</option>
                  <option value="영국">영국</option>
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" className="btn secondary" onClick={() => setIsAddCardModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="btn primary">
                  카드 추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Account;