import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./GoogleSignIn.css";

const GoogleSignIn = () => {
  const clientID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const navigate = useNavigate();
  console.log(clientID);

  useEffect(() => {
    const initGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientID,
          callback: handleCredentialResponse,
        });
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

  const handleSignInClick = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      console.error("Google Sign-In library not loaded");
    }
  };

  return (
    <><>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </><div className='signin-container'>
        <h2 className="get-started-text">Get Started</h2>
        <button id='login' className="gsi-material-button" onClick={handleSignInClick}>
          <div className="gsi-material-button-content-wrapper">
            <div className="gsi-material-button-icon">
              {/* Google Icon SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span className="gsi-material-button-contents">Sign in with Google</span>
          </div>
        </button>
      </div></>
  );
};

export default GoogleSignIn;