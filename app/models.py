import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

# Helper function to generate UUID strings for SQLite compatibility
def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False) # 'donor', 'ngo', 'volunteer'
    phone_number = Column(String(20), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    donations = relationship("FoodDonation", back_populates="donor")

class FoodDonation(Base):
    __tablename__ = 'food_donations'

    id = Column(String, primary_key=True, default=generate_uuid)
    donor_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(String, nullable=True)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    is_perishable = Column(Integer, nullable=False)
    prepared_at = Column(DateTime(timezone=True), nullable=False)
    expiry_at = Column(DateTime(timezone=True), nullable=False)
    urgency_score = Column(Float, default=0.00)
    status = Column(String(20), default='available')
    pickup_lat = Column(Float, nullable=False)
    pickup_lng = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    donor = relationship("User", back_populates="donations")
    claims = relationship("Claim", back_populates="donation")

class Claim(Base):
    __tablename__ = 'claims'

    id = Column(String, primary_key=True, default=generate_uuid)
    donation_id = Column(String, ForeignKey('food_donations.id', ondelete='CASCADE'), nullable=False)
    ngo_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = Column(String(20), default='pending')
    claimed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    donation = relationship("FoodDonation", back_populates="claims")