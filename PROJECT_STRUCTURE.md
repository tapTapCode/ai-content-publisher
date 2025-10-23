# AI Content Publisher - Complete Project Structure

## Overview

This document outlines the complete architecture for the AI Content Publishing Pipeline. The project is designed to be production-ready and demonstrates advanced Node.js, job queue, and WordPress integration patterns.

## Project Architecture

```
ai-content-publisher/
├── backend/                    # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts    # Prisma client config
│   │   │   ├── redis.ts       # Redis connection
│   │   │   └── wordpress.ts   # WordPress API config
│   │   ├── controllers/
│   │   │   ├── content.controller.ts
│   │   │   └── publish.controller.ts
│   │   ├── services/
│   │   │   ├── llm.service.ts          # OpenAI integration
│   │   │   ├── wordpress.service.ts     # WordPress REST API
│   │   │   ├── seo.service.ts           # SEO optimization
│   │   │   └── content.service.ts       # Content management
│   │   ├── jobs/
│   │   │   ├── contentGeneration.job.ts
│   │   │   ├── publishing.job.ts
│   │   │   └── queue.ts                 # BullMQ setup
│   │   ├── models/
│   │   │   └── schema.prisma            # Database schema
│   │   ├── routes/
│   │   │   ├── content.ts
│   │   │   ├── publish.ts
│   │   │   └── analytics.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── validators.ts
│   │   └── index.ts
│   ├── prisma/
│   │   └── migrations/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContentForm.tsx
│   │   │   ├── ContentList.tsx
│   │   │   ├── JobMonitor.tsx
│   │   │   └── Analytics.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Generate.tsx
│   │   │   └── Published.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env.local.example
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── LICENSE
```

## Technology Stack

### Backend
- **Express.js**: Web framework
- **TypeScript**: Type safety
- **Prisma**: PostgreSQL ORM
- **BullMQ**: Job queue management
- **Redis**: Queue storage
- **OpenAI API**: Content generation
- **WordPress REST API**: Publishing
- **Winston**: Logging
- **Zod**: Input validation

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **TanStack Query**: Data fetching
- **Axios**: HTTP client
- **Tailwind CSS**: Styling

### Infrastructure
- **PostgreSQL**: Primary database
- **Redis**: Job queue & caching
- **Docker**: Containerization

## Core Features Implementation

### 1. Content Generation Service

**File**: `src/services/llm.service.ts`

```typescript
import OpenAI from 'openai';

export class LLMService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateBlogPost(topic: string, keywords: string[], wordCount: number) {
    const prompt = `Write a ${wordCount}-word blog post about "${topic}".
    Include these keywords: ${keywords.join(', ')}.
    Format in HTML with headings, paragraphs, and lists.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    return response.choices[0].message.content;
  }

  async generateSEOMetadata(content: string) {
    // Generate meta title, description, tags
  }

  async generateFAQSchema(content: string) {
    // Generate FAQ structured data
  }
}
```

### 2. WordPress Integration Service

**File**: `src/services/wordpress.service.ts`

```typescript
import axios from 'axios';

export class WordPressService {
  private baseURL: string;
  private auth: string;

  constructor() {
    this.baseURL = process.env.WORDPRESS_URL!;
    const credentials = Buffer.from(
      `${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APP_PASSWORD}`
    ).toString('base64');
    this.auth = `Basic ${credentials}`;
  }

  async createPost(data: {
    title: string;
    content: string;
    status: 'draft' | 'publish';
    categories?: number[];
    tags?: number[];
  }) {
    const response = await axios.post(
      `${this.baseURL}/wp-json/wp/v2/posts`,
      data,
      { headers: { Authorization: this.auth } }
    );
    return response.data;
  }

  async updatePost(postId: number, data: any) {
    // Update existing post
  }

  async schedulePost(postId: number, date: Date) {
    // Schedule post for future publication
  }
}
```

### 3. Job Queue Implementation

**File**: `src/jobs/queue.ts`

```typescript
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379')
});

export const contentQueue = new Queue('content-generation', { connection });
export const publishQueue = new Queue('publishing', { connection });

// Content Generation Worker
new Worker('content-generation', async (job) => {
  const { topic, keywords, wordCount } = job.data;
  
  // Generate content
  const content = await llmService.generateBlogPost(topic, keywords, wordCount);
  const seo = await llmService.generateSEOMetadata(content);
  
  // Save to database
  return { content, seo };
}, { connection });

