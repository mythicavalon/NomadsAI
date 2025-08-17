"use client";

import { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import { Send, User, Bot, Loader2, Sparkles, MapPin, Calendar, Users, DollarSign } from "lucide-react";
import { Button, Input, Card } from "../../components/ui";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
};

type TravelContext = {
	destination?: string;
	dates?: string;
	travelers?: number;
	budget?: string;
	interests?: string[];
};

export default function ChatPage() {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			role: "assistant",
			content: "Hello! I'm your AI travel assistant powered by NVIDIA's GPT-OSS-120B model. I can help you plan trips, discover destinations, and provide cultural insights. What would you like to know about travel?",
			timestamp: new Date()
		}
	]);
	const [inputMessage, setInputMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [travelContext, setTravelContext] = useState<TravelContext>({});
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSendMessage = async () => {
		if (!inputMessage.trim() || isLoading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: "user",
			content: inputMessage,
			timestamp: new Date()
		};

		setMessages(prev => [...prev, userMessage]);
		setInputMessage("");
		setIsLoading(true);

		try {
			const response = await fetch(`${API_BASE}/api/chat`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					messages: [
						...messages.map(msg => ({
							role: msg.role,
							content: msg.content
						})),
						{
							role: "user",
							content: inputMessage
						}
					],
					travel_context: travelContext
				}),
			});

			if (response.ok) {
				const data = await response.json();
				const assistantMessage: Message = {
					id: (Date.now() + 1).toString(),
					role: "assistant",
					content: data.response || "I'm sorry, I couldn't process your request. Please try again.",
					timestamp: new Date()
				};
				setMessages(prev => [...prev, assistantMessage]);
			} else {
				throw new Error("Failed to get response");
			}
		} catch (error) {
			console.error("Error sending message:", error);
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: "I'm experiencing technical difficulties. Please try again in a moment.",
				timestamp: new Date()
			};
			setMessages(prev => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const quickPrompts = [
		"Plan a 5-day business trip to Tokyo",
		"What are the best restaurants in Paris?",
		"Tell me about cultural etiquette in Dubai",
		"Recommend hidden gems in Barcelona",
		"Plan a romantic weekend in Venice"
	];

	const handleQuickPrompt = (prompt: string) => {
		setInputMessage(prompt);
	};

	return (
		<div className="min-h-screen bg-gray-950">
			<div className="container mx-auto py-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="heading-2xl text-gradient mb-4">
						AI Travel Assistant
					</h1>
					<p className="text-gray-300 max-w-2xl mx-auto">
						Powered by NVIDIA's GPT-OSS-120B model for intelligent travel planning, 
						cultural insights, and personalized recommendations.
					</p>
				</div>

				<div className="grid lg:grid-cols-4 gap-8">
					{/* Chat Interface */}
					<div className="lg:col-span-3">
						<Card className="h-[600px] flex flex-col">
							{/* Messages */}
							<div className="flex-1 overflow-y-auto p-6 space-y-4">
								{messages.map((message) => (
									<div
										key={message.id}
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
												"max-w-[80%] rounded-lg p-4",
												message.role === "user"
													? "bg-accent-500 text-white"
													: "bg-gray-800 text-gray-100"
											)}
										>
											<div className="whitespace-pre-wrap">{message.content}</div>
											<div className="text-xs opacity-70 mt-2">
												{message.timestamp.toLocaleTimeString()}
											</div>
										</div>

										{message.role === "user" && (
											<div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
												<User className="w-4 h-4 text-gray-300" />
											</div>
										)}
									</div>
								))}
								
								{isLoading && (
									<div className="flex gap-3 justify-start">
										<div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center flex-shrink-0">
											<Bot className="w-4 h-4 text-accent-400" />
										</div>
										<div className="bg-gray-800 rounded-lg p-4">
											<div className="flex items-center gap-2">
												<Loader2 className="w-4 h-4 animate-spin" />
												<span className="text-gray-300">AI is thinking...</span>
											</div>
										</div>
									</div>
								)}
								
								<div ref={messagesEndRef} />
							</div>

							{/* Input Area */}
							<div className="border-t border-gray-700 p-4">
								<div className="flex gap-3">
									<Input
										value={inputMessage}
										onChange={(e) => setInputMessage(e.target.value)}
										onKeyPress={handleKeyPress}
										placeholder="Ask me about travel destinations, planning, or cultural insights..."
										className="flex-1"
										disabled={isLoading}
									/>
									<Button
										onClick={handleSendMessage}
										disabled={!inputMessage.trim() || isLoading}
										className="px-6"
									>
										<Send className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Quick Prompts */}
						<Card>
							<h3 className="heading-md mb-4">Quick Prompts</h3>
							<div className="space-y-3">
								{quickPrompts.map((prompt, index) => (
									<button
										key={index}
										onClick={() => handleQuickPrompt(prompt)}
										className="w-full text-left p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm text-gray-300 hover:text-white"
									>
										{prompt}
									</button>
								))}
							</div>
						</Card>

						{/* Travel Context */}
						<Card>
							<h3 className="heading-md mb-4">Travel Context</h3>
							<div className="space-y-3 text-sm">
								{travelContext.destination && (
									<div className="flex items-center gap-2 text-gray-300">
										<MapPin className="w-4 h-4 text-accent-400" />
										<span>{travelContext.destination}</span>
									</div>
								)}
								{travelContext.dates && (
									<div className="flex items-center gap-2 text-gray-300">
										<Calendar className="w-4 h-4 text-accent-400" />
										<span>{travelContext.dates}</span>
									</div>
								)}
								{travelContext.travelers && (
									<div className="flex items-center gap-2 text-gray-300">
										<Users className="w-4 h-4 text-accent-400" />
										<span>{travelContext.travelers} travelers</span>
									</div>
								)}
								{travelContext.budget && (
									<div className="flex items-center gap-2 text-gray-300">
										<DollarSign className="w-4 h-4 text-accent-400" />
										<span>{travelContext.budget} budget</span>
									</div>
								)}
								{!travelContext.destination && (
									<div className="text-gray-500 text-xs">
										No travel context set. Start a conversation to build context.
									</div>
								)}
							</div>
						</Card>

						{/* AI Capabilities */}
						<Card>
							<h3 className="heading-md mb-4">AI Capabilities</h3>
							<div className="space-y-3 text-sm text-gray-300">
								<div className="flex items-center gap-2">
									<Sparkles className="w-4 h-4 text-accent-400" />
									<span>Intelligent travel planning</span>
								</div>
								<div className="flex items-center gap-2">
									<Sparkles className="w-4 h-4 text-accent-400" />
									<span>Cultural insights & etiquette</span>
								</div>
								<div className="flex items-center gap-2">
									<Sparkles className="w-4 h-4 text-accent-400" />
									<span>Hidden gem recommendations</span>
								</div>
								<div className="flex items-center gap-2">
									<Sparkles className="w-4 h-4 text-accent-400" />
									<span>Budget optimization</span>
								</div>
								<div className="flex items-center gap-2">
									<Sparkles className="w-4 h-4 text-accent-400" />
									<span>Local knowledge & tips</span>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}