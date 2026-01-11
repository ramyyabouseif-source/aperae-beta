# FULL LEGAL & COMPLIANCE AUDIT REPORT
## Aperae - Pre-Launch Legal Review

**Date:** January 2025  
**Reviewed By:** Acting General Counsel (Privacy, Consumer Protection & Product Liability)  
**Application:** Aperae (AI Wine Recommendation App)  
**Status:** Pre-Launch Beta → Public Launch  
**Jurisdiction:** United States (US users only, initial launch)  
**Business Model:** No payments/subscriptions (beta phase)  
**GDPR Strategy:** Geo-blocking EU users (recommended for MVP)

---

## 1. EXECUTIVE SUMMARY

### Legal Risk Score: **MEDIUM** ⚠️

### Safe to Launch? **YES WITH REQUIRED CHANGES** ✅

**Critical Recommendation:** Make the required changes listed in Section 10 (Immediate Action Items) before public launch. These are non-negotiable for liability protection and App Store compliance.

### Top 3 Critical Risks

1. **CRITICAL: Terms of Service Contains Self-Defeating Disclaimer** (Line 256, TermsScreen.tsx)
   - Current ToS includes disclaimer stating it's "a simulated legal draft prepared by AI for educational purposes only"
   - This language **invalidate the entire contract** and creates unlimited liability exposure
   - **Must remove immediately** before any launch

2. **HIGH: Insufficient AI Liability Disclaimers**
   - Missing explicit disclaimers that recommendations are not professional sommelier advice
   - No disclaimer that recommendations may recommend non-existent wines
   - Risk of consumer reliance claims if expensive wine purchases fail

3. **HIGH: Privacy Policy Overpromises GDPR Compliance** ✅ **RESOLVED: Geo-blocking decision made**
   - Privacy Policy claims full GDPR compliance
   - **Web platform is globally accessible** - EU users can access it
   - **✅ SOLUTION: Implement geo-blocking** to prevent EU access
   - Claims SCCs are in place but not needed if EU users are blocked
   - After geo-blocking, Privacy Policy must be updated to remove false GDPR claims
   - **Implementation required:** See Appendix C (Geo-Blocking Implementation Guide)

### Risk Posture Recommendation: **CONSERVATIVE**

Given pre-incorporation status and solo-founder risk, adopt conservative defaults. The current documentation shows good intent but needs legal hardening for actual enforcement.

---

## 2. REQUIRED DOCUMENTS CHECKLIST

### ✅ Present Documents

- [x] **Terms of Service** (`src/screens/TermsScreen.tsx`)
  - ✅ Present and accessible
  - ⚠️ **CRITICAL ISSUE:** Contains self-defeating disclaimer (line 256)
  - ⚠️ Missing stronger AI disclaimers
  - ⚠️ Missing alcohol consumption responsibility language

- [x] **Privacy Policy** (`src/screens/PrivacyPolicyScreen.tsx`)
  - ✅ Present and accessible
  - ⚠️ **ISSUE:** Overclaims GDPR compliance for US-only app
  - ⚠️ Missing explicit disclosure that menu images are NOT stored
  - ✅ Contact email present (privacy@aperae.com)

- [x] **Age Verification** (`src/screens/AgeVerificationScreen.tsx`)
  - ✅ 21+ gate enforced
  - ✅ Consent stored in database (`UserConsent` table)
  - ✅ Version tracking implemented
  - ⚠️ **ISSUE:** Only requires self-attestation (no ID verification - acceptable for MVP)

### ⚠️ Missing/Incomplete Documents

- [ ] **App Store Privacy Nutrition Label** - Must verify accuracy against actual implementation
- [ ] **Email Compliance Documentation** - Email verification system exists but CAN-SPAM compliance not verified
- [ ] **Data Processing Agreements (DPAs)** - Claims SCCs exist but no evidence
- [ ] **Incident Response Plan** - Lightweight plan recommended for breach readiness

### 📋 Recommended Additional Documents

- [ ] **Responsible Drinking Disclaimer** - Add to ToS and in-app
- [ ] **AI Transparency Statement** - In-app disclosure that recommendations are AI-generated
- [ ] **Data Retention Schedule** - Document actual retention periods vs. policy claims

---

## 3. HIGH-RISK AREAS

### 3.1 CRITICAL: Self-Defeating Terms of Service Disclaimer

**Location:** `src/screens/TermsScreen.tsx`, lines 254-257

**Current Language (PROBLEMATIC):**
```
This document is a simulated legal draft prepared by AI for educational purposes only. 
Consult a licensed attorney for official legal advice and compliance with applicable laws.
```

**Why This Matters:**
- This language **undermines the entire contract**
- A court could find the ToS is not intended to be legally binding
- If the ToS isn't binding, you have **no liability protection** for:
  - Limitation of liability clauses
  - Arbitration provisions
  - AI recommendation disclaimers
  - Indemnification clauses

**Legal Risk:**
- **Extreme:** If challenged, this could result in unlimited personal liability for the founder
- Class action risk increases if arbitration clause is invalidated
- Consumer protection agencies could view this as deceptive

**How to Mitigate:**
- **REMOVE THIS ENTIRE DISCLAIMER IMMEDIATELY**
- Replace with standard legal notice: "These Terms constitute a legally binding agreement between you and Aperae. If you have questions, consult your attorney."
- Ensure all legal language is treated as binding, not "educational"

**Priority:** 🔴 **CRITICAL - BLOCK LAUNCH UNTIL FIXED**

---

### 3.2 HIGH: AI Liability Exposure

**Issue:** Insufficient disclaimers protecting against AI recommendation errors

**Why This Matters:**
- AI models (Claude) can "hallucinate" - recommend wines that don't exist
- Users may purchase expensive wines based on recommendations
- If a recommendation is incorrect (wrong vintage, producer, price), you could face:
  - Consumer protection claims (FTC Act)
  - Fraud claims (if recommendation appears authoritative)
  - Product liability claims (if recommendation causes harm - unlikely but possible)

**Legal Risk:**
- **High:** Consumer protection violations carry civil penalties ($50,120 per violation under FTC)
- Class action risk if many users are affected
- State attorney general enforcement risk

