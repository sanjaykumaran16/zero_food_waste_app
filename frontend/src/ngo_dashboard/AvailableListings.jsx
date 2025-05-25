import React, { useState, useEffect } from 'react';
import styles from './AvailableListings.module.css'; // Create this CSS module
import { FaSearch, FaUtensils, FaCalendarAlt, FaBuilding, FaMapMarkerAlt, FaPhoneAlt, FaHandPaper, FaInfoCircle, FaTimes } from 'react-icons/fa'; // Import necessary icons

function AvailableListings() {
  const [listings, setListings] = useState([]); // Original full list
  const [filteredListings, setFilteredListings] = useState([]); // List to display
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [claimNotification, setClaimNotification] = useState(null); // State for the notification message/details

  // Fetch all available listings on mount
  useEffect(() => {
    const fetchAvailableListings = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('ngoToken'); 

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/foodlistings', { 
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch available listings. Server returned an error.' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setListings(data); // Store the full list
        // Initially display all listings
        // setFilteredListings(data); // Let the filter useEffect handle this
      } catch (err) {
        console.error("Error fetching available listings:", err);
        setError(err.message || 'Failed to fetch listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableListings();
  }, []); // Runs once on mount

  // Filter listings whenever the search query or the main list changes
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = listings.filter(listing => {
      // Check if restaurant address or item name includes the query
      const address = listing.restaurant?.address?.toLowerCase();
      const itemName = listing.itemName?.toLowerCase(); 
      
      const addressMatch = address ? address.includes(lowerCaseQuery) : false;
      const itemMatch = itemName ? itemName.includes(lowerCaseQuery) : false;
      
      return addressMatch || itemMatch; // Return true if either field matches
    });
    setFilteredListings(filtered);
  }, [searchQuery, listings]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Use options for a clearer date format
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Claim a listing
  const handleClaim = async (listingId) => {
      // Find the specific listing details *before* making the API call or filtering
      const claimedListingDetails = listings.find(l => l._id === listingId);
      if (!claimedListingDetails) {
          console.error("Could not find listing details locally for ID:", listingId);
          setError("An unexpected error occurred. Could not find listing details.");
          return;
      }

      console.log("Attempting to claim listing:", listingId);
      setError(''); // Clear previous errors
      setClaimNotification(null); // Clear previous notification
      const token = localStorage.getItem('ngoToken');

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      // Add loading state for the specific button? (Optional enhancement)

      try {
        const response = await fetch(`/api/foodlistings/${listingId}/claim`, { 
          method: 'PUT', 
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to claim the listing.' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // If claim is successful:
        // 1. Remove the claimed listing from the main list state
        setListings(prevListings => prevListings.filter(l => l._id !== listingId));
        // The filter useEffect will automatically update filteredListings

        // 2. Set the success notification details
        setClaimNotification({
            itemName: claimedListingDetails.itemName,
            restaurantName: claimedListingDetails.restaurant?.name || 'the restaurant',
            expiryDate: formatDate(claimedListingDetails.expiryDate)
        });

      } catch (err) {
        console.error("Error claiming listing:", err);
        setError(err.message || 'Failed to claim listing. Please try again.');
      }
      // Remove loading state here if implemented
  }

  return (
    <div className={styles.availableListingsContainer}>
      <h2>Available Food Donations</h2>

      {/* Search Bar */} 
      <div className={styles.searchContainer}>
        <span className={styles.searchIcon}><FaSearch /></span>
        <input 
          type="text"
          placeholder="Search by location or food item..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Claim Success Notification */} 
      {claimNotification && (
          <div className={styles.claimNotificationBox}>
              <span className={styles.notificationIcon}><FaInfoCircle /></span>
              <p>
                  You have claimed the listing for <strong>{claimNotification.itemName}</strong> from <strong>{claimNotification.restaurantName}</strong>. 
                  Please pick it up before expiry on <strong>{claimNotification.expiryDate}</strong>.
              </p>
              <button 
                  className={styles.closeNotificationButton}
                  onClick={() => setClaimNotification(null)} // Clear notification on click
                  aria-label="Close notification"
              >
                  <FaTimes />
              </button>
          </div>
      )}

      {loading && <p>Loading available donations...</p>}
      {error && <p className={styles.errorMessage}>Error: {error}</p>}

      {!loading && !error && (
        // Check filteredListings length now
        filteredListings.length === 0 ? (
          // Provide different messages based on whether there was a search
          searchQuery ? 
          <p>No donations found matching your search criteria.</p> : 
          <p>No food donations are currently available.</p>
        ) : (
          <table className={styles.listingsTable}>
            <thead>
              <tr>
                <th><FaUtensils className={styles.tableIcon} /> Item Name</th>
                <th>Qty</th>
                <th><FaCalendarAlt className={styles.tableIcon} /> Expires</th>
                <th><FaBuilding className={styles.tableIcon} /> Restaurant</th>
                <th><FaMapMarkerAlt className={styles.tableIcon} /> Address</th>
                <th><FaPhoneAlt className={styles.tableIcon} /> Contact</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Map over filteredListings now */}
              {filteredListings.map((listing) => (
                <tr key={listing._id}>
                  <td>{listing.itemName}</td>
                  <td>{listing.quantity}</td>
                  <td>{formatDate(listing.expiryDate)}</td>
                  <td>{listing.restaurant?.name || 'N/A'}</td>
                  <td>{listing.restaurant?.address || 'N/A'}</td>
                  <td>{listing.restaurant?.contactNumber || 'N/A'}</td>
                  <td>
                    <button 
                      className={styles.claimButton}
                      onClick={() => handleClaim(listing._id)}
                    >
                      <FaHandPaper /> Claim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}

export default AvailableListings; 