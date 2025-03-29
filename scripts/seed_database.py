#!/usr/bin/env python
import csv
import sqlite3
import os
import datetime
import sys
from pathlib import Path
import re

# Define the paths
DATA_DIR = Path("data")
DB_PATH = Path("prisma/dev.db")

# Connect to the SQLite database
def connect_to_db():
    print(f"Connecting to database at {DB_PATH.absolute()}...")
    if not DB_PATH.exists():
        raise FileNotFoundError(f"Database file not found at {DB_PATH.absolute()}. Run 'npx prisma migrate dev' first.")
    return sqlite3.connect(DB_PATH)

# Helper function to parse datetime strings from the CSV
def parse_datetime(dt_string):
    """Parse datetime string from CSV into proper format."""
    if not dt_string:
        return None
    
    # Print for debugging
    print(f"Parsing datetime: {dt_string}")
    
    try:
        # Check if the string is already in ISO format
        if 'T' in dt_string:
            return dt_string
        
        # Handle simple date format (YYYY-MM-DD)
        if re.match(r'^\d{4}-\d{2}-\d{2}$', dt_string):
            return f"{dt_string}T00:00:00Z"
        
        # If we can't parse it, return None
        print(f"Error parsing datetime '{dt_string}': Unknown format")
        return None
    except Exception as e:
        print(f"Error parsing datetime '{dt_string}': {str(e)}")
        return None

