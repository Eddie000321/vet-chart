# Vet Chart - Animal Hospital EMR System

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Vet Chart is an Electronic Medical Records (EMR) system specifically designed for animal hospitals and veterinary clinics. It provides a comprehensive platform to manage patient and owner information, medical records, appointments, and offers insightful dashboard analytics to streamline clinic operations.

## Features

- **User Authentication**: Secure login system with different roles (veterinarian, staff, admin).
- **Dashboard Overview**: Personalized dashboards for clinic management and individual doctors, showing key statistics and quick actions.
- **Owner Management**: Full CRUD (Create, Read, Update, Delete) functionality for pet owners, including viewing their registered pets.
- **Patient Management**: Full CRUD functionality for animal patients, including managing their active/inactive status.
- **Medical Records**: Comprehensive management of medical records, including symptoms, diagnosis, treatment, and notes.
  - **PDF Generation**: Ability to print and download individual or multiple medical records as a combined PDF file.
- **Appointment Scheduling**: Create, view, edit, and manage appointments with various calendar views (day, week, month).
  - **Drag-and-Drop Rescheduling**: Easily reschedule appointments by dragging and dropping them in the weekly schedule.
  - **Business Hours Configuration**: Customizable clinic operating hours and appointment intervals.
- **Hospital Member Management**: View and manage staff and veterinarian details.
- **Clinic Analytics**: Overview of clinic performance, earnings, appointments, and doctor-specific statistics.

## Technologies Used

- **Frontend**:
  - React (JavaScript library for building user interfaces)
  - TypeScript (Superset of JavaScript that adds static types)
  - Vite (Fast development build tool)
  - Tailwind CSS (Utility-first CSS framework)
  - Lucide React (Icon library)
  - date-fns (Date utility library)
  - html2canvas & jspdf (For client-side PDF generation)
- **Backend**:
  - Node.js (JavaScript runtime environment)
  - Express.js (Web application framework)
  - bcryptjs (For password hashing)
  - jsonwebtoken (For user authentication)
  - cors (Middleware for enabling Cross-Origin Resource Sharing)
  - uuid (For generating unique IDs)
- **Database**:
  - PostgreSQL (Object-relational database system)
  - Prisma (Next-generation ORM for Node.js and TypeScript)

## Setup and Installation

To get the Vet Chart system up and running, follow these steps:

### Prerequisites

- Docker
- Docker Compose

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd vetchart-emr-system
```

### 2. Run with Docker Compose

```bash
docker-compose up -d
```

The application will be accessible at `http://localhost:5173`.

## Usage

Once the setup is complete, you can access the application through your web browser. The system provides an intuitive interface for managing all aspects of veterinary clinic operations.

## Contributing

We welcome contributions to improve Vet Chart! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is licensed under the MIT License.
