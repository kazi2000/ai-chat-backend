#!/usr/bin/env python3
"""
Supabase Database Setup Script
Connects to Supabase and runs database migrations
"""

import os
import sys
import json
import requests
from typing import Optional, Dict, Any

class SupabaseSetup:
    """Handle Supabase database setup and migrations"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        """
        Initialize Supabase connection
        
        Args:
            supabase_url: Your Supabase project URL
            supabase_key: Your Supabase anon public key
        """
        self.supabase_url = supabase_url.rstrip('/')
        self.supabase_key = supabase_key
        self.headers = {
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    
    def test_connection(self) -> bool:
        """Test connection to Supabase"""
        try:
            print("🔗 Testing Supabase connection...")
            url = f"{self.supabase_url}/rest/v1/"
            response = requests.get(url, headers=self.headers, timeout=5)
            
            if response.status_code in [200, 401]:
                print("✅ Connection successful!")
                return True
            else:
                print(f"❌ Connection failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Connection error: {str(e)}")
            return False
    
    def run_sql_migration(self, sql_content: str) -> bool:
        """
        Run SQL migration via Supabase REST API
        Note: REST API has limitations, so we'll provide instructions for manual execution
        
        Args:
            sql_content: SQL migration content
        
        Returns:
            True if successful
        """
        print("\n⚠️  Note: Supabase REST API doesn't support direct SQL execution.")
        print("📝 Please run the SQL migrations manually in Supabase dashboard:")
        print("\n1. Go to https://app.supabase.com")
        print("2. Select your project")
        print("3. Click 'SQL Editor' in the left sidebar")
        print("4. Click 'New Query'")
        print("5. Copy and paste the SQL below")
        print("6. Click 'Run'")
        print("\n" + "="*60)
        print("SQL MIGRATION:")
        print("="*60)
        print(sql_content)
        print("="*60)
        return True
    
    def get_tables(self) -> Optional[list]:
        """Get list of tables in the database"""
        try:
            print("\n📊 Fetching database tables...")
            url = f"{self.supabase_url}/rest/v1/information_schema.tables"
            params = {
                'table_schema': 'eq.public',
                'select': 'table_name'
            }
            response = requests.get(url, headers=self.headers, params=params, timeout=5)
            
            if response.status_code == 200:
                tables = response.json()
                if tables:
                    print("✅ Found tables:")
                    for table in tables:
                        print(f"   - {table['table_name']}")
                    return [t['table_name'] for t in tables]
                else:
                    print("⚠️  No tables found. Run migrations first.")
                    return []
            else:
                print(f"❌ Error fetching tables: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return None
    
    def verify_tables(self, required_tables: list) -> bool:
        """Verify that all required tables exist"""
        try:
            tables = self.get_tables()
            if not tables:
                return False
            
            missing = [t for t in required_tables if t not in tables]
            if missing:
                print(f"\n❌ Missing tables: {missing}")
                return False
            else:
                print(f"\n✅ All required tables exist!")
                return True
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return False

def load_migration_sql(filepath: str) -> Optional[str]:
    """Load SQL migration from file"""
    try:
        with open(filepath, 'r') as f:
            return f.read()
    except FileNotFoundError:
        print(f"❌ Migration file not found: {filepath}")
        return None
    except Exception as e:
        print(f"❌ Error reading migration file: {str(e)}")
        return None

def main():
    """Main setup function"""
    print("="*60)
    print("Supabase Database Setup")
    print("="*60)
    
    # Get credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        print("\n❌ Error: Missing environment variables")
        print("\nPlease set:")
        print("  export SUPABASE_URL=https://your-project.supabase.co")
        print("  export SUPABASE_KEY=your_anon_key")
        sys.exit(1)
    
    print(f"\n📍 Supabase URL: {supabase_url}")
    print(f"🔑 API Key: {supabase_key[:20]}...")
    
    # Initialize Supabase
    setup = SupabaseSetup(supabase_url, supabase_key)
    
    # Test connection
    if not setup.test_connection():
        print("\n❌ Cannot connect to Supabase. Check your credentials.")
        sys.exit(1)
    
    # Load and display migration SQL
    migration_file = 'migrations.sql'
    if not os.path.exists(migration_file):
        print(f"\n❌ Migration file not found: {migration_file}")
        sys.exit(1)
    
    sql_content = load_migration_sql(migration_file)
    if not sql_content:
        sys.exit(1)
    
    # Run migration (displays instructions)
    setup.run_sql_migration(sql_content)
    
    # Verify tables
    required_tables = ['users', 'leads', 'chat_memory', 'products', 'interactions']
    print("\n📋 Checking for required tables...")
    setup.verify_tables(required_tables)
    
    print("\n" + "="*60)
    print("Setup Complete!")
    print("="*60)
    print("\n✅ Next steps:")
    print("1. Run the SQL migration in Supabase dashboard")
    print("2. Verify all tables are created")
    print("3. Deploy to Render")
    print("4. Configure Shopify")

if __name__ == '__main__':
    main()
