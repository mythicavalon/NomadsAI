"use client";

import { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import { Search, MapPin, Calendar, Users, DollarSign, Sparkles, TrendingUp, Globe, Clock, Star, Diamond, Crown, Plane, Zap, Brain, CheckCircle, ArrowRight, Building2, Compass, Shield, Zap as Lightning, ChevronRight } from "lucide-react";
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

type TravelPlan = {
	from: string;
	to: string;
	departureDate: string;
	returnDate: string;
	travelers: number;
	budget: string;
	interests: string[];
	itinerary?: any;
};

// Professional city database with proper search
const WORLD_CITIES = [
	// Major Business Hubs
	{ name: "New York", country: "United States", code: "NYC", category: "business", blurb: "Global financial center and business capital" },
	{ name: "London", country: "United Kingdom", code: "LON", category: "business", blurb: "European financial hub and cultural center" },
	{ name: "Tokyo", country: "Japan", code: "TYO", category: "business", blurb: "Asian economic powerhouse and tech innovation" },
	{ name: "Singapore", country: "Singapore", code: "SIN", category: "business", blurb: "Southeast Asian business and trade hub" },
	{ name: "Dubai", country: "UAE", code: "DXB", category: "business", blurb: "Middle Eastern business and luxury destination" },
	{ name: "Hong Kong", country: "China", code: "HKG", category: "business", blurb: "Asian financial center and trade gateway" },
	
	// European Destinations
	{ name: "Paris", country: "France", code: "PAR", category: "culture", blurb: "City of lights, art, and sophisticated culture" },
	{ name: "Barcelona", country: "Spain", code: "BCN", category: "culture", blurb: "Mediterranean charm and architectural marvels" },
	{ name: "Rome", country: "Italy", code: "ROM", category: "culture", blurb: "Eternal city with ancient history and culture" },
	{ name: "Amsterdam", country: "Netherlands", code: "AMS", category: "culture", blurb: "Canals, culture, and European sophistication" },
	{ name: "Berlin", country: "Germany", code: "BER", category: "culture", blurb: "Creative hub with rich history and innovation" },
	{ name: "Prague", country: "Czech Republic", code: "PRG", category: "culture", blurb: "Medieval architecture and European heritage" },
	
	// Asian Destinations
	{ name: "Bangkok", country: "Thailand", code: "BKK", category: "culture", blurb: "Thai culture, street food, and golden temples" },
	{ name: "Seoul", country: "South Korea", code: "SEL", category: "tech", blurb: "Korean culture and technological innovation" },
	{ name: "Bali", country: "Indonesia", code: "DPS", category: "leisure", blurb: "Tropical paradise and spiritual retreats" },
	{ name: "Mumbai", country: "India", code: "BOM", category: "business", blurb: "Indian business hub and cultural diversity" },
	
	// Americas
	{ name: "Mexico City", country: "Mexico", code: "MEX", category: "culture", blurb: "Rich Mexican culture and culinary excellence" },
	{ name: "São Paulo", country: "Brazil", code: "SAO", category: "business", blurb: "Brazilian business center and cultural hub" },
	{ name: "Toronto", country: "Canada", code: "YYZ", category: "business", blurb: "Canadian business hub and multicultural city" },
	{ name: "Buenos Aires", country: "Argentina", code: "BUE", category: "culture", blurb: "Argentine culture, tango, and European charm" },
	
	// Emerging Markets
	{ name: "Istanbul", country: "Turkey", code: "IST", category: "culture", blurb: "Where East meets West, rich heritage" },
	{ name: "Cape Town", country: "South Africa", code: "CPT", category: "leisure", blurb: "Stunning landscapes and diverse culture" },
	{ name: "Lagos", country: "Nigeria", code: "LOS", category: "business", blurb: "African megacity and business opportunities" },
	{ name: "Medellín", country: "Colombia", code: "MDE", category: "culture", blurb: "City of eternal spring and innovation" }
];

export default function HomePage() {
	const [travelPlan, setTravelPlan] = useState<TravelPlan>({
		from: "",
		to: "",
		departureDate: "",
		returnDate: "",
		travelers: 1,
		budget: "premium",
		interests: ["business", "culture"]
	});
	
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredCities, setFilteredCities] = useState<typeof WORLD_CITIES>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [activeSearch, setActiveSearch] = useState<"from" | "to" | null>(null);
	const [signals, setSignals] = useState<Signal[]>([]);
	const [loading, setLoading] = useState(false);
	const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
	const [searchRef, useRef] = useState<HTMLDivElement | null>(null);

	const interestOptions = [
		{ id: "business", label: "Business & Corporate", icon: Building2 },
		{ id: "culture", label: "Culture & Heritage", icon: Compass },
		{ id: "leisure", label: "Leisure & Relaxation", icon: Star },
		{ id: "adventure", label: "Adventure & Exploration", icon: Globe },
		{ id: "food", label: "Culinary Excellence", icon: Diamond },
		{ id: "tech", label: "Technology & Innovation", icon: Zap }
	];

	const featuredDestinations = WORLD_CITIES.filter(city => city.category === "business").slice(0, 6);

	// Handle search input and filtering
	useEffect(() => {
		if (searchQuery.length > 0) {
			const filtered = WORLD_CITIES.filter(city =>
				city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				city.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
				city.code.toLowerCase().includes(searchQuery.toLowerCase())
			).slice(0, 8);
			setFilteredCities(filtered);
			setShowSuggestions(true);
		} else {
			setFilteredCities([]);
			setShowSuggestions(false);
		}
	}, [searchQuery]);

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
		if (activeSearch === "from") {
			setTravelPlan(prev => ({ ...prev, from: city.name }));
		} else if (activeSearch === "to") {
			setTravelPlan(prev => ({ ...prev, to: city.name }));
		}
		setSearchQuery("");
		setShowSuggestions(false);
		setActiveSearch(null);
	};

	const toggleInterest = (interestId: string) => {
		setTravelPlan(prev => ({
			...prev,
			interests: prev.interests.includes(interestId) 
				? prev.interests.filter(id => id !== interestId)
				: [...prev.interests, interestId]
		}));
	};

	const handleSearch = async () => {
		if (!travelPlan.from || !travelPlan.to) return;
		setLoading(true);
		
		try {
			const response = await fetch(`${API_BASE}/api/itineraries/plan`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					from_city: travelPlan.from,
					destination: travelPlan.to,
					days: Math.ceil((new Date(travelPlan.returnDate).getTime() - new Date(travelPlan.departureDate).getTime()) / (1000 * 60 * 60 * 24)),
					budget: travelPlan.budget,
					interests: travelPlan.interests,
					travelers: travelPlan.travelers,
					departure_date: travelPlan.departureDate,
					return_date: travelPlan.returnDate
				})
			});
			
			if (response.ok) {
				const data = await response.json();
				setTravelPlan(prev => ({ ...prev, itinerary: data.itinerary }));
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
			const response = await fetch(`${API_BASE}/api/itineraries/surprise`);
			if (response.ok) {
				const data = await response.json();
				// Handle surprise response
			}
		} catch (error) {
			console.error('Error getting surprise:', error);
		} finally {
			setLoading(false);
		}
	};

	const isFormValid = travelPlan.from && travelPlan.to && travelPlan.departureDate && travelPlan.returnDate;

	return (
		<div className="min-h-screen bg-gray-950">
			{/* AI Status Banner */}
			{aiStatus && (
				<div className="bg-gradient-to-r from-accent-500/10 via-accent-600/10 to-accent-700/10 border-b border-accent-500/20">
					<div className="container mx-auto py-4">
						<div className="flex items-center justify-center gap-3 text-center">
							<CheckCircle className="w-5 h-5 text-accent-400" />
							<div className="space-y-1">
								<div className="text-sm font-medium text-accent-400">
									Powered by NVIDIA NIM GPT-OSS-120B
								</div>
								<div className="text-xs text-gray-400">
									Enterprise-grade AI travel planning with cultural intelligence
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Hero Section */}
			<section className="relative py-20 lg:py-32 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"></div>
				<div className="relative container mx-auto text-center">
					<div className="max-w-4xl mx-auto space-y-8">
						<h1 className="heading-4xl text-gradient leading-tight">
							Professional Travel Intelligence Platform
						</h1>
						<p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
							Enterprise-grade travel planning powered by NVIDIA's advanced AI. 
							From business trips to cultural expeditions, get intelligent recommendations 
							that understand your professional and personal travel needs.
						</p>
						
						{/* CTA Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<Button
								size="lg"
								onClick={() => document.getElementById('planning-section')?.scrollIntoView({ behavior: 'smooth' })}
								leftIcon={<Plane className="w-5 h-5" />}
								className="min-w-[200px]"
							>
								Start Planning
							</Button>
							<Button
								variant="outline"
								size="lg"
								onClick={() => document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' })}
								leftIcon={<Brain className="w-5 h-5" />}
								className="min-w-[200px]"
							>
								AI Assistant
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Travel Planning Interface */}
			<section id="planning-section" className="py-20 bg-gray-900/50">
				<div className="container mx-auto">
					<div className="max-w-6xl mx-auto">
						<div className="text-center mb-16">
							<h2 className="heading-2xl mb-6">Plan Your Journey</h2>
							<p className="text-xl text-gray-300 max-w-3xl mx-auto">
								Complete travel planning with AI-powered intelligence and professional expertise
							</p>
						</div>

						<Card className="p-8 lg:p-12">
							{/* From/To Fields */}
							<div className="grid lg:grid-cols-2 gap-8 mb-8">
								{/* From Field */}
								<div className="space-y-4">
									<label className="block text-sm font-semibold text-gray-200 uppercase tracking-wide">
										Departure City
									</label>
									<div className="relative">
										<Input
											placeholder="Where are you leaving from?"
											value={travelPlan.from}
											onChange={(e) => {
												setTravelPlan(prev => ({ ...prev, from: e.target.value }));
												setSearchQuery(e.target.value);
												setActiveSearch("from");
											}}
											onFocus={() => setActiveSearch("from")}
											leftIcon={<MapPin className="w-5 h-5" />}
											className="text-lg py-4"
										/>
										
										{/* Search Suggestions for From */}
										{activeSearch === "from" && showSuggestions && filteredCities.length > 0 && (
											<div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden z-10 animate-scale-in shadow-xl">
												{filteredCities.map((city, idx) => (
													<button
														key={idx}
														onClick={() => selectCity(city)}
														className="w-full p-4 text-left hover:bg-gray-700/50 transition-colors duration-200 border-b border-gray-700/30 last:border-b-0"
													>
														<div className="flex items-center gap-3">
															<MapPin className="w-5 h-5 text-accent-400 flex-shrink-0" />
															<div className="flex-1">
																<div className="font-semibold text-white">{city.name}</div>
																<div className="text-gray-300 text-sm mt-1">{city.blurb}</div>
															</div>
															<div className="text-xs bg-accent-500/20 text-accent-400 px-3 py-2 rounded-full">
																{city.code}
															</div>
														</div>
													</button>
												))}
											</div>
										)}
									</div>
								</div>

								{/* To Field */}
								<div className="space-y-4">
									<label className="block text-sm font-semibold text-gray-200 uppercase tracking-wide">
										Destination City
									</label>
									<div className="relative">
										<Input
											placeholder="Where are you going?"
											value={travelPlan.to}
											onChange={(e) => {
												setTravelPlan(prev => ({ ...prev, to: e.target.value }));
												setSearchQuery(e.target.value);
												setActiveSearch("to");
											}}
											onFocus={() => setActiveSearch("to")}
											leftIcon={<MapPin className="w-5 h-5" />}
											className="text-lg py-4"
										/>
										
										{/* Search Suggestions for To */}
										{activeSearch === "to" && showSuggestions && filteredCities.length > 0 && (
											<div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden z-10 animate-scale-in shadow-xl">
												{filteredCities.map((city, idx) => (
													<button
														key={idx}
														onClick={() => selectCity(city)}
														className="w-full p-4 text-left hover:bg-gray-700/50 transition-colors duration-200 border-b border-gray-700/30 last:border-b-0"
													>
														<div className="flex items-center gap-3">
															<MapPin className="w-5 h-5 text-accent-400 flex-shrink-0" />
															<div className="flex-1">
																<div className="font-semibold text-white">{city.name}</div>
																<div className="text-gray-300 text-sm mt-1">{city.blurb}</div>
															</div>
															<div className="text-xs bg-accent-500/20 text-accent-400 px-3 py-2 rounded-full">
																{city.code}
															</div>
														</div>
													</button>
												))}
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Dates and Travelers */}
							<div className="grid lg:grid-cols-3 gap-8 mb-8">
								<div className="space-y-4">
									<label className="block text-sm font-semibold text-gray-200 uppercase tracking-wide">
										Departure Date
									</label>
									<Input
										type="date"
										value={travelPlan.departureDate}
										onChange={(e) => setTravelPlan(prev => ({ ...prev, departureDate: e.target.value }))}
										leftIcon={<Calendar className="w-5 h-5" />}
									/>
								</div>

								<div className="space-y-4">
									<label className="block text-sm font-semibold text-gray-200 uppercase tracking-wide">
										Return Date
									</label>
									<Input
										type="date"
										value={travelPlan.returnDate}
										onChange={(e) => setTravelPlan(prev => ({ ...prev, returnDate: e.target.value }))}
										leftIcon={<Calendar className="w-5 h-5" />}
									/>
								</div>

								<div className="space-y-4">
									<label className="block text-sm font-semibold text-gray-200 uppercase tracking-wide">
										Travelers
									</label>
									<Select
										value={travelPlan.travelers.toString()}
										onChange={(value) => setTravelPlan(prev => ({ ...prev, travelers: parseInt(value) }))}
										options={[
											{ value: 1, label: "1 person" },
											{ value: 2, label: "2 people" },
											{ value: 3, label: "3 people" },
											{ value: 4, label: "4 people" },
											{ value: 5, label: "5+ people" }
										]}
										leftIcon={<Users className="w-5 h-5" />}
									/>
								</div>
							</div>

							{/* Budget and Interests */}
							<div className="grid lg:grid-cols-2 gap-12 mb-12">
								<div className="space-y-6">
									<label className="block text-sm font-semibold text-gray-200 uppercase tracking-wide">
										Experience Level
									</label>
									<Select
										value={travelPlan.budget}
										onChange={(value) => setTravelPlan(prev => ({ ...prev, budget: value }))}
										options={[
											{ value: "essential", label: "Essential ($50-100/day)" },
											{ value: "premium", label: "Premium ($150-300/day)" },
											{ value: "luxury", label: "Luxury ($400+/day)" }
										]}
										leftIcon={<Crown className="w-5 h-5" />}
									/>
								</div>

								<div className="space-y-6">
									<label className="block text-sm font-semibold text-gray-200 uppercase tracking-wide">
										Travel Interests
									</label>
									<div className="grid grid-cols-2 gap-3">
										{interestOptions.map(option => {
											const IconComponent = option.icon;
											return (
												<button
													key={option.id}
													onClick={() => toggleInterest(option.id)}
													className={clsx(
														"flex items-center gap-3 p-4 rounded-lg border transition-all duration-200",
														travelPlan.interests.includes(option.id)
															? "bg-accent-500/20 border-accent-400 text-accent-400 shadow-lg"
															: "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800"
													)}
												>
													<IconComponent className="w-4 h-4" />
													<span className="text-sm font-medium">{option.label}</span>
												</button>
											);
										})}
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex flex-wrap items-center justify-center gap-6">
								<Button
									size="lg"
									onClick={handleSearch}
									loading={loading}
									leftIcon={<Plane className="w-5 h-5" />}
									disabled={!isFormValid}
									className="min-w-[200px]"
								>
									Plan My Journey
								</Button>
								<Button
									variant="secondary"
									size="lg"
									onClick={handleSurprise}
									loading={loading}
									leftIcon={<Sparkles className="w-5 h-5" />}
									className="min-w-[200px]"
								>
									AI Recommendations
								</Button>
							</div>
						</Card>
					</div>
				</div>
			</section>

			{/* Featured Destinations */}
			<section className="py-20">
				<div className="container mx-auto">
					<div className="text-center mb-16">
						<h2 className="heading-2xl mb-6">Global Business Hubs</h2>
						<p className="text-xl text-gray-300 max-w-3xl mx-auto">
							Top destinations for corporate travel and business expansion
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
						{featuredDestinations.map((city, idx) => (
							<button
								key={idx}
								onClick={() => setTravelPlan(prev => ({ ...prev, to: city.name }))}
								className="group p-6 bg-gray-800 rounded-2xl hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-gray-700 hover:border-gray-600"
							>
								<div className="text-center space-y-4">
									<div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-accent-500/30 transition-colors duration-300">
										<Building2 className="w-8 h-8 text-accent-400" />
									</div>
									<div className="space-y-2">
										<div className="font-semibold text-white group-hover:text-accent-400 transition-colors duration-300">
											{city.name}
										</div>
										<div className="text-xs text-gray-400">{city.country}</div>
										<div className="text-xs bg-accent-500/20 text-accent-400 px-2 py-1 rounded-full">
											{city.code}
										</div>
									</div>
								</div>
							</button>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 bg-gray-900/50">
				<div className="container mx-auto">
					<div className="text-center mb-16">
						<h2 className="heading-2xl mb-6">Enterprise Travel Intelligence</h2>
						<p className="text-xl text-gray-300 max-w-3xl mx-auto">
							Professional-grade travel planning with cutting-edge NVIDIA AI technology
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						<Card className="text-center space-y-6 p-8">
							<div className="w-20 h-20 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto">
								<Brain className="w-10 h-10 text-accent-400" />
							</div>
							<h3 className="heading-lg">AI-Powered Planning</h3>
							<p className="text-gray-300 leading-relaxed">
								NVIDIA GPT-OSS-120B model provides intelligent, context-aware travel recommendations
							</p>
						</Card>

						<Card className="text-center space-y-6 p-8">
							<div className="w-20 h-20 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto">
								<Shield className="w-10 h-10 text-accent-400" />
							</div>
							<h3 className="heading-lg">Corporate Security</h3>
							<p className="text-gray-300 leading-relaxed">
								Enterprise-grade security and compliance for business travel planning
							</p>
						</Card>

						<Card className="text-center space-y-6 p-8">
							<div className="w-20 h-20 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto">
								<Lightning className="w-10 h-10 text-accent-400" />
							</div>
							<h3 className="heading-lg">Real-time Intelligence</h3>
							<p className="text-gray-300 leading-relaxed">
								Live updates on weather, events, and local insights for informed decisions
							</p>
						</Card>
					</div>
				</div>
			</section>

			{/* Results Display */}
			{travelPlan.itinerary && (
				<section className="py-20 animate-scale-in">
					<div className="container mx-auto">
						<div className="max-w-4xl mx-auto">
							<h2 className="heading-2xl text-center mb-12">Your AI-Generated Itinerary</h2>
							<Card className="space-y-8 p-8">
								<div className="space-y-6">
									<div className="flex items-center justify-center gap-6 text-xl">
										<span className="text-gray-300">{travelPlan.from}</span>
										<ArrowRight className="w-6 h-6 text-accent-400" />
										<span className="text-accent-400 font-semibold">{travelPlan.to}</span>
									</div>
									<div className="grid md:grid-cols-3 gap-6 text-center">
										<div className="flex items-center justify-center gap-3">
											<Calendar className="w-5 h-5 text-accent-400" />
											<span className="text-gray-300">
												{travelPlan.departureDate} - {travelPlan.returnDate}
											</span>
										</div>
										<div className="flex items-center justify-center gap-3">
											<Users className="w-5 h-5 text-accent-400" />
											<span className="text-gray-300">
												{travelPlan.travelers} {travelPlan.travelers === 1 ? 'traveler' : 'travelers'}
											</span>
										</div>
										<div className="flex items-center justify-center gap-3">
											<DollarSign className="w-5 h-5 text-accent-400" />
											<span className="text-gray-300">{travelPlan.budget} budget</span>
										</div>
									</div>
								</div>
								<div className="prose prose-invert max-w-none">
									<div dangerouslySetInnerHTML={{ __html: travelPlan.itinerary }} />
								</div>
							</Card>
						</div>
					</div>
				</section>
			)}
		</div>
	);
}