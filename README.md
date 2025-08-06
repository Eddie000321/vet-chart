# VetChart EMR System

VetChart is a comprehensive Electronic Medical Records (EMR) system designed for veterinary clinics. It provides tools for managing appointments, patient records, billing, and clinic performance.

## Overview


https://github.com/user-attachments/assets/47b17f21-94da-4dab-8e8c-6eb4d71cba43




## Features

-   **Appointment Management:** Schedule, view, and edit appointments.
-   **Patient Management:** Create and manage patient profiles, including medical history.
-   **Owner Management:** Keep track of pet owners and their associated pets.
-   **Billing:** Generate and manage bills for services.
-   **Medical Records:** Create, view, and update patient medical records.
-   **Authentication:** Secure user login.
-   **Clinic Dashboard:** Overview of clinic performance and statistics.

## Technologies Used

**Frontend:**

-   React
-   TypeScript
-   Vite
-   Tailwind CSS

**Backend:**

-   Node.js
-   Express.js
-   Prisma (ORM)

**Database:**

-   PostgreSQL

**Other:**

-   Docker & Docker Compose

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

-   Node.js (LTS version recommended)
-   npm (comes with Node.js) or Yarn
-   Docker Desktop (includes Docker Compose)

## Installation

Follow these steps to get the VetChart EMR System up and running on your local machine.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Eddie000321/vet-chart.git
    cd vet-chart
    ```

2.  **Set up the Backend and Database:**

    Navigate to the `server` directory and install dependencies:

    ```bash
    cd server
    npm install
    ```

    Start the database and backend services using Docker Compose. This will also build the backend Docker image.

    ```bash
    docker-compose up -d
    ```

    Run Prisma migrations to set up your database schema:

    ```bash
    npx prisma migrate dev --name init
    ```

    Return to the project root directory:

    ```bash
    cd ..
    ```

3.  **Set up the Frontend:**

    Install frontend dependencies:

    ```bash
    npm install
    ```

## Running the Application

To run the full-stack application (frontend and backend):

```bash
npm run dev:full
```

This command will concurrently start both the backend server (on `http://localhost:3001`) and the frontend development server (typically on `http://localhost:5173`).

Alternatively, you can run them separately:

**Run Backend Only:**

```bash
cd server
npm run dev
```

**Run Frontend Only:**

```bash
npm run dev
```

## Usage

Once the application is running, open your web browser and navigate to the address provided by the frontend development server (e.g., `http://localhost:5173`). You should see the VetChart login page.

## Project Structure

```
vet-chart/
├───server/             # Backend (Node.js, Express.js, Prisma)
│   ├───prisma/         # Prisma schema and migrations
│   └───...
├───src/                # Frontend (React, TypeScript)
│   ├───components/     # Reusable UI components
│   ├───contexts/       # React Contexts
│   ├───hooks/          # Custom React hooks
│   ├───lib/            # Utility functions
│   ├───services/       # API service integrations
│   ├───types/          # TypeScript type definitions
│   └───...
├───public/             # Static assets
├───...
└───docker-compose.yml  # Docker Compose configuration
```
## Database Structure(img need update)
<img width="1085" height="1168" alt="Screenshot 2025-07-31 at 9 35 35 PM" src="https://github.com/user-attachments/assets/22581ff2-84d5-4747-bd71-33e28c387163" />


## Contributing

Contributions are welcome! Please see the `CONTRIBUTING.md` for details on how to contribute.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
