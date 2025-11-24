# MCP Commands Quick Reference

## Supabase MCP Tool Commands

### Project Information

```bash
# List all Supabase projects
mcp_supabase_list_projects

# Get project details
mcp_supabase_get_project({ id: "jgyvkttbypjatuoigchc" })

# Get organization details
mcp_supabase_get_organization({ id: "your_org_id" })
```

### Database Operations

```bash
# List all tables
mcp_supabase_list_tables({
  project_id: "jgyvkttbypjatuoigchc",
  schemas: ["public"]
})

# List migrations
mcp_supabase_list_migrations({
  project_id: "jgyvkttbypjatuoigchc"
})

# Execute SQL query
mcp_supabase_execute_sql({
  project_id: "jgyvkttbypjatuoigchc",
  query: "SELECT * FROM profiles LIMIT 5;"
})

# Apply migration
mcp_supabase_apply_migration({
  project_id: "jgyvkttbypjatuoigchc",
  name: "migration_name_here",
  query: "SQL code here..."
})
```

### Storage Operations

```bash
# List Edge Functions
mcp_supabase_list_edge_functions({
  project_id: "jgyvkttbypjatuoigchc"
})

# Deploy Edge Function
mcp_supabase_deploy_edge_function({
  project_id: "jgyvkttbypjatuoigchc",
  name: "function-name",
  files: [{ name: "index.ts", content: "..." }]
})
```

### Security & Monitoring

```bash
# Get advisory notices (security & performance)
mcp_supabase_get_advisors({
  project_id: "jgyvkttbypjatuoigchc",
  type: "security" // or "performance"
})

# Get logs
mcp_supabase_get_logs({
  project_id: "jgyvkttbypjatuoigchc",
  service: "api" // or "postgres", "auth", "storage", "realtime", "edge-function"
})

# Generate TypeScript types
mcp_supabase_generate_typescript_types({
  project_id: "jgyvkttbypjatuoigchc"
})
```

### Development Branches

```bash
# List branches
mcp_supabase_list_branches({
  project_id: "jgyvkttbypjatuoigchc"
})

# Create development branch
mcp_supabase_create_branch({
  project_id: "jgyvkttbypjatuoigchc",
  name: "develop",
  confirm_cost_id: "cost_confirmation_id"
})

# Merge branch to production
mcp_supabase_merge_branch({
  branch_id: "branch_id_here"
})

# Reset branch
mcp_supabase_reset_branch({
  branch_id: "branch_id_here",
  migration_version: "optional_version"
})

# Delete branch
mcp_supabase_delete_branch({
  branch_id: "branch_id_here"
})
```

### Project Management

```bash
# Pause project
mcp_supabase_pause_project({
  project_id: "jgyvkttbypjatuoigchc"
})

# Restore project
mcp_supabase_restore_project({
  project_id: "jgyvkttbypjatuoigchc"
})

# Get API keys
mcp_supabase_get_anon_key({
  project_id: "jgyvkttbypjatuoigchc"
})

# Get project URL
mcp_supabase_get_project_url({
  project_id: "jgyvkttbypjatuoigchc"
})
```

## Common SQL Queries

### Check Table Row Counts
```sql
SELECT 
  schemaname,
  tablename,
  n_tup_ins as total_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### View All RLS Policies
```sql
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check Storage Usage
```sql
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  pg_size_pretty(SUM((metadata->>'size')::bigint)) as total_size
FROM storage.objects
GROUP BY bucket_id;
```

### View Recent Orders
```sql
SELECT 
  o.id,
  o.created_at,
  o.status,
  o.total_amount,
  p.full_name,
  p.email
FROM orders o
JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC
LIMIT 10;
```

### Check Inventory Levels
```sql
SELECT 
  p.name,
  p.stock,
  COUNT(DISTINCT pv.id) as variant_count,
  COALESCE(SUM(pv.stock), 0) as total_variant_stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id, p.name, p.stock
ORDER BY p.stock ASC;
```

### Active Coupons
```sql
SELECT 
  code,
  discount_type,
  discount_value,
  usage_count,
  usage_limit,
  valid_until
FROM coupons
WHERE is_active = true
  AND valid_from <= NOW()
  AND (valid_until IS NULL OR valid_until >= NOW())
ORDER BY created_at DESC;
```

