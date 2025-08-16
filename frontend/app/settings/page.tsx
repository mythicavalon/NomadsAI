"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
	const [baseUrl, setBaseUrl] = useState("");
	const [apiKey, setApiKey] = useState("");
	const [model, setModel] = useState("");
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		setBaseUrl(localStorage.getItem("gpt_base_url") || "");
		setApiKey(localStorage.getItem("gpt_api_key") || "");
		setModel(localStorage.getItem("gpt_model") || "");
	}, []);

	function save() {
		localStorage.setItem("gpt_base_url", baseUrl);
		localStorage.setItem("gpt_api_key", apiKey);
		localStorage.setItem("gpt_model", model);
		setSaved(true);
		setTimeout(() => setSaved(false), 1500);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Settings</h1>
			<div className="card grid md:grid-cols-2 gap-3">
				<div>
					<label className="block text-sm text-white/70">GPT Base URL (OpenAI-compatible)</label>
					<input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://openrouter.ai/api/v1" className="mt-1 w-full rounded bg-white/10 px-3 py-2 outline-none"/>
				</div>
				<div>
					<label className="block text-sm text-white/70">API Key</label>
					<input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-…" className="mt-1 w-full rounded bg-white/10 px-3 py-2 outline-none"/>
				</div>
				<div className="md:col-span-2">
					<label className="block text-sm text-white/70">Model</label>
					<input value={model} onChange={e => setModel(e.target.value)} placeholder="meta-llama/Meta-Llama-3.1-8B-Instruct" className="mt-1 w-full rounded bg-white/10 px-3 py-2 outline-none"/>
				</div>
				<div className="md:col-span-2">
					<button onClick={save} className="px-4 py-2 rounded bg-brand text-black font-medium hover:bg-brand-light">Save</button>
					{saved && <span className="ml-3 text-sm text-white/70">Saved</span>}
				</div>
			</div>
		</div>
	);
}