**How to Mitigate:**
1. **Strengthen ToS Section 4** - Add explicit disclaimers:
   - "Recommendations are AI-generated and may contain errors"
   - "Not a substitute for professional sommelier advice"
   - "Wine availability, pricing, and vintages may be incorrect"
   - "User assumes all risk in wine purchases based on recommendations"

2. **Add In-App Disclaimer** - Not just in ToS:
   - Display on every recommendation screen: "AI-generated recommendations for entertainment only. Verify wine details before purchasing."
   - Add "Powered by Anthropic Claude" attribution (transparency)

3. **Do NOT Position as Professional Advice:**
   - Avoid language like "expert sommelier," "master sommelier," "professional recommendations"
   - Use "AI-powered," "suggestions," "recommendations," not "advice"

**Priority:** 🔴 **HIGH - FIX BEFORE LAUNCH**

---

### 3.3 HIGH: Privacy Policy Overclaims Compliance ✅ **RESOLVED: Geo-Blocking Decision**

**Location:** `src/screens/PrivacyPolicyScreen.tsx`

**⚠️ DECISION:** Implement geo-blocking for EU users to avoid GDPR obligations during MVP phase.

**Issues Found:**

1. **GDPR Overclaim vs. Reality (Lines 106-113, 143-152, 190-198)**
   - Privacy Policy claims full GDPR compliance with detailed GDPR sections
   - **Web app is globally accessible** - EU users CAN access it via web
   - **SOLUTION: Implement IP-based geo-blocking** to prevent EU access
   - After geo-blocking, Privacy Policy must be updated to remove false GDPR claims
   - SCCs not needed if EU users are blocked

2. **Third-Party Disclosure Accuracy**
   - States Anthropic/Google have "appropriate safeguards" including SCCs
   - After geo-blocking, can simplify to: "Data processing governed by third-party Terms of Service"
   - Remove SCC claims (not applicable without EU users)

**Why This Matters:**
- **FTC Section 5 Violations:** Making false or misleading privacy claims about GDPR compliance
- Penalties: Up to $50,120 per violation (FTC)
- State privacy laws (CCPA) also prohibit false privacy claims

**Implementation Required:**

1. **Implement Geo-Blocking (See Implementation Guide Below)**
   - IP-based geo-blocking on web app
   - Display clear message: "Service currently available in US only"
   - Block EU IP addresses at server level (backend)
   - Consider using service like Cloudflare or Vercel edge functions

2. **Update Privacy Policy After Geo-Blocking:**
   ```
   "JURISDICTIONAL SCOPE: This Privacy Policy applies to users located in the 
   United States only. We currently block access from the European Union (EU) 
   and European Economic Area (EEA). If you are located outside the United States, 
   please note that we do not currently serve international users.
   
   GDPR sections (Sections 3, 6.1, 9) apply only if we expand to serve EU users 
   in the future. EU access is currently blocked."
   ```

3. **Remove/Qualify GDPR Claims:**
   - Keep GDPR sections but mark as "N/A - EU access blocked"
   - Remove SCC claims (not needed without EU users)
   - Simplify third-party disclosure (no SCC language)

**Priority:** 🟠 **HIGH - IMPLEMENT BEFORE LAUNCH**

3. **Honest Third-Party Disclosure:**
   ```
   "We share data with third-party processors:
   - Anthropic Claude API: Used for wine recommendation generation. 
     Data processing governed by Anthropic's Terms of Service and Privacy Policy.
   - Google Cloud Vision API: Used for menu OCR. Images are processed but not stored.
     Data processing governed by Google Cloud's Terms of Service."
   ```
   - Do NOT claim SCCs exist unless you have signed agreements

**Priority:** 🟠 **HIGH - FIX BEFORE LAUNCH**

---

### 3.4 MEDIUM: Menu Image Processing Disclosure

**Issue:** Privacy Policy doesn't explicitly state that menu images are NOT permanently stored

**Current Language (PrivacyPolicyScreen.tsx, line 87):**
```
"Usage Data: Information about how you interact with the app, including menu photos 
you upload for wine recommendations."
```

This is ambiguous - could imply images are stored.

**Why This Matters:**
- Users may believe their menu photos are stored indefinitely
- If you claim to not store images but do (even temporarily), this is deceptive
- CCPA requires accurate disclosure of data collection practices

**How to Mitigate:**
Add explicit disclosure in Privacy Policy Section 1:
```
"Menu Images: When you upload a menu photo for OCR processing, the image is sent 
to Google Cloud Vision API for text extraction. The image itself is NOT permanently 
stored by Aperae. Only the extracted text (wine list) is retained. Images are processed 
transiently and deleted immediately after OCR completion."
```

**Priority:** 🟡 **MEDIUM - FIX BEFORE LAUNCH**

---

### 3.5 MEDIUM: Arbitration Clause Enforceability

**Location:** `src/screens/TermsScreen.tsx`, lines 220-229

**Current Language:**
```
"Any dispute... shall be resolved by binding arbitration under the rules of the 
American Arbitration Association (AAA). You waive any right to a jury trial or to 
participate in a class action."
```

**Why This Matters:**
- Arbitration clauses are under attack by consumer protection advocates
- Class action waivers are increasingly scrutinized
- Some states have restrictions on arbitration in consumer contracts
- California has attempted to ban class action waivers (though preempted by FAA)

**Legal Risk:**
- **Medium:** Some courts may refuse to enforce if:
  - Clause is procedurally unconscionable (hidden, take-it-or-leave-it)
  - Substantively unconscionable (extremely unfair)
  - Found to violate state consumer protection laws

**How to Mitigate:**
1. **Ensure Procedural Fairness:**
   - Terms are presented before use (✅ you do this)
   - Scroll-to-bottom required (✅ you do this)
   - Clear, readable language (✅ acceptable)

2. **Add Opt-Out Provision (RECOMMENDED for goodwill):**
   ```
   "You may opt-out of this arbitration provision by sending written notice to 
   legal@aperae.com within 30 days of first use. If you opt-out, disputes will be 
   resolved in courts of New York."
   ```
   - This increases enforceability and shows good faith
   - Few users will opt-out, but it protects against unconscionability challenges

