import { redirect } from 'next/navigation';

// The game now lives at the root. This keeps every /yourmove link that has already been
// shared working, rather than turning it into a 404.
export default function YourMoveAlias() {
  redirect('/');
}
