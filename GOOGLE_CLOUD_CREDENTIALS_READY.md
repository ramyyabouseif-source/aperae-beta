# Google Cloud Credentials - Ready to Use ✅

**Status:** Verified and ready for staging deployment

---

## ✅ **Your Verified Values:**

```
GOOGLE_CLOUD_PROJECT_ID: pocketsomm-vision-api
GOOGLE_CLOUD_CLIENT_EMAIL: pocketsomm-vision-service@pocketsomm-vision-api.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY: [Your private key - see below]
```

---

## 📋 **How to Add to Render Staging Service**

### **Step 1: Go to Staging Service Environment Variables**

1. Open [Render Dashboard](https://dashboard.render.com/)
2. Go to your **staging service** (`aperae-backend-staging`)
3. Click **"Environment"** tab
4. Click **"Add Environment Variable"**

### **Step 2: Add Each Variable**

#### **Variable 1:**
- **Key:** `GOOGLE_CLOUD_PROJECT_ID`
- **Value:** `pocketsomm-vision-api`

#### **Variable 2:**
- **Key:** `GOOGLE_CLOUD_CLIENT_EMAIL`
- **Value:** `pocketsomm-vision-service@pocketsomm-vision-api.iam.gserviceaccount.com`

#### **Variable 3:**
- **Key:** `GOOGLE_CLOUD_PRIVATE_KEY`
- **Value:** 
```
-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCMlTYAlUq8azLI
Uo0XQ1t1dT+GBVVjSiyS1EiknSEkmAdIMDXj1GH3CKEciCmLr3zrA9qbx+ElQGQ2
yrj2DnKQamqvX59ztrz8rNx/5+e3hxABraF4+Wd5m3foS/xKh84XPm9U1MU3KoDz
pSa3eMt0xJBgYXQZYW3qcOn/TUyJYlMQf/fI8rmtxNmlABRx/b8lzRgK8qMCLpyd
+wZWap8g2FEi8ujyUV9+UktNqbsznYSWrbA9p8vsGP+XN5PyOBU/ORjP5GrXaNsB
9PbeHfbuO64BpwGorj4PV3sWTy9f6Db2T8DYlZaHll9QFJsjyKF0xaqbDPzukgB2
gmONWRkdAgMBAAECggEAHs81mE+foycAKGBVHP/NS7LgMtQ46CtxlNUyvWbVRGKQ
F/0+1jktphjNTEY4Cq2xPAUqdAEMYeBYhhyMCBrW9zjnPBuCA7dM+Dg/E8YEZZeT
RbbigDNyfrd4gh+jAUd9fmEXv5joxsQJIjxzvXpa5nKMrJ629bgBQYOw+Jtddm8T
he9RrzZVxCMV+VvRisYYraVS+W+gnRhYxjStqFz1ElglV7Tz3qA6wi3Vl8DLUYHy
jgBtYJOjlr8ycDZTk+j6nmKDczpo9D7zgzMV9MR1rUObbMc1ojqXi3hn+yGznlJq
M0e4CMVhXE1/bcEwDIsigjArq1WnJh2Dtn8Gm17TsQKBgQDGfhR6qRhc8L2O0Dnb
jUvAjDmveAZAlY5mgr2O8f0pZQuhgg5bSlOrmoRXloJNhmw3ekgavi99hjugp3bV
qVp3vQLUdeJRqbM5AN2UlviT7bxFm2SR4/dQenw9dlzZoAavQ353CKKWPOhtf7Su
zuKDMkRscAPF3lSb2LI3dAIRMQKBgQC1UA0OQmHHlGfx3mFwWKRDF8BE4aQIL9si
jp+1qMe2WUUK/xCBdFFcdNg+su+sjccXj1ou7QULjlC91kO1Qc+VORQGmvhHUmJC
7vVPjnlp+duROiN4G0yJb9ZKf1bKVcwNSPjKE95gZjhLPaV63FSV01fPLuJ5pOx6
6NRj5gRrrQKBgDowA7jhkS7NtAQFrrBZ/3b2pIJ34P1V2mTats8MyXY1FO/HvIWu
iFCp/1nd2Vz4pwisZC7SygE2NIyoCwIfn1Gyqv21gR8HbG6tfkds6noTGzocj6Lk
/T8uaPVrmVSCwPLoCk7CzUbVnB1dbo5AP87OEZjoTXLX9l2pbLUs4N5BAoGALnTM
Y5LuqsyDtZ1dKgQMUoSLZxrJhK9+XmRc15bfVQGahy7Dc+fx0Na/cZE3h+br1EWO
vedNG6DjX0C/KHosTffKAcdDRkL9mljP0gqXYWf7skJLREL6YVyec4gdHMrO9bh0
xpJAsEKAugaZl9lMcvcr0JIaxUBUt0lg4hfVmiECgYAygg/PNsvOY8KkehW3y326
1t1OeearJk4hU/BdiwcLFU9HuYEhkX0M0iuSBzxPRa+tRI5wvKtFIA11oKpOVCUP
wdXbXM3SCcD/VU64lrZnF/1HLR+l7ONiZBaJDON5Q6FOZu/Jilp6r9j49BdcGTJO
Z8qJ8O0D40amomdBpnkloA==
-----END PRIVATE KEY-----
```

**Important for Private Key:**
- Copy the **ENTIRE** value including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Render can handle both formats:
  - With `\n` characters (as shown in your JSON)
  - With actual newlines (paste as multi-line)
- Both will work - Render converts `\n` to actual newlines automatically

---

## ✅ **Verification**

After adding all three variables, verify:

1. All three variables are present in Environment tab
2. Values match exactly (especially email format)
3. Private key includes BEGIN/END markers
4. Save changes and redeploy

---

## 🎯 **Next Steps**

After adding these credentials:
1. ✅ Continue with remaining environment variables (ANTHROPIC_API_KEY, etc.)
2. ✅ Save all environment variables
3. ✅ Wait for service to redeploy
4. ✅ Test OCR endpoint: `POST /api/ocr/extract-text`

---

**Your credentials are verified and ready!** ✅

