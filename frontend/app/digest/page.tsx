"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function DigestPage() {
	const [email, setEmail] = useState("");
	const [region, setRegion] = useState("");
	const [status, setStatus] = useState<string | null>(null);

	async function sendDigest() {
		setStatus(null);
		const res = await fetch(`${API_BASE}/api/digest/send`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, region: region || null })
		});
		if (res.ok) setStatus("Sent! Check your inbox or backend outbox.");
		else setStatus("Failed to send");
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Weekly Email Digest</h1>
			<div className="card grid md:grid-cols-3 gap-3">
				<input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="rounded bg-white/10 px-3 py-2 outline-none"/>
				<select value={region} onChange={e => setRegion(e.target.value)} className="rounded bg-white/10 px-3 py-2 outline-none">
					<option value="">All regions</option>
					<option>Europe</option>
					<option>Asia</option>
					<option>North America</option>
				</select>
				<div>
					<button onClick={sendDigest} className="px-4 py-2 rounded bg-brand text-black font-medium hover:bg-brand-light">Send me top 5</button>
				</div>
			</div>
			{status && <div className="text-sm text-white/70">{status}</div>}
		</div>
	);
}