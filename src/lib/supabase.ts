// Supabase REST API client for server-side operations
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export class SupabaseClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(useServiceRole = false) {
    if (!SUPABASE_URL) {
      throw new Error('Supabase URL not configured. Set NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!SUPABASE_ANON_KEY) {
      throw new Error('Supabase Anon Key not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    this.baseUrl = `${SUPABASE_URL}/rest/v1`;
    
    // Use service role key for server-side operations, anon key for client-side
    const key = useServiceRole && SUPABASE_SERVICE_ROLE_KEY ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;
    
    this.headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    };
  }

  async get<T>(table: string, params?: Record<string, any>): Promise<T[]> {
    let url = `${this.baseUrl}/${table}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value);
        }
      });
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }

    const response = await fetch(url, {
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async findUnique<T>(table: string, where: Record<string, any>, select?: string): Promise<T | null> {
    const params: Record<string, any> = {};
    
    // Convert where clause to Supabase format
    Object.entries(where).forEach(([key, value]) => {
      params[`${key}`] = `eq.${value}`;
    });

    if (select) {
      params.select = select;
    }

    const results = await this.get<T>(table, params);
    return results.length > 0 ? results[0] : null;
  }

  async findMany<T>(table: string, options?: {
    where?: Record<string, any>;
    include?: Record<string, any>;
    orderBy?: Record<string, string>;
    select?: string;
  }): Promise<T[]> {
    const params: Record<string, any> = {};

    if (options?.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          if (typeof value === 'object' && value !== null) {
            // Handle complex where conditions
            if (value.gte) params[`${key}`] = `gte.${value.gte}`;
            if (value.lte) params[`${key}`] = `lte.${value.lte}`;
            if (value.gt) params[`${key}`] = `gt.${value.gt}`;
            if (value.lt) params[`${key}`] = `lt.${value.lt}`;
            if (value.in) params[`${key}`] = `in.(${Array.isArray(value.in) ? value.in.join(',') : value.in})`;
            if (value.not) params[`${key}`] = `not.${value.not}`;
          } else {
            params[`${key}`] = `eq.${value}`;
          }
        }
      });
    }

    if (options?.select) {
      params.select = options.select;
    }

    if (options?.orderBy) {
      const orderByEntries = Object.entries(options.orderBy);
      if (orderByEntries.length > 0) {
        params.order = orderByEntries.map(([key, direction]) => `${key}.${direction}`).join(',');
      }
    }

    return this.get<T>(table, params);
  }

  async count(table: string, where?: Record<string, any>): Promise<number> {
    const params: Record<string, any> = {
      select: 'count'
    };

    if (where) {
      Object.entries(where).forEach(([key, value]) => {
        if (value !== undefined) {
          params[`${key}`] = `eq.${value}`;
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/${table}?${new URLSearchParams(params).toString()}`, {
      headers: {
        ...this.headers,
        'Prefer': 'count=exact'
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
    }

    const count = response.headers.get('content-range');
    if (count) {
      const match = count.match(/\/(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    }

    return 0;
  }
}
