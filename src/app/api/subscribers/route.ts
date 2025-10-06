import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@/lib/supabase";
import { z } from "zod";
import { supabaseRequest } from "@/lib/supabase-server";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = subscribeSchema.parse(body);

    const supabase = new SupabaseClient(true);

    // Check if email already exists
    const existingSubscriber = await supabase.findUnique("Subscriber", { email }) as any;

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { error: "This email is already subscribed to event invites." },
          { status: 400 }
        );
      } else {
        // Reactivate the subscriber using Supabase REST API
        const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Subscriber?email=eq.${encodeURIComponent(email)}`, {
          method: 'PATCH',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isActive: true, updatedAt: new Date().toISOString() })
        });

        if (!updateResponse.ok) {
          console.error("Failed to reactivate subscriber:", await updateResponse.text());
          return NextResponse.json(
            { error: "Failed to resubscribe. Please try again." },
            { status: 500 }
          );
        }

        return NextResponse.json(
          { message: "Successfully resubscribed to event invites!" },
          { status: 200 }
        );
      }
    }

    // Create new subscriber using Supabase REST API
    const subscriberData = { email };
    const createResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Subscriber`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(subscriberData)
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Supabase Subscriber creation failed:", {
        status: createResponse.status,
        statusText: createResponse.statusText,
        errorText,
        subscriberData
      });
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Successfully subscribed to event invites!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error subscribing:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const skip = (page - 1) * limit;

    const supabase = new SupabaseClient(true);

    // Build where clause
    let whereClause: any = {};
    
    if (activeOnly) {
      whereClause.isActive = true;
    }
    
    if (search) {
      whereClause.email = { contains: search };
    }

    // Get subscribers
    const subscribers = await supabase.findMany("Subscriber", {
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: "*"
    }) as any[];

    // Get total count
    const total = await supabase.count("Subscriber", whereClause);

    // Apply pagination manually
    const paginatedSubscribers = subscribers.slice(skip, skip + limit);

    return NextResponse.json({
      subscribers: paginatedSubscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}
