-- Step 3: Create transactions table
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
