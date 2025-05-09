
// Utility functions for direct Supabase API requests
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = "https://lavfpsnvwyzpilmgkytj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo";

/**
 * Makes a direct request to the Supabase REST API
 * @param endpoint - API endpoint (e.g., 'ride_requests')
 * @param options - Fetch options (method, body, etc)
 * @param queryParams - Optional query parameters
 */
export const directRequest = async (
  endpoint: string,
  options: RequestInit = {},
  queryParams: Record<string, string> = {}
) => {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${endpoint}`);
  
  // Separate Prefer header from query parameters
  let preferHeader = '';
  if (queryParams['prefer']) {
    preferHeader = queryParams['prefer'];
    delete queryParams['prefer'];
  }
  
  // Add query parameters if any
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  // Create a new headers object instead of modifying options.headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };
  
  // Safely add any additional headers from options
  if (options.headers) {
    const optionsHeaders = options.headers as Record<string, string>;
    Object.keys(optionsHeaders).forEach(key => {
      headers[key] = optionsHeaders[key];
    });
  }
  
  // Add Prefer header if it exists
  if (preferHeader) {
    headers['Prefer'] = preferHeader;
  }
  
  try {
    console.log(`🔄 API Request: ${options.method || 'GET'} ${url.toString()}`);
    if (options.body) {
      console.log('📦 Request Body:', options.body);
    }
    
    const response = await fetch(url.toString(), {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = errorText;
      }
      console.error('❌ API request failed:', response.status, errorData);
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    // For HEAD requests, don't try to parse the body
    if (options.method === 'HEAD') {
      return { status: response.status, headers: response.headers };
    }
    
    const data = await response.json();
    console.log('✅ API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error in directRequest:', error);
    throw error;
  }
};

/**
 * Get items from a table
 */
export const getItems = (endpoint: string, queryParams: Record<string, string> = {}) => {
  return directRequest(endpoint, { method: 'GET' }, queryParams);
};

/**
 * Insert items into a table
 */
export const insertItems = (endpoint: string, data: any) => {
  return directRequest(
    endpoint, 
    { 
      method: 'POST', 
      body: JSON.stringify(Array.isArray(data) ? data : [data]),
    },
    { prefer: 'return=representation' }
  );
};

/**
 * Update items in a table
 */
export const updateItem = (endpoint: string, data: any, conditions: Record<string, string>) => {
  return directRequest(
    endpoint,
    {
      method: 'PATCH',
      body: JSON.stringify(data)
    },
    {
      ...conditions,
      prefer: 'return=representation'
    }
  );
};

/**
 * Delete items from a table
 */
export const deleteItem = (endpoint: string, conditions: Record<string, string>) => {
  return directRequest(
    endpoint,
    { method: 'DELETE' },
    conditions
  );
};
