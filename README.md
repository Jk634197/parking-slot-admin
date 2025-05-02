## [Devias Kit - React](https://material-kit-react.devias.io/)

![license](https://img.shields.io/badge/license-MIT-blue.svg)

[![Devias Kit - React](https://github.com/devias-io/material-kit-react/blob/main/public/assets/thumbnail.png)](https://material-kit-react.devias.io/)

> Free React Admin Dashboard made with [MUI's](https://mui.com) components, [React](https://reactjs.org) and of course [Next.js](https://github.com/vercel/next.js) to boost your app development process!

## Pages

- [Dashboard](https://material-kit-react.devias.io)
- [Customers](https://material-kit-react.devias.io/dashboard/customers)
- [Integrations](https://material-kit-react.devias.io/dashboard/integrations)
- [Settings](https://material-kit-react.devias.io/dashboard/settings)
- [Account](https://material-kit-react.devias.io/dashboard/account)
- [Sign In](https://material-kit-react.devias.io/auth/sign-in)
- [Sign Up](https://material-kit-react.devias.io/auth/sign-up)
- [Reset Password](https://material-kit-react.devias.io/auth/reset-password)

## Free Figma Community File

- [Duplicate File](https://www.figma.com/file/b3L1Np4RYiicZAOMopHNkm/Devias-Dashboard-Design-Library-Kit)

## Upgrade to PRO Version

We also have a pro version of this product which bundles even more pages and components if you want
to save more time and design efforts :)

| Free Version (this one)  | [Devias Kit Pro](https://mui.com/store/items/devias-kit-pro/)                |
| ------------------------ | :--------------------------------------------------------------------------- |
| **8** Pages              | **80+** Pages                                                                |
| ✔ Custom Authentication | ✔ Authentication with **Amplify**, **Auth0**, **Firebase** and **Supabase** |
| -                        | ✔ Vite Version                                                              |
| -                        | ✔ Dark Mode Support                                                         |
| -                        | ✔ Complete Users Flows                                                      |
| -                        | ✔ Premium Technical Support                                                 |

## Quick start

- Clone the repo: `git clone https://github.com/devias-io/material-kit-react.git`
- Make sure your Node.js and npm versions are up to date
- Install dependencies: `npm install` or `yarn`
- Start the server: `npm run dev` or `yarn dev`
- Open browser: `http://localhost:3000`

## File Structure

Within the download you'll find the following directories and files:

```
┌── .editorconfig
├── .eslintrc.js
├── .gitignore
├── CHANGELOG.md
├── LICENSE.md
├── next-env.d.ts
├── next.config.js
├── package.json
├── README.md
├── tsconfig.json
├── public
└── src
	├── components
	├── contexts
	├── hooks
	├── lib
	├── styles
	├── types
	└── app
		├── layout.tsx
		├── page.tsx
		├── auth
		└── dashboard
```

## Resources

- More freebies like this one: https://devias.io

## Reporting Issues:

- [Github Issues Page](https://github.com/devias-io/material-kit-react/issues)

## License

- Licensed under [MIT](https://github.com/devias-io/material-kit-react/blob/main/LICENSE.md)

## Contact Us

- Email Us: support@deviasio.zendesk.com

# Next.js Dashboard Documentation

## Overview

This is a modern, feature-rich dashboard built with Next.js 14 (App Router), Material-UI, and TypeScript. It provides a professional admin interface with authentication, data visualization, and responsive design.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or later
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   ├── errors/         # Error pages
│   └── layout.tsx      # Root layout
├── components/         # Reusable UI components
├── contexts/          # React context providers
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── styles/            # Global styles and theme
└── types/             # TypeScript definitions
```

## 🛠️ Technology Stack

### Core Technologies

- **Next.js 14.2.4** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5.5.2** - Type safety
- **Material-UI 5.15.20** - Component library
- **Emotion** - CSS-in-JS styling
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **ApexCharts** - Data visualization

### Development Tools

- ESLint - Code linting
- Prettier - Code formatting
- Jest - Testing
- TypeScript - Type checking

## 📦 Key Features

### Authentication

- Complete authentication flow
- Protected routes
- Session management

### Dashboard Components

- Responsive layout
- Data visualization
- Interactive charts
- Data tables
- Form components

### Styling

- Material-UI theming
- Custom theme configuration
- Responsive design
- Dark/Light mode support

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=your_api_url
```

### TypeScript Configuration

The project uses strict TypeScript configuration. See `tsconfig.json` for details.

### ESLint & Prettier

- ESLint configuration: `.eslintrc.js`
- Prettier configuration: `prettier.config.mjs`

## 🚀 Development

### Available Scripts

```bash
# Development
pnpm dev

# Build
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint
pnpm lint:fix

# Type checking
pnpm typecheck

# Format code
pnpm format:write
pnpm format:check
```

### Adding New Pages

1. Create a new directory in `src/app/`
2. Add a `page.tsx` file
3. Export a default React component

Example:

```typescript
// src/app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page Content</div>
}
```

### Creating Components

1. Create a new file in `src/components/`
2. Use TypeScript for props
3. Follow the existing component patterns

Example:

```typescript
// src/components/NewComponent.tsx
interface NewComponentProps {
  title: string;
}

export function NewComponent({ title }: NewComponentProps) {
  return <div>{title}</div>
}
```

### Styling Guidelines

1. Use Material-UI components as base
2. Extend with Emotion for custom styles
3. Follow the theme configuration in `src/styles/`

## 📊 State Management

- React Context for global state
- React Hook Form for form state
- Local component state with useState

## 🔒 Authentication

The authentication system is implemented in `src/app/auth/`. It includes:

- Login
- Registration
- Password reset
- Protected routes

## 📈 Data Fetching

- Server-side data fetching with Next.js
- Client-side data fetching with React Query
- API routes in `src/app/api/`

## 🎨 Theming

The theme configuration is in `src/styles/`. It includes:

- Color palette
- Typography
- Component overrides
- Dark/Light mode

## 🧪 Testing

The project uses Jest for testing:

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 📦 Deployment

The project can be deployed to Vercel or any other Next.js-compatible platform:

1. Build the project:

```bash
pnpm build
```

2. Start the production server:

```bash
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🆘 Support

For support, please:

1. Check the documentation
2. Search existing issues
3. Create a new issue if needed

## 🔄 Updates

Check [CHANGELOG.md](CHANGELOG.md) for version history and updates.
