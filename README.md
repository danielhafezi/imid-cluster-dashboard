# IMID Patient Clusters Visualization Dashboard

![Demo](overview.gif)

## Overview

This project is an interactive web-based visualization dashboard designed to demonstrate patient clustering derived from synthetic Electronic Health Record (EHR) data, **generated by [Synthea™](https://synthetichealth.github.io/synthea/), a widely recognized open-source Patient Population Simulator**. It specifically targets simulated Immune-Mediated Inflammatory Diseases (IMIDs) such as Rheumatoid Arthritis (RA) and Lupus. The dashboard leverages clustering algorithms and AI-generated summaries to provide insights into patient groups.

## Features

- **Data Loading and Processing:** Loads synthetic patient, condition, medication, and encounter data from CSV files into a SQLite database.
- **Dual Clustering Techniques:** Implements both K-Means and DBSCAN clustering algorithms based on patient age, condition count, and medication count. Users can easily switch between these methods to compare different clustering approaches.
- **Interactive Visualization:** Displays patient clusters in an interactive scatter plot, allowing users to explore patient groups visually.
- **AI Summaries:** Integrates Google Gemini API to generate descriptive summaries of patient clusters, tailored to the selected clustering method.

## Data Source

All synthetic patient data used in this project were generated using **[Synthea™ Patient Population Simulator](https://synthetichealth.github.io/synthea/)**.  
Synthea is an open-source synthetic patient generator that models realistic (but artificial) patient populations for academic and healthcare application demonstrations.


## Technology Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM, SQLite
- **Data Processing & Clustering:** Python (Pandas, Scikit-learn)
- **AI Integration:** Google Gemini API
- **Visualization:** Recharts (React charting library)

## Project Structure

```
imid-cluster-dashboard/
├── data/                       # Synthetic patient CSV data generated by Synthea
├── prisma/                     # Database schema and migrations
├── scripts/                    # Python scripts for data seeding and clustering
├── src/
│   ├── app/                    # Next.js application routes and API endpoints
│   ├── components/             # React components
│   └── lib/                    # Utility functions and Prisma client
├── .env.local                  # Environment variables (not included in repo)
├── package.json                # Project dependencies and scripts
└── README.md                   # Project documentation
```

## Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- Python 3.8+
- SQLite

### Installation

1. Clone the repository:
```bash
git clone https://github.com/danielhafezi/imid-cluster-dashboard
cd imid-cluster-dashboard
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies:
```bash
pip install pandas scikit-learn prisma
```

4. Initialize Prisma and SQLite database:
```bash
npx prisma migrate dev
```

5. Seed the database with synthetic data:
```bash
npm run db:seed
```

6. Run clustering script to assign clusters:
```bash
npm run db:cluster
```

### Environment Variables

Create a `.env` file in the project root and add the following variables:
```env
DATABASE_URL="file:./prisma/dev.db"
GEMINI_API_KEY="your-google-gemini-api-key"
```

## Running the Application

Start the development server:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

- View patient clusters on the interactive scatter plot.
- Toggle between K-Means and DBSCAN clustering methods using the buttons at the top of the dashboard.
- Hover over points to see patient details.
- Click on clusters to view AI-generated summaries describing cluster characteristics.
- Summaries are dynamically generated based on the currently selected clustering method.

## Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run db:seed`: Seeds the SQLite database with synthetic data.
- `npm run db:cluster`: Runs the clustering algorithms (both K-Means and DBSCAN) and updates patient cluster assignments.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is intended for academic and demonstration purposes only.
