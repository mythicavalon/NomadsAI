"use client";

import { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import { Search, MapPin, Calendar, Users, DollarSign, Sparkles, TrendingUp, Globe, Clock, Star } from "lucide-react";
import CityCard from "../components/CityCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Signal = any;

// Comprehensive city database for autocomplete
const WORLD_CITIES = [
	// Popular destinations
	{ name: "Barcelona, Spain", country: "Spain", blurb: "Gaudí architecture, beaches, vibrant culture", trending: true },
	{ name: "Tokyo, Japan", country: "Japan", blurb: "Modern metropolis, ancient temples, incredible food", trending: true },
	{ name: "New York, USA", country: "United States", blurb: "The city that never sleeps, iconic skyline", trending: false },
	{ name: "Paris, France", country: "France", blurb: "City of lights, art, romance, and cuisine", trending: false },
	{ name: "London, England", country: "United Kingdom", blurb: "Royal history, modern culture, diverse neighborhoods", trending: false },
	{ name: "Rome, Italy", country: "Italy", blurb: "Eternal city, ancient history, incredible pasta", trending: false },
	{ name: "Dubai, UAE", country: "United Arab Emirates", blurb: "Futuristic skyline, luxury shopping, desert adventures", trending: true },
	{ name: "Bali, Indonesia", country: "Indonesia", blurb: "Tropical paradise, temples, rice terraces", trending: true },
	{ name: "Istanbul, Turkey", country: "Turkey", blurb: "Where Europe meets Asia, rich history, amazing food", trending: false },
	{ name: "Bangkok, Thailand", country: "Thailand", blurb: "Street food capital, golden temples, vibrant markets", trending: true },
	
	// Digital nomad hotspots
	{ name: "Lisbon, Portugal", country: "Portugal", blurb: "Affordable charm, great weather, nomad-friendly", trending: true },
	{ name: "Mexico City, Mexico", country: "Mexico", blurb: "Rich culture, incredible food, affordable living", trending: true },
	{ name: "Berlin, Germany", country: "Germany", blurb: "Creative hub, history, excellent nightlife", trending: false },
	{ name: "Amsterdam, Netherlands", country: "Netherlands", blurb: "Canals, bikes, liberal culture, great coffee", trending: false },
	{ name: "Singapore", country: "Singapore", blurb: "Garden city, food paradise, business hub", trending: false },
	{ name: "Prague, Czech Republic", country: "Czech Republic", blurb: "Fairy-tale architecture, affordable beer, rich history", trending: false },
	{ name: "Buenos Aires, Argentina", country: "Argentina", blurb: "Tango, steak, European feel in South America", trending: false },
	{ name: "Cape Town, South Africa", country: "South Africa", blurb: "Stunning landscapes, wine country, diverse culture", trending: false },
	
	// Emerging destinations
	{ name: "Medellín, Colombia", country: "Colombia", blurb: "City of eternal spring, innovation, transformation", trending: true },
	{ name: "Tbilisi, Georgia", country: "Georgia", blurb: "Affordable living, wine culture, stunning mountains", trending: true },
	{ name: "Ho Chi Minh City, Vietnam", country: "Vietnam", blurb: "Motorbike madness, incredible pho, French colonial charm", trending: true },
	{ name: "Kuala Lumpur, Malaysia", country: "Malaysia", blurb: "Modern skyline, diverse food, affordable luxury", trending: false },
	{ name: "Warsaw, Poland", country: "Poland", blurb: "Rising tech hub, history, affordable European experience", trending: false },
	{ name: "Lagos, Nigeria", country: "Nigeria", blurb: "African megacity, Afrobeats culture, business opportunities", trending: true },
];

export default function HomePage() {
	const [destination, setDestination] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredCities, setFilteredCities] = useState<typeof WORLD_CITIES>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [days, setDays] = useState(7);
	const [budget, setBudget] = useState("medium");
	const [interests, setInterests] = useState<string[]>(["culture", "food"]);
	const [travelers, setTravelers] = useState(1);
	const [signals, setSignals] = useState<Signal[]>([]);
	const [itinerary, setItinerary] = useState<any>(null);
	const [surprise, setSurprise] = useState<string[] | null>(null);
	const [loading, setLoading] = useState(false);
	const [onlineMode, setOnlineMode] = useState(true);
	const searchRef = useRef<HTMLDivElement>(null);

	const interestOptions = [
		{ id: "culture", label: "Culture & History", icon: "🏛️" },
		{ id: "food", label: "Food & Drink", icon: "🍽️" },
		{ id: "adventure", label: "Adventure", icon: "🏔️" },
		{ id: "relax", label: "Relaxation", icon: "🏖️" },
		{ id: "nightlife", label: "Nightlife", icon: "🌃" },
		{ id: "nature", label: "Nature", icon: "🌿" },
		{ id: "art", label: "Art & Museums", icon: "🎨" },
		{ id: "shopping", label: "Shopping", icon: "🛍️" }
	];

	const featuredDestinations = WORLD_CITIES.filter(city => city.trending).slice(0, 6);

	// Handle search input and filtering
	useEffect(() => {
		if (searchQuery.length > 0) {
			const filtered = WORLD_CITIES.filter(city =>
				city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				city.country.toLowerCase().includes(searchQuery.toLowerCase())
			).slice(0, 8);
			setFilteredCities(filtered);
			setShowSuggestions(true);
		} else {
			setFilteredCities([]);
			setShowSuggestions(false);
		}
	}, [searchQuery]);

	// Handle clicks outside search
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setShowSuggestions(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Fetch signals
	useEffect(() => {
		const params = new URLSearchParams();
		if (destination) params.set("destination", destination);
		if (onlineMode) params.set("online_mode", "true");
		fetch(`${API_BASE}/api/signals/?${params.toString()}`)
			.then(r => r.json())
			.then(setSignals)
			.catch(() => setSignals([]));
	}, [destination, onlineMode]);

	function selectCity(city: typeof WORLD_CITIES[0]) {
		setDestination(city.name);
		setSearchQuery(city.name);
		setShowSuggestions(false);
	}

	function toggleInterest(value: string) {
		setInterests(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
	}

	async function buildItinerary() {
		if (!destination.trim()) {
			alert("Please select a destination first!");
			return;
		}
		
		setLoading(true);
		try {
			const base_url = localStorage.getItem("gpt_base_url") || undefined;
			const api_key = localStorage.getItem("gpt_api_key") || undefined;
			const model = localStorage.getItem("gpt_model") || undefined;
			const res = await fetch(`${API_BASE}/api/itineraries/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ destination, days, budget, interests, online_mode: onlineMode, base_url, api_key, model })
			});
			const data = await res.json();
			setItinerary(data);
			setSurprise(null);
		} finally {
			setLoading(false);
		}
	}

	async function getSurprise() {
		if (!destination.trim()) {
			alert("Please select a destination first!");
			return;
		}
		
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
		<div className="space-y-12">
			{/* Premium Hero Section */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-ocean-500/10 rounded-3xl"></div>
				<div className="relative glass-strong rounded-3xl p-12 text-center">
					<div className="max-w-4xl mx-auto">
						<h1 className="heading-xl mb-6 animate-float">
							Your AI Travel Companion
						</h1>
						<p className="text-premium mb-8 max-w-2xl mx-auto">
							Discover extraordinary destinations with personalized itineraries powered by AI. 
							From hidden gems to world-famous landmarks, we'll craft the perfect journey just for you.
						</p>
						
						{/* Premium Search Bar */}
						<div ref={searchRef} className="relative max-w-2xl mx-auto mb-8">
							<div className="relative">
								<Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/60 w-6 h-6" />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onFocus={() => searchQuery && setShowSuggestions(true)}
									placeholder="Where do you want to explore? (e.g., Tokyo, Barcelona, Bali...)"
									className="w-full pl-16 pr-6 py-6 text-xl bg-white/10 border border-white/20 rounded-2xl backdrop-blur-lg focus:outline-none focus:border-brand-400 focus:bg-white/15 transition-all duration-300 placeholder-white/50"
								/>
							</div>
							
							{/* Search Suggestions Dropdown */}
							{showSuggestions && filteredCities.length > 0 && (
								<div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-2xl border border-white/20 max-h-96 overflow-y-auto z-50">
									{filteredCities.map((city, idx) => (
										<button
											key={idx}
											onClick={() => selectCity(city)}
											className="w-full px-6 py-4 text-left hover:bg-white/10 transition-colors duration-200 flex items-center gap-4 first:rounded-t-2xl last:rounded-b-2xl"
										>
											<MapPin className="w-5 h-5 text-brand-400 flex-shrink-0" />
											<div className="flex-1">
												<div className="font-medium text-white">{city.name}</div>
												<div className="text-sm text-white/70">{city.blurb}</div>
											</div>
											{city.trending && (
												<div className="flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
													<TrendingUp className="w-3 h-3" />
													Trending
												</div>
											)}
										</button>
									))}
								</div>
							)}
						</div>

						{/* Featured Destinations */}
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
							{featuredDestinations.map((city, idx) => (
								<button
									key={idx}
									onClick={() => selectCity(city)}
									className="group p-4 glass rounded-xl hover:glass-strong transition-all duration-300 transform hover:-translate-y-1"
								>
									<div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
										{city.country === "Japan" ? "🗾" : 
										 city.country === "Spain" ? "🇪🇸" : 
										 city.country === "Indonesia" ? "🏝️" : 
										 city.country === "UAE" ? "🏗️" : 
										 city.country === "Portugal" ? "🇵🇹" : 
										 city.country === "Mexico" ? "🇲🇽" : "🌍"}
									</div>
									<div className="text-sm font-medium text-white group-hover:text-brand-400 transition-colors duration-300">
										{city.name.split(',')[0]}
									</div>
								</button>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Premium Planning Interface */}
			<section className="card">
				<h2 className="heading-md mb-8">Customize Your Perfect Trip</h2>
				
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{/* Duration */}
					<div className="space-y-3">
						<label className="flex items-center gap-2 text-white/80 font-medium">
							<Calendar className="w-5 h-5 text-brand-400" />
							Duration
						</label>
						<select 
							value={days} 
							onChange={e => setDays(parseInt(e.target.value))} 
							className="input-premium w-full"
						>
							<option value={3}>3 days</option>
							<option value={5}>5 days</option>
							<option value={7}>1 week</option>
							<option value={10}>10 days</option>
							<option value={14}>2 weeks</option>
							<option value={21}>3 weeks</option>
							<option value={30}>1 month</option>
						</select>
					</div>

					{/* Budget */}
					<div className="space-y-3">
						<label className="flex items-center gap-2 text-white/80 font-medium">
							<DollarSign className="w-5 h-5 text-brand-400" />
							Budget Level
						</label>
						<select 
							value={budget} 
							onChange={e => setBudget(e.target.value)} 
							className="input-premium w-full"
						>
							<option value="budget">Budget ($30-50/day)</option>
							<option value="medium">Comfort ($75-150/day)</option>
							<option value="luxury">Luxury ($200+/day)</option>
						</select>
					</div>

					{/* Travelers */}
					<div className="space-y-3">
						<label className="flex items-center gap-2 text-white/80 font-medium">
							<Users className="w-5 h-5 text-brand-400" />
							Travelers
						</label>
						<select 
							value={travelers} 
							onChange={e => setTravelers(parseInt(e.target.value))} 
							className="input-premium w-full"
						>
							<option value={1}>Solo traveler</option>
							<option value={2}>Couple</option>
							<option value={3}>3 people</option>
							<option value={4}>4 people</option>
							<option value={5}>5+ people</option>
						</select>
					</div>

					{/* Online Mode */}
					<div className="space-y-3">
						<label className="flex items-center gap-2 text-white/80 font-medium">
							<Globe className="w-5 h-5 text-brand-400" />
							Data Mode
						</label>
						<label className="flex items-center gap-3 p-4 glass rounded-xl cursor-pointer hover:glass-strong transition-all duration-300">
							<input 
								type="checkbox" 
								checked={onlineMode} 
								onChange={e => setOnlineMode(e.target.checked)}
								className="w-5 h-5 text-brand-500 rounded focus:ring-brand-400"
							/>
							<span className="text-white/80">Real-time data</span>
						</label>
					</div>
				</div>

				{/* Interests */}
				<div className="space-y-4 mb-8">
					<label className="flex items-center gap-2 text-white/80 font-medium">
						<Star className="w-5 h-5 text-brand-400" />
						What interests you?
					</label>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						{interestOptions.map(option => (
							<button
								key={option.id}
								onClick={() => toggleInterest(option.id)}
								className={clsx(
									"flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 transform hover:scale-105",
									interests.includes(option.id)
										? "bg-brand-500/20 border-brand-400 text-brand-400"
										: "glass border-white/20 text-white/80 hover:glass-strong"
								)}
							>
								<span className="text-xl">{option.icon}</span>
								<span className="font-medium">{option.label}</span>
							</button>
						))}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-wrap items-center gap-4">
					<button 
						onClick={buildItinerary} 
						disabled={loading}
						className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Sparkles className="w-5 h-5" />
						{loading ? "Creating magic..." : "Build My Itinerary"}
					</button>
					<button 
						onClick={getSurprise} 
						disabled={loading}
						className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Star className="w-5 h-5" />
						Surprise Me
					</button>
					{loading && (
						<div className="flex items-center gap-2 text-brand-400">
							<Clock className="w-5 h-5 animate-spin" />
							<span>Working on your perfect trip...</span>
						</div>
					)}
				</div>
			</section>

			{/* Itinerary Results */}
			{itinerary && (
				<section className="card">
					<div className="flex items-center gap-3 mb-6">
						<MapPin className="w-6 h-6 text-brand-400" />
						<h2 className="heading-md">Your {itinerary.destination} Adventure ({itinerary.days} days)</h2>
					</div>
					<p className="text-premium mb-6">Estimated budget: {itinerary.estimated_budget}</p>
					
					<div className="grid lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2 space-y-6">
							{itinerary.day_plans?.map((day: any) => (
								<div key={day.day} className="glass rounded-2xl p-6">
									<div className="flex items-center gap-3 mb-4">
										<div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
											{day.day}
										</div>
										<h3 className="text-xl font-semibold text-white">{day.summary}</h3>
									</div>
									<div className="space-y-3">
										{day.activities.map((activity: any, idx: number) => (
											<div key={idx} className="flex gap-4 p-3 glass rounded-xl">
												<div className="text-brand-400 font-medium min-w-[60px]">{activity.time}</div>
												<div className="flex-1">
													<div className="font-medium text-white mb-1">{activity.title}</div>
													<div className="text-white/70 text-sm">{activity.description}</div>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
						
						<div className="space-y-6">
							<div className="glass rounded-2xl p-6">
								<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
									<Star className="w-5 h-5 text-amber-400" />
									Hidden Gems
								</h3>
								<ul className="space-y-3">
									{(surprise ?? itinerary.surprise_picks)?.map((pick: string, i: number) => (
										<li key={i} className="flex items-start gap-3 text-white/80">
											<div className="w-2 h-2 rounded-full bg-brand-400 mt-2 flex-shrink-0"></div>
											<span>{pick}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</section>
			)}

			{/* Travel Signals */}
			<section className="card">
				<h2 className="heading-md mb-6 flex items-center gap-3">
					<TrendingUp className="w-6 h-6 text-brand-400" />
					Live Travel Intelligence
				</h2>
				{signals.length === 0 ? (
					<div className="text-center py-12 text-white/60">
						<Globe className="w-12 h-12 mx-auto mb-4 text-white/40" />
						<p>No live signals available. Select a destination to see real-time travel data.</p>
					</div>
				) : (
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{signals.map((signal: any, idx: number) => (
							<div key={idx} className="glass rounded-xl p-6 hover:glass-strong transition-all duration-300">
								<div className="flex items-center gap-2 mb-3">
									<div className={clsx(
										"w-3 h-3 rounded-full",
										signal.type === 'flight_deal' ? "bg-blue-400" :
										signal.type === 'hotel_rate' ? "bg-green-400" :
										signal.type === 'event' ? "bg-purple-400" : "bg-amber-400"
									)}></div>
									<span className="text-xs uppercase tracking-wide text-white/60 font-medium">
										{signal.type.replace('_', ' ')}
									</span>
								</div>
								<div className="font-semibold text-white mb-2">
									{signal.type === 'event' && signal.name}
									{signal.type === 'flight_deal' && `${signal.from} → ${signal.to}`}
									{signal.type === 'hotel_rate' && signal.name}
									{signal.type === 'news' && signal.title}
								</div>
								<div className="text-white/70 text-sm">
									{signal.type === 'event' && `${signal.location} — ${signal.start_date}`}
									{signal.type === 'flight_deal' && `$${signal.price} — found ${signal.found_at}`}
									{signal.type === 'hotel_rate' && `${signal.city} — from $${signal.price_per_night}/night`}
									{signal.type === 'news' && (
										<a className="text-brand-400 hover:text-brand-300 transition-colors duration-300" href={signal.href} target="_blank" rel="noreferrer">
											Read more →
										</a>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</section>
		</div>
	);
}