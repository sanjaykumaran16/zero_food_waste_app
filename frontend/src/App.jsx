import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaInfoCircle, FaEnvelope, FaHome } from 'react-icons/fa'; // Import hamburger icon, new icons, and home icon

// Import your components
import RestaurantLogin from './restraunt_login/RestaurantLogin';
import RestaurantRegistration from './restraunt_reg/RestaurantRegistration';
import NgoRegistration from './ngo_reg/NgoRegistration';
import NgoLogin from './ngo_login/NgoLogin';
// Import the new portal components
import RestaurantPortal from './portals/RestaurantPortal';
import NgoPortal from './portals/NgoPortal';
import HomePage from './pages/HomePage'; // Import the new HomePage component
import AboutUs from './pages/AboutUs'; // Import AboutUs
import ContactUs from './pages/ContactUs'; // Import ContactUs
// Import Dashboard components
import RestaurantDashboard from './restaurant_dashboard/RestaurantDashboard';
import AddFoodListing from './restaurant_dashboard/AddFoodListing'; // Import the new component
import MyRestaurantListings from './restaurant_dashboard/MyRestaurantListings'; // Re-enabled
import NotificationsPage from './restaurant_dashboard/NotificationsPage'; // Import Notifications Page
import NgoDashboard from './ngo_dashboard/NgoDashboard';
import AvailableListings from './ngo_dashboard/AvailableListings'; // Import new component
// Import Sidebar component (will be created next)
import Sidebar from './components/Sidebar'; // Assuming path
// Import ProfileDropdown component
import ProfileDropdown from './components/ProfileDropdown';
// Import Admin components
import AddRestaurantAdmin from './admin/AddRestaurantAdmin';
import FoodListingsAdmin from './admin/FoodListingsAdmin';
import AddNgoAdmin from './admin/AddNgoAdmin';
import ThemeToggle from './components/ThemeToggle'; // Import ThemeToggle

import './App.css'; // Keep default App styles for now

