import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { llmService } from '../services/llm.service';
import { wordpressService } from '../services/wordpress.service';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

// Create queues
export const contentQueue = new Queue('content-generation', { connection });
export const publishQueue = new Queue('publishing', { connection });

// Content Generation Worker
export const startContentWorker = () => {
  const worker = new Worker(
    'content-generation',
    async (job: Job) => {
      const { topic, keywords, wordCount, contentId } = job.data;

      console.log(`Generating content for: ${topic}`);

      // Generate blog post
      const content = await llmService.generateBlogPost({
        topic,
        keywords,
        wordCount,
      });

      // Generate SEO metadata
      const seo = await llmService.generateSEOMetadata(content);

      // Generate FAQ schema
      const faqs = await llmService.generateFAQSchema(content);

      console.log(`Content generated successfully for: ${topic}`);

      return {
        contentId,
        content,
        seo,
        faqs,
        topic,
      };
    },
    {
      connection,
      concurrency: 2,
      limiter: {
        max: 10,
        duration: 60000, // 10 requests per minute
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });

  return worker;
};

// Publishing Worker
export const startPublishWorker = () => {
  const worker = new Worker(
    'publishing',
    async (job: Job) => {
      const { content, seo, status, scheduleDate } = job.data;

      console.log(`Publishing content: ${seo.title}`);

      // Create WordPress post
      const post = await wordpressService.createPost({
        title: seo.title,
        content,
        excerpt: seo.description,
        status: status || 'draft',
      });

      // If scheduling, update the post
      if (scheduleDate) {
        await wordpressService.schedulePost(post.id, new Date(scheduleDate));
      }

      console.log(`Published to WordPress: ${post.id}`);

      return {
        wordpressId: post.id,
        wordpressUrl: post.link,
        publishedAt: new Date().toISOString(),
      };
    },
    {
      connection,
      concurrency: 1,
    }
  );

  worker.on('completed', (job) => {
    console.log(`Publishing job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Publishing job ${job?.id} failed:`, err);
  });

  return worker;
};

// Start workers
export const startWorkers = () => {
  const contentWorker = startContentWorker();
  const publishWorker = startPublishWorker();

  console.log('Workers started successfully');

  return { contentWorker, publishWorker };
};
