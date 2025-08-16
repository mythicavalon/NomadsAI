import './globals.css'
import type { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import { Brain, Sparkles, Crown } from 'lucide-react'

const inter = Inter({ subsets: ['latin'], display: 'swap' })
const merri = Merriweather({ subsets: ['latin'], weight: ['300','400','700'], display: 'swap' })

export const metadata: Metadata = {
	title: 'NomadAI — Your Intelligent Travel Companion',
	description: 'Transform your travel experience with AI that learns, predicts, and optimizes every journey. The future of travel planning is here.',
	keywords: 'AI travel, travel planning, digital nomad, intelligent itinerary, travel companion, artificial intelligence',
	openGraph: {
		title: 'NomadAI — Your Intelligent Travel Companion',
		description: 'Transform your travel experience with AI that learns, predicts, and optimizes every journey.',
		type: 'website',
		images: ['/og-image.png'],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'NomadAI — Your Intelligent Travel Companion',
		description: 'Transform your travel experience with AI that learns, predicts, and optimizes every journey.',
	}
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={inter.className}>
			<body className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
				{/* Modern Navigation Header */}
				<header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-50">
					<div className="max-w-7xl mx-auto px-4 py-4">
						<div className="flex items-center justify-between">
							{/* Logo and Brand */}
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center">
									<Brain className="w-6 h-6 text-white" />
								</div>
								<div>
									<h1 className={`${merri.className} text-xl font-bold text-white`}>NomadAI</h1>
									<p className="text-xs text-emerald-400">Intelligent Travel Companion</p>
								</div>
							</div>

							{/* Navigation */}
							<nav className="hidden md:flex items-center gap-6">
								<a href="/" className="text-white/80 hover:text-white transition-colors">Home</a>
								<a href="/chat" className="text-white/80 hover:text-white transition-colors flex items-center gap-2">
									<Sparkles className="w-4 h-4" />
									AI Chat
								</a>
								<a href="/memories" className="text-white/80 hover:text-white transition-colors">Memories</a>
								<a href="/digest" className="text-white/80 hover:text-white transition-colors">Digest</a>
								<a href="/settings" className="text-white/80 hover:text-white transition-colors">Settings</a>
							</nav>

							{/* CTA Buttons */}
							<div className="flex items-center gap-3">
								<a 
									href="/upgrade" 
									className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl transition-all shadow-lg"
								>
									<Crown className="w-4 h-4" />
									Upgrade
								</a>
								<button className="md:hidden p-2 text-white/80 hover:text-white">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
									</svg>
								</button>
							</div>
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className="min-h-screen">
					{children}
				</main>

				{/* Enhanced Footer */}
				<footer className="border-t border-white/10 bg-black/20 backdrop-blur-lg">
					<div className="max-w-7xl mx-auto px-4 py-12">
						<div className="grid md:grid-cols-4 gap-8">
							{/* Brand Column */}
							<div className="md:col-span-1">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center">
										<Brain className="w-5 h-5 text-white" />
									</div>
									<span className={`${merri.className} text-lg font-bold text-white`}>NomadAI</span>
								</div>
								<p className="text-sm text-white/60 mb-4">
									The world's most intelligent travel companion. Experience the future of travel planning.
								</p>
								<div className="flex gap-3">
									<a href="https://www.linkedin.com/in/amal080/" target="_blank" className="text-white/60 hover:text-emerald-400 transition-colors">
										LinkedIn
									</a>
									<a href="https://github.com/mythicavalon" target="_blank" className="text-white/60 hover:text-emerald-400 transition-colors">
										GitHub
									</a>
								</div>
							</div>

							{/* Product Column */}
							<div>
								<h3 className="text-white font-semibold mb-4">Product</h3>
								<ul className="space-y-2 text-sm text-white/60">
									<li><a href="/chat" className="hover:text-white transition-colors">AI Chat</a></li>
									<li><a href="/" className="hover:text-white transition-colors">Itinerary Planner</a></li>
									<li><a href="/memories" className="hover:text-white transition-colors">Travel Memory</a></li>
									<li><a href="/digest" className="hover:text-white transition-colors">Weekly Digest</a></li>
								</ul>
							</div>

							{/* Features Column */}
							<div>
								<h3 className="text-white font-semibold mb-4">Features</h3>
								<ul className="space-y-2 text-sm text-white/60">
									<li><a href="/features/ai-memory" className="hover:text-white transition-colors">AI Memory & Learning</a></li>
									<li><a href="/features/real-time" className="hover:text-white transition-colors">Real-time Updates</a></li>
									<li><a href="/features/budget" className="hover:text-white transition-colors">Budget Optimization</a></li>
									<li><a href="/features/community" className="hover:text-white transition-colors">Travel Community</a></li>
								</ul>
							</div>

							{/* Company Column */}
							<div>
								<h3 className="text-white font-semibold mb-4">Company</h3>
								<ul className="space-y-2 text-sm text-white/60">
									<li><a href="/about" className="hover:text-white transition-colors">About</a></li>
									<li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
									<li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
									<li><a href="/support" className="hover:text-white transition-colors">Support</a></li>
								</ul>
							</div>
						</div>

						{/* Bottom Bar */}
						<div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
							<div className="text-sm text-white/60">
								© 2024 NomadAI. Built with ❤️ for the future of travel.
							</div>
							<div className="flex items-center gap-6 text-sm text-white/60">
								<a href="/terms" className="hover:text-white transition-colors">Terms</a>
								<a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
								<a href="https://www.paypal.com/paypalme/amalnair11/" target="_blank" className="hover:text-emerald-400 transition-colors">
									Support the Project
								</a>
							</div>
						</div>
					</div>
				</footer>

				{/* Global Scripts */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
						// Analytics and tracking would go here
						console.log("NomadAI 2.0 - Transform your travel experience");
						`,
					}}
				/>
			</body>
		</html>
	)
}