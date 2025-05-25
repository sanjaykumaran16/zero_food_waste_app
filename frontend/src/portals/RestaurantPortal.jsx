import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Portal.module.css'; // Shared styles for portals

function RestaurantPortal() {
  return (
    <div className={styles.portalContainer}> {/* Background fills parent */}
      <div className={styles.portalContent}> {/* Center the inner content */}
        <h2>Restaurant Portal</h2>
        <p>Please login or register to continue.</p>
        <div className={styles.buttonGroup}>
          <Link to="/restaurant/login" className={styles.portalButton}>Login</Link>
          <Link to="/restaurant/register" className={styles.portalButton}>Register</Link>
        </div>
      </div>
    </div>
  );
}

export default RestaurantPortal; 