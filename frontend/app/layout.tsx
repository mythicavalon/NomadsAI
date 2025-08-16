import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Nomad AI — Travel Companion',
	description: 'Build smarter itineraries, discover hidden gems, and catch real-time travel signals with GPT-OSS.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<header className="border-b border-white/10">
					<div className="container-max py-4 flex items-center justify-between">
						<div className="text-xl font-semibold">Nomad AI</div>
						<nav className="space-x-4 text-sm">
							<a href="/" className="hover:underline">Home</a>
							<a href="/memories" className="hover:underline">Memory Journal</a>
							<a href="/digest" className="hover:underline">Email Digest</a>
						</nav>
					</div>
				</header>
				<main className="container-max py-8">
					{children}
				</main>
				<footer className="border-t border-white/10">
					<div className="container-max py-6 text-xs text-white/60">
						Built by mythicavalon • Sponsor: <a className="underline" href="https://www.paypal.com/paypalme/amalnair11/">PayPal</a> • <a className="underline" href="https://www.linkedin.com/in/amal080/">LinkedIn</a>
					</div>
				</footer>
			</body>
		</html>
	)
}