import OpenAI from 'openai';

export class LLMService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateBlogPost(params: {
    topic: string;
    keywords: string[];
    wordCount: number;
  }): Promise<string> {
    const { topic, keywords, wordCount } = params;

    const prompt = `Write a ${wordCount}-word blog post about "${topic}".
    
Include these keywords naturally: ${keywords.join(', ')}.

Format the content in HTML with:
- An engaging introduction
- Clear headings (h2, h3)
- Well-structured paragraphs
- Bullet points or numbered lists where appropriate
- A strong conclusion

Focus on providing valuable, actionable information.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a professional content writer specializing in SEO-optimized blog posts.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: Math.ceil(wordCount * 1.5),
    });

    return response.choices[0].message.content || '';
  }

  async generateSEOMetadata(content: string): Promise<{
    title: string;
    description: string;
    tags: string[];
  }> {
    const prompt = `Analyze this blog post content and generate SEO metadata:

${content.substring(0, 1000)}...

Generate:
1. An SEO-optimized meta title (55-60 characters)
2. A compelling meta description (150-160 characters)
3. 5-7 relevant tags

Return as JSON: { "title": "...", "description": "...", "tags": ["tag1", "tag2", ...] }`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  async generateFAQSchema(content: string): Promise<
    Array<{ question: string; answer: string }>
  > {
    const prompt = `Based on this blog post content, generate 3-5 FAQ questions and answers for structured data:

${content.substring(0, 1500)}...

Return as JSON array: [{ "question": "...", "answer": "..." }, ...]`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.6,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"faqs": []}');
    return result.faqs || [];
  }
}

export const llmService = new LLMService();