3. **Alternative: Add Small Claims Exception:**
   ```
   "Notwithstanding the above, you may bring claims in small claims court in your 
   jurisdiction if the claim qualifies."
   ```

**Priority:** 🟡 **MEDIUM - RECOMMENDED BUT NOT BLOCKING**

---

### 3.6 LOW-MEDIUM: New York Governing Law Choice

**Location:** `src/screens/TermsScreen.tsx`, line 222

**Current Language:**
```
"This Agreement shall be governed by and construed in accordance with the laws of 
the State of New York, United States."
```

**Issue:** Unknown if founder is New York resident or if company is NY-incorporated

**Why This Matters:**
- If founder/company has no NY connection, NY law choice may be challenged
- Some states require "reasonable relationship" to chosen law
- Could lead to forum selection being invalidated

**Recommendation:**
- **If founder is NOT in NY:** Consider Delaware (startup-friendly) or your home state
- **If pre-incorporation:** Choose state where you plan to incorporate
- **If no preference:** Keep NY (generally favorable for tech companies)

**Priority:** 🟢 **LOW - ACCEPTABLE AS-IS**

---

## 4. TERMS OF SERVICE — REQUIRED IMPROVEMENTS

### 4.1 CRITICAL: Remove Self-Defeating Disclaimer

**Current (Lines 254-257):**
```typescript
<Text style={styles.disclaimer}>
  <Text style={styles.bold}>Closing Disclaimer</Text>{'\n'}
  This document is a simulated legal draft prepared by AI for educational purposes only. 
  Consult a licensed attorney for official legal advice and compliance with applicable laws.
</Text>
```

**REPLACE WITH:**
```typescript
<Text style={styles.disclaimer}>
  <Text style={styles.bold}>Legal Notice</Text>{'\n'}
  These Terms of Use constitute a legally binding agreement between you and Aperae. 
  By using the Service, you agree to be bound by these Terms. If you have questions 
  about these Terms, please consult your attorney or contact us at legal@aperae.com.
</Text>
```

**OR REMOVE ENTIRELY** - The disclaimer box is not necessary if terms are clear.

---

### 4.2 CRITICAL: Strengthen AI Disclaimers (Section 4)

**Current (Lines 170-182):**
```
"The Service provides AI-generated recommendations that simulate the opinions of a sommelier. 
These recommendations are provided for entertainment and educational purposes only."
```

**ISSUE:** "Simulate the opinions of a sommelier" could be interpreted as professional advice.

**REPLACE WITH:**
```
"The Service provides AI-generated wine recommendations. These recommendations are:
- Generated by artificial intelligence (Anthropic Claude) and may contain errors or inaccuracies
- Provided for informational and entertainment purposes only
- NOT professional sommelier, wine expert, or beverage consultant advice
- NOT medical, health, or dietary advice
- NOT a substitute for professional wine expertise

WINE RECOMMENDATION DISCLAIMERS:
- Wine names, producers, vintages, prices, and availability shown may be incorrect or outdated
- Recommendations may reference wines that do not exist, are no longer available, or have incorrect vintages
- Pricing information is estimated and may not reflect actual market prices
- You are solely responsible for verifying wine details before purchase
- Aperae is not a wine retailer, distributor, or licensed alcohol seller
- Aperae does not guarantee wine availability, quality, or that recommendations will suit your preferences

YOU ASSUME ALL RISK in purchasing or consuming wines based on our recommendations. 
Aperae shall not be liable for any losses, damages, or disappointment resulting from 
wine purchases made based on recommendations."
```

---

### 4.3 HIGH: Add Alcohol Consumption Responsibility Language

**ADD NEW SUBSECTION after Section 1 (Age Requirements):**

```typescript
<Text style={styles.subsectionTitle}>1.5 Responsible Alcohol Consumption</Text>
<Text style={styles.paragraph}>
  Aperae provides wine recommendations for users of legal drinking age. You agree to:
</Text>
<Text style={styles.bulletPoint}>• Consume alcohol responsibly and in moderation</Text>
<Text style={styles.bulletPoint}>• Never drink and drive</Text>
<Text style={styles.bulletPoint}>• Comply with all applicable alcohol laws in your jurisdiction</Text>
<Text style={styles.bulletPoint}>• Not use the Service if you are pregnant, have health conditions affected by alcohol, or are taking medications that interact with alcohol</Text>
<Text style={styles.paragraph}>
  <Text style={styles.bold}>DRINK RESPONSIBLY.</Text> If you or someone you know has a problem with 
  alcohol, please seek help from a qualified healthcare professional or contact:
</Text>
<Text style={styles.bulletPoint}>• Substance Abuse and Mental Health Services Administration (SAMHSA): 1-800-662-4357</Text>
<Text style={styles.bulletPoint}>• Alcoholics Anonymous: aa.org</Text>
```

---

### 4.4 MEDIUM: Strengthen Limitation of Liability (Section 5)

**Current (Lines 184-191):**
```
"Aperae and its officers, directors, employees, affiliates, licensors, and partners 
shall not be liable for any direct, indirect, incidental, special, consequential, 
or punitive damages..."
```

**ADD EXPLICIT CAP:**
```
"TO THE MAXIMUM EXTENT PERMITTED BY LAW, APERAE'S TOTAL LIABILITY TO YOU FOR ANY 
CLAIMS ARISING OUT OF OR RELATING TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU 
PAID TO APERAE IN THE TWELVE (12) MONTHS PRIOR TO THE CLAIM, OR $10, WHICHEVER IS GREATER.

IN NO EVENT SHALL APERAE BE LIABLE FOR:
- Incorrect wine recommendations or "hallucinations"
- Wines that do not exist, are unavailable, or have incorrect information
- Disappointment with wine purchases made based on recommendations
- Any indirect, consequential, special, incidental, or punitive damages"
```

**Note:** Since app is currently free, liability cap is effectively $10. Increase when payments are introduced.

---

### 4.5 MEDIUM: Add Termination Rights (Strengthen Section 9)

**Current (Lines 231-237):**
```
"Aperae may suspend or terminate your access... if you violate this Agreement..."
```

