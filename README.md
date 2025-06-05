# TrueDoc Admin Dashboard

A modern, responsive admin dashboard for managing medical professionals and healthcare institutions. Built with React, TypeScript, and Chakra UI, integrated with Supabase backend.

## Features

### 1. Real-Time Dashboard Metrics
- **Pending Doctors**: Track doctors awaiting approval
- **Approved Doctors**: Monitor active doctors in the system
- **Total Leads**: Overview of all potential doctor registrations
- **Pending Changes**: Track approved doctors with pending profile updates

### 2. Comprehensive Management Sections
- **Doctors Management**: Review, approve, and manage doctor profiles
- **Leads Tracking**: Monitor and manage potential doctor registrations
- **Institutions**: Manage partner hospitals and medical facilities
- **Medical Schools**: Track and manage affiliated medical institutions
- **Insurance Partners**: Handle healthcare insurance partnerships
- **Specialties**: Manage medical specialties and subspecialties

### 3. Technical Features
- Real-time data updates using Supabase
- Responsive design for all screen sizes
- Modern UI with Chakra UI components
- Smooth animations with Framer Motion
- Type-safe development with TypeScript
- Efficient routing with React Router
- Professional color scheme based on #5deb99

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **UI Library**: Chakra UI
- **State Management**: React Query
- **Database**: Supabase
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **Icons**: React Icons
- **Routing**: React Router DOM

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/EskindirA/truedocadmin.git
cd truedocadmin
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a .env file in the root directory and add your Supabase credentials:
\`\`\`env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The application will be available at http://localhost:3000

## Project Structure

\`\`\`
src/
├── components/         # Reusable UI components
│   ├── dashboard/     # Dashboard-specific components
│   └── ...
├── contexts/          # React contexts
├── lib/              # Utility functions and API clients
├── pages/            # Page components
└── main.tsx          # Application entry point
\`\`\`

## Database Schema

The application uses the following main tables in Supabase:
- `medicos`: Doctor profiles
- `lead`: Potential doctor registrations
- `formacao_outros`: Additional medical education
- `medico_especialidade_residencia`: Doctor specialties
- `medico_subespecialidade_residencia`: Doctor subspecialties

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.
