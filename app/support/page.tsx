import { redirect } from 'next/navigation';

// Phase K: the legacy contact form is folded into the Help Center, which
// now carries the same support form (plus 22 answers). Old links work.
export default function SupportPage() {
  redirect('/help-center');
}
