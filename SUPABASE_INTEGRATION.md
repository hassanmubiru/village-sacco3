# Village SACCO - Supabase Backend Integration

## Overview

This document outlines the comprehensive Supabase backend integration for the Village SACCO platform, providing a robust, scalable database solution with real-time capabilities and built-in authentication.

## 🏗️ Architecture

### Database Schema

The platform uses a PostgreSQL database hosted on Supabase with the following core tables:

- **users** - User profiles and authentication data
- **sacco_groups** - SACCO group information and settings
- **sacco_memberships** - User membership in SACCO groups
- **transactions** - All financial transactions (Bitcoin and traditional)
- **loans** - Loan applications and management
- **savings_accounts** - Individual and group savings accounts

### Key Features

- 🔐 **Row Level Security (RLS)** - Data access controls
- 🚀 **Real-time subscriptions** - Live updates for transactions and group activities
- 🛡️ **Built-in authentication** - Secure user management
- 📊 **Advanced querying** - Complex financial calculations and reporting
- 🔄 **Automatic timestamps** - Created/updated tracking
- 🗃️ **Optimized indexes** - Fast query performance

## 🚀 Setup Instructions

### 1. Database Setup

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com and create a new project
   # Note down your project URL and API keys
   ```

2. **Run Database Migration**
   ```sql
   -- Execute the SQL in supabase/migrations/001_initial_schema.sql
   -- in your Supabase SQL editor
   ```

3. **Configure Environment Variables**
   ```bash
   # Update .env.local with your Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### 2. Authentication Setup

The platform uses Supabase Auth with email/password authentication:

```typescript
// Login user
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Register user (handled by API route)
const response = await fetch('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+256701234567',
    password: 'password123'
  })
});
```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user with automatic Bitcoin wallet creation.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+256701234567",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+256701234567",
    "role": "member",
    "bitnobWalletId": "wallet-id",
    "kycStatus": "not_started"
  }
}
```

#### POST `/api/auth/login`
Authenticate user and return profile data.

### SACCO Groups Endpoints

#### GET `/api/sacco-groups`
Get all SACCO groups or search/filter.

**Query Parameters:**
- `userId` - Get groups for specific user
- `creatorId` - Get groups created by user
- `search` - Search groups by name/description

#### POST `/api/sacco-groups`
Create a new SACCO group.

**Request Body:**
```json
{
  "name": "Village Savings Group",
  "description": "Monthly savings group for our village",
  "contributionAmount": 50000,
  "contributionFrequency": "monthly",
  "interestRate": 2.5,
  "maxMembers": 20,
  "createdBy": "user-uuid"
}
```

#### GET `/api/sacco-groups/[id]`
Get specific SACCO group details.

**Query Parameters:**
- `includeMembers=true` - Include member list
- `includeStats=true` - Include group statistics

#### POST `/api/sacco-groups/[id]/membership`
Join or leave a SACCO group.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "action": "join" // or "leave"
}
```

### Transactions Endpoints

#### GET `/api/transactions`
Get user transactions with filtering options.

**Query Parameters:**
- `userId` - Required: User ID
- `saccoGroupId` - Filter by SACCO group
- `type` - Filter by transaction type
- `limit` - Number of results (default: 50)
- `search` - Search transactions

#### POST `/api/transactions`
Create a new transaction record.

## 🛠️ Service Layer

### UserService
Manages user profiles and authentication data.

```typescript
// Get user by ID
const { data, error } = await UserService.getUserById(userId);

// Update user profile
const { data, error } = await UserService.updateUser(userId, {
  bitnob_wallet_id: 'new-wallet-id',
  kyc_status: 'approved'
});

// Search users
const { data, error } = await UserService.searchUsers('john');
```

### SaccoGroupService
Handles SACCO group operations and memberships.

```typescript
// Create SACCO group
const { data, error } = await SaccoGroupService.createSaccoGroup({
  name: 'Village Group',
  contribution_amount: 50000,
  contribution_frequency: 'monthly',
  interest_rate: 2.5,
  max_members: 20,
  created_by: userId
});

// Join group
const { data, error } = await SaccoGroupService.joinSaccoGroup(userId, groupId);

// Get group statistics
const { data, error } = await SaccoGroupService.getGroupStatistics(groupId);
```

### TransactionService
Manages all financial transactions.

```typescript
// Create transaction
const { data, error } = await TransactionService.createTransaction({
  user_id: userId,
  type: 'contribution',
  amount: 50000,
  currency: 'UGX',
  payment_method: 'lightning',
  sacco_group_id: groupId
});

// Get user transaction statistics
const { data, error } = await TransactionService.getUserTransactionStats(userId);
```

### LoanService
Handles loan applications and management.

```typescript
// Create loan application
const { data, error } = await LoanService.createLoan({
  borrower_id: userId,
  sacco_group_id: groupId,
  amount: 200000,
  interest_rate: 5.0,
  duration_months: 12,
  monthly_payment: 18000,
  purpose: 'Small business expansion'
});

// Approve loan
const { data, error } = await LoanService.approveLoan(loanId, approverId);
```

