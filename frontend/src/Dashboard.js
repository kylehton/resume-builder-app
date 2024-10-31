import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import "./Dashboard.css";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ResumeBox from "./Components/ResumeBox";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip
);

const Dashboard = () => {
    const [savedResumes, setSavedResumes] = useState([]);

    useEffect(() => {
        // Get saved resumes from Local Storage when the dashboard Loads
        const resumes = JSON.parse(localStorage.getItem('savedResumes')) || [];
        setSavedResumes(resumes);
    }, []);

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

    const handleResumeClick = (url) => {
        if (url) {
            // Open the resume in a new tab
            window.open(url, "_blank");
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
                    <h3>Your Past Resumes</h3>
                    <div className="resume-grid">
                        {/* Disabled for now because the new routing breaks the saving path,
                    1. Pulling saved resumes from a database could fix this, or
                    2. coming up with another idea that prevents dashboard from initially looking
                    for a saved resume when a use first visits the dashboard
                    */}
                        {/*{/*savedResumes.length > 0 ? (
                            savedResumes.map(resume => (
                                <div className="resume-card" key={resume.id} onClick={() => handleResumeClick(resume.url)} >
                                    <ResumeBox resumeUrl={resume.url} />
                                    <div className="resume-overlay">
                                        <p>{`${resume.name} - ${resume.date}`}</p>
                                    </div>
                                </div>
                            ))
                        ) : (*/}
                            <div className="no-resumes-message">
                                No saved resumes found. Start by uploading a resume!
                            </div>
                        {/*)}*/}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;