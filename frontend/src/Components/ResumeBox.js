import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import './ResumeBox.css';

// Set the worker path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'; 

const ResumeBox = ({ resumeUrl, pdfBlob, pdfName }) => {
  const canvasRef = useRef(null);
  const [processedText, setProcessedText] = useState(null); // Store processed text here
  const [processing, setProcessing] = useState(false); // Track API call status
  // Use the pdfName directly as the localStorage key
  const localStorageKey = `${pdfName}_processed_text`;
  
  // Render the initial uploaded resume
  useEffect(() => {
    const renderPDF = (url) => {
      const loadingTask = pdfjsLib.getDocument(url);
      loadingTask.promise.then(pdf => {
        pdf.getPage(1).then(page => {
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');

          // Calculate the scale based on the container width
          const containerWidth = canvas.parentElement.offsetWidth;
          const viewport = page.getViewport({ scale: 1.22 }); // Start with a base scale

          // Adjust the scale to fit within the container
          const scale = containerWidth / viewport.width;
          const scaledViewport = page.getViewport({ scale });

          // Set canvas size
          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;

          // Render the page
          const renderContext = {
            canvasContext: context,
            viewport: scaledViewport,
          };
          page.render(renderContext);
        });
      });
    };

    if (resumeUrl) {
      renderPDF(resumeUrl);
    }
  }, [resumeUrl]);

  // This handles the agent api or what happens 
  //when the uploaded resume goes through mohameds agent
  const handleProcessResume = async () => {
    if (!pdfBlob) {
      console.error("No PDF file available for processing.");
      return;
    }

    setProcessing(true);

    try {

      
      // Clear any existing processed resume text from local storage
      localStorage.removeItem(localStorageKey);
      console.log("Local storage cleared for processed text.");

      const formData = new FormData();
      formData.append("", pdfBlob, pdfName);
      console.log("pdfName",pdfName);
      console.log("pdfBlob",pdfBlob);

      const response = await fetch(
        "https://resumeappbackendflask-50f7520726a3.herokuapp.com/process_resume",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        console.error("API call failed with status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        setProcessing(false);
        return;
      }

      const plainText = await response.text();
      console.log("API Response:", plainText);

      // Save the processed text to localStorage
      localStorage.setItem(localStorageKey, plainText);

      // Set the processed text in the component state
      setProcessedText(plainText);
      alert(`The processed resume text has been saved locally as ${localStorageKey}`);
    } catch (error) {
      console.error("Error processing resume:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReRenderFromLocalStorage = () => {
    const storedText = localStorage.getItem(localStorageKey);
    if (storedText) {
      setProcessedText(storedText); // Update state with the stored processed text
  
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
  
        // Get the container width (this is the parent element of the canvas)
        const containerWidth = canvas.parentElement.offsetWidth;
  
        // Create a virtual "viewport" based on the base scale
        const viewport = { width: 800, height: 1000 }; // Virtual size for consistency
        const scale = containerWidth / viewport.width;
  
        // Apply scale to the viewport
        const scaledWidth = viewport.width * scale;
        const scaledHeight = viewport.height * scale;
  
        // Set the canvas size based on the scaled dimensions
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
  
        // Apply scaling to the canvas context
        context.setTransform(scale, 0, 0, scale, 0, 0);
  
        // Clear the canvas before rendering new content
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the off-white background
        context.fillStyle = "#ffffff"; // Slightly off-white color
        context.fillRect(0, 0, canvas.width, canvas.height);
  
        // Define margins, header, and footer areas
        const marginTop = 10; // Top margin
        const marginBottom = 20; // Bottom margin
        const marginLeft = 50; // Left margin
        const marginRight = 20; // Right margin
        const headerHeight = 20; // Height for the header area
        const footerHeight = 20; // Height for the footer area
        const contentHeight = canvas.height - marginTop - marginBottom - headerHeight - footerHeight;
  
        // Set up text rendering parameters
        const lineHeight = 4.33; // Space between lines, more specifically the space between headers and titles
        const headerFontSize = 14; // Font size for header
        const bodyFontSize = 12; // Font size for body text
        const charLimit = 133; // Maximum characters per line
        const maxWidth = scaledWidth - marginLeft - marginRight; // Max width for wrapped text
        let yPosition = marginTop + headerHeight;
  
        // Helper function for word wrapping
        const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
          let remainingText = text;
  
          while (remainingText.length > 0) {
            let line = remainingText.slice(0, charLimit);
  
            // Check for natural break (space near the char limit)
            const lastSpaceIndex = line.lastIndexOf(' '); 
            if (lastSpaceIndex > -1 && remainingText.length > charLimit) {
              line = line.slice(0, lastSpaceIndex);
            }
  
            ctx.fillText(line, x, y);
            y += lineHeight + 8; // sets the spacing for drop down next lines like the professional summary
  
            remainingText = remainingText.slice(line.length).trim();
  
            // Prevent overflow in the content area
            if (y > marginTop + headerHeight + contentHeight) {
              console.error('Text overflowed the content area!');
              return;
            }
          }
          return y;
        };
  
        // Render header (e.g., document title)
        context.font = `bold ${headerFontSize}px Arial`;
        context.fillStyle = 'blue';
        wrapText(context, marginLeft, yPosition, maxWidth, lineHeight);
        yPosition += lineHeight; // Extra spacing after header
  
        // Render the main content (body text)
        context.font = `${bodyFontSize}px Arial`;
        context.fillStyle = 'black';
  
        const paragraphs = storedText.split('\n');
        paragraphs.forEach((paragraph) => {
          yPosition = wrapText(context, paragraph, marginLeft, yPosition, maxWidth, lineHeight);
  
          // Add spacing between paragraphs
          yPosition += lineHeight -1.5;
        });
  
        // Render footer
        yPosition = canvas.height - marginBottom - footerHeight;
        context.font = `italic ${bodyFontSize}px Arial`;
        context.fillStyle = 'grey';
        context.fillText('Page 1 of 1', marginLeft , yPosition); // Example footer text
      }
    } else {
      console.error('No stored text found in localStorage.');
    }
  };

  return (
    <div className="resumebox-container">
      {resumeUrl ? (
        <>
        {/* Resume canvas */}
        <canvas ref={canvasRef} className="pdf-canvas"></canvas>

        {/* Button to trigger text removal */}
        <button onClick={handleProcessResume} disabled={processing}>
          {processing ? "Processing..." : "Process Resume"}
        </button>

        {/* Button to trigger re-rendering from localStorage text */}
        <button onClick={handleReRenderFromLocalStorage} disabled={processing}>
            Re-render from LocalStorage
        </button>

        </>
      ) : (
        <div className="resume-placeholder">
          <p>Your resume will be displayed here.</p>
        </div>
      )}
    </div>
  );
};

export default ResumeBox;