import React from 'react';
import { FiInbox, FiMail } from 'react-icons/fi';
import './style/NewsletterSection.scss';

const NewsletterSection = () => {
  // ✅ 최신 코드의 폼 제출 핸들러 적용
  const handleSubmit = (e) => {
    e.preventDefault();
    // 추후 백엔드 구독 API 연동 시 이곳에 로직 추가
    alert("구독 신청이 완료되었습니다!");
  };

  return (
    <section className="newsletter-section">
      {/* ✅ 최신 코드의 레이아웃 구조 (Container 추가됨) */}
      <div className="newsletter-container">
        <div className="newsletter-content">
          <h3 className="newsletter-title">구독서비스 신청해보세요</h3>
          {/* 텍스트 수정: The Travel -> HotelBnB */}
          <p className="newsletter-subtitle">HotelBnB 구독하고 쿠폰, 최신 이벤트를 받아보세요</p>
        </div>
        
        {/* ✅ 최신 코드의 폼 구조 (onSubmit 적용) */}
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your email address"
            required
          />
          <button type="submit" className="subscribe-button">Subscribe</button>
        </form>

        <div className="newsletter-illustration">
          <div className="mailbox-wrapper">
            <FiMail className="flying-mail mail-1" />
            <FiMail className="flying-mail mail-2" />
            <FiInbox className="mailbox-icon" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;