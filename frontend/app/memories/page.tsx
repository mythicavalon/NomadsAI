"use client";

import { useEffect, useState } from "react";
import { Camera, MapPin, Calendar, Heart, Plus, Trash2, Download, Share, Star } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Memory = { 
	id: number; 
	title: string; 
	content: string; 
	destination: string; 
	created_at: string;
	image_url?: string;
	mood?: string;
	weather?: string;
	companions?: string[];
};

const TRAVEL_MOODS = [
	{ id: "adventure", label: "Adventure", emoji: "🏔️", color: "from-orange-400 to-red-500" },
	{ id: "relaxed", label: "Relaxed", emoji: "🏖️", color: "from-blue-400 to-cyan-500" },
	{ id: "cultural", label: "Cultural", emoji: "🏛️", color: "from-purple-400 to-pink-500" },
	{ id: "romantic", label: "Romantic", emoji: "💕", color: "from-pink-400 to-rose-500" },
	{ id: "foodie", label: "Foodie", emoji: "🍽️", color: "from-yellow-400 to-orange-500" },
	{ id: "party", label: "Party", emoji: "🎉", color: "from-green-400 to-blue-500" },
	{ id: "nature", label: "Nature", emoji: "🌿", color: "from-green-400 to-emerald-500" },
	{ id: "urban", label: "Urban", emoji: "🏙️", color: "from-gray-400 to-slate-500" }
];

const WEATHER_OPTIONS = [
	{ id: "sunny", emoji: "☀️", label: "Sunny" },
	{ id: "cloudy", emoji: "☁️", label: "Cloudy" },
	{ id: "rainy", emoji: "🌧️", label: "Rainy" },
	{ id: "snowy", emoji: "❄️", label: "Snowy" },
	{ id: "stormy", emoji: "⛈️", label: "Stormy" }
];

// Sample travel images for demonstration
const SAMPLE_IMAGES = [
	"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
	"https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop",
	"https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&h=400&fit=crop",
	"https://images.unsplash.com/photo-1513326738677-b964603b136d?w=400&h=400&fit=crop",
	"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=400&fit=crop",
	"https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop"
];

