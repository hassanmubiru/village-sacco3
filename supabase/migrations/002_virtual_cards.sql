-- Create virtual_cards table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS virtual_cards (
    id TEXT PRIMARY KEY DEFAULT 'card_' || generate_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_number TEXT NOT NULL,
    holder_name TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    cvv TEXT NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    status TEXT CHECK (status IN ('active', 'blocked', 'pending', 'expired')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster lookups (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_virtual_cards_user_id ON virtual_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_virtual_cards_status ON virtual_cards(status);

-- Add RLS policies (check if already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'virtual_cards' AND policyname = 'Users can view own virtual cards') THEN
        ALTER TABLE virtual_cards ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own virtual cards" ON virtual_cards FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert own virtual cards" ON virtual_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own virtual cards" ON virtual_cards FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add trigger to update updated_at timestamp (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = TIMEZONE('utc'::text, NOW());
            RETURN NEW;
        END;
        $func$ language 'plpgsql';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_virtual_cards_updated_at') THEN
        CREATE TRIGGER update_virtual_cards_updated_at BEFORE UPDATE ON virtual_cards FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;
