import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.message || !data.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate message length
    if (data.message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Prepare email content
    const emailContent = `
New Feedback Submission from SBB Chat MCP

Type: ${data.type.toUpperCase()}
${data.rating ? `Rating: ${data.rating}/5 stars ⭐` : ''}
${data.email ? `User Email: ${data.email}` : 'User Email: Not provided'}

Message:
${data.message}

---
Metadata:
URL: ${data.url}
User Agent: ${data.userAgent}
Timestamp: ${new Date(data.timestamp).toLocaleString()}
    `.trim();

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'feedback@resend.dev',
      to: process.env.FEEDBACK_EMAIL || 'your-email@example.com',
      subject: `[${data.type.toUpperCase()}] New Feedback from SBB Chat`,
      text: emailContent,
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      id: emailResponse.data?.id 
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