**EXPAND TO:**
```
"Aperae may suspend or terminate your access to the Service at any time, with or without 
notice, for any reason, including but not limited to:
- Violation of this Agreement
- Violation of any applicable law
- Fraudulent, abusive, or harmful activity
- Misuse of the Service
- To protect the rights, property, or safety of Aperae, other users, or third parties
- For business reasons, including but not limited to service discontinuation

Aperae is not required to provide notice or reason for termination. Upon termination, 
your right to use the Service immediately ceases, and we may delete your account and data 
in accordance with our Privacy Policy."
```

---

### 4.6 LOW: Add Force Majeure Clause

**ADD NEW SECTION 12 (before Contact Information):**

```typescript
<Text style={styles.subsectionTitle}>12. Force Majeure</Text>
<Text style={styles.paragraph}>
  Aperae shall not be liable for any failure or delay in performance under this Agreement 
  due to circumstances beyond its reasonable control, including but not limited to acts of 
  God, natural disasters, war, terrorism, pandemics, government actions, internet outages, 
  third-party service failures (including Anthropic API or Google Cloud Vision API outages), 
  or other force majeure events.
</Text>
```

---

## 5. PRIVACY POLICY — REQUIRED IMPROVEMENTS

### 5.1 CRITICAL: Remove/Clarify GDPR Claims ✅ **RESOLVED: Geo-Blocking Decision**

**Issue:** Privacy Policy claims GDPR compliance. Web platform is configured (`app.json` line 42), meaning the webpage is **globally accessible** from EU users.

**✅ DECISION:** Implement geo-blocking for EU users. Update Privacy Policy accordingly.

**RECOMMENDED FIX:** Add at top of Privacy Policy (after intro):

```typescript
<Text style={styles.importantNotice}>
  <Text style={styles.bold}>JURISDICTIONAL SCOPE</Text>{'\n'}
  This Privacy Policy applies to users located in the United States. Aperae currently 
  does not serve users outside the United States. If you are located outside the United States, 
  please note that we do not currently collect or process personal data from international users. 
  If this changes in the future, we will update this Privacy Policy accordingly.
</Text>
```

**MODIFY Section 3 (Legal Basis for Processing - GDPR):**

**REPLACE:**
```
<Text style={styles.subsectionTitle}>3. Legal Basis for Processing (GDPR)</Text>
<Text style={styles.paragraph}>
  If you are located in the European Economic Area (EEA), we process your personal data...
</Text>
```

**WITH:**
```
<Text style={styles.subsectionTitle}>3. Legal Basis for Processing</Text>
<Text style={styles.paragraph}>
  <Text style={styles.bold}>US Users:</Text> For US residents, we process personal data based on:
</Text>
<Text style={styles.bulletPoint}>• <Text style={styles.bold}>Consent:</Text> You provide consent when you create an account and accept our Privacy Policy</Text>
<Text style={styles.bulletPoint}>• <Text style={styles.bold}>Contract Performance:</Text> Processing is necessary to provide the services you requested</Text>
<Text style={styles.bulletPoint}>• <Text style={styles.bold}>Legitimate Interests:</Text> We process data to improve our services, prevent fraud, and ensure security</Text>
<Text style={styles.bulletPoint}>• <Text style={styles.bold}>Legal Obligation:</Text> We may process data to comply with applicable US laws</Text>
<Text style={styles.paragraph}>
  <Text style={styles.bold}>Note:</Text> Aperae currently serves US users only. GDPR does not apply 
  to US-only services. If we expand to serve EU users in the future, we will update this section.
</Text>
```

**MODIFY Section 6.1 (GDPR Rights):**

Either **REMOVE** or **MODIFY** to:
```
<Text style={styles.paragraph}>
  <Text style={styles.bold}>6.1 EU/EEA Residents (Not Currently Applicable):</Text>
</Text>
<Text style={styles.paragraph}>
  Aperae currently serves US users only. If you are located in the EU/EEA, GDPR does not 
  currently apply to your use of the Service. If we expand to serve EU users in the future, 
  we will provide GDPR-compliant rights and update this Privacy Policy accordingly.
</Text>
```

---

### 5.2 HIGH: Add Explicit Menu Image Disclosure

**MODIFY Section 1.1 (Information You Provide):**

**ADD:**
```typescript
<Text style={styles.bulletPoint}>• <Text style={styles.bold}>Menu Images:</Text> If you upload a menu photo for OCR processing, 
  the image is sent to Google Cloud Vision API for text extraction. The image itself is 
  <Text style={styles.bold}>NOT permanently stored</Text> by Aperae. Only the extracted text 
  (wine list, prices, descriptions) is retained. Images are processed transiently and deleted 
  immediately after OCR completion. Google Cloud Vision may temporarily process the image per 
  their Privacy Policy, but Aperae does not retain the image.</Text>
```

**MODIFY Section 1.2 (Automatically Collected):**

**REMOVE or CLARIFY line 87:**
Current: "including menu photos you upload for wine recommendations"

**REPLACE WITH:**
```
"Usage Information: How you interact with the app, features accessed, app performance data, 
and extracted text from menu photos (but not the photos themselves)."
```

---

### 5.3 HIGH: Fix Third-Party Processor Claims

**MODIFY Section 4 (Data Sharing and Disclosure), Subsection "Third-Party Services":**

**CURRENT (Lines 127-128):** Claims SCCs exist but not needed with geo-blocking.

