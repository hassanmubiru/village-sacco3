-- Create personal_savings table for individual member savings
CREATE TABLE IF NOT EXISTS personal_savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    sacco_group_id UUID REFERENCES sacco_groups(id) ON DELETE CASCADE,
    balance DECIMAL(15,2) DEFAULT 0,
    total_contributions DECIMAL(15,2) DEFAULT 0,
    interest_earned DECIMAL(15,2) DEFAULT 0,
    last_contribution_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, sacco_group_id)
);

-- Create savings_transactions table for tracking all savings activities
CREATE TABLE IF NOT EXISTS savings_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    sacco_group_id UUID REFERENCES sacco_groups(id) ON DELETE CASCADE,
    personal_savings_id UUID REFERENCES personal_savings(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'deposit', 'withdrawal', 'interest'
    status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    reference TEXT UNIQUE NOT NULL,
    description TEXT,
    bitnob_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_personal_savings_user_id ON personal_savings(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_savings_sacco_group_id ON personal_savings(sacco_group_id);
CREATE INDEX IF NOT EXISTS idx_personal_savings_user_group ON personal_savings(user_id, sacco_group_id);

CREATE INDEX IF NOT EXISTS idx_savings_transactions_user_id ON savings_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_sacco_group_id ON savings_transactions(sacco_group_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_type ON savings_transactions(type);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_status ON savings_transactions(status);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_reference ON savings_transactions(reference);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_personal_savings_updated_at 
    BEFORE UPDATE ON personal_savings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_transactions_updated_at 
    BEFORE UPDATE ON savings_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE personal_savings IS 'Individual member savings accounts within SACCO groups';
COMMENT ON TABLE savings_transactions IS 'All savings-related transactions including deposits, withdrawals, and interest';
COMMENT ON COLUMN savings_transactions.type IS 'Transaction type: deposit, withdrawal, interest';
COMMENT ON COLUMN savings_transactions.status IS 'Transaction status: pending, completed, failed';
