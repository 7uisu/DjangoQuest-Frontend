# DjangoQuest Frontend

This is the frontend portal for DjangoQuest, built with React, Vite, and Material-UI (MUI). It features interactive dashboards for Students, Teachers, and Admins.

## How the Projects Connect
This platform has three main parts that work together:
1. **Frontend Web Portal (This Repository)**: The website dashboard where you log in.
2. **[Backend API Server](https://github.com/7uisu/DjangoQuest-Backend.git)**: The core database. The website needs this running so it can fetch data.
3. **[Godot Game Client](https://github.com/7uisu/djangoquest_capstone_godot_project_revision.git)**: The 3D game itself.

## Prerequisites
- Node.js (v18+ recommended)
- The [DjangoQuest Backend](../DjangoQuest-Backend) must be running locally on port `8000` for API requests to work.

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/7uisu/DjangoQuest-Frontend.git
   cd DjangoQuest-Frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   *Note: If you are using `yarn` or `pnpm`, run their respective install commands.*

3. **Settings and .env files**
   Unlike the backend, the website connects to `http://localhost:8000` automatically. You do NOT usually need a `.env` file just to run it locally. Just make sure you started the backend server first! If later on you add secret keys (like Google Analytics), you would put them in a `.env` file here.

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173/`).
