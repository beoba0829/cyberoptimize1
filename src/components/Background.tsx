import DataStream from './DataStream';

export default function Background() {
  return (
    <>
      {/* Animated perspective grid */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-cyber-darker">
        {/* Data rain */}
        <div className="absolute inset-0 opacity-40">
          <DataStream />
        </div>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,240,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.15) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%)',
          }}
        />
        {/* Neon blobs */}
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyber-magenta/20 blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-cyber-cyan/20 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-cyber-yellow/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        {/* Scan line sweep */}
        <div className="absolute left-0 right-0 h-px bg-cyber-cyan/60 animate-scan" style={{ boxShadow: '0 0 20px #00F0FF' }} />
      </div>
      <div className="scanlines vignette" />
    </>
  );
}
