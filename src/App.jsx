import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MovieProvider } from './context/MovieContext';
import Layout from './components/Layout/Layout';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

import Home from './pages/Home/Home';
import Movies from './pages/Movies/Movies';
import MovieDetails from './pages/MovieDetails/MovieDetails';
import Category from './pages/Category/Category';
import MyList from './pages/MyList/MyList';
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService/TermsOfService';
import DMCA from './pages/DMCA/DMCA';
import ContactUs from './pages/ContactUs/ContactUs';

export default function App() {
  return (
    <MovieProvider>
      <Router>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/category" element={<Category />} />
            <Route path="/category/:name" element={<Category />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/my-list" element={<MyList />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/dmca" element={<DMCA />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </MovieProvider>
  );
}
