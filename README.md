# Inkwell Frontend

Inkwell is a web-based comic generation and storytelling platform. This repository contains the frontend code for the Inkwell project, built using *Vite* and *Vue.js*.

## Screenshot
![Inkwell UI](path/to/screenshot.png)

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Backend Repository](#backend-repository)
- [Contributing](#contributing)
- [License](#license)

## Features
- Interactive and dynamic user interface for comic creation.
- Image generation using StableDiffusion (integrated with the backend).
- Organized project structure with reusable components.
- API integration for seamless communication with the backend.

## Tech Stack
- *Frontend*: Vite, Vue.js, JavaScript
- *Routing*: Vue Router
- *API Communication*: Axios

## Project Structure

inkwell-frontend/
├── eslint.config.js
├── index.html
├── jsconfig.json
├── package.json
├── package-lock.json
├── public
│   ├── favicon.ico
│   └── favicon.png
├── README.md
├── src
│   ├── App.vue
│   ├── assets
│   │   ├── base.css
│   │   ├── images
│   │   │   ├── auth
│   │   │   │   ├── cloud-bg.jpg
│   │   │   │   └── kid-pencil.jpg
│   │   │   ├── comics
│   │   │   │   ├── thumbnail-1.jpg
│   │   │   │   └── thumbnail-2.jpg
│   │   │   ├── dashboard
│   │   │   │   ├── comic.png
│   │   │   │   ├── create-story.png
│   │   │   │   ├── progress.png
│   │   │   │   └── writing-tips.png
│   │   │   └── home
│   │   │       ├── hero-image-darkened.jpg
│   │   │       └── hero-image.jpg
│   │   ├── logo.svg
│   │   └── styles
│   │       ├── main.css
│   │       ├── transitions.scss
│   │       └── _variables.scss
│   ├── components
│   │   └── Navigation.vue
│   ├── layouts
│   │   └── DefaultLayout.vue
│   ├── main.js
│   ├── router
│   │   ├── guards.js
│   │   └── index.js
│   ├── services
│   │   ├── apiClient.js
│   │   └── authService.js
│   ├── stores
│   │   ├── assessmentStore.js
│   │   ├── storyStore.js
│   │   └── userStore.js
│   ├── utils
│   │   └── auth_utils.js
│   └── views
│       ├── AssessmentIntro.vue
│       ├── AssessmentQuestion.vue
│       ├── ComicDetail.vue
│       ├── Comics.vue
│       ├── CreateStory.vue
│       ├── Dashboard.vue
│       ├── HomeView.vue
│       ├── LoginView.vue
│       ├── Progress.vue
│       ├── SignupView.vue
│       ├── StoryPicture.vue
│       ├── WritingTips.vue
│       └── WritingTipView.vue
└── vite.config.js



## Installation
To set up the frontend locally, follow these steps:

### Prerequisites
- Node.js (>= 16.x)
- npm or yarn

### Steps
1. Clone the repository:
   sh
   git clone https://github.com/Olooce/inkwell-V2.0.git
   
2. Navigate into the project directory:
   sh
   cd inkwell-frontend
   
3. Install dependencies:
   sh
   npm install
   
   or
   sh
   yarn install
   

## Usage
To start the development server, run:
sh
npm run dev

or
sh
yarn dev

The app will be available at http://localhost:5173/ (default Vite port).

## Environment Variables
Create a .env file in the root directory and define the required environment variables:

VITE_API_BASE_URL=http://localhost:8000/api

Replace http://localhost:8000/api with the actual backend URL.

## Backend Repository
The backend repository for Inkwell can be found here:
[Inkwell Backend](https://github.com/Olooce/inkwell-backend-V2.0)

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch (feature-branch-name).
3. Make your changes and commit them.
4. Push to your fork and submit a pull request.

## License
This project is licensed under the *MIT License*. See [LICENSE](LICENSE) for details.

---
Feel free to suggest improvements or report issues!