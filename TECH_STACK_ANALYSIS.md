# PocketSomm Tech Stack Analysis & Limitations

## 📱 **Frontend Stack**

### **Core Technologies**
- **Framework**: React Native 0.81.4 (with Expo ~54.0.0)
- **Language**: TypeScript 5.9.2
- **React Version**: 19.1.0 (⚠️ Very new, potential compatibility issues)
- **Navigation**: React Navigation v6
- **Testing**: Jest 29.0.0, @testing-library/react-native

### **Storage Solutions**
- **Secure Storage**: Expo SecureStore (`expo-secure-store@15.0.7`)
  - Uses native keychain (iOS) / Keystore (Android)
  - **Limitations**:
    - iOS: Maximum key size ~2KB per item
    - Android: Key size limited by keymaster hardware
    - **Cannot store large objects** - only strings
    - **No encryption key rotation** without losing data
    - Requires native code access (no web support)
  
- **Async Storage**: `@react-native-async-storage/async-storage@2.2.0`
  - **Limitations**:
    - ~6MB storage limit on Android
    - ~10MB limit on iOS (may vary)
    - **Synchronous operations can block UI thread** with large data
    - No encryption (not secure for sensitive data)
    - Can be cleared by OS if device storage is low
    - Web support limited/buggy

- **SQLite**: `expo-sqlite@16.0.8` (⚠️ Installed but NOT used)
  - Available option for structured data
  - No size limits (within device storage)
  - Better performance for large datasets

### **Security & Crypto**
- **Crypto**: Expo Crypto (`expo-crypto@15.0.7`)
  - Provides SHA-256 hashing
  - **Limitations**:
    - No native encryption/decryption (only hashing)
    - Cannot use Node.js `crypto` module in React Native
    - Must rely on Expo SecureStore for key storage

### **Frontend Limitations**

1. **React 19.1.0 Compatibility Risk**
   - Released very recently (January 2025)
   - Many React Native libraries may not be fully tested with React 19
   - Potential for breaking changes or bugs
   - **Recommendation**: Consider downgrading to React 18.x for stability

2. **Encryption Key Storage Challenge**
   - Cannot use Node.js `crypto` module
   - Must use Expo SecureStore for secure key storage
   - Cannot generate encryption keys server-side (client-side only)
   - Keys are device-specific (cannot sync across devices)

3. **Storage Constraints**
   - AsyncStorage has size limits (~6-10MB)
   - SecureStore has item size limits (~2KB)
   - Large cache/offline data requires SQLite or cloud sync
   - No built-in sync across devices (offline-first architecture)

4. **Network Security**
   - Certificate pinning possible but complex
   - HTTP cleartext allowed in Android (risk if misconfigured)
   - Limited CSRF protection in mobile context (cookies not ideal)

5. **Build & Deployment**
   - EAS Build requires project ID configuration
   - App store review for native permissions (camera, photos)
   - OTA updates limited by Expo SDK version

---

## 🔧 **Backend Stack**

### **Core Technologies**
- **Runtime**: Node.js 18 (Alpine Linux)
- **Framework**: Express.js 4.18.2
- **Language**: JavaScript (CommonJS modules)
- **Container**: Docker (Alpine-based)
- **Process Manager**: dumb-init (for signal handling)

### **Database & Storage**
- **PostgreSQL**: Configured in docker-compose.yml (v15-alpine)
  - ⚠️ **CRITICAL**: No database driver installed (`pg` package missing)
  - Currently using in-memory `Map()` storage
  - Database connection code not implemented
  - Migration strategy not defined

- **Redis**: Configured in docker-compose.yml (v7-alpine)
  - ⚠️ **NOT USED**: No Redis client installed (`redis` or `ioredis` package missing)
  - Would be ideal for session storage and caching
  - Currently no session persistence

### **Authentication & Security**
- **JWT**: `jsonwebtoken@9.0.2`
- **Password Hashing**: `bcrypt@6.0.0` (12 rounds - secure)
- **Rate Limiting**: `express-rate-limit@8.1.0`
- **Security Headers**: `helmet@8.1.0`
- **Input Validation**: `express-validator@7.2.1`

### **External APIs**
- **OpenAI**: `openai@4.104.0` (GPT-4o-mini)
  - API calls can be slow (30-60 seconds)
  - Rate limits apply
  - Cost per request
  - **Fallback**: Mock mode for development

- **Google Cloud Vision**: `@google-cloud/vision@5.3.4`
  - Requires service account key file
  - OCR API calls (fast, ~1-5 seconds)
  - Cost per image

### **Backend Limitations**

1. **No Database Driver** ⚠️ **BLOCKER**
   - PostgreSQL configured but no `pg` package
   - Must add: `npm install pg` or use ORM like Prisma/Sequelize
   - Will need connection pooling (e.g., `pg-pool`)
   - Migration tool needed (Prisma Migrate, Knex, or raw SQL)