// Publishing Worker
new Worker('publishing', async (job) => {
  const { contentId, status } = job.data;
  
  // Publish to WordPress
  const result = await wordpressService.createPost(job.data);
  
  return result;
}, { connection });
```

### 4. Database Schema

**File**: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Content {
  id            String   @id @default(uuid())
  title         String
  content       String
  metaTitle     String?
  metaDesc      String?
  keywords      String[]
  status        String   @default("draft")
  wordpressId   Int?
  wordpressUrl  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Job {
  id          String   @id @default(uuid())
  type        String
  status      String
  data        Json
  result      Json?
  error       String?
  createdAt   DateTime @default(now())
  completedAt DateTime?
}
```

### 5. API Routes

**File**: `src/routes/content.ts`

```typescript
import { Router } from 'express';
import { contentQueue } from '../jobs/queue';

const router = Router();

// Generate new content
router.post('/generate', async (req, res) => {
  const { topic, keywords, wordCount } = req.body;
  
  const job = await contentQueue.add('generate', {
    topic,
    keywords,
    wordCount
  });
  
  res.json({ jobId: job.id });
});

// Get content by ID
router.get('/:id', async (req, res) => {
  // Retrieve from database
});

// Update content
router.put('/:id', async (req, res) => {
  // Update in database
});

export default router;
```

## Key Implementation Details

### SEO Optimization

The SEO service generates:
- Meta title (55-60 characters)
- Meta description (150-160 characters)
- Focus keywords
- Internal linking suggestions
- Alt text for images
- FAQ schema JSON-LD

### Publishing Workflow

1. **Generate**: Create content with LLM
2. **Save Draft**: Store in database
3. **Review**: User edits if needed
4. **Publish**: Send to WordPress
5. **Track**: Monitor performance

### Job Queue Benefits

- **Async Processing**: Long-running tasks don't block API
- **Retry Logic**: Failed jobs automatically retry
- **Monitoring**: Track job progress and failures
- **Scalability**: Multiple workers can process jobs

## Environment Setup

### Required Services

1. **PostgreSQL Database**
```bash
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14
```

2. **Redis**
```bash
docker run --name redis -p 6379:6379 -d redis:7-alpine
```

3. **WordPress** (with REST API enabled)
- Install WordPress locally or use existing site
- Create Application Password for API access

### Installation Steps

```bash
# Clone repository
git clone https://github.com/tapTapCode/ai-content-publisher.git
cd ai-content-publisher

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma migrate dev
npm run dev

# Frontend setup (in new terminal)
cd ../frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## Future Enhancements

### Phase 2 Features
- [ ] Image generation with DALL-E
- [ ] Multi-language support
- [ ] Content calendar
- [ ] A/B testing for headlines
- [ ] Analytics integration (GA4, Search Console)
- [ ] Webhook notifications
- [ ] Bulk import from CSV

### Phase 3 Features
- [ ] AI-powered internal linking
- [ ] Content refresh suggestions
- [ ] Competitor analysis
- [ ] Automated social media posting
- [ ] Email campaign integration

## Performance Considerations

- **Caching**: Redis caches frequently accessed content
- **Rate Limiting**: Prevents API abuse
- **Connection Pooling**: Efficient database connections
- **Job Prioritization**: Critical jobs processed first

## Security Best Practices

- Environment variables for secrets
- Input validation with Zod
- WordPress App Passwords (not regular passwords)
- CORS configuration
- Rate limiting on endpoints
- SQL injection prevention (Prisma ORM)

## Monitoring & Logging

- Winston for structured logging
- Job queue dashboard (Bull Board)
- Error tracking
- Performance metrics

## Deployment

### Docker Compose
```bash
docker-compose up --build
```

### Cloud Platforms
- **Backend**: Railway, Render, Fly.io
- **Frontend**: Vercel, Netlify
- **Database**: Railway PostgreSQL, Supabase
- **Redis**: Upstash, Railway Redis

## Testing Strategy

- Unit tests for services
- Integration tests for API endpoints
- E2E tests for publishing workflow
- Mock WordPress API for tests

## Contributing

This is a portfolio project demonstrating:
- Modern Node.js architecture
- Job queue implementation
- WordPress REST API integration
- LLM content generation
- Production-ready patterns

Feel free to extend and customize!
