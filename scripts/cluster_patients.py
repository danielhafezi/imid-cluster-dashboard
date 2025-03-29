import pandas as pd
import sqlite3
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from datetime import datetime

# Database connection
DB_PATH = 'prisma/dev.db'
conn = sqlite3.connect(DB_PATH)

# Fetch patient data
print("Fetching patient data...")
patients_df = pd.read_sql_query("SELECT * FROM Patient", conn)

# Fetch conditions count per patient
conditions_count = pd.read_sql_query(
    """
    SELECT patientId as patient_id, COUNT(*) as condition_count 
    FROM Condition 
    GROUP BY patientId
    """, 
    conn
)

# Fetch medications count per patient
medications_count = pd.read_sql_query(
    """
    SELECT patientId as patient_id, COUNT(*) as medication_count 
    FROM Medication 
    GROUP BY patientId
    """, 
    conn
)

# Merge dataframes
print("Merging data...")
merged_df = patients_df.merge(conditions_count, left_on='id', right_on='patient_id', how='left')
merged_df = merged_df.merge(medications_count, left_on='id', right_on='patient_id', how='left')

# Fill NaN values (patients with no conditions or medications)
merged_df['condition_count'] = merged_df['condition_count'].fillna(0)
merged_df['medication_count'] = merged_df['medication_count'].fillna(0)

# Calculate age from birthdate
print("Calculating age...")
def calculate_age(birthdate):
    try:
        birth_date = datetime.strptime(birthdate.split('T')[0], '%Y-%m-%d')
        today = datetime.now()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        return age
    except:
        return np.nan

merged_df['age'] = merged_df['birthdate'].apply(calculate_age)

# Select features for clustering
print("Preparing features for clustering...")
features = merged_df[['age', 'condition_count', 'medication_count']].copy()
features = features.dropna()  # Remove rows with missing values

# Scale features
scaler = StandardScaler()
scaled_features = scaler.fit_transform(features)

# Apply K-means clustering
print("Applying K-means clustering...")
kmeans = KMeans(n_clusters=5, random_state=42, n_init='auto')
cluster_labels = kmeans.fit_predict(scaled_features)

# Add cluster labels to dataframe
features['cluster_id'] = cluster_labels
merged_df = merged_df.reset_index(drop=True)
features = features.reset_index(drop=True)
merged_df.loc[features.index, 'cluster_id'] = features['cluster_id']

# Update the database with cluster assignments
print("Updating database with cluster assignments...")
cursor = conn.cursor()

# First check if clusterId column exists, if not we need to create it
cursor.execute("PRAGMA table_info(Patient)")
columns = cursor.fetchall()
column_names = [column[1] for column in columns]

if 'clusterId' not in column_names:
    print("Adding clusterId column to Patient table...")
    cursor.execute("ALTER TABLE Patient ADD COLUMN clusterId INTEGER")
    conn.commit()

# Update each patient with their cluster ID
updated_count = 0
for index, row in merged_df.iterrows():
    if not pd.isna(row.get('cluster_id')):
        patient_id = row['id']
        cluster_id = int(row['cluster_id'])
        cursor.execute(
            "UPDATE Patient SET clusterId = ? WHERE id = ?", 
            (cluster_id, patient_id)
        )
        updated_count += 1

conn.commit()
print(f"Updated {updated_count} patients with cluster IDs")

# Verify the update
verification = pd.read_sql_query(
    "SELECT clusterId, COUNT(*) as count FROM Patient GROUP BY clusterId",
    conn
)
print("Cluster distribution:")
print(verification)

conn.close()
print("Clustering complete!") 