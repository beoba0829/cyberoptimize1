import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(SplitText, ScrollTrigger);

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';

interface Props {
  text: string;
  className?: string;
  duration?: number;
  triggerOnce?: boolean;
  triggerOnHover?: boolean;
  as?: 'h1' | 'h2' | 'h3';
}

export default function ShuffleText({
  text,
  className = '',
  duration = 1.5,
  triggerOnce = true,
  triggerOnHover = true,
  as: Tag = 'h2',
}: Props) {
  const textRef = useRef<HTMLElement>(null);
  const splitRef = useRef<SplitText | null>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const triggeredRef = useRef(false);

  const shuffle = () => {
    if (triggerOnce && triggeredRef.current) return;
    triggeredRef.current = true;

    if (splitRef.current) splitRef.current.revert();
    splitRef.current = new SplitText(textRef.current, { type: 'chars' });

    if (animationRef.current) animationRef.current.kill();
    animationRef.current = gsap.timeline();

    splitRef.current.chars.forEach((char, i) => {
      const original = char.textContent;
      animationRef.current!.fromTo(
        char,
        {},
        {
          duration,
          ease: 'power2.out',
          onUpdate: function () {
            if (this.progress() < 0.8) {
              char.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
            } else {
              char.textContent = original;
            }
          },
        },
        i * 0.05,
      );
    });
  };

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    if (triggerOnHover) element.addEventListener('mouseenter', shuffle);

    const st = ScrollTrigger.create({
      trigger: element,
      start: 'top 80%',
      onEnter: shuffle,
    });

    return () => {
      st.kill();
      if (splitRef.current) splitRef.current.revert();
      if (animationRef.current) animationRef.current.kill();
      if (triggerOnHover) element.removeEventListener('mouseenter', shuffle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, duration, triggerOnce, triggerOnHover]);

  return (
    <Tag ref={textRef as React.RefObject<HTMLHeadingElement>} className={className}>
      {text}
    </Tag>
  );
}
