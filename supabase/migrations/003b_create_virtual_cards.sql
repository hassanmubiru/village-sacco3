-- Step 2: Create virtual_cards table
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
