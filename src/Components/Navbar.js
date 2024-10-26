import React, { useState, useContext } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import { NavbarContext } from '../NavbarContext';

function Navbar() {
    const { isNavbarOpen, toggleNavbar } = useContext(NavbarContext);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    const toggleMobileNav = () => {
        setIsMobileNavOpen(!isMobileNavOpen);
/*
        // Start the second animation after a delay when opening
    if (!isMobileNavOpen) {
        document.getElementById('burger-button').classList.add('st-1');
        setTimeout(() => {
          document.getElementById('burger-button').classList.add('st-2');
        }, 400); // Add a delay to match the duration of the first animation
      } else {
        // Remove the "st-2" class after a brief pause when closing
        setTimeout(() => {
          document.getElementById('burger-button').classList.remove('st-2');
    
          // Close the navbar after another short delay
          setTimeout(() => {
            document.getElementById('burger-button').classList.remove('st-1');
            setIsMobileNavOpen(false);
          }, 400); // Add a brief pause before closing st-1
        }, 100); // Add a brief pause before removing st-2
      }*/
    };
    

    

    return (
        <div>
            {/* Desktop Navbar */}
            <div className={`navbar ${isNavbarOpen ? 'open' : 'closed'}`}>
                <ul className="navbar-list">
                    <li><Link to="/fill-in">Fill In</Link></li>
                    <li><Link to="/new-section">+ New Section</Link></li>
                    <li><Link to="/design">Design</Link></li>
                    <li><Link to="/ai-toolbox">AI Toolbox</Link></li>
                    <li><Link to="/analysis">Analysis</Link></li>
                    <li><Link to="/job-interview">Job Interview</Link></li>
                    <li><Link to="/feedback">Feedback</Link></li>
                    <li><Link to="/career-coach">Career Coach</Link></li>
                    <li><Link to="/career-map">Career Map</Link></li>
                    <li><Link to="/proofreading">Proofreading</Link></li>
                    <li><Link to="/download-share">Download & Share</Link></li>
                </ul>

                {/* Arrow for toggling the desktop navbar */}
                <button className={`toggle-button ${isNavbarOpen ? 'open' : 'closed'}`} onClick={toggleNavbar}>
                    {isNavbarOpen ? '>' : '<'}
                </button>
            </div>

            {/* Mobile Navbar */}
            <div className="mobile-navbar">
                <button className={`burger-button hover ${isMobileNavOpen ? 'open' : ''}`} onClick={toggleMobileNav}>
                    <span className="burger-icon">&#9776;</span> {/* Burger icon */}
                </button>
                
                {/* Mobile Navbar Menu */}
                <div className={`small-navbar ${isMobileNavOpen ? 'show' : ''}`}>
                    <ul>
                        <li><Link to="/fill-in" onClick={toggleMobileNav}>Fill In</Link></li>
                        <li><Link to="/new-section" onClick={toggleMobileNav}>+ New Section</Link></li>
                        <li><Link to="/design" onClick={toggleMobileNav}>Design</Link></li>
                        <li><Link to="/ai-toolbox" onClick={toggleMobileNav}>AI Toolbox</Link></li>
                        <li><Link to="/analysis" onClick={toggleMobileNav}>Analysis</Link></li>
                        <li><Link to="/job-interview" onClick={toggleMobileNav}>Job Interview</Link></li>
                        <li><Link to="/feedback" onClick={toggleMobileNav}>Feedback</Link></li>
                        <li><Link to="/career-coach" onClick={toggleMobileNav}>Career Coach</Link></li>
                        <li><Link to="/career-map" onClick={toggleMobileNav}>Career Map</Link></li>
                        <li><Link to="/proofreading" onClick={toggleMobileNav}>Proofreading</Link></li>
                        <li><Link to="/download-share" onClick={toggleMobileNav}>Download & Share</Link></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Navbar;