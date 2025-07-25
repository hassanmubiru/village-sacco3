#!/bin/bash

# Enhanced Bitnob Services Migration Script
# This script applies the database migration for enhanced Bitnob services

echo "🚀 Starting Enhanced Bitnob Services Migration..."

# Check if we're in the right directory
if [ ! -f "supabase/migrations/002_enhanced_bitnob_services.sql" ]; then
    echo "❌ Migration file not found. Please run this script from the project root directory."
    exit 1
fi

echo "📋 Migration will add:"
echo "   ✅ Virtual Cards table and functionality"
echo "   ✅ Cross-border payments tracking"
echo "   ✅ USDT/Stablecoin transactions"
echo "   ✅ Enhanced transaction types and methods"
echo "   ✅ Updated member_transaction_history view"

echo ""
echo "⚠️  This migration will:"
echo "   - Drop and recreate the member_transaction_history view"
echo "   - Alter the transactions table type column"
echo "   - Add new tables for enhanced services"

echo ""
read -p "Do you want to continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled."
    exit 1
fi

echo ""
echo "🔧 Applying migration..."

# Method 1: Using Supabase CLI if available
if command -v supabase &> /dev/null; then
    echo "📦 Using Supabase CLI..."
    supabase db reset --linked
    if [ $? -eq 0 ]; then
        echo "✅ Migration applied successfully using Supabase CLI!"
        exit 0
    else
        echo "❌ Supabase CLI migration failed. Trying manual method..."
    fi
fi

# Method 2: Manual SQL execution instructions
echo ""
echo "📝 Manual Migration Instructions:"
echo "   1. Go to your Supabase Dashboard"
echo "   2. Navigate to SQL Editor"
echo "   3. Copy and paste the contents of:"
echo "      supabase/migrations/002_enhanced_bitnob_services.sql"
echo "   4. Run the SQL migration"

echo ""
echo "🔗 Supabase Dashboard: https://supabase.com/dashboard/project/zvelgxclmqgohntjimyf"

echo ""
echo "📄 Migration file location:"
echo "   $(pwd)/supabase/migrations/002_enhanced_bitnob_services.sql"

echo ""
echo "🚨 Important Notes:"
echo "   - This migration handles the view dependency issue safely"
echo "   - It will temporarily drop member_transaction_history view"
echo "   - All data will be preserved during the migration"
echo "   - The view will be recreated with enhanced functionality"

echo ""
echo "✨ After migration, you'll have access to:"
echo "   🏦 Virtual Card Management"
echo "   🌍 Cross-border Payments"
echo "   💰 USDT/Stablecoin Transfers"
echo "   ⚡ Enhanced Bitcoin & Lightning Network features"

# Show migration content for easy copying
echo ""
echo "📋 Migration Content (for copy/paste):"
echo "=================================="
cat supabase/migrations/002_enhanced_bitnob_services.sql
echo "=================================="

echo ""
echo "🎉 Migration setup complete!"
echo "   Please apply the SQL manually in Supabase Dashboard."
