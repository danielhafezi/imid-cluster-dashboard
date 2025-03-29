## Product Requirements Document (PRD)

**Project Title:** Interactive Visualization Dashboard for IMID Patient Clusters

**Version:** 1.0

**Date:** 2025-03-29

**Author:** Gemini (based on input from Daniel Hafezian)

**Status:** Draft

---

**1. Objective**

To develop a local web application prototype demonstrating the visualization of patient clusters derived from synthetic Electronic Health Record (EHR) data. The application will specifically focus on patients with simulated Immune-Mediated Inflammatory Diseases (IMIDs) like Rheumatoid Arthritis (RA) and Lupus. It will utilize basic clustering techniques, display results interactively, and leverage the Google Gemini API to generate descriptive summaries for identified clusters. This serves as a proof-of-concept project relevant to health data science research.

**2. Target User**

*   Primary: Academic supervisors, potential research collaborators (demonstration purposes).
*   Secondary (Conceptual): Clinicians or health data analysts (as a potential future tool).

**3. Core Functionality**

*   Load and process patient, condition, medication, and encounter data from provided CSV files.
*   Store processed data in a local SQLite database using Prisma.
*   Apply a basic clustering algorithm (e.g., K-Means or DBSCAN) to group patients based on selected features (demographics, condition counts, medication patterns).
*   Provide a web-based user interface (UI) built with Next.js and React.
*   Display patients visually (e.g., scatter plot) with points colored according to their assigned cluster.
*   Allow users to interact with the visualization (e.g., hover over points, select clusters).
*   Fetch and display AI-generated (Google Gemini) summaries describing the characteristics of a selected cluster.

**4. Data Source**

*   Four CSV files: `patients.csv`, `conditions.csv`, `medications.csv`, `encounters.csv`.
*   Location: These files are located in the `/data` directory relative to the project root.
*   Assumption: The CSV files contain the appropriately generated synthetic data with a focus on RA and Lupus cases.

**5. Technology Stack**

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **UI Library:** React
*   **Styling:** Tailwind CSS
*   **Database:** SQLite
*   **ORM:** Prisma
*   **Clustering:** Python (Pandas, Scikit-learn) - *Executed via a separate script to pre-process/label data.*
*   **AI Summarization:** Google Gemini API (via backend API route)
*   **Visualization:** A React charting library (e.g., Recharts, Chart.js)

---

**6. Phased Development Plan (For AI Agent Implementation)**

*Instructions for Agent: Implement each phase sequentially. Each phase should result in functional, testable code.*

