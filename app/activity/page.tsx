"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  ShoppingBag, 
  CreditCard, 
  Settings,
  RefreshCw,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  Building
} from "lucide-react";

// Import real API hooks and utilities
import { 
  useEvents, 
  useEventStats, 
  useEventSearch,
  EventApiService,
  type Event
} from "@/lib/hooks";

export default function ActivityPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Fetch all events with pagination
  const { 
    events: allEvents, 
    loading: eventsLoading, 
    error: eventsError,
    pagination,
    refetch: refetchEvents
  } = useEvents({
    page: currentPage,
    limit: eventsPerPage,
    autoFetch: true
  });

  // Fetch event statistics
  const { 
    stats, 
    loading: statsLoading,
    refetch: refetchStats
  } = useEventStats({
    autoFetch: true
  });

  // Search functionality
  const {
    events: searchResults,
    loading: searchLoading,
    search
  } = useEventSearch({
    autoFetch: false
  });

  // Handle refresh
  const handleRefresh = async () => {
    await Promise.all([refetchEvents(), refetchStats()]);
  };

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await search(query);
    }
  };

  // Filter events based on selected tab
  const filteredEvents = useMemo(() => {
    const eventsToFilter = searchQuery.trim() ? searchResults : allEvents;
    
    switch (selectedTab) {
      case 'upcoming':
        return eventsToFilter.filter(event => 
          EventApiService.isEventUpcoming(event.eventDate, event.eventTime)
        );
      case 'today':
        return eventsToFilter.filter(event => 
          EventApiService.isEventToday(event.eventDate)
        );
      case 'approved':
        return eventsToFilter.filter(event => event.isApproved);
      case 'pending':
        return eventsToFilter.filter(event => !event.isApproved);
      default:
        return eventsToFilter;
    }
  }, [allEvents, searchResults, searchQuery, selectedTab]);

  // Get icon component for event type
  const getEventTypeIcon = (event: Event) => {
    if (event.title.toLowerCase().includes('appointment')) {
      return <Calendar className="h-4 w-4 text-blue-600" />;
    } else if (event.title.toLowerCase().includes('order')) {
      return <ShoppingBag className="h-4 w-4 text-green-600" />;
    } else if (event.title.toLowerCase().includes('payment')) {
      return <CreditCard className="h-4 w-4 text-purple-600" />;
    } else if (event.title.toLowerCase().includes('client')) {
      return <Users className="h-4 w-4 text-orange-600" />;
    } else if (event.title.toLowerCase().includes('clinic')) {
      return <Building className="h-4 w-4 text-cyan-600" />;
    } else {
      return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get status badge
  const getStatusBadge = (event: Event) => {
    if (event.isApproved) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const isLoading = eventsLoading || statsLoading || searchLoading;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Activity Feed</h1>
          <p className="text-sm text-gray-600 mt-1">Track events and activities across the system</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="text-lg text-gray-600">Loading activities...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {eventsError && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Error Loading Activities</h3>
                  <p className="mt-1 text-sm text-gray-500">{eventsError}</p>
                  <Button onClick={handleRefresh} className="mt-4">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Events List */}
          {!isLoading && !eventsError && (
            <div className="space-y-4">
              {filteredEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No Activities Found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchQuery ? 'Try adjusting your search terms.' : 'No events match the selected filter.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {filteredEvents.map((event) => (
                    <Card key={event._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="mt-1">
                              {getEventTypeIcon(event)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {event.title}
                                </h3>
                                {getStatusBadge(event)}
                              </div>
                              
                              {event.description && (
                                <p className="text-sm text-gray-600 mb-3">
                                  {event.description}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {EventApiService.formatEventDate(event.eventDate)}
                                </div>
                                
                                {event.eventTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {EventApiService.formatEventTime(event.eventTime)}
                                  </div>
                                )}
                                
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {event.location}
                                  </div>
                                )}
                                
                                {event.cost && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    {event.cost}
                                  </div>
                                )}
                                
                                {event.clientFullName && (
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {event.clientFullName}
                                  </div>
                                )}
                                
                                {event.clientClinicName && (
                                  <div className="flex items-center gap-1">
                                    <Building className="h-4 w-4" />
                                    {event.clientClinicName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!event.isApproved && (
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {pagination.totalPages}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === pagination.totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 