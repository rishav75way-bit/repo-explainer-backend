# AI Project Explainer - Backend

MERN backend for analyzing GitHub repositories and generating structured explanations.

## Setup

1. Copy `.env.example` to `.env`
2. Fill in required values:
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_SECRET` - 32+ character secret for access tokens
   - `JWT_REFRESH_SECRET` - 32+ character secret for refresh tokens
   - `GITHUB_TOKEN` - GitHub personal access token (repo scope)
   - `OPENAI_API_KEY` - OpenAI API key

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | No | Health check |
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login |
| POST | /api/auth/refresh | No | Refresh tokens |
| POST | /api/repositories | Yes | Add repository |
| GET | /api/repositories/:id | Yes | Get repository |
| POST | /api/analysis/:repositoryId | Yes | Run analysis (rate-limited) |
| GET | /api/analysis/:repositoryId | Yes | Get analysis |

## Test API

```bash
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```
