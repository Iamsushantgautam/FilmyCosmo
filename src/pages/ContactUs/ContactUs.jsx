import React, { useState } from 'react';
import styles from '../Legal/Legal.module.css';

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 3000);
    }
  };

  return (
    <div className={styles.legalContainer}>
      <div className={styles.legalCard}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.lastUpdated}>We welcome your inquiries, feedback, and DMCA takedown notices.</p>

        <div className={styles.disclaimerBanner}>
          <p>
            <strong>Note:</strong> FilmyCosmo does not store or host any movie files on its servers. We share links hosted on external third-party sites. For fast inquiries or copyright requests, write to us directly at{' '}
            <a href="mailto:filmycosmo@zohomail.in" className={styles.emailLink}>
              filmycosmo@zohomail.in
            </a>.
          </p>
        </div>

        {submitted ? (
          <div className={styles.successMsg}>
            ✓ Thank you! Your message has been received. Our team will get back to you at {formData.email || 'your email'} within 24-48 hours.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.contactGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Your Name</label>
              <input
                type="text"
                required
                className={styles.input}
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Your Email</label>
              <input
                type="email"
                required
                className={styles.input}
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Subject</label>
              <input
                type="text"
                required
                className={styles.input}
                placeholder="Inquiry / DMCA Notice / Feedback"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Message</label>
              <textarea
                required
                className={styles.textarea}
                placeholder="Write your message or detailed link information here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <div className={styles.fullWidth}>
              <button type="submit" className={styles.submitBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Send Message
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
