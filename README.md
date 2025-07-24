# Village Sacco

## Overview
Village Sacco is a Next.js application designed to provide a platform for managing savings and loans within a community. This project utilizes Supabase for backend services and Tailwind CSS for styling.

## Features
- User authentication and authorization
- Responsive design with Tailwind CSS
- API routes for handling user-related operations
- Reusable components for UI consistency

## Getting Started

### Prerequisites
- Node.js (version 14 or later)
- npm or yarn

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/village-sacco.git
   ```
2. Navigate to the project directory:
   ```
   cd village-sacco
   ```
3. Install the dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Environment Variables
Create a `.env.local` file in the root directory and fill in the required environment variables. You can refer to the `.env.example` file for guidance.

### Running the Application
To start the development server, run:
```
npm run dev
```
or
```
yarn dev
```
The application will be available at `http://localhost:3000`.

## Quick Start - Admin Access

### First Time Setup
1. **Start the application**: `npm run dev`
2. **Create admin user**: Go to `http://localhost:3000/setup/admin`
3. **Fill the form**:
   - Email: Your admin email
   - Name: Your full name  
   - Phone: Your phone number
   - Password: Minimum 6 characters
   - Setup Key: `village-sacco-setup-2024`
4. **Login**: After setup, login at `http://localhost:3000/login`
5. **Access admin dashboard**: Navigate to `http://localhost:3000/admin`

### Key URLs
- **Home**: `http://localhost:3000/`
- **Login**: `http://localhost:3000/login`
- **Signup**: `http://localhost:3000/signup`
- **User Dashboard**: `http://localhost:3000/dashboard`
- **Admin Dashboard**: `http://localhost:3000/admin` (requires admin role)
- **Admin Setup**: `http://localhost:3000/setup/admin` (first-time only)

### Building for Production
To build the application for production, run:
```
npm run build
```
or
```
yarn build
```
Then, you can start the production server with:
```
npm start
```
or
```
yarn start
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.