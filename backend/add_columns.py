import sqlite3

def upgrade():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE user ADD COLUMN email_notifications BOOLEAN DEFAULT 1;")
        print("email_notifications added.")
    except Exception as e:
        print("Error adding email_notifications:", e)

    try:
        cursor.execute("ALTER TABLE user ADD COLUMN push_notifications BOOLEAN DEFAULT 1;")
        print("push_notifications added.")
    except Exception as e:
        print("Error adding push_notifications:", e)
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    upgrade()
