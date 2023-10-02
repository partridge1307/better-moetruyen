import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const ip = req.ip || req.headers.get('x-real-ip');

  return new Response(ip);
}
