# Baleno Membership Loyalty App

A production-ready mobile membership loyalty app for Baleno, built with React Native and Expo.

## Features

- User registration and login with JWT authentication
- Points balance and transaction history
- Coupon browsing and redemption with QR codes
- Push notifications for promotions
- Multi-language support (Traditional Chinese, Simplified Chinese, English)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (installed globally or via npx)

### Installation

```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

### Running the App

After starting the development server, you can:

- Press `w` to open in web browser
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator
- Scan the QR code with Expo Go app on your device

## Project Structure

This project follows the **MVP (Model-View-Presenter)** architecture:

```
src/
├── models/         # Data models (Member, Points, Coupon)
├── presenters/     # Business logic layer
├── services/       # API client and service layer
├── contexts/       # React contexts for state management
├── localization/   # i18n translations
└── components/     # Shared UI components

app/                # Expo Router screens (Views)
├── (auth)/         # Login and Register screens
├── (tabs)/         # Main app tabs
└── _layout.tsx     # Root layout
```

## API Integration

The app uses placeholder API endpoints. To connect to your backend:

1. Update the base URL in `src/services/apiClient.ts`
2. Adjust request/response models as needed
3. Search for `// TODO:` comments for areas requiring customization

## Localization

Supported languages:
- Traditional Chinese (zh-HK) - Default
- Simplified Chinese (zh-CN)
- English (en)

Add or modify translations in `src/localization/translations/`

## Tech Stack

- React Native 0.81
- Expo SDK 54
- Expo Router (file-based navigation)
- i18next (internationalization)
- expo-secure-store (secure token storage)
- expo-notifications (push notifications)

## License

Proprietary - Baleno
