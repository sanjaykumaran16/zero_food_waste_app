import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import styles from './ThemeToggle.module.css';

function ThemeToggle({ isDarkMode, toggleTheme }) {
  return (
    <button
      className={styles.toggleButton}
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <FaSun className={styles.icon} />
      ) : (
        <FaMoon className={styles.icon} />
      )}
    </button>
  );
}

export default ThemeToggle; 