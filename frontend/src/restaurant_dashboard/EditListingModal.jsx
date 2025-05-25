import React, { useState, useEffect } from 'react';
import styles from './EditListingModal.module.css';

// Helper function to format date for input type="date"
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Format to YYYY-MM-DD
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formatting date for input:", e);
    return '';
  }
};

function EditListingModal({ listing, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    expiryDate: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form when listing prop changes
  useEffect(() => {
    if (listing) {
      setFormData({
        itemName: listing.itemName || '',
        quantity: listing.quantity || '',
        expiryDate: formatDateForInput(listing.expiryDate) || '' 
      });
      setError(''); // Clear error when a new listing is loaded
    } else {
      // Reset form if listing is null (modal closed)
      setFormData({ itemName: '', quantity: '', expiryDate: '' });
      setError('');
    }
  }, [listing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsSubmitting(true);

    if (!formData.itemName || !formData.quantity || !formData.expiryDate) {
      setError('Please fill out all fields.');
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem('restaurantToken');
    if (!token) {
      setError('Authentication error. Please log in again.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/foodlistings/${listing._id}`, { // Endpoint to UPDATE the listing
        method: 'PUT', // Use PUT for updates
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData), // Send the updated form data
      });

      const updatedListingData = await response.json();

      if (!response.ok) {
        throw new Error(updatedListingData.message || `HTTP error! status: ${response.status}`);
      }

      console.log('Listing updated successfully:', updatedListingData);
      onUpdate(updatedListingData); // Call the onUpdate prop with the updated data from backend
      onClose(); // Close the modal on success

    } catch (err) {
      console.error('Error updating food listing:', err);
      setError(err.message || 'Failed to update food listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If no listing is provided, don't render the modal
  if (!listing) {
    return null;
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}> {/* Close on backdrop click */} 
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}> {/* Prevent closing when clicking inside content */}
        <h2>Edit Food Listing</h2>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <form onSubmit={handleUpdateSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="itemName">Food Item:</label>
            <input
              type="text"
              id="itemName"
              value={formData.itemName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="text"
              id="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g., 5 kg"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="expiryDate">Expiry Date:</label>
            <input
              type="date"
              id="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button 
              type="button" 
              className={styles.cancelButton} 
              onClick={onClose} 
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitButton} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditListingModal; 