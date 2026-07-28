import { useEffect, useRef } from 'react';

// Subtle Matrix-style falling katakana/hex data rain. Low opacity, sits behind content.
export default function DataStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);
    const fontSize = 14;
    let cols = Math.floor(w / fontSize);
    let drops: number[] = new Array(cols).fill(1).map(() => Math.random() * -50);
    const chars = '01ABCDEF<>{}[]#$%&*+-=サイバーネット'.split('');

    let raf = 0;
    let last = 0;

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      cols = Math.floor(w / fontSize);
      drops = new Array(cols).fill(1).map(() => Math.random() * -50);
    };
    window.addEventListener('resize', onResize);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 60) return;
      last = now;

      ctx.fillStyle = 'rgba(5, 5, 7, 0.08)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${fontSize}px "Share Tech Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const lead = Math.random() > 0.975;
        ctx.fillStyle = lead ? 'rgba(0,240,255,0.9)' : 'rgba(0,240,255,0.4)';
        ctx.fillText(text, x, y);

        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="data-stream h-full w-full" aria-hidden />;
}
