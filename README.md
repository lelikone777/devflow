# Devflow

Community Q&A platform built with Next.js, TypeScript, MongoDB, and Auth.js.

## Tech Stack

- Next.js
- TypeScript
- MongoDB + Mongoose
- Auth.js (NextAuth)
- Tailwind CSS
- ShadCN UI
- Zod

## Features

- Authentication (credentials, Google, GitHub)
- Questions and answers with rich editor
- Voting system
- Saved collections
- User profiles and reputation
- Tags and tag pages
- Global/local search and filters
- Job search integration
- AI-generated answers

## Quick Start

Install dependencies:

```bash
npm install
```

Create `.env` in the project root:

```env
MONGODB_URI=
OPENAI_API_KEY=
RAPID_API_KEY=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_TINY_EDITOR_API_KEY=
NEXT_PUBLIC_SERVER_URL=
NODE_ENV=development
```

Run locally:

```bash
npm run dev
```
