#!/bin/bash

# Simple script to apply the migration manually
# Run this if you have access to your Supabase database

echo "This script contains the SQL commands to apply the migration."
echo "Copy and paste these commands into your Supabase SQL editor:"
echo ""
echo "-- Step 1: Add columns to sacco_memberships"
echo "ALTER TABLE sacco_memberships"
echo "ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',"
echo "ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),"
echo "ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,"
echo "ADD COLUMN IF NOT EXISTS user_name TEXT,"
echo "ADD COLUMN IF NOT EXISTS user_email TEXT;"
echo ""
echo "-- Step 2: Create virtual_cards table"
cat supabase/migrations/003b_create_virtual_cards.sql
echo ""
echo "-- Step 3: Create transactions table"
cat supabase/migrations/003c_create_transactions.sql
echo ""
echo "-- Step 4: Add indexes and triggers"
cat supabase/migrations/003d_indexes_and_triggers.sql
