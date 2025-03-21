"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  Activity, 
  Heart, 
  GraduationCap, 
  Calendar,
  Clock 
} from 'lucide-react';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/service-card';
import { TestimonialCard } from '@/components/testimonial-card';
import { AppointmentCard } from '@/components/dashboard/appointment-card';
import { WellnessScore } from '@/components/dashboard/wellness-score';
import { Recommendations } from '@/components/dashboard/recommendations';
import { StatsCard } from '@/components/dashboard/stats-card';

import { 
  heroData, 
  featuresData, 
  servicesData, 
  testimonialsData,
  upcomingAppointmentsData,
  wellnessScoresData,
  recommendationsData,
  currentUserData
} from '@/lib/mock-data';
import { themeColors } from '@/registry/new-york/theme-config/theme-config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simulate checking authentication status
  useEffect(() => {
    // In a real app, this would check for an auth token or session
    const userLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(userLoggedIn);
  }, []);

  // Function to simulate login (for demo purposes)
  const handleDemoLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  // Function to simulate logout (for demo purposes)
  const handleDemoLogout = () => {
    localStorage.setItem('isLoggedIn', 'false');
    setIsLoggedIn(false);
  };

  // Map feature icons to components
  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="h-6 w-6" />;
      case 'Activity':
        return <Activity className="h-6 w-6" />;
      case 'Heart':
        return <Heart className="h-6 w-6" />;
      case 'GraduationCap':
        return <GraduationCap className="h-6 w-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader isLoggedIn={isLoggedIn} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-purple-700 to-blue-500 text-white overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] bg-repeat opacity-30"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24 relative z-10 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  {heroData.title}
                </h1>
                <p className="text-base md:text-lg lg:text-xl text-purple-100 mb-6 md:mb-8 max-w-lg">
                  {heroData.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-purple-700 hover:bg-purple-100"
                  >
                    {heroData.ctaText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="border-white bg-white/20 text-white hover:bg-white/30"
                  >
                    {heroData.secondaryCtaText}
                  </Button>
                </div>
                
                {/* Add demo login/logout for testing */}
                <div className="mt-4 flex gap-4">
                  {!isLoggedIn ? (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-white hover:text-purple-200"
                      onClick={handleDemoLogin}
                    >
                      Demo Login
                    </Button>
                  ) : (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-white hover:text-purple-200"
                      onClick={handleDemoLogout}
                    >
                      Demo Logout
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="hidden lg:block lg:col-span-5 relative h-[300px] xl:h-[400px]">
                <div className="absolute inset-0 bg-white/10 rounded-lg backdrop-blur-sm"></div>
                <div className="absolute inset-4 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg shadow-2xl overflow-hidden">
                  {/* Placeholder for hero image */}
                  <div className="w-full h-full flex items-center justify-center text-white/80">
                    <span className="text-xl font-medium">Wellness Image</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Dashboard Preview (for logged-in users) */}
        {isLoggedIn && (
          <section className="py-10 md:py-12 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    Welcome Back, {currentUserData.name}
                  </h2>
                  <p className="text-muted-foreground">
                    Here&apos;s an overview of your wellness journey
                  </p>
                </div>
                <Link href="/dashboard">
                  <Button className="mt-4 md:mt-0">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <StatsCard
                  title="Upcoming Appointments"
                  value={currentUserData.upcomingAppointments}
                  icon={<Calendar className="h-4 w-4" />}
                  description="Scheduled sessions"
                />
                <StatsCard
                  title="Member Since"
                  value={new Date(currentUserData.memberSince).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                  description="Thank you for your continued trust"
                />
                <StatsCard
                  title="Last Visit"
                  value={new Date(currentUserData.lastVisit).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  icon={<Clock className="h-4 w-4" />}
                  description="Your recent treatment"
                />
              </div>
              
              <Tabs defaultValue="overview" className="mb-8">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                    <Card className="lg:col-span-8">
                      <CardHeader>
                        <CardTitle>Your Wellness Journey</CardTitle>
                        <CardDescription>
                          Track your progress and see how you&apos;re improving
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <WellnessScore scores={wellnessScoresData} />
                      </CardContent>
                    </Card>
                    
                    <div className="lg:col-span-4 space-y-4 md:space-y-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle>Next Appointment</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {upcomingAppointmentsData.length > 0 ? (
                            <div className="flex items-center space-x-4">
                              <div className="bg-primary/10 rounded-full p-3">
                                <Calendar className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{upcomingAppointmentsData[0].serviceName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(upcomingAppointmentsData[0].date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                  })} at {upcomingAppointmentsData[0].time}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  with {upcomingAppointmentsData[0].provider}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No upcoming appointments.</p>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="h-4 w-4 mr-2" />
                            Book New Appointment
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Clock className="h-4 w-4 mr-2" />
                            View Appointment History
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="appointments">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {upcomingAppointmentsData.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        serviceName={appointment.serviceName}
                        provider={appointment.provider}
                        date={appointment.date}
                        time={appointment.time}
                        location={appointment.location}
                        status={appointment.status as 'confirmed' | 'pending' | 'cancelled'}
                      />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="recommendations">
                  <Recommendations 
                    recommendations={recommendationsData.map(rec => ({
                      ...rec,
                      priority: rec.priority as 'high' | 'medium' | 'low'
                    }))} 
                  />
                </TabsContent>
              </Tabs>
            </div>
          </section>
        )}
        
        {/* Features Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Why Choose Body Bliss Visio</h2>
              <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                Our comprehensive approach to health and wellness sets us apart, 
                focusing on personalized care and proven results.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {featuresData.map((feature) => (
                <Card key={feature.id}>
                  <CardContent className="pt-6">
                    <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center text-primary mb-4">
                      {getFeatureIcon(feature.icon)}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Services Section */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Our Services</h2>
              <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                Experience our range of professional health and wellness services designed
                to help you look and feel your best.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {servicesData.map((service) => (
                <ServiceCard
                  key={service.id}
                  title={service.title}
                  description={service.description}
                  image={service.image}
                  href={`/services/${service.id}`}
                />
              ))}
            </div>
            
            <div className="text-center mt-8 md:mt-12">
              <Link href="/services">
                <Button 
                  size="lg"
                  className="group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center transition-transform duration-300 group-hover:translate-x-1 text-white">
                    View All Services
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section 
          className="py-12 md:py-16 bg-gradient-to-r from-purple-700 to-blue-500 text-white"
          style={{ background: themeColors.gradient.primary }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">What Our Clients Say</h2>
              <p className="text-base md:text-lg max-w-3xl mx-auto opacity-90">
                Don&apos;t just take our word for it. Here&apos;s what our clients have to say about their
                experience with Body Bliss Visio.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {testimonialsData.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  content={testimonial.content}
                  name={testimonial.name}
                  role={testimonial.role}
                  avatar={testimonial.avatar}
                  className="bg-white text-gray-900"
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Ready to Start Your Wellness Journey?</h2>
              <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
                Book your first appointment today and take the first step towards a healthier,
                more balanced life with Body Bliss Visio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center transition-transform duration-300 group-hover:translate-x-1 text-white">
                    Book an Appointment
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="group hover:border-primary/50 transition-all"
                >
                  <span className="transition-all duration-300 text-primary group-hover:text-primary">
                    Contact Us
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  );
}
