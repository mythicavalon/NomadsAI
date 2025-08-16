"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import CityCard from "../components/CityCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Signal = any;

export default function HomePage() {
	const [destination, setDestination] = useState("Barcelona, Spain");
	const [days, setDays] = useState(3);
	const [budget, setBudget] = useState("medium");
	const [interests, setInterests] = useState<string[]>(["culture", "food"]);
	const [region, setRegion] = useState<string>("");
	const [signals, setSignals] = useState<Signal[]>([]);
	const [itinerary, setItinerary] = useState<any>(null);
	const [surprise, setSurprise] = useState<string[] | null>(null);
	const [loading, setLoading] = useState(false);
	const [onlineMode, setOnlineMode] = useState(true);

	const interestOptions = ["culture", "food", "adventure", "relax"];
	const sampleCities = [
		{ name: "Barcelona, Spain", blurb: "Gaudí, beaches, tapas" },
		{ name: "Tokyo, Japan", blurb: "Shrines, neon, ramen" },
		{ name: "New Orleans, USA", blurb: "Jazz, Creole, river" },
	];

	useEffect(() => {
		const params = new URLSearchParams();
		if (destination) params.set("destination", destination);
		if (region) params.set("region", region);
		if (onlineMode) params.set("online_mode", "true");
		fetch(`${API_BASE}/api/signals/?${params.toString()}`)
			.then(r => r.json())
			.then(setSignals)
			.catch(() => setSignals([]));
	}, [destination, region, onlineMode]);

	function toggleInterest(value: string) {
		setInterests(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
	}

	async function buildItinerary() {
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE}/api/itineraries/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ destination, days, budget, interests, online_mode: onlineMode })
			});
			const data = await res.json();
			setItinerary(data);
			setSurprise(null);
		} finally {
			setLoading(false);
		}
	}

	async function getSurprise() {
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE}/api/itineraries/surprise?destination=${encodeURIComponent(destination)}`);
			const data = await res.json();
			setSurprise(data.picks || []);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-8">
			<section className="rounded-xl p-8 bg-gradient-to-br from-brand/20 to-white/5 border border-white/10">
				<h1 className="text-3xl font-semibold mb-2">Nomad AI — Smarter trips with AI</h1>
				<p className="text-white/70">Itineraries that highlight landmarks, food, and events — plus live travel signals and surprise picks.</p>
				<div className="mt-4 grid sm:grid-cols-3 gap-3">
					{sampleCities.map(c => (
						<CityCard key={c.name} name={c.name} blurb={c.blurb} onSelect={setDestination} />
					))}
				</div>
			</section>

			<section className="card grid md:grid-cols-3 gap-4">
				<div>
					<label className="block text-sm text-white/70">Destination</label>
					<input value={destination} onChange={e => setDestination(e.target.value)} className="mt-1 w-full rounded bg-white/10 px-3 py-2 outline-none" />
				</div>
				<div>
					<label className="block text-sm text-white/70">Days</label>
					<input type="number" min={1} max={21} value={days} onChange={e => setDays(parseInt(e.target.value || "1"))} className="mt-1 w-full rounded bg-white/10 px-3 py-2 outline-none" />
				</div>
				<div>
					<label className="block text-sm text-white/70">Budget</label>
					<select value={budget} onChange={e => setBudget(e.target.value)} className="mt-1 w-full rounded bg-white/10 px-3 py-2 outline-none">
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
					</select>
				</div>
				<div className="md:col-span-2">
					<label className="block text-sm text-white/70">Interests</label>
					<div className="mt-2 flex flex-wrap gap-2">
						{interestOptions.map(opt => (
							<button key={opt} onClick={() => toggleInterest(opt)} className={clsx("px-3 py-1 rounded-full border", interests.includes(opt) ? "bg-brand text-black border-brand-light" : "border-white/20 bg-white/5")}>{opt}</button>
						))}
					</div>
				</div>
				<div>
					<label className="block text-sm text-white/70">Region filter</label>
					<select value={region} onChange={e => setRegion(e.target.value)} className="mt-1 w-full rounded bg-white/10 px-3 py-2 outline-none">
						<option value="">All</option>
						<option>Europe</option>
						<option>Asia</option>
						<option>North America</option>
					</select>
				</div>
				<div className="md:col-span-3 flex items-center gap-3 flex-wrap">
					<button onClick={buildItinerary} className="px-4 py-2 rounded bg-brand text-black font-medium hover:bg-brand-light">Build Itinerary</button>
					<button onClick={getSurprise} className="px-4 py-2 rounded border border-brand text-brand font-medium hover:bg-brand/10">Surprise me</button>
					<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlineMode} onChange={e => setOnlineMode(e.target.checked)} /> Online mode</label>
					{loading && <span className="text-white/60 text-sm">Working…</span>}
				</div>
			</section>

			{itinerary && (
				<section className="card">
					<h2 className="text-xl font-semibold">Itinerary for {itinerary.destination} ({itinerary.days} days)</h2>
					<p className="text-white/70 mb-4">Budget: {itinerary.estimated_budget}</p>
					<div className="grid md:grid-cols-3 gap-4">
						<div className="md:col-span-2 space-y-4">
							{itinerary.day_plans?.map((day: any) => (
								<div key={day.day} className="p-3 rounded bg-white/5 border border-white/10">
									<div className="font-medium mb-2">Day {day.day}: {day.summary}</div>
									<ol className="space-y-2">
										{day.activities.map((a: any, idx: number) => (
											<li key={idx} className="text-sm text-white/80"><span className="text-white/60">{a.time}</span> — <span className="font-medium">{a.title}</span> — {a.description}</li>
										))}
									</ol>
								</div>
							))}
						</div>
						<div>
							<div className="font-medium mb-2">Surprise picks</div>
							<ul className="list-disc list-inside text-white/80">
								{(surprise ?? itinerary.surprise_picks)?.map((s: string, i: number) => <li key={i}>{s}</li>)}
							</ul>
						</div>
					</div>
				</section>
			)}

			<section className="card">
				<h2 className="text-xl font-semibold mb-3">Travel Signals</h2>
				{signals.length === 0 && <div className="text-white/60 text-sm">No signals for this filter yet.</div>}
				<div className="grid md:grid-cols-3 gap-4">
					{signals.map((s: any, idx: number) => (
						<div key={idx} className="p-3 rounded bg-white/5 border border-white/10">
							<div className="text-xs uppercase tracking-wide text-white/60">{s.type}</div>
							<div className="font-medium">
								{s.type === 'event' && s.name}
								{s.type === 'flight_deal' && `${s.from} → ${s.to}`}
								{s.type === 'hotel_rate' && s.name}
								{s.type === 'news' && s.title}
							</div>
							<div className="text-white/70 text-sm">
								{s.type === 'event' && `${s.location} — ${s.start_date}`}
								{s.type === 'flight_deal' && `$${s.price} — found ${s.found_at}`}
								{s.type === 'hotel_rate' && `${s.city} — from $${s.price_per_night}/night`}
								{s.type === 'news' && <a className="underline" href={s.href} target="_blank" rel="noreferrer">{s.source || 'news'}</a>}
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}