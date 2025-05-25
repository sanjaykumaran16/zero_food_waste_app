import React, { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';

function AdminDashboard() {
  const [stats, setStats] = useState({
    listedCount: 0,
    requestedCount: 0,
    scheduledCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        // --- TODO: Replace with actual API call to fetch admin stats ---
        console.log('Fetching admin stats...');
        // Example: Fetch all counts from a single endpoint
        // const response = await fetch('/api/admin/stats'); // Adjust endpoint
        // if (!response.ok) throw new Error('Failed to fetch stats');
        // const data = await response.json();
        // setStats(data);

        // **Placeholder Simulation**
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        const simulatedData = {
          listedCount: 125,
          requestedCount: 80,
          scheduledCount: 65,
        };
        setStats(simulatedData);
        // End Placeholder

      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError(err.message || 'Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className={styles.dashboardContainer}>
      <h2>Admin Dashboard</h2>

      {loading && <p className={styles.loadingMessage}>Loading dashboard data...</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {!loading && !error && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Food Listings</h3>
            <p className={styles.statValue}>{stats.listedCount}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Total Food Requests</h3>
            <p className={styles.statValue}>{stats.requestedCount}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Total Scheduled Pickups</h3>
            <p className={styles.statValue}>{stats.scheduledCount}</p>
          </div>
        </div>
      )}

      {/* Optional: Add links to manage listings, requests, users etc. */}
      {/*
      <div className={styles.adminActions}>
        <h4>Manage Data:</h4>
        <ul>
          <li><a href="/admin/listings">Manage Food Listings</a></li>
          <li><a href="/admin/requests">Manage Food Requests</a></li>
          <li><a href="/admin/users">Manage Users (Restaurants/NGOs)</a></li>
        </ul>
      </div>
      */}
    </div>
  );
}

export default AdminDashboard; 