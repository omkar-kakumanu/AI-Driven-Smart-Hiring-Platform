import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Automatically load environment variables from project root .env and local directory
root_env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
if os.path.exists(root_env_path):
    load_dotenv(root_env_path)
load_dotenv()

DEFAULT_MYSQL_URL = "mysql+pymysql://root:Omkar1707mysql@localhost:3306/recruitment_copilot"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_MYSQL_URL)

# Fallback or specific connect_args based on DB dialect
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )
else:
    # MySQL / PostgreSQL connection with connection health pre-ping & recycle
    try:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_size=10,
            max_overflow=20,
            echo=False
        )
    except Exception as e:
        print(f"[WARN] Failed to initialize engine for {DATABASE_URL}: {e}")
        # Fallback to local SQLite if MySQL isn't reachable
        engine = create_engine(
            "sqlite:///./recruitment_copilot.db",
            connect_args={"check_same_thread": False},
            echo=False
        )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
