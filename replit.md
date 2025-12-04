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

# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run in web browser
npx expo start --web
```

## Key Features

1. **User Authentication**: JWT-based with secure token storage
2. **Points System**: View balance, lifetime points, expiring points
3. **Transaction History**: Paginated list with pull-to-refresh
4. **Coupon Redemption**: Browse, redeem, and view redemption codes/QR
5. **Push Notifications**: FCM/APNs integration for promotions
6. **Multi-language**: Runtime language switching with persistence

## User Preferences

- Language preference stored in AsyncStorage
- Theme follows system preference (light/dark)
- Push notification permission handled on first launch

## Recent Changes

- Refactored all tab screens to properly follow MVP architecture
- Views now delegate all business logic and formatting to presenters
- Added formatBalance method to PointsPresenter for balance display
- All screens use useMemo for presenter instantiation with callbacks
- Initial MVP architecture implementation
- Complete screen structure with navigation
- Localization setup for 3 languages
- API service layer with placeholder endpoints
- Push notification integration foundation
