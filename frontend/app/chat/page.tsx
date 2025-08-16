"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
	const [destination, setDestination] = useState("");
	const [messages, setMessages] = useState<Msg[]>([
		{ role: "assistant", content: "Hi! Ask me about a city and I’ll suggest landmarks, food and current signals." }
	]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);

	async function send() {
		if (!input.trim()) return;
		const next = [...messages, { role: "user", content: input } as Msg];
		setMessages(next);
		setInput("");
		setLoading(true);
		try {
			const base_url = localStorage.getItem("gpt_base_url") || undefined;
			const api_key = localStorage.getItem("gpt_api_key") || undefined;
			const model = localStorage.getItem("gpt_model") || undefined;
			const res = await fetch(`${API_BASE}/api/chat/`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: next, destination: destination || null, base_url, api_key, model })
			});
			const data = await res.json();
			setMessages([...next, { role: "assistant", content: data.reply }]);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Nomad AI Chat</h1>
			<div className="card">
				<label className="block text-sm text-white/70">Destination context (optional)</label>
				<input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Barcelona, Spain" className="mt-1 w-full rounded bg-white/10 px-3 py-2 outline-none"/>
			</div>
			<div className="card space-y-3">
				<div className="space-y-2">
					{messages.map((m, i) => (
						<div key={i} className="text-sm">
							<span className="text-white/60">{m.role === 'user' ? 'You' : 'Nomad AI'}:</span> {m.content}
						</div>
					))}
				</div>
				<div className="flex gap-2">
					<input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} className="flex-1 rounded bg-white/10 px-3 py-2 outline-none" placeholder="Ask for a 2-day foodie plan in Tokyo..."/>
					<button onClick={send} className="px-4 py-2 rounded bg-brand text-black font-medium hover:bg-brand-light" disabled={loading}>{loading ? '...' : 'Send'}</button>
				</div>
				<div className="text-xs text-white/60">Tip: Configure GPT settings in Settings page for live AI.</div>
			</div>
		</div>
	);
}