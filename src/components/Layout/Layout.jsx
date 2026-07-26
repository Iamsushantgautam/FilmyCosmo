import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

export default function Layout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
