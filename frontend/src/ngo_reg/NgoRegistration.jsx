import React, { useState } from 'react';
import styles from './NgoRegistration.module.css'; // We'll create this CSS module next
import { FaBuilding, FaEnvelope, FaLock, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'; // Import icons
// import { useNavigate } from 'react-router-dom';

function NgoRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    contactNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { name, contact_person, email, phone, address, password, contactNumber } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Use required fields from the *backend* schema
    if (!name || !email || !password || !address || !contactNumber) {
      setError('Please fill in all required fields: Name, Email, Password, Address, Contact Number.');
      return;
    }
    // Password length check can be done on backend too, but frontend check is fine
    if (password.length < 6) { // Assuming backend requires min 6
      setError('Password must be at least 6 characters long.');
      return;
    }

    const apiUrl = `${import.meta.env.VITE_API_URL}/api/ngos/register`;
    console.log('Attempting NGO registration to:', apiUrl);
    
    // Prepare data matching the backend schema (currently placeholder uses form data directly)
    const registrationData = {
        name, 
        email, 
        password, 
        address, 
        contactNumber 
        // Add other fields like mission if they are in your final NGO model
    };

    try {
      const response = await fetch(apiUrl, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData), // Send data matching schema
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Handle successful registration
      console.log('Registration successful:', data);
      setSuccess('Registration successful! You can now log in.');
      setFormData({ // Clear form
        name: '', contact_person: '', email: '', phone: '', address: '', password: '', contactNumber: '' // Clear new fields too
      }); 
      // Optional: Store token if registration returns one, then redirect
      // localStorage.setItem('ngoToken', data.token);
      // setTimeout(() => navigate('/ngo/login'), 2000); // If using react-router navigate

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    }
     // Remove placeholder alert
     // alert('Registration functionality not yet implemented. Check console for data.'); 
     // Remove placeholder success
     // setSuccess('Placeholder: Registration submitted! Check console.'); 
     // Clearing form is now handled in try block on success
     // setFormData({ name: '', contact_person: '', email: '', phone: '', address: '', password: '' });
  };

  return (
    <div className={styles.registrationContainer}>
      <h2>NGO Registration</h2>
      <form onSubmit={handleSubmit} className={styles.registrationForm}>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}

        <div className={styles.formGroup}>
          <label htmlFor="name">NGO Name <span className={styles.required}>*</span></label>
          <div className={styles.inputGroup}>
            <FaBuilding className={styles.inputIcon} />
            <input type="text" id="name" value={name} onChange={handleChange} placeholder="e.g., Community Helpers" required />
          </div>
        </div>

        {/* Remove contact_person and phone if not in backend schema */}
        {/* <div className={styles.formGroup}>
          <label htmlFor="contact_person">Contact Person</label>
          <input type="text" id="contact_person" value={contact_person} onChange={handleChange} />
        </div> */}

        <div className={styles.formGroup}>
          <label htmlFor="email">Email <span className={styles.required}>*</span></label>
          <div className={styles.inputGroup}>
            <FaEnvelope className={styles.inputIcon} />
            <input type="email" id="email" value={email} onChange={handleChange} placeholder="ngo@email.com" required />
          </div>
        </div>

        {/* Remove phone if not in backend schema */}
        {/* <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input type="tel" id="phone" value={phone} onChange={handleChange} />
        </div> */}

        <div className={styles.formGroup}>
          <label htmlFor="password">Password <span className={styles.required}>*</span></label>
          <div className={styles.inputGroup}>
            <FaLock className={styles.inputIcon} />
            <input type="password" id="password" value={password} onChange={handleChange} placeholder="Min. 6 characters" required minLength="6" />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="address">Address <span className={styles.required}>*</span></label>
          <div className={styles.inputGroup}>
            <FaMapMarkerAlt className={styles.inputIcon} style={{ marginTop: '0.8rem' }} />
            <textarea id="address" value={address} onChange={handleChange} placeholder="456 Community Ave, City" required />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="contactNumber">Contact Number <span className={styles.required}>*</span></label>
          <div className={styles.inputGroup}>
            <FaPhoneAlt className={styles.inputIcon} />
            <input type="tel" id="contactNumber" value={contactNumber} onChange={handleChange} placeholder="(555) 987-6543" required />
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>Register</button>
      </form>
       {/* Optional: Link to login */}
      {/* <p className={styles.switchFormText}>Already registered? <Link to="/ngo/login">Login here</Link></p> */} 
    </div>
  );
}

export default NgoRegistration; 