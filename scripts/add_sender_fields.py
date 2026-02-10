#!/usr/bin/env python3
"""
Migration script to add sender information fields to the wishes table.
Run this script to add sender_name and sender_message columns.
"""

import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.database import engine


def add_sender_fields():
    """Add sender_name and sender_message columns to wishes table."""
    
    with engine.connect() as conn:
        # Check if columns already exist (SQLite compatible)
        result = conn.execute(text("PRAGMA table_info(wishes)"))
        existing_columns = [row[1] for row in result]  # row[1] is column name in SQLite
        
        # Add sender_name column if it doesn't exist
        if 'sender_name' not in existing_columns:
            print("Adding sender_name column...")
            conn.execute(text("""
                ALTER TABLE wishes 
                ADD COLUMN sender_name VARCHAR(100)
            """))
            print("✓ Added sender_name column")
        else:
            print("✓ sender_name column already exists")
        
        # Add sender_message column if it doesn't exist
        if 'sender_message' not in existing_columns:
            print("Adding sender_message column...")
            conn.execute(text("""
                ALTER TABLE wishes 
                ADD COLUMN sender_message VARCHAR(200)
            """))
            print("✓ Added sender_message column")
        else:
            print("✓ sender_message column already exists")
        
        # Commit the changes
        conn.commit()
        print("✅ Migration completed successfully!")


if __name__ == "__main__":
    print("🔄 Adding sender information fields to wishes table...")
    try:
        add_sender_fields()
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)