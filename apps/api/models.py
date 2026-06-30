from sqlalchemy import Column, String, Text, Integer, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from datetime import datetime
import uuid
from database import Base


class Source(Base):
    __tablename__ = "sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String, nullable=False)
    collection = Column(String, nullable=False)
    language = Column(String, default="ar")
    meta = Column("metadata", JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

    texts = relationship("TextUnit", back_populates="source")


class TextUnit(Base):
    __tablename__ = "texts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey("sources.id"), nullable=False)
    reference = Column(String, nullable=False)
    arabic = Column(Text, nullable=False)
    translation_fr = Column(Text)
    translation_en = Column(Text)
    embedding = Column(Vector(1024))
    meta = Column("metadata", JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

    source = relationship("Source", back_populates="texts")
    isnad_links = relationship("IsnadLink", back_populates="hadith")


class Narrator(Base):
    __tablename__ = "narrators"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name_arabic = Column(Text, nullable=False)
    name_transliterated = Column(String)
    death_year = Column(Integer)
    reliability = Column(String)
    meta = Column("metadata", JSONB, default={})


class IsnadLink(Base):
    __tablename__ = "isnad_links"

    hadith_id = Column(UUID(as_uuid=True), ForeignKey("texts.id"), primary_key=True)
    narrator_id = Column(UUID(as_uuid=True), ForeignKey("narrators.id"), primary_key=True)
    position = Column(Integer, nullable=False)
    transmission_type = Column(String)

    hadith = relationship("TextUnit", back_populates="isnad_links")
    narrator = relationship("Narrator")


class CrossReference(Base):
    __tablename__ = "cross_references"

    source_id = Column(UUID(as_uuid=True), ForeignKey("texts.id"), primary_key=True)
    target_id = Column(UUID(as_uuid=True), ForeignKey("texts.id"), primary_key=True)
    ref_type = Column(String, nullable=False)
    confidence = Column(Float, default=1.0)
    auto_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    plan = Column(String, default="free")
    queries_today = Column(Integer, default=0)
    queries_reset_at = Column(DateTime, default=datetime.utcnow)
    api_key = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
