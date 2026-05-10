# DjangoQuest Frontend

This is the frontend portal for DjangoQuest, built with React, Vite, and Material-UI (MUI). It features interactive dashboards for Students, Teachers, and Admins.

## Prerequisites
- Node.js (v18+ recommended)
- The [DjangoQuest Backend](../DjangoQuest-Backend) must be running locally on port `8000` for API requests to work.

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd DjangoQuest-Frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   *Note: If you are using `yarn` or `pnpm`, run their respective install commands.*

3. **Configuration**
   The application is configured using `vite.config.ts` to automatically proxy all API calls (e.g., `/api/users/`, `/api/admin/`) to `http://localhost:8000`. As long as the Django backend server is running, no extra `.env` configuration is required for basic local connection.

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173/`).