## Troubleshooting

### Reset RLS Policies
```sql
-- Drop all policies for a table
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Disable RLS temporarily (not recommended for production)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### Check Trigger Functions
```sql
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

### View Failed Payments
```sql
SELECT 
  p.*,
  o.id as order_id,
  pr.email
FROM payments p
JOIN orders o ON p.order_id = o.id
JOIN profiles pr ON p.user_id = pr.id
WHERE p.status = 'failed'
ORDER BY p.created_at DESC;
```

### Coupon Usage Statistics
```sql
SELECT 
  c.code,
  c.discount_type,
  c.usage_count,
  COUNT(DISTINCT cu.user_id) as unique_users,
  SUM(cu.discount_amount) as total_discount_given
FROM coupons c
LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
GROUP BY c.id, c.code, c.discount_type, c.usage_count
ORDER BY total_discount_given DESC;
```

## Development Workflow

### 1. Create a Feature Branch
```bash
# Get cost estimate
mcp_supabase_get_cost({
  type: "branch",
  organization_id: "your_org_id"
})

# Confirm cost
mcp_supabase_confirm_cost({
  type: "branch",
  recurrence: "hourly",
  amount: cost_amount
})

# Create branch
mcp_supabase_create_branch({
  project_id: "jgyvkttbypjatuoigchc",
  name: "feature-xyz",
  confirm_cost_id: "confirmation_id"
})
```

### 2. Apply Migrations to Branch
```bash
# Switch to branch context and apply migrations
mcp_supabase_apply_migration({
  project_id: "branch_project_id",
  name: "add_new_feature",
  query: "CREATE TABLE ..."
})
```

### 3. Test on Branch
```bash
# Execute test queries
mcp_supabase_execute_sql({
  project_id: "branch_project_id",
  query: "INSERT INTO ... ; SELECT * FROM ...;"
})
```

### 4. Merge to Production
```bash
# Merge branch
mcp_supabase_merge_branch({
  branch_id: "branch_id"
})

# Verify on production
mcp_supabase_list_tables({
  project_id: "jgyvkttbypjatuoigchc"
})
```

### 5. Clean Up
```bash
# Delete branch after merge
mcp_supabase_delete_branch({
  branch_id: "branch_id"
})
```

## Best Practices

1. **Always test migrations on a branch first** before applying to production
2. **Use transactions** for complex multi-step operations
3. **Check advisors regularly** for security and performance issues
4. **Monitor logs** for errors and suspicious activity
5. **Back up data** before major schema changes
6. **Use RLS policies** for all tables with user data
7. **Index frequently queried columns** for performance
8. **Set up webhooks** for real-time event handling
9. **Use Edge Functions** for serverless backend logic
10. **Generate TypeScript types** after schema changes

## Emergency Procedures

### Rollback Migration
```sql
-- If migration was just applied, you can manually revert
-- Example: If you added a column
ALTER TABLE table_name DROP COLUMN column_name;

-- Or restore from a previous backup
```

### Clear User Cart
```sql
DELETE FROM cart_items WHERE user_id = 'user_uuid';
```

### Cancel Pending Orders
```sql
UPDATE orders 
SET status = 'cancelled',
    payment_status = 'cancelled'
WHERE status = 'pending' 
  AND created_at < NOW() - INTERVAL '24 hours';
```

### Deactivate Compromised Coupon
```sql
UPDATE coupons
SET is_active = false
WHERE code = 'COUPON_CODE';
```

## Project Details

- **Project ID**: jgyvkttbypjatuoigchc
- **Project Name**: E-commerce App Branding
- **Region**: us-east-1
- **Database**: PostgreSQL 17.6.1.044
- **Plan**: Free tier

## Quick Links

- Supabase Dashboard: https://supabase.com/dashboard/project/jgyvkttbypjatuoigchc
- API Documentation: https://supabase.com/docs/reference/javascript
- SQL Editor: https://supabase.com/dashboard/project/jgyvkttbypjatuoigchc/sql
- Storage: https://supabase.com/dashboard/project/jgyvkttbypjatuoigchc/storage
- Auth: https://supabase.com/dashboard/project/jgyvkttbypjatuoigchc/auth
