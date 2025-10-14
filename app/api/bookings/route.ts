import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminWhatsappNumber = '+917042523611'; // व्हाट्सएप नंबर जिस पर बुकिंग की जानकारी भेजी जाएगी

// Check if Supabase is configured
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase not configured. Bookings API will not work. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.');
}
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }
    const auth = request.headers.get('authorization') || request.headers.get('Authorization');
    let userId: string | null = null;
    if (auth && supabaseUrl && supabaseAnonKey) {
      try {
        const userClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: String(auth) } } });
        const { data: userData } = await userClient.auth.getUser();
        userId = userData?.user?.id ?? null;
      } catch {}
    }
    const formData = await request.formData();
    
    // Extract form fields
    const bookingData = {
      service_id: formData.get('serviceId') as string,
      service_title: formData.get('serviceTitle') as string,
      service_price: formData.get('servicePrice') as string,
      provider_name: formData.get('providerName') as string,
      full_name: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string || null,
      whatsapp_number: formData.get('whatsappNumber') as string || null,
      requirements: formData.get('requirements') as string,
      budget_range: formData.get('budgetRange') as string,
      delivery_preference: formData.get('deliveryPreference') as string,
      additional_notes: formData.get('additionalNotes') as string || null,
      cart_items: formData.get('cartItems') as string || null,
      status: 'pending',
      // Also populate legacy fields for compatibility
      customer_name: formData.get('fullName') as string,
      customer_phone: formData.get('phone') as string,
      customer_email: formData.get('email') as string || null,
      message: formData.get('requirements') as string,
      created_at: new Date().toISOString()
    };

    // Basic validation
    const errors: string[] = [];
    if (!bookingData.service_id) errors.push('serviceId is required');
    if (!bookingData.full_name) errors.push('fullName is required');
    if (!bookingData.phone) errors.push('phone is required');
    if (!bookingData.requirements) errors.push('requirements is required');
    const phoneDigits = (bookingData.phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) errors.push('invalid phone');
    if (bookingData.email) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email);
      if (!emailOk) errors.push('invalid email');
    }
    if (errors.length) {
      return NextResponse.json({ error: 'validation_failed', details: errors }, { status: 400 });
    }

    // Handle file uploads
    const files = [];
    let fileIndex = 0;
    const maxFiles = 5;
    while (formData.get(`file_${fileIndex}`) && fileIndex < maxFiles) {
      const file = formData.get(`file_${fileIndex}`) as File;
      if (file && file.size > 0) {
        try {
          const allowedTypes = new Set(['image/jpeg','image/png','image/webp','image/svg+xml','application/pdf','text/plain']);
          const maxBytes = 10 * 1024 * 1024;
          if (!allowedTypes.has(file.type) || file.size > maxBytes) {
            files.push({
              name: file.name,
              path: null,
              size: file.size,
              type: file.type,
              error: 'Invalid file type or size'
            });
            fileIndex++;
            continue;
          }
          // Upload file to Supabase Storage
          const fileName = `${Date.now()}_${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('booking-files')
            .upload(fileName, file);

          if (uploadError) {
            console.error('File upload error:', uploadError);
            // Store file info without upload if bucket doesn't exist
            files.push({
              name: file.name,
              path: null,
              size: file.size,
              type: file.type,
              error: 'Storage bucket not configured'
            });
          } else {
            files.push({
              name: file.name,
              path: uploadData.path,
              size: file.size,
              type: file.type
            });
          }
        } catch (error) {
          console.error('File upload error:', error);
          files.push({
            name: file.name,
            path: null,
            size: file.size,
            type: file.type,
            error: 'Upload failed'
          });
        }
      }
      fileIndex++;
    }

    // Insert booking into database
    const { data, error } = await supabase
      .from('bookings')
      .insert([{ 
        ...bookingData,
        files: files.length > 0 ? JSON.stringify(files) : null,
        user_id: userId
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // WhatsApp notification URL for admin
    const adminMessage = `नई बुकिंग प्राप्त हुई है!\n\nसेवा: ${bookingData.service_title}\nग्राहक: ${bookingData.full_name}\nफोन: ${bookingData.phone}\nईमेल: ${bookingData.email || 'N/A'}\nआवश्यकताएँ: ${bookingData.requirements}\n\nकृपया जल्द से जल्द संपर्क करें।`;
    const adminWhatsappUrl = `https://wa.me/${adminWhatsappNumber}?text=${encodeURIComponent(adminMessage)}`;

    return NextResponse.json(
      { 
        success: true, 
        booking: data,
        message: 'Booking created successfully',
        adminWhatsappUrl: adminWhatsappUrl
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Enforce user-authenticated access and RLS
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }
    const auth = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: String(auth) } } });
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    let query = userClient
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      bookings: data,
      total: count,
      page,
      limit
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}