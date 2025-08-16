import fetch from 'node-fetch';
import config from './config.js';

export async function handleChatCompletions(req, res) {
	try {
		const incoming = req.body || {};
		const messages = Array.isArray(incoming.messages) ? incoming.messages : [];
		const systemMsg = { role: 'system', content: config.systemPrompt };
		const finalMessages = [systemMsg, ...messages];

		// Compose payload
		const payload = {
			model: incoming.model || config.openai.model,
			messages: finalMessages,
			stream: incoming.stream || false,
			max_tokens: incoming.max_tokens,
			temperature: incoming.temperature,
			top_p: incoming.top_p,
			frequency_penalty: incoming.frequency_penalty,
			presence_penalty: incoming.presence_penalty,
			response_format: incoming.response_format,
			seed: incoming.seed,
			stop: incoming.stop,
			user: incoming.user,
		};

		const url = `${config.openai.baseUrl}/v1/chat/completions`;
		const headers = { 'Content-Type': 'application/json' };
		if (config.openai.apiKey && config.openai.apiKey.toLowerCase() !== 'none') {
			headers['Authorization'] = `Bearer ${config.openai.apiKey}`;
		}

		const upstream = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify(payload),
		});

		if (!upstream.ok) {
			const text = await upstream.text();
			return res.status(upstream.status).send(text);
		}

		// Proxy JSON (non-streaming)
		const data = await upstream.json();
		return res.status(200).json(data);
	} catch (err) {
		console.error('chat proxy error', err);
		return res.status(500).json({ error: { message: 'Upstream error', details: String(err) } });
	}
}