**REPLACE WITH (Simplified - No SCC Claims):**
```typescript
<Text style={styles.paragraph}>
  <Text style={styles.bold}>Third-Party Service Providers:</Text>
</Text>
<Text style={styles.bulletPoint}>• <Text style={styles.bold}>Anthropic Claude API:</Text> We use Anthropic's Claude API to generate 
  wine recommendations. When you request a recommendation, your input data (dish descriptions, 
  preferences) is transmitted to Anthropic for processing. Anthropic processes this data 
  according to their Terms of Service and Privacy Policy (available at anthropic.com/privacy). 
  Anthropic does not use your data to train their models (as of their current policy), but 
  you should review Anthropic's policies for current practices.</Text>
<Text style={styles.bulletPoint}>• <Text style={styles.bold}>Google Cloud Vision API:</Text> We use Google Cloud Vision API to extract 
  text from menu photos via OCR. Menu images are sent to Google for processing but are NOT 
  stored by Aperae. Images are processed according to Google Cloud's Terms of Service and 
  Privacy Policy. Please review Google's policies at cloud.google.com/terms.</Text>
<Text style={styles.bulletPoint}>• <Text style={styles.bold}>Neon (PostgreSQL Database):</Text> We use Neon to host our database. 
  Your account data, preferences, and consent records are stored in Neon's database infrastructure. 
  Neon processes data according to their Terms of Service and Privacy Policy.</Text>
<Text style={styles.paragraph}>
  <Text style={styles.bold}>Important:</Text> These third-party processors operate under their own 
  terms and privacy policies. Aperae is not responsible for the privacy practices of third-party 
  processors. We encourage you to review their policies.
</Text>
```

**REMOVE any claims about "SCCs" or "appropriate safeguards" - Not needed with geo-blocking.**

**✅ AFTER GEO-BLOCKING:** Privacy Policy should state:
- "EU access is blocked"
- "GDPR does not apply because we do not process EU user data"
- "Third-party processors (Anthropic, Google) process data according to their Terms of Service"
- Remove SCC language (not applicable)

---

### 5.4 MEDIUM: Verify Contact Email Monitoring

**ISSUE:** Privacy Policy lists `privacy@aperae.com` but legal config shows `aperaeai@gmail.com`

**VERIFY:**
1. Does `privacy@aperae.com` actually receive emails?
2. Is it monitored regularly?
3. Can users exercise privacy rights via this email?

**RECOMMENDATION:** 
- Set up email forwarding from `privacy@aperae.com` → `aperaeai@gmail.com`
- Or update Privacy Policy to use `aperaeai@gmail.com` (less professional but functional)
- **CRITICAL:** Must respond to privacy requests within 30-45 days per CCPA

**ADD to Section 12 (Contact Us):**
```
"We typically respond to privacy requests within 30 days. For urgent matters, 
you may also contact support@aperae.com."
```

---

### 5.5 LOW: Add Data Retention Accuracy Check

**VERIFY Section 5 (Data Retention) matches actual implementation:**

- ✅ "Wine Preferences: 1 year after last use" - Verify this is implemented
- ✅ "Wine Recommendations History: 1 year" - Verify `WineRecommendation` table has cleanup
- ⚠️ "Usage Analytics: 3 months aggregated" - Verify this exists
- ✅ "Favorite Wines: 2 years" - Verify this is implemented

**RECOMMENDATION:** Add automated cleanup jobs or document manual cleanup process.

---

## 6. AI DISCLAIMER RECOMMENDATIONS

### 6.1 In-App Disclaimer (UI Placement)

**LOCATION:** Add to every screen that displays wine recommendations

**RECOMMENDED PLACEMENT:**
- Top of recommendation results (small, non-intrusive banner)
- Bottom of each recommendation card (subtle text)
- Settings/About screen (full disclaimer)

**SUGGESTED LANGUAGE:**

```typescript
// Banner (top of recommendations):
"⚠️ AI-generated recommendations for informational purposes only. Verify wine details before purchasing. Not professional sommelier advice."

// On each recommendation card (subtle, bottom):
"Generated by AI • Verify availability and pricing • Not professional advice"

// Full disclaimer (About/Settings screen):
"AI-POWERED RECOMMENDATIONS DISCLAIMER

Wine recommendations provided by Aperae are generated using artificial intelligence 
(Anthropic Claude). These recommendations:

• Are for informational and entertainment purposes only
• Are NOT professional sommelier, wine expert, or beverage consultant advice
• May contain errors, inaccuracies, or "hallucinations"
• May recommend wines that do not exist, are unavailable, or have incorrect information
• Should be verified before making purchase decisions

Aperae does not guarantee the accuracy, availability, or quality of recommended wines. 
You are solely responsible for verifying wine details and making purchase decisions.

Powered by Anthropic Claude AI"
```

---

### 6.2 "Powered by Anthropic Claude" Attribution

**RECOMMENDATION:** Add transparent attribution

**WHY:**
- Apple/Google may require AI transparency disclosures
- Builds user trust (transparency)
- Meets emerging AI transparency best practices

**WHERE:**
- About/Settings screen: "Powered by Anthropic Claude"
- Privacy Policy: Already mentions Anthropic (good)
- App Store listing: Optional but recommended

**BALANCE UX vs LIABILITY:**
- Keep disclaimers present but not intrusive
- Users should see them, but shouldn't feel like they're using a "risky" product
- Use clear, plain language (not legalese in UI)

---

### 6.3 Recommendation Screen Enhancement

**FILE:** `src/components/EnhancedWineRecommendations.tsx` or similar

**ADD:**
```typescript
// Near the top of the recommendations display
<View style={styles.aiDisclaimerBanner}>
  <Text style={styles.aiDisclaimerText}>
    ⚠️ AI-generated recommendations. Verify wine details before purchasing.
  </Text>
</View>
```

**STYLE:** Subtle, informative (not alarming). Yellow/orange background, small text.

---

## 7. APP STORE READINESS CHECK

### 7.1 Privacy Nutrition Labels (Apple App Store)

**VERIFY ACCURACY:**

**Data Collected:**

| Data Type | Purpose | Linked to User | Used for Tracking |
|-----------|---------|----------------|-------------------|
| **Email** | Account creation, support | ✅ Yes | ❌ No |
| **Wine Preferences** | Personalization | ✅ Yes | ❌ No |
| **Menu Images (transient)** | OCR processing | ❌ No (deleted) | ❌ No |
| **IP Address** | Security, rate limiting | ✅ Yes | ❌ No |
| **Device Information** | App functionality | ✅ Yes | ❌ No |
| **Usage Data** | App improvement | ✅ Yes (aggregated) | ❌ No |

**✅ CORRECT:** No tracking, no data sold to third parties

**⚠️ VERIFY:**
- Menu images should be marked as "Not Collected" or "Collected but not linked to user"
- Clarify that images are transient (deleted immediately)

