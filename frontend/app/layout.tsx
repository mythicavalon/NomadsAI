import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
	title: 'Nomad AI — Travel Companion',
	description: 'Build smarter itineraries, discover hidden gems, and catch real-time travel signals with GPT-OSS.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={inter.className}>
			<body className="min-h-screen bg-gradient-to-br from-sky-400/20 via-sky-500/10 to-orange-300/20 text-slate-100">
				<header className="border-b border-white/10 backdrop-blur">
					<div className="container-max py-4 flex items-center justify-between">
						<div className="text-xl font-semibold">Nomad AI</div>
						<nav className="space-x-4 text-sm">
							<a href="/" className="hover:underline">Home</a>
							<a href="/memories" className="hover:underline">Memory Journal</a>
							<a href="/digest" className="hover:underline">Email Digest</a>
							<a href="/chat" className="hover:underline">Chat</a>
							<a href="/settings" className="hover:underline">Settings</a>
						</nav>
					</div>
					<div className="container-max pb-3">
						<ul className="flex gap-2 text-xs">
							<li><a href="/chat" className="inline-block rounded-full border border-white/15 bg-white/10 px-3 py-1 hover:bg-white/15">Chat</a></li>
							<li><a href="/" className="inline-block rounded-full border border-white/15 bg-white/10 px-3 py-1 hover:bg-white/15">Itinerary</a></li>
							<li><a href="/tools" className="inline-block rounded-full border border-white/15 bg-white/10 px-3 py-1 hover:bg-white/15">Nomad Tools</a></li>
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