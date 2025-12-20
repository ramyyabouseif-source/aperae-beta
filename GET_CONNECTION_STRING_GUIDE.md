# How to Get Your Database Connection String from Supabase

## Step-by-Step Instructions

### Step 1: Navigate to Project Settings

1. **In Supabase Dashboard:**
   - Look at the **left sidebar**
   - Find and click **"Project Settings"** (gear icon ⚙️)
   - OR click on your **project name** at the top and select "Settings" from the dropdown

### Step 2: Go to Database Section

1. **In Project Settings:**
   - Look at the **left sidebar** (within settings)
   - Click on **"Database"** 
   - You should now see database-related settings

### Step 3: Find Connection String

You'll see several connection string options. Here's what to look for:

#### **Option A: Connection Pooling (RECOMMENDED for Production)**

- Look for section: **"Connection pooling"** or **"Connection string"**
- Find the URI that looks like:
  ```
  postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
  ```
- Click the **copy icon** (📋) or **"Copy"** button next to it

#### **Option B: Direct Connection (For Development)**

- Look for section: **"Connection string"** or **"Database URL"**
- Find the URI that looks like:
  ```
  postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
  ```
- You may see a placeholder `[YOUR-PASSWORD]` that you'll need to replace

### Step 4: Get Your Database Password (If Needed)

If your connection string has a placeholder like `[YOUR-PASSWORD]`:

1. **Still in Database Settings:**
   - Look for **"Database password"** section
   - You may see:
     - A masked password (hidden with dots)
     - An option to **"Reset database password"**

2. **If You Need to Reset:**
   - Click **"Reset database password"** button
   - Enter a new secure password
   - **IMPORTANT:** Save this password securely!
   - Replace `[YOUR-PASSWORD]` in your connection string with the actual password

3. **If Password is Visible:**
   - Click the "eye" icon or "reveal" button to show it
   - Copy the password

### Step 5: Replace Placeholder Values

Your connection string might look like:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

Replace:
- `[PROJECT-REF]` with your actual project reference (shown in your Supabase URL)
- `[PASSWORD]` with your actual database password
- `[REGION]` with your region (if shown)

### Step 6: Final Connection String Format

**For Connection Pooling (Recommended):**
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**For Direct Connection:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Note:** If your password contains special characters (like `@`, `#`, `%`, etc.), you may need to URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`
- `&` becomes `%26`

---

## Alternative: Finding Connection Info in Different Locations

### Method 1: API Settings

1. Go to **Project Settings** → **API**
2. Look for **"Database URL"** or **"Connection string"** section
3. Copy the connection string

### Method 2: Connection String Generator

1. In **Database Settings**
2. Look for **"Connection string"** section
3. You may see a dropdown to select connection type
4. Select your preferred option and copy

### Method 3: Environment Variables (If Using Supabase CLI)

If you're using Supabase CLI, connection info is in your local config.

---

## What Your Final Connection String Should Look Like

**Example Connection Pooling:**
```
postgresql://postgres.abcdefghijklmnop:MyPassword123!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Example Direct Connection:**
```
postgresql://postgres:MyPassword123!@db.abcdefghijklmnop.supabase.co:5432/postgres
```

---

## Troubleshooting

### Issue: "Cannot find Connection String section"

**Solutions:**
- Look under **Project Settings** → **Database**
- Check if you have the right permissions
- Try refreshing the page
- Look for "Connection string" in API settings instead

### Issue: "Password placeholder in connection string"

**Solution:**
- Go to Database Settings → Reset database password
- Create a new password
- Replace `[YOUR-PASSWORD]` in connection string

### Issue: "Connection refused when testing"

**Solutions:**
- Check if your password is correct
- Verify special characters are URL-encoded
- Try the direct connection string instead of pooling
- Check if your IP is allowed (if IP restrictions are enabled)

---

## Next Steps After Getting Connection String

1. ✅ Copy your connection string
2. ⏳ Add to `.env` file as `DATABASE_URL=...`
3. ⏳ Verify connection works
4. ⏳ Proceed with code implementation

---

**Once you have your connection string, let me know and I'll help you add it to your .env file!**










