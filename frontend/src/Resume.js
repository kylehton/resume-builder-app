
import React, { useState, useContext } from 'react';
import ChatBox from './Components/ChatBox';
import ResumeBox from './Components/ResumeBox';
import { NavbarContext } from './NavbarContext';
import { calculateProgress, getProgressMessage } from './BusinessLogic/ResumeLogic';
import ConfirmationModal from './Components/ConfirmationalModal';
import Datasource from './BusinessLogic/Datasource';

import './Resume.css';

const Resume = () => {
    const { isNavbarOpen } = useContext(NavbarContext);
    const [resumeUrl, setResumeUrl] = useState(null);
    const [progress, setProgress] = useState(calculateProgress(1)); // Progress state
    const [progressMessage, setProgressMessage] = useState(getProgressMessage(1)); // Progress message state
    const [showModal, setShowModal] = useState(false); // Modal state
    const [isFinished, setIsFinished] = useState(false); // Track whether the user is done
    const [pdfName, setPdfName] = useState("resume.pdf"); // Tracks the name of the file 11/14
    const [pdfUserId, setPdfUserId] = useState(1);
    const [dateUploaded, setDateUploaded] = useState("11/14/2024");
    const [pdfBlob, setPdfBlob] = useState(null);
    const currentDate = new Date().toLocaleDateString('en-us');

  const handleResumeUpload = async (url, pdfName) => {
    setResumeUrl(url); // Update the resume URL in state
    setPdfName(pdfName); // Store the actual file name 11/14
    setPdfUserId(1); // needs to be changed later when we have user management 11/14
    setDateUploaded(currentDate);
    setProgress(calculateProgress(3)); // Update progress for resume upload
    setProgressMessage(getProgressMessage(3)); // Set message for resume upload

    // Fetch and store the blob changed on 11/14
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      setPdfBlob(blob); // Store the blob directly
    } catch (error) {
        console.error("Error fetching blob:", error);
    }
  };

  /*
  const handleAiImprovements = () => {
    setProgress(calculateProgress(5)); // Progress after AI improvements
    setProgressMessage(getProgressMessage(5)); // Message after AI improvements
  };
  */

  // now works 11/14
  const saveResumeToDB = async () => {

    try {
      const formData = new FormData();
      formData.append('pdfUserId', pdfUserId);
      formData.append('pdfName', pdfName);
      formData.append('dateUploaded', dateUploaded);
      formData.append('pdfBlob', pdfBlob, pdfName); // Attach the blob as a file

      await Datasource.post('/upload', formData, {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      });
      console.log("Resume saved to DB successfully");
      console.log(pdfUserId);
      console.log(pdfName);
      console.log(dateUploaded);
      console.log(pdfBlob);
    } catch (error) {
      console.error("Failed to save resume to DB:", error);
    }
  };

  const handleDownload = () => {
    if (resumeUrl) {
        // Programmatic download logic
        const link = document.createElement('a');
        link.href = resumeUrl;
        link.download = pdfName; // Set the actual filename 11/14
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

  const handleYes = async () => {
    setIsFinished(true); // Mark the resume as finished
    setShowModal(false); // Close the modal
    await saveResumeToDB();
    // Add further logic if needed, like asking if they want to save the resume
    if (isFinished)
      console.log("User finished the resume.");
  };

  const handleNo = () => {
    setShowModal(false); // Close modal and continue working
  };

  // Handle progress updates from the ChatBox
  /*
  const handleAutoMessage = () => {
    setProgress(calculateProgress(2)); // Progress after auto message
    setProgressMessage(getProgressMessage(2)); // Message after auto message
  };
  */

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
      <ResumeBox resumeUrl={resumeUrl} pdfBlob={pdfBlob} pdfName={pdfName} />

      {/* Show the modal if the user has downloaded the resume */}
      {showModal && <ConfirmationModal onClose={handleModalClose} onYes={handleYes} onNo={handleNo} resumeUrl={resumeUrl} pdfName={pdfName} saveResumeToDB={saveResumeToDB} />}
    </div>
  );
};

export default Resume;