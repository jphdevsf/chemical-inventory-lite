# <img src="public/chem-inv-lite.svg" width="64" height="64"> Chemical Inventory Lite

## Overview
Chemical Inventory Lite is a lightweight web application designed to help manage chemical inventories efficiently. It provides features for tracking chemical storage, monitoring expiration dates, and simplifying inventory management tasks.

### Data Storage
In this "Lite" version, chemical data is simply stored in `./temp/data.json`. In a future iteration, a proper database system will be introduced

## Tech Stack
| Technology       | Description                          |
|------------------|--------------------------------------|
| React            | Frontend framework for building UI components |
| Express.js       | Minimal backend for CRUD operations on local JSON file |
| Tailwind CSS     | Utility-first CSS framework for styling |
| Radix UI         | React components for accessible UI patterns |
| lucide-react     | React integration for Lucide icons    |
| next-themes      | Theme toggle integration for React    |

## Installation
1. Clone the repository: `git clone <repository-url>`
2. Navigate to the directory: `cd chemical-inventory-lite`
3. Install dependencies: `npm install`

## Commands
- `npm run build`: Build the application
- `npm run dev`: Start development server
- `npm run dev:vite`: Start Vite dev server
- `npm run dev:server`: Run the server script
- `npm run lint`: Lint the codebase