2. **No ORM/Query Builder**
   - Raw SQL queries required (more error-prone)
   - No type safety for database queries
   - Manual SQL injection prevention needed
   - **Recommendation**: Consider Prisma or TypeORM for TypeScript safety

3. **No Redis Client** ⚠️ **HIGH PRIORITY**
   - Cannot use Redis for sessions/caching
   - Rate limiting uses memory (lost on restart)
   - No distributed caching
   - **Recommendation**: Add `ioredis` or `redis` package

4. **Session Storage**
   - Currently in-memory only (`Map()`)
   - Lost on server restart
   - Cannot scale horizontally (multiple instances)
   - **Solution**: Use Redis or database-backed sessions

5. **Node.js 18 Compatibility**
   - Node.js 18 is stable but EOL in April 2025
   - Consider upgrading to Node.js 20 LTS
   - Alpine Linux limits available packages

6. **No Database Migration Tool**
   - Schema changes must be manual
   - No versioning or rollback capability
   - Risk of schema drift in production

7. **Express.js 4.18.2 Limitations**
   - No built-in async error handling (must wrap routes)
   - No built-in request timeout (we added middleware)
   - Limited built-in security (relies on middleware)

---

## 🐳 **Infrastructure Stack**

### **Containerization**
- **Backend**: Docker (Node.js 18 Alpine)
- **Database**: PostgreSQL 15 Alpine
- **Cache**: Redis 7 Alpine
- **Reverse Proxy**: Nginx (configured but not verified)
- **Monitoring**: Prometheus + Grafana (configured)

### **Deployment Limitations**

1. **Database Migrations Not Automated**
   - `init.sql` referenced but may not exist
   - No migration strategy in Docker setup
   - Risk of data loss on container recreation

2. **Health Checks**
   - Backend health check doesn't verify DB/Redis connectivity
   - Docker health checks may pass while dependencies fail
   - No dependency health checks

3. **State Management**
   - PostgreSQL data in volume (persistent)
   - Redis data in volume (persistent)
   - Backend logs in container (ephemeral - will lose logs on restart)

4. **No CI/CD Pipeline**
   - No automated testing in deployment
   - No automated dependency scanning
   - Manual deployment process

---

## ⚠️ **Critical Tech Stack Constraints**

### **For Fixing Critical Issues**

#### **Issue #3: Database Persistence**
- ✅ PostgreSQL configured in docker-compose
- ❌ **Missing**: `pg` package (PostgreSQL driver)
- ❌ **Missing**: ORM or query builder
- ❌ **Missing**: Migration tool
- **Action Required**: 
  - Install `pg` and `pg-pool` packages
  - Choose ORM (recommend Prisma for TypeScript-like safety)
  - Set up migration tool

#### **Issue #1: Hardcoded Encryption Key**
- ⚠️ **Expo Limitation**: Cannot use Node.js crypto module
- ✅ **Available**: Expo SecureStore for key storage
- ✅ **Available**: Expo Crypto for hashing
- ⚠️ **Challenge**: Cannot generate keys server-side for client
- **Solution**: Generate per-device keys using Expo Crypto + SecureStore
- **Limitation**: Keys cannot sync across devices (by design for security)

#### **Issue #7: Mock Mode Environment Validation**
- Simple fix - just conditional logic
- No tech stack constraints

#### **Issue #4: CORS Configuration**
- Already using `cors` package
- Just needs stricter whitelisting
- No constraints

### **For Fixing High Priority Issues**

