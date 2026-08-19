import os
from datetime import datetime, timedelta, timezone
import bcrypt
import jwt

# Secret key to sign the JWT tokens (Keep this safe!)
# Set SECRET_KEY as an environment variable in production (Render dashboard).
SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_hackathon_key_change_me_later")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# NOTE: we use the `bcrypt` library directly instead of passlib's
# CryptContext. passlib is unmaintained and its bcrypt backend crashes
# (AttributeError: module 'bcrypt' has no attribute '__about__', then a
# ValueError about the 72-byte limit) on modern bcrypt versions (>=4.1).
# Calling bcrypt directly avoids that broken compatibility shim entirely.
BCRYPT_MAX_BYTES = 72  # bcrypt silently ignores/errors on longer inputs


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode("utf-8")[:BCRYPT_MAX_BYTES]
    return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))


def get_password_hash(password: str) -> str:
    password_bytes = password.encode("utf-8")[:BCRYPT_MAX_BYTES]
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
