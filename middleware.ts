import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  INTERNAL_DISCOUNT_MANAGEMENT_PATH,
  isCustomAdminDiscountRoute,
} from '@/lib/utils/admin-discount-route';

export function middleware(request: NextRequest) {
  if (!isCustomAdminDiscountRoute()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const legacyPrefix = `/${INTERNAL_DISCOUNT_MANAGEMENT_PATH}`;

  if (pathname === legacyPrefix || pathname.startsWith(`${legacyPrefix}/`)) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/internal/discount-management',
    '/internal/discount-management/:path*',
  ],
};
