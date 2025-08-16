"use client";

import { useState } from 'react';
import { Check, Crown, Zap, Users, ArrowRight, Star } from 'lucide-react';

const tiers = [
	{
		name: "Smart Traveler",
		subtitle: "Perfect for occasional trips",
		price: "Free",
		period: "forever",
		description: "Get started with AI-powered travel planning",
		features: [
			"3 AI itineraries per month",
			"Basic chat with AI companion", 
			"Community access",
			"Email digest",
			"7-day memory retention",
			"Standard support"
		],
		limitations: [
			"Limited real-time updates",
			"No advanced tools",
			"Basic personalization"
		],
		cta: "Get Started Free",
		popular: false,
		gradient: "from-slate-600 to-slate-700"
	},
	{
		name: "AI Travel Pro",
		subtitle: "For serious travelers and nomads",
		price: "$19",
		period: "per month",
		description: "Unlock the full power of AI travel intelligence",
		features: [
			"Unlimited AI itineraries",
			"Advanced AI with memory",
			"Real-time price alerts",
			"Budget optimization tools",
			"AR navigation features",
			"Voice chat interface",
			"1-year memory retention",
			"Priority support",
			"Offline capabilities",
			"Custom travel preferences"
		],
		limitations: [],
		cta: "Start Pro Trial",
		popular: true,
		gradient: "from-emerald-500 to-cyan-500",
		savings: "Save 30% vs booking separately"
	},
	{
		name: "Corporate Travel AI",
		subtitle: "For teams and enterprises", 
		price: "$99",
		period: "per user/month",
		description: "Enterprise-grade travel intelligence and management",
		features: [
			"Everything in Pro",
			"Team travel coordination",
			"Policy compliance tracking",
			"Advanced analytics dashboard",
			"Custom integrations",
			"Dedicated account manager",
			"SSO authentication",
			"Unlimited memory retention",
			"API access",
			"White-label options"
		],
		limitations: [],
		cta: "Contact Sales",
		popular: false,
		gradient: "from-purple-500 to-pink-500"
	}
];

const faqs = [
	{
		question: "How does the AI memory work?",
		answer: "Our AI learns from every interaction, remembering your preferences, travel patterns, budget constraints, and favorite destinations. The longer you use NomadAI, the more personalized and accurate the recommendations become."
	},
	{
		question: "Can I cancel my subscription anytime?",
		answer: "Yes, you can cancel your subscription at any time. You'll continue to have access to Pro features until the end of your billing period, then automatically switch to the Free tier."
	},
	{
		question: "What makes NomadAI different from other travel apps?",
		answer: "NomadAI is the only travel platform with true AI intelligence that learns and adapts to your preferences. We provide real-time optimization, predictive recommendations, and a personalized travel companion that gets smarter over time."
	},
	{
		question: "Do you offer team discounts?",
		answer: "Yes! Teams of 10+ users get 20% off, and we offer custom pricing for larger enterprises. Contact our sales team for volume discounts."
	},
	{
		question: "Is my data secure?",
		answer: "Absolutely. We use enterprise-grade encryption and never sell your personal data. Your travel preferences and history are used solely to improve your experience with NomadAI."
	}
];

