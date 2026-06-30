-- Migration 003: ajoute la colonne api_key à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE;
