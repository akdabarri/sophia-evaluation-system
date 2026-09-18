import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Membaca identitas dari cookie peramban
  const role = request.cookies.get('sophia_role')?.value;
  const username = request.cookies.get('sophia_username')?.value;
  const { pathname } = request.nextUrl;

  // 1. Cegah akses ke dasbor jika belum login
  if (!role || !username) {
    if (pathname.startsWith('/dosen') || pathname.startsWith('/mahasiswa')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Arahkan otomatis jika sudah login tapi malah membuka halaman login
  if (role && pathname.startsWith('/login')) {
    if (role === 'INSTRUCTOR') {
      return NextResponse.redirect(new URL('/dosen/telemetri', request.url));
    } else {
      return NextResponse.redirect(new URL('/mahasiswa/ruang-kerja', request.url));
    }
  }

  // 3. Proteksi Paksa Rute Mahasiswa (Hanya boleh diakses STUDENT)
  if (pathname.startsWith('/mahasiswa') && role !== 'STUDENT') {
    return NextResponse.redirect(new URL('/dosen/telemetri', request.url));
  }

  // 4. Proteksi Paksa Rute Dosen (Hanya boleh diakses INSTRUCTOR)
  if (pathname.startsWith('/dosen') && role !== 'INSTRUCTOR') {
    return NextResponse.redirect(new URL('/mahasiswa/ruang-kerja', request.url));
  }

  return NextResponse.next();
}

// Konfigurasi jalur mana saja yang diawasi oleh satpam middleware ini
export const config = {
  matcher: ['/dosen/:path*', '/mahasiswa/:path*', '/login'],
};