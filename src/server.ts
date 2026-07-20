import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ProviderFactory } from './providers/ProviderFactory';
import { ConfigLoader } from './providers/config/ProviderConfig';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const logger = {
  info: (msg: string) => console.log(msg),
  warn: (msg: string) => console.warn(msg),
  error: (msg: string, err?: any) => console.error(msg, err)
};

const config = ConfigLoader.loadFromEnv();
const providerFactory = new ProviderFactory(logger);
const provider = providerFactory.createProvider(config);

app.post('/api/generate', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    logger.info(`Received generation request for topic: ${topic}`);

    const prompt = `Write a high-quality piece of content based on the following topic/request:
"${topic}"

Return ONLY the raw content text, without any introductory or explanatory text. Do not wrap in JSON. Make it engaging and professional.`;

    const provRes = await provider.generateText(prompt);

    if (!provRes.isSuccess) {
       logger.error('Provider error:', provRes.error);
       return res.status(500).json({ error: 'Failed to generate content' });
    }

    const content = (provRes as any).value;
    return res.json({ content });

  } catch (err: any) {
    logger.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
  console.log(`Using AI Provider: ${config.provider}`);
});
