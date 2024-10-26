import {React} from "react";
import GoogleSignIn from './Components/GoogleSignIn';
import './Homepage.css';
//import { motion } from "framer-motion"


const Homepage = () => {


  return (
    <div>
      <h1>Resum-Edit</h1>
        <h4>An AI Powered Tool to Help You Improve Your Resume</h4>
      <GoogleSignIn />
    </div>
  );
};

export default Homepage;
