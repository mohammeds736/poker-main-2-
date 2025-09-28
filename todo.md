# Jaafar Alsayed Poker Game - MVP Implementation Plan

## Core Files to Create/Modify:

1. **index.html** - Update title and meta tags for poker game
2. **src/pages/Index.tsx** - Main landing/login page with animated logo and bubbles
3. **src/pages/Auth/Login.tsx** - Login form with biometric verification
4. **src/pages/Auth/Register.tsx** - Registration with ID verification and country selection
5. **src/pages/Auth/EmailVerification.tsx** - Email verification with code input
6. **src/pages/Dashboard.tsx** - Main dashboard with golden poker table and sidebar menu
7. **src/pages/Settings/AccountSettings.tsx** - Profile management and language settings
8. **src/pages/Wallet/Wallet.tsx** - Wallet management with buy/sell options
9. **src/pages/Game/GameRooms.tsx** - Game room selection by skill level
10. **src/pages/Game/PokerTable.tsx** - Main poker game interface with table, cards, and chat

## Key Features Implementation:
- Animated golden poker logo with rotation and glow effects
- Floating poker card bubbles animation
- Country selection with phone codes
- Camera integration for biometric verification
- Realistic poker table designs for different skill levels
- Card distribution system with game logic
- Chat system (public/private)
- Payment integration mockups
- Bot players for practice mode
- VIP room creation system

## Tech Stack:
- React + TypeScript
- Tailwind CSS for styling
- Shadcn/ui components
- React Router for navigation
- Local storage for data persistence (no Supabase)
