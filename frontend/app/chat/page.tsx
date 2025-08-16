"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = ["Plan my trip", "Find coworking", "Local food", "Translate phrase"];

export default function ChatPage() {
	const [destination, setDestination] = useState("");
	const [messages, setMessages] = useState<Msg[]>([
		{ role: "assistant", content: "🌍 Hi! I’m NomadAI. Ask me about trips, hidden gems, or local tips anywhere." }
	]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
	}, [messages.length]);

	async function send(text?: string) {
		const content = (text ?? input).trim();
		if (!content) return;
		const next = [...messages, { role: "user", content } as Msg];
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
			setMessages([...next, { role: "assistant", content: `🌍 ${data.reply || 'I could not generate a reply.'}` }]);
		} finally {
			setLoading(false);
		}
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter') {
			e.preventDefault();
			send();
		}
	}

	return (
		<div className="relative">
			<div className="mb-4">
				<label className="block text-sm text-white/80">Destination context (optional)</label>
				<input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Barcelona, Spain" className="mt-1 w-full rounded-2xl bg-white/10 px-4 py-2 outline-none shadow"/>
			</div>

			<div ref={listRef} className="card h-[62vh] overflow-y-auto space-y-3 p-4 rounded-2xl">
				{messages.map((m, i) => (
					<div key={i} className={m.role === 'assistant' ? "flex justify-start" : "flex justify-end"}>
						<div className={m.role === 'assistant' ? "max-w-[80%] rounded-2xl bg-white/10 shadow px-4 py-2" : "max-w-[80%] rounded-2xl bg-brand text-black shadow px-4 py-2"}>
							<div className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
						</div>
					</div>
				))}
			</div>

			<div className="sticky bottom-4">
				<div className="mb-2 flex gap-2 flex-wrap">
					{SUGGESTIONS.map(s => (
						<button key={s} onClick={() => send(s)} className="rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1 text-xs shadow">{s}</button>
					))}
				</div>
				<div className="flex items-center gap-2 rounded-2xl bg-white/10 border border-white/15 shadow px-3 py-2">
					<input value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Ask anything…" className="flex-1 bg-transparent outline-none"/>
					<button onClick={() => send()} disabled={loading} className="rounded-full bg-brand text-black px-3 py-2 hover:bg-brand-light shadow">
						<Send size={16} />
					</button>
				</div>
			</div>
		</div>
	);
}