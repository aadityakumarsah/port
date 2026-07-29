import React, { useState, useEffect } from "react";
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

import "./index.css";

interface LeafParticle {
  id: number;
  x: number;
  y: number;
  tx: string;
  ty: string;
  rot: string;
}

export function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [leaves, setLeaves] = useState<LeafParticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

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
        // Ignore audio errors (e.g. if autoplay policy blocks it)
      }
    };

    const handleClick = (e: MouseEvent) => {
      playClickSound();
      
      const numLeaves = Math.floor(Math.random() * 3) + 4;
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
        });
      }
      
      setLeaves(prev => [...prev, ...newLeaves]);
      
      setTimeout(() => {
        setLeaves(prev => prev.filter(leaf => leaf.id < idPrefix || leaf.id >= idPrefix + numLeaves));
      }, 800);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
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
      
      {/* Click Animation */}
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
          <img src={clickImage} alt="" className="w-6 h-6" />
        </div>
      ))}

      {/* Cursor Glow Animation */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition duration-300 lg:absolute"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.08), transparent 80%)`
        }}
      />

      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF6600]/10 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] mix-blend-multiply" />
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
                Building production <span className="text-zinc-300 font-medium">FastAPI/PostgreSQL</span> services, full-stack products, and agent systems.
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
                  Currently contributing to production engineering at <span className="inline-flex items-center gap-1 font-medium text-zinc-200">Shipd (<span className="inline-flex items-center gap-1 font-bold text-[#FF6600]"><img src={ycLogo} alt="YC" className="h-4 w-4" />W24</span>)</span>, with hands-on experience in API design, real-time LLM features, data modelling, Docker, CI/CD, model routing, context management, and agent evaluation.
                </p>
                <p>
                  I've built and maintained <a href="https://clario-well.pages.dev/" target="_blank" rel="noreferrer" className="font-medium text-zinc-200 hover:text-indigo-300 transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]"><img src={clarioLogo} alt="Clario" className="h-5 w-5 inline align-middle rounded-sm" /><span className="ml-1">Clario</span></a>, serving <span className="font-medium text-zinc-200">5,000+ active users</span>. My expertise lies at the intersection of robust backend infrastructure and applied artificial intelligence, crafting reliable agent systems and APIs.
                </p>
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
                        <a className="inline-flex items-baseline font-medium leading-tight text-zinc-200 hover:text-indigo-300 focus-visible:text-indigo-300 group/link text-base" href="#" target="_blank" rel="noreferrer">
                          <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                          <span className="inline-flex items-center gap-1.5">Software Engineer · <img src={shipdLogo} alt="Shipd" className="h-4 w-4 rounded-sm" /> <span className="inline-flex items-center gap-1">Shipd (<span className="inline-flex items-center gap-1 font-bold text-[#FF6600]"><img src={ycLogo} alt="YC" className="h-4 w-4" />W24</span>)</span></span>
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
                        <a className="inline-flex items-baseline font-medium leading-tight text-zinc-200 hover:text-indigo-300 focus-visible:text-indigo-300 group/link text-base" href="#" target="_blank" rel="noreferrer">
                          <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                          <span className="inline-flex items-center gap-1.5">Full-Stack Developer · <img src={echoLogo} alt="Echo" className="h-4 w-4 rounded-sm" /> <span>Echo</span></span>
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
                        <span className="inline-flex items-center gap-1.5 text-base font-medium group-hover:text-indigo-300 transition-colors">Backend Developer · <img src={deltaLogo} alt="Delta Electronics" className="h-4 w-4 rounded-sm" /> Delta Electronics</span>
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
                        <span className="inline-flex items-center gap-1.5 text-base font-medium group-hover:text-indigo-300 transition-colors">SDE I - Backend · <img src={digitalNirmanLogo} alt="Digital Nirman" className="h-4 w-4 rounded-sm" /> Digital Nirman</span>
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
                    link: "https://github.com/aadityakumarsah/lemda",
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
                    name: "NagarikAI",
                    desc: "Built Anchor/Rust smart contracts and FastAPI AI agents for automated verification using ZK identity, prediction markets, and distributed data services.",
                    link: "https://github.com/aadityakumarsah/Dhukuti-Protocol",
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
                  <ChevronRight size={16} className="text-indigo-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-zinc-200">Open-source contributor:</span>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 [&>*]:border [&>*]:border-zinc-700/50 [&>*]:rounded-md [&>*]:px-2 [&>*]:py-1">
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <img src={cogneeLogo} alt="Cognee" className="h-4 w-4 rounded-sm" />
                        <a href="https://cognee.ai" target="_blank" rel="noreferrer" className="font-medium text-zinc-200 hover:text-indigo-300 transition-colors">Cognee</a>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <img src={mastraLogo} alt="Mastra" className="h-4 w-4 rounded-sm" />
                        <a href="https://mastra.ai" target="_blank" rel="noreferrer" className="font-medium text-zinc-200 hover:text-indigo-300 transition-colors">Mastra</a>
                        <span className="inline-flex items-center gap-0.5 font-bold text-[#FF6600] text-xs"><img src={ycLogo} alt="YC" className="h-3 w-3" />W25</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <img src={modelenceLogo} alt="Modelence" className="h-4 w-4 rounded-sm" />
                        <a href="https://modelence.com" target="_blank" rel="noreferrer" className="font-medium text-zinc-200 hover:text-indigo-300 transition-colors">Modelence</a>
                        <span className="inline-flex items-center gap-0.5 font-bold text-[#FF6600] text-xs"><img src={ycLogo} alt="YC" className="h-3 w-3" />S25</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <img src={metaLogo} alt="Meta" className="h-4 w-4 rounded-sm" />
                        <a href="https://opensource.fb.com" target="_blank" rel="noreferrer" className="font-medium text-zinc-200 hover:text-indigo-300 transition-colors">Meta</a>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <img src={openClawLogo} alt="OpenClaw" className="h-4 w-4 rounded-sm" />
                        <a href="https://openclaw.ai" target="_blank" rel="noreferrer" className="font-medium text-zinc-200 hover:text-indigo-300 transition-colors">OpenClaw</a>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <img src={shipSecLogo} alt="ShipSec" className="h-4 w-4 rounded-sm" />
                        <a href="https://shipsec.ai" target="_blank" rel="noreferrer" className="font-medium text-zinc-200 hover:text-indigo-300 transition-colors">ShipSec</a>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <img src={kiloCodeLogo} alt="KiloCode" className="h-4 w-4 rounded-sm" />
                        <a href="https://kilo.ai" target="_blank" rel="noreferrer" className="font-medium text-zinc-200 hover:text-indigo-300 transition-colors">KiloCode</a>
                      </span>
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight size={16} className="text-indigo-500 mt-1 shrink-0" />
                  <span>Winner, <img src={esewaLogo} alt="eSewa" className="h-3.5 w-3.5 inline align-middle rounded-sm" /><span className="text-white font-bold ml-1">eSewa</span> x <img src={wwfLogo} alt="WWF" className="h-3.5 w-3.5 inline align-middle rounded-sm" /><span className="text-white font-bold ml-1">WWF Hackathon</span>; Organizer, Daydream Biratnagar (Hack Club).</span>
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
                  <div>
                    <h3 className="font-semibold text-zinc-200">High School (+2), Science Stream</h3>
                    <p className="text-zinc-500 inline-flex items-center gap-1.5"><img src={arnikoLogo} alt="Arniko College" className="h-4 w-4 rounded-sm" /> Arniko College, Biratnagar, Nepal</p>
                  </div>
                  <span className="text-zinc-500 font-medium bg-zinc-900/80 px-3 py-1 rounded-full text-xs border border-zinc-800">Graduated 2026</span>
                </div>
              </div>

            </section>

            {/* My Stacks */}
            <section className="scroll-mt-16 md:scroll-mt-24">
              <div className="mb-6">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">My Stacks</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "System Design", dot: "bg-slate-400" },
                  { name: "Distributed Systems", dot: "bg-zinc-400" },
                  { name: "Redis", dot: "bg-red-500" },
                  { name: "AWS", dot: "bg-amber-500" },
                  { name: "TypeScript", dot: "bg-blue-500" },
                  { name: "Java", dot: "bg-orange-500" },
                  { name: "React", dot: "bg-cyan-400" },
                  { name: "FastAPI", dot: "bg-teal-500" },
                  { name: "Rust", dot: "bg-orange-600" },
                  { name: "PostgreSQL", dot: "bg-blue-600" },
                  { name: "Docker", dot: "bg-blue-500" },
                  { name: "Linux", dot: "bg-yellow-500" },
                  { name: "Microservices", dot: "bg-indigo-400" },
                  { name: "REST API", dot: "bg-cyan-600" },
                  { name: "DSA", dot: "bg-emerald-500" },
                  { name: "Database Design", dot: "bg-blue-500" },
                  { name: "Production Debugging", dot: "bg-red-600" },
                  { name: "CI/CD", dot: "bg-sky-500" },
                  { name: "Pinecone", dot: "bg-emerald-500" },
                  { name: "AI Agents", dot: "bg-purple-500" },
                ].map((skill) => (
                  <span key={skill.name} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-200 border border-zinc-700/50 bg-zinc-900/60 hover:bg-zinc-800 hover:border-zinc-600 hover:scale-105 transition-all duration-200">
                    <span className={`inline-block h-2 w-2 rounded-full ${skill.dot} shadow-sm`} />
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>

          </main>
          
          {/* Footer Contacts */}
          <footer className="mt-12 pt-8 border-t border-zinc-800 flex flex-col items-center justify-center gap-6 pb-12">
            <div className="flex flex-wrap justify-center gap-8 text-zinc-400 text-sm font-medium">
              <a href="mailto:shahsudha259@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={18} />
                <span>shahsudha259@gmail.com</span>
              </a>
              <a href="tel:+9779827068776" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={18} />
                <span>+977 9827068776</span>
              </a>
              <div className="flex items-center gap-2">
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
          </footer>
        </div>

        </div>
      </div>
    </div>
    </>
  );
}

export default App;