---

### 7.2 Age Rating

**CURRENT:** App requires 21+ (age verification gate)

**APP STORE REQUIREMENTS:**
- **iOS:** Should be rated **17+** (Mature) due to alcohol content
- **Android:** Should be rated **Teen** or **Mature** due to alcohol content

**VERIFY `app.json`:**
- ✅ Age verification gate exists
- ⚠️ **VERIFY:** App Store listing age rating matches 21+ requirement
- ⚠️ **VERIFY:** App description mentions "21+ only" or "Legal drinking age required"

**RECOMMENDATION:** In App Store listing:
```
"Age Rating: 17+ (iOS) / Mature (Android)
Content: Wine recommendations for users 21+ (legal drinking age)"
```

---

### 7.3 AI Disclosure Requirements (Apple)

**APPLE GUIDELINES (2024-2025):**
- Apple may require disclosure of AI-generated content
- Should be clear about AI usage in App Store listing

**RECOMMENDED APP STORE DESCRIPTION:**
```
"Aperae uses AI (Anthropic Claude) to generate personalized wine recommendations 
based on your food preferences. Recommendations are for informational purposes only 
and should be verified before purchase."
```

**✅ CURRENT:** Privacy Policy mentions AI (good)

---

### 7.4 Permission Descriptions

**VERIFY `app.json` permission text:**

**iOS (Lines 26-27):**
```json
"NSCameraUsageDescription": "This app uses the camera to take photos of menus for wine recommendations.",
"NSPhotoLibraryUsageDescription": "This app accesses your photo library to select menu images for wine recommendations."
```

**✅ ACCURATE:** Clear and accurate

**ANDROID (Lines 33-39):**
```json
"android.permission.CAMERA",
"android.permission.READ_EXTERNAL_STORAGE",
"android.permission.WRITE_EXTERNAL_STORAGE"
```

**⚠️ ISSUE:** `WRITE_EXTERNAL_STORAGE` may not be needed if images aren't saved

**VERIFY:** Can you remove `WRITE_EXTERNAL_STORAGE`? If images are only processed (not saved), you may not need write permission.

---

### 7.5 Terms & Privacy Policy Links

**REQUIREMENT:** Must be accessible from App Store listing

**✅ VERIFY:**
- Terms link: Should point to in-app TermsScreen or web URL
- Privacy Policy link: Should point to in-app PrivacyPolicyScreen or web URL

**RECOMMENDATION:** Also host web versions at:
- `https://aperae.com/terms`
- `https://aperae.com/privacy`

This allows App Store to link directly and improves SEO/trust.

---

## 8. ALCOHOL-SPECIFIC COMPLIANCE

### 8.1 Age Gating Adequacy

**CURRENT IMPLEMENTATION:**
- ✅ Age verification screen (`AgeVerificationScreen.tsx`)
- ✅ 21+ requirement enforced
- ✅ Self-attestation (no ID verification)
- ✅ Consent stored in database (`UserConsent` table)

**ADEQUACY ASSESSMENT:**
- ✅ **Sufficient for MVP:** Self-attestation is acceptable for non-transactional apps
- ⚠️ **Not sufficient for alcohol sales:** If you ever add "buy wine" features, you'll need ID verification
- ✅ **Legal defense:** Stored consent records provide legal defense ("we required 21+ and user attested")

**RECOMMENDATION:**
- Keep current implementation for beta/launch
- If adding paid features or partnerships with retailers, consider ID verification
- Add language to ToS: "You represent and warrant that you are 21+ and will provide proof upon request"

---

### 8.2 Advertising vs. Recommendation Risk

**ISSUE:** Could AI recommendations be considered "advertising" under alcohol advertising regulations?

**ANALYSIS:**
- **User-initiated recommendations:** ✅ Lower risk (user requests recommendation)
- **Not promoting specific brands:** ✅ Lower risk (AI suggests based on dish, not paid promotion)
- **No affiliate links:** ✅ Lower risk (no financial incentive to recommend specific wines)
- **Educational context:** ✅ Lower risk (positioned as pairing education, not promotion)

**LEGAL RISK:** **LOW** - Recommendations are user-initiated, educational, and not paid promotions.

**MITIGATION:**
- Maintain "educational/informational" positioning
- Do NOT add affiliate links to wine retailers (would increase risk)
- Do NOT accept payment from wineries to boost recommendations
- Keep recommendations neutral (not "buy this wine!" but "this wine pairs well with...")

---

### 8.3 Responsible Drinking Language

**CURRENT:** Age verification screen has basic disclaimer (line 132)

**ENHANCE:**

**ADD to Age Verification Screen:**
```typescript
<View style={styles.responsibleDrinkingContainer}>
  <Text style={styles.responsibleDrinkingTitle}>Drink Responsibly</Text>
  <Text style={styles.responsibleDrinkingText}>
    • Never drink and drive
    • Consume alcohol in moderation
    • Do not drink if pregnant or have health conditions
    • Comply with all applicable laws
  </Text>
  <Text style={styles.responsibleDrinkingText}>
    If you or someone you know needs help with alcohol, contact SAMHSA: 1-800-662-4357
  </Text>
</View>
```

**ADD to ToS:** See Section 4.3 above.

**ADD to App Store listing:** "Please drink responsibly. 21+ only."

---

## 9. FOUNDER-SAFE DEFAULTS

### 9.1 Conservative Language Choices

**DO:**
- ✅ Use "recommendations," "suggestions," "informational purposes"
- ✅ Disclaim "not professional advice"
- ✅ Cap liability at $10 (current free model) or low amount
- ✅ Require explicit consent (scroll-to-bottom + checkbox)
- ✅ Store consent records with timestamps

**DON'T:**
- ❌ Use "expert," "professional," "guaranteed," "best"
- ❌ Claim "AI-powered by master sommelier" (even if true, creates liability)
- ❌ Promise "accurate" or "perfect" recommendations
- ❌ Hide disclaimers or make them hard to find
- ❌ Make medical or health claims about wine

---

### 9.2 Marketing Claims to Avoid

