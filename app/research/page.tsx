import { redirect } from 'next/navigation';

// Phase R.1: /research replaced by /rnd (Research & Development).
// Kept as a redirect so old links keep working.
export default function ResearchRedirect() {
  redirect('/rnd');
}
