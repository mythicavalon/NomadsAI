"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { 
  Plane, 
  Calendar, 
  Users, 
  MapPin, 
  Star, 
  Lightbulb, 
  Heart,
  ArrowLeft,
  Download,
  Share2
} from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import Link from "next/link";

interface TravelPlan {
  summary: string;
  itinerary: Array<{
    day: number;
    summary: string;
    activities: Array<string | {
      time: string;
      title: string;
      description: string;
      category?: string;
    }>;
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
        // Get the plan ID from URL params
        const planId = searchParams.get('id');
        
        if (!planId) {
          setError("No travel plan found. Please start planning your journey.");
          setLoading(false);
          return;
        }

        // Try to get travel plan from localStorage first
        const storedPlan = localStorage.getItem('travelPlanData');
        
        if (storedPlan) {
          try {
            const parsedPlan = JSON.parse(storedPlan);
            console.log('🔍 DEBUG: Parsed travel plan from localStorage:', parsedPlan);
            console.log('🔍 DEBUG: Plan structure:', {
              summary: parsedPlan.summary,
              itinerary: parsedPlan.itinerary,
              highlights: parsedPlan.highlights,
              cultural_insights: parsedPlan.cultural_insights,
              local_recommendations: parsedPlan.local_recommendations,
              travel_tips: parsedPlan.travel_tips
            });
            setTravelPlan(parsedPlan);
            setLoading(false);
            return;
          } catch (parseError) {
            console.error('Failed to parse stored plan:', parseError);
          }
        }

        // If no stored plan, show error
        setError("No travel plan found. Please start planning your journey.");
        setLoading(false);
      } catch (err) {
        setError("Failed to load your travel plan. Please try again.");
        setLoading(false);
      }
    };

    fetchTravelPlan();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-foreground">Crafting Your Perfect Journey...</h2>
          <p className="text-muted-foreground mt-2">Our AI is analyzing your preferences and creating a personalized travel plan</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Oops! Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!travelPlan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Planning</span>
            </Link>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Journey Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <span>{travelPlan.from_city}</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                    <span className="text-blue-600 font-semibold">{travelPlan.destination}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {travelPlan.total_days} days • {travelPlan.estimated_budget}
                  </div>
                </div>
              </div>
              <CardTitle className="text-3xl mb-2">{travelPlan.summary}</CardTitle>
              <CardDescription className="text-lg">
                Powered by {travelPlan.ai_provider} • Personalized for your interests
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Itinerary */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-semibold text-foreground mb-6">Your Daily Itinerary</h2>
              
              {travelPlan.itinerary.map((day, index) => {
                console.log(`🔍 DEBUG: Rendering day ${day.day}:`, day);
                return (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    className="mb-6"
                  >
                    <Card className="border-0 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {day.day}
                          </div>
                          <div>
                            <CardTitle className="text-xl">Day {day.day}</CardTitle>
                            <CardDescription className="text-base">{day.summary}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {day.activities && day.activities.length > 0 ? (
                            day.activities.map((activity, actIndex) => {
                              console.log(`🔍 DEBUG: Rendering activity ${actIndex}:`, activity);
                              
                              // Parse activity data - handle both string and object formats
                              let time = '';
                              let title = '';
                              let description = '';
                              let category = '';
                              
                              if (typeof activity === 'string') {
                                // Parse string format: "09:00: Activity Name"
                                const colonIndex = activity.indexOf(':');
                                if (colonIndex !== -1) {
                                  time = activity.substring(0, colonIndex).trim();
                                  title = activity.substring(colonIndex + 1).trim();
                                  description = `Experience ${title.toLowerCase()} in ${travelPlan.destination}`;
                                  category = 'exploration';
                                } else {
                                  title = activity;
                                  time = '09:00';
                                  description = `Enjoy ${activity.toLowerCase()} in ${travelPlan.destination}`;
                                  category = 'activity';
                                }
                              } else if (typeof activity === 'object' && activity !== null && 'time' in activity) {
                                // Handle object format with time, title, description, category
                                const activityObj = activity as { time: string; title: string; description: string; category?: string };
                                time = activityObj.time || '09:00';
                                title = activityObj.title || 'Local Activity';
                                description = activityObj.description || `Experience local culture in ${travelPlan.destination}`;
                                category = activityObj.category || 'exploration';
                              } else {
                                // Fallback for unexpected data types
                                time = '09:00';
                                title = 'Local Activity';
                                description = `Experience local culture in ${travelPlan.destination}`;
                                category = 'exploration';
                              }
                              
                              console.log(`🔍 DEBUG: Parsed activity ${actIndex}:`, { time, title, description, category });
                              
                              return (
                                <div key={actIndex} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                  <div className="text-sm font-mono text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                                    {time}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-foreground mb-1">{title}</h4>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                                    {category && (
                                      <span className="inline-block mt-2 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                                        {category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No activities planned for this day yet.</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Must-See Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    console.log('🔍 DEBUG: Rendering highlights:', travelPlan.highlights);
                    return (
                      <ul className="space-y-3">
                        {travelPlan.highlights && travelPlan.highlights.length > 0 ? (
                          travelPlan.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-muted-foreground">{highlight}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-center py-4 text-muted-foreground">
                            <p>No highlights available yet.</p>
                          </li>
                        )}
                      </ul>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>

            {/* Cultural Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Cultural Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    console.log('🔍 DEBUG: Rendering cultural insights:', travelPlan.cultural_insights);
                    return (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {travelPlan.cultural_insights || 'No cultural insights available yet.'}
                      </p>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>

            {/* Local Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Local Secrets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    console.log('🔍 DEBUG: Rendering local recommendations:', travelPlan.local_recommendations);
                    return (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {travelPlan.local_recommendations || 'No local recommendations available yet.'}
                      </p>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>

            {/* Travel Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-500" />
                    Travel Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    console.log('🔍 DEBUG: Rendering travel tips:', travelPlan.travel_tips);
                    return (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {travelPlan.travel_tips || 'No travel tips available yet.'}
                      </p>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-teal-500 text-white">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold mb-4">Ready to Book Your Adventure?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Your personalized travel plan is ready! Save it, share it, or start planning your next journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Plan
                </Button>
                <Link href="/">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                    <Plane className="w-4 h-4 mr-2" />
                    Plan Another Trip
                  </Button>
                </Link>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-foreground">Loading...</h2>
        </div>
      </div>
    }>
      <ResultsPageContent />
    </Suspense>
  );
}