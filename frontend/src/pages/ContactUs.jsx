import React, { useState } from 'react';
import styles from './ContactUs.module.css'; // Create this CSS module
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';

function ContactUs() {
  return (
    <div className={styles.contactContainer}>
      <h1 className={styles.title}>Contact Us</h1>
      
      <section className={styles.infoSection}>
        <h2>Get In Touch</h2>
        <p>
          Have questions about our platform, partnerships, or how to get involved?
          We'd love to hear from you!
        </p>
        
        <div className={styles.contactDetails}>
          <div className={styles.contactItem}>
            <FaMapMarkerAlt className={styles.contactIcon} />
            <span>Kurunji Extension, CEG, Chennai 600 028</span> 
          </div>
          <div className={styles.contactItem}>
            <FaPhoneAlt className={styles.contactIcon} />
            <span>+91 92345 67459</span>
          </div>
          <div className={styles.contactItem}>
            <FaEnvelope className={styles.contactIcon} />
            <span>info@zerofoodwaste.example.com</span> 
          </div>
        </div>
      </section>

      {/* Optional: Add a simple contact form later */}
      {/* <section className={styles.formSection}>
        <h2>Send Us a Message</h2>
        <form> ... form fields ... </form>
      </section> */}

      {/* Initiative Footer Section */}
      <footer className={styles.initiativeFooter}>
        <FaUsers className={styles.footerIcon} />
        <span>Initiative by</span>
        <span>Calvin  - Sanjay  - Niranchan - Jaison</span>
      </footer>

    </div>
  );
}

export default ContactUs; 