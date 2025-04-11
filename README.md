
# Project Management System for Construction

A comprehensive web application for managing construction projects, systems, subsystems, ITRs (Inspection and Test Records), and test packs.

## Overview

This project management system is designed specifically for construction and engineering projects with a focus on quality control and inspection processes. It provides a structured way to manage the hierarchy of:

- Projects
- Systems
- Subsystems
- ITRs (Inspection and Test Records)
- Test Packs

## Features

- **User Authentication**: Secure login and role-based access control
- **Project Management**: Create, view, update, and delete projects
- **System Hierarchy**: Organize projects into systems, subsystems, and ITRs
- **Inspection Records**: Track ITRs with progress indicators and signatures
- **Test Pack Management**: Group related ITRs into test packs
- **Multi-language Support**: Full internationalization with English and Spanish
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- React with TypeScript
- Vite for building and development
- Tailwind CSS for styling
- Shadcn UI component library
- Tanstack React Query for data fetching
- i18next for internationalization
- Supabase for backend services (authentication, database, storage)

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd project-management-system
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

- `/src`: Source code
  - `/components`: Reusable UI components
  - `/hooks`: Custom React hooks
  - `/pages`: Application pages
  - `/services`: API services
  - `/types`: TypeScript type definitions
  - `/locales`: Internationalization files
  - `/integrations`: External service integrations

## Deployment

The application can be deployed to any static hosting service that supports single-page applications (SPAs).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Icons from [Lucide React](https://lucide.dev/)
- Charts from [Recharts](https://recharts.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
