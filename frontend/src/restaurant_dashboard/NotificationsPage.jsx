import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './NotificationsPage.module.css'; // Create CSS module
import { FaBell, FaUtensils, FaClock, FaTrashAlt } from 'react-icons/fa'; // Icons

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isClearing, setIsClearing] = useState(false); // State for clearing operation

  useEffect(() => {
    const fetchAndMarkRead = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('restaurantToken');

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch Notifications
        const fetchResponse = await fetch('/api/notifications/myNotifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!fetchResponse.ok) {
          const errorData = await fetchResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch notifications.');
        }

        const data = await fetchResponse.json();
        setNotifications(data);

        // 2. Mark them as read (fire-and-forget for UI, but log errors)
        // Check if there were any unread notifications before calling markAllRead
        const hasUnread = data.some(n => !n.isRead);
        if (hasUnread) { 
            await fetch('/api/notifications/markAllRead', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // No need to handle success explicitly here, 
            // as the main effect is on the backend count for next load
        }

      } catch (err) {
        console.error("Error in notification fetch/mark read:", err);
        setError(err.message || 'Could not load or update notifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndMarkRead();
  }, []); // Still runs only on mount

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString(); // Show date and time
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Handler for clearing all notifications
  const handleClearAll = async () => {
      // Optional: Confirmation dialog
      if (!window.confirm("Are you sure you want to delete ALL notifications?")) {
          return;
      }

      setIsClearing(true);
      setError(''); 
      const token = localStorage.getItem('restaurantToken');

      try {
          const response = await fetch('/api/notifications/deleteAll', {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || 'Failed to delete notifications.');
          }

          // Clear notifications from local state immediately
          setNotifications([]);
          // Optionally show a temporary success message?

      } catch (err) {
          console.error("Error deleting notifications:", err);
          setError(err.message || 'Could not clear notifications.');
      } finally {
          setIsClearing(false);
      }
  };

  return (
    <div className={styles.notificationsContainer}>
      <div className={styles.headerContainer}>
        <h1><FaBell /> Your Notifications</h1>
        {/* Show Clear All button only if there are notifications and not currently loading/clearing */} 
        {!loading && !isClearing && notifications.length > 0 && (
            <button 
                className={styles.clearAllButton}
                onClick={handleClearAll}
                disabled={isClearing} // Disable while clearing
            >
                <FaTrashAlt /> Clear All
            </button>
        )}
        {isClearing && <p className={styles.clearingMessage}>Clearing...</p>}
      </div>

      {loading && <p className={styles.loading}>Loading notifications...</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {!loading && !error && (
        notifications.length === 0 ? (
          <p className={styles.noNotifications}>You have no new notifications.</p>
        ) : (
          <ul className={styles.notificationList}>
            {notifications.map(notification => (
              <li key={notification._id} className={`${styles.notificationItem} ${notification.isRead ? styles.read : styles.unread}`}>
                <div className={styles.notificationIcon}>
                  {/* Could customize icon based on type */} 
                  <FaBell /> 
                </div>
                <div className={styles.notificationContent}>
                  <p className={styles.message}>{notification.message}</p>
                  {/* Link to the specific food listing if needed */}
                  {/* {notification.foodListing && (
                    <p className={styles.foodItem}><FaUtensils /> Item: {notification.foodListing.itemName || 'N/A'}</p>
                  )} */}
                  <p className={styles.timestamp}><FaClock /> {formatDate(notification.createdAt)}</p>
                  {/* Optional: Add a button to mark as read */}
                  {/* {!notification.isRead && <button>Mark as Read</button>} */}
                </div>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

export default NotificationsPage; 