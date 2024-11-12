import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import './PDFViewer.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

const PDFViewer = ({ resumeBlob }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const renderPDF = (blob) => {
      const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: "application/pdf" }));
      const loadingTask = pdfjsLib.getDocument(url);
      loadingTask.promise.then(pdf => {
        pdf.getPage(1).then(page => {
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');

          const viewport = page.getViewport({ scale: 0.5 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const renderContext = {
            canvasContext: context,
            viewport,
          };
          page.render(renderContext);
        });
      }).finally(() => {
        URL.revokeObjectURL(url);
      });
    };

    if (resumeBlob) {
      renderPDF(resumeBlob);
    }
  }, [resumeBlob]);

  return (
    <div className="pdfviewer-container">
      <canvas ref={canvasRef} className="pdfviewer-canvas"></canvas>
    </div>
  );
};

export default PDFViewer;