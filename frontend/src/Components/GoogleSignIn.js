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
  
    const handleCredentialResponse = async (response) => {
      if (response.credential) {
        //response.credential is the JWT token for the authenticated user
        const payload = JSON.parse(atob((response.credential).split(".")[1]));
        console.log("Token credentials:", response.credential);
        console.log("User ID:", payload["sub"]);// accesses the user ID from token

        const resp = await fetch('https://resume-builder-backend-mu.vercel.app/retrieve_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: response.credential }), // Send the full token
        });
    
        if (resp.ok) {
          const data = await resp.json();
          console.log("Backend returned data:", data);
        } else {
          console.error("Error from backend:", await resp.text());
        }
      } else {
        console.error("No credential received from Google Sign-In");
      }

        // post request to backend to store user ID for usage in the backend
        // Navigate to the dashboard after successful sign-in

        //window.location.href = '/dashboard';
      
    };
  
    return (
      <div className="signin-container">
        <h2 className="get-started-text">Get Started</h2>
        <div id="sign-in-button"></div> {/* Google sign-in button will be rendered here */}
      </div>
    );
  };
  
  export default GoogleSignIn;