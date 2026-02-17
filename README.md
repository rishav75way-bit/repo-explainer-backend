# AI Project Explainer - Backend

RESTful API backend for analyzing GitHub repositories and generating AI-powered explanations. Built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **GitHub Integration**: Fetch repository metadata, file trees, and languages using Octokit
- **AI Analysis**: Generate structured explanations using Google Gemini AI
- **Multi-language Support**: Generate analyses in 9 different languages
- **Authentication**: JWT-based auth with access and refresh tokens
- **Rate Limiting**: Protect endpoints from abuse
- **Shareable Links**: Generate public share tokens for analyses
- **AI Q&A**: Answer questions about analyzed repositories
- **Structured Output**: Consistent JSON schema for all analyses

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database (via Mongoose)
- **JWT** - Authentication tokens
- **Octokit** - GitHub API client
- **Google Gemini AI** - AI analysis engine
- **Zod** - Schema validation
- **bcryptjs** - Password hashing
- **express-rate-limit** - Rate limiting

## Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)
- GitHub Personal Access Token (repo scope)
- Google Gemini API Key

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your-32-character-secret-key-here-minimum
JWT_REFRESH_SECRET=your-32-character-refresh-secret-key-here-minimum
GITHUB_TOKEN=ghp_your_github_personal_access_token
GEMINI_API_KEY=your-google-gemini-api-key
```

### Getting API Keys

**GitHub Token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Copy token to `GITHUB_TOKEN`

**Gemini API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create new API key
3. Copy key to `GEMINI_API_KEY`

## Running the Server

Development mode (with hot reload):

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in `.env`).

## API Endpoints

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/refresh` | No | Refresh access token |

### Repositories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/repositories` | Yes | List user's repositories |
| POST | `/api/repositories` | Yes | Add new repository |
| GET | `/api/repositories/:id` | Yes | Get repository by ID |
| PATCH | `/api/repositories/:id/favorite` | Yes | Toggle favorite status |

### Analysis

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/analysis/:repositoryId` | Yes | Run AI analysis (rate-limited: 5/min) |
| GET | `/api/analysis/:repositoryId` | Yes | Get latest analysis |
| GET | `/api/analysis/:repositoryId/history` | Yes | Get analysis history |
| DELETE | `/api/analysis/:id` | Yes | Delete analysis |
| POST | `/api/analysis/:id/share` | Yes | Generate share link |
| DELETE | `/api/analysis/:id/share` | Yes | Revoke share link |
| GET | `/api/analysis/share/:token` | No | Get shared analysis (public) |
| POST | `/api/analysis/:id/chat` | Yes | Ask AI question (rate-limited: 20/min) |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check endpoint |


## Project Structure

```
src/
├── app/
│   ├── common/
│   │   ├── config/          # Environment configuration
│   │   ├── constants/       # Constants (HTTP status, rate limits)
│   │   ├── helpers/         # Helper functions (API responses)
│   │   ├── middlewares/     # Express middlewares (auth, validation, error)
│   │   ├── services/        # Services (database connection)
│   │   └── types/           # TypeScript type definitions
│   ├── features/
│   │   ├── auth/            # Authentication feature
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validators.ts
│   │   │   └── auth.model.ts
│   │   ├── repository/       # Repository feature
│   │   │   ├── repository.controller.ts
│   │   │   ├── repository.service.ts
│   │   │   ├── repository.routes.ts
│   │   │   ├── repository.validators.ts
│   │   │   ├── repository.schema.ts
│   │   │   └── repository.model.ts
│   │   └── analysis/        # Analysis feature
│   │       ├── analysis.controller.ts
│   │       ├── analysis.service.ts
│   │       ├── analysis.routes.ts
│   │       ├── analysis.validators.ts
│   │       ├── analysis.schema.ts
│   │       └── analysis.model.ts
│   ├── router/               # Main router
│   └── server.ts             # Express app setup
```

## Architecture Principles

- **Feature-based Structure**: Code organized by feature, not by type
- **Separation of Concerns**: Controllers handle HTTP, services handle business logic
- **Validation**: All inputs validated with Zod schemas in middleware
- **Type Safety**: Strict TypeScript throughout
- **Error Handling**: Centralized error middleware
- **Security**: Passwords hashed, JWT tokens, rate limiting

## Supported Languages

Analysis can be generated in:
- English (`en`)
- Hindi (`hi`)
- Haryanvi (`hry`)
- Bhojpuri (`bho`)
- Spanish (`es`)
- French (`fr`)
- German (`de`)
- Portuguese (`pt`)
- Japanese (`ja`)


## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Build the project: `npm run build`
3. Start the server: `npm start`

