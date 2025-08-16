import './globals.css'
import type { Metadata } from 'next'
import { Montserrat, Crimson_Text } from 'next/font/google'
import { Plane, Sparkles, Crown, MapPin, Diamond } from 'lucide-react'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })
const crimsonText = Crimson_Text({ subsets: ['latin'], weight: ['400','600','700'], display: 'swap' })

export const metadata: Metadata = {
	title: 'NomadAI — Your Sophisticated Travel Companion',
	description: 'Experience the pinnacle of luxury travel planning with AI that learns, predicts, and optimizes every journey with sophisticated elegance.',
	keywords: 'luxury travel, AI travel planning, sophisticated travel, premium nomad, intelligent itinerary, travel companion',
	openGraph: {
		title: 'NomadAI — Your Sophisticated Travel Companion',
		description: 'Experience the pinnacle of luxury travel planning with AI that learns, predicts, and optimizes every journey.',
		type: 'website',
		images: ['/og-image.png'],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'NomadAI — Your Sophisticated Travel Companion',
		description: 'Experience the pinnacle of luxury travel planning with AI that learns, predicts, and optimizes every journey.',
	}
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={montserrat.className}>
			<body className="min-h-screen bg-sophisticated-dark text-white overflow-x-hidden">
				{/* Sophisticated Navigation Header */}
				<header className="glass-luxury sticky top-0 z-50 border-b border-gold-500/20">
					<div className="container-max">
						<div className="flex items-center justify-between py-5">
							{/* Luxury Logo and Brand */}
							<div className="flex items-center gap-5">
								<div className="relative">
									<div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold animate-gold-glow">
										<Plane className="w-8 h-8 text-black transform rotate-45" />
									</div>
									<div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-magenta-gradient flex items-center justify-center shadow-magenta">
										<Diamond className="w-3 h-3 text-white" />
									</div>
								</div>
								<div>
									<h1 className={`${crimsonText.className} text-3xl font-bold text-gradient-gold`}>NomadAI</h1>
									<p className="text-xs text-gold-500 font-medium tracking-widest uppercase">Sophisticated Travel Intelligence</p>
								</div>
							</div>

							{/* Sophisticated Navigation */}
							<nav className="hidden md:flex items-center gap-10">
								<a href="/" className="group flex items-center gap-2 text-silver-400 hover:text-gold-500 transition-all duration-300">
									<span className="relative font-medium">
										Home
										<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold-gradient group-hover:w-full transition-all duration-300"></span>
									</span>
								</a>
								<a href="/chat" className="group flex items-center gap-3 text-silver-400 hover:text-gold-500 transition-all duration-300">
									<Sparkles className="w-5 h-5 text-gold-500" />
									<span className="relative font-medium">
										AI Concierge
										<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold-gradient group-hover:w-full transition-all duration-300"></span>
									</span>
								</a>
								<a href="/memories" className="group flex items-center gap-2 text-silver-400 hover:text-gold-500 transition-all duration-300">
									<span className="relative font-medium">
										Memories
										<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold-gradient group-hover:w-full transition-all duration-300"></span>
									</span>
								</a>
							</nav>

							{/* Luxury CTA */}
							<div className="flex items-center gap-5">
								<a 
									href="/pricing" 
									className="hidden md:flex items-center gap-3 px-8 py-4 bg-magenta-gradient hover:shadow-glow-magenta text-white rounded-lg transition-all duration-300 transform hover:-translate-y-1 font-semibold tracking-wide uppercase text-sm"
								>
									<Crown className="w-5 h-5" />
									Elite Access
								</a>
								<button className="md:hidden p-4 text-silver-400 hover:text-gold-500 glass-dark rounded-xl transition-all duration-300">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
									</svg>
								</button>
							</div>
						</div>
					</div>
				</header>

				{/* Main Content with Luxury Spacing */}
				<main className="min-h-screen">
					<div className="container-max py-10">
						{children}
					</div>
				</main>

				{/* Sophisticated Footer */}
				<footer className="glass-luxury border-t border-gold-500/20 mt-24">
					<div className="container-max py-20">
						<div className="grid md:grid-cols-4 gap-16">
							{/* Luxury Brand Column */}
							<div className="md:col-span-1">
								<div className="flex items-center gap-5 mb-8">
									<div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold">
										<Plane className="w-7 h-7 text-black transform rotate-45" />
									</div>
									<span className={`${crimsonText.className} text-2xl font-bold text-gradient-gold`}>NomadAI</span>
								</div>
								<p className="text-silver-300 mb-8 leading-relaxed text-lg">
									The pinnacle of sophisticated travel intelligence. Experience luxury travel planning with AI that understands elegance, refinement, and exceptional taste.
								</p>
								<div className="flex gap-6">
									<a href="https://www.linkedin.com/in/amal080/" target="_blank" className="text-silver-500 hover:text-gold-500 transition-colors duration-300 font-medium">
										LinkedIn
									</a>
									<a href="https://github.com/mythicavalon" target="_blank" className="text-silver-500 hover:text-gold-500 transition-colors duration-300 font-medium">
										GitHub
									</a>
								</div>
							</div>

							{/* Experience Column */}
							<div>
								<h3 className="text-white font-semibold mb-8 text-xl tracking-wide">Experience</h3>
								<ul className="space-y-4 text-silver-300">
									<li><a href="/chat" className="hover:text-gold-500 transition-colors duration-300">AI Travel Concierge</a></li>
									<li><a href="/" className="hover:text-gold-500 transition-colors duration-300">Luxury Itineraries</a></li>
									<li><a href="/memories" className="hover:text-gold-500 transition-colors duration-300">Elite Memories</a></li>
									<li><a href="/pricing" className="hover:text-gold-500 transition-colors duration-300">Premium Access</a></li>
								</ul>
							</div>

							{/* Intelligence Column */}
							<div>
								<h3 className="text-white font-semibold mb-8 text-xl tracking-wide">Intelligence</h3>
								<ul className="space-y-4 text-silver-300">
									<li><a href="#" className="hover:text-gold-500 transition-colors duration-300">AI Memory & Learning</a></li>
									<li><a href="#" className="hover:text-gold-500 transition-colors duration-300">Real-time Insights</a></li>
									<li><a href="#" className="hover:text-gold-500 transition-colors duration-300">Luxury Optimization</a></li>
									<li><a href="#" className="hover:text-gold-500 transition-colors duration-300">Elite Community</a></li>
								</ul>
							</div>

							{/* Prestige Column */}
							<div>
								<h3 className="text-white font-semibold mb-8 text-xl tracking-wide">Prestige</h3>
								<ul className="space-y-4 text-silver-300">
									<li><a href="/about" className="hover:text-gold-500 transition-colors duration-300">Our Story</a></li>
									<li><a href="/pricing" className="hover:text-gold-500 transition-colors duration-300">Membership</a></li>
									<li><a href="/privacy" className="hover:text-gold-500 transition-colors duration-300">Privacy</a></li>
									<li><a href="/support" className="hover:text-gold-500 transition-colors duration-300">Concierge</a></li>
								</ul>
							</div>
						</div>

						{/* Luxury Bottom Bar */}
						<div className="border-t border-gold-500/20 pt-10 mt-16 flex flex-col md:flex-row justify-between items-center gap-8">
							<div className="text-silver-400 text-lg">
								© 2024 NomadAI. Crafted with sophistication for discerning travelers.
							</div>
							<div className="flex items-center gap-10 text-silver-400">
								<a href="/terms" className="hover:text-gold-500 transition-colors duration-300 font-medium">Terms</a>
								<a href="/privacy" className="hover:text-gold-500 transition-colors duration-300 font-medium">Privacy</a>
								<a href="https://www.paypal.com/paypalme/amalnair11/" target="_blank" className="hover:text-magenta-400 transition-colors duration-300 font-semibold">
									Support Excellence
								</a>
							</div>
						</div>
					</div>
				</footer>

				{/* Sophisticated Scripts */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
						// Sophisticated Analytics and tracking
						console.log("✨ NomadAI 2.0 - Sophisticated Travel Intelligence");
						`,
					}}
				/>
			</body>
		</html>
	)
}