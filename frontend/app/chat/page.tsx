"use client";

import { useEffect, useRef, useState } from "react";
import { Send, User, Bot, Sparkles, Brain, Zap, MessageCircle, Loader, MapPin } from "lucide-react";

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
			if (!reader) {
				throw new Error("Failed to get response reader");
			}

			let assistantResponse = "";
			
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = new TextDecoder().decode(value);
				const lines = chunk.split('\n');
				
				for (const line of lines) {
					if (line.startsWith('data: ')) {
						try {
							const data = JSON.parse(line.slice(6));
							if (data.type === 'content' && data.content) {
								assistantResponse += data.content;
								setCurrentResponse(assistantResponse);
							} else if (data.type === 'done') {
								setStreaming(false);
								setMessages([...newMessages, { 
									role: "assistant", 
									content: assistantResponse, 
									timestamp: new Date().toISOString() 
								}]);
								setCurrentResponse("");
								break;
							} else if (data.type === 'error') {
								throw new Error(data.error);
							}
						} catch (e) {
							// Skip invalid JSON lines
						}
					}
				}
			}
		} catch (error) {
			console.error('Chat error:', error);
			setMessages([...newMessages, { 
				role: "assistant", 
				content: "I apologize, but I encountered an error while processing your request. Please try again or check your connection.", 
				timestamp: new Date().toISOString() 
			}]);
		} finally {
			setLoading(false);
			setStreaming(false);
			setCurrentResponse("");
		}
	}

	function formatTimestamp(timestamp?: string) {
		if (!timestamp) return "";
		return new Date(timestamp).toLocaleTimeString('en-US', { 
			hour: '2-digit', 
			minute: '2-digit' 
		});
	}

	return (
		<div className="h-[calc(100vh-200px)] flex flex-col">
			{/* Chat Header */}
			<div className="glass-strong rounded-2xl p-6 mb-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center animate-glow">
							<Bot className="w-7 h-7 text-white" />
						</div>
						<div>
							<h1 className="heading-md">AI Travel Chat</h1>
							<p className="text-white/70">Your intelligent travel companion</p>
						</div>
					</div>
					
					{userMemory && (
						<button
							onClick={() => setShowMemory(!showMemory)}
							className="btn-secondary flex items-center gap-2"
						>
							<Brain className="w-4 h-4" />
							Memory
						</button>
					)}
				</div>

				{/* Destination Context */}
				{destination && (
					<div className="mt-4 p-3 glass rounded-xl flex items-center gap-2">
						<MapPin className="w-4 h-4 text-brand-400" />
						<span className="text-white/80">Context: {destination}</span>
						<button 
							onClick={() => setDestination("")}
							className="ml-auto text-white/60 hover:text-white"
						>
							×
						</button>
					</div>
				)}
			</div>

			{/* Memory Panel */}
			{showMemory && userMemory && (
				<div className="glass rounded-2xl p-4 mb-4">
					<h3 className="font-semibold text-white mb-2 flex items-center gap-2">
						<Brain className="w-4 h-4 text-brand-400" />
						AI Memory
					</h3>
					<div className="text-sm text-white/70 space-y-1">
						<p><strong>Interactions:</strong> {userMemory.interaction_count || 0}</p>
						{userMemory.preferences && Object.keys(userMemory.preferences).length > 0 && (
							<p><strong>Preferences:</strong> {JSON.stringify(userMemory.preferences)}</p>
						)}
					</div>
				</div>
			)}

			{/* Messages Container */}
			<div 
				ref={listRef}
				className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2"
				style={{ scrollBehavior: 'smooth' }}
			>
				{messages.map((msg, idx) => (
					<div
						key={idx}
						className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
					>
						{msg.role === 'assistant' && (
							<div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 mt-1">
								<Bot className="w-4 h-4 text-white" />
							</div>
						)}
						
						<div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
							<div
								className={`p-4 rounded-2xl ${
									msg.role === 'user'
										? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white ml-auto'
										: 'glass text-white'
								}`}
							>
								<div className="whitespace-pre-wrap leading-relaxed">
									{msg.content}
								</div>
							</div>
							{msg.timestamp && (
								<div className={`text-xs text-white/50 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
									{formatTimestamp(msg.timestamp)}
								</div>
							)}
						</div>

						{msg.role === 'user' && (
							<div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0 mt-1 order-2">
								<User className="w-4 h-4 text-white" />
							</div>
						)}
					</div>
				))}

				{/* Streaming Response */}
				{streaming && currentResponse && (
					<div className="flex gap-4 justify-start">
						<div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 mt-1">
							<Bot className="w-4 h-4 text-white" />
						</div>
						<div className="max-w-[80%]">
							<div className="p-4 rounded-2xl glass text-white">
								<div className="whitespace-pre-wrap leading-relaxed">
									{currentResponse}
									<span className="inline-block w-2 h-5 bg-brand-400 ml-1 animate-pulse"></span>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Loading Indicator */}
				{loading && !streaming && (
					<div className="flex gap-4 justify-start">
						<div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 mt-1">
							<Loader className="w-4 h-4 text-white animate-spin" />
						</div>
						<div className="glass rounded-2xl p-4">
							<div className="flex items-center gap-2 text-white/70">
								<div className="flex gap-1">
									<div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
									<div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
									<div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
								</div>
								<span>Thinking...</span>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Suggestions */}
			{messages.length <= 1 && (
				<div className="mb-6">
					<h3 className="text-white/80 font-medium mb-3 flex items-center gap-2">
						<Sparkles className="w-4 h-4 text-brand-400" />
						Try asking about:
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{SUGGESTIONS.map((suggestion, idx) => (
							<button
								key={idx}
								onClick={() => sendMessage(suggestion)}
								disabled={loading}
								className="text-left p-3 glass rounded-xl hover:glass-strong transition-all duration-300 text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
							>
								{suggestion}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Input Area */}
			<div className="glass-strong rounded-2xl p-4">
				<div className="flex gap-4">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
						placeholder="Ask me anything about travel... (Press Enter to send)"
						disabled={loading}
						className="flex-1 input-premium disabled:opacity-50 disabled:cursor-not-allowed"
					/>
					<button
						onClick={() => sendMessage()}
						disabled={loading || !input.trim()}
						className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Send className="w-4 h-4" />
						Send
					</button>
				</div>
				
				<div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
					<div className="flex items-center gap-4">
						<label className="flex items-center gap-2 text-sm text-white/70">
							<MapPin className="w-4 h-4" />
							<input
								type="text"
								value={destination}
								onChange={(e) => setDestination(e.target.value)}
								placeholder="Add destination context (optional)"
								className="bg-transparent border-none outline-none placeholder-white/50 text-white/80"
							/>
						</label>
					</div>
					
					<div className="text-xs text-white/50">
						Powered by AI • {messages.length - 1} messages
					</div>
				</div>
			</div>
		</div>
	);
}