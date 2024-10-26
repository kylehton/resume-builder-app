import React from "react";
import GoogleSignIn from './Components/GoogleSignIn';

console.log(process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID);

const Homepage = () => {

  return (
    <div>
      <h1>Homepage</h1>
      <GoogleSignIn />
    </div>
  );
};

export default Homepage;
