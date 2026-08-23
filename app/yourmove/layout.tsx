import './yourmove.css';

export const metadata = {
  title: 'Your Move',
  description: 'Nineteen minutes. Three people. One of them called it in — probably.',
};

export default function YourMoveLayout({ children }: { children: React.ReactNode }) {
  return <div className="ymui">{children}</div>;
}
