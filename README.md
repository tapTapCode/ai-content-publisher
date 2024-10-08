# AI Content Publisher

I got tired of manually writing blog posts for a side project, so I built this to generate drafts from topic ideas and push them straight to WordPress. It's a Node.js API with a React dashboard.

**Why I built this**: I was managing a content site and spending more time writing than building. Now I can type "AI in healthcare, 1500 words" and get a draft in 30 seconds. It's not perfect, but it beats staring at a blank page.

## What It Does

- **Generate drafts**: Give it a topic + keywords, get HTML content back
- **SEO metadata**: Auto-generates titles, descriptions, tags (hit-or-miss quality, honestly)
- **WordPress publishing**: One-click push to your WP site via REST API
- **Job queue**: Uses BullMQ so long generations don't block the API
- **Basic dashboard**: React UI to see jobs and manage drafts

## Stack

- **Backend**: Node.js + Express + TypeScript
- **Queue**: BullMQ + Redis (for async content generation)
- **Database**: PostgreSQL + Prisma
- **AI**: OpenAI GPT-4
- **Frontend**: React + Tailwind
- **Publishing**: WordPress REST API

## Quick Start

```bash
# Clone and setup
git clone https://github.com/tapTapCode/ai-content-publisher.git
cd ai-content-publisher/backend
npm install
cp .env.example .env
# Edit .env with your OpenAI and WordPress credentials
npx prisma migrate dev
npm run dev
```

Frontend (optional):
```bash
cd ../frontend
npm install
npm run dev
```

Or use Docker:
```bash
docker-compose up --build
```

## Environment Variables

```env
# OpenAI
OPENAI_API_KEY=your_key_here

# WordPress (create an Application Password, not your login)
WORDPRESS_URL=https://your-site.com
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=your_app_password

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/content_publisher

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

## API Usage

```bash
# Generate a draft
curl -X POST http://localhost:4000/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Healthcare",
    "keywords": ["machine learning", "patient care"],
    "wordCount": 1500
  }'
# Returns: { "jobId": "abc-123" }

# Check status
curl http://localhost:4000/api/publish/status/abc-123

# Publish to WordPress
curl -X POST http://localhost:4000/api/publish/123 \
  -d '{"status": "draft"}'  # or "publish" to go live
```

## Trade-offs I Made

- **BullMQ over bull**: Wanted the newer version with better TypeScript support
- **Prisma over raw SQL**: Migrations are nice, but complex queries get messy
- **GPT-4 over cheaper models**: Costs more but the content quality is noticeably better

## What's Messy / TODO

- [ ] The SEO metadata generation is inconsistent. Sometimes great, sometimes generic.
- [ ] No image generation yet - I just add Unsplash images manually
- [ ] The job queue doesn't retry failed OpenAI calls (should add exponential backoff)
- [ ] WordPress auth is finicky with some hosting providers
- [ ] No content history/versioning - once you overwrite, it's gone

## Testing

```bash
cd backend
npm test  # Not great coverage, mostly integration tests
```

## Deployment

I run mine on Railway:
1. Push to GitHub
2. Railway auto-detects the Dockerfile
3. Add PostgreSQL + Redis services
4. Set env vars
5. Done

## License

MIT - Use it if you want. Or don't.
