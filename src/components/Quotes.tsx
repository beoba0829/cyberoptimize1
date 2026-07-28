import { Quote } from 'lucide-react';

const QUOTES = [
  {
    text: 'I don\'t wanna be a cyberpunk. I just want enough chrome to keep the people I love safe.',
    author: 'DAVID MARTINEZ',
    role: 'EDGERUNNER',
  },
  {
    text: 'The City of Dreams. I\'d always wanted to see it for myself. But I never realized how much I\'d lose to get there.',
    author: 'LUCY',
    role: 'NETRUNNER',
  },
  {
    text: 'You\'re a born edgerunner. Don\'t waste it.',
    author: 'MAINE',
    role: 'CYBERPSYCHO',
  },
];

export default function Quotes() {
  return (
    <section className="relative px-5 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center reveal-glitch">
          <div className="font-mono text-xs tracking-[0.4em] text-cyber-magenta animate-flicker">// TRANSMISSIONS FROM THE STREET</div>
          <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
            WORDS TO <span className="text-cyber-magenta text-glow-magenta rgb-hover">HODL</span> BY
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {QUOTES.map((q, i) => (
            <div
              key={i}
              className="reveal-pop clip-cyber scan-card holo-card relative border border-cyber-magenta/20 bg-cyber-panel/50 p-7 transition-all hover:border-cyber-magenta/50"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <Quote className="mb-4 h-8 w-8 text-cyber-magenta/60 animate-flicker" />
              <p className="font-body text-lg italic leading-relaxed text-gray-200">"{q.text}"</p>
              <div className="mt-5 border-t border-cyber-cyan/20 pt-4">
                <div className="font-display text-sm font-bold tracking-widest text-cyber-yellow">{q.author}</div>
                <div className="font-mono text-xs tracking-widest text-cyber-cyan">{q.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
