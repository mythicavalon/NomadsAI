"use client";

import { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import { Search, MapPin, Calendar, Users, DollarSign, Sparkles, TrendingUp, Globe, Clock, Star, Diamond, Crown, Plane, Zap, Brain, CheckCircle } from "lucide-react";
import { Button, Input, Card, Select, Checkbox } from "../components/ui";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Signal = any;
type AIStatus = {
	status: string;
	ai_providers: any;
	platform: string;
	version: string;
	features: string[];
};

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
	const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
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

	// Fetch AI status
	useEffect(() => {
		const fetchAIStatus = async () => {
			try {
				const response = await fetch(`${API_BASE}/api/ai-status`);
				if (response.ok) {
					const status = await response.json();
					setAiStatus(status);
				}
			} catch (error) {
				console.log("AI status not available");
			}
		};
		fetchAIStatus();
	}, []);

	// Fetch signals
	useEffect(() => {
		const fetchSignals = async () => {
			try {
				const response = await fetch(`${API_BASE}/api/signals`);
				if (response.ok) {
					const data = await response.json();
					setSignals(data.signals || []);
				}
			} catch (error) {
				console.log("No signals available");
			}
		};
		fetchSignals();
	}, []);

	const selectCity = (city: any) => {
		setDestination(city.name);
		setSearchQuery(city.name);
		setShowSuggestions(false);
	};

	const toggleInterest = (interestId: string) => {
		setInterests(prev => 
			prev.includes(interestId) 
				? prev.filter(id => id !== interestId)
				: [...prev, interestId]
		);
	};

	const handleSearch = async () => {
		if (!destination) return;
		setLoading(true);
		
		try {
			const response = await fetch(`${API_BASE}/api/plan`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					destination,
					days,
					budget,
					interests,
					travelers,
					online_mode: onlineMode
				})
			});
			
			if (response.ok) {
				const data = await response.json();
				setItinerary(data.itinerary);
			}
		} catch (error) {
			console.error('Error planning trip:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSurprise = async () => {
		setLoading(true);
		try {
			const response = await fetch(`${API_BASE}/api/surprise`);
			if (response.ok) {
				const data = await response.json();
				setSurprise(data.suggestions || []);
			}
		} catch (error) {
			console.error('Error getting surprise:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-16 animate-fade-in">
			{/* AI Status Banner */}
			{aiStatus && (
				<div className="bg-gradient-to-r from-accent-500/10 to-info-500/10 border border-accent-500/20 rounded-xl p-4">
					<div className="flex items-center justify-center gap-3 text-center">
						<CheckCircle className="w-5 h-5 text-accent-400" />
						<div className="space-y-1">
							<div className="text-sm font-medium text-accent-400">
								Powered by NVIDIA NIM GPT-OSS-120B
							</div>
							<div className="text-xs text-gray-400">
								Advanced AI travel planning with cultural intelligence
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Hero Section */}
			<section className="text-center space-y-8">
				<div className="space-y-6">
					<h1 className="heading-3xl text-gradient">
						Your AI-Powered Travel Companion
					</h1>
					<p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
						Experience intelligent travel planning with NVIDIA's advanced AI that learns your preferences, 
						discovers hidden gems, and creates personalized adventures just for you.
					</p>
				</div>

				{/* Search Interface */}
				<div className="max-w-4xl mx-auto space-y-6">
					<div className="relative" ref={searchRef}>
						<Input
							placeholder="Where would you like to go?"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							leftIcon={<Search className="w-5 h-5" />}
							className="text-lg py-4"
						/>
						
						{/* Search Suggestions */}
						{showSuggestions && filteredCities.length > 0 && (
							<div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl border border-gray-700/50 overflow-hidden z-10 animate-scale-in">
								{filteredCities.map((city, idx) => (
									<button
										key={idx}
										onClick={() => selectCity(city)}
										className="w-full p-4 text-left hover:bg-gray-800/50 transition-colors duration-200 border-b border-gray-700/30 last:border-b-0"
									>
										<div className="flex items-center gap-3">
											<MapPin className="w-5 h-5 text-accent-400 flex-shrink-0" />
											<div className="flex-1">
												<div className="font-semibold text-white">{city.name}</div>
												<div className="text-gray-300 text-sm mt-1">{city.blurb}</div>
											</div>
											{city.trending && (
												<div className="flex items-center gap-2 text-xs bg-accent-500/20 text-accent-400 px-3 py-2 rounded-full">
													<TrendingUp className="w-4 h-4" />
													Trending
												</div>
											)}
										</div>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							size="lg"
							onClick={handleSearch}
							loading={loading}
							leftIcon={<Plane className="w-5 h-5" />}
							disabled={!destination}
						>
							Plan My Trip
						</Button>
						<Button
							variant="secondary"
							size="lg"
							onClick={handleSurprise}
							loading={loading}
							leftIcon={<Sparkles className="w-5 h-5" />}
						>
							Surprise Me
						</Button>
					</div>
				</div>
			</section>

			{/* Featured Destinations */}
			<section className="space-y-8">
				<div className="text-center space-y-4">
					<h2 className="heading-2xl">Trending Destinations</h2>
					<p className="text-gray-300 max-w-2xl mx-auto">
						Discover the most popular destinations our AI has been helping travelers explore
					</p>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
					{featuredDestinations.map((city, idx) => (
						<button
							key={idx}
							onClick={() => selectCity(city)}
							className="group p-6 glass rounded-2xl hover:glass-strong transition-all duration-300 transform hover:-translate-y-2 hover:shadow-glow"
						>
							<div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
								{city.country === "Japan" ? "🗾" : 
								 city.country === "Spain" ? "🇪🇸" : 
								 city.country === "Indonesia" ? "🏝️" : 
								 city.country === "UAE" ? "🏗️" : 
								 city.country === "Portugal" ? "🇵🇹" : 
								 city.country === "Mexico" ? "🇲🇽" : "🌍"}
							</div>
							<div className="text-sm font-semibold text-white group-hover:text-accent-400 transition-colors duration-300">
								{city.name.split(',')[0]}
							</div>
						</button>
					))}
				</div>
			</section>

			{/* Planning Interface */}
			<section className="space-y-8">
				<div className="text-center space-y-4">
					<h2 className="heading-2xl">Customize Your Experience</h2>
					<p className="text-gray-300 max-w-2xl mx-auto">
						Fine-tune your travel preferences to get the most personalized recommendations from our advanced AI
					</p>
				</div>

				<Card className="space-y-8">
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
						{/* Duration */}
						<Select
							label="Duration"
							value={days.toString()}
							onChange={(value) => setDays(parseInt(value))}
							options={[
								{ value: 3, label: "3 days" },
								{ value: 5, label: "5 days" },
								{ value: 7, label: "1 week" },
								{ value: 10, label: "10 days" },
								{ value: 14, label: "2 weeks" },
								{ value: 21, label: "3 weeks" },
								{ value: 30, label: "1 month" }
							]}
							leftIcon={<Calendar className="w-5 h-5" />}
						/>

						{/* Budget */}
						<Select
							label="Experience Level"
							value={budget}
							onChange={setBudget}
							options={[
								{ value: "budget", label: "Essential ($50-100/day)" },
								{ value: "medium", label: "Premium ($150-300/day)" },
								{ value: "luxury", label: "Luxury ($400+/day)" }
							]}
							leftIcon={<Crown className="w-5 h-5" />}
						/>

						{/* Travelers */}
						<Select
							label="Party Size"
							value={travelers.toString()}
							onChange={(value) => setTravelers(parseInt(value))}
							options={[
								{ value: 1, label: "Solo traveler" },
								{ value: 2, label: "Couple" },
								{ value: 3, label: "3 people" },
								{ value: 4, label: "4 people" },
								{ value: 5, label: "5+ people" }
							]}
							leftIcon={<Users className="w-5 h-5" />}
						/>

						{/* Online Mode */}
						<div className="space-y-4">
							<label className="flex items-center gap-3 text-gray-300 font-semibold text-lg">
								<Globe className="w-5 h-5 text-accent-400" />
								Intelligence Mode
							</label>
							<Checkbox
								checked={onlineMode}
								onChange={setOnlineMode}
								label="Real-time intelligence"
							/>
						</div>
					</div>

					{/* Interests */}
					<div className="space-y-6">
						<label className="flex items-center gap-3 text-gray-300 font-semibold text-lg">
							<Diamond className="w-5 h-5 text-accent-400" />
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
											? "bg-accent-500/20 border-accent-400 text-accent-400 shadow-glow"
											: "glass border-gray-700/50 text-gray-300 hover:glass-strong hover:border-accent-400/50"
									)}
								>
									<span className="text-2xl">{option.icon}</span>
									<span className="font-medium">{option.label}</span>
								</button>
							))}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-wrap items-center justify-center gap-6">
						<Button
							size="lg"
							onClick={handleSearch}
							loading={loading}
							leftIcon={<Plane className="w-5 h-5" />}
							disabled={!destination}
						>
							Create My Itinerary
						</Button>
						<Button
							variant="secondary"
							size="lg"
							onClick={handleSurprise}
							loading={loading}
							leftIcon={<Sparkles className="w-5 h-5" />}
						>
							Surprise Me
						</Button>
					</div>
				</Card>
			</section>

			{/* Features Section */}
			<section className="space-y-8">
				<div className="text-center space-y-4">
					<h2 className="heading-2xl">Why Choose NomadAI?</h2>
					<p className="text-gray-300 max-w-2xl mx-auto">
						Experience the future of travel planning with cutting-edge NVIDIA AI technology
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					<Card className="text-center space-y-4">
						<div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto">
							<Brain className="w-8 h-8 text-accent-400" />
						</div>
						<h3 className="heading-md">Advanced AI Learning</h3>
						<p className="text-gray-300">
							Powered by NVIDIA's GPT-OSS-120B model for intelligent, context-aware travel recommendations
						</p>
					</Card>

					<Card className="text-center space-y-4">
						<div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto">
							<Zap className="w-8 h-8 text-accent-400" />
						</div>
						<h3 className="heading-md">Real-time Intelligence</h3>
						<p className="text-gray-300">
							Get live updates on weather, events, and local insights to make informed decisions
						</p>
					</Card>

					<Card className="text-center space-y-4">
						<div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto">
							<Star className="w-8 h-8 text-accent-400" />
						</div>
						<h3 className="heading-md">Personalized Experiences</h3>
						<p className="text-gray-300">
							Every recommendation is tailored to your unique interests, budget, and travel style
						</p>
					</Card>
				</div>
			</section>

			{/* Results Display */}
			{itinerary && (
				<section className="space-y-6 animate-scale-in">
					<h2 className="heading-2xl text-center">Your Personalized Itinerary</h2>
					<Card className="space-y-6">
						<div className="space-y-4">
							<h3 className="heading-lg text-accent-400">{destination}</h3>
							<div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
								<div className="flex items-center gap-2">
									<Calendar className="w-4 h-4" />
									{days} days
								</div>
								<div className="flex items-center gap-2">
									<Users className="w-4 h-4" />
									{travelers} {travelers === 1 ? 'traveler' : 'travelers'}
								</div>
								<div className="flex items-center gap-2">
									<DollarSign className="w-4 h-4" />
									{budget} budget
								</div>
							</div>
						</div>
						<div className="prose prose-invert max-w-none">
							<div dangerouslySetInnerHTML={{ __html: itinerary }} />
						</div>
					</Card>
				</section>
			)}

			{surprise && (
				<section className="space-y-6 animate-scale-in">
					<h2 className="heading-2xl text-center">Surprise Destinations</h2>
					<Card className="space-y-6">
						<div className="grid md:grid-cols-2 gap-6">
							{surprise.map((suggestion: string, idx: number) => (
								<div key={idx} className="p-4 glass rounded-lg border border-gray-700/50">
									<h3 className="font-semibold text-white mb-2">{suggestion}</h3>
									<Button
										variant="secondary"
										size="sm"
										onClick={() => {
											setDestination(suggestion);
											setSearchQuery(suggestion);
										}}
									>
										Plan This Trip
									</Button>
								</div>
							))}
						</div>
					</Card>
				</section>
			)}
		</div>
	);
}