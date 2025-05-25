import React, { useState, useEffect } from 'react';
import styles from './RestaurantDashboard.module.css'; // Import the CSS module
import {
  FaUtensils, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaPhoneAlt,
  FaCheckCircle, // Icon for Collected
  FaListAlt,     // Icon for Available
  FaTimesCircle,  // Icon for Expired
  FaInfoCircle,   // Icon for general info
  FaTimes,        // Icon for close button
  FaClock         // Added Clock icon
} from 'react-icons/fa'; // Import icons

function RestaurantDashboard() {
  // State for dashboard data
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  // const [listingsCount, setListingsCount] = useState(0); // Keep or remove based on final design
  const [listingCounts, setListingCounts] = useState({ collected: 0, available: 0, expired: 0 }); // New state for counts
  const [isLoadingData, setIsLoadingData] = useState(true); // Loading state for dashboard data
  const [dataError, setDataError] = useState('');
  const [showLoginNotification, setShowLoginNotification] = useState(true); // State to control login notification visibility

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      setDataError('');
      const token = localStorage.getItem('restaurantToken');

      if (!token) {
        setDataError('Authentication token not found. Please log in again.');
        setIsLoadingData(false);
        return;
      }

      try {
        // Fetch restaurant details including the new listingCounts
        const response = await fetch('/api/restaurants/me', { 
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch dashboard data.');
        }
        const data = await response.json();
        
        // Log the received data to check counts
        console.log("Received dashboard data:", data);

        setRestaurantDetails(data); // Includes name, email etc.
        if (data.listingCounts) {
            setListingCounts(data.listingCounts); // Set the counts state
        }
        // setListingsCount(data.listingCounts.collected + data.listingCounts.available + data.listingCounts.expired); // If total count is still needed

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setDataError(err.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []); // Runs once on mount

  const unreadCount = restaurantDetails?.unreadNotificationCount || 0;

  // Main render logic
  return (
    <div className={styles.dashboardContainer}>

      {/* Login Notification - Show if unread count > 0 and not dismissed */}
      {!isLoadingData && unreadCount > 0 && showLoginNotification && (
        <div className={`${styles.loginNotificationBox} ${styles.infoBox}`}> {/* Use specific class + generic */}
            <span className={styles.boxIcon}><FaInfoCircle /></span>
            <p>
                You have <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? 's' : ''}. 
                Check the <a href="/restaurant/dashboard/notifications" onClick={() => setShowLoginNotification(false)}>Notifications tab</a>.
            </p>
            <button 
                className={styles.closeBoxButton}
                onClick={() => setShowLoginNotification(false)} // Dismiss on click
                aria-label="Dismiss notification"
            >
                <FaTimes />
            </button>
        </div>
      )}

      {/* Welcome Message */}
      {isLoadingData ? (
        <p className={styles.loadingMessage}>Loading dashboard...</p> // Use specific class
      ) : dataError ? (
        <p className={styles.errorMessage}>{dataError}</p>
      ) : restaurantDetails && (
        <div className={styles.welcomeSection}>
          <h2>Welcome, {restaurantDetails.name}!</h2>
          {/* Optional: Display total listings or other stats here */}
          {/* <p className={styles.stats}>You have added <strong>{listingsCount}</strong> food listing{listingsCount !== 1 ? 's' : ''} so far.</p> */}
        </div>
      )}

      {/* --- Listing Stats Cards --- */}
      {!isLoadingData && !dataError && restaurantDetails && (
          <div className={styles.statsCardsContainer}>
            
            {/* Card 1: Collected Listings */}
            <div className={`${styles.statCard} ${styles.collectedCard}`}>
              <div className={styles.cardIcon}><FaCheckCircle /></div>
              <div className={styles.cardContent}>
                <span className={styles.cardNumber}>{listingCounts.collected}</span>
                <span className={styles.cardLabel}>Listings Claimed</span>
              </div>
            </div>

            {/* Card 2: Available Listings */}
            <div className={`${styles.statCard} ${styles.availableCard}`}>
               <div className={styles.cardIcon}><FaListAlt /></div>
              <div className={styles.cardContent}>
                <span className={styles.cardNumber}>{listingCounts.available}</span>
                <span className={styles.cardLabel}>Listings Available</span>
              </div>
            </div>

            {/* Card 3: Expired Listings */}
            <div className={`${styles.statCard} ${styles.expiredCard}`}>
               <div className={styles.cardIcon}><FaTimesCircle /></div>
              <div className={styles.cardContent}>
                <span className={styles.cardNumber}>{listingCounts.expired}</span>
                <span className={styles.cardLabel}>Listings Expired</span>
              </div>
            </div>

          </div>
      )}

      {/* Restaurant Details Section (If you want to keep it) */}
      {!isLoadingData && !dataError && restaurantDetails && (
        <>
        <hr className={styles.divider} /> 
        <div className={styles.detailsSection}>
            <h3>Your Restaurant Details</h3>
            <p><span className={styles.detailIcon}><FaUtensils /></span><strong>Name:</strong> {restaurantDetails.name}</p>
            <p><span className={styles.detailIcon}><FaEnvelope /></span><strong>Email:</strong> {restaurantDetails.email}</p>
            <p><span className={styles.detailIcon}><FaMapMarkerAlt /></span><strong>Address:</strong> {restaurantDetails.address}</p>
            <p><span className={styles.detailIcon}><FaPhoneAlt /></span><strong>Contact:</strong> {restaurantDetails.contactNumber}</p>
        </div>
        </>
      )}

    </div>
  );
}

export default RestaurantDashboard; 