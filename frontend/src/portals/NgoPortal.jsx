import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Portal.module.css'; // Shared styles for portals

function NgoPortal() {
  return (
    <div className={styles.portalContainer}> {/* Background fills parent */}
      <div className={styles.portalContent}> {/* Center the inner content */}
        <h2>NGO Portal</h2>
        <p>Please login or register to continue.</p>
        <div className={styles.buttonGroup}>
          <Link to="/ngo/login" className={styles.portalButton}>Login</Link>
          <Link to="/ngo/register" className={styles.portalButton}>Register</Link>
        </div>
      </div>
    </div>
  );
}

export default NgoPortal; 