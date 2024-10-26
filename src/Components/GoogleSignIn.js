import { useEffect } from 'react';

const clientID = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;

const GoogleSignIn = () => {
  useEffect(() => {
    // Initialize Google Identity Services
    const initGoogleSignIn = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: clientID,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('buttonDiv'), // The div where the button is rendered
          { theme: 'outline', size: 'large' }  // Customize button here
        );
        window.google.accounts.id.prompt(); // Automatically prompt the user
      };
      return () => {
        document.body.removeChild(script);
      };
    };

    initGoogleSignIn();
  }, []);

  const handleCredentialResponse = (response) => {
    console.log("Encoded JWT ID token: " + response.credential);
    // Handle user credential response here (e.g., send it to your backend)
  };

  return (
    <div>
      <div id="buttonDiv"></div> {/* Google sign-in button will be rendered here */}
    </div>
  );
};

export default GoogleSignIn;
