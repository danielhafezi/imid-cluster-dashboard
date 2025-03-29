import sqlite3
import pandas as pd

# Connect to the database
conn = sqlite3.connect('prisma/dev.db')
cursor = conn.cursor()

# Get the tables in the database
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables in the database:")
for table in tables:
    print(f"- {table[0]}")

# Check the schema of the Patient table
cursor.execute("PRAGMA table_info(Patient);")
columns = cursor.fetchall()
print("\nPatient table schema:")
for column in columns:
    print(f"- {column[1]} ({column[2]})")

# Sample data from Patient table
print("\nSample data from Patient table:")
sample = pd.read_sql_query("SELECT * FROM Patient LIMIT 5", conn)
print(sample)

conn.close() 