"use client";

import { useEffect, useRef, useState } from "react";
import { Send, User, Bot, Settings, Brain, Zap } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Msg = { role: "user" | "assistant"; content: string; timestamp?: string };

const SUGGESTIONS = [
	"Plan my 5-day trip to Tokyo",
	"Find budget flights to Barcelona", 
	"What's happening in NYC this weekend?",
	"Compare costs: Bali vs Thailand",
	"Local hidden gems in Prague",
	"Best coworking spaces in Lisbon"
];

export default function ChatPage() {
	const [destination, setDestination] = useState("");
	const [messages, setMessages] = useState<Msg[]>([
		{ role: "assistant", content: "🌍 Hi! I'm your AI travel companion. I learn from our conversations and remember your preferences. Where would you like to explore today?", timestamp: new Date().toISOString() }
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

			let fullResponse = "";
			
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = new TextDecoder().decode(value);
				const lines = chunk.split('\n');
				
				for (const line of lines) {
					if (line.startsWith('data: ')) {
						try {
							const data = JSON.parse(line.slice(6));
							
							if (data.type === 'content') {
								fullResponse += data.content;
								setCurrentResponse(fullResponse);
							} else if (data.type === 'done') {
								// Response complete
								const assistantMessage: Msg = { 
									role: "assistant", 
									content: fullResponse,
									timestamp: new Date().toISOString()
								};
								setMessages([...newMessages, assistantMessage]);
								setCurrentResponse("");
								setStreaming(false);
								
								// Reload user memory after conversation
								if (userId) {
									setTimeout(() => loadUserMemory(userId), 1000);
								}
								return;
							} else if (data.type === 'error') {
								throw new Error(data.error);
							}
						} catch (parseError) {
							// Ignore parsing errors for incomplete JSON
						}
					}
				}
			}
		} catch (error) {
			console.error("Streaming failed:", error);
			// Fallback to regular chat
			try {
				const response = await fetch(`${API_BASE}/api/chat/`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ 
						messages: newMessages, 
						destination: destination || null,
						user_id: userId,
						stream: false,
						base_url: localStorage.getItem("gpt_base_url") || undefined,
						api_key: localStorage.getItem("gpt_api_key") || undefined,
						model: localStorage.getItem("gpt_model") || undefined
					})
				});
				const data = await response.json();
				const assistantMessage: Msg = { 
					role: "assistant", 
					content: data.reply || 'I could not generate a reply.',
					timestamp: new Date().toISOString()
				};
				setMessages([...newMessages, assistantMessage]);
			} catch (fallbackError) {
				const errorMessage: Msg = { 
					role: "assistant", 
					content: "I'm experiencing technical difficulties. Please try again.",
					timestamp: new Date().toISOString()
				};
				setMessages([...newMessages, errorMessage]);
			}
		} finally {
			setLoading(false);
			setStreaming(false);
			setCurrentResponse("");
		}
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	const clearMemory = async () => {
		if (!userId) return;
		try {
			await fetch(`${API_BASE}/api/chat/memory/${userId}`, { method: 'DELETE' });
			setUserMemory(null);
			localStorage.removeItem("nomad_user_id");
			window.location.reload();
		} catch (error) {
			console.error("Failed to clear memory:", error);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
			{/* Header */}
			<div className="border-b border-white/10 bg-white/5 backdrop-blur">
				<div className="max-w-6xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center">
								<Brain className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-xl font-bold text-white">NomadAI Chat</h1>
								<p className="text-sm text-white/60">Your AI travel companion with memory</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							{userMemory && (
								<button
									onClick={() => setShowMemory(!showMemory)}
									className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-sm flex items-center gap-2 transition-colors"
								>
									<User className="w-4 h-4" />
									Memory ({userMemory.interaction_count} chats)
								</button>
							)}
							<a href="/settings" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors">
								<Settings className="w-5 h-5" />
							</a>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-4 py-6">
				<div className="grid lg:grid-cols-12 gap-6">
					{/* Main Chat */}
					<div className="lg:col-span-8">
						{/* Destination Context */}
						<div className="mb-4">
							<label className="block text-sm text-white/80 mb-2">Travel destination (optional)</label>
							<input 
								value={destination} 
								onChange={e => setDestination(e.target.value)} 
								placeholder="e.g., Barcelona, Spain" 
								className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/50 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
							/>
						</div>

						{/* Chat Messages */}
						<div ref={listRef} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-2xl h-[65vh] overflow-y-auto space-y-6">
							{messages.map((m, i) => (
								<div key={i} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
									<div className={`flex items-start gap-3 max-w-[85%] ${m.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
										<div className={`w-8 h-8 rounded-full flex items-center justify-center ${
											m.role === 'assistant' 
												? 'bg-gradient-to-r from-emerald-400 to-cyan-400' 
												: 'bg-gradient-to-r from-blue-400 to-purple-400'
										}`}>
											{m.role === 'assistant' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
										</div>
										<div className={`rounded-2xl px-4 py-3 shadow-lg ${
											m.role === 'assistant' 
												? 'bg-gradient-to-r from-emerald-500/90 to-cyan-500/90 text-white' 
												: 'bg-gradient-to-r from-blue-500/90 to-purple-500/90 text-white'
										}`}>
											<div className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
											{m.timestamp && (
												<div className="text-xs opacity-70 mt-2">
													{new Date(m.timestamp).toLocaleTimeString()}
												</div>
											)}
										</div>
									</div>
								</div>
							))}
							
							{/* Streaming Response */}
							{streaming && currentResponse && (
								<div className="flex justify-start">
									<div className="flex items-start gap-3 max-w-[85%]">
										<div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center">
											<Bot className="w-4 h-4 text-white" />
										</div>
										<div className="rounded-2xl px-4 py-3 bg-gradient-to-r from-emerald-500/90 to-cyan-500/90 text-white shadow-lg">
											<div className="text-sm whitespace-pre-wrap leading-relaxed">{currentResponse}</div>
											<div className="flex items-center gap-1 mt-2">
												<Zap className="w-3 h-3 animate-pulse" />
												<span className="text-xs opacity-70">Thinking...</span>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Input Area */}
						<div className="mt-4">
							{/* Suggestion Chips */}
							<div className="mb-3 flex gap-2 flex-wrap">
								{SUGGESTIONS.map(s => (
									<button 
										key={s} 
										onClick={() => sendMessage(s)} 
										disabled={loading}
										className="rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2 text-sm text-white/80 hover:text-white transition-all disabled:opacity-50"
									>
										{s}
									</button>
								))}
							</div>
							
							{/* Chat Input */}
							<div className="flex items-end gap-3 rounded-2xl bg-white/10 border border-white/20 shadow-lg p-3">
								<input 
									value={input} 
									onChange={e => setInput(e.target.value)} 
									onKeyDown={onKeyDown} 
									placeholder="Ask me anything about travel..." 
									disabled={loading}
									className="flex-1 bg-transparent outline-none text-white placeholder-white/50 disabled:opacity-50 text-lg"
								/>
								<button 
									onClick={() => sendMessage()} 
									disabled={loading || !input.trim()} 
									className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-6 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
								>
									<Send size={20} />
								</button>
							</div>
						</div>
					</div>

					{/* Sidebar */}
					<div className="lg:col-span-4 space-y-6">
						{/* User Memory Panel */}
						{showMemory && userMemory && (
							<div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur">
								<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
									<Brain className="w-5 h-5" />
									Your Travel Memory
								</h3>
								
								<div className="space-y-4">
									<div>
										<h4 className="text-sm font-medium text-white/80 mb-2">Preferences</h4>
										<div className="text-sm text-white/60">
											{Object.keys(userMemory.preferences).length > 0 
												? Object.entries(userMemory.preferences).map(([k, v]) => (
													<div key={k} className="mb-1">{k}: {String(v)}</div>
												))
												: "No preferences learned yet"
											}
										</div>
									</div>

									<div>
										<h4 className="text-sm font-medium text-white/80 mb-2">Recent Destinations</h4>
										<div className="text-sm text-white/60">
											{userMemory.travel_history.length > 0
												? userMemory.travel_history.slice(-5).map((trip: any, i: number) => (
													<div key={i} className="mb-1">{trip.destination}</div>
												))
												: "No travel history yet"
											}
										</div>
									</div>

									<button
										onClick={clearMemory}
										className="w-full px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-colors"
									>
										Clear Memory
									</button>
								</div>
							</div>
						)}

						{/* AI Features */}
						<div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur">
							<h3 className="text-lg font-semibold text-white mb-4">AI Features</h3>
							<div className="space-y-3">
								<div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
									<Brain className="w-5 h-5 text-emerald-400" />
									<div>
										<div className="text-sm font-medium text-white">Memory & Learning</div>
										<div className="text-xs text-white/60">Remembers your preferences</div>
									</div>
								</div>
								<div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
									<Zap className="w-5 h-5 text-cyan-400" />
									<div>
										<div className="text-sm font-medium text-white">Real-time Data</div>
										<div className="text-xs text-white/60">Live travel information</div>
									</div>
								</div>
								<div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
									<Bot className="w-5 h-5 text-purple-400" />
									<div>
										<div className="text-sm font-medium text-white">Smart Tools</div>
										<div className="text-xs text-white/60">Budget analysis & search</div>
									</div>
								</div>
							</div>
						</div>

						{/* Quick Actions */}
						<div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur">
							<h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
							<div className="grid gap-3">
								<button 
									onClick={() => sendMessage("Plan my perfect weekend getaway")}
									className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-white text-left transition-all border border-white/10"
								>
									Plan Weekend Trip
								</button>
								<button 
									onClick={() => sendMessage("Find me budget travel deals")}
									className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white text-left transition-all border border-white/10"
								>
									Find Travel Deals
								</button>
								<button 
									onClick={() => sendMessage("Compare destinations for digital nomads")}
									className="p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 text-white text-left transition-all border border-white/10"
								>
									Compare Destinations
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}