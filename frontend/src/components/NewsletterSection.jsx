import React from 'react';
import { FiInbox, FiMail } from 'react-icons/fi';
import './style/NewsletterSection.scss';

const NewsletterSection = () => {
  return (
    <section className="newsletter-section">
      <div className="newsletter-content">
        <span className="section-badge">구독서비스 신청해보세요</span>
        <h3 className="newsletter-title">The Travel</h3>
        <p>구독하고 쿠폰, 최신 이벤트를 받아보세요</p>
      </div>
      <form className="newsletter-form">
        <input type="email" placeholder="이메일 주소를 입력하세요" />
        <button type="button" className="btn primary">구독하기</button>
      </form>
      <div className="newsletter-illustration">
        <div className="mailbox-wrapper">
          <FiMail className="flying-mail mail-1" />
          <FiMail className="flying-mail mail-2" />
          <FiInbox className="mailbox-icon" />
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;

