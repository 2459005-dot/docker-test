import React from 'react';
import './style/Footer.scss';

const footerColumns = [
  {
    title: 'Country',
    items: ['캐나다', '알래스카', '프랑스', '아이슬란드'],
  },
  {
    title: 'Activities',
    items: ['오로라', '크루즈 & 요트', '다양한 액티비티', '카약'],
  },
  {
    title: 'Travel Blogs',
    items: ['발리 여행 가이드', '스리랑카 여행 가이드', '페루 여행 가이드'],
  },
  {
    title: 'About Us',
    items: ['우리 이야기', '함께 일하기'],
  },
  {
    title: 'Contact Us',
    items: ['고객센터', '제휴 문의'],
  },
];

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="social-links">
          <span>🍎</span>
          <span>f</span>
          <span>t</span>
          <span>in</span>
          <span>YT</span>
        </div>
      </div>
      <div className="footer-columns">
        {footerColumns.map((column) => (
          <div key={column.title} className="footer-column">
            <h4>{column.title}</h4>
            <ul>
              {column.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} The Travel. 모든 권리 보유.
      </div>
    </footer>
  );
};

export default Footer;

