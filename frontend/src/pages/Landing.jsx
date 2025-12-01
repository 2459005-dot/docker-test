import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import TravelCards from '../components/TravelCards';
import Highlights from '../components/Highlights';
import Footer from '../components/Footer';
import { getLodgings } from '../api/lodgingApi'; // ✅ API import
import './style/Landing.scss';

const Landing = () => {
  // 숙소 데이터를 저장할 State
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // 백엔드에 숙소 목록 요청
        const response = await getLodgings(); 
        
        if (response.success) {
          // 데이터가 있으면 State에 저장
          setRecommendations(response.data); 
        }
      } catch (error) {
        console.error("추천 숙소 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="landing-page">
      <Header />
      <HeroSection />
      
      {/* ✅ Highlights 컴포넌트에 DB 데이터와 로딩 상태 전달 */}
      <Highlights data={recommendations} loading={loading} />
      
      <TravelCards />
      <Footer />
    </div>
  );
};

export default Landing;