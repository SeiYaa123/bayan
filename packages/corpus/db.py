import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://akashic:akashic@localhost:5432/akashic_db")


def get_connection():
    return psycopg2.connect(DATABASE_URL)


def get_source_id(conn, collection: str) -> str:
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM sources WHERE collection = %s LIMIT 1", (collection,))
        row = cur.fetchone()
        if not row:
            raise ValueError(f"Source '{collection}' not found. Run migrations first.")
        return str(row[0])
