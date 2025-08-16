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
		<div className="grid md:grid-cols-12 gap-6">
			<div className="md:col-span-8 md:col-start-3">
				<div className="mb-4">
					<label className="block text-sm text-white/80">Destination context (optional)</label>
					<input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Barcelona, Spain" className="mt-1 w-full rounded-2xl bg-white/10 px-4 py-2 outline-none shadow-lg"/>
				</div>

				<div ref={listRef} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 shadow-lg h-[60vh] overflow-y-auto space-y-4">
					{messages.map((m, i) => (
						<div key={i} className={m.role === 'assistant' ? "flex justify-start" : "flex justify-end"}>
							<div className={m.role === 'assistant' ? "max-w-[80%] rounded-2xl accent-bg/90 text-black shadow-lg px-4 py-3" : "max-w-[80%] rounded-2xl bg-gray-300 text-black shadow-lg px-4 py-3"}>
								<div className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
							</div>
						</div>
					))}
				</div>

				<div className="sticky bottom-4">
					<div className="mb-2 flex gap-2 flex-wrap">
						{SUGGESTIONS.map(s => (
							<button key={s} onClick={() => send(s)} className="rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-1 text-xs shadow">{s}</button>
						))}
					</div>
					<div className="flex items-center gap-2 rounded-2xl bg-white/10 border border-white/15 shadow px-3 py-2">
						<input value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Ask anything…" className="flex-1 bg-transparent outline-none"/>
						<button onClick={() => send()} disabled={loading} className="rounded-full accent-bg text-black px-3 py-2 hover:opacity-90 shadow">
							<Send size={16} />
						</button>
					</div>
				</div>
			</div>

			{/* Sidebar placeholder for larger screens (Nomad Tools) */}
			<div className="hidden md:block md:col-span-3">
				<div className="card">
					<h3 className="text-sm font-semibold mb-3">Nomad Tools</h3>
					<div className="grid gap-3">
						<div className="rounded-2xl bg-white/5 border border-white/10 p-3">Cost Calculator</div>
						<div className="rounded-2xl bg-white/5 border border-white/10 p-3">Visa Info</div>
						<div className="rounded-2xl bg-white/5 border border-white/10 p-3">Coworking Map</div>
					</div>
				</div>
			</div>
		</div>
	);
}