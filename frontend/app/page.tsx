"use client";

import { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import { Search, MapPin, Calendar, Users, DollarSign, Sparkles, TrendingUp, Globe, Clock, Star, Diamond, Crown } from "lucide-react";
import CityCard from "../components/CityCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Signal = any;

// Comprehensive city database for autocomplete
const WORLD_CITIES = [
	// Elite destinations
	{ name: "Barcelona, Spain", country: "Spain", blurb: "Gaudí architecture, Mediterranean elegance, sophisticated culture", trending: true },
	{ name: "Tokyo, Japan", country: "Japan", blurb: "Modern metropolis, ancient traditions, culinary excellence", trending: true },
	{ name: "New York, USA", country: "United States", blurb: "The city that never sleeps, iconic sophistication", trending: false },
	{ name: "Paris, France", country: "France", blurb: "City of lights, art, romance, and refined cuisine", trending: false },
	{ name: "London, England", country: "United Kingdom", blurb: "Royal heritage, modern culture, distinguished neighborhoods", trending: false },
	{ name: "Rome, Italy", country: "Italy", blurb: "Eternal city, ancient grandeur, exceptional gastronomy", trending: false },
	{ name: "Dubai, UAE", country: "United Arab Emirates", blurb: "Futuristic luxury, opulent shopping, desert adventures", trending: true },
	{ name: "Bali, Indonesia", country: "Indonesia", blurb: "Tropical paradise, spiritual temples, luxury retreats", trending: true },
	{ name: "Istanbul, Turkey", country: "Turkey", blurb: "Where East meets West, rich heritage, exquisite cuisine", trending: false },
	{ name: "Bangkok, Thailand", country: "Thailand", blurb: "Street food excellence, golden temples, vibrant markets", trending: true },
	
	// Sophisticated nomad destinations
	{ name: "Lisbon, Portugal", country: "Portugal", blurb: "Refined charm, perfect weather, nomad-friendly elegance", trending: true },
	{ name: "Mexico City, Mexico", country: "Mexico", blurb: "Rich culture, exceptional cuisine, sophisticated living", trending: true },
	{ name: "Berlin, Germany", country: "Germany", blurb: "Creative hub, historical depth, excellent nightlife", trending: false },
	{ name: "Amsterdam, Netherlands", country: "Netherlands", blurb: "Canals, sophisticated culture, premium coffee", trending: false },
	{ name: "Singapore", country: "Singapore", blurb: "Garden city, culinary paradise, business excellence", trending: false },
	{ name: "Prague, Czech Republic", country: "Czech Republic", blurb: "Fairy-tale architecture, premium beer, rich history", trending: false },
	{ name: "Buenos Aires, Argentina", country: "Argentina", blurb: "Tango, premium steak, European sophistication", trending: false },
	{ name: "Cape Town, South Africa", country: "South Africa", blurb: "Stunning landscapes, wine excellence, diverse culture", trending: false },
	
	// Emerging luxury destinations
	{ name: "Medellín, Colombia", country: "Colombia", blurb: "City of eternal spring, innovation, transformation", trending: true },
	{ name: "Tbilisi, Georgia", country: "Georgia", blurb: "Sophisticated living, wine culture, stunning mountains", trending: true },
	{ name: "Ho Chi Minh City, Vietnam", country: "Vietnam", blurb: "Motorbike culture, exceptional pho, French colonial charm", trending: true },
	{ name: "Kuala Lumpur, Malaysia", country: "Malaysia", blurb: "Modern skyline, diverse cuisine, luxury affordability", trending: false },
	{ name: "Warsaw, Poland", country: "Poland", blurb: "Rising tech hub, rich history, European sophistication", trending: false },
	{ name: "Lagos, Nigeria", country: "Nigeria", blurb: "African megacity, Afrobeats culture, business opportunities", trending: true },
];

export default function HomePage() {
	const [destination, setDestination] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredCities, setFilteredCities] = useState<typeof WORLD_CITIES>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [days, setDays] = useState(7);
	const [budget, setBudget] = useState("luxury");
	const [interests, setInterests] = useState<string[]>(["culture", "food"]);
	const [travelers, setTravelers] = useState(1);
	const [signals, setSignals] = useState<Signal[]>([]);
	const [itinerary, setItinerary] = useState<any>(null);
	const [surprise, setSurprise] = useState<string[] | null>(null);
	const [loading, setLoading] = useState(false);
	const [onlineMode, setOnlineMode] = useState(true);
	const searchRef = useRef<HTMLDivElement>(null);

	const interestOptions = [
		{ id: "culture", label: "Culture & Heritage", icon: "🏛️" },
		{ id: "food", label: "Culinary Excellence", icon: "🍽️" },
		{ id: "adventure", label: "Adventure", icon: "🏔️" },
		{ id: "relax", label: "Luxury Relaxation", icon: "🏖️" },
		{ id: "nightlife", label: "Sophisticated Nightlife", icon: "🌃" },
		{ id: "nature", label: "Natural Beauty", icon: "🌿" },
		{ id: "art", label: "Art & Museums", icon: "🎨" },
		{ id: "shopping", label: "Premium Shopping", icon: "🛍️" }
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
		<div className="space-y-16">
			{/* Sophisticated Hero Section */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-magenta-500/5 rounded-3xl"></div>
				<div className="relative glass-luxury rounded-3xl p-16 text-center">
					<div className="max-w-5xl mx-auto">
						<h1 className="heading-xl mb-8 animate-luxury-float">
							Your Sophisticated Travel Intelligence
						</h1>
						<p className="text-premium mb-12 max-w-3xl mx-auto text-xl">
							Discover extraordinary destinations with personalized itineraries crafted by AI that understands 
							sophistication, elegance, and exceptional taste. From hidden gems to world-renowned luxury, 
							we curate the perfect journey for discerning travelers.
						</p>
						
						{/* Luxury Search Bar */}
						<div ref={searchRef} className="relative max-w-3xl mx-auto mb-12">
							<div className="relative">
								<Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-gold-400 w-7 h-7" />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onFocus={() => searchQuery && setShowSuggestions(true)}
									placeholder="Where shall we craft your next extraordinary journey? (e.g., Tokyo, Barcelona, Bali...)"
									className="w-full pl-20 pr-8 py-8 text-xl bg-black/60 border border-gold-500/30 rounded-2xl backdrop-blur-lg focus:outline-none focus:border-gold-500 focus:bg-black/80 transition-all duration-300 placeholder-silver-500 text-white font-medium"
								/>
							</div>
							
							{/* Sophisticated Search Suggestions */}
							{showSuggestions && filteredCities.length > 0 && (
								<div className="absolute top-full left-0 right-0 mt-3 glass-luxury rounded-2xl border border-gold-500/20 max-h-96 overflow-y-auto z-50">
									{filteredCities.map((city, idx) => (
										<button
											key={idx}
											onClick={() => selectCity(city)}
											className="w-full px-8 py-6 text-left hover:bg-gold-500/10 transition-colors duration-200 flex items-center gap-6 first:rounded-t-2xl last:rounded-b-2xl"
										>
											<MapPin className="w-6 h-6 text-gold-400 flex-shrink-0" />
											<div className="flex-1">
												<div className="font-semibold text-white text-lg">{city.name}</div>
												<div className="text-silver-300 text-sm mt-1">{city.blurb}</div>
											</div>
											{city.trending && (
												<div className="flex items-center gap-2 text-xs bg-magenta-500/20 text-magenta-400 px-3 py-2 rounded-full">
													<TrendingUp className="w-4 h-4" />
													Elite Choice
												</div>
											)}
										</button>
									))}
								</div>
							)}
						</div>

						{/* Elite Destinations */}
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
							{featuredDestinations.map((city, idx) => (
								<button
									key={idx}
									onClick={() => selectCity(city)}
									className="group p-6 glass-dark rounded-2xl hover:glass-strong transition-all duration-300 transform hover:-translate-y-2 hover:shadow-gold"
								>
									<div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
										{city.country === "Japan" ? "🗾" : 
										 city.country === "Spain" ? "🇪🇸" : 
										 city.country === "Indonesia" ? "🏝️" : 
										 city.country === "UAE" ? "🏗️" : 
										 city.country === "Portugal" ? "🇵🇹" : 
										 city.country === "Mexico" ? "🇲🇽" : "🌍"}
									</div>
									<div className="text-sm font-semibold text-white group-hover:text-gold-400 transition-colors duration-300">
										{city.name.split(',')[0]}
									</div>
								</button>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Sophisticated Planning Interface */}
			<section className="card">
				<h2 className="heading-md mb-10 text-center">Customize Your Elite Experience</h2>
				
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
					{/* Duration */}
					<div className="space-y-4">
						<label className="flex items-center gap-3 text-silver-300 font-semibold text-lg">
							<Calendar className="w-6 h-6 text-gold-400" />
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
					<div className="space-y-4">
						<label className="flex items-center gap-3 text-silver-300 font-semibold text-lg">
							<Crown className="w-6 h-6 text-gold-400" />
							Experience Level
						</label>
						<select 
							value={budget} 
							onChange={e => setBudget(e.target.value)} 
							className="input-premium w-full"
						>
							<option value="budget">Essential ($50-100/day)</option>
							<option value="medium">Premium ($150-300/day)</option>
							<option value="luxury">Luxury ($400+/day)</option>
						</select>
					</div>

					{/* Travelers */}
					<div className="space-y-4">
						<label className="flex items-center gap-3 text-silver-300 font-semibold text-lg">
							<Users className="w-6 h-6 text-gold-400" />
							Party Size
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
					<div className="space-y-4">
						<label className="flex items-center gap-3 text-silver-300 font-semibold text-lg">
							<Globe className="w-6 h-6 text-gold-400" />
							Intelligence Mode
						</label>
						<label className="flex items-center gap-4 p-5 glass-dark rounded-xl cursor-pointer hover:glass-strong transition-all duration-300">
							<input 
								type="checkbox" 
								checked={onlineMode} 
								onChange={e => setOnlineMode(e.target.checked)}
								className="w-6 h-6 text-gold-500 rounded focus:ring-gold-400"
							/>
							<span className="text-silver-300 font-medium">Real-time intelligence</span>
						</label>
					</div>
				</div>

				{/* Sophisticated Interests */}
				<div className="space-y-6 mb-12">
					<label className="flex items-center gap-3 text-silver-300 font-semibold text-lg">
						<Diamond className="w-6 h-6 text-gold-400" />
						What captures your interest?
					</label>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{interestOptions.map(option => (
							<button
								key={option.id}
								onClick={() => toggleInterest(option.id)}
								className={clsx(
									"flex items-center gap-4 p-5 rounded-xl border transition-all duration-300 transform hover:scale-105",
									interests.includes(option.id)
										? "bg-gold-500/20 border-gold-400 text-gold-400 shadow-gold"
										: "glass-dark border-silver-500/20 text-silver-300 hover:glass-strong hover:border-gold-400/50"
								)}
							>
								<span className="text-2xl">{option.icon}</span>
								<span className="font-medium">{option.label}</span>
							</button>
						))}
					</div>
				</div>

				{/* Sophisticated Action Buttons */}
				<div className="flex flex-wrap items-center justify-center gap-6">
					<button 
						onClick={buildItinerary} 
						disabled={loading}
						className="btn-primary flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
					>
						<Sparkles className="w-6 h-6" />
						{loading ? "Crafting Excellence..." : "Create My Elite Itinerary"}
					</button>
					<button 
						onClick={getSurprise} 
						disabled={loading}
						className="btn-magenta flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
					>
						<Star className="w-6 h-6" />
						Surprise Me
					</button>
					{loading && (
						<div className="flex items-center gap-3 text-gold-400">
							<Clock className="w-6 h-6 animate-spin" />
							<span className="font-medium">Crafting your perfect journey...</span>
						</div>
					)}
				</div>
			</section>

			{/* Sophisticated Itinerary Results */}
			{itinerary && (
				<section className="card">
					<div className="flex items-center gap-4 mb-8">
						<MapPin className="w-8 h-8 text-gold-400" />
						<h2 className="heading-md">Your {itinerary.destination} Elite Experience ({itinerary.days} days)</h2>
					</div>
					<p className="text-premium mb-8 text-xl">Estimated investment: {itinerary.estimated_budget}</p>
					
					<div className="grid lg:grid-cols-3 gap-12">
						<div className="lg:col-span-2 space-y-8">
							{itinerary.day_plans?.map((day: any) => (
								<div key={day.day} className="glass-dark rounded-2xl p-8">
									<div className="flex items-center gap-4 mb-6">
										<div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center text-black font-bold text-lg shadow-gold">
											{day.day}
										</div>
										<h3 className="text-2xl font-semibold text-white">{day.summary}</h3>
									</div>
									<div className="space-y-4">
										{day.activities.map((activity: any, idx: number) => (
											<div key={idx} className="flex gap-6 p-4 glass-dark rounded-xl">
												<div className="text-gold-400 font-semibold min-w-[80px] text-lg">{activity.time}</div>
												<div className="flex-1">
													<div className="font-semibold text-white mb-2 text-lg">{activity.title}</div>
													<div className="text-silver-300">{activity.description}</div>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
						
						<div className="space-y-8">
							<div className="glass-dark rounded-2xl p-8">
								<h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
									<Diamond className="w-6 h-6 text-magenta-400" />
									Hidden Gems
								</h3>
								<ul className="space-y-4">
									{(surprise ?? itinerary.surprise_picks)?.map((pick: string, i: number) => (
										<li key={i} className="flex items-start gap-4 text-silver-300">
											<div className="w-3 h-3 rounded-full bg-gold-400 mt-2 flex-shrink-0"></div>
											<span className="text-lg">{pick}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</section>
			)}

			{/* Sophisticated Travel Intelligence */}
			<section className="card">
				<h2 className="heading-md mb-8 flex items-center gap-4">
					<TrendingUp className="w-8 h-8 text-gold-400" />
					Live Travel Intelligence
				</h2>
				{signals.length === 0 ? (
					<div className="text-center py-16 text-silver-400">
						<Globe className="w-16 h-16 mx-auto mb-6 text-silver-500" />
						<p className="text-xl">No live intelligence available. Select a destination to see real-time travel insights.</p>
					</div>
				) : (
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{signals.map((signal: any, idx: number) => (
							<div key={idx} className="glass-dark rounded-xl p-8 hover:glass-strong transition-all duration-300 transform hover:-translate-y-1">
								<div className="flex items-center gap-3 mb-4">
									<div className={clsx(
										"w-4 h-4 rounded-full",
										signal.type === 'flight_deal' ? "bg-blue-400" :
										signal.type === 'hotel_rate' ? "bg-green-400" :
										signal.type === 'event' ? "bg-magenta-400" : "bg-gold-400"
									)}></div>
									<span className="text-sm uppercase tracking-wider text-silver-400 font-semibold">
										{signal.type.replace('_', ' ')}
									</span>
								</div>
								<div className="font-semibold text-white mb-3 text-lg">
									{signal.type === 'event' && signal.name}
									{signal.type === 'flight_deal' && `${signal.from} → ${signal.to}`}
									{signal.type === 'hotel_rate' && signal.name}
									{signal.type === 'news' && signal.title}
								</div>
								<div className="text-silver-300">
									{signal.type === 'event' && `${signal.location} — ${signal.start_date}`}
									{signal.type === 'flight_deal' && `$${signal.price} — found ${signal.found_at}`}
									{signal.type === 'hotel_rate' && `${signal.city} — from $${signal.price_per_night}/night`}
									{signal.type === 'news' && (
										<a className="text-gold-400 hover:text-gold-300 transition-colors duration-300 font-medium" href={signal.href} target="_blank" rel="noreferrer">
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