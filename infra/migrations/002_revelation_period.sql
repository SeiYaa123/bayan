-- Période de révélation des sourates (mecquoise / médinoise)
-- Source : consensus des scholars sur la chronologie révélée
-- Utilisé pour l'analyse de l'évolution sémantique des concepts coraniques

CREATE TABLE IF NOT EXISTS surah_metadata (
  surah_number    INT PRIMARY KEY,
  name_arabic     TEXT NOT NULL,
  name_fr         TEXT,
  revelation_period TEXT NOT NULL CHECK (revelation_period IN ('meccan', 'medinan')),
  revelation_order INT,   -- ordre chronologique de révélation (1-114)
  verse_count     INT
);

-- Données : ordre de révélation basé sur le consensus des exégètes (Ibn Abbas, etc.)
INSERT INTO surah_metadata (surah_number, name_arabic, name_fr, revelation_period, revelation_order, verse_count) VALUES
(1,  'الفاتحة',    'L''Ouverture',           'meccan',  5,   7),
(2,  'البقرة',     'La Vache',                'medinan', 87, 286),
(3,  'آل عمران',  'La Famille d''Imran',     'medinan', 89, 200),
(4,  'النساء',    'Les Femmes',              'medinan', 92, 176),
(5,  'المائدة',   'La Table Servie',         'medinan', 112, 120),
(6,  'الأنعام',   'Les Bestiaux',            'meccan',  55, 165),
(7,  'الأعراف',   'Les Murailles',           'meccan',  39, 206),
(8,  'الأنفال',   'Le Butin',                'medinan', 88,  75),
(9,  'التوبة',    'Le Repentir',             'medinan', 113, 129),
(10, 'يونس',      'Jonas',                   'meccan',  51, 109),
(11, 'هود',       'Houd',                    'meccan',  52,  123),
(12, 'يوسف',      'Joseph',                  'meccan',  53, 111),
(13, 'الرعد',     'Le Tonnerre',             'medinan', 96,  43),
(14, 'إبراهيم',   'Ibrahim',                 'meccan',  72,  52),
(15, 'الحجر',     'Al-Hijr',                 'meccan',  54,  99),
(16, 'النحل',     'Les Abeilles',            'meccan',  70, 128),
(17, 'الإسراء',   'Le Voyage Nocturne',      'meccan',  50, 111),
(18, 'الكهف',     'La Caverne',              'meccan',  69, 110),
(19, 'مريم',      'Marie',                   'meccan',  44,  98),
(20, 'طه',        'Ta-Ha',                   'meccan',  45, 135),
(21, 'الأنبياء',  'Les Prophètes',           'meccan',  73, 112),
(22, 'الحج',      'Le Pèlerinage',           'medinan', 103, 78),
(23, 'المؤمنون',  'Les Croyants',            'meccan',  74, 118),
(24, 'النور',     'La Lumière',              'medinan', 102, 64),
(25, 'الفرقان',   'Le Discernement',         'meccan',  42,  77),
(36, 'يس',        'Ya-Sin',                  'meccan',  41,  83),
(55, 'الرحمن',    'Le Tout Miséricordieux',  'medinan', 97,  78),
(56, 'الواقعة',   'L''Événement',            'meccan',  46,  96),
(67, 'الملك',     'La Royauté',              'meccan',  77,  30),
(112,'الإخلاص',   'La Sincérité',            'meccan',  22,   4),
(113,'الفلق',     'L''Aube',                 'meccan',  20,   5),
(114,'الناس',     'Les Hommes',              'meccan',  21,   6)
ON CONFLICT DO NOTHING;

-- Index pour filtrage rapide par période
CREATE INDEX IF NOT EXISTS texts_revelation_period_idx
  ON texts ((metadata->>'surah'))
  WHERE metadata->>'surah' IS NOT NULL;
