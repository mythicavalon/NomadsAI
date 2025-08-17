"use client";

import { useState } from 'react';
import { Plane, Sparkles, Crown, Diamond, Menu, X } from 'lucide-react';
import { Crimson_Text } from 'next/font/google';

const crimsonText = Crimson_Text({ subsets: ['latin'], weight: ['400','600','700'], display: 'swap' });

export default function Navigation() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

	return (
		<header className="sticky top-0 z-50 glass border-b border-gray-700/50 backdrop-blur-xl">
			<div className="container">
				<div className="flex items-center justify-between py-4">
					{/* Logo and Brand */}
					<div className="flex items-center gap-4">
						<div className="relative">
							<div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow">
								<Plane className="w-7 h-7 text-gray-900 transform rotate-45" />
							</div>
							<div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-info-500 flex items-center justify-center">
								<Diamond className="w-2.5 h-2.5 text-white" />
							</div>
						</div>
						<div>
							<h1 className={`${crimsonText.className} text-2xl font-bold text-gradient`}>NomadAI</h1>
							<p className="text-xs text-gray-400 font-medium tracking-widest uppercase">Intelligent Travel</p>
						</div>
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center gap-8">
						<a href="/" className="group flex items-center gap-2 text-gray-300 hover:text-accent-400 transition-colors duration-200">
							<span className="relative font-medium">
								Home
								<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-accent group-hover:w-full transition-all duration-300"></span>
							</span>
						</a>
						<a href="/chat" className="group flex items-center gap-2 text-gray-300 hover:text-accent-400 transition-colors duration-200">
							<Sparkles className="w-4 h-4 text-accent-400" />
							<span className="relative font-medium">
								AI Concierge
								<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-accent group-hover:w-full transition-all duration-300"></span>
							</span>
						</a>
						<a href="/memories" className="group flex items-center gap-2 text-gray-300 hover:text-accent-400 transition-colors duration-200">
							<span className="relative font-medium">
								Memories
								<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-accent group-hover:w-full transition-all duration-300"></span>
							</span>
						</a>
					</nav>

					{/* CTA and Mobile Menu Button */}
					<div className="flex items-center gap-4">
						<a 
							href="/pricing" 
							className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-gradient-accent hover:shadow-glow text-gray-900 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 font-semibold text-sm"
						>
							<Crown className="w-4 h-4" />
							Get Started
						</a>
						<button 
							className="md:hidden p-2 text-gray-400 hover:text-accent-400 glass rounded-lg transition-colors duration-200"
							onClick={toggleMobileMenu}
							aria-label="Toggle mobile menu"
						>
							{isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
						</button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{isMobileMenuOpen && (
					<div className="md:hidden py-4 border-t border-gray-700/50 animate-slide-in">
						<nav className="flex flex-col space-y-4">
							<a href="/" className="text-gray-300 hover:text-accent-400 transition-colors duration-200 py-2">
								Home
							</a>
							<a href="/chat" className="flex items-center gap-2 text-gray-300 hover:text-accent-400 transition-colors duration-200 py-2">
								<Sparkles className="w-4 h-4 text-accent-400" />
								AI Concierge
							</a>
							<a href="/memories" className="text-gray-300 hover:text-accent-400 transition-colors duration-200 py-2">
								Memories
							</a>
							<a href="/pricing" className="flex items-center gap-2 px-4 py-2 bg-gradient-accent text-gray-900 rounded-lg font-semibold text-sm mt-2">
								<Crown className="w-4 h-4" />
								Get Started
							</a>
						</nav>
					</div>
				)}
			</div>
		</header>
	);
}