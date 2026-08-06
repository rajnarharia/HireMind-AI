import sqlite3

conn = sqlite3.connect('../hiremind.db')
cursor = conn.cursor()

# create table if not exists (in case it wasn't created yet)
cursor.execute('''
CREATE TABLE IF NOT EXISTS candidate_profiles (
    id INTEGER PRIMARY KEY,
    user_id INTEGER UNIQUE,
    bio TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    xp INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    skills TEXT,
    experience TEXT,
    education TEXT,
    projects TEXT,
    certificates TEXT,
    avatar_url TEXT,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

# check existing columns
cursor.execute("PRAGMA table_info(candidate_profiles)")
existing_cols = [col[1] for col in cursor.fetchall()]

new_cols = {
    'bio': 'TEXT',
    'github_url': 'TEXT',
    'linkedin_url': 'TEXT',
    'portfolio_url': 'TEXT',
    'xp': 'INTEGER DEFAULT 0',
    'streak_days': 'INTEGER DEFAULT 0',
    'skills': 'TEXT',
    'experience': 'TEXT',
    'education': 'TEXT',
    'projects': 'TEXT',
    'certificates': 'TEXT',
    'avatar_url': 'TEXT',
    'last_active': 'DATETIME DEFAULT CURRENT_TIMESTAMP'
}

for col, dtype in new_cols.items():
    if col not in existing_cols:
        print(f"Adding {col}")
        try:
            cursor.execute(f"ALTER TABLE candidate_profiles ADD COLUMN {col} {dtype}")
        except Exception as e:
            print(e)

conn.commit()
conn.close()
print("Done")
