# FisChat

A Next.js application that provides AI-powered stock analysis using real financial data. Ask questions about any company and get comprehensive analysis including earnings calls, financial statements, and market data.

## 🚀 Features

- **AI-Powered Analysis**: Get detailed financial analysis using OpenAI GPT-4
- **Real Financial Data**: Integration with Financial Modeling Prep (FMP) API
- **Chat History**: Save and review your analysis history
- **Data Visualization**: Interactive charts for financial metrics (Highlight)
- **Authentication**: Secure login with Google and GitHub OAuth

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: Firebase Firestore
- **APIs**: OpenAI GPT-4, Financial Modeling Prep
- **Charts**: Recharts
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/fischat.git
cd fischat
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```env
# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Financial Modeling Prep API
FMP_API_KEY=your-fmp-api-key

# Firebase Configuration
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

### 4. Set Up External Services

#### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Go to Project Settings > General
5. Add a web app and copy the configuration
6. Update your `.env` with the Firebase config values

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

#### GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Homepage URL: `http://localhost:3000`
4. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Client Secret to `.env`

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
fischat/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── analysis/           # Stock analysis endpoint
│   │   │   └── auth/               # Authentication endpoints
│   │   ├── components/             # React components
│   │   │   ├── StockAnalysis.tsx   # Main analysis component
│   │   │   ├── ChatHistory.tsx     # Chat history component
│   │   │   └── ...
│   │   ├── containers/             # Container components
│   │   │   └── MainContainer.tsx   # Main layout container
│   │   └── page.tsx                # Home page
│   ├── lib/
│   │   ├── api/                    # API client functions
│   │   ├── chat-history.ts         # Chat history utilities
│   │   ├── firebase.ts             # Firebase configuration
│   │   └── prompts.ts              # OpenAI prompts
│   └── types/                      # TypeScript type definitions (for NextAuth)
├── public/                         # Static assets
├── .env.local                      # Environment variables
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

## 🎯 Usage

1. **Sign In**: Use Google or GitHub to authenticate
2. **Ask Questions**: Type questions about any company (e.g., "What was Tesla's revenue growth?")
3. **View Analysis**: Get AI-powered analysis with financial data
4. **Explore Charts**: View interactive financial data visualization (currently only available as line chart)
5. **Review History**: Access your previous analyses in the chat history

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

Deployed on Vercel 😄: https://fischat-iota.vercel.app/
