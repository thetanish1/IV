import sqlite3

def migrate():
    conn = sqlite3.connect("sql_app.db")
    cursor = conn.cursor()

    # Get tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    print("Existing tables:", tables)

    def add_col(table, col, col_def):
        if table not in tables:
            return
        cursor.execute(f"PRAGMA table_info({table})")
        cols = [r[1] for r in cursor.fetchall()]
        if col not in cols:
            print(f"Adding {col} to {table}...")
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_def}")
            conn.commit()

    add_col("site_users", "hashed_password", "VARCHAR(255)")
    add_col("site_users", "raw_password", "VARCHAR(255)")
    add_col("site_users", "provider", "VARCHAR(50) DEFAULT 'google'")

    add_col("internship_applications", "google_email", "VARCHAR(255)")
    add_col("internship_applications", "linkedin_url", "VARCHAR(500)")
    add_col("internship_applications", "github_url", "VARCHAR(500)")
    add_col("internship_applications", "portfolio_url", "VARCHAR(500)")
    add_col("internship_applications", "experience_description", "TEXT")
    add_col("internship_applications", "cover_letter", "TEXT")
    add_col("internship_applications", "role_preference", "VARCHAR(100)")
    add_col("internship_applications", "resume_filename", "VARCHAR(500)")

    conn.close()
    print("Database migration finished!")

if __name__ == "__main__":
    migrate()