### SavingsService
Manages savings accounts and interest calculations.

```typescript
// Create savings account
const { data, error } = await SavingsService.createGroupSavingsAccount(
  userId,
  saccoGroupId,
  2.5 // interest rate
);

// Add to savings
const { data, error } = await SavingsService.addToSavings(
  accountId,
  25000, // UGX amount
  0.001  // BTC amount
);
```

## 🔄 Real-time Features

### Real-time Subscriptions

```typescript
// Subscribe to transaction updates
const subscription = supabase
  .channel('transactions')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'transactions',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Transaction update:', payload);
  })
  .subscribe();

// Subscribe to SACCO group updates
const groupSubscription = createRealtimeSubscription(
  'sacco_groups',
  `id=eq.${groupId}`,
  (payload) => {
    // Handle group updates
    dispatch(updateGroup(payload.new));
  }
);
```

## 🔒 Security Features

### Row Level Security (RLS)

The database implements comprehensive RLS policies:

- **Users** can only access their own profile data
- **SACCO groups** are readable by all authenticated users
- **Transactions** are only visible to the user involved
- **Loans** are only visible to the borrower and group admins
- **Savings accounts** are only accessible by the account owner

### Data Validation

All API endpoints include comprehensive validation:

```typescript
// Transaction validation
const requiredFields = ['user_id', 'type', 'amount', 'currency', 'payment_method'];
for (const field of requiredFields) {
  if (!transactionData[field]) {
    return NextResponse.json(
      { message: `${field} is required` },
      { status: 400 }
    );
  }
}
```

## 📊 Analytics and Reporting

### Built-in Analytics Functions

```typescript
// Get user transaction statistics
const stats = await TransactionService.getUserTransactionStats(userId);
// Returns: total transactions, deposits, withdrawals, contributions, etc.

// Get SACCO group statistics
const groupStats = await SaccoGroupService.getGroupStatistics(groupId);
// Returns: total contributions, active loans, member count, etc.

// Get loan statistics
const loanStats = await LoanService.getLoanStatistics(groupId);
// Returns: total loans, outstanding balance, default rate, etc.
```

## 🚀 Performance Optimizations

### Database Indexes

Optimized indexes for common query patterns:

```sql
-- User lookups
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_bitnob_wallet_id ON public.users(bitnob_wallet_id);

-- Transaction queries
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX idx_transactions_status ON public.transactions(status);

-- SACCO group operations
CREATE INDEX idx_sacco_memberships_user_id ON public.sacco_memberships(user_id);
CREATE INDEX idx_sacco_memberships_sacco_group_id ON public.sacco_memberships(sacco_group_id);
```

### Connection Pooling

Supabase handles connection pooling automatically, but you can optimize by:

- Using the service role key only for server-side operations
- Implementing proper error handling and retries
- Using batch operations for multiple database calls

## 🧪 Testing

### Database Testing

```typescript
// Test user creation
const { data: user } = await UserService.createUser({
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  phone: '+256700000000'
});

// Test SACCO group creation
const { data: group } = await SaccoGroupService.createSaccoGroup({
  name: 'Test Group',
  contribution_amount: 10000,
  contribution_frequency: 'monthly',
  interest_rate: 2.0,
  max_members: 10,
  created_by: user.id
});
```

## 🔧 Maintenance

### Regular Tasks

1. **Monitor database performance** via Supabase dashboard
2. **Review and update RLS policies** as needed
3. **Archive old transactions** to maintain performance
4. **Backup critical data** regularly
5. **Monitor API usage** and rate limits

### Database Migrations

For schema changes, create new migration files:

```sql
-- supabase/migrations/002_add_new_feature.sql
ALTER TABLE public.users ADD COLUMN new_field VARCHAR;
```

## 📈 Scaling Considerations

### Horizontal Scaling

- Supabase automatically handles read replicas
- Use connection pooling for high-traffic scenarios
- Implement caching for frequently accessed data

### Vertical Scaling

- Monitor database metrics in Supabase dashboard
- Upgrade database tier based on usage patterns
- Optimize queries with EXPLAIN ANALYZE

## 🛟 Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Check user authentication status
   - Verify policy conditions match your use case

2. **Connection Timeouts**
   - Implement proper error handling
   - Use connection retry logic

3. **Slow Queries**
   - Review query execution plans
   - Add appropriate indexes

### Monitoring

- Use Supabase dashboard for real-time metrics
- Set up alerts for critical operations
- Monitor API endpoint performance

## 🎯 Next Steps

1. **Set up automated testing** for database operations
2. **Implement comprehensive logging** for audit trails
3. **Add data analytics dashboard** for business insights
4. **Configure backup and disaster recovery** procedures
5. **Optimize for mobile app integration** if needed

---

This Supabase integration provides a solid foundation for the Village SACCO platform, offering scalability, security, and real-time capabilities essential for a modern financial application.
