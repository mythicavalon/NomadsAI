"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { 
  Plane, 
  MapPin, 
  Star, 
  Lightbulb, 
  Heart,
  ArrowLeft,
  Download,
  Share2,
  Clock,
  DollarSign,
  Globe,
  Sparkles
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import Link from "next/link";

interface TravelPlan {
  summary: string;
  itinerary: Array<{
    day: number;
    title?: string;
    theme?: string;
    activities: string[];
    highlights?: string[];
    cultural_insight?: string;
    local_secrets?: string;
    travel_tips?: string;
  }>;
  highlights: string[];
  estimated_budget: string;
  cultural_insights: string;
  local_recommendations: string;
  travel_tips: string;
  ai_provider: string;
  from_city: string;
  destination: string;
  total_days: number;
}

function ResultsPageContent() {
  const [travelPlan, setTravelPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchTravelPlan = async () => {
      try {
        const planId = searchParams.get('id');
        
        if (!planId) {
          setError("No travel plan found. Please start planning your journey.");
          setLoading(false);
          return;
        }

        const storedPlan = localStorage.getItem('travelPlanData');
        
        if (storedPlan) {
          try {
            const parsedPlan = JSON.parse(storedPlan);
            setTravelPlan(parsedPlan);
            setLoading(false);
            return;
          } catch (parseError) {
            console.error('Failed to parse stored plan:', parseError);
          }
        }

        setError("No travel plan found. Please start planning your journey.");
        setLoading(false);
      } catch (err) {
        setError("Failed to load your travel plan. Please try again.");
        setLoading(false);
      }
    };

    fetchTravelPlan();
  }, [searchParams]);

  const parseActivity = (activity: string) => {
    // Parse "9:00 AM - The Tower of London..." format
    const match = activity.match(/^(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*-\s*(.+)/i);
    if (match) {
      return {
        time: match[1].trim(),
        content: match[2].trim()
      };
    }
    
    // Fallback: just return the whole thing
    return {
      time: null,
      content: activity
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <Sparkles className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Crafting Your Journey</h2>
          <p className="text-slate-600 dark:text-slate-300">Creating your perfect travel experience...</p>
        </div>
      </div>
    );
  }

  if (error || !travelPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Plane className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Ready for Adventure?</h2>
          <p className="text-slate-600 mb-8">{error || "Start planning your perfect journey"}</p>
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600">
              <Sparkles className="w-5 h-5 mr-2" />
              Start Planning
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      {/* Luxury Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }}></div>
        
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2 hover:gap-3 transition-all duration-300 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-blue-600 transition-all">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-blue-600 transition-all">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full mb-6">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">{travelPlan.from_city}</span>
              <div className="w-8 h-px bg-white/50"></div>
              <Plane className="w-5 h-5" />
              <div className="w-8 h-px bg-white/50"></div>
              <span className="text-sm font-medium">{travelPlan.destination}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{travelPlan.summary}</h1>
            
            <div className="flex items-center justify-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">{travelPlan.total_days} Days</span>
              </div>
              <div className="w-1 h-1 bg-white/50 rounded-full"></div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm capitalize">{travelPlan.estimated_budget}</span>
              </div>
              <div className="w-1 h-1 bg-white/50 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm">AI Curated</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Itinerary - Takes 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your Itinerary</h2>
              <p className="text-slate-600 dark:text-slate-400">Powered by {travelPlan.ai_provider}</p>
            </div>
            
            {travelPlan.itinerary.map((day, index) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-xl bg-white dark:bg-slate-800 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                  <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-xl border-2 border-white/30">
                        {day.day}
                      </div>
                      <div className="text-white">
                        <h3 className="text-2xl font-bold">Day {day.day}</h3>
                        <p className="text-blue-100">{day.title || day.theme || `Exploring ${travelPlan.destination}`}</p>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {day.activities && day.activities.length > 0 ? (
                        day.activities.map((activity, actIndex) => {
                          const { time, content } = parseActivity(activity);
                          
                          return (
                            <div key={actIndex} className="group">
                              <div className="flex gap-4 p-5 bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-700 dark:to-slate-700/50 rounded-2xl hover:shadow-md transition-all duration-300 border border-slate-100 dark:border-slate-600">
                                {time && (
                                  <div className="flex-shrink-0">
                                    <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap shadow-sm">
                                      {time}
                                    </div>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-slate-800 dark:text-slate-100 leading-relaxed text-base">
                                    {content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12 text-slate-400">
                          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Free day to explore at your own pace</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <span>Highlights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {travelPlan.highlights && travelPlan.highlights.length > 0 ? (
                      travelPlan.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Star className="w-3 h-3 text-white fill-current" />
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{highlight}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-center py-4 text-slate-500">
                        <p className="text-sm">Discover as you go!</p>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Cultural Insights */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <span>Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {travelPlan.cultural_insights}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Local Secrets */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span>Local Secrets</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {travelPlan.local_recommendations}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Travel Tips */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <span>Travel Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {travelPlan.travel_tips}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* CTA Footer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/5"></div>
            <CardContent className="py-12 px-8 relative">
              <div className="text-center max-w-3xl mx-auto">
                <Sparkles className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-3xl font-bold mb-3">Your Journey Awaits</h3>
                <p className="text-blue-100 mb-8 text-lg">
                  Ready to turn this plan into unforgettable memories?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-white/50 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-blue-600">
                    <Share2 className="w-5 h-5 mr-2" />
                    Share with Friends
                  </Button>
                  <Link href="/">
                    <Button size="lg" variant="outline" className="border-2 border-white/50 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-blue-600">
                      <Plane className="w-5 h-5 mr-2" />
                      Plan Another Trip
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold">Loading your journey...</h2>
        </div>
      </div>
    }>
      <ResultsPageContent />
    </Suspense>
  );
}
