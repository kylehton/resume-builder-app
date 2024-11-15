import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./GoogleSignIn.css";

  const GoogleSignIn = () => {
    const clientID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    // unable to read from .env file, so manually insert the clientID when using localhost, and 
    // revert back to this when pushing onto main branch for deployment
    const navigate = useNavigate();
  
    useEffect(() => {
      const initGoogleSignIn = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: clientID,
            callback: handleCredentialResponse,
          });
  
          // Render the full-size Google Sign-In button
          window.google.accounts.id.renderButton(
            document.getElementById("sign-in-button"), 
            {
              theme: "outline", 
              size: "large", 
              type: "standard" 
            }
          );
        }
      };
  
      // Load the Google Sign-In script and initialize Google Sign-In
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
  
      script.onload = initGoogleSignIn;
  
      return () => {
        document.body.removeChild(script);
      };
    }, [clientID]);
  
    const handleCredentialResponse = (response) => {
      if (response.credential) {
        console.log("Encoded JWT ID token: " + response.credential);
        // Navigate to the dashboard after successful sign-in
        window.location.href = '/dashboard';
      } else {
        console.error("Error in Google Sign-In: ", response.error);
      }
    };
  
    return (
      <div className="signin-container">
        <h2 className="get-started-text">Get Started</h2>
        <div id="sign-in-button"></div> {/* Google sign-in button will be rendered here */}
      </div>
    );
  };
  
  export default GoogleSignIn;