**Phase 0: Project Setup & Initialization**
    *   **Goal:** Set up the basic project structure and dependencies.
    *   **Tasks:**
        1.  Initialize a new Next.js project with TypeScript and Tailwind CSS: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` (Adjust flags as needed).
        2.  Install Prisma: `npm install prisma --save-dev` and `npm install @prisma/client`.
        3.  Initialize Prisma with SQLite provider: `npx prisma init --datasource-provider sqlite`.
        4.  Define the initial database schema in `prisma/schema.prisma` (based on the schema provided in previous conversation, including `Patient`, `Condition`, `Medication`, `Encounter` models).
        5.  Create the initial database migration: `npx prisma migrate dev --name init`. Verify `prisma/dev.db` is created.
        6.  Ensure the `/data` directory exists at the project root and contains the four required CSV files.
        7.  Set up environment variable handling (e.g., `.env.local`) for the `DATABASE_URL` (already set by Prisma init) and later for the `GEMINI_API_KEY`. Add `.env.local` to `.gitignore`.

**Phase 1: Data Loading & Database Seeding**
    *   **Goal:** Load data from CSV files into the SQLite database.
    *   **Tasks:**
        1.  Create a Python script (`scripts/seed_database.py`).
        2.  Install required Python packages: `pandas`.
        3.  In the script:
            *   Import `pandas` and `sqlite3`.
            *   Define the relative path to the `/data` directory and the `prisma/dev.db` file.
            *   Connect to the SQLite database (`prisma/dev.db`).
            *   For each of the four CSV files (`patients.csv`, `conditions.csv`, `medications.csv`, `encounters.csv`):
                *   Read the CSV into a Pandas DataFrame, ensuring correct parsing of date columns (`parse_dates`).
                *   Rename DataFrame columns to *exactly* match the Prisma model field names (e.g., 'PATIENT' -> 'patientId', 'BIRTHDATE' -> 'birthdate'). Refer to the Python script provided in the previous conversation for exact renaming. Handle potential case sensitivity issues.
                *   Use `DataFrame.to_sql()` to insert data into the corresponding SQLite table (`Patient`, `Condition`, `Medication`, `Encounter`), using `if_exists='append'` and `index=False`. Handle potential data type mismatches if they arise during insertion (adjust DataFrame types if needed).
            *   Close the database connection.
        4.  Add a script command to `package.json` to run this Python script (e.g., `"db:seed": "python scripts/seed_database.py"`).
        5.  Run the seeding script (`npm run db:seed`). Verify data exists in `prisma/dev.db` using a tool like DB Browser for SQLite or Prisma Studio (`npx prisma studio`).

**Phase 2: Basic Backend API Routes**
    *   **Goal:** Create API endpoints to fetch necessary data from the database.
    *   **Tasks:**
        1.  Create an API route `app/api/patients/route.ts`.
        2.  Implement a `GET` handler in this route.
        3.  Inside the `GET` handler:
            *   Instantiate `PrismaClient`.
            *   Fetch a list of all patients (or a sample, e.g., first 50) using `prisma.patient.findMany()`. Include related data if needed initially (e.g., count of conditions).
            *   Return the fetched data as a JSON response using `NextResponse.json()`.
        4.  (Optional) Create a dynamic API route `app/api/patients/[id]/route.ts` to fetch details for a single patient by ID.

**Phase 3: Basic Frontend Patient Display**
    *   **Goal:** Display a simple list of patients fetched from the backend API.
    *   **Tasks:**
        1.  Modify the main page component (`app/page.tsx`).
        2.  Use React's `useEffect` and `useState` hooks (or a data fetching library like SWR/TanStack Query) to fetch data from the `/api/patients` endpoint when the component mounts.
        3.  Display the fetched patient data in a simple list or table format. Show basic info like `id`, `first`, `last`, `birthdate`.

**Phase 4: Clustering Implementation & Data Update**
    *   **Goal:** Apply clustering and add cluster labels to the patient data in the database.
    *   **Tasks:**
        1.  Create a new Python script (`scripts/cluster_patients.py`).
        2.  Install required Python packages: `pandas`, `scikit-learn`, `prisma` (Python client: `pip install prisma`). Generate the Python client: `prisma generate --generator client-py`.
        3.  In the script:
            *   Import necessary libraries (`pandas`, `KMeans` or `DBSCAN` from `sklearn.cluster`, `Prisma` from `prisma`).
            *   Connect to the database using the Prisma Python client.
            *   Fetch relevant patient data needed for clustering (e.g., age derived from `birthdate`, number of conditions/medications fetched via relations/aggregations). Load this into a Pandas DataFrame.
            *   Perform data preprocessing/feature scaling if necessary (e.g., using `StandardScaler`).
            *   Apply a clustering algorithm (e.g., `KMeans(n_clusters=5, random_state=42, n_init='auto')`). Choose a reasonable number of clusters (e.g., 4-6).
            *   Get the cluster labels assigned to each patient.
            *   Add a new column `clusterId` (type `Int`, nullable) to the `Patient` model in `prisma/schema.prisma`.
            *   Run `npx prisma migrate dev --name add_cluster_id` to update the database schema.
            *   Update the script to iterate through the patients and their assigned cluster labels, using `prisma.patient.update()` to save the `clusterId` for each patient in the database. Ensure patient IDs match correctly between the DataFrame and the database update loop.
        4.  Add a script command to `package.json` (e.g., `"db:cluster": "python scripts/cluster_patients.py"`).
        5.  Run the clustering script (`npm run db:cluster`). Verify the `clusterId` column is populated in the `Patient` table.

**Phase 5: API Endpoint for Cluster Data**
    *   **Goal:** Provide API access to patient data including cluster assignments.
    *   **Tasks:**
        1.  Modify the `GET` handler in `app/api/patients/route.ts`.
        2.  Update the `prisma.patient.findMany()` call to fetch all necessary data for visualization, including the `clusterId` and features used for plotting (e.g., `birthdate`, potentially counts of conditions/medications fetched via `_count`).
        3.  (Optional) Create a new API route `app/api/clusters/[clusterId]/route.ts` to fetch only patients belonging to a specific cluster ID.

**Phase 6: Frontend Cluster Visualization Component**
    *   **Goal:** Display patients on a scatter plot, colored by cluster.
    *   **Tasks:**
        1.  Install a charting library: `npm install recharts` (or `chart.js` and its React wrapper).
        2.  Create a new React component (e.g., `components/ClusterScatterPlot.tsx`).
        3.  This component should accept the patient data (fetched in the parent page component) as a prop.
        4.  Inside the component:
            *   Use the charting library (e.g., Recharts `ScatterChart`, `Scatter`, `XAxis`, `YAxis`, `Tooltip`, `Legend`) to render the plot.
            *   Define axes (e.g., X-axis: Age calculated from birthdate, Y-axis: Number of unique conditions or medications). Perform necessary data transformation.
            *   Map `clusterId` to distinct colors for the scatter points. Define a color palette.
            *   Implement basic interactivity (e.g., Tooltip showing patient ID/name on hover).
        5.  Integrate the `ClusterScatterPlot` component into `app/page.tsx`, passing the fetched patient data to it.

**Phase 7: Backend Gemini API Integration**
    *   **Goal:** Create an API endpoint to get AI summaries for a cluster.
    *   **Tasks:**
        1.  Install the Google AI SDK: `npm install @google/generative-ai`.
        2.  Add your `GEMINI_API_KEY` to `.env.local`. Ensure it's added to `.gitignore`.
        3.  Create a new API route `app/api/summarize-cluster/route.ts`.
        4.  Implement a `POST` handler that accepts a `clusterId` in the request body.
        5.  Inside the `POST` handler:
            *   Instantiate `PrismaClient`.
            *   Fetch relevant aggregated data for the given `clusterId` (e.g., count of patients, average age, most common conditions/medications within that cluster using Prisma aggregate/groupBy functions).
            *   Instantiate the Google Generative AI client using your API key (`process.env.GEMINI_API_KEY`). Use this model `gemini-2.0-flash`
            *   Construct a clear prompt for Gemini, providing the aggregated cluster data and asking it to summarize the key characteristics of this patient cluster in simple terms (e.g., "Summarize the key characteristics of this patient cluster based on the following data: [Insert aggregated data]. Focus on demographics, common conditions, and medication patterns.").
            *   Call the Gemini API (`generateContent` method).
            *   Handle potential errors from the API call.
            *   Return the generated text summary as a JSON response.

**Phase 8: Frontend LLM Summary Display**
    *   **Goal:** Display the AI-generated summary when a cluster is selected.
    *   **Tasks:**
        1.  Modify the `ClusterScatterPlot` component (or its parent page) to handle click events on cluster points or legend items.
        2.  Maintain state (`useState`) to store the currently selected `clusterId`.
        3.  When a cluster is selected:
            *   Make a `POST` request to the `/api/summarize-cluster` endpoint, sending the selected `clusterId`.
            *   Store the returned summary text in state.
            *   Handle loading and error states during the API call.
        4.  Create a new component (e.g., `components/ClusterSummary.tsx`) to display the summary text.
        5.  Integrate this component into `app/page.tsx`, conditionally rendering it and passing the summary text when available.

**Phase 9: UI Refinement & Polish**
    *   **Goal:** Improve the overall look, feel, and usability of the dashboard.
    *   **Tasks:**
        1.  Use Tailwind CSS utility classes to style components consistently.
        2.  Organize the layout on `app/page.tsx` (e.g., place the plot and summary panel side-by-side or stacked).
        3.  Add clear titles, labels, and instructions.
        4.  Implement visual feedback for loading states (e.g., spinners) and error messages.
        5.  Ensure basic responsiveness for different screen sizes (if feasible).
        6.  Add comments to complex code sections.
        7.  Perform final testing across different interactions.

---

**7. Non-Goals**

*   User authentication or accounts.
*   Real-time data updates.
*   Deployment to a live server (local development only).
*   Advanced statistical validation of clusters.
*   Highly complex or computationally intensive ML models.
*   Saving user interactions or preferences.

---

**8. Success Metrics**

*   Application runs locally without critical errors.
*   Data from all 4 CSVs is successfully loaded into the SQLite database.
*   Clustering algorithm runs and assigns `clusterId` to patients in the DB.
*   Frontend displays an interactive scatter plot with points colored by cluster.
*   Selecting a cluster triggers a call to the Gemini API.
*   AI-generated summary for the selected cluster is displayed on the frontend.
*   The UI is clean, understandable, and effectively demonstrates the core functionality.