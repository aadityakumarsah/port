import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Phone,
  MapPin,
  GitBranch,
  Globe,
  ExternalLink,
  Briefcase,
  Terminal,
  Trophy,
  GraduationCap,
  Brain,
  Shield,
  MessageCircle,
  Ship,
  Zap,
  Activity,
  ChevronRight,
  Server,
} from "lucide-react";
import ycLogo from "./public/yc.png";
import shipdLogo from "./public/shipd.png";
import echoLogo from "./public/echo.png";
import deltaLogo from "./public/delta.png";
import digitalNirmanLogo from "./public/digitalnirman.png";
import cogneeLogo from "./public/cogne.png";
import mastraLogo from "./public/mastra.png";
import modelenceLogo from "./public/modelence.png";
import metaLogo from "./public/meta.png";
import openClawLogo from "./public/openclaw.png";
import shipSecLogo from "./public/shipsec.png";
import kiloCodeLogo from "./public/kilo.png";
import openaiLogo from "./public/openai.png";
import lamdaLogo from "./public/lamda.png";
import hermesLogo from "./public/hermes.png";
import modelRouterLogo from "./public/model-router.png";
import clickImage from "./public/click-animation/click.png";
import clarioLogo from "./public/clario.png";
import nagrikLogo from "./public/nagrik.png";
import esewaLogo from "./public/esewa.png";
import wwfLogo from "./public/wwf.png";
import bitsPilaniLogo from "./public/bitspilani.png";
import arnikoLogo from "./public/arniko.png";
import githubContrib from "./public/github-contribution.png";
import hackClubLogo from "./public/hack-club.png";
import insforgeLogo from "./public/insforge.png";
import fossasiaLogo from "./public/fossasia.png";

// Language & Tech Stack Imports
import anchorLogo from "./public/language/anchor.png";
import crewaiLogo from "./public/language/CrewAI.png";
import dspyLogo from "./public/language/DSPy.png";
import fastapiLogo from "./public/language/fastapi.png";
import grpcLogo from "./public/language/grpc.png";
import huggingfaceLogo from "./public/language/HuggingFaceSuite.png";
import langchainLogo from "./public/language/langchain.png";
import llamaindexLogo from "./public/language/LlamaIndex.png";
import pgvectorLogo from "./public/language/pgvector.png";
import pytorchLogo from "./public/language/pytorch.png";
import rustLogo from "./public/language/rust.png";
import typescriptLogo from "./public/language/typescript.png";
import vllmLogo from "./public/language/vLLM.png";
import kubernetesLogo from "./public/language/kubernetes.png";
import javaLogo from "./public/language/java.png";
import reactLogo from "./public/language/react.png";
import redisLogo from "./public/language/redis.png";
import dockerLogo from "./public/language/docker.png";

import "./index.css";

const leafLogos = [
  ycLogo,
  shipdLogo,
  echoLogo,
  deltaLogo,
  digitalNirmanLogo,
  cogneeLogo,
  mastraLogo,
  modelenceLogo,
  metaLogo,
  openClawLogo,
  shipSecLogo,
  kiloCodeLogo,
  openaiLogo,
  lamdaLogo,
  hermesLogo,
  modelRouterLogo,
  clarioLogo,
  nagrikLogo,
  esewaLogo,
  wwfLogo,
  bitsPilaniLogo,
  arnikoLogo,
  hackClubLogo,
  insforgeLogo,
  fossasiaLogo,
  anchorLogo,
  crewaiLogo,
  dspyLogo,
  fastapiLogo,
  grpcLogo,
  huggingfaceLogo,
  langchainLogo,
  llamaindexLogo,
  pgvectorLogo,
  pytorchLogo,
  rustLogo,
  typescriptLogo,
  vllmLogo,
  kubernetesLogo,
  javaLogo,
  reactLogo,
  redisLogo,
  dockerLogo,
  clickImage,
];

interface LeafParticle {
  id: number;
  x: number;
  y: number;
  tx: string;
  ty: string;
  rot: string;
  src: string;
}

interface PhysicsParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  scale: number;
  opacity: number;
  decay: number;
  src: string;
  isBg: boolean;
}

