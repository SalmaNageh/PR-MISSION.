
# PR MISSION × ENACTUS

A learning platform designed to organize Public Relations (PR) training sessions and help team members explore educational content in one place.

## About the Project

PR MISSION is a web-based platform created to support PR team learning through structured sessions, learning materials, and quizzes. It provides an organized way for members to access session content and review their understanding of key PR concepts.

## Features

- **Training Sessions:** Organized cards for PR learning sessions.
- **Learning Materials:** Access to session PDFs and presentation previews.
- **Interactive Quizzes:** Test understanding of the session content.
- **Clean Interface:** A visual identity built around the PR MISSION × ENACTUS theme.
- **Modular Structure:** Session content is managed separately from the React components.

## Current Learning Sessions

- Introduction to Public Relations
- PR UNLOCKED
- Money Behind The Scene

*Additional sessions can be added as their learning materials become available.*

## Tech Stack

- React
- JavaScript
- CSS
- Vite
- Git & GitHub

## Project Structure

```text
PR-MISSION-APP/
├── public/
│   └── pdfs/
├── src/
│   ├── components/
│   │   ├── PRSessions.jsx
│   │   └── PRSessions.css
│   ├── data/
│   │   └── prSessions.js
│   └── App.jsx
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed.

### Installation

1. Clone the repository:

   ```bash
   git clone <YOUR_GITHUB_REPOSITORY_URL>
   ```

2. Navigate to the project folder:

   ```bash
   cd PR-MISSION-APP
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in your terminal, usually:

   ```text
   http://localhost:5173/
   ```

## Adding a New Session

1. Add the session details to `src/data/prSessions.js`.
2. Place the relevant PDF files inside `public/pdfs/`.
3. Update `src/components/PRSessions.jsx` if a new preview or display condition is required.
4. Add or update the quiz questions for the session.

## Contributing

Contributions and improvements are welcome. Keep session content organized and ensure that learning materials and quizzes match the relevant training session.

## License

No license has been specified for this project yet.
