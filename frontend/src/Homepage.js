import {React} from "react";
import GoogleSignIn from './Components/GoogleSignIn';
import './Homepage.css';
//import { motion } from "framer-motion"
import { Link } from "react-router-dom";



const Homepage = () => {


  return (
    <div>
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="navbar-left">
          <Link to='/' className='active' ><h2>Resume App</h2></Link>
        </div>
        <div className="navbar-right">
          <Link to="/dashboard" className="nav-link active">Dashboard</Link>
          <Link to="/profile" className="nav-link">User Settings</Link>
          <Link to="/" className="nav-link">Login</Link>
        </div>
      </nav>
      <h1>Resum-Edit</h1>
        <h4>An AI Powered Tool to Help You Improve Your Resume</h4>
      <GoogleSignIn />
    </div>
  );
};

export default Homepage;
