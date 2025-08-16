import './globals.css'
import type { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })
const merri = Merriweather({ subsets: ['latin'], weight: ['300','400','700'], display: 'swap' })

export const metadata: Metadata = {
	title: 'NomadAI — Your Frontier Travel Companion',
	description: 'NomadAI helps you plan smarter trips with elegant itineraries, signals, and tools.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={inter.className}>
			<body className="min-h-screen text-[var(--text-primary)]">
				<header className="border-b border-white/10">
					<div className="container-max py-10 text-center">
						<h1 className={`${merri.className} text-3xl md:text-4xl font-semibold`}>NomadAI — Your Frontier Travel Companion</h1>
						<p className="mt-2 text-white/80">Plan journeys, uncover hidden gems, and travel confidently with AI.</p>
					</div>
					<div className="container-max pb-4">
						<ul className="flex items-center justify-center gap-3 text-sm">
							<li><a href="/chat" className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1 hover:bg-white/10 hover:text-[var(--accent)]">Chat</a></li>
							<li><a href="/" className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1 hover:bg-white/10 hover:text-[var(--accent)]">Itinerary</a></li>
							<li><a href="/tools" className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1 hover:bg-white/10 hover:text-[var(--accent)]">Nomad Tools</a></li>
						</ul>
					</div>
				</header>
				<main className="container-max py-8">
					{children}
				</main>
				<footer className="border-t border-white/10">
					<div className="container-max py-6 text-xs text-white/80">
						Built by mythicavalon • Sponsor: <a className="underline" href="https://www.paypal.com/paypalme/amalnair11/">PayPal</a> • <a className="underline" href="https://www.linkedin.com/in/amal080/">LinkedIn</a>
					</div>
				</footer>
			</body>
		</html>
	)
}