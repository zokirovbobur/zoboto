// Root route — middleware rewrites "/" to "/index.html" (served from public/).
// This page is only rendered if the middleware rewrite fails.
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/index.html')
}
