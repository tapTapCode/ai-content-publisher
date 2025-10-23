# AI Content Publishing Pipeline

An automated content publishing system that generates SEO-optimized blog posts using LLMs and publishes them to WordPress with intelligent scheduling and analytics tracking.

## Features

- **AI Content Generation**: GPT-4 powered blog post creation with topic input
- **SEO Optimization**: Auto-generates metadata, tags, and internal links
- **WordPress Integration**: Direct publishing via WordPress REST API
- **Job Queue System**: Async processing with BullMQ and Redis
- **Publishing Workflow**: Generate → Preview → Publish with approval
- **Analytics Dashboard**: Track content performance and job status
- **Bulk Scheduling**: Queue multiple posts for scheduled publication
- **FAQ Schema Generation**: Automatic structured data for SEO

## Architecture

```
ai-content-publisher/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── controllers/ # Route controllers
│   │   ├── services/    # Business logic
│   │   ├── jobs/        # BullMQ job processors
│   │   ├── models/      # Database models
│   │   └── utils/       # Utilities
│   ├── package.json
│   └── Dockerfile
├── frontend/            # React admin dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## Tech Stack

### Backend
- **Node.js + Express**: RESTful API server
- **TypeScript**: Type-safe development
- **BullMQ**: Job queue for async processing
- **Redis**: Queue storage and caching
- **Prisma**: PostgreSQL ORM
- **OpenAI API**: GPT-4 for content generation
- **WordPress REST API**: CMS integration

### Frontend
- **React**: UI library
- **TypeScript**: Type safety
- **Axios**: API client
- **TanStack Query**: Data fetching
- **Tailwind CSS**: Styling

### Infrastructure
- **PostgreSQL**: Primary database
- **Redis**: Job queue and cache
- **Docker**: Containerization

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker (optional)
- WordPress site with REST API enabled
- OpenAI API key

### Local Development

1. **Clone repository**
```bash
git clone https://github.com/tapTapCode/ai-content-publisher.git
cd ai-content-publisher
```

2. **Set up backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma migrate dev
npm run dev
```

3. **Set up frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Docker Deployment

```bash
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/docs

## Environment Variables

### Backend (.env)
```env
# OpenAI
OPENAI_API_KEY=your_key_here

# WordPress
WORDPRESS_URL=https://your-site.com
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=your_app_password

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/content_publisher

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=4000
NODE_ENV=development
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:4000
```

## API Endpoints

### Content Generation
- `POST /api/content/generate` - Generate blog post
- `GET /api/content/:id` - Get generated content
- `PUT /api/content/:id` - Update draft
- `DELETE /api/content/:id` - Delete draft

### Publishing
- `POST /api/publish/:id` - Publish to WordPress
- `POST /api/publish/schedule` - Schedule publication
- `GET /api/publish/status/:jobId` - Check job status

### Analytics
- `GET /api/analytics/posts` - Get post performance
- `GET /api/analytics/jobs` - Get job statistics

## Usage

### Generate Content

```bash
curl -X POST http://localhost:4000/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Healthcare",
    "keywords": ["machine learning", "patient care"],
    "wordCount": 1500
  }'
```

### Publish to WordPress

```bash
curl -X POST http://localhost:4000/api/publish/123 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "publish",
    "scheduleDate": "2024-12-25T10:00:00Z"
  }'
```

## Features in Detail

### Content Generation
- Topic-based generation
- Keyword optimization
- Custom word count
- Multiple content formats (blog, guide, tutorial)

### SEO Optimization
- Meta title and description
- Focus keywords
- Internal linking suggestions
- FAQ schema markup
- Alt text for images

### Publishing Workflow
1. Generate draft content
2. Review and edit
3. Preview formatting
4. Schedule or publish immediately
5. Track performance

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

Deploy to cloud platforms:
- **Backend**: Railway, Render, Heroku
- **Frontend**: Vercel, Netlify
- **Database**: Supabase, Railway PostgreSQL
- **Redis**: Upstash, Railway Redis

## License

MIT License

## Author

**Jumar Juaton**
- GitHub: [@tapTapCode](https://github.com/tapTapCode)
- Portfolio: [AI Content Publisher](https://github.com/tapTapCode/ai-content-publisher)

## Acknowledgments

Built to demonstrate:
- WordPress REST API integration
- LLM-powered content automation
- Job queue implementation with BullMQ
- SEO best practices
- Production-ready Node.js architecture
