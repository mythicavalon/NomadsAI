"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Memory = { id: number; title: string; content: string; destination: string; created_at: string };

export default function MemoriesPage() {
	const [items, setItems] = useState<Memory[]>([]);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [destination, setDestination] = useState("");

	async function refresh() {
		const r = await fetch(`${API_BASE}/api/memory/`);
		const data = await r.json();
		setItems(data);
	}

	useEffect(() => { refresh(); }, []);

	async function addMemory() {
		await fetch(`${API_BASE}/api/memory/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title, content, destination })
		});
		setTitle(""); setContent(""); setDestination("");
		refresh();
	}

	async function deleteMemory(id: number) {
		await fetch(`${API_BASE}/api/memory/${id}`, { method: 'DELETE' });
		refresh();
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Memory Journal</h1>
			<div className="card grid md:grid-cols-3 gap-3">
				<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="rounded bg-white/10 px-3 py-2 outline-none"/>
				<input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Destination" className="rounded bg-white/10 px-3 py-2 outline-none"/>
				<input value={content} onChange={e => setContent(e.target.value)} placeholder="Notes" className="rounded bg-white/10 px-3 py-2 outline-none"/>
				<div className="md:col-span-3">
					<button onClick={addMemory} className="px-4 py-2 rounded bg-brand text-black font-medium hover:bg-brand-light">Save</button>
				</div>
			</div>
			<div className="grid md:grid-cols-3 gap-4">
				{items.map(m => (
					<div key={m.id} className="card">
						<div className="text-sm text-white/60">{new Date(m.created_at).toLocaleString()}</div>
						<div className="font-medium">{m.title}</div>
						<div className="text-white/70 text-sm">{m.destination}</div>
						<p className="text-white/80 mt-2">{m.content}</p>
						<div className="mt-3">
							<button onClick={() => deleteMemory(m.id)} className="text-red-300 hover:underline text-sm">Delete</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}