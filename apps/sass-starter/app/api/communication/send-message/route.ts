import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { recipient, subject, message, type, priority } = await request.json();

    // Log the incoming request for debugging
    console.log('📧 Email Request:', {
      recipient,
      subject: subject?.substring(0, 50) + '...',
      messageLength: message?.length,
      type,
      priority,
      timestamp: new Date().toISOString(),
    });

    // Check for API key
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not set in environment variables');
      return NextResponse.json(
        { 
          error: 'Email service not configured', 
          details: 'RESEND_API_KEY environment variable is missing' 
        },
        { status: 500 }
      );
    }

    // Log API key status (safely)
    console.log('🔑 API Key Status:', {
      exists: !!process.env.RESEND_API_KEY,
      length: process.env.RESEND_API_KEY?.length,
      prefix: process.env.RESEND_API_KEY?.substring(0, 8) + '...',
    });

    // Validate required fields
    if (!recipient || !subject || !message) {
      const missingFields = [];
      if (!recipient) missingFields.push('recipient');
      if (!subject) missingFields.push('subject');
      if (!message) missingFields.push('message');
      
      console.error('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        { 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          details: 'All fields (recipient, subject, message) are required'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient)) {
      console.error('❌ Invalid email format:', recipient);
      return NextResponse.json(
        { 
          error: 'Invalid email address format',
          details: `The email "${recipient}" is not in a valid format`
        },
        { status: 400 }
      );
    }

    // Create email content with proper formatting
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
          New Message from Communication Center
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Type:</strong> ${type || 'General'}</p>
          <p><strong>Priority:</strong> ${priority || 'Medium'}</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 5px;">
          <h3 style="color: #495057; margin-top: 0;">Message:</h3>
          <div style="white-space: pre-wrap; line-height: 1.6; color: #212529;">
            ${message}
          </div>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; font-size: 12px; color: #6c757d;">
          <p>This message was sent from the Communication Center at ${new Date().toLocaleString()}</p>
          <p>Please do not reply directly to this email. For support, contact us through our official channels.</p>
        </div>
      </div>
    `;

    // Log email configuration
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    console.log('📤 Email Configuration:', {
      fromEmail,
      toEmail: recipient,
      usingDefaultFrom: !process.env.FROM_EMAIL,
    });

    // Send email using Resend
    console.log('🚀 Attempting to send email via Resend...');
    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [recipient],
      subject: subject,
      html: emailContent,
    });

    console.log('📨 Resend Response:', {
      success: !emailResponse.error,
      data: emailResponse.data,
      error: emailResponse.error,
    });

    if (emailResponse.error) {
      console.error('❌ Resend API Error:', {
        message: emailResponse.error.message,
        name: emailResponse.error.name,
        details: emailResponse.error,
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to send email via Resend',
          details: emailResponse.error.message,
          resendError: emailResponse.error.name || 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Log successful send
    console.log('✅ Email sent successfully:', {
      id: emailResponse.data?.id,
      to: recipient,
      subject: subject,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      messageId: emailResponse.data?.id,
      message: 'Email sent successfully',
      details: {
        to: recipient,
        from: fromEmail,
        messageId: emailResponse.data?.id,
      }
    });

  } catch (error) {
    console.error('💥 Unexpected Error in send-message API:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      error: error,
    });

    return NextResponse.json(
      { 
        error: 'Internal server error while sending email',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'server_error'
      },
      { status: 500 }
    );
  }
}

// Optional: GET method to check email service status
export async function GET() {
  return NextResponse.json({
    service: 'Email Communication API',
    status: 'active',
    provider: 'Resend',
    timestamp: new Date().toISOString(),
  });
}
