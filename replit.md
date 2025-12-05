# Baleno Membership Loyalty App

A production-ready mobile app built with React Native and Expo for Baleno clothing retailer's membership loyalty program. The app targets both iOS and Android from a single codebase.

## Overview

This app allows Baleno customers to:
- Register and log in to their membership account
- View their points balance and transaction history
- Browse and redeem available coupons
- Receive promotional push notifications
- Switch between Traditional Chinese (default), Simplified Chinese, and English

## Project Architecture: MVP (Model-View-Presenter)

The project follows the MVP architecture pattern for clean separation of concerns:

```
/
├── app/                    # Views (Screens) - Expo Router pages
│   ├── (auth)/             # Authentication screens (login, register)
│   ├── (tabs)/             # Main app tabs (home, points, coupons, settings)
│   └── _layout.tsx         # Root layout with providers
├── src/
│   ├── models/             # Data models (Member, Points, Coupon, etc.)
│   ├── views/              # Reusable view components
│   ├── presenters/         # Business logic layer (AuthPresenter, etc.)
│   ├── services/           # API layer (apiClient, authService, etc.)
│   ├── contexts/           # React contexts (AuthContext, LanguageContext)
│   ├── localization/       # i18n setup and translations
│   ├── components/         # Shared UI components
│   └── types/              # TypeScript type definitions
├── components/             # Expo default themed components
├── constants/              # App constants (Colors)
└── hooks/                  # Custom React hooks
```

### MVP Architecture Breakdown

**Models** (`src/models/`):
- `Member.ts` - User/member data models
- `Points.ts` - Points balance and transaction models
- `Coupon.ts` - Coupon and redemption models

**Views** (`app/` and `src/components/`):
- React components that render UI and handle user input
- Do NOT contain business logic or direct API calls
- Receive data and callbacks from presenters/contexts

**Presenters** (`src/presenters/`):
- Contain screen logic and business rules
- Receive events from views (onLogin, onRedeemCoupon)
- Call service/API layer
- Pass data back to views via callbacks

**Services** (`src/services/`):
- `apiClient.ts` - HTTP client with auth token handling
- `authService.ts` - Authentication API calls
- `pointsService.ts` - Points and transactions API
- `couponService.ts` - Coupons API
- `notificationService.ts` - Push notification handling

## Technology Stack

- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router (file-based)
- **State Management**: React Context API
- **Localization**: i18next with expo-localization
- **Secure Storage**: expo-secure-store (for auth tokens)
- **Push Notifications**: expo-notifications
- **Styling**: React Native StyleSheet

## API Integration

All data comes from backend HTTPS REST APIs with JSON. The API client layer handles:
- Base URL configuration
- Auth token attachment to headers
- Common error handling (network errors, unauthorized, etc.)

### TODO: Replace Placeholder Endpoints

Search for `// TODO:` comments or look at `src/services/apiClient.ts` for the base URL configuration. Key endpoints to configure:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /members/me` - Get current member
- `GET /members/me/points` - Get points balance
- `GET /members/me/transactions` - Get transaction history
- `GET /members/me/coupons/available` - Get available coupons
- `GET /members/me/coupons/redeemed` - Get redeemed coupons
- `POST /coupons/:id/redeem` - Redeem a coupon
- `POST /members/push-token` - Register push notification token

## Localization

The app supports three languages:
- `zh-HK` - Traditional Chinese (default)
- `zh-CN` - Simplified Chinese
- `en` - English

Translation files are in `src/localization/translations/`. On first launch, the app detects device language and falls back to Traditional Chinese if no match.

## Running the App

```bash
# Install dependencies
npm install

# Start development server with Tunnel (for Replit + Expo Go on mobile)
npx expo start --tunnel --port 5000

# Run on iOS simulator (local development)
npx expo start --ios

# Run on Android emulator (local development)
npx expo start --android

# Run in web browser (local development)
npx expo start --web
```

### Expo Go Connection (Replit Environment)

To connect Expo Go on your mobile device:
1. The development server uses **Tunnel mode** (`--tunnel`) via ngrok
2. This creates a public URL that bypasses network restrictions
3. Scan the QR code shown in the terminal with Expo Go (Android) or Camera app (iOS)
4. The tunnel URL format: `exp://xxxxx-anonymous-5000.exp.direct`

## Key Features

1. **User Authentication**: JWT-based with secure token storage
2. **Points System**: View current balance and transaction history
3. **Transaction History**: Paginated list with pull-to-refresh
4. **Coupon Redemption**: Browse, redeem, and view redemption codes/QR
5. **Push Notifications**: FCM/APNs integration for promotions
6. **Multi-language**: Runtime language switching with persistence

## User Preferences

- Language preference stored in AsyncStorage
- Theme follows system preference (light/dark)
- Push notification permission handled on first launch

## Demo Account

For testing the app without a backend, use:
- **Username**: `demo`
- **Password**: `demo`

This demo account provides:
- Mock member profile (陳小明)
- 2,580 current points with 500 expiring
- 10 sample transactions
- 5 available coupons to redeem
- 2 previously redeemed coupons

## Navigation Flow

1. **Guest Users**:
   - Start on Home page with Baleno logo and "Log In / Register" button
   - Only Home tab is visible in navigation
   - Can browse login/register screens
   - Protected screens (Points, Coupons, Settings) redirect to Home if accessed via deep link

2. **Authenticated Users**:
   - All tabs visible: Home, Points, Coupons, Settings
   - Login/Register screens redirect to Home if accessed
   - Logout returns to Home guest view

## Design Documents

Design documentation is located in the `/docs` folder:

- **SRS-需求規格說明書.md** - Software Requirements Specification with functional requirements, non-functional requirements, user stories, and acceptance criteria
- **系統架構設計文件.md** - System Architecture Design Document with MVP pattern, tech stack, directory structure, and security architecture

## Recent Changes

- **2025-12-05**: Created System Architecture Design Document
- **2025-12-05**: Created Software Requirements Specification (SRS) document
- **2025-12-05**: Added auth guards to protected screens (points, coupons, settings)
- **2025-12-05**: Fixed React hooks ordering to comply with hooks rules
- **2025-12-05**: Added authLoading check to home screen before rendering
- **2025-12-05**: Guest users now see Baleno logo and login button on home page
- **2025-12-05**: Only Home tab shown for unauthenticated users
- **2025-12-05**: Fixed Expo Go connection - switched to Tunnel mode with @expo/ngrok
- **2025-12-05**: Updated theme to Baleno brand red (#E31837) across all UI
- **2025-12-05**: Added Baleno logo to login and register screens
- Added demo login functionality with mock data
- Refactored all tab screens to properly follow MVP architecture
- Views now delegate all business logic and formatting to presenters
- Added formatBalance method to PointsPresenter for balance display
- All screens use useMemo for presenter instantiation with callbacks
- Initial MVP architecture implementation
- Complete screen structure with navigation
- Localization setup for 3 languages
- API service layer with placeholder endpoints
- Push notification integration foundation
