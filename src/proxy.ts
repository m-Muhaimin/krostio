export { updateSession as proxy } from '@/lib/middleware-core'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon\\.svg|robots\\.txt|sitemap\\.xml).*)'],
}
