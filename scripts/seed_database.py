#!/usr/bin/env python
"""
Database Seeding Script

This script loads data from CSV files in the data directory into the SQLite database.
It processes patients, conditions, medications, and encounters data.

Usage:
    python seed_database.py
"""

import csv
import sqlite3
import os
import logging
from pathlib import Path
import re

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define paths
DATA_DIR = Path("data")
DB_PATH = Path("prisma/dev.db")


def connect_to_db():
    """Connect to the SQLite database and return connection object."""
    logger.info(f"Connecting to database at {DB_PATH.absolute()}")
    
    if not DB_PATH.exists():
        raise FileNotFoundError(
            f"Database file not found at {DB_PATH.absolute()}. "
            "Run 'npx prisma migrate dev' first."
        )
    
    return sqlite3.connect(DB_PATH)


def parse_datetime(dt_string):
    """Parse datetime string from CSV into proper format."""
    if not dt_string:
        return None
    
    try:
        # Check if the string is already in ISO format
        if 'T' in dt_string:
            return dt_string
        
        # Handle simple date format (YYYY-MM-DD)
        if re.match(r'^\d{4}-\d{2}-\d{2}$', dt_string):
            return f"{dt_string}T00:00:00Z"
        
        # If we can't parse it, return None
        logger.warning(f"Error parsing datetime '{dt_string}': Unknown format")
        return None
    except Exception as e:
        logger.warning(f"Error parsing datetime '{dt_string}': {str(e)}")
        return None


def check_table_exists(cursor, table_name):
    """Check if a table exists in the database."""
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
        if not cursor.fetchone():
            logger.error(f"Table '{table_name}' does not exist!")
            return False
        return True
    except Exception as e:
        logger.error(f"Error checking for {table_name} table: {e}")
        return False


def show_table_schema(cursor, table_name):
    """Show the schema of a table."""
    try:
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        logger.info(f"{table_name} table columns:")
        for col in columns:
            logger.info(f"  {col[1]} ({col[2]})")
        return True
    except Exception as e:
        logger.error(f"Error getting {table_name} schema: {e}")
        return False


def clear_table_data(cursor, table_name):
    """Clear all data from a table."""
    try:
        cursor.execute(f"DELETE FROM {table_name}")
        logger.info(f"Cleared existing {table_name} data")
        return True
    except Exception as e:
        logger.error(f"Error clearing {table_name} data: {e}")
        return False


def process_patients(conn):
    """Process patients.csv and insert data into Patient table."""
    logger.info("Processing patients.csv...")
    cursor = conn.cursor()
    
    # Check if table exists and show schema
    if not check_table_exists(cursor, "Patient"):
        return
    
    show_table_schema(cursor, "Patient")
    clear_table_data(cursor, "Patient")
    
    count = 0
    try:
        with open(DATA_DIR / "patients.csv", 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if count == 0:
                    logger.info(f"First patient row: {row}")
                
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
                        logger.info(f"Inserted {count} patients")
                except Exception as e:
                    logger.error(f"Error inserting patient {row.get('Id')}: {e}")
                    
        conn.commit()
        final_count = cursor.execute("SELECT COUNT(*) FROM Patient").fetchone()[0]
        logger.info(f"Inserted a total of {final_count} patients")
    except Exception as e:
        logger.error(f"Error processing patients.csv: {e}")


def process_medical_data(conn, data_type, file_name, id_generator_func):
    """Process medical data (conditions, medications, encounters) and insert into database.
    
    Args:
        conn: Database connection
        data_type: Type of data (Condition, Medication, or Encounter)
        file_name: CSV file name
        id_generator_func: Function to generate unique ID for each record
    """
    logger.info(f"Processing {file_name}...")
    cursor = conn.cursor()
    
    # Check if table exists and show schema
    if not check_table_exists(cursor, data_type):
        return
    
    show_table_schema(cursor, data_type)
    clear_table_data(cursor, data_type)
    
    count = 0
    try:
        with open(DATA_DIR / file_name, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if count == 0:
                    logger.info(f"First {data_type.lower()} row: {row}")
                
                # Map CSV columns to database columns
                start_date = parse_datetime(row.get("START"))
                stop_date = parse_datetime(row.get("STOP"))
                
                try:
                    # Generate a unique id for this record
                    record_id = id_generator_func(row, start_date)
                    
                    # Create base query parts
                    fields = ["id", "patientId", "code", "description", "start", "stop"]
                    values = [record_id, row.get("PATIENT"), row.get("CODE"), row.get("DESCRIPTION"), start_date, stop_date]
                    
                    # Add additional fields for Encounter
                    if data_type == "Encounter" and "REASONCODE" in row:
                        fields.append("reasonCode")
                        values.append(row.get("REASONCODE"))
                        
                    # Build and execute query
                    placeholders = ", ".join(["?"] * len(fields))
                    fields_str = ", ".join(fields)
                    query = f"INSERT INTO {data_type} ({fields_str}) VALUES ({placeholders})"
                    
                    cursor.execute(query, values)
                    count += 1
                    if count % 100 == 0:
                        logger.info(f"Inserted {count} {data_type.lower()}s")
                except Exception as e:
                    logger.error(f"Error inserting {data_type.lower()} for patient {row.get('PATIENT')}: {e}")
                    
        conn.commit()
        final_count = cursor.execute(f"SELECT COUNT(*) FROM {data_type}").fetchone()[0]
        logger.info(f"Inserted a total of {final_count} {data_type.lower()}s")
    except Exception as e:
        logger.error(f"Error processing {file_name}: {e}")


def main():
    """Main function to orchestrate data processing."""
    try:
        # Connect to the database
        conn = connect_to_db()
        
        # Process patients data
        process_patients(conn)
        
        # Process conditions data
        process_medical_data(
            conn, 
            "Condition", 
            "conditions.csv", 
            lambda row, start_date: f"{row.get('PATIENT')}-{row.get('CODE')}-{start_date}"
        )
        
        # Process medications data
        process_medical_data(
            conn, 
            "Medication", 
            "medications.csv", 
            lambda row, start_date: f"{row.get('PATIENT')}-{row.get('CODE')}-{start_date}"
        )
        
        # Process encounters data
        process_medical_data(
            conn, 
            "Encounter", 
            "encounters.csv", 
            lambda row, start_date: f"{row.get('PATIENT')}-{row.get('ENCOUNTERCLASS')}-{start_date}"
        )
        
        logger.info("Database seeding complete!")
    except Exception as e:
        logger.error(f"Error during database seeding: {e}")
    finally:
        if 'conn' in locals():
            conn.close()


if __name__ == "__main__":
    main() 