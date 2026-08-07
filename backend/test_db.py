import sqlite3
conn = sqlite3.connect("C:/Users/welcome/OneDrive/Desktop/HireMind-AI/backend/hiremind.db")
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print(cursor.fetchall())
conn.close()
