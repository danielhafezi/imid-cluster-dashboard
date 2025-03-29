# IMID Cluster Dashboard

A dashboard for analyzing Immune-Mediated Inflammatory Disease (IMID) patient data, including conditions, medications, and patient demographics.

## Overview

This project provides a web-based interface to explore and analyze patient data for individuals with immune-mediated inflammatory diseases such as lupus erythematosus and rheumatoid arthritis. The dashboard allows healthcare professionals to:

- Browse patient records
- View condition distributions
- Analyze medication patterns
- Track patient encounters

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Database**: SQLite via Prisma ORM
- **Data Visualization**: Chart.js (planned)

## Project Structure

```
├── prisma/           # Prisma schema and migrations
├── public/           # Static assets
├── scripts/          # Data seeding scripts
├── src/
│   ├── app/          # Next.js application routes
│   ├── components/   # Reusable UI components
│   └── lib/          # Utility functions and shared code
└── data/             # Source data CSV files
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up the database:
   ```
   npx prisma migrate dev
   ```
4. Seed the database with sample data:
   ```
   npm run db:seed
   ```
5. Start the development server:
   ```
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Data Structure

The database includes the following main models:

- **Patient**: Basic demographic information
- **Condition**: Patient conditions with SNOMED CT codes
- **Medication**: Medication details and timing
- **Encounter**: Clinical encounters and visits

## License

MIT 