#### **Rate Limiting on Auth Endpoints**
- ✅ `express-rate-limit` already installed
- ⚠️ **Limitation**: In-memory storage (doesn't work across multiple instances)
- **Solution**: Use Redis adapter for distributed rate limiting
- **Requires**: Redis client package installation

#### **CSRF Protection**
- ⚠️ **Mobile App Challenge**: CSRF tokens less effective for native apps
- ⚠️ **Cookie-based**: Mobile apps don't handle cookies like browsers
- **Recommendation**: Use token-based authentication (already using JWT)
- **Alternative**: SameSite cookie attributes (if using cookie-based sessions)

#### **Refresh Token Storage**
- **Current**: In-memory Map (lost on restart)
- **Options**:
  1. Database table (requires DB driver)
  2. Redis (requires Redis client)
  3. JWT-only approach (stateless, but harder to revoke)

---

## 📋 **Technology Compatibility Matrix**

| Component | Version | Status | Notes |
|-----------|---------|--------|-------|
| Node.js | 18 | ⚠️ EOL April 2025 | Consider upgrading to 20 LTS |
| React | 19.1.0 | ⚠️ Very new | May have compatibility issues |
| React Native | 0.81.4 | ✅ Stable | Good compatibility with Expo 54 |
| Expo SDK | ~54.0.0 | ✅ Current | Latest stable version |
| Express.js | 4.18.2 | ✅ Stable | Well-tested, widely used |
| PostgreSQL | 15 | ✅ Stable | Good choice |
| Redis | 7 | ✅ Latest | Good choice |

---

## 🎯 **Recommendations Based on Tech Stack**

### **Immediate Actions (Before Fixing Critical Issues)**

1. **Add Database Driver**
   ```bash
   cd backend
   npm install pg pg-pool
   # OR better: npm install prisma @prisma/client
   ```

2. **Add Redis Client**
   ```bash
   npm install ioredis
   # OR: npm install redis@4
   ```

3. **Consider ORM** (Recommended: Prisma)
   - Type-safe database queries
   - Migration tool built-in
   - Good TypeScript support
   - Works well with PostgreSQL

4. **React Version Consideration**
   - **Recommendation**: Test thoroughly or consider React 18.x
   - Many React Native libraries may not support React 19 yet

### **Architecture Decisions**

1. **Session Storage Strategy**
   - **Option A**: PostgreSQL table (persistent, scalable)
   - **Option B**: Redis (fast, distributed, but requires Redis)
   - **Option C**: Stateless JWT (no storage, but harder to revoke)

2. **Rate Limiting Strategy**
   - **Single instance**: In-memory is fine
   - **Multiple instances**: Must use Redis adapter
   - **Recommendation**: Use Redis for production scalability

3. **Encryption Key Strategy** (Frontend)
   - **Per-device generation**: Secure, but no cross-device sync
   - **Cloud key sync**: Requires backend key management (more complex)
   - **Recommendation**: Per-device keys (Expo SecureStore)

---

## 🚫 **What You CANNOT Do**

### **Frontend (React Native/Expo)**
- ❌ Use Node.js `crypto` module directly
- ❌ Use Node.js filesystem APIs
- ❌ Use browser-only APIs (localStorage, IndexedDB - use AsyncStorage instead)
- ❌ Sync encryption keys across devices securely without backend
- ❌ Store large datasets in SecureStore (>2KB per item)
- ❌ Use server-side rendering (SSR)

### **Backend (Current State)**
- ❌ Use PostgreSQL without installing driver
- ❌ Use Redis without installing client
- ❌ Scale horizontally (in-memory state)
- ❌ Persist data across restarts (in-memory storage)
- ❌ Use advanced SQL features (no database connection)

---

## ✅ **What You CAN Do**

### **Frontend**
- ✅ Use Expo SecureStore for sensitive keys (per-device)
- ✅ Use AsyncStorage for non-sensitive data (with size limits)
- ✅ Use expo-sqlite for structured local data
- ✅ Use Expo Crypto for hashing
- ✅ Implement certificate pinning
- ✅ Use JWT tokens (already implemented)

### **Backend**
- ✅ Connect to PostgreSQL (once driver installed)
- ✅ Use Redis for caching/sessions (once client installed)
- ✅ Use Prisma or other ORMs
- ✅ Implement database migrations
- ✅ Use connection pooling
- ✅ Scale horizontally (with Redis/DB-backed sessions)

---

## 📊 **Stack Readiness Assessment**

| Component | Readiness | Blockers |
|-----------|-----------|----------|
| Frontend Core | ✅ Ready | React 19 compatibility concerns |
| Frontend Storage | ⚠️ Limited | Size constraints, key generation needs work |
| Backend API | ✅ Ready | Good foundation |
| Database | ❌ Not Ready | Missing driver and ORM |
| Caching/Sessions | ❌ Not Ready | Missing Redis client |
| Authentication | ✅ Ready | JWT implementation solid |
| Deployment | ⚠️ Partial | Migrations, health checks need work |

---

## 🎯 **Impact on Critical Issues**

### **Issues That Require Stack Changes**

1. **Database Persistence** (#3)
   - **Requires**: Install `pg`, choose ORM, implement migrations
   - **Complexity**: Medium-High
   - **Time**: 2-3 days

2. **Hardcoded Encryption Key** (#1)
   - **Requires**: Expo SecureStore + Expo Crypto (already available)
   - **Complexity**: Low-Medium
   - **Time**: 1-2 hours

3. **Refresh Token Storage** (High Priority)
   - **Requires**: Database or Redis (same as #3)
   - **Complexity**: Medium
   - **Time**: 1 day

### **Issues That DON'T Require Stack Changes**

4. CORS Configuration (#4) - ✅ Just configuration
5. Weak Randomness (#5) - ✅ Already fixed
6. Debug Logging (#6) - ✅ Already fixed
7. Mock Mode Validation (#7) - ✅ Just conditional logic
8. Missing Tests (#8) - ✅ Add test files

---

**Summary**: Your tech stack is well-chosen but missing critical database/Redis drivers. Most critical issues can be fixed with existing tools, except database persistence which requires adding PostgreSQL driver and ORM.

