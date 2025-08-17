"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Globe, 
  Shield, 
  Zap, 
  MapPin, 
  Calendar, 
  Users, 
  Crown, 
  Plane, 
  ArrowRight, 
  CheckCircle,
  Star,
  Building2,
  Compass,
  Sparkles
} from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type TravelPlan = {
  from: string;
  to: string;
  departureDate: string;
  returnDate: string;
  travelers: number;
  budget: string;
  interests: string[];
};

const WORLD_CITIES = [
  { name: "New York", country: "United States", code: "NYC", category: "business" },
  { name: "London", country: "United Kingdom", code: "LON", category: "business" },
  { name: "Tokyo", country: "Japan", code: "TYO", category: "business" },
  { name: "Singapore", country: "Singapore", code: "SIN", category: "business" },
  { name: "Dubai", country: "UAE", code: "DXB", category: "business" },
  { name: "Paris", country: "France", code: "PAR", category: "culture" },
  { name: "Barcelona", country: "Spain", code: "BCN", category: "culture" },
  { name: "Rome", country: "Italy", code: "ROM", category: "culture" },
  { name: "Bangkok", country: "Thailand", code: "BKK", category: "culture" },
  { name: "Seoul", country: "South Korea", code: "SEL", category: "tech" },
  { name: "Bali", country: "Indonesia", code: "DPS", category: "leisure" },
  { name: "Cape Town", country: "South Africa", code: "CPT", category: "leisure" }
];

const INTERESTS = [
  { id: "business", label: "Business & Corporate", icon: Building2 },
  { id: "culture", label: "Culture & Heritage", icon: Compass },
  { id: "leisure", label: "Leisure & Relaxation", icon: Star },
  { id: "adventure", label: "Adventure & Exploration", icon: Globe },
  { id: "food", label: "Culinary Excellence", icon: Crown },
  { id: "tech", label: "Technology & Innovation", icon: Zap }
];

const FEATURES = [
  {
    icon: Globe,
    title: "AI-Powered Planning",
    description: "Advanced NVIDIA GPT-OSS-120B model provides intelligent, context-aware travel recommendations tailored to your preferences."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security and compliance for business travel planning with data protection and privacy controls."
  },
  {
    icon: Zap,
    title: "Real-time Intelligence",
    description: "Live updates on weather, events, local insights, and market conditions for informed travel decisions."
  }
];

export default function HomePage() {
  const [travelPlan, setTravelPlan] = useState<TravelPlan>({
    from: "",
    to: "",
    departureDate: "",
    returnDate: "",
    travelers: 1,
    budget: "premium",
    interests: ["business", "culture"]
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleInterestToggle = (interestId: string) => {
    setTravelPlan(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/itineraries/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_city: travelPlan.from,
          destination: travelPlan.to,
          days: Math.ceil((new Date(travelPlan.returnDate).getTime() - new Date(travelPlan.departureDate).getTime()) / (1000 * 60 * 60 * 24)),
          budget: travelPlan.budget,
          interests: travelPlan.interests,
          travelers: travelPlan.travelers,
          departure_date: travelPlan.departureDate,
          return_date: travelPlan.returnDate
        })
      });
      
      if (response.ok) {
        // Handle success
        console.log('Travel plan submitted successfully');
      }
    } catch (error) {
      console.error('Error submitting travel plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return travelPlan.from && travelPlan.to;
      case 2:
        return travelPlan.departureDate && travelPlan.returnDate;
      case 3:
        return travelPlan.travelers > 0;
      case 4:
        return travelPlan.interests.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 bg-slate-800/20"></div>
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-hero text-white mb-6">
                AI-Powered Travel Intelligence
              </h1>
              <p className="text-hero-subtitle text-slate-300 max-w-3xl mx-auto">
                Enterprise-grade travel planning powered by NVIDIA's advanced AI. 
                Get intelligent recommendations that understand your professional and personal travel needs.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="xl"
                variant="gradient"
                onClick={() => document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' })}
                className="group"
              >
                Start Planning
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Floating Globe Animation */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 right-10 w-32 h-32 opacity-10 hidden lg:block"
            >
              <Globe className="w-full h-full text-blue-400" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-section-title text-slate-900 dark:text-white mb-4">
              Why Choose NomadsAI?
            </h2>
            <p className="text-section-subtitle text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Professional travel planning with cutting-edge AI technology and enterprise-grade security
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full card-hover border-0 shadow-lg bg-white dark:bg-slate-800">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-slate-900 dark:text-white">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-slate-600 dark:text-slate-300 text-center leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Travel Planner Wizard */}
      <section id="planner" className="py-24 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-section-title text-slate-900 dark:text-white mb-4">
              Plan Your Journey
            </h2>
            <p className="text-section-subtitle text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Complete travel planning with AI-powered intelligence and professional expertise
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-6">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step <= currentStep 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                      </div>
                      {step < 4 && (
                        <div className={`w-16 h-1 mx-2 ${
                          step < currentStep ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {currentStep === 1 && "Choose Your Destinations"}
                  {currentStep === 2 && "Select Travel Dates"}
                  {currentStep === 3 && "Traveler Details"}
                  {currentStep === 4 && "Preferences & Interests"}
                </h3>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Step 1: Destinations */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid md:grid-cols-2 gap-6"
                  >
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Departure City
                      </label>
                      <input
                        type="text"
                        placeholder="Where are you leaving from?"
                        value={travelPlan.from}
                        onChange={(e) => setTravelPlan(prev => ({ ...prev, from: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Destination City
                      </label>
                      <input
                        type="text"
                        placeholder="Where are you going?"
                        value={travelPlan.to}
                        onChange={(e) => setTravelPlan(prev => ({ ...prev, to: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Dates */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid md:grid-cols-2 gap-6"
                  >
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Departure Date
                      </label>
                      <input
                        type="date"
                        value={travelPlan.departureDate}
                        onChange={(e) => setTravelPlan(prev => ({ ...prev, departureDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Return Date
                      </label>
                      <input
                        type="date"
                        value={travelPlan.returnDate}
                        onChange={(e) => setTravelPlan(prev => ({ ...prev, returnDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Travelers */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Number of Travelers
                      </label>
                      <select
                        value={travelPlan.travelers}
                        onChange={(e) => setTravelPlan(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'person' : 'people'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Experience Level
                      </label>
                      <select
                        value={travelPlan.budget}
                        onChange={(e) => setTravelPlan(prev => ({ ...prev, budget: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="essential">Essential ($50-100/day)</option>
                        <option value="premium">Premium ($150-300/day)</option>
                        <option value="luxury">Luxury ($400+/day)</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Interests */}
                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Travel Interests (Select all that apply)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {INTERESTS.map(interest => {
                          const IconComponent = interest.icon;
                          return (
                            <button
                              key={interest.id}
                              onClick={() => handleInterestToggle(interest.id)}
                              className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                                travelPlan.interests.includes(interest.id)
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <IconComponent className="w-5 h-5" />
                              <span className="text-sm font-medium">{interest.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Previous
                  </Button>
                  
                  {currentStep < 4 ? (
                    <Button
                      onClick={handleNextStep}
                      disabled={!isStepValid()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      loading={loading}
                      disabled={!isStepValid()}
                      className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white"
                    >
                      <Plane className="mr-2 h-5 w-5" />
                      Plan My Journey
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-teal-500">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Travel Planning?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of professionals who trust NomadsAI for intelligent, 
              secure, and personalized travel recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="xl"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Get Started Free
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">NomadsAI</h3>
              <p className="text-sm leading-relaxed">
                AI-powered travel intelligence for the modern professional.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 NomadsAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}