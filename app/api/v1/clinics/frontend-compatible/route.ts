import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:5001/api/v1';

/**
 * GET /api/v1/clinics/frontend-compatible
 * Fetch all clinics with frontend-compatible format
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/clinics/frontend-compatible${queryString ? `?${queryString}` : ''}`;
    
    console.log('[API Route] Fetching clinics from:', url);
    
    const authToken = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = authToken;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      // Cache for 1 hour (clinics rarely change)
      next: { revalidate: 3600, tags: ['clinics'] }
    });
    
    console.log('[API Route] Backend response status:', response.status);
    
    const data = await response.json();
    console.log('[API Route] Backend response data:', data);
    
    // The backend should return: { success: true, data: { clinics: [...] } }
    // If not, we need to wrap it
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('[API Route] GET /api/v1/clinics/frontend-compatible error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: error instanceof Error ? error.message : 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

