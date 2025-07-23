-- Village SACCO Database Schema
-- Run this SQL in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  phone VARCHAR,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  bitnob_wallet_id VARCHAR,
  kyc_status VARCHAR DEFAULT 'not_started' CHECK (kyc_status IN ('not_started', 'pending', 'approved', 'rejected')),
  role VARCHAR DEFAULT 'member' CHECK (role IN ('member', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SACCO Groups table
CREATE TABLE public.sacco_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  contribution_amount DECIMAL(15,2) NOT NULL,
  contribution_frequency VARCHAR NOT NULL CHECK (contribution_frequency IN ('weekly', 'monthly', 'quarterly')),
  interest_rate DECIMAL(5,2) NOT NULL,
  max_members INTEGER NOT NULL,
  current_members INTEGER DEFAULT 0,
  group_wallet_address VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SACCO Memberships table
CREATE TABLE public.sacco_memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  sacco_group_id UUID REFERENCES public.sacco_groups(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR DEFAULT 'member' CHECK (role IN ('member', 'admin', 'treasurer')),
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  joined_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT false, -- Only true after approval
  total_contributions DECIMAL(15,2) DEFAULT 0,
  last_contribution_date TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, sacco_group_id)
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  sacco_group_id UUID REFERENCES public.sacco_groups(id) ON DELETE SET NULL,
  bitnob_transaction_id VARCHAR,
  type VARCHAR NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'contribution', 'loan', 'interest', 'transfer')),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR DEFAULT 'UGX',
  btc_amount DECIMAL(18,8),
  fee DECIMAL(15,2) DEFAULT 0,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description TEXT,
  blockchain_tx_hash VARCHAR,
  payment_method VARCHAR NOT NULL CHECK (payment_method IN ('lightning', 'onchain', 'bank_transfer', 'mobile_money')),
  recipient_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans table
CREATE TABLE public.loans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  borrower_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  sacco_group_id UUID REFERENCES public.sacco_groups(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  monthly_payment DECIMAL(15,2) NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'completed', 'defaulted')),
  purpose TEXT,
  collateral_description TEXT,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  disbursed_at TIMESTAMP WITH TIME ZONE,
  due_date DATE NOT NULL,
  total_paid DECIMAL(15,2) DEFAULT 0,
  remaining_balance DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Savings Accounts table
CREATE TABLE public.savings_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  sacco_group_id UUID REFERENCES public.sacco_groups(id) ON DELETE SET NULL,
  account_type VARCHAR NOT NULL CHECK (account_type IN ('individual', 'group', 'fixed_deposit')),
  balance DECIMAL(15,2) DEFAULT 0,
  btc_balance DECIMAL(18,8) DEFAULT 0,
  interest_rate DECIMAL(5,2) NOT NULL,
  target_amount DECIMAL(15,2),
  target_date DATE,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Governance Proposals table
CREATE TABLE public.governance_proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sacco_group_id UUID REFERENCES public.sacco_groups(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  proposal_type VARCHAR NOT NULL CHECK (proposal_type IN ('policy_change', 'board_election', 'member_admission', 'loan_approval', 'budget_allocation', 'interest_rate_change')),
  proposed_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  voting_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  voting_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  required_quorum INTEGER NOT NULL DEFAULT 50, -- percentage
  required_majority INTEGER NOT NULL DEFAULT 51, -- percentage
  status VARCHAR DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  total_votes INTEGER DEFAULT 0,
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  outcome VARCHAR CHECK (outcome IN ('passed', 'rejected', 'insufficient_quorum')),
  blockchain_tx_hash VARCHAR,
  ipfs_hash VARCHAR, -- For storing proposal documents
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Governance Votes table
CREATE TABLE public.governance_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposal_id UUID REFERENCES public.governance_proposals(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  vote VARCHAR NOT NULL CHECK (vote IN ('for', 'against', 'abstain')),
  voting_weight DECIMAL(10,2) DEFAULT 1, -- Based on contribution or membership duration
  blockchain_tx_hash VARCHAR,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proposal_id, voter_id)
);

