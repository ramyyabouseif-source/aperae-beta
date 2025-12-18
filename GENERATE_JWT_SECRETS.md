# Generate JWT Secrets - PowerShell Method

## 🎯 **Quick Method (Copy & Paste)**

Since OpenSSL isn't installed, use this PowerShell command:

### **Generate JWT_SECRET:**

**Copy and paste this entire command into PowerShell:**

```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})))
```

**This will output:** A random base64 string (copy this for JWT_SECRET)

### **Generate REFRESH_SECRET:**

**Run the same command AGAIN** (copy and paste):

```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})))
```

**This will output:** A DIFFERENT random base64 string (copy this for REFRESH_SECRET)

---

## 📋 **Alternative: Use Online Generator**

If PowerShell method doesn't work, use this online tool:

1. **Go to:** https://randomkeygen.com/
2. **Click:** "Fort Knox Passwords" tab
3. **Copy:** Any long random password (64+ characters)
4. **Use this** for both JWT_SECRET and REFRESH_SECRET (use different ones!)

---

## ✅ **What You Need:**

- **JWT_SECRET:** One long random string (32+ characters)
- **REFRESH_SECRET:** A different long random string (32+ characters)

**Example format:**
- `Kj8mN3pQ9wR2sT5vX7yZ0bC4dF6gH1jK`
- `mP9nR4sT7vW0yZ2bE5gH8jK1mN3pQ6s`

**You can even make up random strings if needed!** Just make sure:
- At least 32 characters long
- Mix of letters and numbers
- Different for each secret

---

**Try the PowerShell command above and tell me what output you get!**




