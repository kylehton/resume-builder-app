
// ResumeLogic.js
export const calculateProgress = (step) => {
    // Each step corresponds to a certain percentage of completion
    const steps = {
        1: 10,  // Viewing the site
        2: 20,  // Chat asks to upload resume
        3: 40,  // User uploads resume
        4: 60,  // User asks for AI improvements
        5: 80,  // AI shows improvements
        6: 90,  // User happy with resume, clicked finished
        7: 100  // Resume downloaded
    };
    return steps[step] || 0;
};

export const getProgressMessage = (step) => {
    const messages = {
        1: 'Welcome! Let’s start by uploading your resume.',
        2: 'Please upload your resume to begin.',
        3: 'Resume uploaded! Now, ask AI for improvements.',
        4: 'Awaiting AI suggestions...',
        5: 'AI suggestions ready! Review your new resume.',
        6: 'Download your improved resume now!.',
        7: 'Resume Downloaded, Congrats!'
    };
    return messages[step] || 'Welcome!';
};
