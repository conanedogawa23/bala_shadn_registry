import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:5001/api/v1';

/**
 * GET /api/v1/clients/clinic/[clinicName]
 * Fetch all clients for a specific clinic
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicName: string }> }
) {
  try {
    const { clinicName } = await params;
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/clients/clinic/${clinicName}/frontend-compatible${queryString ? `?${queryString}` : ''}`;
    
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
      // Cache for 5 minutes
      next: { revalidate: 300, tags: ['clients', `clinic-${clinicName}`] }
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    console.error('[API Route] GET /api/v1/clients/clinic/[clinicName] error:', error);
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

