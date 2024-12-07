import React from "react";
import GoogleSignIn from './Components/GoogleSignIn';
import './Homepage.css';
import { Link } from "react-router-dom";

const Homepage = () => {
  return (
    <div className="homepage-container">
      {/* Top Navbar */}

      <nav className="top-navbar">
        <div className="navbar-left">
          <Link to='/' className='active'><h2>Resume App</h2></Link>
        </div>

        <div className="navbar-right">
          <Link to="/dashboard" className="nav-link active">Dashboard</Link>
          <Link to="/profile" className="nav-link">User Settings</Link>
          <Link to="/" className="nav-link">Login</Link>
          <Link to="/" className="nav-link"></Link>

        </div>
      </nav>


      {/* Main Content */}
      <div className="main-content">
        <div className="text-content">
          <h1>Resume-Edit</h1>
          <h4>An AI Powered Tool to Help You Improve Your Resume</h4>
          {/*<Link to="/dashboard"><button className="cta-button">Get Started</button></Link>*/}
          <GoogleSignIn />
        </div>

        {/* Image Container */}
        <div className="image-container">
          {/* Replace this src with your resume image URL */}
          <img src="https://i.imgur.com/VUw3ynp.jpeg" alt="Resume Preview" className="resume-image" />
        </div>
      </div>


    </div>
  );
};

export default Homepage;