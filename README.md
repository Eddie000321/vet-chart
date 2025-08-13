# 🏥 VetChart EMR System

> **A full-stack Electronic Medical Records (EMR) system built for veterinary clinics**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

## Overview

https://github.com/user-attachments/assets/47b17f21-94da-4dab-8e8c-6eb4d71cba43

VetChart is a comprehensive, production-ready Electronic Medical Records (EMR) system designed for veterinary clinics. This full-stack web application demonstrates modern software development practices, clean architecture, and enterprise-level features.

## 🚀 Key Features & Technical Highlights

### 🏗️ **Full-Stack Architecture**
-   **Appointment Management:** Calendar-based scheduling system with real-time updates
-   **Patient Management:** Comprehensive patient profiles with medical history tracking
-   **Owner Management:** Customer relationship management with pet associations
-   **Billing System:** Invoice generation with itemized billing and payment status tracking
-   **Medical Records:** Complete record-keeping with search, filtering, and audit trails
-   **Authentication & Authorization:** JWT-based secure login with role-based access control
-   **Analytics Dashboard:** Real-time clinic performance metrics and revenue tracking

### 💡 **Technical Achievements**
-   **Type-Safe Development:** End-to-end TypeScript implementation
-   **RESTful API Design:** Clean, scalable backend architecture with proper error handling
-   **Component-Driven UI:** Reusable React components with consistent design system
-   **Database Design:** Normalized PostgreSQL schema with proper relationships and constraints
-   **Containerized Development:** Docker-based development environment for consistency
-   **Modern Build Tools:** Vite for lightning-fast development and optimized production builds

## 🛠️ Technology Stack

### **Frontend Development**
-   **React 18** - Modern functional components with hooks and Context API
-   **TypeScript** - Static type checking for enhanced code quality
-   **Vite** - Next-generation build tool with HMR and optimized bundling
-   **Tailwind CSS** - Utility-first CSS framework for responsive design
-   **Lucide React** - Modern icon library

### **Backend Development**
-   **Node.js & Express.js** - Lightweight, fast REST API server
-   **Prisma ORM** - Type-safe database client with automated migrations
-   **JWT Authentication** - Secure token-based authentication
-   **bcryptjs** - Industry-standard password hashing

### **Database & Infrastructure**
-   **PostgreSQL** - Production-grade relational database
-   **Docker & Docker Compose** - Containerized development and deployment
-   **API Proxy Configuration** - Seamless frontend-backend integration

### **Development Tools**
-   **ESLint** - Code linting and style enforcement
-   **PostCSS** - CSS processing and optimization
-   **Concurrently** - Run multiple development servers simultaneously

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

## 🖥️ Demo & Screenshots

Once the application is running, open your web browser and navigate to the address provided by the frontend development server (e.g., `http://localhost:5173`). You should see the VetChart login page.

### Application Flow
1. **Authentication**: Secure login with role-based dashboard access
2. **Dashboard**: Overview of daily appointments, patient statistics, and quick actions
3. **Patient Management**: Add/edit patient profiles with comprehensive medical history
4. **Appointment Scheduling**: Calendar-based booking with conflict detection
5. **Medical Records**: Create detailed treatment records with PDF export capability
6. **Billing System**: Generate invoices with customizable item templates
7. **Analytics**: Track clinic performance with revenue and appointment metrics

### User Roles & Permissions
- **Admin**: Full system access including analytics and user management
- **Veterinarian**: Patient records, appointments, and medical documentation
- **Staff**: Appointment scheduling, billing, and basic patient information

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


## 🎯 Development Experience & Learning Outcomes

This project demonstrates proficiency in:

### **Full-Stack Development**
- **Frontend Architecture**: Component-based design with React hooks and context patterns
- **Backend API Design**: RESTful endpoints with proper error handling and validation
- **Database Management**: Schema design, relationships, and query optimization
- **Authentication Flow**: Secure user sessions with JWT and role-based permissions

### **Modern Development Practices**
- **Type Safety**: Comprehensive TypeScript implementation across frontend and backend
- **Code Quality**: ESLint configuration and consistent code standards
- **Version Control**: Git workflow with meaningful commit messages
- **Containerization**: Docker setup for consistent development environments

### **Problem-Solving & Architecture**
- **Data Modeling**: Designed normalized database schema for complex healthcare relationships
- **State Management**: Implemented efficient state patterns for user authentication and data flow
- **API Integration**: Created centralized service layer for clean separation of concerns
- **Performance Optimization**: Implemented lazy loading and optimized bundle splitting

### **Industry-Relevant Skills**
- **Healthcare Domain Knowledge**: Understanding of EMR requirements and compliance considerations
- **Scalable Architecture**: Monorepo structure with clear separation between frontend and backend
- **Production Readiness**: Docker containerization and environment configuration
- **User Experience**: Responsive design with intuitive workflows for healthcare professionals

## 🔗 Links & Contact

- **Live Demo**: *(Add your deployed application URL here)*
- **Portfolio**: *(Add your portfolio website)*
- **LinkedIn**: *(Add your LinkedIn profile)*
- **Email**: *(Add your professional email)*

---

## Contributing

Contributions are welcome! Please see the `CONTRIBUTING.md` for details on how to contribute.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
