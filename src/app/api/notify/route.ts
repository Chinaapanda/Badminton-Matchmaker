import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token, message } = await request.json();

    if (!token || !message) {
      return NextResponse.json(
        { error: 'Missing token or message' },
        { status: 400 }
      );
    }

    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      },
      body: new URLSearchParams({
        message: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to send notification' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Line Notify Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
