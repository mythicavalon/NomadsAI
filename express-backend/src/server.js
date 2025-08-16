import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import config from './config.js';
import { handleChatCompletions } from './openaiProxy.js';

const app = express();

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
app.post('/v1/chat/completions', handleChatCompletions);

app.use((req, res) => res.status(404).json({ error: { message: 'Not Found' } }));

app.listen(config.port, () => {
	console.log(`NomadAI OpenAI-compatible backend listening on port ${config.port}`);
});