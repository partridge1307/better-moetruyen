import { NextResponse, type NextRequest } from 'next/server';
import { RateLimitError, limiter } from './lib/rate-limit';
import { requestIp } from './lib/request-ip';

export async function middleware(req: NextRequest) {
  const ip = requestIp(req.headers) ?? req.ip ?? '127.0.0.1';
  const requestHeaders = new Headers(req.headers);

  try {
    await limiter.check(requestHeaders, 50, ip);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { status: 'FAIL' },
        { status: 429, headers: requestHeaders }
      );
    }

    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: ['/api/((?=comment|user).*)'],
};
