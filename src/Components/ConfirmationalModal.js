import React from 'react';
import './ConfirmationalModal.css';
import { useNavigate } from 'react-router-dom';

const ConfirmationModal = ({ onClose, onNo, resumeUrl }) => {
  const navigate = useNavigate();

  const handleYesClick = () => {
    // Get existing saved resumes or initialize an empty array
    //let savedResumes = JSON.parse(localStorage.getItem('savedResumes')) || [];

    // Clear existing saved resumes
    localStorage.removeItem('savedResumes');

    // Add the current resume details (URL, timestamp, and name) 
    const currentDate = new Date().toLocaleDateString('en-US');
    const newResume= [{
      url: resumeUrl,
      name: `Resume 1`,
      date: currentDate
    }];

    // Save the updated array back to Local Storage
    localStorage.setItem('savedResumes', JSON.stringify(newResume));

    // Navigate to the /dashboard for the current user when the user clicks "Yes"
    navigate('/dashboard');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Are you finished working on this resume?</h2>
        <div className="modal-buttons">
          <button onClick={onNo} className="modal-no-btn">No, Continue Working</button>
          <button onClick={handleYesClick} className="modal-yes-btn">Yes, I'm Finished</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;