/*
  # Create motivational phrases table

  1. New Tables
    - `motivational_phrases`
      - `id` (uuid, primary key) - Unique identifier for each phrase record
      - `word` (text) - The word provided by the user
      - `phrases` (text) - The generated motivational phrases
      - `created_at` (timestamptz) - Timestamp when the phrases were generated
  
  2. Security
    - Enable RLS on `motivational_phrases` table
    - Add policy for anyone to insert phrases (public app)
    - Add policy for anyone to read phrases (public app)
*/

CREATE TABLE IF NOT EXISTS motivational_phrases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  phrases text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE motivational_phrases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert phrases"
  ON motivational_phrases
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read phrases"
  ON motivational_phrases
  FOR SELECT
  TO anon
  USING (true);