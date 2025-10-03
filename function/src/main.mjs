import { getStaticFile } from './utils.mjs';
import { OpenAIApi, Configuration } from 'openai';
import pkg from 'node-appwrite';
const { Client, Databases } = pkg;

export default async ({ req, res }) => {
  if (req.method === 'GET') {
    return res.text(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8'
    });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!body?.prompt || typeof body.prompt !== 'string') {
      return res.json({ ok: false, error: "Missing required field `prompt`" }, 400);
    }

    const openai = new OpenAIApi(new Configuration({
      apiKey: process.env.GEMINI_API_KEY
    }));

    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: body.prompt }],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS ?? '512', 10)
      });

      const completion = response.data.choices?.[0]?.message?.content ?? 'No response';

      const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT ?? "https://<REGION>.cloud.appwrite.io/v1")
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

      const databases = new Databases(client);
      const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? '<DATABASE_ID>';
      const COLLECTION_ID = process.env.APPWRITE_COLLECTION_ID ?? '<COLLECTION_ID>';

      await databases.createDocument(DATABASE_ID, COLLECTION_ID, 'unique()', {
        prompt: body.prompt,
        response: completion,
        createdAt: new Date().toISOString()
      });

      return res.json({ ok: true, completion }, 200);
    } catch (err) {
      console.error(err);
      return res.json({ ok: false, error: 'Failed to query model.' }, 500);
    }
  }

  return res.json({ ok: false, error: 'Method not allowed' }, 405);
};

