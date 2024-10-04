import axios, { AxiosInstance } from 'axios';

export class WordPressService {
  private client: AxiosInstance;

  constructor() {
    const auth = Buffer.from(
      `${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APP_PASSWORD}`
    ).toString('base64');

    this.client = axios.create({
      baseURL: `${process.env.WORDPRESS_URL}/wp-json/wp/v2`,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createPost(data: {
    title: string;
    content: string;
    status: 'draft' | 'publish';
    excerpt?: string;
    categories?: number[];
    tags?: number[];
  }) {
    const response = await this.client.post('/posts', data);
    return response.data;
  }

  async updatePost(postId: number, data: Partial<{
    title: string;
    content: string;
    status: 'draft' | 'publish';
    excerpt?: string;
  }>) {
    const response = await this.client.put(`/posts/${postId}`, data);
    return response.data;
  }

  async schedulePost(postId: number, date: Date) {
    const response = await this.client.put(`/posts/${postId}`, {
      status: 'future',
      date: date.toISOString(),
    });
    return response.data;
  }

  async getCategories() {
    const response = await this.client.get('/categories');
    return response.data;
  }

  async createCategory(name: string, description?: string) {
    const response = await this.client.post('/categories', {
      name,
      description,
    });
    return response.data;
  }

  async getTags() {
    const response = await this.client.get('/tags');
    return response.data;
  }

  async createTag(name: string) {
    const response = await this.client.post('/tags', { name });
    return response.data;
  }

  async getPost(postId: number) {
    const response = await this.client.get(`/posts/${postId}`);
    return response.data;
  }

  async deletePost(postId: number) {
    const response = await this.client.delete(`/posts/${postId}`, {
      params: { force: true },
    });
    return response.data;
  }
}

export const wordpressService = new WordPressService();
