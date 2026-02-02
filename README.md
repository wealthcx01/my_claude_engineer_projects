# Pomodoro Timer App

A productivity timer application built with work/break cycles to help users maintain focus and manage their time effectively.

## Project Overview

The Pomodoro Technique is a time management method that uses a timer to break work into focused intervals separated by short breaks. This application provides a modern, intuitive interface for implementing this technique.

## Features

- **Timer Display with countdown and progress ring** - Visual representation of time remaining with an animated progress indicator
- **Timer Controls (Start, Pause, Reset, Skip)** - Full control over the timer with intuitive button controls
- **Session Types (Work, Short Break, Long Break rotation)** - Automatic cycling through 25-minute work sessions, 5-minute short breaks, and 15-minute long breaks
- **Session Counter with persistence** - Tracks the number of completed sessions and saves progress across browser sessions
- **Audio notification on completion** - Audible alert when a session ends to notify the user

## Tech Stack

To be determined during development. Will likely include:
- Frontend framework (React/Vue/Svelte)
- Styling solution (Tailwind CSS/CSS Modules)
- State management
- Testing framework

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/wealthcx01/my_claude_engineer_projects.git
cd my-first-project
```

2. Run the initialization script:
```bash
bash init.sh
```

This will check for dependencies, install them, and start the development server.

### Manual Setup

If you prefer to set up manually:

```bash
npm install
npm run dev
```

## Development

For development instructions and workflow, see `init.sh` for setup and common development commands.

## Project Structure

```
my-first-project/
├── README.md
├── init.sh
├── .gitignore
├── package.json
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── Timer.tsx
│   │   ├── Controls.tsx
│   │   └── SessionCounter.tsx
│   └── utils/
└── public/
```

## License

MIT
