import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import TravelCards from '../components/TravelCards';
import Highlights from '../components/Highlights';
import Footer from '../components/Footer';
import './style/Landing.scss';

const Landing = () => {
  return (
    <div className="landing-page">
      <Header />
      <HeroSection />
      <Highlights />
      <TravelCards />
      <Footer />
    </div>
  );
};

export default Landing;

