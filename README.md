# Vet Chart - Animal Hospital EMR System

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Demo Credentials](#demo-credentials)
- [Contributing](#contributing)
- [License](#license)

## Introduction
Vet Chart is an Electronic Medical Records (EMR) system specifically designed for animal hospitals and veterinary clinics. It provides a comprehensive platform to manage patient and owner information, medical records, appointments, and offers insightful dashboard analytics to streamline clinic operations.

## Features
-   **User Authentication**: Secure login system with different roles (veterinarian, staff, admin).
-   **Dashboard Overview**: Personalized dashboards for clinic management and individual doctors, showing key statistics and quick actions.
-   **Owner Management**: Full CRUD (Create, Read, Update, Delete) functionality for pet owners, including viewing their registered pets.
-   **Patient Management**: Full CRUD functionality for animal patients, including managing their active/inactive status.
-   **Medical Records**: Comprehensive management of medical records, including symptoms, diagnosis, treatment, and notes.
    -   **PDF Generation**: Ability to print and download individual or multiple medical records as a combined PDF file.
-   **Appointment Scheduling**: Create, view, edit, and manage appointments with various calendar views (day, week, month).
    -   **Drag-and-Drop Rescheduling**: Easily reschedule appointments by dragging and dropping them in the weekly schedule.
    -   **Business Hours Configuration**: Customizable clinic operating hours and appointment intervals.
-   **Hospital Member Management**: View and manage staff and veterinarian details.
-   **Clinic Analytics**: Overview of clinic performance, earnings, appointments, and doctor-specific statistics.

## Technologies Used
-   **Frontend**:
    -   React (JavaScript library for building user interfaces)
    -   TypeScript (Superset of JavaScript that adds static types)
    -   Vite (Fast development build tool)
    -   Tailwind CSS (Utility-first CSS framework)
    -   Lucide React (Icon library)
    -   date-fns (Date utility library)
    -   html2canvas & jspdf (For client-side PDF generation)
-   **Backend**:
    -   Node.js (JavaScript runtime environment)
    -   Express.js (Web application framework)
    -   bcryptjs (For password hashing)
    -   jsonwebtoken (For user authentication)
    -   cors (Middleware for enabling Cross-Origin Resource Sharing)
    -   uuid (For generating unique IDs)
    -   In-memory database (For demonstration purposes)

## Setup and Installation

To get the Vet Chart system up and running, follow these steps:

### Prerequisites
-   Node.js (v18 or higher recommended)
-   npm (Node Package Manager) or Yarn
-   Supabase account (free tier available)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd vetchart-emr-system
```

### 2. Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to Settings > API
3. Copy your project URL and anon public key
4. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
5. Update the `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
In your Supabase dashboard, go to the SQL Editor and run the following SQL to create the necessary tables:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  roles TEXT[] DEFAULT ARRAY['staff'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create owners table
CREATE TABLE owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  weight DECIMAL NOT NULL,
  weight_unit TEXT DEFAULT 'lbs',
  owner_id UUID REFERENCES owners(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical_records table
CREATE TABLE medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  record_type TEXT NOT NULL,
  symptoms TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NOT NULL,
  notes TEXT,
  veterinarian TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  duration INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  veterinarian TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow authenticated users to access all data)
CREATE POLICY "Allow authenticated users" ON profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users" ON owners FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users" ON patients FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users" ON medical_records FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users" ON appointments FOR ALL TO authenticated USING (true);

-- Create demo users (you'll need to sign up with these emails first)
-- Then run this to set their profiles:
-- INSERT INTO profiles (id, first_name, last_name, roles)
-- VALUES 
--   ('user-id-from-auth-users', 'J', 'Han', ARRAY['veterinarian', 'admin']),
--   ('user-id-from-auth-users', 'J', 'Lee', ARRAY['staff']);
```

### 4. Frontend Setup
Install dependencies and start the development server:
```bash
npm install
npm run dev
```
The application will open in your browser at `http://localhost:5173`.

### 5. Create Demo Users
1. Go to your running application and try to sign up with these emails:
   - admin@vetchart.com
   - staff@vetchart.com
2. After signing up, go to your Supabase dashboard > Authentication > Users
3. Copy the user IDs and update the profiles table with the demo data

## Usage
Once the setup is complete, you can access the application through your web browser. The system provides an intuitive interface for managing all aspects of veterinary clinic operations.

## Demo Credentials
After setting up the demo users, you can use these credentials:

**Veterinarian (Admin Role):**
- Email: admin@vetchart.com
- Password: password

**Staff:**
- Email: staff@vetchart.com
- Password: password

## Contributing
We welcome contributions to improve Vet Chart! Please feel free to submit issues, feature requests, or pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.