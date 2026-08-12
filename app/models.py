import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


# Helper function to generate UUID strings for SQLite compatibility
def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False)  # 'donor', 'ngo', 'volunteer'
    phone_number = Column(String(20), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_verified = Column(Boolean, default=False)
    # Gamification (Feature #5): running score used for badges/leaderboard
    points = Column(Integer, default=0, nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # --- Relationships ---
    donations = relationship("FoodDonation", back_populates="donor")
    claims = relationship("Claim", back_populates="claimed_by_user")


class FoodDonation(Base):
    __tablename__ = "food_donations"

    id = Column(String, primary_key=True, default=generate_uuid)
    donor_id = Column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String(150), nullable=False)
    description = Column(String, nullable=True)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    is_perishable = Column(Integer, nullable=False)
    prepared_at = Column(DateTime(timezone=True), nullable=False)
    expiry_at = Column(DateTime(timezone=True), nullable=False)
    urgency_score = Column(Float, default=0.00)
    status = Column(String(20), default="available")
    pickup_lat = Column(Float, nullable=False)
    pickup_lng = Column(Float, nullable=False)
    # Short human-typeable code encoded into the donor's QR code. The
    # picker scans/enters it on-site to prove they were physically
    # there before /complete will mark the pickup as verified.
    pickup_code = Column(String(10), nullable=True)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # --- Relationships ---
    donor = relationship("User", back_populates="donations")
    # cascade="all, delete-orphan" ensures if a donation is deleted, its claims are wiped too!
    claims = relationship(
        "Claim", back_populates="donation", cascade="all, delete-orphan"
    )

    @property
    def donor_name(self):
        """
        Safe to read ONLY when `donor` was eager-loaded (selectinload) by
        the query that fetched this row -- otherwise accessing it under
        an async session raises MissingGreenlet. Every router that
        serializes donor_name must eager-load the relationship.
        """
        try:
            return self.donor.full_name if self.donor else None
        except Exception:
            return None


class Claim(Base):
    __tablename__ = "claims"

    id = Column(String, primary_key=True, default=generate_uuid)
    donation_id = Column(
        String, ForeignKey("food_donations.id", ondelete="CASCADE"), nullable=False
    )

    # CRITICAL FIX: Renamed from ngo_id to perfectly match the router logic
    claimed_by_user_id = Column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    status = Column(String(20), default="pending")
    claimed_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # --- Relationships ---
    donation = relationship("FoodDonation", back_populates="claims")
    claimed_by_user = relationship("User", back_populates="claims")