export default function MemoriesPage() {
	const [memories, setMemories] = useState<Memory[]>([]);
	const [showAddForm, setShowAddForm] = useState(false);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [destination, setDestination] = useState("");
	const [selectedMood, setSelectedMood] = useState("");
	const [selectedWeather, setSelectedWeather] = useState("");
	const [companions, setCompanions] = useState("");
	const [selectedImage, setSelectedImage] = useState("");
	const [loading, setLoading] = useState(false);

	async function refreshMemories() {
		try {
			const response = await fetch(`${API_BASE}/api/memory/`);
			const data = await response.json();
			setMemories(data);
		} catch (error) {
			console.error("Failed to fetch memories:", error);
		}
	}

	useEffect(() => { 
		refreshMemories(); 
	}, []);

	async function addMemory() {
		if (!title.trim() || !destination.trim()) {
			alert("Please fill in at least the title and destination!");
			return;
		}

		setLoading(true);
		try {
			await fetch(`${API_BASE}/api/memory/`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					title, 
					content, 
					destination,
					image_url: selectedImage,
					mood: selectedMood,
					weather: selectedWeather,
					companions: companions.split(',').map(c => c.trim()).filter(Boolean)
				})
			});
			
			// Reset form
			setTitle("");
			setContent("");
			setDestination("");
			setSelectedMood("");
			setSelectedWeather("");
			setCompanions("");
			setSelectedImage("");
			setShowAddForm(false);
			
			refreshMemories();
		} catch (error) {
			console.error("Failed to add memory:", error);
		} finally {
			setLoading(false);
		}
	}

	async function deleteMemory(id: number) {
		if (!confirm("Are you sure you want to delete this memory?")) return;
		
		try {
			await fetch(`${API_BASE}/api/memory/${id}`, { method: 'DELETE' });
			refreshMemories();
		} catch (error) {
			console.error("Failed to delete memory:", error);
		}
	}

	function getRandomImage() {
		return SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getMoodGradient(mood: string) {
		const moodData = TRAVEL_MOODS.find(m => m.id === mood);
		return moodData?.color || "from-gray-400 to-gray-600";
	}

	return (
		<div className="space-y-8">
			{/* Premium Header */}
			<div className="text-center space-y-4">
				<h1 className="heading-lg flex items-center justify-center gap-3">
					<Camera className="w-8 h-8 text-brand-400" />
					Travel Memories
				</h1>
				<p className="text-premium max-w-2xl mx-auto">
					Capture and cherish your travel moments. Create beautiful polaroid-style memories 
					with photos, locations, and stories from your adventures around the world.
				</p>
			</div>

			{/* Add Memory Button */}
			<div className="flex justify-center">
				<button
					onClick={() => setShowAddForm(!showAddForm)}
					className="btn-primary flex items-center gap-2 transform hover:scale-105 transition-all duration-300"
				>
					<Plus className="w-5 h-5" />
					Create New Memory
				</button>
			</div>

			{/* Add Memory Form */}
			{showAddForm && (
				<div className="card max-w-4xl mx-auto">
					<h2 className="heading-md mb-6 flex items-center gap-3">
						<Plus className="w-6 h-6 text-brand-400" />
						Create Your Travel Memory
					</h2>
					
					<div className="grid md:grid-cols-2 gap-8">
						{/* Form Fields */}
						<div className="space-y-6">
							<div>
								<label className="block text-white/80 font-medium mb-2">Memory Title</label>
								<input
									value={title}
									onChange={e => setTitle(e.target.value)}
									placeholder="e.g., Sunset at Santorini"
									className="input-premium w-full"
								/>
							</div>

							<div>
								<label className="block text-white/80 font-medium mb-2">Destination</label>
								<input
									value={destination}
									onChange={e => setDestination(e.target.value)}
									placeholder="e.g., Santorini, Greece"
									className="input-premium w-full"
								/>
							</div>

							<div>
								<label className="block text-white/80 font-medium mb-2">Your Story</label>
								<textarea
									value={content}
									onChange={e => setContent(e.target.value)}
									placeholder="Tell us about this amazing moment..."
									rows={4}
									className="input-premium w-full resize-none"
								/>
							</div>

							<div>
								<label className="block text-white/80 font-medium mb-2">Travel Companions</label>
								<input
									value={companions}
									onChange={e => setCompanions(e.target.value)}
									placeholder="e.g., Sarah, Mike, Lisa (comma separated)"
									className="input-premium w-full"
								/>
							</div>
						</div>

						{/* Visual Options */}
						<div className="space-y-6">
							{/* Sample Images */}
							<div>
								<label className="block text-white/80 font-medium mb-3">Choose a Photo</label>
								<div className="grid grid-cols-3 gap-3">
									{SAMPLE_IMAGES.map((img, idx) => (
										<button
											key={idx}
											onClick={() => setSelectedImage(img)}
											className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
												selectedImage === img 
													? "border-brand-400 ring-2 ring-brand-400/30" 
													: "border-white/20 hover:border-brand-400/50"
											}`}
										>
											<img src={img} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
										</button>
									))}
								</div>
							</div>

							{/* Mood Selection */}
							<div>
								<label className="block text-white/80 font-medium mb-3">Travel Mood</label>
								<div className="grid grid-cols-2 gap-2">
									{TRAVEL_MOODS.map(mood => (
										<button
											key={mood.id}
											onClick={() => setSelectedMood(mood.id)}
											className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
												selectedMood === mood.id
													? "border-brand-400 bg-brand-500/20"
													: "border-white/20 glass hover:glass-strong"
											}`}
										>
											<span className="text-lg">{mood.emoji}</span>
											<span className="text-sm font-medium">{mood.label}</span>
										</button>
									))}
								</div>
							</div>

							{/* Weather */}
							<div>
								<label className="block text-white/80 font-medium mb-3">Weather</label>
								<div className="flex flex-wrap gap-2">
									{WEATHER_OPTIONS.map(weather => (
										<button
											key={weather.id}
											onClick={() => setSelectedWeather(weather.id)}
											className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
												selectedWeather === weather.id
													? "border-brand-400 bg-brand-500/20"
													: "border-white/20 glass hover:glass-strong"
											}`}
										>
											<span>{weather.emoji}</span>
											<span className="text-sm">{weather.label}</span>
										</button>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Form Actions */}
					<div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/10">
						<button
							onClick={() => setShowAddForm(false)}
							className="btn-secondary"
						>
							Cancel
						</button>
						<button
							onClick={addMemory}
							disabled={loading}
							className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Creating..." : "Save Memory"}
						</button>
					</div>
				</div>
			)}

			{/* Memories Grid */}
			{memories.length === 0 ? (
				<div className="text-center py-20">
					<Camera className="w-16 h-16 text-white/30 mx-auto mb-4" />
					<h3 className="text-xl font-semibold text-white/60 mb-2">No memories yet</h3>
					<p className="text-white/40">Start capturing your travel adventures!</p>
				</div>
			) : (
				<div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
					{memories.map(memory => (
						<div
							key={memory.id}
							className="group relative transform transition-all duration-500 hover:scale-105 hover:rotate-1"
						>
							{/* Polaroid Frame */}
							<div className="bg-white p-4 rounded-lg shadow-2xl transform rotate-1 group-hover:rotate-0 transition-transform duration-500">
								{/* Photo */}
								<div className="aspect-square bg-gray-100 rounded-sm overflow-hidden mb-4 relative">
									<img
										src={memory.image_url || getRandomImage()}
										alt={memory.title}
										className="w-full h-full object-cover"
									/>
									
									{/* Mood Overlay */}
									{memory.mood && (
										<div className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-r ${getMoodGradient(memory.mood)} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
											{TRAVEL_MOODS.find(m => m.id === memory.mood)?.emoji}
										</div>
									)}

									{/* Weather */}
									{memory.weather && (
										<div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5">
											<span className="text-sm">
												{WEATHER_OPTIONS.find(w => w.id === memory.weather)?.emoji}
											</span>
										</div>
									)}
								</div>

								{/* Polaroid Caption Area */}
								<div className="space-y-2">
									<h3 className="font-bold text-gray-800 text-lg leading-tight">{memory.title}</h3>
									
									<div className="flex items-center gap-2 text-gray-600 text-sm">
										<MapPin className="w-4 h-4" />
										<span>{memory.destination}</span>
									</div>

									<div className="flex items-center gap-2 text-gray-500 text-sm">
										<Calendar className="w-4 h-4" />
										<span>{formatDate(memory.created_at)}</span>
									</div>

									{memory.content && (
										<p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
											{memory.content}
										</p>
									)}

									{memory.companions && memory.companions.length > 0 && (
										<div className="flex items-center gap-1 text-gray-600 text-sm">
											<Heart className="w-4 h-4 text-red-400" />
											<span>with {memory.companions.join(', ')}</span>
										</div>
									)}
								</div>

								{/* Polaroid Actions */}
								<div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
									<div className="flex gap-2">
										<button className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors">
											<Share className="w-4 h-4" />
										</button>
										<button className="p-1.5 text-gray-400 hover:text-green-500 transition-colors">
											<Download className="w-4 h-4" />
										</button>
									</div>
									<button
										onClick={() => deleteMemory(memory.id)}
										className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							</div>

							{/* Polaroid Shadow */}
							<div className="absolute inset-0 bg-gray-800/20 rounded-lg transform rotate-2 -z-10 group-hover:rotate-1 transition-transform duration-500"></div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}