import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MovieProvider } from './context/MovieContext';
import Layout from './components/Layout/Layout';
import { HeroSkeleton, GridSkeleton } from './components/Skeleton/Skeleton';

const Home = lazy(() => import('./pages/Home/Home'));
const Movies = lazy(() => import('./pages/Movies/Movies'));
const MovieDetails = lazy(() => import('./pages/MovieDetails/MovieDetails'));
const Category = lazy(() => import('./pages/Category/Category'));
const MyList = lazy(() => import('./pages/MyList/MyList'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService/TermsOfService'));
const DMCA = lazy(() => import('./pages/DMCA/DMCA'));
const ContactUs = lazy(() => import('./pages/ContactUs/ContactUs'));

export default function App() {
  return (
    <MovieProvider>
      <Router>
        <Layout>
          <Suspense fallback={<PageFallback />}>
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
          </Suspense>
        </Layout>
      </Router>
    </MovieProvider>
  );
}

function PageFallback() {
  return (
    <div className="page-section">
      <HeroSkeleton />
      <GridSkeleton count={12} />
    </div>
  );
}
