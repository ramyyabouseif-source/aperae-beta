# Aperae - AI Wine Sommelier

Aperae (www.aperae.com) is a **React Native (Expo)** app with a **Node.js / Express** backend that provides AI-powered wine recommendations from a dish or food description or AI-powered dish recommendations based on a bottle of wine in your existing collection. Live recommendations use **Anthropic Claude** (Sonnet 4.5) and includes a local **Favorites / My Cellar** storage to tracking your collection.

## 🍷 Features

### Core Functionality
- **Dish -> Wine Recommendations**: Get personalized wine suggestions for any dish
- **Wine -> Dish Recommendations**: Get personalized dish suggestions for any wine in your collection
- **Favorites System**: Save and manage your favorite wines
- **Menu Analysis**: Take photos of menus for OCR analysis and analyze restaurant menus for wine pairings

### User Experience
- **Intuitive Interface**: Clean, modern design with wine-themed aesthetics
- **Responsive Design**: Optimized for both iOS and Android
- **Secure Authentication**: JWT-based authentication with secure token storage

## 🏗️ Architecture

### Frontend (React Native)
- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **State Management**: React Hooks and Context
- **Storage**: AsyncStorage and Expo SecureStore
- **TypeScript**: Full type safety throughout the application

### Backend (Node.js)
- **Runtime**: Node.js with Express.js
- **Authentication**: JWT tokens with refresh token rotation
- **Security**: Helmet, CORS, rate limiting, input validation
- **AI Integration**: Anthropic Claude Sonnet 4.5 for wine recommendations
- **Validation**: Express-validator for request validation
- **Data**: **PostgreSQL** via **Prisma** (users, sessions, preferences, consents, wine catalog and recommendation persistence — see `backend/prisma/schema.prisma`).
- **Docs**: Swagger setup (`swagger.js` / `swagger-ui-express`).

### Compliance & eligibility

- **Age verification** and acceptance of **Terms**, **Privacy Policy**, and **Cookie Policy** before main use.
- **Privacy settings** and **consent** endpoints for compliance-oriented tracking 
- **Geo-blocking** check on startup; restricted regions see a dedicated screen.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for mobile development)
- Anthropic API key (for Claude Sonnet 4.5)

### ⚠️ Important: Development Setup

**For local development, use `localhost` instead of ngrok to avoid timeout issues.**

- **ngrok free tier** has a 30-second request timeout
- Our Claude API calls take 55+ seconds
- This causes HTTP 503 errors when using ngrok free tier

**Recommended:** Use `http://localhost:3001/api` for development (works with iOS Simulator, Android Emulator, and web).

**See [NGROK_TIMEOUT_LIMITATION.md](./NGROK_TIMEOUT_LIMITATION.md) for details and alternatives.**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pocketsomm.git
   cd pocketsomm
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Environment Setup**
   
   Create a `.env` file in the `backend` directory:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   JWT_SECRET=your_super_secret_jwt_key
   REFRESH_SECRET=your_refresh_secret_key
   PORT=3001
   NODE_ENV=development
   MOCK_MODE=false
   ```
   
   **Note:** For frontend development, ensure `EXPO_PUBLIC_API_URL` is **not set** (or commented out) to use localhost automatically.

5. **Start the backend server**
   ```bash
   npm run backend
   ```

6. **Start the frontend**
   ```bash
   npm start
   ```

## 📱 Usage

### Getting Wine Recommendations
1. Open the app and navigate to the home screen
2. Enter a dish or food item in the text input
3. Tap "Get Wine Recommendations" to receive AI-powered suggestions
4. View detailed information about each recommended wine
5. Add wines to your favorites for future reference

### Managing Favorites
1. View your saved wines in the Favorites screen
2. Remove wines from favorites as needed
3. Favorites are stored locally on your device

## 🔧 Configuration

### API Configuration
- **Claude Sonnet 4.5**: Currently using `sonnet 4.5` despite high token cost for more accurate results
- **Rate Limiting**: 10 recommendations per 15 minutes per user
- **Request Timeout**: 60 seconds for API calls
- **Retry Logic**: 3 attempts with exponential backoff

## 🛡️ Security Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Secure token storage using Expo SecureStore
- Token rotation for enhanced security
- Role-based access control (user/admin)

### Input Validation
- Comprehensive input sanitization
- XSS and injection attack prevention
- Rate limiting to prevent abuse
- Request size limits

### Data Protection
- Secure storage of sensitive data
- HTTPS enforcement in production
- CORS configuration for cross-origin requests
- Security headers with Helmet.js

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test
```

### Test Coverage
- Unit tests for services and utilities
- Integration tests for API endpoints
- Component tests for React Native components
- E2E tests for critical user flows

## 📦 Deployment

### Mobile App Deployment
1. **iOS**: Build and deploy through Expo or Xcode
2. **Android**: Build APK or deploy through Google Play Store
3. **Web**: Deploy as PWA using Expo web

### Backend Deployment
1. Deploy to cloud platform (AWS, Heroku, DigitalOcean)
2. Set up environment variables
3. Configure domain and SSL certificates
4. Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure security best practices

## 📄 License

**PROPRIETARY SOFTWARE - ALL RIGHTS RESERVED**

Copyright (c) 2025 Aperae. All Rights Reserved.

This software and associated documentation files are proprietary and confidential 
information of Aperae. Unauthorized copying, distribution, modification, or use 
of this software, via any medium, is strictly prohibited without the express 
written permission of Aperae.

For licensing inquiries, please contact: aperaeai@gmail.com.

## 📞 Support

For support, email aperaeai@gmail.com.

## 🔮 Roadmap

### Upcoming Features
- [ ] Social features (share recommendations)
- [ ] Price tracking and alerts
- [ ] Integration with wine retailers
- [ ] Advanced filtering and search
- [ ] Wine education content

### Technical Improvements
- [ ] Redis caching layer
- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Real-time notifications
- [ ] Advanced analytics

---

**Aperae** - Your personal AI sommelier, always in your pocket! 🍷✨