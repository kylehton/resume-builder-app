import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import './ResumeBox.css';

// Set the worker path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'; 

const ResumeBox = ({ resumeUrl }) => {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null); // Track the current render task

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

          // Cancel any previous rendering task
          if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
          }

          // Render the page, wrapping in try-catch to handle cancellation
          try {
            const renderContext = {
              canvasContext: context,
              viewport: scaledViewport,
            };
            const renderTask = page.render(renderContext);

            // Save the renderTask reference so we can cancel it later if needed
            renderTaskRef.current = renderTask;

            // Catch any cancellation error and suppress it
            renderTask.promise.catch((error) => {
              if (error.name !== 'RenderingCancelledException') {
                console.error('Render task failed: ', error);
              }
            });
          } catch (error) {
            console.error('Render task error:', error);
          }
        });
      });
    };

    if (resumeUrl) {
      renderPDF(resumeUrl);

      // Add a listener to adjust the canvas on window resize
      const handleResize = () => renderPDF(resumeUrl);
      window.addEventListener('resize', handleResize);

      // Clean up the event listener and cancel any ongoing rendering tasks
      return () => {
        window.removeEventListener('resize', handleResize);
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }
      };
    }
  }, [resumeUrl]);

  return (
    <div className="resumebox-container">
      {resumeUrl ? (
        <canvas ref={canvasRef} className="pdf-canvas"></canvas>
      ) : (
        <div className="resume-placeholder">
          <p>Your resume will be displayed here.</p>
        </div>
      )}
    </div>
  );
};

export default ResumeBox;