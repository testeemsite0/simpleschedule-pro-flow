
-- Add password_changed column to profiles table
ALTER TABLE profiles ADD COLUMN password_changed BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN profiles.password_changed IS 'Indicates if the user has changed their initial password';
