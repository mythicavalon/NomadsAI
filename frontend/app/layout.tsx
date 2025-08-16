import './globals.css'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Plane, Sparkles, Crown, MapPin } from 'lucide-react'

const inter = Inter({ subsets: ['latin'], display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400','500','600','700'], display: 'swap' })

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
			<body className="min-h-screen bg-premium-dark text-white overflow-x-hidden">
				{/* Premium Navigation Header */}
				<header className="glass-strong sticky top-0 z-50 border-b border-white/10">
					<div className="container-max">
						<div className="flex items-center justify-between py-4">
							{/* Premium Logo and Brand */}
							<div className="flex items-center gap-4">
								<div className="relative">
									<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-glow animate-glow">
										<Plane className="w-7 h-7 text-white transform rotate-45" />
									</div>
									<div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center">
										<MapPin className="w-2.5 h-2.5 text-white" />
									</div>
								</div>
								<div>
									<h1 className={`${playfair.className} text-2xl font-bold text-gradient`}>NomadAI</h1>
									<p className="text-xs text-brand-400 font-medium tracking-wide">Intelligent Travel Companion</p>
								</div>
							</div>

							{/* Premium Navigation */}
							<nav className="hidden md:flex items-center gap-8">
								<a href="/" className="group flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300">
									<span className="relative">
										Home
										<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-400 to-brand-600 group-hover:w-full transition-all duration-300"></span>
									</span>
								</a>
								<a href="/chat" className="group flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300">
									<Sparkles className="w-4 h-4 text-brand-400" />
									<span className="relative">
										AI Chat
										<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-400 to-brand-600 group-hover:w-full transition-all duration-300"></span>
									</span>
								</a>
								<a href="/memories" className="group flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300">
									<span className="relative">
										Memories
										<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-400 to-brand-600 group-hover:w-full transition-all duration-300"></span>
									</span>
								</a>
							</nav>

							{/* Premium CTA */}
							<div className="flex items-center gap-4">
								<a 
									href="/pricing" 
									className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl transition-all duration-300 shadow-button hover:shadow-glow transform hover:-translate-y-0.5 font-medium"
								>
									<Crown className="w-4 h-4" />
									Upgrade Pro
								</a>
								<button className="md:hidden p-3 text-white/80 hover:text-white glass rounded-xl">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
									</svg>
								</button>
							</div>
						</div>
					</div>
				</header>

				{/* Main Content with Premium Spacing */}
				<main className="min-h-screen">
					<div className="container-max py-8">
						{children}
					</div>
				</main>

				{/* Premium Footer */}
				<footer className="glass-strong border-t border-white/10 mt-20">
					<div className="container-max py-16">
						<div className="grid md:grid-cols-4 gap-12">
							{/* Premium Brand Column */}
							<div className="md:col-span-1">
								<div className="flex items-center gap-4 mb-6">
									<div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
										<Plane className="w-6 h-6 text-white transform rotate-45" />
									</div>
									<span className={`${playfair.className} text-xl font-bold text-gradient`}>NomadAI</span>
								</div>
								<p className="text-white/70 mb-6 leading-relaxed">
									The world's most intelligent travel companion. Experience the future of travel planning with AI that learns, adapts, and optimizes every journey.
								</p>
								<div className="flex gap-4">
									<a href="https://www.linkedin.com/in/amal080/" target="_blank" className="text-white/60 hover:text-brand-400 transition-colors duration-300">
										LinkedIn
									</a>
									<a href="https://github.com/mythicavalon" target="_blank" className="text-white/60 hover:text-brand-400 transition-colors duration-300">
										GitHub
									</a>
								</div>
							</div>

							{/* Product Column */}
							<div>
								<h3 className="text-white font-semibold mb-6 text-lg">Product</h3>
								<ul className="space-y-3 text-white/70">
									<li><a href="/chat" className="hover:text-brand-400 transition-colors duration-300">AI Travel Chat</a></li>
									<li><a href="/" className="hover:text-brand-400 transition-colors duration-300">Smart Itineraries</a></li>
									<li><a href="/memories" className="hover:text-brand-400 transition-colors duration-300">Travel Memories</a></li>
									<li><a href="/pricing" className="hover:text-brand-400 transition-colors duration-300">Premium Features</a></li>
								</ul>
							</div>

							{/* Features Column */}
							<div>
								<h3 className="text-white font-semibold mb-6 text-lg">Features</h3>
								<ul className="space-y-3 text-white/70">
									<li><a href="#" className="hover:text-brand-400 transition-colors duration-300">AI Memory & Learning</a></li>
									<li><a href="#" className="hover:text-brand-400 transition-colors duration-300">Real-time Updates</a></li>
									<li><a href="#" className="hover:text-brand-400 transition-colors duration-300">Budget Optimization</a></li>
									<li><a href="#" className="hover:text-brand-400 transition-colors duration-300">Travel Community</a></li>
								</ul>
							</div>

							{/* Company Column */}
							<div>
								<h3 className="text-white font-semibold mb-6 text-lg">Company</h3>
								<ul className="space-y-3 text-white/70">
									<li><a href="/about" className="hover:text-brand-400 transition-colors duration-300">About</a></li>
									<li><a href="/pricing" className="hover:text-brand-400 transition-colors duration-300">Pricing</a></li>
									<li><a href="/privacy" className="hover:text-brand-400 transition-colors duration-300">Privacy</a></li>
									<li><a href="/support" className="hover:text-brand-400 transition-colors duration-300">Support</a></li>
								</ul>
							</div>
						</div>

						{/* Premium Bottom Bar */}
						<div className="border-t border-white/10 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
							<div className="text-white/60">
								© 2024 NomadAI. Built with ❤️ for the future of travel.
							</div>
							<div className="flex items-center gap-8 text-white/60">
								<a href="/terms" className="hover:text-brand-400 transition-colors duration-300">Terms</a>
								<a href="/privacy" className="hover:text-brand-400 transition-colors duration-300">Privacy</a>
								<a href="https://www.paypal.com/paypalme/amalnair11/" target="_blank" className="hover:text-amber-400 transition-colors duration-300 font-medium">
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
						// Premium Analytics and tracking
						console.log("🚀 NomadAI 2.0 - Transform your travel experience with AI");
						`,
					}}
				/>
			</body>
		</html>
	)
}