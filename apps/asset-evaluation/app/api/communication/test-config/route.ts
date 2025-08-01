import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  try {
    // Check environment variables
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    console.log('🔍 Testing Resend Configuration...');
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length || 0);
    console.log('API Key prefix:', apiKey?.substring(0, 10) + '...');
    console.log('From Email:', fromEmail);

    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'RESEND_API_KEY not found in environment variables',
        config: {
          apiKeyExists: false,
          fromEmail: fromEmail || 'Not set',
        }
      }, { status: 500 });
    }

    if (apiKey.length < 20) {
      return NextResponse.json({
        status: 'error',
        message: 'RESEND_API_KEY appears to be incomplete or invalid',
        config: {
          apiKeyExists: true,
          apiKeyLength: apiKey.length,
          expectedMinLength: 20,
          fromEmail: fromEmail || 'Not set',
        }
      }, { status: 500 });
    }

    // Test Resend connection
    const resend = new Resend(apiKey);
    
    // Try to get domains (this will test if the API key works)
    try {
      const domains = await resend.domains.list();
      console.log('✅ Resend API connection successful');
      
      return NextResponse.json({
        status: 'success',
        message: 'Resend configuration is valid',
        config: {
          apiKeyExists: true,
          apiKeyLength: apiKey.length,
          fromEmail: fromEmail || 'onboarding@resend.dev (default)',
          domainsCount: Array.isArray(domains.data) ? domains.data.length : 0,
          canSendEmails: true,
        }
      });
    } catch (resendError: any) {
      console.error('❌ Resend API Error:', resendError);
      
      return NextResponse.json({
        status: 'error',
        message: 'Resend API key is invalid or connection failed',
        config: {
          apiKeyExists: true,
          apiKeyLength: apiKey.length,
          fromEmail: fromEmail || 'onboarding@resend.dev (default)',
        },
        resendError: {
          message: resendError.message,
          name: resendError.name,
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('💥 Test Configuration Error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
