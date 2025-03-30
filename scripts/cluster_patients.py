#!/usr/bin/env python
"""
Patient Clustering Script

This script applies two clustering algorithms (K-means and DBSCAN) to patient data
and stores the results in the database. 

The script:
1. Fetches patient data from the SQLite database
2. Calculates features (age, condition count, medication count)
3. Applies K-means and DBSCAN clustering algorithms
4. Updates the database with cluster assignments
"""

import pandas as pd
import sqlite3
import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration constants
DB_PATH = 'prisma/dev.db'
KMEANS_CLUSTERS = 5
DBSCAN_EPS = 0.5
DBSCAN_MIN_SAMPLES = 5
RANDOM_SEED = 42


def connect_to_database():
    """Connect to the SQLite database and return connection object."""
    try:
        logger.info(f"Connecting to database at {DB_PATH}")
        conn = sqlite3.connect(DB_PATH)
        return conn
    except sqlite3.Error as e:
        logger.error(f"Database connection error: {e}")
        raise


def fetch_patient_data(conn):
    """Fetch patient data and related counts from database."""
    logger.info("Fetching patient data...")
    
    try:
        # Fetch basic patient data
        patients_df = pd.read_sql_query("SELECT * FROM Patient", conn)
        
        # Fetch condition counts per patient
        conditions_count = pd.read_sql_query(
            """
            SELECT patientId as patient_id, COUNT(*) as condition_count 
            FROM Condition 
            GROUP BY patientId
            """, 
            conn
        )
        
        # Fetch medication counts per patient
        medications_count = pd.read_sql_query(
            """
            SELECT patientId as patient_id, COUNT(*) as medication_count 
            FROM Medication 
            GROUP BY patientId
            """, 
            conn
        )
        
        return patients_df, conditions_count, medications_count
    except Exception as e:
        logger.error(f"Error fetching data: {e}")
        raise


def prepare_features(patients_df, conditions_count, medications_count):
    """Prepare and normalize features for clustering."""
    logger.info("Preparing features for clustering...")
    
    # Merge dataframes
    merged_df = patients_df.merge(conditions_count, left_on='id', right_on='patient_id', how='left')
    merged_df = merged_df.merge(medications_count, left_on='id', right_on='patient_id', how='left')
    
    # Fill NaN values (patients with no conditions or medications)
    merged_df['condition_count'] = merged_df['condition_count'].fillna(0)
    merged_df['medication_count'] = merged_df['medication_count'].fillna(0)
    
    # Calculate age from birthdate
    merged_df['age'] = merged_df['birthdate'].apply(calculate_age)
    
    # Select features for clustering
    features_df = merged_df[['age', 'condition_count', 'medication_count']].copy()
    features_df = features_df.dropna()  # Remove rows with missing values
    
    # Scale features
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features_df)
    
    return merged_df, features_df, scaled_features


def calculate_age(birthdate):
    """Calculate age from birthdate string."""
    try:
        birth_date = datetime.strptime(birthdate.split('T')[0], '%Y-%m-%d')
        today = datetime.now()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        return age
    except Exception:
        return np.nan


def apply_clustering(scaled_features):
    """Apply clustering algorithms to the data."""
    logger.info(f"Applying K-means clustering with {KMEANS_CLUSTERS} clusters...")
    kmeans = KMeans(n_clusters=KMEANS_CLUSTERS, random_state=RANDOM_SEED, n_init='auto')
    kmeans_labels = kmeans.fit_predict(scaled_features)
    
    logger.info(f"Applying DBSCAN clustering with eps={DBSCAN_EPS}, min_samples={DBSCAN_MIN_SAMPLES}...")
    dbscan = DBSCAN(eps=DBSCAN_EPS, min_samples=DBSCAN_MIN_SAMPLES)
    dbscan_labels = dbscan.fit_predict(scaled_features)
    
    # Convert -1 (noise) to a high number to distinguish it
    dbscan_labels_adjusted = dbscan_labels.copy()
    if -1 in dbscan_labels:
        max_label = max(dbscan_labels)
        dbscan_labels_adjusted[dbscan_labels_adjusted == -1] = max_label + 1
    
    return kmeans_labels, dbscan_labels_adjusted


def update_database_schema(cursor):
    """Ensure the database has the required columns for clustering."""
    try:
        # Check existing columns
        cursor.execute("PRAGMA table_info(Patient)")
        columns = cursor.fetchall()
        column_names = [column[1] for column in columns]
        
        # Add clusterId column if needed
        if 'clusterId' not in column_names:
            logger.info("Adding clusterId column to Patient table...")
            cursor.execute("ALTER TABLE Patient ADD COLUMN clusterId INTEGER")
        
        # Add dbscanClusterId column if needed
        if 'dbscanClusterId' not in column_names:
            logger.info("Adding dbscanClusterId column to Patient table...")
            cursor.execute("ALTER TABLE Patient ADD COLUMN dbscanClusterId INTEGER")
            
        return True
    except sqlite3.Error as e:
        logger.error(f"Error updating database schema: {e}")
        return False


def update_cluster_assignments(conn, merged_df):
    """Update the database with cluster assignments."""
    logger.info("Updating database with cluster assignments...")
    cursor = conn.cursor()
    
    # Ensure schema has required columns
    if not update_database_schema(cursor):
        return False
    
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
    logger.info(f"Updated {updated_count} patients with cluster IDs")
    return True


def verify_clustering(conn):
    """Verify clustering results by querying the database."""
    logger.info("Verifying clustering results...")
    
    # Verify K-means clusters
    kmeans_verification = pd.read_sql_query(
        "SELECT clusterId, COUNT(*) as count FROM Patient GROUP BY clusterId",
        conn
    )
    logger.info("K-means cluster distribution:")
    logger.info(kmeans_verification)
    
    # Verify DBSCAN clusters
    dbscan_verification = pd.read_sql_query(
        "SELECT dbscanClusterId, COUNT(*) as count FROM Patient GROUP BY dbscanClusterId",
        conn
    )
    logger.info("DBSCAN cluster distribution:")
    logger.info(dbscan_verification)


def main():
    """Main function to run the clustering process."""
    try:
        # Connect to database
        conn = connect_to_database()
        
        # Fetch data
        patients_df, conditions_count, medications_count = fetch_patient_data(conn)
        
        # Prepare features
        merged_df, features_df, scaled_features = prepare_features(
            patients_df, conditions_count, medications_count
        )
        
        # Apply clustering
        kmeans_labels, dbscan_labels = apply_clustering(scaled_features)
        
        # Add cluster labels to dataframe
        features_df['kmeans_cluster_id'] = kmeans_labels
        features_df['dbscan_cluster_id'] = dbscan_labels
        
        # Merge cluster assignments back into the main dataframe
        merged_df = merged_df.reset_index(drop=True)
        features_df = features_df.reset_index(drop=True)
        merged_df.loc[features_df.index, 'kmeans_cluster_id'] = features_df['kmeans_cluster_id']
        merged_df.loc[features_df.index, 'dbscan_cluster_id'] = features_df['dbscan_cluster_id']
        
        # Update database
        update_cluster_assignments(conn, merged_df)
        
        # Verify results
        verify_clustering(conn)
        
        logger.info("Clustering complete!")
    except Exception as e:
        logger.error(f"Error during clustering process: {e}")
    finally:
        if 'conn' in locals():
            conn.close()


if __name__ == "__main__":
    main() 