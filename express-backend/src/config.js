import dotenv from 'dotenv';

dotenv.config();

const config = {
	port: process.env.PORT || 8001,
	openai: {
		apiKey: process.env.OPENAI_API_KEY || '',
		baseUrl: (process.env.OPENAI_BASE_URL || 'https://api.openai.com').replace(/\/$/, ''),
		model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
	},
	systemPrompt: process.env.SYSTEM_PROMPT || 'You are NomadAI, a warm, conversational travel partner that crafts delightful itineraries and helps travelers with timely, practical advice.',
	corsOrigins: (process.env.CORS_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean),
};

export default config;