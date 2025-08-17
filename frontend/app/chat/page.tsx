"use client";

import { useEffect, useRef, useState } from "react";
import { Send, User, Bot, Sparkles, Brain, Zap, MessageCircle, Loader, MapPin, Plane } from "lucide-react";
import { Button, Input, Card } from "../../components/ui";
import { clsx } from "clsx";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Msg = { role: "user" | "assistant"; content: string; timestamp?: string };

const SUGGESTIONS = [
	"Plan my 5-day adventure in Tokyo",
	"Find budget flights to Barcelona", 
	"What's happening in NYC this weekend?",
	"Compare costs: Bali vs Thailand for nomads",
	"Hidden gems in Prague for culture lovers",
	"Best coworking spaces in Lisbon",
	"Romantic getaway ideas for couples",
	"Solo female travel safety tips for Southeast Asia"
];

export default function ChatPage() {
	const [destination, setDestination] = useState("");
	const [messages, setMessages] = useState<Msg[]>([
		{ 
			role: "assistant", 
			content: "🌍 Welcome to your AI travel companion! I'm here to help you discover amazing destinations, plan perfect itineraries, and make your travel dreams come true. I learn from our conversations and remember your preferences to give you increasingly personalized recommendations.\n\nWhat adventure are you planning today?", 
			timestamp: new Date().toISOString() 
		}
	]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [streaming, setStreaming] = useState(false);
	const [currentResponse, setCurrentResponse] = useState("");
	const [userId, setUserId] = useState("");
	const [userMemory, setUserMemory] = useState<any>(null);
	const [showMemory, setShowMemory] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);

	// Initialize user ID and load memory
	useEffect(() => {
		const storedUserId = localStorage.getItem("nomad_user_id");
		if (storedUserId) {
			setUserId(storedUserId);
			loadUserMemory(storedUserId);
		} else {
			const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			localStorage.setItem("nomad_user_id", newUserId);
			setUserId(newUserId);
		}
	}, []);

	const loadUserMemory = async (uid: string) => {
		try {
			const response = await fetch(`${API_BASE}/api/chat/memory/${uid}`);
			if (response.ok) {
				const memory = await response.json();
				setUserMemory(memory);
			}
		} catch (error) {
			console.log("No existing memory found");
		}
	};

	useEffect(() => {
		listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
	}, [messages.length, currentResponse]);

	async function sendMessage(text?: string) {
		const content = (text ?? input).trim();
		if (!content || loading) return;
		
		const userMessage: Msg = { role: "user", content, timestamp: new Date().toISOString() };
		const newMessages = [...messages, userMessage];
		setMessages(newMessages);
		setInput("");
		setLoading(true);
		setStreaming(true);
		setCurrentResponse("");

		try {
			const base_url = localStorage.getItem("gpt_base_url") || undefined;
			const api_key = localStorage.getItem("gpt_api_key") || undefined;
			const model = localStorage.getItem("gpt_model") || undefined;

			// Use streaming endpoint
			const response = await fetch(`${API_BASE}/api/chat/stream`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					messages: newMessages, 
					destination: destination || null,
					user_id: userId,
					base_url, 
					api_key, 
					model 
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const reader = response.body?.getReader();
			if (!reader) throw new Error("No reader available");

			let fullResponse = "";
			const decoder = new TextDecoder();

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n');

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const data = line.slice(6);
						if (data === '[DONE]') {
							setStreaming(false);
							setLoading(false);
							setMessages(prev => [...prev, { 
								role: "assistant", 
								content: fullResponse, 
								timestamp: new Date().toISOString() 
							}]);
							setCurrentResponse("");
							return;
						}

						try {
							const parsed = JSON.parse(data);
							if (parsed.choices && parsed.choices[0]?.delta?.content) {
								const content = parsed.choices[0].delta.content;
								fullResponse += content;
								setCurrentResponse(fullResponse);
							}
						} catch (e) {
							console.log("Failed to parse chunk:", data);
						}
					}
				}
			}
		} catch (error) {
			console.error('Error:', error);
			setMessages(prev => [...prev, { 
				role: "assistant", 
				content: "Sorry, I encountered an error. Please try again.", 
				timestamp: new Date().toISOString() 
			}]);
		} finally {
			setStreaming(false);
			setLoading(false);
			setCurrentResponse("");
		}
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	return (
		<div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
			{/* Header */}
			<div className="text-center space-y-4">
				<div className="flex items-center justify-center gap-3 mb-4">
					<div className="w-12 h-12 bg-accent-500/20 rounded-full flex items-center justify-center">
						<Sparkles className="w-6 h-6 text-accent-400" />
					</div>
					<h1 className="heading-2xl">AI Travel Concierge</h1>
				</div>
				<p className="text-gray-300 max-w-2xl mx-auto">
					Your intelligent travel companion that learns your preferences and creates personalized recommendations
				</p>
			</div>

			{/* Chat Interface */}
			<Card className="space-y-6">
				{/* Destination Input */}
				<div className="space-y-4">
					<label className="flex items-center gap-2 text-gray-300 font-medium">
						<MapPin className="w-4 h-4 text-accent-400" />
						Current Destination (Optional)
					</label>
					<Input
						placeholder="e.g., Tokyo, Barcelona, Bali..."
						value={destination}
						onChange={(e) => setDestination(e.target.value)}
						leftIcon={<Plane className="w-4 h-4" />}
					/>
				</div>

				{/* Quick Suggestions */}
				<div className="space-y-3">
					<label className="text-sm font-medium text-gray-400">Quick Start Suggestions</label>
					<div className="flex flex-wrap gap-2">
						{SUGGESTIONS.map((suggestion, idx) => (
							<Button
								key={idx}
								variant="ghost"
								size="sm"
								onClick={() => sendMessage(suggestion)}
								disabled={loading}
								className="text-xs"
							>
								{suggestion}
							</Button>
						))}
					</div>
				</div>

				{/* Memory Display */}
				{userMemory && (
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<label className="text-sm font-medium text-gray-400">Your Travel Profile</label>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowMemory(!showMemory)}
								className="text-xs"
							>
								{showMemory ? 'Hide' : 'Show'} Details
							</Button>
						</div>
						{showMemory && (
							<div className="p-4 glass rounded-lg border border-gray-700/50 animate-fade-in">
								<div className="grid md:grid-cols-2 gap-4 text-sm">
									<div>
										<span className="text-gray-400">Preferred Destinations:</span>
										<div className="text-white mt-1">
											{userMemory.preferred_destinations?.join(', ') || 'None specified'}
										</div>
									</div>
									<div>
										<span className="text-gray-400">Travel Style:</span>
										<div className="text-white mt-1">
											{userMemory.travel_style || 'Not specified'}
										</div>
									</div>
									<div>
										<span className="text-gray-400">Budget Range:</span>
										<div className="text-white mt-1">
											{userMemory.budget_range || 'Not specified'}
										</div>
									</div>
									<div>
										<span className="text-gray-400">Interests:</span>
										<div className="text-white mt-1">
											{userMemory.interests?.join(', ') || 'None specified'}
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				)}
			</Card>

			{/* Messages */}
			<Card className="space-y-6">
				<div className="space-y-4">
					<div className="flex items-center gap-2 text-gray-400 text-sm">
						<MessageCircle className="w-4 h-4" />
						Conversation History
					</div>
					
					<div 
						ref={listRef}
						className="space-y-4 max-h-96 overflow-y-auto pr-2"
					>
						{messages.map((message, idx) => (
							<div
								key={idx}
								className={clsx(
									"flex gap-3",
									message.role === "user" ? "justify-end" : "justify-start"
								)}
							>
								{message.role === "assistant" && (
									<div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center flex-shrink-0">
										<Bot className="w-4 h-4 text-accent-400" />
									</div>
								)}
								
								<div
									className={clsx(
										"max-w-[80%] rounded-2xl px-4 py-3",
										message.role === "user"
											? "bg-accent-500 text-gray-900"
											: "glass border border-gray-700/50"
									)}
								>
									<div className="whitespace-pre-wrap">{message.content}</div>
									{message.timestamp && (
										<div className={clsx(
											"text-xs mt-2",
											message.role === "user" ? "text-gray-700" : "text-gray-400"
										)}>
											{new Date(message.timestamp).toLocaleTimeString()}
										</div>
									)}
								</div>

								{message.role === "user" && (
									<div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
										<User className="w-4 h-4 text-gray-300" />
									</div>
								)}
							</div>
						))}

						{/* Streaming Response */}
						{streaming && currentResponse && (
							<div className="flex gap-3 justify-start">
								<div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center flex-shrink-0">
									<Bot className="w-4 h-4 text-accent-400" />
								</div>
								<div className="max-w-[80%] glass border border-gray-700/50 rounded-2xl px-4 py-3">
									<div className="whitespace-pre-wrap">{currentResponse}</div>
									<div className="flex items-center gap-2 mt-2">
										<Loader className="w-3 h-3 animate-spin text-accent-400" />
										<span className="text-xs text-gray-400">AI is thinking...</span>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Input Area */}
				<div className="space-y-4">
					<div className="flex gap-3">
						<Input
							placeholder="Ask me anything about travel..."
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyPress={handleKeyPress}
							disabled={loading}
							className="flex-1"
						/>
						<Button
							onClick={() => sendMessage()}
							disabled={loading || !input.trim()}
							loading={loading}
							leftIcon={<Send className="w-4 h-4" />}
						>
							Send
						</Button>
					</div>
					
					<div className="text-xs text-gray-400 text-center">
						Press Enter to send, Shift+Enter for new line
					</div>
				</div>
			</Card>

			{/* Features */}
			<div className="grid md:grid-cols-3 gap-6">
				<Card className="text-center space-y-4">
					<div className="w-12 h-12 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto">
						<Brain className="w-6 h-6 text-accent-400" />
					</div>
					<h3 className="heading-sm">AI Learning</h3>
					<p className="text-sm text-gray-300">
						I remember your preferences and get smarter with every conversation
					</p>
				</Card>

				<Card className="text-center space-y-4">
					<div className="w-12 h-12 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto">
						<Zap className="w-6 h-6 text-accent-400" />
					</div>
					<h3 className="heading-sm">Real-time Updates</h3>
					<p className="text-sm text-gray-300">
						Get live information about destinations, events, and travel conditions
					</p>
				</Card>

				<Card className="text-center space-y-4">
					<div className="w-12 h-12 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto">
						<Sparkles className="w-6 h-6 text-accent-400" />
					</div>
					<h3 className="heading-sm">Personalized</h3>
					<p className="text-sm text-gray-300">
						Every recommendation is tailored to your unique travel style and interests
					</p>
				</Card>
			</div>
		</div>
	);
}