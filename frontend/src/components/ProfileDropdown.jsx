import React, { useState, useEffect, useRef } from 'react';
import styles from './ProfileDropdown.module.css'; // We will create this
import { FaUserCircle, FaSignOutAlt, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaBuilding } from 'react-icons/fa'; // Icons

function ProfileDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref to detect clicks outside

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Prevent rendering if no user data
  if (!user) {
    return null;
  }

  return (
    <div className={styles.profileDropdownContainer} ref={dropdownRef}>
      <button className={styles.profileButton} onClick={() => setIsOpen(!isOpen)} aria-haspopup="true" aria-expanded={isOpen}>
        <FaUserCircle />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.userInfo}>
            <div className={styles.userName}><FaBuilding style={{ marginRight: '8px' }}/> {user.name}</div>
            <div className={styles.userDetail}><FaEnvelope /> {user.email}</div>
            {user.address && 
            <div className={styles.userDetail}><FaMapMarkerAlt /> {user.address}</div>
            }
            {user.contactNumber &&
              <div className={styles.userDetail}><FaPhoneAlt /> {user.contactNumber}</div>
            }
          </div>
          <button className={styles.logoutButton} onClick={onLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown; 