import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    q: 'Is CyberCoin a scam?',
    a: 'Define "scam." We have no team wallet, renounced contract, and locked liquidity. Is it a scam if we told you upfront it\'s a meme coin with zero utility? That\'s on you, cyber.',
  },
  {
    q: 'Will I get rich?',
    a: 'Maybe. Probably not. This is a meme coin, not financial advice. We are not your ripperdoc. Do your own research or enjoy the flatline.',
  },
  {
    q: 'What\'s with the 6.9% tax?',
    a: 'It funds the burn vault, liquidity, marketing bounties, and holder airdrops. Every swap makes your remaining bags rarer. Math.',
  },
  {
    q: 'Is this affiliated with Cyberpunk: Edgerunners?',
    a: 'Absolutely not. This is a parody meme coin inspired by the vibes of Night City. We are fans. CDPR and Trigger own the IP. We just live in the gutter and dream of chrome.',
  },
  {
    q: 'What happens at Cyberpsycho level 100%?',
    a: 'You flatline. Metaphorically. The burn vault triggers a massive supply torch and holders get airdropped bonus $CYBER. Don\'t lose your humanity over it.',
  },
  {
    q: 'How do I earn the bounty?',
    a: 'Post memes, raid Twitter, make content. Tag us and drop your wallet in the bounty channel. The streets pay the streets.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative px-5 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center reveal-glitch">
          <div className="font-mono text-xs tracking-[0.4em] text-cyber-cyan animate-flicker">// TRANSMISSION LOG</div>
          <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
            <span className="text-cyber-cyan text-glow-cyan rgb-hover">FAQ</span>
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="reveal-pop clip-cyber scan-card border border-cyber-cyan/20 bg-cyber-panel/50 transition-all hover:border-cyber-cyan/40" style={{ transitionDelay: `${i * 60}ms` }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-display text-base font-bold tracking-wide text-white">
                    <span className="text-cyber-magenta">Q.</span> {f.q}
                  </span>
                  <span className="flex-shrink-0 text-cyber-cyan">
                    {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-60' : 'max-h-0'}`}>
                  <p className="px-5 pb-5 font-body text-base leading-relaxed text-gray-300">
                    <span className="text-cyber-yellow">A.</span> {f.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
