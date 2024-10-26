
import React, { useState, useContext } from 'react';
import ChatBox from './Components/ChatBox';
import ResumeBox from './Components/ResumeBox';
import { NavbarContext } from './NavbarContext';
import { calculateProgress, getProgressMessage } from './BusinessLogic/ResumeLogic';
import ConfirmationModal from './Components/ConfirmationalModal';

import './Resume.css';

const Resume = () => {
    const { isNavbarOpen } = useContext(NavbarContext);
    const [resumeUrl, setResumeUrl] = useState(null);
    const [progress, setProgress] = useState(calculateProgress(1)); // Progress state
    const [progressMessage, setProgressMessage] = useState(getProgressMessage(1)); // Progress message state
    const [showModal, setShowModal] = useState(false); // Modal state
    const [isFinished, setIsFinished] = useState(false); // Track whether the user is done

  const handleResumeUpload = (url) => {
    setResumeUrl(url); // Update the resume URL in state
    setProgress(calculateProgress(3)); // Update progress for resume upload
    setProgressMessage(getProgressMessage(3)); // Set message for resume upload
  };

  const handleAiImprovements = () => {
    setProgress(calculateProgress(5)); // Progress after AI improvements
    setProgressMessage(getProgressMessage(5)); // Message after AI improvements
  };

  const handleDownload = () => {
    if (resumeUrl) {
        // Programmatic download logic
        const link = document.createElement('a');
        link.href = resumeUrl;
        link.download = 'resume.pdf'; // Set a default download filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Update progress and message
        setProgress(calculateProgress(7));
        setProgressMessage(getProgressMessage(7));

        // Show the modal asking if the user is finished
        setShowModal(true);
    } else {
        alert("No resume to download.");
    }
  };

  // Handlers for modal buttons
  const handleModalClose = () => setShowModal(false); // Close modal

  const handleYes = () => {
    setIsFinished(true); // Mark the resume as finished
    setShowModal(false); // Close the modal

    // Add further logic if needed, like asking if they want to save the resume
    console.log("User finished the resume.");
  };

  const handleNo = () => {
    setShowModal(false); // Close modal and continue working
  };

  // Handle progress updates from the ChatBox
  const handleAutoMessage = () => {
    setProgress(calculateProgress(2)); // Progress after auto message
    setProgressMessage(getProgressMessage(2)); // Message after auto message
  };

  return (
    <div className={`resume-page ${isNavbarOpen ? 'navbar-open' : 'navbar-closed'}`}>
      <div className="progress-bar-container" style={{ left: isNavbarOpen ? '202px' : '42px' }} /* Adjust the start position dynamically*/ >
        <div className="progress-bar" style={{ width: `${progress}%` }}>
          {progress}%
          <span className={`progress-message ${progress === 10 ? 'message-right' : progress === 20 ? 'message-flex' : progress < 50 ? 'text-right' : 'text-left'}`} style={{ width: '100%' }} >
            {progressMessage}
          </span>
        </div>
      </div>
      <ChatBox onResumeUpload={handleResumeUpload} onAutoMessage={() => setProgress(calculateProgress(2))} onDownloadClick={handleDownload} />
      <ResumeBox resumeUrl={resumeUrl} />

      {/* Show the modal if the user has downloaded the resume */}
      {showModal && <ConfirmationModal onClose={handleModalClose} onYes={handleYes} onNo={handleNo} resumeUrl={resumeUrl} />}
    </div>
  );
};

export default Resume;