import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js API Route: /api/v1/clients
 * Proxy layer between frontend and Express backend
 * 
 * Handles:
 * - CORS
 * - Authentication token forwarding
 * - Error transformation
 * - Response caching headers
 */

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:5001/api/v1';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/clients${queryString ? `?${queryString}` : ''}`;
    
    // Forward authentication token if present
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
      next: { revalidate: 300 }
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    console.error('[API Route] GET /api/v1/clients error:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = `${BACKEND_URL}/clients`;
    
    // Forward authentication token if present
    const authToken = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = authToken;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      // No cache for mutations
      cache: 'no-store'
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status
    });
  } catch (error) {
    console.error('[API Route] POST /api/v1/clients error:', error);
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

