import './globals.css'
import type { Metadata } from 'next'
import { Montserrat, Crimson_Text } from 'next/font/google'
import { Plane, Sparkles, Crown, MapPin, Diamond } from 'lucide-react'
import Navigation from '../components/Navigation'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })
const crimsonText = Crimson_Text({ subsets: ['latin'], weight: ['400','600','700'], display: 'swap' })

export const metadata: Metadata = {
	title: 'NomadAI — Your Intelligent Travel Companion',
	description: 'Experience intelligent travel planning with AI that learns, predicts, and optimizes every journey with modern elegance.',
	keywords: 'AI travel planning, intelligent travel, modern nomad, smart itinerary, travel companion, AI concierge',
	openGraph: {
		title: 'NomadAI — Your Intelligent Travel Companion',
		description: 'Experience intelligent travel planning with AI that learns, predicts, and optimizes every journey.',
		type: 'website',
		images: ['/og-image.png'],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'NomadAI — Your Intelligent Travel Companion',
		description: 'Experience intelligent travel planning with AI that learns, predicts, and optimizes every journey.',
	}
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={montserrat.className}>
			<body className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
				<Navigation />

				{/* Main Content */}
				<main className="min-h-screen">
					<div className="container py-8">
						{children}
					</div>
				</main>

				{/* Footer */}
				<footer className="glass border-t border-gray-700/50 mt-24">
					<div className="container py-16">
						<div className="grid md:grid-cols-4 gap-12">
							{/* Brand Column */}
							<div className="md:col-span-1">
								<div className="flex items-center gap-4 mb-6">
									<div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow">
										<Plane className="w-6 h-6 text-gray-900 transform rotate-45" />
									</div>
									<span className={`${crimsonText.className} text-xl font-bold text-gradient`}>NomadAI</span>
								</div>
								<p className="text-gray-300 mb-6 leading-relaxed">
									Your intelligent travel companion. Experience AI-powered travel planning that understands your preferences and creates personalized adventures.
								</p>
								<div className="flex gap-4">
									<a href="https://www.linkedin.com/in/amal080/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent-400 transition-colors duration-200 font-medium">
										LinkedIn
									</a>
									<a href="https://github.com/mythicavalon" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent-400 transition-colors duration-200 font-medium">
										GitHub
									</a>
								</div>
							</div>

							{/* Features Column */}
							<div>
								<h3 className="text-white font-semibold mb-6 text-lg">Features</h3>
								<ul className="space-y-3 text-gray-300">
									<li><a href="/chat" className="hover:text-accent-400 transition-colors duration-200">AI Travel Concierge</a></li>
									<li><a href="/" className="hover:text-accent-400 transition-colors duration-200">Smart Itineraries</a></li>
									<li><a href="/memories" className="hover:text-accent-400 transition-colors duration-200">Travel Memories</a></li>
									<li><a href="/pricing" className="hover:text-accent-400 transition-colors duration-200">Premium Access</a></li>
								</ul>
							</div>

							{/* Intelligence Column */}
							<div>
								<h3 className="text-white font-semibold mb-6 text-lg">Intelligence</h3>
								<ul className="space-y-3 text-gray-300">
									<li><a href="#" className="hover:text-accent-400 transition-colors duration-200">AI Learning</a></li>
									<li><a href="#" className="hover:text-accent-400 transition-colors duration-200">Real-time Insights</a></li>
									<li><a href="#" className="hover:text-accent-400 transition-colors duration-200">Smart Optimization</a></li>
									<li><a href="#" className="hover:text-accent-400 transition-colors duration-200">Community</a></li>
								</ul>
							</div>

							{/* Company Column */}
							<div>
								<h3 className="text-white font-semibold mb-6 text-lg">Company</h3>
								<ul className="space-y-3 text-gray-300">
									<li><a href="/about" className="hover:text-accent-400 transition-colors duration-200">About</a></li>
									<li><a href="/pricing" className="hover:text-accent-400 transition-colors duration-200">Pricing</a></li>
									<li><a href="/privacy" className="hover:text-accent-400 transition-colors duration-200">Privacy</a></li>
									<li><a href="/support" className="hover:text-accent-400 transition-colors duration-200">Support</a></li>
								</ul>
							</div>
						</div>

						{/* Bottom Bar */}
						<div className="border-t border-gray-700/50 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
							<div className="text-gray-400 text-sm">
								© 2024 NomadAI. Built with intelligence for modern travelers.
							</div>
							<div className="flex items-center gap-8 text-gray-400 text-sm">
								<a href="/terms" className="hover:text-accent-400 transition-colors duration-200 font-medium">Terms</a>
								<a href="/privacy" className="hover:text-accent-400 transition-colors duration-200 font-medium">Privacy</a>
								<a href="https://www.paypal.com/paypalme/amalnair11/" target="_blank" rel="noopener noreferrer" className="hover:text-info-400 transition-colors duration-200 font-semibold">
									Support Us
								</a>
							</div>
						</div>
					</div>
				</footer>
			</body>
		</html>
	)
}