import { useEffect, useRef, useState } from 'react';
import { stateForSection } from '../lib/sky/states';
import type { AbabilScene } from '../lib/sky/AbabilScene';

interface Props { claims: Array<{ id: string; evidence: number }>; sectionIds: string[] }

function Fallback() {
  const stars = Array.from({ length: 60 }, (_, i) => ({ cx: (i * 53) % 100, cy: (i * 37) % 70, r: 0.15 + ((i * 7) % 5) * 0.06 }));
  const bird = 'M0 0 L-4 -1.5 L0 0.8 L4 -1.5 Z';
  return (
    <svg className="sky-stage__svg" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid slice" role="presentation">
      {stars.map((s, i) => <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#cfd8ff" opacity="0.8" />)}
      {[[20, 20], [34, 14], [48, 22], [62, 12], [76, 20]].map(([x, y], i) => (
        <path key={i} d={bird} transform={`translate(${x} ${y})`} fill="#efe8d6" />
      ))}
    </svg>
  );
}

export default function SkyStage({ claims, sectionIds }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'loading' | 'webgl' | 'fallback'>('loading');

  useEffect(() => {
    let scene: AbabilScene | undefined;
    let cancelled = false;
    let io: IntersectionObserver | undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const forceFallback = new URLSearchParams(window.location.search).has('nowebgl');

    const onResize = () => scene?.resize(window.innerWidth, window.innerHeight);
    const onVisibility = () => scene?.setPaused(document.hidden);

    (async () => {
      try {
        if (forceFallback) throw new Error('webgl disabled by query');
        const { createScene } = await import('../lib/sky/AbabilScene');
        if (cancelled || !canvasRef.current) return;
        scene = createScene({ canvas: canvasRef.current, claims, reducedMotion: reduced });
        onResize();
        setMode('webgl');

        io = new IntersectionObserver((entries) => {
          for (const e of entries) if (e.isIntersecting) scene?.setState(stateForSection((e.target as HTMLElement).id));
        }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (el) io.observe(el);
        }
        window.addEventListener('resize', onResize);
        document.addEventListener('visibilitychange', onVisibility);
      } catch {
        if (!cancelled) setMode('fallback');
      }
    })();

    return () => {
      cancelled = true;
      io?.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      scene?.dispose();
    };
  }, []);

  return (
    <div className="sky-stage" aria-hidden="true" data-mode={mode}>
      {mode !== 'webgl' && <Fallback />}
      <canvas ref={canvasRef} className={mode === 'webgl' ? 'sky-stage__canvas' : 'sky-stage__canvas sky-stage__canvas--hidden'} />
    </div>
  );
}