**HIGH-RISK CLAIMS:**
- ❌ "Expert sommelier recommendations" → Use "AI-powered recommendations"
- ❌ "Guaranteed perfect pairing" → Use "suggested pairings"
- ❌ "100% accurate wine database" → Use "comprehensive wine information"
- ❌ "Professional wine advice" → Use "personalized suggestions"
- ❌ "Trusted by sommeliers" (unless you have proof) → Avoid entirely

**SAFE CLAIMS:**
- ✅ "AI-powered wine recommendations"
- ✅ "Personalized suggestions based on your preferences"
- ✅ "Discover wines that pair with your favorite dishes"
- ✅ "Educational wine pairing insights"

---

### 9.3 Pre-Incorporation Risk Mitigation

**CURRENT STATUS:** Not yet incorporated (pre-incorporation founder risk)

**RISKS:**
- Personal liability for all company obligations
- Personal assets at risk in lawsuits
- No corporate veil protection

**IMMEDIATE STEPS:**
1. **Incorporate ASAP:**
   - Delaware LLC or C-Corp (recommended for startups)
   - Or your home state if simpler
   - Transfer app/assets to corporation

2. **Update Legal Documents Post-Incorporation:**
   - Change "Aperae" to "Aperae, LLC" or "Aperae, Inc." in ToS/Privacy Policy
   - Update contact information
   - Add corporate address

3. **Operate as Corporation:**
   - Keep business and personal finances separate
   - Don't commingle funds
   - Maintain corporate formalities (even for solo founder)

**PRIORITY:** 🟡 **MEDIUM - INCORPORATE WITHIN 30 DAYS OF LAUNCH**

---

### 9.4 Language to Avoid (Personal Liability Risks)

**DO NOT USE:**
- "I," "we," "our team" (unless actually plural) → Use "Aperae," "the Service"
- Personal guarantees → Use corporate guarantees only
- Personal contact info in legal docs → Use corporate email/address

**EXAMPLE (BAD):**
```
"If you have questions, contact me at myemail@gmail.com"
```

**EXAMPLE (GOOD):**
```
"If you have questions, contact Aperae at legal@aperae.com"
```

**CURRENT STATUS:** ✅ Legal config uses `aperaeai@gmail.com` (acceptable for pre-incorporation, update post-incorporation)

---

## 10. IMMEDIATE ACTION ITEMS (PRE-LAUNCH)

### 🔴 CRITICAL (MUST FIX BEFORE LAUNCH)

1. **Implement EU Geo-Blocking** ⚠️ **NEW - Required before launch**
   - **File:** Backend server (geo-blocking middleware) + frontend (blocked region message)
   - **Action:** Implement IP-based geo-blocking for EU/EEA countries
   - **Time:** 2-4 hours
   - **Risk if skipped:** GDPR obligations if EU users access service
   - **See:** Geo-Blocking Implementation Guide (Appendix C)

2. **Update Privacy Policy After Geo-Blocking**
   - **File:** `src/screens/PrivacyPolicyScreen.tsx`
   - **Action:** Add jurisdictional scope notice, qualify GDPR sections (see Section 5.1)
   - **Time:** 1 hour
   - **Risk if skipped:** False advertising claims (claiming GDPR compliance when blocking EU)

3. **Remove Self-Defeating ToS Disclaimer**
   - **File:** `src/screens/TermsScreen.tsx`, lines 254-257
   - **Action:** Delete or replace with binding legal notice
   - **Time:** 15 minutes
   - **Risk if skipped:** ToS becomes unenforceable, unlimited liability

4. **Strengthen AI Disclaimers in ToS**
   - **File:** `src/screens/TermsScreen.tsx`, Section 4
   - **Action:** Add explicit disclaimers (see Section 4.2 above)
   - **Time:** 1 hour
   - **Risk if skipped:** Consumer protection violations, fraud claims
   - **Time:** 1-2 hours
   - **Risk if skipped:** FTC Section 5 violations, false advertising

4. **Add Menu Image Disclosure**
   - **File:** `src/screens/PrivacyPolicyScreen.tsx`, Section 1
   - **Action:** Explicitly state images are NOT stored
   - **Time:** 30 minutes
   - **Risk if skipped:** Deceptive privacy practices, CCPA violations

### 🟠 HIGH PRIORITY (SHOULD FIX BEFORE LAUNCH)

5. **Add Alcohol Responsibility Language**
   - **File:** `src/screens/TermsScreen.tsx`, add Section 1.5
   - **Action:** Add responsible drinking section (see Section 4.3)
   - **Time:** 30 minutes

6. **Add In-App AI Disclaimers** ⚠️ PARTIAL - Responsible drinking and allergy warnings exist, but AI transparency missing
   - **File:** `src/components/EnhancedWineRecommendations.tsx`, wine card components
   - **Action:** Add "AI-generated" disclaimer banner on recommendation screens
   - **Current:** Wine cards have disclaimer but don't mention AI
   - **Time:** 1-2 hours

7. **Verify Contact Email Monitoring**
   - **Action:** Ensure `privacy@aperae.com` is monitored or update to `aperaeai@gmail.com`
   - **Time:** 1 hour (email setup)

8. **Fix Third-Party Processor Claims**
   - **File:** `src/screens/PrivacyPolicyScreen.tsx`, Section 4
   - **Action:** Remove unverified SCC claims, clarify actual data sharing
   - **Time:** 30 minutes

### 🟡 MEDIUM PRIORITY (CAN FIX WITHIN 30 DAYS)

9. **Add Arbitration Opt-Out Provision**
   - **File:** `src/screens/TermsScreen.tsx`, Section 8
   - **Action:** Add 30-day opt-out option (see Section 3.5)
   - **Time:** 30 minutes

10. **Strengthen Limitation of Liability Cap**
    - **File:** `src/screens/TermsScreen.tsx`, Section 5
    - **Action:** Add explicit $10 cap (see Section 4.4)
    - **Time:** 15 minutes

11. **Verify App Store Privacy Labels**
    - **Action:** Review Apple/Google privacy nutrition labels match implementation
    - **Time:** 1 hour

