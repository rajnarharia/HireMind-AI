import sqlite3

conn = sqlite3.connect('hiremind.db')
c = conn.cursor()
try:
    c.execute("ALTER TABLE candidate_profiles ADD COLUMN skills TEXT;")
    c.execute("ALTER TABLE candidate_profiles ADD COLUMN experience TEXT;")
    c.execute("ALTER TABLE candidate_profiles ADD COLUMN education TEXT;")
    c.execute("ALTER TABLE candidate_profiles ADD COLUMN projects TEXT;")
    c.execute("ALTER TABLE candidate_profiles ADD COLUMN certificates TEXT;")
    c.execute("ALTER TABLE candidate_profiles ADD COLUMN avatar_url TEXT;")
except Exception as e:
    print(e)
conn.commit()
conn.close()
print("Migration done")
