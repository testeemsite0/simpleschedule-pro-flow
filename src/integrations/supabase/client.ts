
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://iabhmwqracdcdnevtpzt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhYmhtd3FyYWNkY2RuZXZ0cHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MDY5OTcsImV4cCI6MjA2MTM4Mjk5N30.ITy9iYrYUqYGvXsLL_OempEACnzFGDe3jB9WaIX9HqA";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
