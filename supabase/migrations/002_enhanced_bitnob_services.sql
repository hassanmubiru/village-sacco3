-- Enhanced Bitnob Services Tables

-- Virtual Cards table
CREATE TABLE IF NOT EXISTS virtual_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sacco_group_id UUID REFERENCES sacco_groups(id) ON DELETE SET NULL,
    card_number VARCHAR(19) NOT NULL,
    card_holder_name VARCHAR(255) NOT NULL,
    expiry_month INTEGER NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
    expiry_year INTEGER NOT NULL,
    cvv VARCHAR(4) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'UGX',
    spending_limit DECIMAL(15,2) DEFAULT 500000.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired', 'blocked')),
    type VARCHAR(20) DEFAULT 'virtual' CHECK (type IN ('virtual', 'physical')),
    bitnob_card_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Cross-border payments table
CREATE TABLE IF NOT EXISTS cross_border_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    source_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    exchange_rate DECIMAL(10,6) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0.00,
    recipient_country VARCHAR(2) NOT NULL,
    recipient_phone_number VARCHAR(20),
    recipient_bank_account VARCHAR(255),
    recipient_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    reference VARCHAR(255) NOT NULL UNIQUE,
    bitnob_reference VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- USDT/Stablecoin transactions table
CREATE TABLE IF NOT EXISTS stablecoin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('mint', 'burn', 'transfer')),
    amount DECIMAL(15,2) NOT NULL,
    usdt_amount DECIMAL(15,8) NOT NULL,
    exchange_rate DECIMAL(10,6) NOT NULL,
    fee DECIMAL(15,8) DEFAULT 0.00000000,
    recipient_address VARCHAR(255),
    blockchain_network VARCHAR(20) DEFAULT 'ethereum' CHECK (blockchain_network IN ('ethereum', 'tron', 'polygon')),
    tx_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    reference VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Enhanced transactions table with new fields
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS recipient_country VARCHAR(2),
ADD COLUMN IF NOT EXISTS virtual_card_id UUID REFERENCES virtual_cards(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS cross_border_reference VARCHAR(255),
ADD COLUMN IF NOT EXISTS usdt_amount DECIMAL(15,8),
ADD COLUMN IF NOT EXISTS blockchain_network VARCHAR(20);

-- Handle the view dependency issue by dropping and recreating the view
-- First, get the exact view definition from the original schema
DROP VIEW IF EXISTS member_transaction_history;

-- Now we can safely modify the type column
ALTER TABLE transactions 
ALTER COLUMN type TYPE VARCHAR(30);

-- Update payment_method constraint to include new payment methods
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_payment_method_check;

ALTER TABLE transactions 
ADD CONSTRAINT transactions_payment_method_check 
CHECK (payment_method IN ('lightning', 'onchain', 'bank_transfer', 'mobile_money', 'internal', 'usdt', 'cross_border', 'virtual_card'));

-- Recreate the view with the original structure plus new fields
CREATE VIEW public.member_transaction_history AS
SELECT 
  t.id,
  t.user_id,
  t.sacco_group_id,
  sg.name as sacco_group_name,
  t.type,
  t.amount,
  t.currency,
  t.btc_amount,
  t.fee,
  t.status,
  t.description,
  t.blockchain_tx_hash,
  t.payment_method,
  t.created_at,
  -- New enhanced fields
  t.recipient_country,
  t.virtual_card_id,
  t.cross_border_reference,
  t.usdt_amount,
  t.blockchain_network,
  -- Calculate running balance
  SUM(CASE 
    WHEN t.type IN ('deposit', 'contribution', 'interest') THEN t.amount
    WHEN t.type IN ('withdrawal', 'loan') THEN -t.amount
    ELSE 0
  END) OVER (
    PARTITION BY t.user_id, t.sacco_group_id 
    ORDER BY t.created_at 
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) as running_balance,
  -- Enhanced blockchain verification status
  CASE 
    WHEN t.blockchain_tx_hash IS NOT NULL THEN 'verified'
    WHEN t.status = 'completed' THEN 'pending_verification'
    ELSE 'unverified'
  END as verification_status
FROM public.transactions t
LEFT JOIN public.sacco_groups sg ON t.sacco_group_id = sg.id
WHERE t.status != 'cancelled'
ORDER BY t.created_at DESC;

-- Grant permissions on the recreated view
GRANT SELECT ON public.member_transaction_history TO authenticated;

-- Update comment for the enhanced view
COMMENT ON VIEW public.member_transaction_history IS 'Enhanced immutable view of member transaction history with running balances, blockchain verification status, and support for cross-border payments, USDT transfers, and virtual card transactions';

-- Add comment to describe enhanced types
COMMENT ON COLUMN transactions.type IS 'Transaction types: deposit, withdrawal, send, receive, cross_border, stablecoin_transfer, card_payment';
COMMENT ON COLUMN transactions.payment_method IS 'Payment methods: lightning, onchain, internal, usdt, cross_border, virtual_card';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_virtual_cards_user_id ON virtual_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_virtual_cards_status ON virtual_cards(status);
CREATE INDEX IF NOT EXISTS idx_virtual_cards_bitnob_id ON virtual_cards(bitnob_card_id);

CREATE INDEX IF NOT EXISTS idx_cross_border_sender ON cross_border_payments(sender_id);
CREATE INDEX IF NOT EXISTS idx_cross_border_status ON cross_border_payments(status);
CREATE INDEX IF NOT EXISTS idx_cross_border_reference ON cross_border_payments(reference);
CREATE INDEX IF NOT EXISTS idx_cross_border_country ON cross_border_payments(recipient_country);

CREATE INDEX IF NOT EXISTS idx_stablecoin_user_id ON stablecoin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_stablecoin_type ON stablecoin_transactions(type);
CREATE INDEX IF NOT EXISTS idx_stablecoin_status ON stablecoin_transactions(status);
CREATE INDEX IF NOT EXISTS idx_stablecoin_network ON stablecoin_transactions(blockchain_network);

-- Row Level Security (RLS) policies
ALTER TABLE virtual_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_border_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stablecoin_transactions ENABLE ROW LEVEL SECURITY;

-- Virtual Cards policies
CREATE POLICY "Users can view their own virtual cards" ON virtual_cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own virtual cards" ON virtual_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own virtual cards" ON virtual_cards
    FOR UPDATE USING (auth.uid() = user_id);

-- Cross-border payments policies
CREATE POLICY "Users can view their cross-border payments" ON cross_border_payments
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create cross-border payments" ON cross_border_payments
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their cross-border payments" ON cross_border_payments
    FOR UPDATE USING (auth.uid() = sender_id);

-- Stablecoin transactions policies
CREATE POLICY "Users can view their stablecoin transactions" ON stablecoin_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create stablecoin transactions" ON stablecoin_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_virtual_cards_updated_at 
    BEFORE UPDATE ON virtual_cards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for development (insert after table creation completes)
INSERT INTO virtual_cards (user_id, card_number, card_holder_name, expiry_month, expiry_year, cvv, spending_limit, bitnob_card_id)
SELECT 
    id,
    '4532 1234 5678 9012',
    name,
    12,
    2027,
    '123',
    500000.00,
    'btn_mock_' || extract(epoch from now())::bigint
FROM auth.users 
WHERE email = 'admin@sacco.com'
ON CONFLICT (bitnob_card_id) DO NOTHING;
