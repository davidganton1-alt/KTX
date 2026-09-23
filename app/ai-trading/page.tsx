import { redirect } from 'next/navigation';

// Phase K: the simulated "live terminal" demo page is retired. Its tape was
// generated data wearing a "Live" label, and the console now owns engine
// views. Deep links keep working by landing on the calm markets overview.
export default function AiTradingPage() {
  redirect('/markets');
}