const TechBadge = ({ tech, idx }: { tech: any; idx: number }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  // High-performance direct-DOM physics states
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef(0);
  const rotVelRef = useRef(0);
  
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const floatSpeedX = 0.0006 + (idx % 3) * 0.0003;
    const floatSpeedY = 0.0005 + (idx % 2) * 0.0002;
    const floatAmpX = 2.5 + (idx % 2) * 1.0;
    const floatAmpY = 1.5 + (idx % 3) * 1.0;

    const tick = (time: number) => {
      if (!elementRef.current) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      const rect = elementRef.current.getBoundingClientRect();
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      let ax = 0;
      let ay = 0;
      let arot = 0;

      const dx = (rect.left + rect.width / 2) - mx;
      const dy = (rect.top + rect.height / 2) - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repulsionRadius = 100; // soft and gentle radius

      if (dist < repulsionRadius && dist > 0) {
        // Subtle quadratic push
        const normalizedDist = dist / repulsionRadius;
        const force = Math.pow(1.0 - normalizedDist, 2.0) * 1.8; 
        ax = (dx / dist) * force;
        ay = (dy / dist) * force;
        arot = (dx > 0 ? 1 : -1) * force * 1.0;
      }

      // Spring pulling back to Home drifting orbit
      const k = 0.05; // elastic spring constant
      const targetX = Math.sin(time * floatSpeedX) * floatAmpX;
      const targetY = Math.cos(time * floatSpeedY) * floatAmpY;

      const springX = (targetX - posRef.current.x) * k;
      const springY = (targetY - posRef.current.y) * k;
      const springRot = -rotRef.current * k;

      ax += springX;
      ay += springY;
      arot += springRot;

      // Damping / Friction
      const damping = 0.88; 
      velRef.current.x = (velRef.current.x + ax) * damping;
      velRef.current.y = (velRef.current.y + ay) * damping;
      rotVelRef.current = (rotVelRef.current + arot) * 0.82;

      posRef.current.x += velRef.current.x;
      posRef.current.y += velRef.current.y;
      rotRef.current += rotVelRef.current;

      // Safe, tight visual limits to prevent adjacent card overlapping
      const maxLimitX = 12;
      const maxLimitY = 10;
      posRef.current.x = Math.max(-maxLimitX, Math.min(maxLimitX, posRef.current.x));
      posRef.current.y = Math.max(-maxLimitY, Math.min(maxLimitY, posRef.current.y));

      // Direct DOM update
      elementRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) rotate(${rotRef.current}deg)`;

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [idx]);

  return (
    <div
      ref={elementRef}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/20 hover:border-indigo-500/50 hover:bg-zinc-900/40 cursor-pointer transition-colors duration-300 group select-none"
    >
      {tech.icon ? (
        <tech.icon className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
      ) : (
        <img 
          src={tech.logo} 
          alt={tech.name} 
          className={`h-5 w-5 object-contain filter group-hover:brightness-110 transition-transform duration-300 ${
            tech.name === "DSPy" || tech.name === "vLLM" ? "scale-[1.45]" : ""
          }`} 
        />
      )}
      <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">{tech.name}</span>
    </div>
  );
};

const ContribBadge = ({ logo, href, label, yc, idx }: { logo: string; href: string; label: string; yc?: string; idx: number }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef(0);
  const rotVelRef = useRef(0);
  
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const floatSpeedX = 0.0006 + (idx % 3) * 0.0003;
    const floatSpeedY = 0.0005 + (idx % 2) * 0.0002;
    const floatAmpX = 2.0 + (idx % 2) * 1.0;
    const floatAmpY = 1.0 + (idx % 3) * 1.0;
    const rotSpeed = 0.0003 + (idx % 2) * 0.0002;
    const rotAmp = 1.0 + (idx % 3) * 0.8;

    const tick = (time: number) => {
      if (!elementRef.current) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      const rect = elementRef.current.getBoundingClientRect();
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      let ax = 0;
      let ay = 0;
      let arot = 0;

      const dx = (rect.left + rect.width / 2) - mx;
      const dy = (rect.top + rect.height / 2) - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repulsionRadius = 100;

      if (dist < repulsionRadius && dist > 0) {
        const normalizedDist = dist / repulsionRadius;
        const force = Math.pow(1.0 - normalizedDist, 2.0) * 1.8; 
        ax = (dx / dist) * force;
        ay = (dy / dist) * force;
        arot = (dx > 0 ? 1 : -1) * force * 1.0;
      }

      const k = 0.05;
      const targetX = Math.sin(time * floatSpeedX) * floatAmpX;
      const targetY = Math.cos(time * floatSpeedY) * floatAmpY;

      const springX = (targetX - posRef.current.x) * k;
      const springY = (targetY - posRef.current.y) * k;
      const springRot = -rotRef.current * k;

      ax += springX;
      ay += springY;
      arot += springRot;

      const damping = 0.88; 
      velRef.current.x = (velRef.current.x + ax) * damping;
      velRef.current.y = (velRef.current.y + ay) * damping;
      rotVelRef.current = (rotVelRef.current + arot) * 0.82;

      posRef.current.x += velRef.current.x;
      posRef.current.y += velRef.current.y;
      rotRef.current += rotVelRef.current;

      const maxLimitX = 8;
      const maxLimitY = 6;
      posRef.current.x = Math.max(-maxLimitX, Math.min(maxLimitX, posRef.current.x));
      posRef.current.y = Math.max(-maxLimitY, Math.min(maxLimitY, posRef.current.y));

      elementRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) rotate(${rotRef.current}deg)`;

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [idx]);

  return (
    <div
      ref={elementRef}
      className="inline-flex items-center gap-1.5 text-sm border border-zinc-700/50 rounded-md px-2 py-1 bg-zinc-900/10 hover:border-indigo-500/50 hover:bg-zinc-900/40 cursor-pointer transition-colors duration-300 select-none group/contrib"
    >
      <img src={logo} alt={label} className="h-4 w-4 rounded-sm" />
      <a href={href} target="_blank" rel="noreferrer" className="font-medium text-zinc-200 group-hover/contrib:text-indigo-300 transition-colors">
        {label}
      </a>
      {yc && (
        <span className="inline-flex items-center gap-0.5 font-bold text-[#FF6600] text-xs">
          <img src={ycLogo} alt="YC" className="h-3 w-3" />
          {yc}
        </span>
      )}
    </div>
  );
};