-- Loan Default Tracking table
CREATE TABLE public.loan_defaults (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  days_overdue INTEGER NOT NULL,
  amount_overdue DECIMAL(15,2) NOT NULL,
  penalty_amount DECIMAL(15,2) DEFAULT 0,
  status VARCHAR DEFAULT 'flagged' CHECK (status IN ('flagged', 'notified', 'collections', 'written_off')),
  flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_notification_sent TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Audit Log table for transparency
CREATE TABLE public.audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name VARCHAR NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  blockchain_tx_hash VARCHAR,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Financial Education Content table
CREATE TABLE public.financial_education_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  content_type VARCHAR NOT NULL CHECK (content_type IN ('tutorial', 'article', 'video', 'quiz', 'interactive')),
  category VARCHAR NOT NULL CHECK (category IN ('savings', 'loans', 'bitcoin', 'governance', 'security', 'mobile_money')),
  difficulty_level VARCHAR DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  content_data JSONB NOT NULL, -- Stores structured content (text, media URLs, quiz questions, etc.)
  estimated_duration INTEGER, -- Duration in minutes
  prerequisites TEXT[], -- Array of prerequisite content IDs
  language VARCHAR DEFAULT 'en' CHECK (language IN ('en', 'sw', 'fr', 'lg', 'rw')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Learning Progress table
CREATE TABLE public.user_learning_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.financial_education_content(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_spent INTEGER DEFAULT 0, -- Time spent in minutes
  quiz_score INTEGER, -- Score for quiz content (percentage)
  completion_data JSONB, -- Store specific progress data (bookmarks, answers, etc.)
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- System Monitoring table
CREATE TABLE public.system_monitoring (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  metric_type VARCHAR NOT NULL CHECK (metric_type IN ('api_response_time', 'transaction_volume', 'user_activity', 'error_rate', 'uptime', 'security_event')),
  metric_name VARCHAR NOT NULL,
  metric_value DECIMAL(15,4) NOT NULL,
  metric_unit VARCHAR, -- 'ms', 'count', 'percentage', 'bytes', etc.
  dimensions JSONB, -- Additional metric dimensions/tags
  alert_threshold DECIMAL(15,4), -- Alert threshold value
  is_alert BOOLEAN DEFAULT false, -- Whether this metric triggered an alert
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Events table
CREATE TABLE public.security_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type VARCHAR NOT NULL CHECK (event_type IN ('failed_login', 'suspicious_transaction', 'rate_limit_exceeded', 'kyc_verification_failed', 'unauthorized_access', 'fraud_detected')),
  severity VARCHAR DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id VARCHAR,
  ip_address INET,
  user_agent TEXT,
  event_data JSONB NOT NULL, -- Detailed event information
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Notifications table
CREATE TABLE public.system_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_type VARCHAR DEFAULT 'user' CHECK (recipient_type IN ('user', 'admin', 'group', 'system')),
  notification_type VARCHAR NOT NULL CHECK (notification_type IN ('transaction', 'loan_update', 'governance', 'security', 'education', 'system_alert', 'membership')),
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional notification data
  priority VARCHAR DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  delivery_method VARCHAR[] DEFAULT ARRAY['app'], -- Array of: 'app', 'email', 'sms', 'push'
  is_read BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Immutable Transaction History view (for member transparency)
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
  -- Calculate running balance
  SUM(CASE 
    WHEN t.type IN ('deposit', 'contribution', 'interest') THEN t.amount
    WHEN t.type IN ('withdrawal', 'loan') THEN -t.amount
    ELSE 0
  END) OVER (PARTITION BY t.user_id ORDER BY t.created_at) as running_balance,
  -- Add verification status for blockchain transparency
  CASE WHEN t.blockchain_tx_hash IS NOT NULL THEN 'verified' ELSE 'pending_verification' END as blockchain_status
FROM public.transactions t
LEFT JOIN public.sacco_groups sg ON t.sacco_group_id = sg.id
WHERE t.status = 'completed';

-- Governance Transparency View (for public governance tracking)
CREATE VIEW public.governance_transparency AS
SELECT 
  gp.id,
  gp.sacco_group_id,
  sg.name as sacco_group_name,
  gp.title,
  gp.description,
  gp.proposal_type,
  u.first_name || ' ' || u.last_name as proposed_by_name,
  gp.voting_start_date,
  gp.voting_end_date,
  gp.required_quorum,
  gp.required_majority,
  gp.status,
  gp.total_votes,
  gp.votes_for,
  gp.votes_against,
  gp.votes_abstain,
  gp.outcome,
  gp.blockchain_tx_hash,
  gp.ipfs_hash,
  gp.created_at,
  -- Calculate participation metrics
  ROUND((gp.total_votes::DECIMAL / sg.current_members) * 100, 2) as participation_rate,
  CASE 
    WHEN gp.total_votes > 0 THEN ROUND((gp.votes_for::DECIMAL / gp.total_votes) * 100, 2)
    ELSE 0
  END as approval_rate,
  -- Quorum status
  CASE 
    WHEN (gp.total_votes::DECIMAL / sg.current_members) * 100 >= gp.required_quorum THEN 'met'
    ELSE 'not_met'
  END as quorum_status
FROM public.governance_proposals gp
LEFT JOIN public.sacco_groups sg ON gp.sacco_group_id = sg.id
LEFT JOIN public.users u ON gp.proposed_by = u.id;

-- Loan Default Transparency View (for member awareness)
CREATE VIEW public.loan_default_transparency AS
SELECT 
  ld.id,
  l.sacco_group_id,
  sg.name as sacco_group_name,
  ld.loan_id,
  l.amount as loan_amount,
  l.interest_rate,
  l.due_date,
  ld.days_overdue,
  ld.amount_overdue,
  ld.penalty_amount,
  ld.status,
  ld.flagged_at,
  ld.last_notification_sent,
  -- Privacy: Don't expose borrower identity, only aggregate stats
  'ANONYMOUS' as borrower_status,
  -- Risk metrics for transparency
  CASE 
    WHEN ld.days_overdue <= 30 THEN 'low_risk'
    WHEN ld.days_overdue <= 90 THEN 'medium_risk'
    ELSE 'high_risk'
  END as risk_level
FROM public.loan_defaults ld
JOIN public.loans l ON ld.loan_id = l.id
JOIN public.sacco_groups sg ON l.sacco_group_id = sg.id
WHERE ld.status IN ('flagged', 'notified', 'collections');

-- Membership Applications View (for admin review)
CREATE VIEW public.membership_applications AS
SELECT 
  sm.id,
  sm.user_id,
  u.first_name || ' ' || u.last_name as applicant_name,
  u.email as applicant_email,
  u.phone as applicant_phone,
  u.kyc_status,
  sm.sacco_group_id,
  sg.name as sacco_group_name,
  sm.status,
  sm.applied_at,
  sm.approved_by,
  approver.first_name || ' ' || approver.last_name as approved_by_name,
  sm.approved_at,
  sm.rejected_at,
  sm.rejection_reason,
  -- Group capacity check
  sg.current_members,
  sg.max_members,
  CASE 
    WHEN sg.current_members >= sg.max_members THEN 'at_capacity'
    WHEN sg.current_members >= (sg.max_members * 0.9) THEN 'near_capacity'
    ELSE 'available'
  END as group_capacity_status
FROM public.sacco_memberships sm
JOIN public.users u ON sm.user_id = u.id
JOIN public.sacco_groups sg ON sm.sacco_group_id = sg.id
LEFT JOIN public.users approver ON sm.approved_by = approver.id
WHERE sm.status IN ('pending', 'approved', 'rejected');

-- Learning Progress Dashboard View
CREATE VIEW public.learning_dashboard AS
SELECT 
  u.id as user_id,
  u.first_name || ' ' || u.last_name as user_name,
  COUNT(ulp.id) as total_content_accessed,
  COUNT(CASE WHEN ulp.status = 'completed' THEN 1 END) as completed_content,
  COUNT(CASE WHEN ulp.status = 'in_progress' THEN 1 END) as in_progress_content,
  ROUND(AVG(CASE WHEN ulp.quiz_score IS NOT NULL THEN ulp.quiz_score END), 2) as average_quiz_score,
  SUM(ulp.time_spent) as total_learning_time_minutes,
  MAX(ulp.last_accessed) as last_learning_activity,
  -- Calculate completion rate by category
  json_build_object(
    'savings', COUNT(CASE WHEN fec.category = 'savings' AND ulp.status = 'completed' THEN 1 END),
    'loans', COUNT(CASE WHEN fec.category = 'loans' AND ulp.status = 'completed' THEN 1 END),
    'bitcoin', COUNT(CASE WHEN fec.category = 'bitcoin' AND ulp.status = 'completed' THEN 1 END),
    'governance', COUNT(CASE WHEN fec.category = 'governance' AND ulp.status = 'completed' THEN 1 END),
    'security', COUNT(CASE WHEN fec.category = 'security' AND ulp.status = 'completed' THEN 1 END)
  ) as category_completion
FROM public.users u
LEFT JOIN public.user_learning_progress ulp ON u.id = ulp.user_id
LEFT JOIN public.financial_education_content fec ON ulp.content_id = fec.id
GROUP BY u.id, u.first_name, u.last_name;

-- System Health Dashboard View
CREATE VIEW public.system_health_dashboard AS
SELECT 
  sm.metric_type,
  sm.metric_name,
  AVG(sm.metric_value) as avg_value,
  MIN(sm.metric_value) as min_value,
  MAX(sm.metric_value) as max_value,
  COUNT(*) as sample_count,
  COUNT(CASE WHEN sm.is_alert THEN 1 END) as alert_count,
  MAX(sm.recorded_at) as last_recorded,
  sm.metric_unit
FROM public.system_monitoring sm
WHERE sm.recorded_at >= NOW() - INTERVAL '24 hours'
GROUP BY sm.metric_type, sm.metric_name, sm.metric_unit;

-- Security Events Summary View
CREATE VIEW public.security_events_summary AS
SELECT 
  se.event_type,
  se.severity,
  COUNT(*) as event_count,
  COUNT(CASE WHEN se.is_resolved = false THEN 1 END) as unresolved_count,
  AVG(se.risk_score) as avg_risk_score,
  MAX(se.created_at) as latest_event,
  -- Count unique users affected
  COUNT(DISTINCT se.user_id) as affected_users
FROM public.security_events se
WHERE se.created_at >= NOW() - INTERVAL '30 days'
GROUP BY se.event_type, se.severity;

-- Indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_bitnob_wallet_id ON public.users(bitnob_wallet_id);
CREATE INDEX idx_users_role ON public.users(role);

CREATE INDEX idx_sacco_groups_name ON public.sacco_groups(name);
CREATE INDEX idx_sacco_groups_created_by ON public.sacco_groups(created_by);
CREATE INDEX idx_sacco_groups_is_active ON public.sacco_groups(is_active);

CREATE INDEX idx_sacco_memberships_user_id ON public.sacco_memberships(user_id);
CREATE INDEX idx_sacco_memberships_sacco_group_id ON public.sacco_memberships(sacco_group_id);
CREATE INDEX idx_sacco_memberships_is_active ON public.sacco_memberships(is_active);
CREATE INDEX idx_sacco_memberships_status ON public.sacco_memberships(status);
CREATE INDEX idx_sacco_memberships_applied_at ON public.sacco_memberships(applied_at);
CREATE INDEX idx_sacco_memberships_approved_by ON public.sacco_memberships(approved_by);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_sacco_group_id ON public.transactions(sacco_group_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX idx_transactions_bitnob_transaction_id ON public.transactions(bitnob_transaction_id);

CREATE INDEX idx_loans_borrower_id ON public.loans(borrower_id);
CREATE INDEX idx_loans_sacco_group_id ON public.loans(sacco_group_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_loans_due_date ON public.loans(due_date);

CREATE INDEX idx_savings_accounts_user_id ON public.savings_accounts(user_id);
CREATE INDEX idx_savings_accounts_sacco_group_id ON public.savings_accounts(sacco_group_id);
CREATE INDEX idx_savings_accounts_account_type ON public.savings_accounts(account_type);

CREATE INDEX idx_governance_proposals_sacco_group_id ON public.governance_proposals(sacco_group_id);
CREATE INDEX idx_governance_proposals_status ON public.governance_proposals(status);
CREATE INDEX idx_governance_proposals_proposal_type ON public.governance_proposals(proposal_type);
CREATE INDEX idx_governance_proposals_voting_dates ON public.governance_proposals(voting_start_date, voting_end_date);

CREATE INDEX idx_governance_votes_proposal_id ON public.governance_votes(proposal_id);
CREATE INDEX idx_governance_votes_voter_id ON public.governance_votes(voter_id);

CREATE INDEX idx_loan_defaults_loan_id ON public.loan_defaults(loan_id);
CREATE INDEX idx_loan_defaults_status ON public.loan_defaults(status);
CREATE INDEX idx_loan_defaults_flagged_at ON public.loan_defaults(flagged_at);

CREATE INDEX idx_audit_log_table_record ON public.audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON public.audit_log(timestamp);

-- Indexes for Financial Education tables
CREATE INDEX idx_financial_education_content_category ON public.financial_education_content(category);
CREATE INDEX idx_financial_education_content_difficulty ON public.financial_education_content(difficulty_level);
CREATE INDEX idx_financial_education_content_language ON public.financial_education_content(language);
CREATE INDEX idx_financial_education_content_active ON public.financial_education_content(is_active);

CREATE INDEX idx_user_learning_progress_user_id ON public.user_learning_progress(user_id);
CREATE INDEX idx_user_learning_progress_content_id ON public.user_learning_progress(content_id);
CREATE INDEX idx_user_learning_progress_status ON public.user_learning_progress(status);
CREATE INDEX idx_user_learning_progress_last_accessed ON public.user_learning_progress(last_accessed);

-- Indexes for System Monitoring tables
CREATE INDEX idx_system_monitoring_type_time ON public.system_monitoring(metric_type, recorded_at);
CREATE INDEX idx_system_monitoring_name_time ON public.system_monitoring(metric_name, recorded_at);
CREATE INDEX idx_system_monitoring_alerts ON public.system_monitoring(is_alert, recorded_at);

CREATE INDEX idx_security_events_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at);
CREATE INDEX idx_security_events_resolved ON public.security_events(is_resolved);

CREATE INDEX idx_system_notifications_recipient ON public.system_notifications(recipient_id);
CREATE INDEX idx_system_notifications_type ON public.system_notifications(notification_type);
CREATE INDEX idx_system_notifications_unread ON public.system_notifications(recipient_id, is_read);
CREATE INDEX idx_system_notifications_created_at ON public.system_notifications(created_at);

-- Triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to automatically detect and flag loan defaults
CREATE OR REPLACE FUNCTION detect_loan_defaults()
RETURNS void AS $$
BEGIN
  -- Insert new loan defaults for overdue loans
  INSERT INTO public.loan_defaults (loan_id, days_overdue, amount_overdue, penalty_amount)
  SELECT 
    l.id,
    EXTRACT(DAY FROM (CURRENT_DATE - l.due_date))::INTEGER as days_overdue,
    l.remaining_balance,
    -- Calculate penalty (e.g., 5% of remaining balance after 30 days)
    CASE 
      WHEN EXTRACT(DAY FROM (CURRENT_DATE - l.due_date)) > 30 
      THEN l.remaining_balance * 0.05
      ELSE 0
    END as penalty_amount
  FROM public.loans l
  WHERE l.status = 'active'
    AND l.due_date < CURRENT_DATE
    AND l.remaining_balance > 0
    AND NOT EXISTS (
      SELECT 1 FROM public.loan_defaults ld 
      WHERE ld.loan_id = l.id AND ld.status != 'resolved'
    );
    
  -- Update existing loan defaults with current overdue amounts
  UPDATE public.loan_defaults ld
  SET 
    days_overdue = EXTRACT(DAY FROM (CURRENT_DATE - l.due_date))::INTEGER,
    amount_overdue = l.remaining_balance,
    penalty_amount = CASE 
      WHEN EXTRACT(DAY FROM (CURRENT_DATE - l.due_date)) > 30 
      THEN l.remaining_balance * 0.05
      ELSE ld.penalty_amount
    END
  FROM public.loans l
  WHERE ld.loan_id = l.id
    AND l.status = 'active'
    AND l.due_date < CURRENT_DATE
    AND ld.status IN ('flagged', 'notified', 'collections');
END;
$$ LANGUAGE plpgsql;

-- Function to automatically close governance proposals after voting period
CREATE OR REPLACE FUNCTION close_expired_governance_proposals()
RETURNS void AS $$
BEGIN
  -- Close proposals that have passed their voting deadline
  UPDATE public.governance_proposals
  SET 
    status = 'completed',
    outcome = CASE
      WHEN (total_votes::DECIMAL / (
        SELECT current_members FROM public.sacco_groups sg 
        WHERE sg.id = governance_proposals.sacco_group_id
      )) * 100 < required_quorum THEN 'insufficient_quorum'
      WHEN (votes_for::DECIMAL / total_votes) * 100 >= required_majority THEN 'passed'
      ELSE 'rejected'
    END,
    updated_at = NOW()
  WHERE status = 'active'
    AND voting_end_date < NOW()
    AND total_votes > 0;
    
  -- Handle proposals with no votes
  UPDATE public.governance_proposals
  SET 
    status = 'completed',
    outcome = 'insufficient_quorum',
    updated_at = NOW()
  WHERE status = 'active'
    AND voting_end_date < NOW()
    AND total_votes = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate member voting weight based on contributions
CREATE OR REPLACE FUNCTION calculate_voting_weight(member_user_id UUID, member_sacco_group_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  member_contributions DECIMAL(15,2);
  total_group_contributions DECIMAL(15,2);
  base_weight DECIMAL(10,2) := 1.0;
  contribution_weight DECIMAL(10,2);
BEGIN
  -- Get member's total contributions
  SELECT COALESCE(total_contributions, 0) INTO member_contributions
  FROM public.sacco_memberships 
  WHERE user_id = member_user_id AND sacco_group_id = member_sacco_group_id;
  
  -- Get total group contributions
  SELECT COALESCE(SUM(total_contributions), 1) INTO total_group_contributions
  FROM public.sacco_memberships 
  WHERE sacco_group_id = member_sacco_group_id AND is_active = true;
  
  -- Calculate contribution-based weight (max 2x base weight)
  contribution_weight := LEAST(
    (member_contributions / total_group_contributions) * 10, 
    1.0
  );
  
  RETURN base_weight + contribution_weight;
END;
$$ LANGUAGE plpgsql;

-- Function to approve membership application
CREATE OR REPLACE FUNCTION approve_membership(
  membership_id UUID,
  approver_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  sacco_group_uuid UUID;
  current_members_count INTEGER;
  max_members_count INTEGER;
  membership_exists BOOLEAN;
BEGIN
  -- Check if membership application exists and is pending
  SELECT 
    sm.sacco_group_id,
    sg.current_members,
    sg.max_members,
    TRUE
  INTO 
    sacco_group_uuid,
    current_members_count,
    max_members_count,
    membership_exists
  FROM public.sacco_memberships sm
  JOIN public.sacco_groups sg ON sm.sacco_group_id = sg.id
  WHERE sm.id = membership_id AND sm.status = 'pending';
  
  -- If membership doesn't exist or isn't pending, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if group has capacity
  IF current_members_count >= max_members_count THEN
    RETURN FALSE;
  END IF;
  
  -- Approve the membership
  UPDATE public.sacco_memberships
  SET 
    status = 'approved',
    approved_by = approver_user_id,
    approved_at = NOW(),
    joined_at = NOW(),
    is_active = TRUE
  WHERE id = membership_id;
  
  -- Update group member count
  UPDATE public.sacco_groups
  SET current_members = current_members + 1
  WHERE id = sacco_group_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to reject membership application
CREATE OR REPLACE FUNCTION reject_membership(
  membership_id UUID,
  rejector_user_id UUID,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if membership application exists and is pending
  IF NOT EXISTS (
    SELECT 1 FROM public.sacco_memberships 
    WHERE id = membership_id AND status = 'pending'
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Reject the membership
  UPDATE public.sacco_memberships
  SET 
    status = 'rejected',
    approved_by = rejector_user_id, -- Track who made the decision
    rejected_at = NOW(),
    rejection_reason = reason,
    is_active = FALSE
  WHERE id = membership_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to record learning progress
CREATE OR REPLACE FUNCTION update_learning_progress(
  p_user_id UUID,
  p_content_id UUID,
  p_status VARCHAR DEFAULT NULL,
  p_progress_percentage INTEGER DEFAULT NULL,
  p_time_spent INTEGER DEFAULT 0,
  p_quiz_score INTEGER DEFAULT NULL,
  p_completion_data JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert or update learning progress
  INSERT INTO public.user_learning_progress (
    user_id, 
    content_id, 
    status, 
    progress_percentage, 
    time_spent, 
    quiz_score, 
    completion_data,
    started_at,
    completed_at,
    last_accessed
  )
  VALUES (
    p_user_id,
    p_content_id,
    COALESCE(p_status, 'in_progress'),
    COALESCE(p_progress_percentage, 0),
    p_time_spent,
    p_quiz_score,
    p_completion_data,
    CASE WHEN p_status = 'in_progress' THEN NOW() ELSE NULL END,
    CASE WHEN p_status = 'completed' THEN NOW() ELSE NULL END,
    NOW()
  )
  ON CONFLICT (user_id, content_id)
  DO UPDATE SET
    status = COALESCE(p_status, user_learning_progress.status),
    progress_percentage = COALESCE(p_progress_percentage, user_learning_progress.progress_percentage),
    time_spent = user_learning_progress.time_spent + p_time_spent,
    quiz_score = COALESCE(p_quiz_score, user_learning_progress.quiz_score),
    completion_data = COALESCE(p_completion_data, user_learning_progress.completion_data),
    started_at = COALESCE(user_learning_progress.started_at, 
      CASE WHEN p_status = 'in_progress' THEN NOW() ELSE NULL END),
    completed_at = CASE WHEN p_status = 'completed' THEN NOW() 
                        ELSE user_learning_progress.completed_at END,
    last_accessed = NOW();
    
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to record system metrics
CREATE OR REPLACE FUNCTION record_system_metric(
  p_metric_type VARCHAR,
  p_metric_name VARCHAR,
  p_metric_value DECIMAL(15,4),
  p_metric_unit VARCHAR DEFAULT NULL,
  p_dimensions JSONB DEFAULT NULL,
  p_alert_threshold DECIMAL(15,4) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  is_alert_triggered BOOLEAN := FALSE;
BEGIN
  -- Check if metric value exceeds alert threshold
  IF p_alert_threshold IS NOT NULL AND p_metric_value > p_alert_threshold THEN
    is_alert_triggered := TRUE;
  END IF;
  
  -- Insert metric record
  INSERT INTO public.system_monitoring (
    metric_type,
    metric_name,
    metric_value,
    metric_unit,
    dimensions,
    alert_threshold,
    is_alert,
    recorded_at
  )
  VALUES (
    p_metric_type,
    p_metric_name,
    p_metric_value,
    p_metric_unit,
    p_dimensions,
    p_alert_threshold,
    is_alert_triggered,
    NOW()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type VARCHAR,
  p_severity VARCHAR DEFAULT 'medium',
  p_user_id UUID DEFAULT NULL,
  p_session_id VARCHAR DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_event_data JSONB DEFAULT '{}',
  p_risk_score INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  -- Insert security event
  INSERT INTO public.security_events (
    event_type,
    severity,
    user_id,
    session_id,
    ip_address,
    user_agent,
    event_data,
    risk_score,
    created_at
  )
  VALUES (
    p_event_type,
    p_severity,
    p_user_id,
    p_session_id,
    p_ip_address,
    p_user_agent,
    p_event_data,
    p_risk_score,
    NOW()
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to send notifications
CREATE OR REPLACE FUNCTION send_notification(
  p_recipient_id UUID,
  p_notification_type VARCHAR,
  p_title VARCHAR,
  p_message TEXT,
  p_recipient_type VARCHAR DEFAULT 'user',
  p_data JSONB DEFAULT NULL,
  p_priority VARCHAR DEFAULT 'normal',
  p_delivery_method VARCHAR[] DEFAULT ARRAY['app'],
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Insert notification
  INSERT INTO public.system_notifications (
    recipient_id,
    recipient_type,
    notification_type,
    title,
    message,
    data,
    priority,
    delivery_method,
    expires_at,
    created_at
  )
  VALUES (
    p_recipient_id,
    p_recipient_type,
    p_notification_type,
    p_title,
    p_message,
    p_data,
    p_priority,
    p_delivery_method,
    p_expires_at,
    NOW()
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sacco_groups_updated_at BEFORE UPDATE ON public.sacco_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_accounts_updated_at BEFORE UPDATE ON public.savings_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_governance_proposals_updated_at BEFORE UPDATE ON public.governance_proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_values, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_values, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON public.users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON public.transactions FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_governance_proposals AFTER INSERT OR UPDATE OR DELETE ON public.governance_proposals FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_governance_votes AFTER INSERT OR UPDATE OR DELETE ON public.governance_votes FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_loans AFTER INSERT OR UPDATE OR DELETE ON public.loans FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_sacco_groups AFTER INSERT OR UPDATE OR DELETE ON public.sacco_groups FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_sacco_memberships AFTER INSERT OR UPDATE OR DELETE ON public.sacco_memberships FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Trigger to automatically calculate voting weight when a vote is cast
CREATE OR REPLACE FUNCTION set_voting_weight()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate and set voting weight based on member contributions
  NEW.voting_weight := calculate_voting_weight(NEW.voter_id, (
    SELECT sacco_group_id FROM public.governance_proposals 
    WHERE id = NEW.proposal_id
  ));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_voting_weight_trigger 
  BEFORE INSERT ON public.governance_votes 
  FOR EACH ROW EXECUTE FUNCTION set_voting_weight();

-- Trigger to update proposal vote counts when votes are cast
CREATE OR REPLACE FUNCTION update_proposal_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.governance_proposals SET
      total_votes = total_votes + 1,
      votes_for = votes_for + CASE WHEN NEW.vote = 'for' THEN 1 ELSE 0 END,
      votes_against = votes_against + CASE WHEN NEW.vote = 'against' THEN 1 ELSE 0 END,
      votes_abstain = votes_abstain + CASE WHEN NEW.vote = 'abstain' THEN 1 ELSE 0 END,
      updated_at = NOW()
    WHERE id = NEW.proposal_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote changes
    UPDATE public.governance_proposals SET
      votes_for = votes_for 
        - CASE WHEN OLD.vote = 'for' THEN 1 ELSE 0 END
        + CASE WHEN NEW.vote = 'for' THEN 1 ELSE 0 END,
      votes_against = votes_against 
        - CASE WHEN OLD.vote = 'against' THEN 1 ELSE 0 END
        + CASE WHEN NEW.vote = 'against' THEN 1 ELSE 0 END,
      votes_abstain = votes_abstain 
        - CASE WHEN OLD.vote = 'abstain' THEN 1 ELSE 0 END
        + CASE WHEN NEW.vote = 'abstain' THEN 1 ELSE 0 END,
      updated_at = NOW()
    WHERE id = NEW.proposal_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.governance_proposals SET
      total_votes = total_votes - 1,
      votes_for = votes_for - CASE WHEN OLD.vote = 'for' THEN 1 ELSE 0 END,
      votes_against = votes_against - CASE WHEN OLD.vote = 'against' THEN 1 ELSE 0 END,
      votes_abstain = votes_abstain - CASE WHEN OLD.vote = 'abstain' THEN 1 ELSE 0 END,
      updated_at = NOW()
    WHERE id = OLD.proposal_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_proposal_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.governance_votes
  FOR EACH ROW EXECUTE FUNCTION update_proposal_vote_counts();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacco_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacco_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_education_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);
CREATE POLICY "Admins can update user profiles" ON public.users FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- SACCO groups are readable by all authenticated users
CREATE POLICY "SACCO groups are readable by all" ON public.sacco_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create SACCO groups" ON public.sacco_groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update their SACCO groups" ON public.sacco_groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all SACCO groups" ON public.sacco_groups FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- SACCO memberships
CREATE POLICY "Users can view their memberships" ON public.sacco_memberships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can apply for membership" ON public.sacco_memberships FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  status = 'pending' AND 
  is_active = false
);
CREATE POLICY "Users can update their pending applications" ON public.sacco_memberships FOR UPDATE USING (
  auth.uid() = user_id AND 
  status = 'pending'
);

-- SACCO group admins can view and manage membership applications in their groups
CREATE POLICY "Group admins can view group memberships" ON public.sacco_memberships FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sacco_memberships sm 
    WHERE sm.sacco_group_id = sacco_memberships.sacco_group_id 
    AND sm.user_id = auth.uid() 
    AND sm.role IN ('admin', 'treasurer')
    AND sm.is_active = true
  )
);
CREATE POLICY "Group admins can approve/reject memberships" ON public.sacco_memberships FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.sacco_memberships sm 
    WHERE sm.sacco_group_id = sacco_memberships.sacco_group_id 
    AND sm.user_id = auth.uid() 
    AND sm.role IN ('admin', 'treasurer')
    AND sm.is_active = true
  )
);

-- Super admins can manage all memberships
CREATE POLICY "Super admins can manage all memberships" ON public.sacco_memberships FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Transactions
CREATE POLICY "Users can view their transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can create transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);
CREATE POLICY "Admins can manage all transactions" ON public.transactions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Loans
CREATE POLICY "Users can view their loans" ON public.loans FOR SELECT USING (auth.uid() = borrower_id);
CREATE POLICY "Users can create loan applications" ON public.loans FOR INSERT WITH CHECK (auth.uid() = borrower_id);

-- Savings accounts
CREATE POLICY "Users can view their savings accounts" ON public.savings_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create savings accounts" ON public.savings_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their savings accounts" ON public.savings_accounts FOR UPDATE USING (auth.uid() = user_id);

-- Governance proposals - members can view proposals in their SACCO groups
CREATE POLICY "Members can view group proposals" ON public.governance_proposals FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sacco_memberships sm 
    WHERE sm.sacco_group_id = governance_proposals.sacco_group_id 
    AND sm.user_id = auth.uid() 
    AND sm.is_active = true
  )
);
CREATE POLICY "Members can create proposals" ON public.governance_proposals FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sacco_memberships sm 
    WHERE sm.sacco_group_id = sacco_group_id 
    AND sm.user_id = auth.uid() 
    AND sm.is_active = true
  )
);
CREATE POLICY "Admins can manage all proposals" ON public.governance_proposals FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Governance votes - members can view and cast votes in their groups
CREATE POLICY "Members can view votes" ON public.governance_votes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.governance_proposals gp
    JOIN public.sacco_memberships sm ON gp.sacco_group_id = sm.sacco_group_id
    WHERE gp.id = governance_votes.proposal_id 
    AND sm.user_id = auth.uid() 
    AND sm.is_active = true
  )
);
CREATE POLICY "Members can cast votes" ON public.governance_votes FOR INSERT WITH CHECK (
  auth.uid() = voter_id AND
  EXISTS (
    SELECT 1 FROM public.governance_proposals gp
    JOIN public.sacco_memberships sm ON gp.sacco_group_id = sm.sacco_group_id
    WHERE gp.id = proposal_id 
    AND sm.user_id = auth.uid() 
    AND sm.is_active = true
    AND gp.status = 'active'
    AND NOW() BETWEEN gp.voting_start_date AND gp.voting_end_date
  )
);

-- Loan defaults - visible to loan borrowers and admins
CREATE POLICY "Borrowers can view their loan defaults" ON public.loan_defaults FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.loans l
    WHERE l.id = loan_defaults.loan_id AND l.borrower_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage loan defaults" ON public.loan_defaults FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Audit log - admins only for full access, users can view their own actions
CREATE POLICY "Users can view their audit log" ON public.audit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all audit logs" ON public.audit_log FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Additional policies for transparency views
-- Note: Views inherit permissions from underlying tables, but we can add explicit grants

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.member_transaction_history TO authenticated;
GRANT SELECT ON public.governance_transparency TO authenticated;
GRANT SELECT ON public.loan_default_transparency TO authenticated;
GRANT SELECT ON public.membership_applications TO authenticated;
GRANT SELECT ON public.learning_dashboard TO authenticated;
GRANT SELECT ON public.system_health_dashboard TO authenticated;
GRANT SELECT ON public.security_events_summary TO authenticated;

-- Create maintenance procedures for automated operations
-- These can be called via cron jobs or scheduled functions

-- Procedure to run daily maintenance tasks
CREATE OR REPLACE FUNCTION run_daily_maintenance()
RETURNS void AS $$
BEGIN
  -- Detect and flag loan defaults
  PERFORM detect_loan_defaults();
  
  -- Close expired governance proposals
  PERFORM close_expired_governance_proposals();
  
  -- Update member contribution totals
  UPDATE public.sacco_memberships sm
  SET 
    total_contributions = (
      SELECT COALESCE(SUM(t.amount), 0)
      FROM public.transactions t
      WHERE t.user_id = sm.user_id 
        AND t.sacco_group_id = sm.sacco_group_id
        AND t.type = 'contribution'
        AND t.status = 'completed'
    ),
    last_contribution_date = (
      SELECT MAX(t.created_at)
      FROM public.transactions t
      WHERE t.user_id = sm.user_id 
        AND t.sacco_group_id = sm.sacco_group_id
        AND t.type = 'contribution'
        AND t.status = 'completed'
    )
  WHERE sm.is_active = true;
  
  -- Update SACCO group member counts
  UPDATE public.sacco_groups sg
  SET current_members = (
    SELECT COUNT(*)
    FROM public.sacco_memberships sm
    WHERE sm.sacco_group_id = sg.id AND sm.is_active = true
  );
  
END;
$$ LANGUAGE plpgsql;

-- Procedure for blockchain verification and transparency reporting
CREATE OR REPLACE FUNCTION generate_transparency_report(sacco_group_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'sacco_group_id', sacco_group_uuid,
    'report_generated_at', NOW(),
    'summary', json_build_object(
      'total_members', (
        SELECT COUNT(*) FROM public.sacco_memberships 
        WHERE sacco_group_id = sacco_group_uuid AND is_active = true
      ),
      'total_transactions', (
        SELECT COUNT(*) FROM public.transactions 
        WHERE sacco_group_id = sacco_group_uuid AND status = 'completed'
      ),
      'total_volume', (
        SELECT COALESCE(SUM(amount), 0) FROM public.transactions 
        WHERE sacco_group_id = sacco_group_uuid AND status = 'completed'
      ),
      'verified_on_blockchain', (
        SELECT COUNT(*) FROM public.transactions 
        WHERE sacco_group_id = sacco_group_uuid 
          AND status = 'completed' 
          AND blockchain_tx_hash IS NOT NULL
      ),
      'active_proposals', (
        SELECT COUNT(*) FROM public.governance_proposals 
        WHERE sacco_group_id = sacco_group_uuid AND status = 'active'
      ),
      'loan_defaults', (
        SELECT COUNT(*) FROM public.loan_default_transparency 
        WHERE sacco_group_id = sacco_group_uuid
      )
    ),
    'blockchain_verification_rate', (
      SELECT ROUND(
        (COUNT(*) FILTER (WHERE blockchain_tx_hash IS NOT NULL)::DECIMAL / 
         NULLIF(COUNT(*), 0)) * 100, 2
      )
      FROM public.transactions 
      WHERE sacco_group_id = sacco_group_uuid AND status = 'completed'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON VIEW public.member_transaction_history IS 'Immutable view of member transaction history with running balances and blockchain verification status';
COMMENT ON VIEW public.governance_transparency IS 'Public view of governance proposals and voting outcomes for transparency';
COMMENT ON VIEW public.loan_default_transparency IS 'Anonymous view of loan defaults for member awareness while preserving privacy';
COMMENT ON VIEW public.membership_applications IS 'View of membership applications for admin review and approval';
COMMENT ON VIEW public.learning_dashboard IS 'Dashboard view showing user learning progress and statistics';
COMMENT ON VIEW public.system_health_dashboard IS 'Real-time system health metrics for administrators';
COMMENT ON VIEW public.security_events_summary IS 'Summary of security events for monitoring and analysis';

COMMENT ON TABLE public.financial_education_content IS 'Educational content for financial literacy (tutorials, articles, videos, quizzes)';
COMMENT ON TABLE public.user_learning_progress IS 'Tracks individual user progress through educational content';
COMMENT ON TABLE public.system_monitoring IS 'System performance and health metrics for monitoring';
COMMENT ON TABLE public.security_events IS 'Security incidents and events for audit and monitoring';
COMMENT ON TABLE public.system_notifications IS 'In-app and external notifications for users and admins';

COMMENT ON FUNCTION detect_loan_defaults() IS 'Automatically detects and flags overdue loans with penalty calculations';
COMMENT ON FUNCTION close_expired_governance_proposals() IS 'Automatically closes governance proposals after voting period ends';
COMMENT ON FUNCTION calculate_voting_weight(UUID, UUID) IS 'Calculates member voting weight based on contributions and membership';
COMMENT ON FUNCTION approve_membership(UUID, UUID) IS 'Approves a pending membership application if group has capacity';
COMMENT ON FUNCTION reject_membership(UUID, UUID, TEXT) IS 'Rejects a pending membership application with optional reason';
COMMENT ON FUNCTION update_learning_progress(UUID, UUID, VARCHAR, INTEGER, INTEGER, INTEGER, JSONB) IS 'Updates user progress through educational content';
COMMENT ON FUNCTION record_system_metric(VARCHAR, VARCHAR, DECIMAL, VARCHAR, JSONB, DECIMAL) IS 'Records system performance and health metrics';
COMMENT ON FUNCTION log_security_event(VARCHAR, VARCHAR, UUID, VARCHAR, INET, TEXT, JSONB, INTEGER) IS 'Logs security events and incidents';
COMMENT ON FUNCTION send_notification(UUID, VARCHAR, VARCHAR, TEXT, VARCHAR, JSONB, VARCHAR, VARCHAR[], TIMESTAMP WITH TIME ZONE) IS 'Sends notifications to users and admins';
COMMENT ON FUNCTION run_daily_maintenance() IS 'Runs daily maintenance tasks including loan default detection and proposal closure';
COMMENT ON FUNCTION generate_transparency_report(UUID) IS 'Generates comprehensive transparency report for a SACCO group';
