-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Sources du corpus
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('quran', 'hadith', 'tafsir', 'fiqh')),
  collection TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'ar',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unités textuelles (ayat, hadith, passage de tafsir)
CREATE TABLE texts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,        -- "2:286", "bukhari:6412"
  arabic TEXT NOT NULL,
  translation_fr TEXT,
  translation_en TEXT,
  embedding vector(1024),         -- multilingual-e5-large dim
  metadata JSONB DEFAULT '{}',    -- sourate, numéro, livre, chapitre...
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la recherche sémantique (cosine similarity)
CREATE INDEX texts_embedding_idx ON texts
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index trigram pour la recherche exacte en arabe
CREATE INDEX texts_arabic_trgm_idx ON texts
  USING gin (arabic gin_trgm_ops);

-- Index sur la référence pour navigation directe
CREATE INDEX texts_reference_idx ON texts (reference);
CREATE INDEX texts_source_idx ON texts (source_id);

-- Transmetteurs de hadiths (science du rijal)
CREATE TABLE narrators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_arabic TEXT NOT NULL,
  name_transliterated TEXT,
  death_year INT,
  reliability TEXT CHECK (reliability IN ('thiqah', 'sadouq', 'da_if', 'unknown')),
  metadata JSONB DEFAULT '{}'
);

-- Chaîne de transmission (isnad) d'un hadith
CREATE TABLE isnad_links (
  hadith_id UUID NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
  narrator_id UUID NOT NULL REFERENCES narrators(id) ON DELETE CASCADE,
  position INT NOT NULL,          -- 0 = Prophète, 1 = sahabi, 2 = tabi'i...
  transmission_type TEXT,         -- sami'a, 'an, haddathana...
  PRIMARY KEY (hadith_id, narrator_id)
);

-- Connexions sémantiques entre textes
CREATE TABLE cross_references (
  source_id UUID NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
  ref_type TEXT NOT NULL CHECK (ref_type IN ('explanation', 'context', 'ruling', 'parallel', 'tafsir')),
  confidence FLOAT NOT NULL DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),
  auto_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (source_id, target_id)
);

-- Utilisateurs et abonnements
CREATE TABLE users (
  id TEXT PRIMARY KEY,            -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'api')),
  queries_today INT NOT NULL DEFAULT 0,
  queries_reset_at TIMESTAMPTZ DEFAULT NOW(),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seeds: sources de base
INSERT INTO sources (type, collection, language) VALUES
  ('quran',  'quran',          'ar'),
  ('hadith', 'bukhari',        'ar'),
  ('hadith', 'muslim',         'ar'),
  ('hadith', 'abu_dawud',      'ar'),
  ('hadith', 'tirmidhi',       'ar'),
  ('hadith', 'nasai',          'ar'),
  ('hadith', 'ibn_majah',      'ar'),
  ('tafsir', 'ibn_kathir',     'ar'),
  ('tafsir', 'tabari',         'ar'),
  ('fiqh',   'hanafi',         'ar'),
  ('fiqh',   'maliki',         'ar'),
  ('fiqh',   'shafi_i',        'ar'),
  ('fiqh',   'hanbali',        'ar');