# Process patients.csv
def process_patients(conn):
    print("Processing patients.csv...")
    cursor = conn.cursor()
    
    # Check if table exists
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Patient'")
        if not cursor.fetchone():
            print("Table 'Patient' does not exist!")
            return
    except Exception as e:
        print(f"Error checking for Patient table: {e}")
        return
        
    # Show table schema
    try:
        cursor.execute("PRAGMA table_info(Patient)")
        columns = cursor.fetchall()
        print("Patient table columns:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
    except Exception as e:
        print(f"Error getting Patient schema: {e}")
        return
    
    # Clear existing data
    try:
        cursor.execute("DELETE FROM Patient")
        print(f"Cleared existing Patient data")
    except Exception as e:
        print(f"Error clearing Patient data: {e}")
        return
    
    count = 0
    try:
        with open(DATA_DIR / "patients.csv", 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if count == 0:
                    print(f"First patient row: {row}")
                
                # Map CSV columns to database columns
                birthdate = parse_datetime(row.get("BIRTHDATE"))
                deathdate = parse_datetime(row.get("DEATHDATE"))
                
                try:
                    cursor.execute(
                        """
                        INSERT INTO Patient (
                            id, birthdate, deathdate, gender, race, ethnicity, first, last
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            row.get("Id"),
                            birthdate,
                            deathdate,
                            row.get("GENDER"),
                            row.get("RACE"),
                            row.get("ETHNICITY"),
                            row.get("FIRST"),
                            row.get("LAST")
                        )
                    )
                    count += 1
                    if count % 100 == 0:
                        print(f"Inserted {count} patients")
                except Exception as e:
                    print(f"Error inserting patient {row.get('Id')}: {e}")
                    
        conn.commit()
        final_count = cursor.execute("SELECT COUNT(*) FROM Patient").fetchone()[0]
        print(f"Inserted a total of {final_count} patients")
    except Exception as e:
        print(f"Error processing patients.csv: {e}")

# Process conditions.csv
def process_conditions(conn):
    print("Processing conditions.csv...")
    cursor = conn.cursor()
    
    # Check if table exists
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Condition'")
        if not cursor.fetchone():
            print("Table 'Condition' does not exist!")
            return
    except Exception as e:
        print(f"Error checking for Condition table: {e}")
        return
        
    # Show table schema
    try:
        cursor.execute("PRAGMA table_info(Condition)")
        columns = cursor.fetchall()
        print("Condition table columns:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
    except Exception as e:
        print(f"Error getting Condition schema: {e}")
        return
    
    # Clear existing data
    try:
        cursor.execute("DELETE FROM Condition")
        print(f"Cleared existing Condition data")
    except Exception as e:
        print(f"Error clearing Condition data: {e}")
        return
    
    count = 0
    try:
        with open(DATA_DIR / "conditions.csv", 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if count == 0:
                    print(f"First condition row: {row}")
                
                # Map CSV columns to database columns
                start_date = parse_datetime(row.get("START"))
                stop_date = parse_datetime(row.get("STOP"))
                
                try:
                    cursor.execute(
                        """
                        INSERT INTO Condition (
                            id, patientId, code, description, start, stop
                        ) VALUES (?, ?, ?, ?, ?, ?)
                        """,
                        (
                            # Generate a unique id for each condition
                            f"{row.get('PATIENT')}-{row.get('CODE')}-{start_date}",
                            row.get("PATIENT"),
                            row.get("CODE"),
                            row.get("DESCRIPTION"),
                            start_date,
                            stop_date
                        )
                    )
                    count += 1
                    if count % 100 == 0:
                        print(f"Inserted {count} conditions")
                except Exception as e:
                    print(f"Error inserting condition for patient {row.get('PATIENT')}: {e}")
                    
        conn.commit()
        final_count = cursor.execute("SELECT COUNT(*) FROM Condition").fetchone()[0]
        print(f"Inserted a total of {final_count} conditions")
    except Exception as e:
        print(f"Error processing conditions.csv: {e}")

# Process medications.csv
def process_medications(conn):
    print("Processing medications.csv...")
    cursor = conn.cursor()
    
    # Check if table exists
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Medication'")
        if not cursor.fetchone():
            print("Table 'Medication' does not exist!")
            return
    except Exception as e:
        print(f"Error checking for Medication table: {e}")
        return
        
    # Show table schema
    try:
        cursor.execute("PRAGMA table_info(Medication)")
        columns = cursor.fetchall()
        print("Medication table columns:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
    except Exception as e:
        print(f"Error getting Medication schema: {e}")
        return
    
    # Clear existing data
    try:
        cursor.execute("DELETE FROM Medication")
        print(f"Cleared existing Medication data")
    except Exception as e:
        print(f"Error clearing Medication data: {e}")
        return
    
    count = 0
    try:
        with open(DATA_DIR / "medications.csv", 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if count == 0:
                    print(f"First medication row: {row}")
                
                # Map CSV columns to database columns
                start_date = parse_datetime(row.get("START"))
                stop_date = parse_datetime(row.get("STOP"))
                
                try:
                    cursor.execute(
                        """
                        INSERT INTO Medication (
                            id, patientId, code, description, start, stop
                        ) VALUES (?, ?, ?, ?, ?, ?)
                        """,
                        (
                            # Generate a unique id for each medication
                            f"{row.get('PATIENT')}-{row.get('CODE')}-{start_date}",
                            row.get("PATIENT"),
                            row.get("CODE"),
                            row.get("DESCRIPTION"),
                            start_date,
                            stop_date
                        )
                    )
                    count += 1
                    if count % 100 == 0:
                        print(f"Inserted {count} medications")
                except Exception as e:
                    print(f"Error inserting medication for patient {row.get('PATIENT')}: {e}")
                    
        conn.commit()
        final_count = cursor.execute("SELECT COUNT(*) FROM Medication").fetchone()[0]
        print(f"Inserted a total of {final_count} medications")
    except Exception as e:
        print(f"Error processing medications.csv: {e}")

# Process encounters.csv
def process_encounters(conn):
    print("Processing encounters.csv...")
    cursor = conn.cursor()
    
    # Check if table exists
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Encounter'")
        if not cursor.fetchone():
            print("Table 'Encounter' does not exist!")
            return
    except Exception as e:
        print(f"Error checking for Encounter table: {e}")
        return
        
    # Show table schema
    try:
        cursor.execute("PRAGMA table_info(Encounter)")
        columns = cursor.fetchall()
        print("Encounter table columns:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
    except Exception as e:
        print(f"Error getting Encounter schema: {e}")
        return
    
    # Clear existing data
    try:
        cursor.execute("DELETE FROM Encounter")
        print(f"Cleared existing Encounter data")
    except Exception as e:
        print(f"Error clearing Encounter data: {e}")
        return
    
    count = 0
    try:
        with open(DATA_DIR / "encounters.csv", 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if count == 0:
                    print(f"First encounter row: {row}")
                
                # Map CSV columns to database columns
                start_date = parse_datetime(row.get("START"))
                stop_date = parse_datetime(row.get("STOP"))
                
                try:
                    cursor.execute(
                        """
                        INSERT INTO Encounter (
                            id, patientId, code, description, reasonCode, start, stop
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            row.get("Id"),
                            row.get("PATIENT"),
                            row.get("CODE"),
                            row.get("DESCRIPTION"),
                            row.get("REASONCODE"),
                            start_date,
                            stop_date
                        )
                    )
                    count += 1
                    if count % 100 == 0:
                        print(f"Inserted {count} encounters")
                except Exception as e:
                    print(f"Error inserting encounter {row.get('Id')}: {e}")
                    
        conn.commit()
        final_count = cursor.execute("SELECT COUNT(*) FROM Encounter").fetchone()[0]
        print(f"Inserted a total of {final_count} encounters")
    except Exception as e:
        print(f"Error processing encounters.csv: {e}")

def main():
    print("Starting database seeding...")
    print(f"Python version: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    print(f"Data directory: {DATA_DIR.absolute()}")
    
    try:
        # Check if data files exist
        for file_name in ["patients.csv", "conditions.csv", "medications.csv", "encounters.csv"]:
            file_path = DATA_DIR / file_name
            if file_path.exists():
                print(f"Found {file_name} ({file_path.stat().st_size} bytes)")
            else:
                print(f"Error: {file_name} not found at {file_path.absolute()}")
    except Exception as e:
        print(f"Error checking data files: {e}")
        return
    
    conn = None
    try:
        conn = connect_to_db()
        
        # Process each file
        process_patients(conn)
        process_encounters(conn)
        process_conditions(conn)
        process_medications(conn)
        
        print("Database seeding completed successfully!")
    except Exception as e:
        print(f"Error during database seeding: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main() 