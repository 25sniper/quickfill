from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, index=True)
    number = Column(String, index=True)
    price = Column(Float, default=0.0)
    status = Column(String, default="Pending") # e.g., Pending, Processing, Shipped, Delivered
    custom_photo = Column(String, nullable=True) # path or URL to the photo
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
