import { Router } from 'express';
import { contentQueue } from '../jobs/queue';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Generate new content
router.post('/generate', async (req, res) => {
  try {
    const { topic, keywords, wordCount } = req.body;

    if (!topic || !keywords || !wordCount) {
      return res.status(400).json({
        error: 'Missing required fields: topic, keywords, wordCount',
      });
    }

    const contentId = uuidv4();

    const job = await contentQueue.add('generate', {
      contentId,
      topic,
      keywords,
      wordCount: parseInt(wordCount),
    });

    res.json({
      jobId: job.id,
      contentId,
      status: 'processing',
      message: 'Content generation started',
    });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to start content generation' });
  }
});

// Get job status
router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await contentQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;

    res.json({
      jobId: job.id,
      state,
      progress,
      result,
      failedReason: job.failedReason,
    });
  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

export default router;