export default function PricingPage() {
	const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
	const [selectedTier, setSelectedTier] = useState<string | null>(null);

	const getAnnualPrice = (monthlyPrice: string) => {
		if (monthlyPrice === "Free") return "Free";
		const monthly = parseInt(monthlyPrice.replace('$', ''));
		const annual = Math.round(monthly * 12 * 0.8); // 20% discount
		return `$${annual}`;
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
			{/* Hero Section */}
			<div className="max-w-7xl mx-auto px-4 py-16">
				<div className="text-center mb-16">
					<h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
						Choose Your
						<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> AI Travel </span>
						Experience
					</h1>
					<p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
						From casual travelers to digital nomad professionals, we have the perfect AI companion for your journey.
					</p>
					
					{/* Billing Toggle */}
					<div className="flex items-center justify-center gap-4 mb-12">
						<span className={`text-sm ${billingPeriod === 'monthly' ? 'text-white' : 'text-white/60'}`}>
							Monthly
						</span>
						<button
							onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
							className="relative w-14 h-7 bg-white/20 rounded-full transition-all"
						>
							<div className={`absolute top-0.5 w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-transform ${
								billingPeriod === 'annual' ? 'translate-x-7' : 'translate-x-0.5'
							}`} />
						</button>
						<span className={`text-sm ${billingPeriod === 'annual' ? 'text-white' : 'text-white/60'}`}>
							Annual
						</span>
						{billingPeriod === 'annual' && (
							<span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs">
								Save 20%
							</span>
						)}
					</div>
				</div>

				{/* Pricing Cards */}
				<div className="grid md:grid-cols-3 gap-8 mb-20">
					{tiers.map((tier, index) => (
						<div
							key={tier.name}
							className={`relative rounded-3xl border backdrop-blur-lg transition-all duration-300 ${
								tier.popular 
									? 'border-emerald-400/50 bg-white/10 scale-105 shadow-2xl shadow-emerald-500/25' 
									: 'border-white/20 bg-white/5 hover:bg-white/10'
							}`}
							onMouseEnter={() => setSelectedTier(tier.name)}
							onMouseLeave={() => setSelectedTier(null)}
						>
							{tier.popular && (
								<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
									<span className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
										<Star className="w-4 h-4" />
										Most Popular
									</span>
								</div>
							)}

							<div className="p-8">
								{/* Header */}
								<div className="text-center mb-8">
									<div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${tier.gradient} flex items-center justify-center`}>
										{index === 0 && <Zap className="w-8 h-8 text-white" />}
										{index === 1 && <Crown className="w-8 h-8 text-white" />}
										{index === 2 && <Users className="w-8 h-8 text-white" />}
									</div>
									<h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
									<p className="text-white/60 text-sm mb-4">{tier.subtitle}</p>
									<div className="mb-4">
										<span className="text-4xl font-bold text-white">
											{billingPeriod === 'annual' ? getAnnualPrice(tier.price) : tier.price}
										</span>
										{tier.price !== "Free" && (
											<span className="text-white/60 ml-2">
												{billingPeriod === 'annual' ? 'per year' : tier.period}
											</span>
										)}
									</div>
									<p className="text-white/70 text-sm">{tier.description}</p>
									{tier.savings && (
										<div className="mt-2 text-emerald-400 text-sm font-semibold">
											{tier.savings}
										</div>
									)}
								</div>

								{/* Features */}
								<div className="space-y-4 mb-8">
									{tier.features.map((feature, featureIndex) => (
										<div key={featureIndex} className="flex items-start gap-3">
											<Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
											<span className="text-white/80 text-sm">{feature}</span>
										</div>
									))}
									{tier.limitations.map((limitation, limitIndex) => (
										<div key={limitIndex} className="flex items-start gap-3 opacity-60">
											<div className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center">
												<div className="w-1 h-1 bg-white/60 rounded-full" />
											</div>
											<span className="text-white/60 text-sm">{limitation}</span>
										</div>
									))}
								</div>

								{/* CTA Button */}
								<button className={`w-full py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
									tier.popular
										? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg'
										: 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
								}`}>
									{tier.cta}
									<ArrowRight className="w-4 h-4" />
								</button>
							</div>
						</div>
					))}
				</div>

				{/* Feature Comparison */}
				<div className="mb-20">
					<h2 className="text-3xl font-bold text-white text-center mb-12">What's Included</h2>
					<div className="bg-white/5 backdrop-blur rounded-3xl border border-white/10 overflow-hidden">
						<div className="p-8">
							<div className="grid grid-cols-4 gap-8 text-center">
								<div>
									<h3 className="text-white font-semibold mb-4">Features</h3>
								</div>
								<div>
									<h3 className="text-white font-semibold mb-4">Free</h3>
								</div>
								<div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl p-4">
									<h3 className="text-emerald-400 font-semibold mb-4">Pro</h3>
								</div>
								<div>
									<h3 className="text-white font-semibold mb-4">Enterprise</h3>
								</div>
							</div>
							
							{/* Feature rows would go here */}
							<div className="space-y-4 mt-8">
								{[
									["AI Memory & Learning", "7 days", "1 year", "Unlimited"],
									["Real-time Updates", "Limited", "Full", "Full + API"],
									["Advanced Tools", "No", "Yes", "Yes + Custom"],
									["Support Level", "Community", "Priority", "Dedicated"],
									["Team Features", "No", "Personal", "Full Team"]
								].map(([feature, free, pro, enterprise], index) => (
									<div key={index} className="grid grid-cols-4 gap-8 py-4 border-b border-white/10 text-center">
										<div className="text-white/80 text-left">{feature}</div>
										<div className="text-white/60">{free}</div>
										<div className="text-emerald-400 font-semibold">{pro}</div>
										<div className="text-white/80">{enterprise}</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Social Proof */}
				<div className="text-center mb-20">
					<h2 className="text-3xl font-bold text-white mb-8">Trusted by Travelers Worldwide</h2>
					<div className="grid md:grid-cols-3 gap-8">
						{[
							{
								stat: "50,000+",
								label: "Active Users",
								description: "Growing community of smart travelers"
							},
							{
								stat: "1M+",
								label: "Itineraries Created",
								description: "AI-powered travel plans generated"
							},
							{
								stat: "30%",
								label: "Average Savings",
								description: "Cost reduction on travel bookings"
							}
						].map((item, index) => (
							<div key={index} className="text-center">
								<div className="text-4xl font-bold text-emerald-400 mb-2">{item.stat}</div>
								<div className="text-xl font-semibold text-white mb-2">{item.label}</div>
								<div className="text-white/60">{item.description}</div>
							</div>
						))}
					</div>
				</div>

				{/* FAQ Section */}
				<div>
					<h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
					<div className="max-w-4xl mx-auto space-y-6">
						{faqs.map((faq, index) => (
							<div key={index} className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
								<h3 className="text-xl font-semibold text-white mb-4">{faq.question}</h3>
								<p className="text-white/70 leading-relaxed">{faq.answer}</p>
							</div>
						))}
					</div>
				</div>

				{/* Final CTA */}
				<div className="text-center mt-20">
					<h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Travel?</h2>
					<p className="text-xl text-white/70 mb-8">Join thousands of travelers who've upgraded their journey with AI.</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-2xl font-semibold transition-all shadow-lg">
							Start Free Trial
						</button>
						<button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-semibold border border-white/20 transition-all">
							Schedule Demo
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}