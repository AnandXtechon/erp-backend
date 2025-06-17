-- Migration: Add progress column to jobs table
ALTER TABLE jobs ADD COLUMN progress NUMERIC DEFAULT 0;
