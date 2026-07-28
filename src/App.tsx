import Background from './components/Background';
import CursorGlow from './components/CursorGlow';
import DataStream from './components/DataStream';
import Navbar from './components/Navbar';
import Ticker, { MiniStats } from './components/Ticker';
import Hero from './components/Hero';
import About from './components/About';
import CrewDatabase from './components/CrewDatabase';
import Tokenomics from './components/Tokenomics';
import CyberpsychoMeter from './components/CyberpsychoMeter';
import DirectionalParallaxTransition from './components/DirectionalParallaxTransition';
import Roadmap from './components/Roadmap';
import HowToBuy from './components/HowToBuy';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import TargetCursor from './components/TargetCursor';
import { useScrollReveal } from './lib/useScrollReveal';
import { useSmoothScroll } from './lib/useSmoothScroll';
import { HeroTimelineProvider } from './lib/heroTimeline';
import { useState } from 'react';

export default function App() {
  const [booted, setBooted] = useState(false);
  useScrollReveal();
  useSmoothScroll();

  return (
    <HeroTimelineProvider>
    <div className="relative min-h-screen">
      <TargetCursor
        spinDuration={4}
        hideDefaultCursor
        parallaxOn
        hoverDuration={0.2}
        cursorColor="#FFFFFF"
        cursorColorOnTarget="#B497CF"
      />
      {!booted && <LoadingScreen onEnter={() => setBooted(true)} />}
      <Background />
      <CursorGlow />
      <Navbar />
      {/*
        Opaque <main> sits in normal flow above the sticky footer (which uses
        z-index: -1). As the user scrolls to the end of the FAQ section, main's
        opaque background slides up and the footer is revealed from underneath —
        driven purely by natural scroll, no JavaScript.
      */}
      <main className="relative z-[1] bg-cyber-darker">
        <Hero booted={booted} />
        <Ticker />
        <div className="mx-auto max-w-6xl px-5 py-8">
          <MiniStats />
        </div>
        <About />
        <CrewDatabase />
        <DirectionalParallaxTransition>
          <Tokenomics />
          <CyberpsychoMeter />
        </DirectionalParallaxTransition>
        <Roadmap />
        <HowToBuy />
        <FAQ />
      </main>
      <Footer />
    </div>
    </HeroTimelineProvider>
  );
}
