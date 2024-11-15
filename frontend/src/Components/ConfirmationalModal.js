import React from 'react';
import './ConfirmationalModal.css';
import { useNavigate } from 'react-router-dom';

const ConfirmationModal = ({ onClose, onNo, resumeUrl, pdfName, saveResumeToDB }) => {
  const navigate = useNavigate();
 // changed handleYesClick 11/14, doesnt need local storage anymore
  const handleYesClick = async () => {
    // Try accessing the saving of resume to the database.
    try{
      await saveResumeToDB();
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving resume:", error);
    }
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