// Animation settings for pages
const pageVariants = {
  initial: {
    opacity: 0,
    y: 10 // Slight slide up from bottom
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -10 // Slight slide up to top
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate", // Or "easeInOut"
  duration: 0.4 // Adjust duration
};

// Wrapper component for animating routes
const AnimatedRoute = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

// Main App component rendering Layout
function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

// Layout component to manage sidebar and access location
function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation(); // Get location object
  const navigate = useNavigate(); // Get navigate function
  
  // State for user details fetched in Layout
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false); // Initially not loading unless token found
  // Note: Error handling for this fetch can be added if necessary

  // --- Add Theme State --- 
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or default to false (light mode)
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // --- Add Theme Toggle Function --- 
  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  // --- Add Effect to toggle body class --- 
  useEffect(() => {
    const rootElement = document.getElementById('root');
    if (isDarkMode) {
      rootElement.classList.add('dark-mode');
    } else {
      rootElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Determine if the hamburger should be shown
  const showHamburger = location.pathname.startsWith('/restaurant/dashboard') || 
                        location.pathname.startsWith('/ngo/dashboard');
  
  // Determine user type based on path for sidebar content
  let userType = null;
  if (location.pathname.startsWith('/restaurant/dashboard')) {
      userType = 'restaurant';
  } else if (location.pathname.startsWith('/ngo/dashboard')) {
      userType = 'ngo';
  } // Add admin logic later if needed

  // Fetch user details when on a dashboard route
  useEffect(() => {
    const fetchUserDetails = async () => {
        let token = null;
        let apiPath = null;

        if(userType === 'restaurant') {
            token = localStorage.getItem('restaurantToken');
            apiPath = '/api/restaurants/me';
        } else if (userType === 'ngo') {
            token = localStorage.getItem('ngoToken'); // Assuming NGO token storage
            apiPath = '/api/ngos/me'; // Assuming NGO /me route exists
        }

        if (token && apiPath) {
            setIsLoadingUser(true);
            try {
                const response = await fetch(apiPath, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setCurrentUser({...data, type: userType}); // Add type for potential use
                } else {
                    console.error('Failed to fetch user details:', response.status);
                    setCurrentUser(null); // Clear user if fetch fails
                    // Optional: Clear token from localStorage if invalid?
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
                setCurrentUser(null);
            } finally {
                setIsLoadingUser(false);
            }
        } else {
            setCurrentUser(null); // Clear user if no token or not on dashboard
        }
    };

    if (showHamburger) {
        fetchUserDetails();
    } else {
        setCurrentUser(null); // Clear user when navigating away from dashboard
        setIsLoadingUser(false);
    }
    // Rerun effect if the userType changes (e.g., navigating between dashboards, though unlikely)
  }, [location.pathname, userType, showHamburger]);

  // Custom click handler for the Home link
  const handleHomeClick = (e) => {
    if (currentUser) { // If logged in
      e.preventDefault(); // Stop navigation
      alert("Cannot go to Home page while logged in. Please log out first.");
    }
    // If not logged in, the default Link behavior happens
  };

  // Logout handler function
  const handleLogout = () => {
    console.log("Logging out..."); 
    // Determine token type based on available user data
    const userType = currentUser?.type; 
    if (userType === 'ngo') {
        localStorage.removeItem('ngoToken');
    } else if (userType === 'restaurant') {
        localStorage.removeItem('restaurantToken');
    } else {
      // Fallback or handle other user types/unknown state
      localStorage.removeItem('restaurantToken'); 
      localStorage.removeItem('ngoToken');
    }
    // Clear the user state immediately
    setCurrentUser(null);
    // Navigate to homepage
    navigate('/'); 
  };

  return (
    <div className="appContainer"> {/* Removed rootContainer class */}
      {/* Sidebar Component (conditionally rendered or styled based on isSidebarOpen) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        closeSidebar={toggleSidebar} 
        currentUser={currentUser}
      />

      <div className="mainContentWithNavbar"> {/* Wrap Navbar and Content */}
        <nav className="appNavbar">
          {/* Conditionally render Hamburger Button */} 
          {showHamburger && (
            <button onClick={toggleSidebar} className="hamburgerButton">
              <FaBars /> {/* Use the icon component */}
            </button>
          )}
          {/* Adjust Navbar padding if hamburger is not shown? Optional. */}
          <ul className="navList" style={{ paddingLeft: showHamburger ? '0' : '3rem' }}> {/* Example adjustment */}
            <li><NavLink to="/" onClick={handleHomeClick} className={({ isActive }) => isActive && !currentUser ? "active" : ""}><FaHome /></NavLink></li>
            {/* Show About/Contact when logged out */} 
            {!currentUser && (
              <>
                {/* Use NavLink for About/Contact */}
                <li><NavLink to="/about" className={({ isActive }) => isActive ? "active" : ""}><FaInfoCircle /></NavLink></li> 
                <li><NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""}><FaEnvelope /></NavLink></li> 
              </>
            )}
            {/* Conditionally render Restaurant/NGO links only if NOT logged into a dashboard */}
            {/* Removed Restaurant and NGO links */}
            {/* Maybe add Admin link here later? */}
          </ul>
          
          {/* Profile Dropdown - Renders on right if user loaded */}
          {showHamburger && !isLoadingUser && currentUser && (
              <ProfileDropdown user={currentUser} onLogout={handleLogout} />
          )}
          {/* Theme Toggle Button */} 
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
           {/* Placeholder/Spinner during load? */}
           {showHamburger && isLoadingUser && (
              <div style={{marginLeft: 'auto', paddingRight: '1rem', color: '#800000'}}>...</div> 
           )}
        </nav>

        {/* Main Content Container (where routes render) */}
        <div className="mainContentContainer"> 
          {/* Wrap Routes with AnimatePresence */}
          <AnimatePresence mode="wait">
            {/* Pass location and key to Routes for AnimatePresence */}
            <Routes location={location} key={location.pathname}>
              {/* Wrap each element with AnimatedRoute */}
              <Route path="/" element={<AnimatedRoute><HomePage /></AnimatedRoute>} />
              <Route path="/about" element={<AnimatedRoute><AboutUs /></AnimatedRoute>} />
              <Route path="/contact" element={<AnimatedRoute><ContactUs /></AnimatedRoute>} />
              <Route path="/restaurant" element={<AnimatedRoute><RestaurantPortal /></AnimatedRoute>} />
              <Route path="/ngo" element={<AnimatedRoute><NgoPortal /></AnimatedRoute>} />
              <Route path="/restaurant/login" element={<AnimatedRoute><RestaurantLogin /></AnimatedRoute>} />
              <Route path="/restaurant/register" element={<AnimatedRoute><RestaurantRegistration /></AnimatedRoute>} /> 
              <Route path="/ngo/register" element={<AnimatedRoute><NgoRegistration /></AnimatedRoute>} />
              <Route path="/ngo/login" element={<AnimatedRoute><NgoLogin /></AnimatedRoute>} />
              
              {/* Restaurant Dashboard Routes */}
              <Route path="/restaurant/dashboard" element={<AnimatedRoute><RestaurantDashboard /></AnimatedRoute>} /> {/* Main Dashboard page */}
              <Route path="/restaurant/dashboard/add" element={<AnimatedRoute><AddFoodListing /></AnimatedRoute>} /> {/* Add Food Listing page */}
              <Route path="/restaurant/dashboard/listings" element={<AnimatedRoute><MyRestaurantListings /></AnimatedRoute>} /> {/* My Listings page */}
              <Route path="/restaurant/dashboard/notifications" element={<AnimatedRoute><NotificationsPage /></AnimatedRoute>} /> {/* Notifications page */}
              
              <Route path="/ngo/dashboard" element={<AnimatedRoute><NgoDashboard /></AnimatedRoute>} />
              <Route path="/ngo/dashboard/available" element={<AnimatedRoute><AvailableListings /></AnimatedRoute>} /> {/* New Route */}
              
              {/* --- Admin Routes --- */}
              {/* TODO: These routes should ideally be protected by an admin auth check */}
              <Route path="/admin/add-restaurant" element={<AnimatedRoute><AddRestaurantAdmin /></AnimatedRoute>} />
              <Route path="/admin/food-listings" element={<AnimatedRoute><FoodListingsAdmin /></AnimatedRoute>} />
              <Route path="/admin/add-ngo" element={<AnimatedRoute><AddNgoAdmin /></AnimatedRoute>} /> 

              {/* 404 Route - Also wrap if desired, or handle differently */}
              <Route path="*" element={<AnimatedRoute><div><h2>404 Not Found</h2></div></AnimatedRoute>} />
            </Routes>
          </AnimatePresence>
        </div> 
      </div>
    </div>
  );
}

export default App;
