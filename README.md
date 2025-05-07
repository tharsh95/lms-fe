


          
# M32 Client Application

A modern educational content management system built with React, TypeScript, and Vite. This application provides a hierarchical structure for managing Classes (Subjects), Courses, and Assignments.

## 🚀 Features

- **Class Management**: Create and manage subject areas
- **Course Organization**: Structure courses within classes
- **Assignment Handling**: Create and track assignments
- **Protected Routes**: Secure authentication system
- **File Upload**: Support for course syllabus
## 🛠 Tech Stack

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Code Quality**: ESLint

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## 🚀 Getting Started
1. **Clone the Repository**
   ```bash
   git clone https://github.com/tharsh95/lms-fe.git

   ```
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   Access the application at `http://localhost:5173`

## 📁 Project Structure

```plaintext
src/
  ├── components/     # React components
  │   ├── auth/       # Authentication components
  │   ├── dashboard/  # Dashboard views
  │   └── ui/         # Reusable UI components
  ├── context/        # React context providers
  ├── services/       # API services
  ├── utils/          # Utility functions
  └── assets/         # Static assets
```

## 📚 Content Management Guide

### 1️⃣ Class (Subject) Management

Classes are the top-level organizational units:

1. Navigate to Classes dashboard
2. Click "Create New Class"
3. Fill required information:
   - Class Name
   - Description
   - Subject 
   - Grade
   - Section

### 2️⃣ Course Management

Courses exist within Classes:

1. Click "Create New Course"
2. Provide details:
   - Course Name
   - Subject
   - Description
   - Grade 
On filling the form, it is asked to upload a course syllabus or Generate using AI.

### 3️⃣ Assignment Management

Assignments belong to Courses:

1. Open desired Course
2. Select "Create Assignment"
3. Define parameters:
   - Title
   - Instructions
   - Due Date
   - Points/Grading Criteria
   - Attachments

## 💻 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```


## 🔒 Authentication

The application implements protected routes through the `AuthContext` provider. Users must authenticate to access content management features.

## 📤 File Upload

The `FileUpload` component manages file attachments for courses and assignments. Configure supported file types and size limits in the constants file.

## 🤝 Contributing

1. Create a feature branch
2. Implement changes
3. Submit a pull request


        
