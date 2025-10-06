// Utility function for Supabase server-side operations
export function getSupabaseHeaders(useServiceRole = true) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (useServiceRole && serviceRoleKey) {
    return {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json'
    };
  } else if (anonKey) {
    return {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json'
    };
  } else {
    throw new Error('No Supabase keys available');
  }
}

export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }
  return url;
}

export async function supabaseRequest(
  endpoint: string, 
  options: RequestInit = {}, 
  useServiceRole = true
) {
  const url = `${getSupabaseUrl()}/rest/v1/${endpoint}`;
  const headers = getSupabaseHeaders(useServiceRole);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Supabase API error (${response.status}):`, {
      url,
      status: response.status,
      statusText: response.statusText,
      errorText,
      useServiceRole
    });
    throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
  }
  
  return response;
}
