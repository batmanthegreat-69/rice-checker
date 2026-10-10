-- =========================================================
-- Rice Disease Expert System - Database
-- Run this whole file in MySQL Workbench (lightning icon).
-- =========================================================

DROP DATABASE IF EXISTS rice_expert;
CREATE DATABASE rice_expert;
USE rice_expert;

-- ---------- 1. SYMPTOMS (the facts the user can pick) ----------
CREATE TABLE symptoms (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(255) NOT NULL,
  image VARCHAR(255)              -- file name inside public/images/
);

-- ---------- 2. DIAGNOSES (the possible conclusions) ----------
CREATE TABLE diagnoses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  type        VARCHAR(30)  NOT NULL,      -- Fungal, Bacterial, Viral, Pest
  description TEXT,
  advice      TEXT
);

-- ---------- 3. RULES (the KNOWLEDGE BASE) ----------
-- Each row means: "symptom X is a sign of diagnosis Y".
-- All rows with the same diagnosis_id together form ONE IF-THEN rule:
--   IF symptom A AND symptom B AND symptom C THEN diagnosis Y
CREATE TABLE rules (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  diagnosis_id INT NOT NULL,
  symptom_id   INT NOT NULL,
  FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE CASCADE,
  FOREIGN KEY (symptom_id)   REFERENCES symptoms(id)  ON DELETE CASCADE
);

-- ---------- 4. CONSULTATIONS (history log, optional) ----------
CREATE TABLE consultations (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  selected_symptoms VARCHAR(255),
  top_result        VARCHAR(100),
  score             INT,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- SAMPLE DATA (rice diseases and pests)
-- Verify/expand with PhilRice or IRRI Rice Knowledge Bank
-- before your defense, and cite them as your source.
-- =========================================================

INSERT INTO symptoms (id, name, image) VALUES
(1,  'Diamond-shaped spots with gray centers on leaves', 'symptom-1.jpg'),
(2,  'Neck of the panicle turns brown or black and breaks', 'symptom-2.jpg'),
(3,  'Leaves turn yellow starting from the tips, along the edges', 'symptom-3.jpg'),
(4,  'Leaf edges look wavy and dry (grayish-white)', 'symptom-4.jpg'),
(5,  'Young seedlings wilt and die', 'symptom-5.jpg'),
(6,  'Oval greenish-gray spots on the leaf sheath near the water line', 'symptom-6.jpg'),
(7,  'Spots on the sheath spread upward and have brown borders', 'symptom-7.jpg'),
(8,  'Leaves turn yellow to orange', 'symptom-8.jpg'),
(9,  'Plants are stunted (shorter than normal)', 'symptom-9.jpg'),
(10, 'Fewer tillers (shoots) than normal', 'symptom-10.jpg'),
(11, 'Many green leafhoppers in the field', 'symptom-11.jpg'),
(12, 'Small round or oval brown spots on leaves', 'symptom-12.jpg'),
(13, 'Grains are discolored or have dark spots', 'symptom-13.jpg'),
(14, 'Orange or greenish velvety balls on the grains', 'symptom-14.jpg'),
(15, 'Central shoot dries out (deadheart)', 'symptom-15.jpg'),
(16, 'Panicles are white and empty (whitehead)', 'symptom-16.jpg'),
(17, 'Small holes in the stem or larvae inside the stem', 'symptom-17.jpg');

INSERT INTO diagnoses (id, name, type, description, advice) VALUES
(1, 'Rice Blast', 'Fungal',
 'A common fungal disease that attacks leaves, nodes and the panicle neck.',
 'Plant resistant varieties. Avoid too much nitrogen fertilizer. Remove infected stubble after harvest. Ask your local agriculturist about a recommended fungicide.'),
(2, 'Bacterial Leaf Blight', 'Bacterial',
 'A bacterial disease that dries leaves from the tips and edges.',
 'Use resistant varieties and clean seeds. Keep fields drained between irrigations. Avoid excess nitrogen. Remove weeds and infected stubble.'),
(3, 'Sheath Blight', 'Fungal',
 'A fungal disease that starts on the sheath near the water and climbs up the plant.',
 'Use proper plant spacing for better airflow. Avoid excess nitrogen. Remove weeds that host the fungus. Ask your local agriculturist about fungicide if severe.'),
(4, 'Rice Tungro', 'Viral',
 'A viral disease spread by green leafhoppers.',
 'Plant resistant varieties. Synchronize planting with neighboring farms. Control green leafhoppers early. Pull out and destroy infected plants.'),
(5, 'Brown Spot', 'Fungal',
 'A fungal disease often linked to poor soil and nutrient deficiency.',
 'Improve soil fertility with balanced fertilizer. Use clean, healthy seeds. Treat seeds before planting.'),
(6, 'False Smut', 'Fungal',
 'A fungal disease that turns individual grains into velvety spore balls.',
 'Use clean seeds. Avoid excess nitrogen. Remove and destroy infected panicles. Plow under stubble after harvest.'),
(7, 'Stem Borer', 'Pest',
 'Insect larvae that bore into the stem and cut off nutrients to the shoot or panicle.',
 'Remove egg masses by hand. Plow under stubble after harvest. Use light traps to monitor moths. Ask your local agriculturist before using insecticide.');

-- The IF-THEN rules
-- Rice Blast:            IF 1 AND 2 AND 16
-- Bacterial Leaf Blight: IF 3 AND 4 AND 5
-- Sheath Blight:         IF 6 AND 7
-- Rice Tungro:           IF 8 AND 9 AND 10 AND 11
-- Brown Spot:            IF 12 AND 13
-- False Smut:            IF 14 AND 13
-- Stem Borer:            IF 15 AND 16 AND 17
INSERT INTO rules (diagnosis_id, symptom_id) VALUES
(1, 1), (1, 2), (1, 16),
(2, 3), (2, 4), (2, 5),
(3, 6), (3, 7),
(4, 8), (4, 9), (4, 10), (4, 11),
(5, 12), (5, 13),
(6, 14), (6, 13),
(7, 15), (7, 16), (7, 17);
