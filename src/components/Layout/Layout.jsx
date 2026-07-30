import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { useMovieContext } from '../../context/MovieContext';

export default function Layout({ children }) {
  const { isOnline } = useMovieContext();

  return (
    <div className="app-container">
      <Navbar />
      
      {!isOnline && (
        <div className="offline-warning-banner" role="alert">
          <span className="warning-icon">⚠️</span>
          <span>You are offline. Showing offline content.</span>
        </div>
      )}
      
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
