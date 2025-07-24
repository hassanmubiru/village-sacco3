-- Add membership status and application tracking to sacco_memberships table
ALTER TABLE sacco_memberships 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Create virtual_cards table for Bitnob virtual card integration
CREATE TABLE IF NOT EXISTS virtual_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    sacco_group_id UUID REFERENCES sacco_groups(id) ON DELETE CASCADE,
    card_number TEXT NOT NULL,
    card_holder_name TEXT NOT NULL,
    expiry_month INTEGER NOT NULL,
    expiry_year INTEGER NOT NULL,
    cvv TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    balance DECIMAL(15,2) DEFAULT 0,
    spending_limit DECIMAL(15,2) DEFAULT 500000,
    bitnob_card_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table for tracking deposits, withdrawals, and payments
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    sacco_group_id UUID REFERENCES sacco_groups(id) ON DELETE CASCADE,
    virtual_card_id UUID REFERENCES virtual_cards(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- 'deposit', 'withdrawal', 'payment', 'loan', 'contribution'
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
    reference TEXT UNIQUE NOT NULL,
    bitnob_payment_id TEXT,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to existing and new tables
DROP TRIGGER IF EXISTS update_virtual_cards_updated_at ON virtual_cards;
CREATE TRIGGER update_virtual_cards_updated_at 
    BEFORE UPDATE ON virtual_cards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance (only after tables exist)
DO $$
BEGIN
    -- Virtual cards indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_virtual_cards_user_id') THEN
        CREATE INDEX idx_virtual_cards_user_id ON virtual_cards(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_virtual_cards_sacco_group_id') THEN
        CREATE INDEX idx_virtual_cards_sacco_group_id ON virtual_cards(sacco_group_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_virtual_cards_status') THEN
        CREATE INDEX idx_virtual_cards_status ON virtual_cards(status);
    END IF;

    -- Transactions indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_user_id') THEN
        CREATE INDEX idx_transactions_user_id ON transactions(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_sacco_group_id') THEN
        CREATE INDEX idx_transactions_sacco_group_id ON transactions(sacco_group_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_type') THEN
        CREATE INDEX idx_transactions_type ON transactions(type);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_status') THEN
        CREATE INDEX idx_transactions_status ON transactions(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_reference') THEN
        CREATE INDEX idx_transactions_reference ON transactions(reference);
    END IF;

    -- Sacco memberships indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sacco_memberships_status') THEN
        CREATE INDEX idx_sacco_memberships_status ON sacco_memberships(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sacco_memberships_sacco_group_id') THEN
        CREATE INDEX idx_sacco_memberships_sacco_group_id ON sacco_memberships(sacco_group_id);
    END IF;
END
$$;

-- Add table and column comments
COMMENT ON TABLE virtual_cards IS 'Bitnob virtual cards for SACCO members';
COMMENT ON TABLE transactions IS 'All financial transactions including deposits, withdrawals, and payments';
COMMENT ON COLUMN sacco_memberships.status IS 'Membership status: pending, approved, rejected, suspended';
COMMENT ON COLUMN transactions.type IS 'Transaction type: deposit, withdrawal, payment, loan, contribution';
COMMENT ON COLUMN transactions.status IS 'Transaction status: pending, completed, failed, cancelled';