const AGENTS = [
  { name: "Devin", color: "#ef4444" },
  { name: "Claude", color: "#f97316" },
  { name: "Codex", color: "#3b82f6" },
  { name: "Pi", color: "#10b981" },
];

const AgentCursor = ({ name, color }: { name: string; color: string }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  
  const getBounds = () => {
    if (typeof document !== 'undefined') {
      return {
        w: document.documentElement.scrollWidth,
        h: document.documentElement.scrollHeight
      };
    }
    return { w: typeof window !== 'undefined' ? window.innerWidth : 1000, h: typeof window !== 'undefined' ? window.innerHeight : 1000 };
  };

  const initialBounds = getBounds();

  const posRef = useRef({ x: Math.random() * initialBounds.w, y: Math.random() * initialBounds.h });
  const targetRef = useRef({ x: Math.random() * initialBounds.w, y: Math.random() * initialBounds.h });
  const velRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      if (!cursorRef.current) return;

      const bounds = getBounds();

      // Check if their current target is outside the user's view
      const targetIsOutOfView = targetRef.current.y < window.scrollY || targetRef.current.y > window.scrollY + window.innerHeight;

      // Update target IMMEDIATELY if you scrolled away, otherwise update very rarely (smooth ambient movement)
      if (targetIsOutOfView || Math.random() < 0.005) {
        targetRef.current = {
          x: Math.random() * (bounds.w - 100),
          y: window.scrollY + Math.random() * (window.innerHeight - 100),
        };
      }

      const dx = targetRef.current.x - posRef.current.x;
      const dy = targetRef.current.y - posRef.current.y;
      
      // Gentle pull
      const k = 0.001; 
      let ax = dx * k;
      let ay = dy * k;

      // High friction for smooth, gliding movement
      const damping = 0.94; 
      velRef.current.x = (velRef.current.x + ax) * damping;
      velRef.current.y = (velRef.current.y + ay) * damping;

      // Almost unnoticeable random drift
      velRef.current.x += (Math.random() - 0.5) * 0.02;
      velRef.current.y += (Math.random() - 0.5) * 0.02;

      // Fast max velocity so they don't lag behind when scrolling fast, but rarely hit this speed ambiently
      const maxVel = 12.0;
      velRef.current.x = Math.max(-maxVel, Math.min(maxVel, velRef.current.x));
      velRef.current.y = Math.max(-maxVel, Math.min(maxVel, velRef.current.y));

      posRef.current.x += velRef.current.x;
      posRef.current.y += velRef.current.y;

      const maxX = bounds.w - 20;
      const maxY = bounds.h - 20;
      
      if (posRef.current.x < 0) { posRef.current.x = 0; velRef.current.x *= -1; }
      if (posRef.current.x > maxX) { posRef.current.x = maxX; velRef.current.x *= -1; }
      if (posRef.current.y < 0) { posRef.current.y = 0; velRef.current.y *= -1; }
      if (posRef.current.y > maxY) { posRef.current.y = maxY; velRef.current.y *= -1; }

      cursorRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      ref={cursorRef}
      className="absolute top-0 left-0 z-[100] pointer-events-none flex items-start gap-1.5 drop-shadow-lg"
      style={{ willChange: 'transform' }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: 'rotate(-15deg)', color }}
      >
        <path
          d="M7 2L20.8906 13.6265C21.849 14.4286 21.2828 15.986 20.0381 16.037L14.7731 16.2555L11.7588 21.4646C11.1396 22.5348 9.53986 22.3995 9.15579 21.2464L7 2Z"
          fill="currentColor"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <div 
        className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold whitespace-nowrap shadow-md mt-3"
        style={{ backgroundColor: color }}
      >
        {name} working...
      </div>
    </div>
  );
};

