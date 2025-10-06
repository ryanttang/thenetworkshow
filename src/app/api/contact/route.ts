export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@/lib/supabase";
import { z } from "zod";
import { supabaseRequest } from "@/lib/supabase-server";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
  subject: z.string().max(200, "Subject is too long").optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the input
    const validatedData = contactSchema.parse(body);
    
    // Create the contact message using Supabase REST API
    const contactData = {
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject || null,
      message: validatedData.message,
    };

    const contactResponse = await supabaseRequest('ContactMessage', {
      method: 'POST',
      headers: {
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(contactData)
    }, true); // Use service role

    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();
      console.error("Supabase ContactMessage creation failed:", {
        status: contactResponse.status,
        statusText: contactResponse.statusText,
        errorText,
        contactData
      });
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to send contact message" 
        },
        { status: 500 }
      );
    }

    const contactArray = await contactResponse.json();
    const contactMessage = contactArray[0]; // Supabase returns an array

    return NextResponse.json(
      { 
        success: true, 
        message: "Contact message sent successfully",
        id: contactMessage.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating contact message:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation error",
          errors: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}