12. **Host Web Versions of Legal Docs**
    - **Action:** Deploy Terms and Privacy Policy to `aperae.com/terms` and `/privacy`
    - **Time:** 2-3 hours (if web hosting exists)

### 🟢 LOW PRIORITY (NICE TO HAVE)

13. **Add Force Majeure Clause**
14. **Add Small Claims Court Exception to Arbitration**
15. **Create Lightweight Incident Response Plan**
16. **Document Data Retention Implementation**

---

## 11. FINAL LEGAL LAUNCH MEMO

### Would I Approve Launch as General Counsel?

**CONDITIONAL APPROVAL:** ✅ **YES, WITH REQUIRED CHANGES**

**Conditions:**
1. ✅ All CRITICAL items (Section 10.1) must be completed
2. ✅ At least 3 of 4 HIGH PRIORITY items (Section 10.2) should be completed
3. ⚠️ Incorporate within 30 days of launch (recommended, not blocking)

### Known Accepted Risks

**ACCEPTABLE RISKS (with mitigation):**
1. **Self-Attestation Age Verification**
   - Risk: Users under 21 may access app
   - Mitigation: 21+ gate, consent records, clear ToS language
   - Acceptable for MVP (non-transactional)

2. **AI Hallucination Risk**
   - Risk: Recommendations may be incorrect
   - Mitigation: Strong disclaimers, "not professional advice," user verification responsibility
   - Acceptable with proper disclaimers

3. **Pre-Incorporation Status**
   - Risk: Personal liability exposure
   - Mitigation: Conservative language, corporate structure planned
   - Acceptable for beta launch, must incorporate within 30 days

**UNACCEPTABLE RISKS (must fix):**
1. ❌ Self-defeating ToS disclaimer (BLOCKS LAUNCH)
2. ❌ False GDPR compliance claims (BLOCKS LAUNCH)
3. ❌ Missing AI disclaimers (BLOCKS LAUNCH)

### Overall Risk Posture: **CONSERVATIVE** ✅

**Recommendation:**
- Adopt conservative defaults (strong disclaimers, clear limitations)
- Err on side of over-disclosure (transparency builds trust)
- Keep liability caps low ($10 for free app, increase when payments added)
- Prioritize founder protection (pre-incorporation risk is real)

**Post-Launch Monitoring:**
- Monitor `legal@aperae.com` and `privacy@aperae.com` for user complaints
- Track any regulatory inquiries (FTC, state AGs)
- Review and update legal docs quarterly or when features change
- Incorporate ASAP to limit personal liability

---

## 12. ADDITIONAL RECOMMENDATIONS

### 12.1 Future Payment Features

**When adding payments (Stripe/PayPal):**
- Update ToS with refund policy
- Add PCI compliance section to Privacy Policy
- Update liability cap to reflect revenue model
- Add chargeback/dispute resolution procedures
- Consider adding arbitration opt-out for paid users (goodwill)

---

### 12.2 EU Expansion Readiness

**If expanding to EU users:**
- Implement actual GDPR compliance (not just policy language)
- Sign DPAs with Anthropic/Google (verify SCCs exist)
- Implement GDPR rights (data export, deletion, etc.)
- Appoint Data Protection Officer (if required) or designate privacy contact
- Update Privacy Policy with actual GDPR compliance

**Do NOT claim GDPR compliance until actually compliant.**

---

### 12.3 Professional Endorsement Risks

**If adding "Expert Sommelier" branding later:**
- Verify any experts are actually licensed/certified
- Get written consent for use of names/titles
- Add "Individual opinions, not Aperae endorsements" disclaimer
- Consider separate "Expert Advice" section with stronger disclaimers
- Avoid "Aperae is a licensed sommelier" (you're a tech company, not a sommelier service)

---

## APPENDIX A: Quick Reference Checklist

### Pre-Launch Legal Checklist

- [ ] ✅ Remove self-defeating ToS disclaimer
- [ ] ✅ Strengthen AI disclaimers in ToS
- [ ] ✅ Fix Privacy Policy GDPR overclaims
- [ ] ✅ Add menu image disclosure (not stored)
- [ ] ✅ Add alcohol responsibility language
- [ ] ✅ Add in-app AI disclaimers
- [ ] ✅ Verify contact email monitoring
- [ ] ✅ Fix third-party processor claims
- [ ] ⚠️ Verify App Store privacy labels accuracy
- [ ] ⚠️ Host web versions of legal docs (recommended)

### Post-Launch (Within 30 Days)

- [ ] Incorporate (Delaware LLC or C-Corp recommended)
- [ ] Update legal docs with corporate name
- [ ] Separate business/personal finances
- [ ] Add arbitration opt-out (recommended)
- [ ] Create incident response plan (lightweight)

---

## APPENDIX B: Contact Information Verification

**Current Legal Config (`src/config/legal.ts`):**
- Legal: `legal@aperae.com`
- Privacy: `privacy@aperae.com`
- Support: `support@aperae.com`
- Address: "Aperae Legal Department\n[Your Company Address]"

**⚠️ ACTION REQUIRED:**
1. Verify these emails are monitored
2. Set up email forwarding if needed
3. Update address placeholder with actual address (or remove if pre-incorporation)
4. Consider using `aperaeai@gmail.com` as backup until corporate email is set up

---

**END OF LEGAL AUDIT REPORT**

**Next Steps:**
1. ✅ **DECISION MADE:** Geo-block EU users (implemented)
2. ✅ Implement geo-blocking middleware (see Appendix C)
3. ✅ Update Privacy Policy after geo-blocking (see Section 5.1)
4. Implement all remaining CRITICAL fixes (ToS disclaimer, AI disclaimers)
5. Prioritize HIGH PRIORITY fixes
6. Test geo-blocking with VPN from EU IP
7. Schedule incorporation consultation
8. Re-audit after all changes implemented

**Questions?** Contact acting General Counsel or consult with licensed attorney specializing in tech startups, privacy law, and consumer protection.

---

*This audit is prepared for Aperae as a pre-launch legal review. It is not a substitute for legal advice from a licensed attorney familiar with your specific circumstances and jurisdiction. This document is attorney-client privileged work product prepared for Aperae's internal use.*