export function App() {
  const [leaves, setLeaves] = useState<LeafParticle[]>([]);
  const [bgLeaves, setBgLeaves] = useState<LeafParticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFading(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fading) {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [fading]);

  // Event listeners for Click and MouseMove
  useEffect(() => {
    const playClickSound = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } catch (err) {
        // Ignore audio errors
      }
    };

    const handleClick = (e: MouseEvent) => {
      playClickSound();
      
      const numLeaves = Math.floor(Math.random() * 3) + 4; // original 4-6 leaves
      const newLeaves: LeafParticle[] = [];
      const idPrefix = Date.now();
      
      for (let i = 0; i < numLeaves; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 30;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const rot = Math.random() * 360; 
        
        newLeaves.push({
          id: idPrefix + i,
          x: e.clientX,
          y: e.clientY,
          tx: `${tx}px`,
          ty: `${ty}px`,
          rot: `${rot}deg`,
          src: leafLogos[Math.floor(Math.random() * leafLogos.length)],
        });
      }
      
      setLeaves(prev => [...prev, ...newLeaves]);
      
      setTimeout(() => {
        setLeaves(prev => prev.filter(leaf => leaf.id < idPrefix || leaf.id >= idPrefix + numLeaves));
      }, 800);
    };

    let lastMove = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMove < 50) return; // original 50ms throttle
      lastMove = now;

      const count = Math.floor(Math.random() * 2) + 1; // original 1-2 trailing leaves
      const newLeaves: LeafParticle[] = [];
      const idPrefix = now;
      
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 30 + 15;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const rot = Math.random() * 360;
        
        newLeaves.push({
          id: idPrefix + i,
          x: e.clientX,
          y: e.clientY,
          tx: `${tx}px`,
          ty: `${ty}px`,
          rot: `${rot}deg`,
          src: leafLogos[Math.floor(Math.random() * leafLogos.length)],
        });
      }
      
      setLeaves(prev => [...prev, ...newLeaves]);
      
      setTimeout(() => {
        setLeaves(prev => prev.filter(leaf => leaf.id < idPrefix || leaf.id >= idPrefix + count));
      }, 800);
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Background slow CSS drift leaves
  useEffect(() => {
    const spawnBgLeaf = () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 200 + 100;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const rot = Math.random() * 720 - 360;
      const duration = Math.random() * 6 + 6;

      const leaf: LeafParticle = {
        id: Date.now() + Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        tx: `${tx}px`,
        ty: `${ty}px`,
        rot: `${rot}deg`,
        src: leafLogos[Math.floor(Math.random() * leafLogos.length)],
      };

      setBgLeaves(prev => [...prev, leaf]);

      setTimeout(() => {
        setBgLeaves(prev => prev.filter(l => l.id !== leaf.id));
      }, duration * 1000);
    };

    const interval = setInterval(spawnBgLeaf, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {loading && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}>
          <div className="relative flex items-center justify-center gap-3">
            <div className="absolute w-32 h-32 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
            <span className="text-2xl font-bold text-zinc-300 animate-spin relative z-10">cool</span>
            <img
              src={clickImage}
              alt="Loading"
              className="w-12 h-12 animate-spin relative z-10"
            />
            <span className="text-2xl font-bold text-zinc-300 animate-spin relative z-10">cool</span>
          </div>
        </div>
      )}
      <div className={loading ? "hidden" : ""}>
      <div className="relative min-h-screen overflow-x-hidden bg-black text-zinc-300 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Agent Cursors */}
      {!loading && AGENTS.map((agent, i) => (
        <AgentCursor key={i} name={agent.name} color={agent.color} />
      ))}
      
      {/* Background Floating Logos */}
      {bgLeaves.map(leaf => (
        <div
          key={leaf.id}
          className="bg-leaf-particle"
          style={{
            left: leaf.x,
            top: leaf.y,
            '--tx': leaf.tx,
            '--ty': leaf.ty,
            '--rot': leaf.rot,
            '--duration': `${leaf.id % 10 + 6}s`,
          } as React.CSSProperties}
        >
          <img src={leaf.src} alt="" className="w-6 h-6 opacity-20" />
        </div>
      ))}

      {/* Leaf Animation */}
      {leaves.map(leaf => (
        <div
          key={leaf.id}
          className="leaf-particle"
          style={{
            left: leaf.x,
            top: leaf.y,
            '--tx': leaf.tx,
            '--ty': leaf.ty,
            '--rot': leaf.rot,
          } as React.CSSProperties}
        >
          <img src={leaf.src} alt="" className="w-6 h-6" />
        </div>
      ))}

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto min-h-screen max-w-3xl px-6 py-12 md:px-12 md:py-20 lg:py-24">
        <div className="flex flex-col gap-16">
          
          {/* Header */}
          <header className="flex flex-col items-center text-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-zinc-300 to-white bg-clip-text text-transparent">
                Aaditya Sah
              </h1>
              <div className="mt-3 h-0.5 w-16 mx-auto rounded-full bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-600" />
              <h2 className="mt-4 text-lg font-medium tracking-tight text-zinc-200 sm:text-xl">
                Backend & Applied AI Engineer
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-zinc-400">
                Ai applied engineer, core system engineer(Rust) & distributed systems
              </p>
            </div>
            </header>

          {/* Right Main Content */}
          <main className="space-y-24">
            
            {/* About Section */}
            <section id="about" className="scroll-mt-16 md:scroll-mt-24">
              <div className="mb-6">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">About</h2>
              </div>
              <div className="space-y-4 text-zinc-400 leading-relaxed">
                <p>
                  Currently contributing to production engineering at <span className="inline-flex items-center gap-1 font-medium text-zinc-200">Shipd (<span className="inline-flex items-center gap-1 font-bold text-[#FF6600]"><img src={ycLogo} alt="YC" className="h-4 w-4" />W24</span>)</span>, with hands-on experience in API design, <span className="font-medium text-zinc-200">System design</span>, real-time LLM features, data modelling, Docker, CI/CD, model routing, context management, and <span className="font-medium text-zinc-200">agent evaluation</span>.
                </p>
                <p>
                  I've built and maintained <a href="https://clario-well.pages.dev/" target="_blank" rel="noreferrer" className="font-medium text-zinc-200 hover:text-indigo-300 transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]"><img src={clarioLogo} alt="Clario" className="h-5 w-5 inline align-middle rounded-sm" /><span className="ml-1">Clario</span></a>, serving <span className="font-medium text-zinc-200">5,000+ active users</span>. My expertise lies at the intersection of robust backend infrastructure and applied artificial intelligence, crafting reliable agent systems and APIs.
                </p>
              </div>
            </section>

            {/* Tech Stack Section */}
            <section id="tech-stack" className="scroll-mt-16 md:scroll-mt-24">
              <div className="mb-6">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">Tech Stack (19)</h2>
              </div>
              <div className="flex flex-wrap gap-2.5 ml-3">
                {[
                  { name: "Rust", logo: rustLogo },
                  { name: "TypeScript", logo: typescriptLogo },
                  { name: "FastAPI", logo: fastapiLogo },
                  { name: "gRPC", logo: grpcLogo },
                  { name: "pgvector", logo: pgvectorLogo },
                  { name: "LlamaIndex", logo: llamaindexLogo },
                  { name: "LangChain", logo: langchainLogo },
                  { name: "CrewAI", logo: crewaiLogo },
                  { name: "DSPy", logo: dspyLogo },
                  { name: "vLLM", logo: vllmLogo },
                  { name: "PyTorch", logo: pytorchLogo },
                  { name: "Hugging Face", logo: huggingfaceLogo },
                  { name: "Anchor", logo: anchorLogo },
                  { name: "Kubernetes", logo: kubernetesLogo },
                  { name: "Java", logo: javaLogo },
                  { name: "React", logo: reactLogo },
                  { name: "Redis", logo: redisLogo },
                  { name: "Docker", logo: dockerLogo },
                  { name: "System Design", icon: Server },
                ].map((tech, idx) => (
                  <TechBadge key={idx} tech={tech} idx={idx} />
                ))}
              </div>
            </section>

            {/* Experience Section */}
            <section id="experience" className="scroll-mt-16 md:scroll-mt-24">
              <div className="mb-8">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">Experience</h2>
              </div>
              
              <div className="group/list relative space-y-12 border-l border-zinc-800 ml-3">
                {/* Job 1 */}
                <div className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 pl-8">
                  <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-zinc-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
                  <div className="absolute -left-[6.5px] mt-1.5 h-3 w-3 rounded-full border-2 border-indigo-500 bg-black z-10"></div>
                  <header className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:col-span-2">
                    2026 — Present
                  </header>
                  <div className="z-10 sm:col-span-6">
                    <h3 className="font-medium leading-snug text-zinc-200">
                      <div>
                        <a 
                          className="inline-flex items-center gap-1.5 text-base font-medium text-zinc-200 hover:text-indigo-300 transition-colors group/link cursor-pointer" 
                          href="https://shipd.ai/" 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                          <span>Software Engineer · <img src={shipdLogo} alt="Shipd" className="h-4 w-4 rounded-sm inline" /> <span className="inline-flex items-center gap-1 text-base font-medium">Shipd (<span className="inline-flex items-center gap-1 font-bold text-[#FF6600]"><img src={ycLogo} alt="YC" className="h-4 w-4" />W24</span>)</span></span>
                          <ExternalLink className="ml-1 inline-block h-3.5 w-3.5 shrink-0 translate-y-0.5 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1" />
                        </a>
                      </div>
                    </h3>
                    <p className="mt-2 text-sm leading-normal text-zinc-400">
                      Contributing to production software engineering. Working across backend and applied-AI product development in a high-ownership startup environment.
                    </p>
                  </div>
                </div>

                {/* Job 2 */}
                <div className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 pl-8">
                  <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-zinc-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
                  <div className="absolute -left-[6.5px] mt-1.5 h-3 w-3 rounded-full border-2 border-indigo-500 bg-black z-10"></div>
                  <header className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:col-span-2">
                    Jan — Jul 2026
                  </header>
                  <div className="z-10 sm:col-span-6">
                    <h3 className="font-medium leading-snug text-zinc-200">
                      <div>
                        <a 
                          className="inline-flex items-center gap-1.5 text-base font-medium text-zinc-200 hover:text-indigo-300 transition-colors group/link cursor-pointer" 
                          href="https://www.aiecho.live/" 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                          <span>Full-Stack Developer · <img src={echoLogo} alt="Echo" className="h-4 w-4 rounded-sm inline" /> <span>Echo</span></span>
                          <ExternalLink className="ml-1 inline-block h-3.5 w-3.5 shrink-0 translate-y-0.5 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1" />
                        </a>
                      </div>
                      <div className="text-zinc-500 text-sm mt-1">No-Contact Breakup Wellness Startup</div>
                    </h3>
                    <p className="mt-2 text-sm leading-normal text-zinc-400">
                      Built and maintained a production Python/FastAPI and PostgreSQL backend for 1,000+ active users. Designed Supabase RLS schemas, Docker deployments on Railway, and implemented real-time LLM streaming through WebSockets. Owned Stripe-to-Dodo Payments migration.
                    </p>
                  </div>
                </div>

                {/* Job 3 */}
                <div className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 pl-8">
                  <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-zinc-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
                  <div className="absolute -left-[6.5px] mt-1.5 h-3 w-3 rounded-full border-2 border-indigo-500 bg-black z-10"></div>
                  <header className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:col-span-2">
                    2025 — 2026
                  </header>
                  <div className="z-10 sm:col-span-6">
                    <h3 className="font-medium leading-snug text-zinc-200">
                      <div>
                        <a 
                          className="inline-flex items-center gap-1.5 text-base font-medium text-zinc-200 hover:text-indigo-300 transition-colors group/link cursor-pointer" 
                          href="https://www.deltaww.com/en-US/index" 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                          <span>Backend Developer · <img src={deltaLogo} alt="Delta Electronics" className="h-4 w-4 rounded-sm inline" /> <span>Delta Electronics</span></span>
                          <ExternalLink className="ml-1 inline-block h-3.5 w-3.5 shrink-0 translate-y-0.5 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1" />
                        </a>
                      </div>
                    </h3>
                    <p className="mt-2 text-sm leading-normal text-zinc-400">
                      Built REST APIs and internal data-product services with Node.js, Express, and Bun. Developed a multi-provider LLM wrapper with Redis caching. Built ETL-style transformation pipelines.
                    </p>
                  </div>
                </div>

                {/* Job 4 */}
                <div className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 pl-8">
                  <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-zinc-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
                  <div className="absolute -left-[6.5px] mt-1.5 h-3 w-3 rounded-full border-2 border-indigo-500 bg-black z-10"></div>
                  <header className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:col-span-2">
                    Project-based
                  </header>
                  <div className="z-10 sm:col-span-6">
                    <h3 className="font-medium leading-snug text-zinc-200">
                      <div>
                        <a 
                          className="inline-flex items-center gap-1.5 text-base font-medium text-zinc-200 hover:text-indigo-300 transition-colors group/link cursor-pointer" 
                          href="https://digitalnirman.vercel.app/" 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                          <span>SDE I - Backend · <img src={digitalNirmanLogo} alt="Digital Nirman" className="h-4 w-4 rounded-sm inline" /> <span>Digital Nirman</span></span>
                          <ExternalLink className="ml-1 inline-block h-3.5 w-3.5 shrink-0 translate-y-0.5 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1" />
                        </a>
                      </div>
                      <div className="text-zinc-500 text-sm mt-1">School Management SaaS</div>
                    </h3>
                    <p className="mt-2 text-sm leading-normal text-zinc-400">
                      Built multi-tenant backend APIs and data models. Applied SOLID design principles across Node.js, React, Nginx, and Rust development.
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* Projects Section */}
            <section id="projects" className="scroll-mt-16 md:scroll-mt-24">
              <div className="mb-8">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">Projects</h2>
              </div>
              
              <div className="group/list relative space-y-16 pl-6 border-l border-zinc-800 ml-3">
                
                {[
                  {
                    name: "Lemda - Terminal Agent",
                    desc: "Reached the top of a Terminal-Bench leaderboard through autonomous terminal execution and end-to-end task completion.",
                    link: "https://lemda.pages.dev",
                    logo: lamdaLogo
                  },
                  {
                    name: "Hermes / Clawbot Agent",
                    desc: "Built a memory-rich, full-stack agent with open-source Slack and WhatsApp integrations for persistent multi-channel workflows.",
                    link: "https://github.com/aadityakumarsah/hermes",
                    logo: hermesLogo
                  },
                  {
                    name: "Model Router",
                    desc: "Built a routing layer that selects the best model for each task using capability, latency, cost, and availability signals, with policy controls and fallbacks.",
                    link: "https://github.com/aadityakumarsah/model-router",
                    logo: modelRouterLogo
                  },
                  {
                   name: "Dhukuti Protocol",
                   desc: "A trustless rotating savings system (ROSCA) built on the Solana blockchain. Click to view the full protocol documentation & reference guide.",
                   link: "https://docs-dhukuti-protocol.vercel.app/",
                   logo: nagrikLogo
                  }
                ].map((project, i) => (
                  <div key={i} className="group relative grid gap-4 pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4">
                    <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-zinc-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
                    <div className="z-10 sm:col-span-8">
                      <h3 className="font-medium leading-snug text-zinc-200">
                        <a className="inline-flex items-center gap-2 font-medium leading-tight text-zinc-200 hover:text-indigo-300 focus-visible:text-indigo-300 group/link text-base" href={project.link} target="_blank" rel="noreferrer">
                          <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                          {project.logo && <img src={project.logo} alt="" className="h-5 w-5 rounded-sm" />}
                          <span>{project.name}</span>
                          <ExternalLink className="ml-1 inline-block h-3.5 w-3.5 shrink-0 translate-y-0.5 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1" />
                        </a>
                      </h3>
                      <p className="mt-2 text-sm leading-normal text-zinc-400">
                        {project.desc}
                      </p>
                    </div>
                  </div>
                ))}

              </div>
            </section>

            {/* Achievements Section */}
            <section className="scroll-mt-16 md:scroll-mt-24">
               <div className="flex items-center gap-3 mb-6">
                <Trophy size={20} className="text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Selected Achievements</h2>
              </div>
              <ul className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                <li className="flex items-start gap-3">
                  <ChevronRight size={16} className="text-indigo-500 mt-1 shrink-0" />
                  <span>Winner, Health Theme - <img src={openaiLogo} alt="OpenAI" className="h-3.5 w-3.5 inline align-middle" /><span className="font-bold text-white ml-1">OpenAI</span>{' '}Build Week (50,000 participants).</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight size={16} className="text-indigo-500 mt-1 shrink-0" />
                  <span>Winner, Nepal's biggest fintech <img src={esewaLogo} alt="eSewa" className="h-3.5 w-3.5 inline align-middle rounded-sm" /><span className="text-white font-bold ml-1">eSewa</span> x <img src={wwfLogo} alt="WWF" className="h-3.5 w-3.5 inline align-middle rounded-sm" /><span className="text-white font-bold ml-1">WWF</span> Hackathon</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight size={16} className="text-indigo-500 mt-1 shrink-0" />
                  <span>Organizer, Daydream Biratnagar (<img src={hackClubLogo} alt="Hack Club" className="h-3.5 w-3.5 inline align-middle rounded-sm" /><span className="text-white font-bold ml-1">Hack Club</span>).</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight size={16} className="text-indigo-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-zinc-200 block mb-2">Open-source contributor:</span>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                      {[
                        { logo: cogneeLogo, href: "https://cognee.ai", label: "Cognee" },
                        { logo: mastraLogo, href: "https://mastra.ai", label: "Mastra", yc: "W25" },
                        { logo: modelenceLogo, href: "https://modelence.com", label: "Modelence", yc: "S25" },
                        { logo: metaLogo, href: "https://opensource.fb.com", label: "Meta" },
                        { logo: openClawLogo, href: "https://openclaw.ai", label: "OpenClaw" },
                        { logo: insforgeLogo, href: "https://insforge.dev", label: "InsForge", yc: "P26" },
                        { logo: fossasiaLogo, href: "https://fossasia.org", label: "FOSS Asia" },
                        { logo: kiloCodeLogo, href: "https://kilo.ai", label: "KiloCode" },
                      ].map((contrib, i) => (
                        <ContribBadge
                          key={i}
                          idx={i}
                          logo={contrib.logo}
                          href={contrib.href}
                          label={contrib.label}
                          yc={contrib.yc}
                        />
                      ))}
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight size={16} className="text-indigo-500 mt-1 shrink-0" />
                  <span><img src={ycLogo} alt="YC" className="h-3.5 w-3.5 inline align-middle" /><span className="font-bold text-[#FF6600] ml-1">Y Combinator</span> Startup School India - selected participant for founders building AI-era products.</span>
                </li>
              </ul>
            </section>

            {/* Education Section */}
            <section className="scroll-mt-16 md:scroll-mt-24">
               <div className="flex items-center gap-3 mb-6">
                <GraduationCap size={20} className="text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Education</h2>
              </div>
              <div className="space-y-6 text-sm">
                <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 -mx-4 rounded-xl transition-all hover:bg-zinc-800/50">
                  <div>
                    <h3 className="font-semibold text-zinc-200">Bachelor of Science in Data Science & AI</h3>
                    <p className="font-medium text-zinc-300 inline-flex items-center gap-1.5"><img src={bitsPilaniLogo} alt="BITS Pilani" className="h-4 w-4 rounded-sm" /> BITS Pilani</p>
                  </div>
                  <span className="text-zinc-500 font-medium bg-zinc-900/80 px-3 py-1 rounded-full text-xs border border-zinc-800">Started Aug 2026</span>
                </div>
                
                <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 -mx-4 rounded-xl transition-all hover:bg-zinc-800/50">
                  <div className="z-10">
                    <h3 className="font-semibold text-zinc-200">
                      <a 
                        className="inline-flex items-center gap-1 font-semibold text-zinc-200 hover:text-indigo-300 transition-colors group/link cursor-pointer text-base" 
                        href="https://www.facebook.com/photo?fbid=1410878644400236&set=a.550394217115354" 
                        target="_blank" 
                        rel="noreferrer"
                      >
                        <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                        <span>High School (+2), Science Stream</span>
                        <ExternalLink className="ml-1 inline-block h-3.5 w-3.5 shrink-0 translate-y-0.5 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1" />
                      </a>
                    </h3>
                    <p className="text-zinc-500 inline-flex items-center gap-1.5"><img src={arnikoLogo} alt="Arniko College" className="h-4 w-4 rounded-sm" /> Arniko College, Biratnagar, Nepal</p>
                  </div>
                  <span className="text-zinc-500 font-medium bg-zinc-900/80 px-3 py-1 rounded-full text-xs border border-zinc-800 z-10">Graduated 2026</span>
                </div>
              </div>

            </section>

            {/* GitHub Contribution */}
            <section className="scroll-mt-16 md:scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <GitBranch size={20} className="text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Contribution</h2>
              </div>
              <a href="https://github.com/aadityakumarsah" target="_blank" rel="noreferrer" className="block p-3 rounded-xl border-2 border-zinc-700/50 hover:border-indigo-500/50 bg-zinc-900/30 transition-all duration-300">
                <img
                  src={githubContrib}
                  alt="GitHub Contribution"
                  className="w-full rounded-lg"
                />
              </a>
            </section>


          </main>
          
          {/* Footer Questions & Contacts */}
          <footer className="mt-16 pt-12 border-t border-zinc-800 flex flex-col gap-12 pb-16">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-6">
                What I ask myself while building
              </h2>
              <div className="space-y-4 ml-3">
                <div className="flex gap-4 items-start p-4 rounded-lg border border-zinc-800 bg-zinc-900/20 hover:border-indigo-500/30 transition-all duration-300 group">
                  <span className="font-bold text-indigo-400 select-none group-hover:text-indigo-300 transition-colors">Q1</span>
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">What all services do you need (fe/be etc)?</span>
                </div>
                <div className="flex gap-4 items-start p-4 rounded-lg border border-zinc-800 bg-zinc-900/20 hover:border-indigo-500/30 transition-all duration-300 group">
                  <span className="font-bold text-indigo-400 select-none group-hover:text-indigo-300 transition-colors">Q2</span>
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">What happens if a server running your agent crashes?</span>
                </div>
                <div className="flex gap-4 items-start p-4 rounded-lg border border-zinc-800 bg-zinc-900/20 hover:border-indigo-500/30 transition-all duration-300 group">
                  <span className="font-bold text-indigo-400 select-none group-hover:text-indigo-300 transition-colors">Q3</span>
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">How would you do context management?</span>
                </div>
                <div className="flex gap-4 items-start p-4 rounded-lg border border-zinc-800 bg-zinc-900/20 hover:border-indigo-500/30 transition-all duration-300 group">
                  <span className="font-bold text-indigo-400 select-none group-hover:text-indigo-300 transition-colors">Q4</span>
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">How would you evaluate your agent?</span>
                </div>
                <div className="flex gap-4 items-start p-4 rounded-lg border border-zinc-800 bg-zinc-900/20 hover:border-indigo-500/30 transition-all duration-300 group">
                  <span className="font-bold text-indigo-400 select-none group-hover:text-indigo-300 transition-colors">Q5</span>
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">What metrics do you observe as your app grows?</span>
                </div>
              </div>
            </div>

            {/* Contacts & Socials Divider */}
            <div className="border-t border-zinc-800/80 pt-8 flex flex-col items-center gap-6">
              <div className="flex flex-wrap justify-center gap-8 text-zinc-400 text-sm font-medium">
                <a href="mailto:aadityakumarsah259@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail size={18} />
                  <span>aadityakumarsah259@gmail.com</span>
                </a>
                <a href="https://wa.me/9779827068776" className="flex items-center gap-2 hover:text-white transition-colors" target="_blank" rel="noreferrer">
                  <Phone size={18} />
                  <span>+977 9827068776</span>
                </a>
                <div className="flex items-center gap-2 select-none">
                  <MapPin size={18} />
                  <span>Biratnagar, Nepal</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-8 text-zinc-400 text-sm font-medium">
                <a href="https://github.com/aadityakumarsah" className="flex items-center gap-2 hover:text-white transition-colors" target="_blank" rel="noreferrer">
                  <GitBranch size={18} />
                  <span>GitHub</span>
                </a>
                <a href="https://www.linkedin.com/in/aaditya-sah-516178308" className="flex items-center gap-2 hover:text-white transition-colors" target="_blank" rel="noreferrer">
                  <Globe size={18} />
                  <span>LinkedIn</span>
                </a>
                <a href="https://x.com/aadityakumarsa" className="flex items-center gap-2 hover:text-white transition-colors" target="_blank" rel="noreferrer">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  <span>X</span>
                </a>
              </div>
            </div>
          </footer>
        </div>

        </div>
      </div>
    </div>


    </>
  );
}

export default App;