import pandas as pd
import sqlite3
import numpy as np
from sklearn.cluster import KMeans, DBSCAN
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
kmeans_labels = kmeans.fit_predict(scaled_features)

# Apply DBSCAN clustering
print("Applying DBSCAN clustering...")
dbscan = DBSCAN(eps=0.5, min_samples=5)
dbscan_labels = dbscan.fit_predict(scaled_features)

# Convert -1 (noise) to a high number to distinguish it
dbscan_labels_adjusted = dbscan_labels.copy()
if -1 in dbscan_labels:
    max_label = max(dbscan_labels)
    dbscan_labels_adjusted[dbscan_labels_adjusted == -1] = max_label + 1

# Add cluster labels to dataframe
features['kmeans_cluster_id'] = kmeans_labels
features['dbscan_cluster_id'] = dbscan_labels_adjusted

merged_df = merged_df.reset_index(drop=True)
features = features.reset_index(drop=True)
merged_df.loc[features.index, 'kmeans_cluster_id'] = features['kmeans_cluster_id']
merged_df.loc[features.index, 'dbscan_cluster_id'] = features['dbscan_cluster_id']

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

if 'dbscanClusterId' not in column_names:
    print("Adding dbscanClusterId column to Patient table...")
    cursor.execute("ALTER TABLE Patient ADD COLUMN dbscanClusterId INTEGER")
    conn.commit()

# Update each patient with their cluster IDs
updated_count = 0
for index, row in merged_df.iterrows():
    if not pd.isna(row.get('kmeans_cluster_id')) or not pd.isna(row.get('dbscan_cluster_id')):
        patient_id = row['id']
        updates = []
        params = []
        
        if not pd.isna(row.get('kmeans_cluster_id')):
            kmeans_cluster_id = int(row['kmeans_cluster_id'])
            updates.append("clusterId = ?")
            params.append(kmeans_cluster_id)
        
        if not pd.isna(row.get('dbscan_cluster_id')):
            dbscan_cluster_id = int(row['dbscan_cluster_id'])
            updates.append("dbscanClusterId = ?")
            params.append(dbscan_cluster_id)
        
        if updates:
            query = f"UPDATE Patient SET {', '.join(updates)} WHERE id = ?"
            params.append(patient_id)
            cursor.execute(query, params)
            updated_count += 1

conn.commit()
print(f"Updated {updated_count} patients with cluster IDs")

# Verify the update
print("K-means cluster distribution:")
kmeans_verification = pd.read_sql_query(
    "SELECT clusterId, COUNT(*) as count FROM Patient GROUP BY clusterId",
    conn
)
print(kmeans_verification)

print("DBSCAN cluster distribution:")
dbscan_verification = pd.read_sql_query(
    "SELECT dbscanClusterId, COUNT(*) as count FROM Patient GROUP BY dbscanClusterId",
    conn
)
print(dbscan_verification)

conn.close()
print("Clustering complete!") 