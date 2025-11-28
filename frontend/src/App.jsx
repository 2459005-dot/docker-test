import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.scss';
import Landing from './pages/Landing';
import SearchResults from './pages/SearchResults';
import Favorites from './pages/Favorites';
import HotelDetail from './pages/HotelDetail';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Account from './pages/Account';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/hotel/:id" element={<HotelDetail />} />
        <Route path="/hotel/:id/booking/:roomId" element={<Booking />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </div>
  );
}

export default App;
