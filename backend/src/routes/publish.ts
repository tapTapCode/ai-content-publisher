import { Router } from 'express';
import { publishQueue } from '../jobs/queue';

const router = Router();

// Publish content to WordPress
router.post('/', async (req, res) => {
  try {
    const { content, seo, status, scheduleDate } = req.body;

    if (!content || !seo) {
      return res.status(400).json({
        error: 'Missing required fields: content, seo',
      });
    }

    const job = await publishQueue.add('publish', {
      content,
      seo,
      status: status || 'draft',
      scheduleDate,
    });

    res.json({
      jobId: job.id,
      status: 'publishing',
      message: 'Publishing started',
    });
  } catch (error) {
    console.error('Error publishing:', error);
    res.status(500).json({ error: 'Failed to publish content' });
  }
});

// Get publishing job status
router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await publishQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const result = job.returnvalue;

    res.json({
      jobId: job.id,
      state,
      result,
      failedReason: job.failedReason,
    });
  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

export default router;
