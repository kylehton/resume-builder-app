import React from "react";
import { Link } from 'react-router-dom';
import "./Dashboard.css";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import PDFViewer from "./Components/PDFViewer";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip
);

const Dashboard = ({loadResumes, resumeList}) => {

    // Chart data
    const data = {
        labels: ['Without AI Improvement', 'With AI Improvement'],
        datasets: [
            {
                label: 'Job Success Rate',
                data: [40, 70],
                backgroundColor: ['#ff6384', '#36a2eb'],
                hoverBackgroundColor: ['#ff6384', '#36a2eb'],
                // Add the text on the bars
                datalabels: {
                    color: 'black',
                    font: {
                        weight: 'bold',
                        size: 16,
                    },
                    anchor: 'center',
                    align: 'center',
                    formatter: (value) => value + '%',
                }
            },
        ],
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            datalabels: { // For the data labels inside bars
                display: true,
            },
        },
    };

    const handleResumeClick = (resumeBlob) => {
        if (resumeBlob) {
            // Open the resume in a new tab
            const url = URL.createObjectURL(new Blob([new Uint8Array(resumeBlob)], { type: 'application/pdf'}));
            window.open(url, "_blank");
            URL.revokeObjectURL(url);
        } else {
            console.warn("No saved resume found to display.");
        }
    };

    return (
        <div className="dashboard-container">
            {/* Top Navbar */}
            <nav className="top-navbar">
                <div className="navbar-left">
                    <Link to='/'><h2>Resume App</h2></Link>
                </div>
                <div className="navbar-right">
                    <Link to="/dashboard" className="nav-link active">Dashboard</Link>
                    <Link to="/profile" className="nav-link">User Settings</Link>
                    <Link to="/" className="nav-link">Logout</Link>
                </div>
            </nav>

            {/* Main Dashboard Content */}
            <div className="dashboard-content">
                {/* Left Column */}
                <div className="left-column">
                    <div className="card resume-improvement">
                        <h3>Let's Work on Improving Your Resume</h3>
                        <Link to="/resume" className="resume-button">
                            Improve My Resume
                        </Link>
                    </div>

                    <div className="card chart-section">
                        <h3>AI Improvement Success Rates</h3>
                        <Bar data={data} options={options} />
                    </div>
                </div>

                {/* Right Column */}
                <div className="right-column">
                <br/><br/><br/><br></br>
                    <div className="center-content">
                        <h3>Your Past Resumes</h3>
                        <div className="resume-grid">
                            {resumeList.length > 0 ? (
                                resumeList
                                    .filter((resume) => resume.pdfBlob && resume.pdfBlob.data) // Filter resumes with non-empty pdfBlob
                                    .map((resume) => (
                                    <div  key={resume.id} onClick={() => handleResumeClick(resume.pdfBlob.data)}>
                                        <div className="resume-preview-container">
                                            {resume?.pdfBlob?.data && (
                                                
                                                <PDFViewer resumeBlob={resume.pdfBlob.data} />
                                            )}
                                            <div className="resume-overlay">
                                                <p>{`${resume.pdfName} - ${resume.dateUploaded}`}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-resumes-message">
                                    No saved resumes found. Start by uploading a resume!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;