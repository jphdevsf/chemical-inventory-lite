# <img src="public/chem-inv-lite.svg" width="64" height="64"> Chemical Inventory Lite

## Overview
Chemical Inventory Lite is a lightweight web application designed to help manage chemical inventories efficiently. [See the demo](https://chemical-inventory-lite.netlify.app/).

### Data Storage
This application uses **Neon PostgreSQL** for persistent data storage with a normalized schema across three tables:
- `chemicals` - Chemical compound information
- `suppliers` - Supplier contact details
- `inventory` - Inventory items linking chemicals and suppliers

The database connection is configured via environment variables for security and flexibility across environments.

## Tech Stack
| Technology       | Description                          |
|------------------|--------------------------------------|
| React            | Frontend framework for building UI components |
| Express.js       | Backend API for CRUD operations on Neon PostgreSQL database |
| Tailwind CSS     | Utility-first CSS framework for styling |
| Radix UI         | React components for accessible UI patterns |
| lucide-react     | React integration for Lucide icons    |
| next-themes      | Theme toggle integration for React    |

## Installation
1. In terminal, clone the repository: `git clone https://github.com/jphdevsf/chemical-inventory-lite`
2. Navigate to the directory: `cd chemical-inventory-lite`
3. Install dependencies: `npm install`
4. Create a `.env` file in the root directory with:
   ```
   VITE_API_URL=/data
   DATABASE_URL=your_neon_database_url
   DEFAULT_USER_ID=f2b26b25-be58-442c-a457-87dbad7c8843
   ```
   Replace `your_neon_database_url` with your actual Neon connection string from the Neon dashboard.

## Commands
- `npm run build`: Build the application
- `npm run dev`: Start development server
- `npm run lint`: Lint the codebase
