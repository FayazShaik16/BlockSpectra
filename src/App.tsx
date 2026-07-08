import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ShieldCheck, Wallet, ShieldAlert, FileText, Network, CheckCircle2, Copy, Terminal, Zap, ArrowUpRight, Upload, Cpu, Search, Download, History, ExternalLink, RefreshCw, AlertTriangle, Info, Check, Flame, Activity, BookOpen, Menu, X } from 'lucide-react';
import introVideo from './assets/intro.mp4';
import Blogo from './assets/Blogo.png';
import Wlogo from './assets/Wlogo.png';
import { ReactFlow, Background, Controls, MiniMap, MarkerType, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTranslation, getToolTranslationKeys } from './translations';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";


const platformItems = [
  { name: 'Smart Contract Analysis', desc: 'Verify contract safety and structure' },
  { name: 'Wallet Intelligence', desc: 'Trace wallet behavior and transactions' },
  { name: 'Transaction Simulator', desc: 'Simulate transactions and assess state changes & risks' },
  { name: 'Report Generator', desc: 'AI-powered multi-chain report workspace' },
  { name: 'Universal Decoder', desc: 'Decode and analyze multi-chain transaction payloads' },
  { name: 'Event Intelligence', desc: 'Analyze real-time event logs, upgrades, swaps, and alerts' },
  { name: 'Threat Intelligence', desc: 'Stay updated with Web3 threat intelligence' },
  { name: 'Risk Engine', desc: 'Aggregate multi-dimensional telemetry feeds to compute centralized threat scores' },
  { name: 'Attack Graphs', desc: 'Visualize vulnerability paths and attack vectors' },
  { name: 'Bridge Intelligence', desc: 'Track cross-chain bridge flows, anomalies, and exploit patterns' },
  { name: 'AI Investigator', desc: 'Conversational AI for multi-chain blockchain investigations' },
  { name: 'Documentation Hub', desc: 'Complete resources and technical explanations for all tools' },
];

const platformDropdownItems = [
  { name: 'Report Generator', desc: 'AI-powered multi-chain report workspace' },
  { name: 'Universal Decoder', desc: 'Decode and analyze multi-chain transaction payloads' },
  { name: 'Event Intelligence', desc: 'Analyze real-time event logs, upgrades, swaps, and alerts' },
  { name: 'Threat Intelligence', desc: 'Stay updated with Web3 threat intelligence' },
  { name: 'Risk Engine', desc: 'Aggregate multi-dimensional telemetry feeds to compute centralized threat scores' },
  { name: 'Attack Graphs', desc: 'Visualize vulnerability paths and attack vectors' },
  { name: 'Bridge Intelligence', desc: 'Track cross-chain bridge flows, anomalies, and exploit patterns' },
  { name: 'Documentation Hub', desc: 'Complete resources and technical explanations for all tools' },
];





const problems = [
  {
    title: 'Hidden Vulnerabilities',
    desc: 'Undetected backdoors, reentrancy exploits, and malicious logic patterns hiding in smart contracts.',
    delay: 0,
    key: 'problem.0'
  },
  {
    title: 'Complex Attack Paths',
    desc: 'Multi-step exploits spanning multiple protocol boundaries, flash loans, and dynamic state manipulation.',
    delay: 0.3,
    key: 'problem.1'
  },
  {
    title: 'Malicious Wallet Activity',
    desc: 'Tracing transaction paths through mixers, dynamic routing, and dark web funding mechanisms.',
    delay: 0.6,
    key: 'problem.2'
  },
  {
    title: 'Limited Visual Intelligence',
    desc: 'Debugging raw hex data dumps, address logs, and flat trace logs with zero relationship mapping.',
    delay: 0.9,
    key: 'problem.3'
  },
];

const solutionFeatures = [
  {
    id: 0,
    title: 'Smart Contract Analysis',
    desc: 'Verify contract safety, check code structure, and detect security vulnerabilities automatically.',
    icon: ShieldCheck,
    color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    glow: 'from-emerald-500/10 to-transparent',
  },
  {
    id: 1,
    title: 'Wallet Intelligence',
    desc: 'Trace address behavior, map transactions, and audit token flows in real-time.',
    icon: Wallet,
    color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    glow: 'from-amber-500/10 to-transparent',
  },
  {
    id: 2,
    title: 'Threat Intelligence',
    desc: 'Aggregated Web3 exploit feeds and proactive alerts on emerging zero-day vulnerabilities.',
    icon: ShieldAlert,
    color: 'text-red-400 border-red-500/20 bg-red-500/5',
    glow: 'from-red-500/10 to-transparent',
  },
  {
    id: 3,
    title: 'Visual Reports',
    desc: 'Clean, publication-ready security audits and interactive threat summaries.',
    icon: FileText,
    color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
    glow: 'from-cyan-500/10 to-transparent',
  },
  {
    id: 4,
    title: 'Attack Graphs',
    desc: 'Visualize security threat vectors and transaction chains through interactive graph systems.',
    icon: Network,
    color: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
    glow: 'from-purple-500/10 to-transparent',
  },
  {
    id: 5,
    title: 'Transaction Simulator',
    desc: 'Simulate transactions across EVM, Solana, Sui, and Aptos ecosystems to inspect storage, trace calls, and diagnose exploit risks.',
    icon: Cpu,
    color: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    glow: 'from-blue-500/10 to-transparent',
  },
];

const floatAnimation = (delay: number) => ({
  y: [0, -8, 0],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: 'easeInOut' as const,
    delay: delay,
  },
});

// CountUp component triggers counting up when it enters the viewport
const CountUp = ({ value, duration = 1.5 }: { value: string; duration?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (!isInView) return;

    const match = value.match(/^([\d.]+)(.*)$/);
    if (!match) {
      requestAnimationFrame(() => setDisplayValue(value));
      return;
    }

    const targetNum = parseFloat(match[1]);
    const suffix = match[2] || '';
    const isDecimal = match[1].includes('.');

    let startTimestamp: number | null = null;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      const easeProgress = progress * (2 - progress); // easeOutQuad
      const currentNum = easeProgress * targetNum;
      
      if (isDecimal) {
        setDisplayValue(currentNum.toFixed(1) + suffix);
      } else {
        setDisplayValue(Math.floor(currentNum).toLocaleString() + suffix);
      }

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, value, duration]);

  return <span ref={ref}>{displayValue || '0'}</span>;
};

// Framer Motion staggered animation configuration
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
} as const;

// Fade-up animations with blur transitions as requested
const itemVariants = {
  hidden: { y: 30, opacity: 0, filter: 'blur(4px)' },
  visible: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 14,
    },
  },
} as const;

// Dropdown component
const DropdownMenu = ({
  items,
  isDark,
  onItemClick,
}: {
  items: typeof platformItems;
  isDark?: boolean;
  onItemClick?: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 sm:w-80 rounded-2xl shadow-xl p-3 grid gap-1 z-50 text-left border ${
        isDark
          ? 'bg-[#12131b]/95 border-white/[0.08] backdrop-blur-md shadow-black/40'
          : 'bg-white border-gray-200'
      }`}
    >
      {items.map((item) => {
        const keys = getToolTranslationKeys(item.name);
        const nameText = keys.name ? t(keys.name) : item.name;
        const descText = keys.desc ? t(keys.desc) : item.desc;

        return (
          <a
            key={item.name}
            href={`#${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={onItemClick}
            className={`group flex flex-col p-2.5 rounded-xl transition-colors duration-200 ${
              isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.03]'
            }`}
          >
            <span className={`text-[12px] font-semibold transition-colors ${
              isDark ? 'text-gray-200 group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-500'
            }`}>
              {nameText}
            </span>
            <span className={`text-[10px] font-normal mt-0.5 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {descText}
            </span>
          </a>
        );
      })}
    </motion.div>
  );
};

const AI_REPORT_LINES = [
  "Initializing AI transaction audit...",
  "Scanning contract bytecodes...",
  "Exploit path traced to withdraw().",
  "Threat severity: CRITICAL (94/100)",
  "Generating patch recommendation..."
];

const BentoAITypingText = () => {
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const fullText = AI_REPORT_LINES[currentLineIdx];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText(fullText.substring(0, currentText.length - 1));
      }, 30);
    } else {
      timer = setTimeout(() => {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      }, 50);
    }

    if (!isDeleting && currentText === fullText) {
      timer = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && currentText === "") {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setCurrentLineIdx((prev) => (prev + 1) % AI_REPORT_LINES.length);
      }, 200);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentLineIdx]);

  return (
    <span className="font-mono text-emerald-400 text-xs tracking-tight">
      {currentText}
      <span className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-1 animate-pulse" />
    </span>
  );
};


const ShowcaseTabContent = ({ activeTab }: { activeTab: number }) => {
  if (activeTab === 0) {
    return (
      <div className="w-full h-full flex flex-col md:flex-row gap-6 p-4 sm:p-6 text-left font-mono text-[8px] xs:text-[9px] sm:text-[11px] leading-relaxed text-gray-300">
        {/* Left pane: solidity code editor */}
        <div className="flex-1 bg-black/35 rounded-xl p-3 sm:p-4 border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="text-gray-500 font-semibold mb-2 sm:mb-3 border-b border-white/5 pb-2 uppercase tracking-widest text-[7px] sm:text-[8px]">
              📄 audit_target.sol
            </div>
            <div className="space-y-0.5 select-none text-left">
              <div><span className="text-gray-600 inline-block w-4 mr-2 text-right font-sans">01</span><span className="text-purple-400">contract</span> <span className="text-blue-400">LiquidityPool</span> {'{'}</div>
              <div><span className="text-gray-600 inline-block w-4 mr-2 text-right font-sans">02</span>  <span className="text-purple-400">mapping</span>(address =&gt; uint) <span className="text-purple-400">public</span> deposits;</div>
              <div className="bg-red-500/10 border-l-2 border-red-500 pl-1"><span className="text-gray-600 inline-block w-4 mr-2 text-right font-sans">03</span>  <span className="text-purple-400">function</span> <span className="text-amber-400">drain</span>() <span className="text-purple-400">external</span> {'{'}</div>
              <div className="bg-red-500/10 border-l-2 border-red-500 pl-1"><span className="text-gray-600 inline-block w-4 mr-2 text-right font-sans">04</span>    (bool ok, ) = msg.sender.call{'{'}value: deposits[msg.sender]{'}'}("");</div>
              <div><span className="text-gray-600 inline-block w-4 mr-2 text-right font-sans">05</span>    deposits[msg.sender] = 0;</div>
              <div><span className="text-gray-600 inline-block w-4 mr-2 text-right font-sans">06</span>  {'}'}</div>
              <div><span className="text-gray-600 inline-block w-4 mr-2 text-right font-sans">07</span>{'}'}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-red-400 text-[7px] sm:text-[8px] bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
            <span>⚠️</span>
            <span>CRITICAL REENTRANCY PATH DETECTED: Deposits cleared after call.</span>
          </div>
        </div>

        {/* Right pane: dial progress & audit checks */}
        <div className="w-full md:w-56 flex flex-col gap-4 font-sans">
          {/* Circular dial rating */}
          <div className="bg-black/35 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
            <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                stroke="#10b981"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 * 0.05 }} // 95% complete
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-3">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">99.2%</span>
              <span className="text-[6px] sm:text-[7px] text-gray-500 font-bold uppercase tracking-widest">Accuracy</span>
            </div>
          </div>
          {/* Checklist metrics */}
          <div className="bg-black/35 rounded-xl p-3 sm:p-4 border border-white/5 flex-1 flex flex-col justify-center gap-2 text-[8px] sm:text-[10px]">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>Static Verification Complete</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>Symbolic Execution Pass</span>
            </div>
            <div className="flex items-center gap-2 text-red-400 font-semibold">
              <ShieldAlert className="w-3 h-3 shrink-0" />
              <span>1 Vulnerability Flagged</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 1) {
    return (
      <div className="w-full h-full flex flex-col md:flex-row gap-6 p-4 sm:p-6 text-left text-gray-300 font-sans">
        {/* Left pane: node connection network */}
        <div className="flex-1 bg-black/35 rounded-xl p-4 border border-white/5 relative overflow-hidden flex items-center justify-center">
          <div className="relative w-full h-36 sm:h-40 flex items-center justify-center">
            
            {/* Center target wallet node */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center z-10"
            >
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              <span className="text-[7px] sm:text-[8px] font-mono text-gray-400 mt-1">Main Address</span>
            </motion.div>

            {/* Satellite 1 */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-2 left-6 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/5 border border-white/10 text-[8px] sm:text-[9px] font-mono"
            >
              0x92f...a1c
            </motion.div>
            <div className="absolute top-8 left-12 w-12 h-[1px] bg-dashed bg-white/10 -rotate-45 origin-left" />

            {/* Satellite 2 */}
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-2 right-6 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-red-500/5 border border-red-500/20 text-[8px] sm:text-[9px] font-mono text-red-400"
            >
              Mixer input (94% risk)
            </motion.div>
            <div className="absolute bottom-8 right-14 w-12 h-[1px] bg-dashed bg-white/10 -rotate-45 origin-left" />

            {/* Satellite 3 */}
            <motion.div
              className="absolute top-4 right-10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/5 border border-white/10 text-[8px] sm:text-[9px] font-mono"
            >
              0x11b...38e
            </motion.div>
          </div>
        </div>

        {/* Right pane: wallet diagnostics */}
        <div className="w-full md:w-56 flex flex-col gap-4 font-mono text-[8px] sm:text-[9px]">
          <div className="bg-black/35 rounded-xl p-4 border border-white/5 flex-1 flex flex-col gap-2 justify-center">
            <span className="text-[7px] sm:text-[8px] font-bold text-gray-500 tracking-wider">DIAGNOSTIC LOGS</span>
            <div className="space-y-1 sm:space-y-1.5 text-gray-400 text-left">
              <div className="truncate border-l border-amber-400 pl-1.5">[19:30] Querying address mappings...</div>
              <div className="truncate text-red-400 border-l border-red-500 pl-1.5">[19:31] High-risk Tornado flow flagged.</div>
              <div className="truncate border-l border-emerald-400 pl-1.5">[19:32] Node graph resolved.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 2) {
    return (
      <div className="w-full h-full flex flex-col p-4 sm:p-6 text-left text-gray-300 font-mono">
        <span className="text-[7px] sm:text-[8px] font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-400 animate-pulse" />
          Exploit Path Node Mapper
        </span>
        <div className="flex-1 bg-black/35 rounded-xl border border-white/5 p-4 sm:p-6 flex items-center justify-between relative overflow-hidden">
          
          {/* Node 1 */}
          <div className="flex flex-col items-center gap-1.5 z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <span className="text-[8px] sm:text-[10px] text-red-400 font-bold">Attacker</span>
            </div>
            <span className="text-[7px] sm:text-[8px] text-gray-500 font-semibold uppercase">Exploit Wallet</span>
          </div>

          {/* Connect 1 */}
          <div className="absolute inset-x-20 sm:inset-x-24 inset-y-0 pointer-events-none flex items-center justify-center">
            <svg className="w-full h-10" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M 5,10 L 95,10" fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth="2" />
              <motion.path
                d="M 5,10 L 95,10"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                strokeDasharray="6 14"
                animate={{ strokeDashoffset: [-20, 0] }}
                transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
              />
            </svg>
          </div>

          {/* Node 2 */}
          <div className="flex flex-col items-center gap-1.5 z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <span className="text-[8px] sm:text-[10px] text-purple-400 font-bold">Flashloan</span>
            </div>
            <span className="text-[7px] sm:text-[8px] text-gray-500 font-semibold uppercase">Vector Pool</span>
          </div>

          {/* Node 3 */}
          <div className="flex flex-col items-center gap-1.5 z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-[8px] sm:text-[10px] text-emerald-400 font-bold">Vault</span>
            </div>
            <span className="text-[7px] sm:text-[8px] text-gray-500 font-semibold uppercase">Target Reserve</span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 p-4 sm:p-6 text-left text-gray-300 font-sans">
      {/* Left Pane: Bar chart animation */}
      <div className="flex-1 bg-black/35 rounded-xl p-4 sm:p-5 border border-white/5 flex flex-col justify-between">
        <div>
          <span className="text-[7px] sm:text-[8px] font-bold text-cyan-400 tracking-wider font-mono">MITIGATION CHART</span>
          <h4 className="text-[11px] sm:text-[12px] font-bold text-white mt-0.5">Exploit Prevention Rates</h4>
        </div>
        <div className="flex items-end gap-2.5 sm:gap-3 h-20 sm:h-24 mt-3 sm:mt-4 font-mono text-[7px] sm:text-[8px] text-gray-500">
          {[
            { label: 'Jan', value: 40 },
            { label: 'Feb', value: 65 },
            { label: 'Mar', value: 50 },
            { label: 'Apr', value: 85 },
            { label: 'May', value: 72 },
            { label: 'Jun', value: 94 }
          ].map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${bar.value}%` }}
                transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                className="w-full bg-gradient-to-t from-cyan-500/10 to-cyan-500/60 rounded-t border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
              />
              <span>{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane: Report list */}
      <div className="w-full md:w-56 flex flex-col gap-4">
        <div className="bg-black/35 rounded-xl p-4 sm:p-5 border border-white/5 flex-1 flex flex-col justify-between font-mono text-[8px] sm:text-[9px]">
          <div>
            <span className="text-[7px] sm:text-[8px] font-bold text-gray-500 tracking-wider">COMPLIANCE STATS</span>
            <div className="mt-2.5 space-y-1.5 text-gray-300">
              <div className="flex justify-between">
                <span>Score:</span>
                <span className="text-emerald-400 font-bold">98 / 100</span>
              </div>
              <div className="flex justify-between">
                <span>Audits:</span>
                <span className="text-white">12 Compiled</span>
              </div>
              <div className="flex justify-between">
                <span>Grade:</span>
                <span className="text-emerald-400 font-bold">A+ SECURE</span>
              </div>
            </div>
          </div>
          <div className="text-[7px] sm:text-[8px] text-gray-500 border-t border-white/5 pt-1.5 mt-2">
            Updated: Just now
          </div>
        </div>
      </div>
    </div>
  );
};

const PipelineJarvisLogs = ({ activeStep }: { activeStep: number }) => {
  const logs = [
    [
      "🔍 AST PARSER: Initializing token stream mapping...",
      "🧠 LLM MODEL: GPT-4o Security Agent loaded successfully.",
      "⚠️ SCAN LOGS: Found 1 reentrancy vulnerability candidate path.",
      "💡 RECOMMENDATION: Flagged reentrancy on withdraw()."
    ],
    [
      "⚙️ STATIC ENGINE: Initializing Slither rule parser...",
      "📂 CONTROL FLOW: Resolving contract inheritance paths...",
      "🛡️ SIGNATURES: Cross-checking signature definitions... OK.",
      "🟢 VERDICT: Static code structure verify complete."
    ],
    [
      "🖥️ EVM SIMULATOR: Spinning up target block execution fork...",
      "⚡ STATE TRACE: Injecting simulated flashloan attack vectors...",
      "💰 STATE CHANGE: Balance delta checked: Drained 0 ETH.",
      "🔒 SIMULATION: Exploit simulation blocked. Guards intact."
    ],
    [
      "📡 THREAT FEEDS: Querying global address database...",
      "🌪️ MIXER ENGINE: Scanning Tornado address mappings...",
      "🔴 WARNINGS: Tornado Cash incoming flow flagged (Risk score 94%).",
      "🚨 ALERTS: Attack path wallet resolved: 0x71c...a39."
    ],
    [
      "📊 BEHAVIOR TRACER: Resolving cash flow node dependencies...",
      "🔄 TOKENS FLOW: Scanning ERC20 swap routing patterns...",
      "🌊 LIQUIDITY MONITOR: Checking flash-loan arbitrage pools...",
      "🟢 STATUS: Normal flow behavior metrics trace complete."
    ],
    [
      "🧮 RISK ENGINE: Aggregating pipeline telemetry inputs...",
      "⚖️ VECTOR CALCULATOR: Processing 14 threat metrics...",
      "📝 SCORE COMPILING: Calculating safety index ratio...",
      "🏆 RATING: Security Index 98/100 (A+ SECURE) generated."
    ]
  ];

  const activeLogs = logs[activeStep] || [];

  return (
    <div className="flex flex-col gap-2 font-mono text-[9px] sm:text-[11px] text-gray-400 leading-normal text-left h-full justify-between">
      {activeLogs.map((log, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.1 }}
          className={`pl-3 border-l-2 ${
            log.includes("🟢") || log.includes("🏆") || log.includes("OK")
              ? "border-emerald-500 text-emerald-400"
              : log.includes("⚠️") || log.includes("🚨") || log.includes("Tornado")
              ? "border-red-500 text-red-400"
              : log.includes("🧠") || log.includes("LLM")
              ? "border-blue-500 text-blue-400"
              : "border-white/10 text-gray-300"
          }`}
        >
          {log}
        </motion.div>
      ))}
    </div>
  );
};

const HowItWorksMockup = ({ activeStep }: { activeStep: number }) => {
  if (activeStep === 0) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center p-4 sm:p-6 text-left font-sans">
        <div className="w-full max-w-sm bg-black/45 border border-white/5 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="text-[9px] font-bold text-gray-500 tracking-wider uppercase mb-3 font-mono">
            📥 target_address_resolver
          </div>
          <span className="text-[11px] text-gray-300 font-semibold mb-2 block">
            Enter smart contract or wallet address:
          </span>
          {/* Input field simulation */}
          <div className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2 font-mono text-[10px] sm:text-xs text-white relative">
            <span className="text-blue-400 shrink-0">▶</span>
            <span className="font-mono text-gray-200">
              0x71C7656EC7ab88b098defB751B7401B5f6d8976F
            </span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-1.5 h-3.5 bg-blue-500 inline-block"
            />
          </div>
          {/* Diagnostic state progress */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] sm:text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Target Contract resolved. Ready for static compile.</span>
          </motion.div>
        </div>
      </div>
    );
  }

  if (activeStep === 1) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center p-4 sm:p-6 text-left font-mono text-[9px] sm:text-[10px]">
        <div className="w-full max-w-sm bg-black/45 border border-white/5 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="text-[9px] font-bold text-purple-400 tracking-widest uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              INTELLIGENCE IN ACTION
            </span>
            <span className="text-[8px] text-gray-500">v2.4.0</span>
          </div>
          {/* Scanning lines */}
          <div className="space-y-1.5 text-gray-400">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <span>✔</span> <span>Parsing contract AST...</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <span>✔</span> <span>Verifying reentrancy guard asserts...</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold animate-pulse">
              <span>⚡</span> <span>Simulating attack vectors on flash swaps...</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="animate-spin inline-block w-2.5 h-2.5 border border-dashed border-gray-400 rounded-full" />
              <span>Scanning bytecode trace patterns...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-4 sm:p-6 text-left font-sans">
      <div className="w-full max-w-sm bg-black/45 border border-white/5 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-cyan-400 tracking-wider font-mono uppercase">
            📊 AUDIT EXPORT COMPLETE
          </span>
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            98/100 SECURE
          </span>
        </div>
        {/* Report Summary */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-white">Security Certificate Generated</h4>
          <p className="text-[11px] text-gray-400 leading-normal">
            Your contract has successfully passed the BlockSpectra threat analysis suite with 0 critical findings.
          </p>
        </div>
        {/* Download Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/10 border border-blue-400/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Download Actionable Report</span>
        </motion.button>
      </div>
    </div>
  );
};

// Comparison Section Data
const comparisonRows = [
  { feature: 'AI Reports', blockSpectra: true, traditional: false },
  { feature: 'Attack Graphs', blockSpectra: true, traditional: false },
  { feature: 'Wallet Intelligence', blockSpectra: true, traditional: false },
  { feature: 'Threat Intelligence', blockSpectra: true, traditional: false },
  { feature: 'Visual Investigation', blockSpectra: true, traditional: false },
  { feature: 'Risk Scoring', blockSpectra: true, traditional: false },
];

const AnimatedCheckmark = ({ delay }: { delay: number }) => (
  <svg
    className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <motion.polyline
      points="20 6 9 17 4 12"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    />
  </svg>
);

const MutedDash = ({ delay }: { delay: number }) => (
  <svg
    className="w-4 h-4 text-gray-700"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <motion.line
      x1="5"
      y1="12"
      x2="19"
      y2="12"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: delay + 0.1, ease: "easeOut" }}
    />
  </svg>
);





const SUPPORTED_CHAINS = [
  { id: "ethereum", name: "Ethereum", logo: "Ξ" },
  { id: "base", name: "Base", logo: "B" },
  { id: "arbitrum", name: "Arbitrum", logo: "A" },
  { id: "optimism", name: "Optimism", logo: "O" },
  { id: "polygon", name: "Polygon", logo: "P" },
  { id: "bsc", name: "BNB Chain (BSC)", logo: "BSC" },
  { id: "avalanche", name: "Avalanche", logo: "AVAX" },
  { id: "linea", name: "Linea", logo: "L" },
  { id: "scroll", name: "Scroll", logo: "S" },
  { id: "zkSync", name: "zkSync", logo: "ZK" },
  { id: "solana", name: "Solana", logo: "SOL" },
  { id: "sui", name: "Sui", logo: "SUI" },
  { id: "aptos", name: "Aptos", logo: "APT" }
];

// Word-by-word streaming animation component
const StreamingText = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayed, setDisplayed] = useState("");
  
  useEffect(() => {
    const words = text.split(" ");
    let currentWordIndex = 0;
    setDisplayed("");
    
    const interval = setInterval(() => {
      if (currentWordIndex < words.length) {
        setDisplayed((prev) => prev + (prev ? " " : "") + words[currentWordIndex]);
        currentWordIndex++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 30);
    
    return () => clearInterval(interval);
  }, [text]);
  
  return <span>{displayed}</span>;
};

// Heuristic vulnerability description mapping for plain-English explanations
const getVulnerabilityDetails = (vulnerability: string, description: string) => {
  const vuln = vulnerability.toLowerCase();
  const desc = description.toLowerCase();

  if (vuln.includes('reentrancy')) {
    return {
      plainEnglish: "This contract has a reentrancy flaw, which means an external smart contract can call back into this contract before the first call is finished. This lets them execute code multiple times in a loop.",
      whyItMatters: "An attacker can repeatedly withdraw funds from the contract before the contract updates their balance, completely draining all funds from the pool.",
      analogy: "Imagine an ATM that gives you cash first and only updates your account balance afterwards. If you can request another withdrawal while the ATM is still counting your cash, you can withdraw your entire account balance multiple times.",
      learnMore: "Reentrancy occurs when a contract sends funds to an untrusted contract using `call` before updating its internal state (like user balances). The recipient contract can execute a fallback function that calls `withdraw()` again, creating a recursive loop of withdrawals."
    };
  }
  if (vuln.includes('access control') || vuln.includes('owner') || desc.includes('onlyowner') || desc.includes('unprotected')) {
    return {
      plainEnglish: "Critical functions in the contract lack proper authorization checks, allowing anyone to execute administrative functions.",
      whyItMatters: "Anyone could potentially call functions to change ownership, mint tokens, pause the contract, or withdraw funds directly to their own wallet.",
      analogy: "It's like having a vault in a bank but leaving the master key hanging on the front door. Anyone walking by can grab the key, unlock the vault, and walk away with the contents.",
      learnMore: "Access control vulnerabilities occur when state-changing functions are not protected by modifier checks such as `onlyOwner` or custom role validation. This enables external callers to invoke code paths intended only for privileged administrators."
    };
  }
  if (vuln.includes('overflow') || vuln.includes('underflow') || desc.includes('math')) {
    return {
      plainEnglish: "Mathematical operations in the code can wrap around past their maximum or minimum limits, resulting in incorrect calculations.",
      whyItMatters: "Attackers can exploit this to create massive token balances or bypass checks requiring a minimum balance.",
      analogy: "Like a car odometer rolling over from 999,999 miles to 000,000 miles. Suddenly, a car with a million miles looks brand new, or a subtraction causes a zero balance to roll over into a massive number.",
      learnMore: "Integer overflow/underflow happens when an arithmetic operation reaches the maximum or minimum size of its type (e.g., uint256). In Solidity versions prior to 0.8.0, this causes numbers to wrap around. Modern Solidity has built-in checks, but developers using `unsafe` blocks or old compiler versions remain vulnerable."
    };
  }
  if (vuln.includes('selfdestruct') || vuln.includes('suicide') || desc.includes('destroy')) {
    return {
      plainEnglish: "The contract contains code that can permanently destroy the contract and delete its code from the blockchain.",
      whyItMatters: "If triggered, the contract becomes unusable, and any funds locked inside it will be permanently lost and unrecoverable.",
      analogy: "Like building a store with a self-destruct button on the sidewalk. If someone presses it, the entire building collapses into dust instantly, locking everything inside forever.",
      learnMore: "The `selfdestruct` instruction deletes the bytecode of a contract and forwards all remaining Ether to a target address. If this instruction can be called by unauthorized users, the contract can be rendered dead and unusable."
    };
  }
  if (vuln.includes('unchecked') || desc.includes('return value')) {
    return {
      plainEnglish: "The contract makes a call or sends money to another contract, but fails to check if that operation actually succeeded.",
      whyItMatters: "If a transfer fails, the contract will still proceed as if it was successful, updating its internal state and recording a transfer that never happened.",
      analogy: "Imagine writing a check to pay a bill, and the recipient marks your bill as paid, but never actually checks if the bank cleared the check. If the check bounces, they still treat your bill as paid.",
      learnMore: "Low-level calls like `send`, `call`, and `delegatecall` return a boolean indicating success or failure. If developers do not explicitly assert that this return value is `true` (e.g., using `require(success)`), the execution will continue even if the call failed."
    };
  }
  if (vuln.includes('tx.origin') || desc.includes('tx.origin')) {
    return {
      plainEnglish: "The contract uses the transaction origin (`tx.origin`) to verify who is calling the function, rather than the immediate caller (`msg.sender`).",
      whyItMatters: "Attackers can trick contract owners into interacting with a malicious contract, which then forwards the call to the target contract, bypassing ownership checks.",
      analogy: "Like a security guard checking your ID by looking at the name on your wallet, rather than looking at your face. If someone steals your wallet, they can pretend to be you.",
      learnMore: "`tx.origin` refers to the original external wallet that initiated the transaction chain. Using it for authorization is dangerous because if an owner calls a malicious contract, that contract can call the protected contract on behalf of the owner, since the original sender is still the owner."
    };
  }
  if (vuln.includes('loop') || desc.includes('gas limit') || desc.includes('denial of service')) {
    return {
      plainEnglish: "The contract contains loops that process an arbitrary amount of data. If the list grows too large, the function will run out of gas and always fail.",
      whyItMatters: "This can permanently brick functions like distributing rewards or list processing, freezing assets in the contract.",
      analogy: "Imagine a bus driver refusing to start the bus until every seat is filled, but the bus seats are infinite. The bus will stay parked forever, blocking the road for everyone.",
      learnMore: "Solidity loops that iterate over dynamically-sized arrays can exceed the block gas limit if the array grows too large. Once the gas required to run the function exceeds the limit, the transaction will revert, causing a Denial of Service (DoS)."
    };
  }
  return {
    plainEnglish: `A security anomaly has been flagged in the code: ${description}`,
    whyItMatters: "This issue could lead to unexpected behavior, logic flaws, or unauthorized state changes if left unaddressed.",
    analogy: "Like a minor crack in a building's foundation. It might not collapse immediately, but under specific stress, it can create a major structural failure.",
    learnMore: "This rule matches general code quality patterns or structural anomalies flagged by the security compiler. Refer to standard Solidity style guides and security patterns to resolve it."
  };
};

const getWhatIsThisContract = (name: string, _summary?: string) => {
  const lowercaseName = name.toLowerCase();
  let role = "This is a smart contract designed to handle blockchain transaction logic.";
  let existence = "It exists to automate transaction rules securely without a centralized intermediary.";
  let problem = "It solves the problem of trust: users can execute transactions knowing the code will execute exactly as written, with no human intervention.";
  let user = "This contract is typically used by Web3 developers, automated systems, and users interacting with the protocol.";
  let analogy = "Think of it as a digital vending machine on the street: you insert tokens, press a button, and it dispenses the result based on pre-programmed rules. No shopkeeper is needed.";
  let contractType = "Smart Contract";
  let category = "General Purpose";

  if (lowercaseName.includes("token") || lowercaseName.includes("erc20") || lowercaseName.includes("coin")) {
    contractType = "ERC20 Token";
    category = "Digital Currency";
    role = `This contract is a custom digital token (specifically an ERC20 token named "${name}").`;
    existence = "It exists to represent digital value, ownership, or utility within a specific blockchain ecosystem.";
    problem = "It solves the challenge of issuing and tracking a custom currency or asset supply securely, preventing double-spending and verifying transactions instantly.";
    user = "Ordinary users, token holders, yield farmers, and crypto traders use this contract to store, transfer, and trade value.";
    analogy = "It operates like a casino chip system or a store loyalty points program: the chips have value inside the casino, and the dealer (the contract) manages who owns how many chips according to strict, transparent rules.";
  } else if (lowercaseName.includes("pool") || lowercaseName.includes("swap") || lowercaseName.includes("dex") || lowercaseName.includes("exchange")) {
    contractType = "DEX / Liquidity Pool";
    category = "Decentralized Exchange";
    role = `This contract is a Decentralized Liquidity Pool and Exchange (swap) manager named "${name}".`;
    existence = "It exists to allow users to swap one token for another trustlessly, and to allow investors to deposit funds to earn trading fees.";
    problem = "It solves the traditional issue of needing a central exchange (like Nasdaq or a bank) to match buyers and sellers. It automates this using math.";
    user = "Crypto traders looking to swap assets and liquidity providers looking to earn passive yield on their idle capital.";
    analogy = "Imagine a physical box with a pool of apples and oranges. A mathematical formula ensures that if you put in 2 apples, you can take out 2 oranges. The box handles this automatically without needing an administrator.";
  } else if (lowercaseName.includes("vault") || lowercaseName.includes("staking") || lowercaseName.includes("yield") || lowercaseName.includes("stake")) {
    contractType = "Staking Vault";
    category = "Yield / DeFi";
    role = `This contract is an Asset Vault and Staking protocol named "${name}".`;
    existence = "It exists to allow users to lock up their cryptocurrency tokens in exchange for rewards, interest, or governance rights over time.";
    problem = "It solves the problem of token inflation and idle assets, providing an incentive for users to hold their tokens long-term and secure the protocol's economy.";
    user = "Long-term token holders and investors looking to grow their digital assets through passive interest or yields.";
    analogy = "It functions exactly like a high-yield certificate of deposit (CD) at a traditional bank. You lock away your money for a set period, and the bank pays you interest. Here, the smart contract is the banker, executing your deposit and rewards automatically.";
  } else if (lowercaseName.includes("bridge") || lowercaseName.includes("crosschain") || lowercaseName.includes("portal")) {
    contractType = "Cross-Chain Bridge";
    category = "Interoperability";
    role = `This contract is a Cross-Chain Bridge Portal named "${name}".`;
    existence = "It exists to transfer digital assets and messages across separate, isolated blockchain networks (e.g. from Ethereum to Solana).";
    problem = "It solves the fragmentation of blockchains, allowing tokens created on one network to be wrapped and used on another network trustlessly.";
    user = "Multi-chain users, yield farmers, and developers moving liquidity across different network ecosystems.";
    analogy = "It operates like a ferry system or customs port: you lock up your car (token) on one side of the river, and the operator gives you a ferry ticket (wrapped token) to drive a matching car on the other side of the river.";
  } else if (lowercaseName.includes("governor") || lowercaseName.includes("dao") || lowercaseName.includes("voting")) {
    contractType = "DAO Governance";
    category = "Governance";
    role = `This contract is a Decentralized Governance (DAO) Voting Portal named "${name}".`;
    existence = "It exists to allow community members to submit proposals and vote on changes using their governance tokens.";
    problem = "It solves the centralized decision-making problem by giving every token holder a voice in the future direction of the project, proportional to their holdings.";
    user = "DAO members, project governors, and active community participants.";
    analogy = "It's like a digital town hall voting machine: users cast ballots (votes) using their tokens, and the machine automatically counts the votes and executes the winning proposal without a middleman.";
  } else if (lowercaseName.includes("nft") || lowercaseName.includes("erc721") || lowercaseName.includes("erc1155") || lowercaseName.includes("collectible")) {
    contractType = "NFT Collection";
    category = "Digital Collectibles";
    role = `This contract manages a Non-Fungible Token (NFT) collection named "${name}".`;
    existence = "It exists to create, track, and transfer unique digital assets that represent ownership of art, collectibles, or in-game items.";
    problem = "It solves the problem of proving digital ownership: each token is unique and verifiably yours, stored permanently on the blockchain.";
    user = "Digital art collectors, gamers, creators, and NFT traders.";
    analogy = "Think of it like a gallery that issues numbered certificates of authenticity for artworks. Each certificate (NFT) is unique, and the gallery (contract) keeps a public ledger of who owns which piece.";
  }

  return { role, existence, problem, user, analogy, contractType, category };
};

const getOwnershipDetails = (_name: string, findings: any[]) => {
  const hasMint = findings.some(f => f.vulnerability.toLowerCase().includes("mint") || f.description.toLowerCase().includes("mint"));
  const hasPause = findings.some(f => f.vulnerability.toLowerCase().includes("pause") || f.description.toLowerCase().includes("pause"));
  const hasUpgrade = findings.some(f => f.vulnerability.toLowerCase().includes("upgrade") || f.description.toLowerCase().includes("proxy"));
  const hasAccessControl = findings.some(f => f.vulnerability.toLowerCase().includes("access control") || f.description.toLowerCase().includes("owner"));
  const hasFreeze = findings.some(f => f.vulnerability.toLowerCase().includes("freeze") || f.description.toLowerCase().includes("blacklist") || f.description.toLowerCase().includes("block"));
  const hasWithdraw = findings.some(f => f.vulnerability.toLowerCase().includes("withdraw") || f.description.toLowerCase().includes("drain") || f.description.toLowerCase().includes("withdraw"));

  return {
    owner: hasAccessControl ? "Privileged Owner (Single Admin Key)" : "Standard Owner Control (Multisig or Single Owner)",
    canChangeOwner: "Yes, standard ownership transfer functions are typically included.",
    canMint: hasMint ? "Yes, the owner or specific roles can create new tokens out of thin air." : "No obvious token minting capability is exposed to the owner.",
    canPause: hasPause ? "Yes, the contract includes emergency pause controls." : "No transaction pausing mechanism detected in the core code.",
    canUpgrade: hasUpgrade ? "Yes, the contract uses a proxy pattern and can be upgraded by developers." : "No, the contract bytecode appears immutable (cannot be modified after deployment).",
    canFreeze: hasFreeze ? "Yes, specific accounts can be frozen or blacklisted by the owner." : "No account freezing or blacklisting capability detected.",
    canWithdraw: hasWithdraw ? "Yes, the owner or privileged roles can withdraw funds from the contract." : "No direct owner withdrawal function detected in the code.",
    whyItMatters: "If a contract has centralized owner controls (like minting, pausing, or upgrading), it means you must trust the developers. If their private key is stolen, the entire protocol can be compromised.",
    permissions: [
      { key: "Ownership Transfer", allowed: true, why: "The owner can transfer control to another address. If the new owner is malicious, they gain full admin power." },
      { key: "Token Minting", allowed: hasMint, why: hasMint ? "New tokens can be created, potentially diluting your holdings if abused." : "The supply is fixed or minting is restricted, protecting existing holders." },
      { key: "Account Freezing", allowed: hasFreeze, why: hasFreeze ? "The owner can freeze individual accounts, preventing them from transacting." : "No freezing mechanism exists, so your funds cannot be individually locked." },
      { key: "Transaction Pausing", allowed: hasPause, why: hasPause ? "All transactions can be halted globally in an emergency — but also as censorship." : "No global pause exists, so the contract runs continuously without admin interruption." },
      { key: "Fund Withdrawal", allowed: hasWithdraw || hasAccessControl, why: (hasWithdraw || hasAccessControl) ? "Privileged roles may withdraw contract funds directly." : "No direct admin withdrawal path was detected in the code." },
      { key: "Code Upgrades", allowed: hasUpgrade, why: hasUpgrade ? "The underlying logic can be swapped out, meaning the rules can change at any time." : "The code is immutable once deployed — rules are permanent and transparent." }
    ]
  };
};

const getCapabilities = (name: string, findings: any[]) => {
  const lowercaseName = name.toLowerCase();
  const caps = [
    { title: "Receive Funds", desc: "Allows external accounts and contracts to deposit tokens or gas currency." },
    { title: "Transfer Assets", desc: "Can securely route tokens and gas currency to destination addresses." }
  ];
  if (lowercaseName.includes("token") || lowercaseName.includes("coin") || lowercaseName.includes("erc20")) {
    caps.push({ title: "Mint Supply", desc: "Enables creating and issuing new tokens to grow the total supply." });
    caps.push({ title: "Burn Tokens", desc: "Allows burning/destroying tokens to reduce circulating supply." });
  }
  if (lowercaseName.includes("pool") || lowercaseName.includes("swap") || lowercaseName.includes("exchange")) {
    caps.push({ title: "Exchange Swap", desc: "Automates asset exchanges using constant product mathematical formulas." });
    caps.push({ title: "Yield Accumulation", desc: "Allows locking assets in order to gather trade fee commissions." });
  }
  if (lowercaseName.includes("vault") || lowercaseName.includes("stake")) {
    caps.push({ title: "Stake Assets", desc: "Enables locking tokens to earn passive yield rewards over time." });
  }
  if (findings.some(f => f.vulnerability.toLowerCase().includes("owner") || f.description.toLowerCase().includes("owner"))) {
    caps.push({ title: "Privileged Access Control", desc: "Includes admin-only functions to manage settings and variables." });
  }
  return caps;
};

const getPositiveObservations = (findings: any[]) => {
  const hasReentrancy = findings.some(f => f.vulnerability.toLowerCase().includes("reentrancy"));
  const hasAccessControl = findings.some(f => f.vulnerability.toLowerCase().includes("access control"));
  
  const obs = [
    { title: "Standard Code Structure", desc: "The contract code follows established Solidity patterns and standards." },
    { title: "OpenZeppelin Standard Templates", desc: "Leverages audited foundational base contracts for token safety and ownership." }
  ];

  if (!hasReentrancy) {
    obs.push({ title: "Reentrancy Guard Implemented", desc: "Standard guards are in place to block double-withdrawal exploits on transfer paths." });
  }
  if (!hasAccessControl) {
    obs.push({ title: "Authorized Operations Checked", desc: "Privileged administrator operations are constrained by access modifiers." });
  }
  return obs;
};

const getBeCarefulText = (_name: string, findings: any[]) => {
  const hasUpgrade = findings.some(f => f.vulnerability.toLowerCase().includes("upgrade") || f.description.toLowerCase().includes("proxy"));
  const hasAccess = findings.some(f => f.vulnerability.toLowerCase().includes("owner") || f.description.toLowerCase().includes("onlyowner"));
  
  let text = "When using this contract, keep the following warnings in mind. ";
  if (hasAccess) {
    text += "1. Owner Privileges: The developers hold admin keys that can modify settings or access pools. Make sure you trust the project team. ";
  }
  if (hasUpgrade) {
    text += "2. Code Upgradeability: The rules of this contract can be changed at any time by replacing the underlying code logic. ";
  }
  text += "3. Oracle Dependence: If the contract reads token prices from external feeds (Oracles), it is vulnerable to flash-loan price manipulation exploits. ";
  text += "4. Network Congestion: In times of heavy network traffic, gas prices will surge, making transactions expensive or slow.";
  return text;
};

const getFinalVerdictText = (report: any) => {
  const score = 100 - report.risk_score;
  let rec = "Mostly Safe";
  let desc = "The contract displays strong standard security patterns and no critical findings. You can use it with normal risk awareness.";
  
  if (report.risk_score > 75) {
    rec = "Critical Risk";
    desc = "The scanner found major structural flaws (like potential reentrancy or unprotected owner paths). Interact with this contract only if you are testing, and avoid placing any significant capital in it.";
  } else if (report.risk_score > 40) {
    rec = "Use With Caution";
    desc = "There are moderate logic risks or highly centralized permissions (such as proxy upgrades or unlimited minting). Do research on the founding team before depositing assets.";
  } else if (report.risk_score <= 15) {
    rec = "Very Safe";
    desc = "Excellent code quality. Standard guards, reentrancy limiters, and clean access checks are fully validated. Highly trusted structure.";
  }
  
  return { rec, desc, score };
};

const getExplainedRisksText = (findings: any[]) => {
  if (!findings || findings.length === 0) {
    return "No critical security risks were flagged by the static analysis engine. The code appears to check standard guards. However, keep in mind that all smart contracts carry systemic risks like admin keys or external dependency faults.";
  }
  return `The security scanner flagged ${findings.length} potential issue(s). Let's explain what they are in simple terms, using real-world analogies so you can understand what's at risk:`;
};

const getVulnerabilityOverview = (findings: any[], _riskScore: number) => {
  if (!findings || findings.length === 0) {
    return {
      title: "Healthy Security Standing",
      badgeColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      description: "No code vulnerabilities, access anomalies, or reentrancy pathways were flagged by our static analysis engine. The smart contract logic appears to follow standard security practices and guard modifiers."
    };
  }

  const criticals = findings.filter(f => f.severity === "CRITICAL");
  const highs = findings.filter(f => f.severity === "HIGH");
  
  if (criticals.length > 0 || highs.length > 0) {
    const mainIssue = criticals.length > 0 ? criticals[0] : highs[0];
    const details = getVulnerabilityDetails(mainIssue.vulnerability, mainIssue.description);
    return {
      title: "Critical Security Alerts Detected",
      badgeColor: "bg-red-500/10 border-red-500/20 text-red-400",
      description: `Warning: This contract contains serious code issues (including "${mainIssue.vulnerability}"). In simple terms, ${details.plainEnglish.toLowerCase()} This issue is high-risk: ${details.whyItMatters.toLowerCase()}`
    };
  }

  return {
    title: "Moderate Risk Warnings Active",
    badgeColor: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    description: `Advisory: The scanner identified minor warnings or administrative structure issues (like "${findings[0].vulnerability}"). Although not immediately critical, these findings indicate potential loopholes or centralized permissions that could impact user funds under specific conditions.`
  };
};

// Context-aware workflow steps based on contract type
const getWorkflowSteps = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("token") || n.includes("erc20") || n.includes("coin")) {
    return [
      { title: "User Connects Wallet", desc: "Open your Web3 wallet (e.g. MetaMask) and connect to the dApp hosting this token.", icon: "🔗" },
      { title: "Approve Token Spend", desc: "Grant the contract permission to move a specific amount of your tokens on your behalf.", icon: "✅" },
      { title: "Submit Transfer / Trade", desc: "Execute a transfer, swap, or staking operation by signing a blockchain transaction.", icon: "📤" },
      { title: "Contract Validates Balances", desc: `The \"${name}\" code checks your balance, allowances, and access permissions before executing.`, icon: "🔍" },
      { title: "Tokens Move Between Wallets", desc: "Assets are debited from the sender and credited to the receiver atomically.", icon: "💸" },
      { title: "Permanent Blockchain Record", desc: "The transaction is confirmed on-chain, creating an immutable audit trail anyone can verify.", icon: "⛓" }
    ];
  }
  if (n.includes("pool") || n.includes("swap") || n.includes("dex") || n.includes("exchange")) {
    return [
      { title: "Connect to DEX Interface", desc: "Open the decentralized exchange frontend and connect your wallet.", icon: "🔗" },
      { title: "Select Token Pair", desc: "Choose which token you want to swap FROM and which token you want to receive.", icon: "🔄" },
      { title: "Approve & Submit Swap", desc: "Approve the token spend, then confirm the swap transaction with your wallet.", icon: "📤" },
      { title: "AMM Calculates Price", desc: `The \"${name}\" uses an Automated Market Maker formula to calculate the exact exchange rate.`, icon: "📊" },
      { title: "Liquidity Pool Rebalances", desc: "Your input token enters the pool and the output token is withdrawn, adjusting the reserves.", icon: "⚖️" },
      { title: "Swap Confirmed On-Chain", desc: "The swap executes atomically — either both sides complete or neither does.", icon: "⛓" }
    ];
  }
  if (n.includes("vault") || n.includes("staking") || n.includes("stake") || n.includes("yield")) {
    return [
      { title: "Connect Wallet", desc: "Open the staking interface and connect your Web3 wallet.", icon: "🔗" },
      { title: "Deposit / Stake Tokens", desc: "Choose the amount of tokens to lock and approve the deposit transaction.", icon: "🏦" },
      { title: "Contract Locks Your Assets", desc: `The \"${name}\" contract holds your tokens securely in the vault for the staking period.`, icon: "🔒" },
      { title: "Rewards Accumulate", desc: "Based on your stake weight and the reward rate, yield accumulates over time.", icon: "📈" },
      { title: "Claim or Withdraw", desc: "When ready, claim your earned rewards or withdraw your original deposit.", icon: "💰" },
      { title: "Transaction Recorded", desc: "All deposits, withdrawals, and rewards are permanently logged on the blockchain.", icon: "⛓" }
    ];
  }
  // Default workflow
  return [
    { title: "User Connects Wallet", desc: "Connect your Web3 wallet (like MetaMask) to initiate a contract session.", icon: "🔗" },
    { title: "Submit Transaction", desc: "Authorize a call, sending parameters and a gas fee payment to the validators.", icon: "📤" },
    { title: "Contract Validates Request", desc: `The \"${name}\" contract code runs assertions (verifying permissions, balances).`, icon: "🔍" },
    { title: "State Updates & Asset Flow", desc: "Assets are swapped, minted, or stored, and balances are updated.", icon: "💸" },
    { title: "Blockchain Records Everything", desc: "The block is confirmed on-chain, creating a permanent audit trail.", icon: "⛓" }
  ];
};

// Structured caution items for the "Things Users Should Be Careful About" card
const getCautionItems = (name: string, findings: any[]) => {
  const hasUpgrade = findings.some(f => f.vulnerability.toLowerCase().includes("upgrade") || f.description.toLowerCase().includes("proxy"));
  const hasAccess = findings.some(f => f.vulnerability.toLowerCase().includes("owner") || f.description.toLowerCase().includes("onlyowner"));
  const hasOracle = findings.some(f => f.description.toLowerCase().includes("oracle") || f.description.toLowerCase().includes("price feed"));
  const hasExternal = findings.some(f => f.description.toLowerCase().includes("external") || f.description.toLowerCase().includes("delegatecall"));
  const n = name.toLowerCase();

  const items: { icon: string; title: string; desc: string; severity: string }[] = [];
  
  if (hasAccess) {
    items.push({ icon: "👑", title: "Centralized Ownership", desc: "The developers hold admin keys that can modify settings, mint tokens, or access pools. You must trust the project team and their key management.", severity: "high" });
  }
  if (hasUpgrade) {
    items.push({ icon: "🔄", title: "Upgradeable Contract", desc: "The underlying code logic can be changed after deployment. The contract you interact with today may behave differently tomorrow.", severity: "high" });
  }
  if (hasExternal) {
    items.push({ icon: "🔗", title: "External Dependencies", desc: "This contract calls external contracts or uses delegatecall, which introduces trust assumptions about third-party code.", severity: "medium" });
  }
  if (hasOracle || n.includes("pool") || n.includes("swap") || n.includes("dex")) {
    items.push({ icon: "🔮", title: "Oracle / Price Feed Dependence", desc: "If the contract reads token prices from external feeds (Oracles), it may be vulnerable to flash-loan price manipulation exploits.", severity: "medium" });
  }
  items.push({ icon: "⛽", title: "Network Congestion Risks", desc: "During heavy network traffic, gas prices surge, making transactions expensive or slow. Time-sensitive operations may fail.", severity: "low" });
  items.push({ icon: "🔑", title: "Private Key Responsibility", desc: "Your wallet's private key is the only way to authorize transactions. If compromised, attackers can drain your funds — no customer support exists.", severity: "low" });
  if (n.includes("bridge") || n.includes("crosschain")) {
    items.push({ icon: "🌉", title: "Bridge-Specific Risks", desc: "Cross-chain bridges have historically been the highest-value attack targets. Funds locked on one chain rely on the bridge's security on both sides.", severity: "high" });
  }
  if (n.includes("dao") || n.includes("governor") || n.includes("voting")) {
    items.push({ icon: "🗳️", title: "Governance Attack Risks", desc: "If a single entity accumulates enough governance tokens, they can pass malicious proposals that drain the treasury or alter protocol rules.", severity: "medium" });
  }
  return items;
};

// Dynamic glossary based on findings and contract type
const getDynamicGlossary = (name: string, findings: any[]) => {
  const n = name.toLowerCase();
  const allText = findings.map(f => `${f.vulnerability} ${f.description}`).join(" ").toLowerCase();
  
  const fullGlossary: { term: string; definition: string; trigger: () => boolean }[] = [
    { term: "Reentrancy", definition: "A vulnerability where an attacker's malicious contract calls back into the vulnerable contract before the initial execution is complete, allowing them to drain funds recursively. Think of it as withdrawing from an ATM before it updates your balance.", trigger: () => allText.includes("reentrancy") || allText.includes("reentrant") },
    { term: "Delegatecall", definition: "A low-level instruction that executes code from another contract inside the caller's memory context. The external code has direct access to edit local storage variables — like giving someone your house keys and letting them rearrange your furniture.", trigger: () => allText.includes("delegatecall") || allText.includes("delegate") },
    { term: "Minting", definition: "The process of creating brand-new cryptocurrency tokens and adding them to the circulating supply. Similar to a government printing new money — if done irresponsibly, it can devalue existing tokens.", trigger: () => allText.includes("mint") || n.includes("token") || n.includes("erc20") },
    { term: "Burning", definition: "Permanently removing tokens from circulation by sending them to an un-spendable address (like 0x000...000). This reduces the total supply, similar to a company buying back and shredding its own stock certificates.", trigger: () => allText.includes("burn") || n.includes("token") },
    { term: "Proxy Contract", definition: "A pattern where the contract you interact with is just a thin 'forwarding' layer that routes your calls to a separate implementation contract. This allows developers to upgrade the logic without changing the public address — like updating the engine in a car without changing the license plate.", trigger: () => allText.includes("proxy") || allText.includes("upgrade") },
    { term: "Staking", definition: "Locking up your cryptocurrency tokens in a smart contract to earn rewards over time. It's like putting money in a fixed deposit at a bank — you can't use it for a while, but you earn interest in return.", trigger: () => n.includes("stake") || n.includes("vault") || n.includes("yield") || allText.includes("stake") },
    { term: "Flash Loan", definition: "A special type of loan that must be borrowed and repaid within a single blockchain transaction. If not repaid, the entire transaction reverts as if it never happened. Attackers use flash loans to temporarily acquire massive capital to manipulate prices.", trigger: () => n.includes("pool") || n.includes("swap") || n.includes("dex") || allText.includes("flash") },
    { term: "Governance", definition: "A system that lets token holders vote on protocol changes, treasury spending, and parameter updates. Each token typically equals one vote — like a shareholder voting at a company's annual meeting.", trigger: () => n.includes("dao") || n.includes("governor") || n.includes("voting") || allText.includes("governance") },
    { term: "Access Control", definition: "Restrictions on who can call certain functions. Functions marked 'onlyOwner' or protected by role checks ensure that only authorized wallets (usually the project team) can execute sensitive operations like minting or pausing.", trigger: () => allText.includes("access control") || allText.includes("owner") || allText.includes("onlyowner") },
    { term: "Selfdestruct", definition: "A built-in instruction that permanently deletes a contract's code from the blockchain and sends all remaining funds to a specified address. Once triggered, the contract ceases to exist — like demolishing a building and emptying its vault.", trigger: () => allText.includes("selfdestruct") || allText.includes("suicide") },
    { term: "Gas Fees", definition: "The transaction fee you pay to the blockchain network to process your operation. Gas prices fluctuate based on network demand — like surge pricing for ride-sharing during rush hour. Every operation costs gas.", trigger: () => true },
    { term: "tx.origin", definition: "A Solidity variable that refers to the original wallet that started the entire transaction chain. Using it for authorization is dangerous because a malicious middle-man contract can impersonate the original sender.", trigger: () => allText.includes("tx.origin") },
    { term: "ERC20", definition: "A widely-adopted technical standard for creating fungible (interchangeable) tokens on Ethereum. Think of it as a universal blueprint that ensures all tokens work the same way with wallets, exchanges, and other contracts.", trigger: () => n.includes("token") || n.includes("erc20") || n.includes("coin") },
    { term: "Smart Contract", definition: "A self-executing program stored on a blockchain that automatically enforces agreed-upon rules when conditions are met. It's like a vending machine: insert the right amount, press the button, and you get the result — no human operator needed.", trigger: () => true }
  ];

  // Always include Gas Fees and Smart Contract, then add relevant terms
  const relevant = fullGlossary.filter(g => g.trigger());
  // Deduplicate and limit to 8 most relevant
  const seen = new Set<string>();
  const result: { term: string; definition: string }[] = [];
  for (const g of relevant) {
    if (!seen.has(g.term) && result.length < 8) {
      seen.add(g.term);
      result.push({ term: g.term, definition: g.definition });
    }
  }
  return result;
};

// Structured money flow nodes based on contract type
const getMoneyFlowNodes = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("pool") || n.includes("swap") || n.includes("dex") || n.includes("exchange")) {
    return [
      { icon: "👤", label: "Your Wallet", color: "blue", desc: "You initiate the swap by sending Token A from your wallet." },
      { icon: "⚙️", label: name, color: "purple", desc: "The DEX contract receives your Token A and calculates the exchange rate." },
      { icon: "🏊", label: "Liquidity Pool", color: "cyan", desc: "The pool's reserves rebalance: your Token A is added and Token B is removed." },
      { icon: "💸", label: "Fee Distribution", color: "amber", desc: "A small trading fee (typically 0.3%) is distributed to liquidity providers." },
      { icon: "🎯", label: "Your Wallet (Token B)", color: "emerald", desc: "You receive Token B in your wallet. The entire swap is atomic and irreversible." }
    ];
  }
  if (n.includes("vault") || n.includes("staking") || n.includes("stake") || n.includes("yield")) {
    return [
      { icon: "👤", label: "Your Wallet", color: "blue", desc: "You deposit tokens from your wallet into the staking contract." },
      { icon: "🔒", label: name, color: "purple", desc: "The vault locks your tokens securely for the staking period." },
      { icon: "📈", label: "Reward Engine", color: "cyan", desc: "Yield accumulates based on your stake weight and the current reward rate." },
      { icon: "🏦", label: "Treasury Reserve", color: "amber", desc: "Protocol fees and reserve allocations are managed by the treasury." },
      { icon: "🎯", label: "Rewards to You", color: "emerald", desc: "Earned rewards are claimable and sent back to your wallet." }
    ];
  }
  // Default flow for token or general contracts
  return [
    { icon: "👤", label: "Your Wallet", color: "blue", desc: "You initiate a transaction by signing it with your wallet." },
    { icon: "⚙️", label: name || "Smart Contract", color: "purple", desc: "The contract validates your request, checking permissions and balances." },
    { icon: "💸", label: "Fee Processing", color: "amber", desc: "Gas fees are paid to network validators. Protocol fees (if any) are deducted." },
    { icon: "🏦", label: "Treasury / Pool", color: "cyan", desc: "Funds route to the protocol's treasury, liquidity pool, or reserve." },
    { icon: "🎯", label: "Recipient", color: "emerald", desc: "The final recipient receives the transferred assets in their wallet." }
  ];
};

// Exploitability level for a vulnerability finding
const getExploitability = (vulnerability: string, severity: string) => {
  const v = vulnerability.toLowerCase();
  if (v.includes("reentrancy")) return { level: "Critical", percent: 95, scenario: "An attacker deploys a malicious contract that recursively calls the withdraw function, draining the entire balance before the contract can update the ledger." };
  if (v.includes("access control") || v.includes("unprotected")) return { level: "High", percent: 85, scenario: "Anyone on the internet could call admin-only functions like minting unlimited tokens or transferring ownership to themselves." };
  if (v.includes("selfdestruct")) return { level: "High", percent: 80, scenario: "An unauthorized user triggers the selfdestruct instruction, permanently destroying the contract and locking all funds inside it forever." };
  if (v.includes("overflow") || v.includes("underflow")) return { level: "Medium", percent: 60, scenario: "An attacker crafts a transaction with specially chosen values that cause the math to wrap around, creating tokens from nothing or bypassing balance checks." };
  if (v.includes("tx.origin")) return { level: "Medium", percent: 55, scenario: "An attacker tricks the contract owner into visiting a malicious website, which silently submits a transaction that the contract believes came from the owner." };
  if (severity === "CRITICAL") return { level: "Critical", percent: 90, scenario: "This vulnerability has the potential for direct financial loss through targeted exploitation by sophisticated attackers." };
  if (severity === "HIGH") return { level: "High", percent: 75, scenario: "Under specific conditions, an attacker could leverage this flaw to manipulate contract state or extract value." };
  return { level: "Medium", percent: 45, scenario: "While not immediately dangerous, this issue could be combined with other vulnerabilities to create an exploit chain." };
};

const ScannerInterface = () => {
  const { t, currentLang } = useTranslation();
  const [chain, setChain] = useState("ethereum");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [report, setReport] = useState<any>(null);
  const [translatedReport, setTranslatedReport] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"scan" | "history">("scan");
  const [explanationLevel, setExplanationLevel] = useState<"beginner" | "intermediate" | "expert">("intermediate");

  // Upgraded AI Intelligence panel states
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [expandedAiCard, setExpandedAiCard] = useState<number | null>(0);
  const [expandedFinding, setExpandedFinding] = useState<number | null>(null);
  const [learnMoreFinding, setLearnMoreFinding] = useState<number | null>(null);
  const [fullyStreamed, setFullyStreamed] = useState<Record<number, boolean>>({});
  const [progressStage, setProgressStage] = useState(0);

  useEffect(() => {
    if (report && report.id) {
      setIsAiGenerating(true);
      setExpandedAiCard(0);
      setFullyStreamed({});
      setTranslatedReport(null);
      const timer = setTimeout(() => {
        setIsAiGenerating(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsAiGenerating(false);
      setExpandedAiCard(0);
      setFullyStreamed({});
      setTranslatedReport(null);
    }
  }, [report?.id]);

  // Listen for language or explanation level changes and fetch rewritten reports
  useEffect(() => {
    if (report && report.id && report.status === "COMPLETED") {
      const fetchTranslation = async () => {
        setIsTranslating(true);
        try {
          const isEnglish = currentLang.toLowerCase() === "en" || currentLang.toLowerCase() === "english";
          if (isEnglish && explanationLevel === "intermediate") {
            setTranslatedReport(null);
          } else {
            const contractInfo = getWhatIsThisContract(report.contract_name || "SmartContract", report.executive_summary || "");
            const ownerInfo = getOwnershipDetails(report.contract_name || "SmartContract", report.findings || []);
            const workflowSteps = getWorkflowSteps(report.contract_name || "SmartContract");
            const moneyNodes = getMoneyFlowNodes(report.contract_name || "SmartContract");
            const cautionItems = getCautionItems(report.contract_name || "SmartContract", report.findings || []);
            const glossaryTerms = getDynamicGlossary(report.contract_name || "SmartContract", report.findings || []);
            const exploitabilityInfo = (report.findings || []).map((f: any) => ({
              vuln: f.vulnerability,
              details: getVulnerabilityDetails(f.vulnerability, f.description),
              exploit: getExploitability(f.vulnerability, f.severity)
            }));
            const verdictInfo = getFinalVerdictText(report);
            const overview = getVulnerabilityOverview(report.findings || [], report.risk_score);

            const whyText = report.risk_score > 75
              ? `This contract scored ${report.risk_score}/100 on risk because the static analysis detected critical-severity vulnerabilities (such as ${(report.findings || []).slice(0, 2).map((f: any) => f.vulnerability).join(" and ") || "structural flaws"}). These issues represent direct financial risk under targeted exploitation.`
              : report.risk_score > 40
              ? `This contract scored ${report.risk_score}/100 on risk because moderate concerns were flagged, including centralized permissions or logic patterns that could be exploited under specific conditions. The code is functional but warrants caution.`
              : `This contract scored only ${report.risk_score}/100 on risk, indicating strong code quality. No critical or high-severity vulnerabilities were detected, and the contract follows established security standards.`;

            const whatToDoText = report.risk_score > 75
              ? "Do NOT deposit significant funds into this contract. If you are the developer, address the critical findings immediately. If you are a user, avoid interacting until a professional audit clears the issues."
              : report.risk_score > 40
              ? "Proceed with caution. Research the project team, check if the contract has been professionally audited, and only invest what you can afford to lose. Monitor for governance changes."
              : "This contract appears well-built. Standard due diligence still applies: verify the team, check community sentiment, and avoid over-concentrating assets in any single protocol.";

            const reportPayload = {
              executive_summary: report.executive_summary,
              attack_scenarios: report.attack_scenarios,
              recommendations: report.recommendations,
              vulnerability_overview: {
                title: overview.title,
                description: overview.description
              },
              findings: (report.findings || []).map((f: any, idx: number) => {
                const details = exploitabilityInfo[idx].details;
                const exploit = exploitabilityInfo[idx].exploit;
                return {
                  vulnerability: f.vulnerability,
                  description: f.description,
                  severity: f.severity,
                  line: f.line,
                  code_snippet: f.code_snippet,
                  details: {
                    plainEnglish: details.plainEnglish,
                    analogy: details.analogy,
                    whyItMatters: details.whyItMatters,
                    learnMore: details.learnMore
                  },
                  exploit: {
                    level: exploit.level,
                    scenario: exploit.scenario
                  }
                };
              }),
              cards: [
                {
                  id: 0,
                  title: "What Is This Contract?",
                  text: report.executive_summary || `${contractInfo.role} ${contractInfo.existence} ${contractInfo.problem} ${contractInfo.user} ${contractInfo.analogy}`,
                  sub_items: [
                    { label: "Contract Type", value: contractInfo.contractType },
                    { label: "Category", value: contractInfo.category },
                    { label: "Network", value: (report.chain || "ethereum").charAt(0).toUpperCase() + (report.chain || "ethereum").slice(1) },
                    { label: "Contract", value: report.contract_name || "Unknown" }
                  ]
                },
                {
                  id: 1,
                  title: "How Does It Work?",
                  text: "This contract processes operations in a structured lifecycle. Below is the step-by-step transaction flow of how users interact with the contract, how code verification checks permissions, and how state changes are recorded permanently on the blockchain ledger.",
                  sub_items: workflowSteps.map((step) => ({
                    title: step.title,
                    desc: step.desc
                  }))
                },
                {
                  id: 2,
                  title: "What Can This Contract Do?",
                  text: `The "${report.contract_name || "SmartContract"}" contract exposes several key blockchain capabilities: ${getCapabilities(report.contract_name || "SmartContract", report.findings || []).map(c => c.title).join(", ")}. Here is what they mean for you:`,
                  sub_items: getCapabilities(report.contract_name || "SmartContract", report.findings || []).map(c => ({
                    title: c.title,
                    desc: c.desc
                  }))
                },
                {
                  id: 3,
                  title: "Ownership & Permissions",
                  text: `Control analysis for this contract indicates it is managed by a ${ownerInfo.owner}. ${ownerInfo.whyItMatters}`,
                  sub_items: ownerInfo.permissions.map(perm => ({
                    key: perm.key,
                    why: perm.why
                  }))
                },
                {
                  id: 4,
                  title: "Money Flow",
                  text: `When you interact with the contract, money flows through a transparent sequence of rules. It moves from your wallet, enters the contract's secure storage pool, routes fees or administrative commissions, and disperses the balance to liquidity reserves or target recipients.`,
                  sub_items: moneyNodes.map(node => ({
                    label: node.label,
                    desc: node.desc
                  }))
                },
                {
                  id: 5,
                  title: "Risks Explained",
                  text: report.attack_scenarios || getExplainedRisksText(report.findings || []),
                  sub_items: exploitabilityInfo.map((info: any) => ({
                    vulnerability: info.vuln,
                    plainEnglish: info.details.plainEnglish,
                    analogy: info.details.analogy,
                    whyItMatters: info.details.whyItMatters,
                    scenario: info.exploit.scenario,
                    level: info.exploit.level
                  }))
                },
                {
                  id: 6,
                  title: "Positive Security Observations",
                  text: `Our scanner checked for common security pitfalls and observed several positive engineering practices: ${getPositiveObservations(report.findings || []).map(o => o.title).join(". ")}. Here's what makes this contract code secure:`,
                  sub_items: getPositiveObservations(report.findings || []).map(o => ({
                    title: o.title,
                    desc: o.desc
                  }))
                },
                {
                  id: 7,
                  title: "Things Users Should Be Careful About",
                  text: getBeCarefulText(report.contract_name || "SmartContract", report.findings || []),
                  sub_items: cautionItems.map(item => ({
                    title: item.title,
                    desc: item.desc
                  }))
                },
                {
                  id: 8,
                  title: "Learn While You Analyze",
                  text: "To help you navigate the technical findings, here is a quick high-school level guide to the common blockchain terms referenced during our smart contract security analysis:",
                  sub_items: glossaryTerms.map(item => ({
                    term: item.term,
                    definition: item.definition
                  }))
                },
                {
                  id: 9,
                  title: "Final Verdict",
                  text: report.recommendations || `Based on our automated telemetry audit, the final classification for this contract is: ${verdictInfo.rec}. Here is the complete breakdown of our trust scores and recommendations:`,
                  sub_items: [
                    { label: "Classification", value: verdictInfo.rec, desc: verdictInfo.desc },
                    { label: "Why This Rating?", value: whyText },
                    { label: "What Should You Do?", value: whatToDoText }
                  ]
                }
              ]
            };

            const fullRes = await fetch(`${API_BASE_URL}/contracts/report/${report.id}/translate-full`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                language: currentLang,
                explanation_level: explanationLevel,
                report_data: reportPayload
              })
            });

            if (fullRes.ok) {
              const fullData = await fullRes.json();
              setTranslatedReport(fullData.report_data);
            }
          }
          setFullyStreamed({});
        } catch (err) {
          console.error("Failed to load translation", err);
        } finally {
          setIsTranslating(false);
        }
      };

      if (!isLoading) {
        fetchTranslation();
      }
    }
  }, [currentLang, explanationLevel, report?.id, isLoading]);

  // Animated progress stage advancement during loading
  const analysisStages = [
    { label: "Connecting to scanner node", icon: "🔗" },
    { label: "Fetching contract source code", icon: "📄" },
    { label: "Running heuristic static analysis", icon: "🔍" },
    { label: "Generating AI intelligence report", icon: "🤖" }
  ];

  useEffect(() => {
    if (!isLoading) {
      setProgressStage(0);
      return;
    }
    const interval = setInterval(() => {
      setProgressStage(prev => (prev < analysisStages.length - 1 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleToggleCard = (idx: number) => {
    if (expandedAiCard === idx) {
      setExpandedAiCard(null);
    } else {
      setExpandedAiCard(idx);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/contracts/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.analyses || []);
      }
    } catch (err) {
      console.error("Failed to load history list", err);
    }
  };

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsLoading(true);
    setReport(null);
    setStatusText("Initializing connection with scanner node...");

    try {
      const res = await fetch(`${API_BASE_URL}/contracts/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chain, address })
      });

      if (!res.ok) throw new Error("Server failed to initialize scan");
      const initialReport = await res.json();
      pollReportStatus(initialReport.id);

    } catch (err: any) {
      setIsLoading(false);
      setStatusText(`Error: ${err.message || "Failed to contact scan backend"}`);
    }
  };

  const pollReportStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/contracts/report/${id}?lang=${currentLang}&level=${explanationLevel}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "PROCESSING") {
          setStatusText("Analyzing contract AST rules & decompiling bytecode...");
        } else if (data.status === "COMPLETED") {
          clearInterval(interval);
          setReport(data);
          setIsLoading(false);
          setStatusText("");
          fetchHistory(); // Refresh histories list
        } else if (data.status === "FAILED") {
          clearInterval(interval);
          setIsLoading(false);
          setStatusText("Scan failed. Ensure contract address is correct and verified on the selected chain explorer.");
        }
      } catch (err) {
        console.error("Status poll error", err);
      }
    }, 2000);
  };

  const handleExportPDF = () => {
    if (!report) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Security Report - ${report.contract_name || "Audit"}</title>
          <style>
            body { font-family: -apple-system, sans-serif; color: #111; line-height: 1.6; padding: 40px; }
            h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { font-size: 18px; margin-top: 30px; border-bottom: 1px solid #ddd; }
            pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; font-family: monospace; font-size: 12px; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; }
            .critical { background: #fee2e2; color: #991b1b; }
            .high { background: #ffedd5; color: #9a3412; }
            .medium { background: #fef9c3; color: #854d0e; }
            .info { background: #f0fdf4; color: #166534; }
          </style>
        </head>
        <body>
          <h1>BlockSpectra Smart Contract Audit Report</h1>
          <p><strong>Contract Name:</strong> ${report.contract_name || "Unknown"}</p>
          <p><strong>Address:</strong> ${report.address}</p>
          <p><strong>Chain:</strong> ${report.chain.toUpperCase()}</p>
          <p><strong>Overall Risk Score:</strong> ${report.risk_score} / 100</p>
          <p><strong>Severity:</strong> <span class="badge \${report.severity.toLowerCase()}">${report.severity}</span></p>
          
          <h2>Executive Summary</h2>
          <p>${report.executive_summary || "No summary provided."}</p>
          
          <h2>Attack Scenarios</h2>
          <p>${report.attack_scenarios || "No scenarios simulated."}</p>
          
          <h2>Recommendations</h2>
          <p>${report.recommendations || "No recommendations generated."}</p>
          
          <h2>Technical Findings</h2>
          <ul>
            ${(report.findings || []).map((f: any) => `
              <li>
                <strong>[${f.severity}] ${f.vulnerability}</strong> (Line ${f.line || "N/A"})<br/>
                \${f.description}<br/>
                \${f.code_snippet ? \`<pre>\${f.code_snippet}</pre>\` : ""}
              </li>
            `).join("")}
          </ul>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="w-full bg-[#12131b]/95 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left">
      {/* Sub-tab Selectors */}
      <div className="flex gap-4 border-b border-white/5 pb-4 mb-6">
        <button
          onClick={() => setActiveTab("scan")}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === "scan" ? "text-blue-400" : "text-gray-500 hover:text-white"
          }`}
        >
          <Search className="w-4 h-4" />
          Scan Contract
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === "history" ? "text-blue-400" : "text-gray-500 hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          Audit History
        </button>
      </div>

      {activeTab === "scan" ? (
        <div className="space-y-6">
          <form onSubmit={handleStartScan} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Chain Selection Selector */}
            <div className="md:col-span-4 flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                Select Network
              </label>
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
              >
                {SUPPORTED_CHAINS.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#12131b] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Address input */}
            <div className="md:col-span-6 flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                Contract Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
              />
            </div>

            {/* Submit button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-xl text-xs font-semibold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Scanning
                  </>
                ) : (
                  <>
                    <Terminal className="w-3.5 h-3.5" />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Loading details / Multi-step progress indicator */}
          {isLoading && (
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 font-mono text-[10px] text-blue-400">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span className="hidden sm:inline">{statusText}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {analysisStages.map((stage, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all duration-500 ${
                      idx < progressStage ? 'bg-emerald-500/20 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                      : idx === progressStage ? 'bg-blue-500/20 border border-blue-500/30 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.2)]' 
                      : 'bg-white/[0.02] border border-white/[0.06]'
                    }`}>
                      {idx < progressStage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span>{stage.icon}</span>}
                    </div>
                    <span className={`text-[8px] font-mono font-bold text-center leading-tight transition-colors duration-300 hidden sm:block ${
                      idx <= progressStage ? 'text-gray-300' : 'text-gray-600'
                    }`}>{stage.label}</span>
                    <div className={`w-full h-0.5 rounded-full transition-all duration-700 ${
                      idx < progressStage ? 'bg-emerald-500/50' : idx === progressStage ? 'bg-blue-500/30' : 'bg-white/5'
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error / scan failed state */}
          {!isLoading && statusText.startsWith("Error") && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-xs text-red-400 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{statusText}</span>
            </div>
          )}

          {/* Completed Audit Report Viewer Dashboard */}
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 border-t border-white/5 pt-6"
            >
              {/* Header metrics card list */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">{t('common.contractName', 'Contract Name')}</span>
                  <span className="text-sm font-semibold text-white truncate">{report.contract_name || "Unknown"}</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">{t('common.riskIndex', 'Risk Index')}</span>
                  <span className={`text-sm font-bold font-mono ${
                    report.risk_score > 75 ? "text-red-400" : report.risk_score > 40 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {report.risk_score} / 100
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">{t('common.severity', 'Severity Status')}</span>
                  <span className={`text-xs font-bold uppercase ${
                    report.severity === "CRITICAL" || report.severity === "HIGH" ? "text-red-400" : "text-emerald-400"
                  }`}>{report.severity}</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">{t('common.confidence', 'Confidence index')}</span>
                  <span className="text-sm font-semibold text-white font-mono">{report.confidence_score}%</span>
                </div>
              </div>

              {/* Plain English Vulnerability Overview Banner */}
              {(() => {
                const overview = getVulnerabilityOverview(report.findings || [], report.risk_score);
                // Map overview titles to translation keys
                const titleKey = overview.title === "Healthy Security Standing" ? 'overview.healthy.title'
                  : overview.title === "Critical Security Alerts Detected" ? 'overview.critical.title'
                  : 'overview.moderate.title';
                const descKey = overview.title === "Healthy Security Standing" ? 'overview.healthy.desc' : '';
                const overviewTitle = translatedReport?.vulnerability_overview?.title || t(titleKey, overview.title);
                const overviewDesc = translatedReport?.vulnerability_overview?.description || (descKey ? t(descKey, overview.description) : overview.description);
                return (
                  <div className={`p-5 rounded-2xl border backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left ${overview.badgeColor}`}>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold tracking-wider uppercase font-mono flex items-center gap-1.5">
                        <span>⚠️</span> {overviewTitle}
                      </h4>
                      <p className="text-[11px] text-gray-300 leading-relaxed font-sans w-full">
                        {overviewDesc}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Action bar (Export Report details) */}
              <div className="flex justify-end">
                <button
                   onClick={handleExportPDF}
                   className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white rounded-xl border border-white/10 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t('common.export', 'Export PDF Audit Report')}
                </button>
              </div>

              {/* Audit Report Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left pane: AI Intelligence Expandable Panel (col-span-7) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* AI Panel Header */}
                  <div className="flex items-center gap-3 pb-1">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm shadow-[0_0_16px_rgba(59,130,246,0.1)]">🤖</div>
                    <div>
                      <h3 className="text-xs font-bold text-white tracking-wider font-mono uppercase">{t('common.aiIntel', 'AI Contract Intelligence')}</h3>
                      <p className="text-[9px] text-gray-500 font-sans mt-0.5">{t('common.aiIntelSubtitle', 'Powered by deep heuristic analysis — explained for everyone')}</p>
                    </div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-transparent ml-2" />
                  </div>

                  {/* Explanation Level Selector */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {([
                      { key: 'beginner' as const, label: t('level.beginner', 'Beginner'), emoji: '🟢', desc: t('level.beginner.desc', 'Simple language & analogies') },
                      { key: 'intermediate' as const, label: t('level.intermediate', 'Intermediate'), emoji: '🟡', desc: t('level.intermediate.desc', 'Balanced technical detail') },
                      { key: 'expert' as const, label: t('level.expert', 'Expert'), emoji: '🔴', desc: t('level.expert.desc', 'Full protocol-level depth') }
                    ]).map((lvl) => (
                      <button
                        key={lvl.key}
                        onClick={() => setExplanationLevel(lvl.key)}
                        disabled={isTranslating}
                        className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          explanationLevel === lvl.key
                            ? 'bg-white/[0.06] border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.08)]'
                            : 'bg-white/[0.01] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
                        } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="text-xs">{lvl.emoji}</span>
                        <div>
                          <span className={`text-[10px] font-bold font-mono uppercase tracking-wide ${
                            explanationLevel === lvl.key ? 'text-white' : 'text-gray-400'
                          }`}>
                            {lvl.label}
                          </span>
                          <p className={`text-[8px] font-sans leading-tight mt-0.5 ${
                            explanationLevel === lvl.key ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {lvl.desc}
                          </p>
                        </div>
                        {explanationLevel === lvl.key && (
                          <div className="absolute -top-px -right-px w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Fallback Notice */}
                  {["SafeToken", "StakingPool", "DexRouter", "VulnerableTokenPool"].includes(report.contract_name) && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4.5 text-left space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-[10px] uppercase tracking-wider">
                        <span>⚠️</span> {t('fallback.title', 'Fallback Simulation Active')}
                      </div>
                      <p className="text-[10px] text-gray-300 leading-relaxed font-sans">
                        {t('fallback.desc1', 'We could not retrieve verified source code for this address from Etherscan/Blockscout.')} {t('fallback.desc2', 'To ensure you can still test the analyzer, we fell back to a simulated template contract.')}: <strong className="text-white">{report.contract_name}</strong>.
                      </p>
                      <p className="text-[9px] text-gray-400 leading-normal font-sans">
                        {t('fallback.desc3', "To analyze real mainnet contracts, please verify that the contract code is verified on the selected network's block explorer.")}
                      </p>
                    </div>
                  )}

                  {isAiGenerating || isTranslating ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white/[0.01] border border-white/[0.04] rounded-2xl p-5 space-y-3 animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-xl bg-white/5" />
                            <div className="h-4 bg-white/5 rounded w-1/3" />
                          </div>
                          <div className="space-y-2 pt-2">
                            <div className="h-3 bg-white/5 rounded w-full" />
                            <div className="h-3 bg-white/5 rounded w-5/6" />
                            <div className="h-3 bg-white/5 rounded w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[780px] overflow-y-auto pr-1 scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
                      {(() => {
                        const contractInfo = getWhatIsThisContract(report.contract_name || "SmartContract", report.executive_summary || "");
                        const ownerInfo = getOwnershipDetails(report.contract_name || "SmartContract", report.findings || []);
                        const workflowSteps = getWorkflowSteps(report.contract_name || "SmartContract");
                        const moneyNodes = getMoneyFlowNodes(report.contract_name || "SmartContract");
                        const cautionItems = getCautionItems(report.contract_name || "SmartContract", report.findings || []);
                        const glossaryTerms = getDynamicGlossary(report.contract_name || "SmartContract", report.findings || []);

                        const tCard = (id: number, fallbackTitle: string, fallbackText: string) => {
                          const tc = translatedReport?.cards?.find((c: any) => c.id === id);
                          return {
                            title: tc?.title || fallbackTitle,
                            text: tc?.text || fallbackText,
                            sub_items: tc?.sub_items
                          };
                        };

                        return [
                        {
                          id: 0,
                          emoji: "📖",
                          title: tCard(0, "What Is This Contract?", "").title,
                          text: tCard(0, "What Is This Contract?", report.executive_summary || `${contractInfo.role} ${contractInfo.existence} ${contractInfo.problem} ${contractInfo.user} ${contractInfo.analogy}`).text,
                          element: (
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
                              {[
                                { label: "Contract Type", value: contractInfo.contractType, icon: "🏷" },
                                { label: "Category", value: contractInfo.category, icon: "📊" },
                                { label: "Network", value: (report.chain || "ethereum").charAt(0).toUpperCase() + (report.chain || "ethereum").slice(1), icon: "🌐" },
                                { label: "Contract", value: report.contract_name || "Unknown", icon: "📝" }
                              ].map((item, idx) => {
                                const transSub = tCard(0, "", "").sub_items?.[idx];
                                return (
                                  <div key={idx} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5 space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px]">{item.icon}</span>
                                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest font-mono">{transSub?.label || item.label}</span>
                                    </div>
                                    <p className="text-[10px] font-semibold text-white truncate">{transSub?.value || item.value}</p>
                                  </div>
                                );
                              })}
                            </div>
                          )
                        },
                        {
                          id: 1,
                          emoji: "⚙️",
                          title: tCard(1, "How Does It Work?", "").title,
                          text: tCard(1, "How Does It Work?", "This contract processes operations in a structured lifecycle. Below is the step-by-step transaction flow of how users interact with the contract, how code verification checks permissions, and how state changes are recorded permanently on the blockchain ledger.").text,
                          element: (
                            <div className="mt-4 pl-4 border-l-2 border-blue-500/20 space-y-5 relative text-left">
                              {workflowSteps.map((step, idx) => {
                                const transStep = tCard(1, "", "").sub_items?.[idx];
                                return (
                                  <div key={idx} className="relative pb-1 group">
                                    <div className="absolute -left-[23px] top-0.5 w-4 h-4 rounded-full bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                      <span className="text-sm mt-[-1px]">{step.icon}</span>
                                      <div>
                                        <h5 className="text-[11px] font-bold text-white">{transStep?.title || `${idx + 1}. ${step.title}`}</h5>
                                        <p className="text-[10px] text-gray-400 mt-0.5 leading-normal font-sans">{transStep?.desc || step.desc}</p>
                                      </div>
                                    </div>
                                    {idx < workflowSteps.length - 1 && (
                                      <div className="absolute left-[-15px] top-[22px] bottom-[-14px] w-[1px] bg-gradient-to-b from-blue-500/30 to-transparent" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )
                        },
                        {
                          id: 2,
                          emoji: "🎯",
                          title: tCard(2, "What Can This Contract Do?", "").title,
                          text: tCard(2, "What Can This Contract Do?", `The "${report.contract_name || "SmartContract"}" contract exposes several key blockchain capabilities: ${getCapabilities(report.contract_name || "SmartContract", report.findings || []).map(c => c.title).join(", ")}. Here is what they mean for you:`).text,
                          element: (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                              {getCapabilities(report.contract_name || "SmartContract", report.findings || []).map((cap, idx) => {
                                const transCap = tCard(2, "", "").sub_items?.[idx];
                                return (
                                  <div key={idx} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 flex items-start gap-2.5 hover:border-white/[0.08] transition-colors">
                                    <div className="text-blue-400 mt-0.5 font-bold">✔</div>
                                    <div className="space-y-0.5">
                                      <h5 className="text-[11px] font-bold text-white">{transCap?.title || cap.title}</h5>
                                      <p className="text-[9px] text-gray-400 leading-normal font-sans">{transCap?.desc || cap.desc}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )
                        },
                        {
                          id: 3,
                          emoji: "👤",
                          title: tCard(3, "Ownership & Permissions", "").title,
                          text: tCard(3, "Ownership & Permissions", `Control analysis for this contract indicates it is managed by a ${ownerInfo.owner}. ${ownerInfo.whyItMatters}`).text,
                          element: (
                            <div className="mt-4 space-y-3 text-left">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {ownerInfo.permissions.map((perm: any, idx: number) => {
                                  const transPerm = tCard(3, "", "").sub_items?.[idx];
                                  return (
                                    <div key={idx} className={`rounded-xl p-3 border flex items-start gap-2.5 ${perm.allowed ? 'bg-amber-500/[0.03] border-amber-500/10' : 'bg-emerald-500/[0.03] border-emerald-500/10'}`}>
                                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] mt-0.5 shrink-0 ${perm.allowed ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                                        {perm.allowed ? '⚠' : '✓'}
                                      </div>
                                      <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <h5 className="text-[10px] font-bold text-white font-mono">{transPerm?.key || perm.key}</h5>
                                          <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${perm.allowed ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                            {perm.allowed ? 'YES' : 'NO'}
                                          </span>
                                        </div>
                                        <p className="text-[8px] text-gray-400 leading-normal font-sans">{transPerm?.why || perm.why}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        },
                        {
                          id: 4,
                          emoji: "💰",
                          title: tCard(4, "Money Flow", "").title,
                          text: tCard(4, "Money Flow", `When you interact with the contract, money flows through a transparent sequence of rules. It moves from your wallet, enters the contract's secure storage pool, routes fees or administrative commissions, and disperses the balance to liquidity reserves or target recipients.`).text,
                          element: (
                            <div className="mt-4 space-y-4 text-left">
                              {/* Vertical Flow Diagram */}
                              <div className="py-3 bg-white/[0.01] rounded-2xl border border-white/[0.04] backdrop-blur-md">
                                <div className="flex flex-col items-center gap-0">
                                  {moneyNodes.map((node, idx) => {
                                    const transNode = tCard(4, "", "").sub_items?.[idx];
                                    const colorClasses: Record<string, string> = {
                                      blue: "bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_2px_12px_rgba(59,130,246,0.08)]",
                                      purple: "bg-purple-500/10 border-purple-500/20 text-purple-400 shadow-[0_2px_12px_rgba(168,85,247,0.08)]",
                                      cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 shadow-[0_2px_12px_rgba(6,182,212,0.08)]",
                                      amber: "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_2px_12px_rgba(245,158,11,0.08)]",
                                      emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_2px_12px_rgba(16,185,129,0.08)]"
                                    };
                                    return (
                                      <div key={idx} className="flex flex-col items-center">
                                        {idx > 0 && (
                                          <div className="flex flex-col items-center py-1">
                                            <div className="w-[1px] h-4 bg-gradient-to-b from-white/10 to-white/5" />
                                            <span className="text-gray-600 text-[10px]">▼</span>
                                          </div>
                                        )}
                                        <div className={`px-4 py-2 rounded-xl border text-[10px] font-mono font-bold flex items-center gap-2 ${colorClasses[node.color] || colorClasses.blue}`}>
                                          <span>{node.icon}</span> {transNode?.label || node.label}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              {/* Flow Explanations */}
                              <div className="space-y-2">
                                {moneyNodes.map((node, idx) => {
                                  const transNode = tCard(4, "", "").sub_items?.[idx];
                                  return (
                                    <div key={idx} className="flex items-start gap-2.5 text-left">
                                      <span className="text-[10px] font-bold text-gray-500 font-mono mt-0.5 w-4 shrink-0">{idx + 1}.</span>
                                      <div>
                                        <span className="text-[10px] font-bold text-white">{transNode?.label || node.label}:</span>
                                        <span className="text-[9px] text-gray-400 ml-1 font-sans">{transNode?.desc || node.desc}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        },
                        {
                          id: 5,
                          emoji: "🚨",
                          title: tCard(5, "Risks Explained", "").title,
                          text: tCard(5, "Risks Explained", report.attack_scenarios || getExplainedRisksText(report.findings || [])).text,
                          element: (
                            <div className="mt-4 space-y-3 text-left">
                              {(report.findings || []).map((f: any, idx: number) => {
                                const details = getVulnerabilityDetails(f.vulnerability, f.description);
                                const exploit = getExploitability(f.vulnerability, f.severity);
                                const exploitBarColor = exploit.percent >= 80 ? 'bg-red-500' : exploit.percent >= 50 ? 'bg-amber-500' : 'bg-blue-500';
                                const transFinding = tCard(5, "", "").sub_items?.[idx];
                                return (
                                  <div key={idx} className="bg-red-500/[0.02] border border-red-500/10 rounded-xl p-3.5 space-y-2.5 text-left">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-bold text-red-400 font-mono uppercase tracking-wide">{transFinding?.vulnerability || f.vulnerability}</span>
                                      <span className="text-[8px] font-bold px-2 py-0.5 rounded-full border bg-red-500/10 border-red-500/20 text-red-400">{f.severity}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-300 leading-relaxed font-sans">{transFinding?.plainEnglish || details.plainEnglish}</p>
                                    {/* Exploitability meter */}
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-[8px] font-mono font-bold">
                                        <span className="text-gray-500 uppercase tracking-wider">Exploitability</span>
                                        <span className={exploit.percent >= 80 ? 'text-red-400' : exploit.percent >= 50 ? 'text-amber-400' : 'text-blue-400'}>{transFinding?.level || exploit.level} ({exploit.percent}%)</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${exploit.percent}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }} className={`h-full rounded-full ${exploitBarColor}`} />
                                      </div>
                                    </div>
                                    {/* What could happen */}
                                    <div className="p-2.5 bg-black/30 rounded-lg border border-white/5 space-y-1">
                                      <div className="text-[9px] font-bold text-red-400/80 uppercase tracking-wider font-mono">{t('finding.whatCouldHappen', '🎯 What Could Happen:')}</div>
                                      <p className="text-[9px] text-gray-400 leading-normal font-sans">{transFinding?.scenario || exploit.scenario}</p>
                                    </div>
                                    <div className="p-2.5 bg-black/40 rounded-lg border border-white/5 space-y-1">
                                      <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider font-mono">{t('finding.realWorldAnalogy', '💡 Real-World Analogy:')}</div>
                                      <p className="text-[9px] text-gray-400 italic leading-normal font-sans">{transFinding?.analogy || details.analogy}</p>
                                    </div>
                                    <div className="text-[9px] text-gray-400 leading-normal font-sans">
                                      <strong className="text-white font-mono">{t('finding.whyItMattersLabel', 'Why it matters:')}</strong> {transFinding?.whyItMatters || details.whyItMatters}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )
                        },
                        {
                          id: 6,
                          emoji: "✅",
                          title: tCard(6, "Positive Security Observations", "").title,
                          text: tCard(6, "Positive Security Observations", `Our scanner checked for common security pitfalls and observed several positive engineering practices: ${getPositiveObservations(report.findings || []).map(o => o.title).join(". ")}. Here's what makes this contract code secure:`).text,
                          element: (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                              {getPositiveObservations(report.findings || []).map((o, idx) => {
                                const transObs = tCard(6, "", "").sub_items?.[idx];
                                return (
                                  <div key={idx} className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl p-3 flex items-start gap-2.5 hover:border-emerald-500/20 transition-colors">
                                    <div className="text-emerald-400 mt-0.5 font-bold">🛡️</div>
                                    <div className="space-y-0.5">
                                      <h5 className="text-[11px] font-bold text-white">{transObs?.title || o.title}</h5>
                                      <p className="text-[9px] text-gray-400 leading-normal font-sans">{transObs?.desc || o.desc}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )
                        },
                        {
                          id: 7,
                          emoji: "⚠",
                          title: tCard(7, "Things Users Should Be Careful About", "").title,
                          text: tCard(7, "Things Users Should Be Careful About", getBeCarefulText(report.contract_name || "SmartContract", report.findings || [])).text,
                          element: (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                              {cautionItems.map((item, idx) => {
                                const transCaution = tCard(7, "", "").sub_items?.[idx];
                                return (
                                  <div key={idx} className={`rounded-xl p-3 border flex items-start gap-2.5 ${
                                    item.severity === 'high' ? 'bg-red-500/[0.03] border-red-500/10' 
                                    : item.severity === 'medium' ? 'bg-amber-500/[0.03] border-amber-500/10' 
                                    : 'bg-white/[0.02] border-white/[0.04]'
                                  }`}>
                                    <span className="text-sm mt-0.5 shrink-0">{item.icon}</span>
                                    <div className="space-y-0.5 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h5 className="text-[10px] font-bold text-white">{transCaution?.title || item.title}</h5>
                                        <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full border ${
                                          item.severity === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                          : item.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                        }`}>{item.severity.toUpperCase()}</span>
                                      </div>
                                      <p className="text-[8px] text-gray-400 leading-normal font-sans">{transCaution?.desc || item.desc}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )
                        },
                        {
                          id: 8,
                          emoji: "🧠",
                          title: tCard(8, "Learn While You Analyze", "").title,
                          text: tCard(8, "Learn While You Analyze", "To help you navigate the technical findings, here is a quick high-school level guide to the common blockchain terms referenced during our smart contract security analysis:").text,
                          element: (
                            <div className="mt-4 space-y-3 text-left">
                              {glossaryTerms.map((item, idx) => {
                                const transGlossary = tCard(8, "", "").sub_items?.[idx];
                                return (
                                  <div key={idx} className="bg-white/[0.01] border border-white/[0.03] rounded-xl p-3 space-y-1 hover:border-blue-500/10 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px]">📖</span>
                                      <h5 className="text-[10px] font-bold text-blue-400 font-mono uppercase tracking-wide">What is {transGlossary?.term || item.term}?</h5>
                                    </div>
                                    <p className="text-[9px] text-gray-400 leading-normal font-sans">{transGlossary?.definition || item.definition}</p>
                                  </div>
                                );
                              })}
                            </div>
                          )
                        },
                        {
                          id: 9,
                          emoji: "🏁",
                          title: tCard(9, "Final Verdict", "").title,
                          text: tCard(9, "Final Verdict", report.recommendations || `Based on our automated telemetry audit, the final classification for this contract is: ${getFinalVerdictText(report).rec}. Here is the complete breakdown of our trust scores and recommendations:`,).text,
                          element: (
                            <div className="mt-4 space-y-4 text-left">
                              {/* Hero Trust Score */}
                              <div className="flex items-center gap-5 bg-black/30 p-4 rounded-2xl border border-white/5">
                                <div className="relative w-20 h-20 shrink-0">
                                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                    <motion.circle
                                      cx="40" cy="40" r="34" fill="none"
                                      stroke={getFinalVerdictText(report).score >= 70 ? "#10b981" : getFinalVerdictText(report).score >= 40 ? "#f59e0b" : "#ef4444"}
                                      strokeWidth="6" strokeLinecap="round"
                                      strokeDasharray={`${2 * Math.PI * 34}`}
                                      initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                                      animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - getFinalVerdictText(report).score / 100) }}
                                      transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-lg font-bold font-mono ${getFinalVerdictText(report).score >= 70 ? 'text-emerald-400' : getFinalVerdictText(report).score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                                      {getFinalVerdictText(report).score}
                                    </span>
                                    <span className="text-[7px] text-gray-500 font-mono uppercase">Trust</span>
                                  </div>
                                </div>
                                <div className="space-y-1.5 flex-1">
                                  {[
                                    { name: "Security Score", score: getFinalVerdictText(report).score, color: "bg-emerald-500" },
                                    { name: "Transparency", score: 90, color: "bg-cyan-500" },
                                    { name: "Owner Control", score: report.findings.some((f: any) => f.vulnerability.toLowerCase().includes("owner")) ? 40 : 85, color: "bg-purple-500" },
                                    { name: "Complexity", score: report.findings.length > 3 ? 80 : 50, color: "bg-amber-500" }
                                  ].map((m, idx) => (
                                    <div key={idx} className="space-y-0.5">
                                      <div className="flex justify-between text-[8px] font-mono font-bold uppercase text-gray-500">
                                        <span>{m.name}</span>
                                        <span className="text-gray-300">{m.score}%</span>
                                      </div>
                                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${m.score}%` }} transition={{ duration: 1, delay: 0.3 + idx * 0.1 }} className={`h-full rounded-full ${m.color}`} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Classification Badge */}
                              <div className={`p-4 rounded-xl border flex flex-col gap-1 text-left ${
                                getFinalVerdictText(report).rec.includes("Safe") 
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                  : getFinalVerdictText(report).rec.includes("Caution")
                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                    : "bg-red-500/10 border-red-500/20 text-red-400"
                              }`}>
                                <span className="text-xs font-bold font-mono tracking-widest uppercase">Classification: {tCard(9, "", "").sub_items?.[0]?.value || getFinalVerdictText(report).rec}</span>
                                <p className="text-[10px] text-gray-300 font-sans leading-relaxed mt-1">{tCard(9, "", "").sub_items?.[0]?.desc || getFinalVerdictText(report).desc}</p>
                              </div>

                              {/* Why + Action Recommendation */}
                              <div className="p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-2">
                                <h5 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">{t('finding.whyThisRating', '🤔 Why This Rating?')}</h5>
                                <p className="text-[9px] text-gray-300 leading-relaxed font-sans">
                                  {tCard(9, "", "").sub_items?.[1]?.value || (report.risk_score > 75
                                    ? `This contract scored ${report.risk_score}/100 on risk because the static analysis detected critical-severity vulnerabilities (such as ${(report.findings || []).slice(0, 2).map((f: any) => f.vulnerability).join(" and ") || "structural flaws"}). These issues represent direct financial risk under targeted exploitation.`
                                    : report.risk_score > 40
                                    ? `This contract scored ${report.risk_score}/100 on risk because moderate concerns were flagged, including centralized permissions or logic patterns that could be exploited under specific conditions. The code is functional but warrants caution.`
                                    : `This contract scored only ${report.risk_score}/100 on risk, indicating strong code quality. No critical or high-severity vulnerabilities were detected, and the contract follows established security standards.`
                                  )}
                                </p>
                                <h5 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono pt-1">{t('finding.whatShouldYouDo', '💡 What Should You Do?')}</h5>
                                <p className="text-[9px] text-gray-300 leading-relaxed font-sans">
                                  {tCard(9, "", "").sub_items?.[2]?.value || (report.risk_score > 75
                                    ? "Do NOT deposit significant funds into this contract. If you are the developer, address the critical findings immediately. If you are a user, avoid interacting until a professional audit clears the issues."
                                    : report.risk_score > 40
                                    ? "Proceed with caution. Research the project team, check if the contract has been professionally audited, and only invest what you can afford to lose. Monitor for governance changes."
                                    : "This contract appears well-built. Standard due diligence still applies: verify the team, check community sentiment, and avoid over-concentrating assets in any single protocol."
                                  )}
                                </p>
                              </div>
                            </div>
                          )
                        }
                      ];
                      })().map((card, idx) => {
                        const isOpen = expandedAiCard === idx;
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: idx * 0.04 }}
                            className={`bg-[#12131b]/95 border rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg transition-all ${
                              isOpen ? 'border-white/[0.1] shadow-[0_4px_24px_rgba(0,0,0,0.3)]' : 'border-white/[0.06]'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleCard(idx)}
                              className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-white/[0.02] active:bg-white/[0.03] transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-base">{card.emoji}</span>
                                <span className="text-xs font-bold text-gray-200 tracking-wider font-mono">
                                  {idx + 1}. {card.title}
                                </span>
                              </div>
                              <motion.span
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-xs font-bold text-gray-500 font-mono"
                              >
                                ▼
                              </motion.span>
                            </button>
                            
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: "easeInOut" }}
                                  className="overflow-hidden border-t border-white/[0.04] bg-[#0d0e14]/50"
                                >
                                  <div className="p-5 space-y-4">
                                    <div className="space-y-3">
                                      <p className="text-xs text-gray-300 leading-relaxed font-sans">
                                        {fullyStreamed[idx] ? (
                                          <span>{card.text}</span>
                                        ) : (
                                          <StreamingText 
                                            text={card.text} 
                                            onComplete={() => setFullyStreamed(prev => ({ ...prev, [idx]: true }))} 
                                          />
                                        )}
                                      </p>
                                    </div>
                                    {card.element}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
 
                {/* Right pane: Static Scanner Vulnerability findings list (col-span-5) */}
                <div className="lg:col-span-5 space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono px-1">
                    {t('common.staticFindings', 'Static Heuristic Findings')} ({report.findings?.length || 0})
                  </h4>
 
                  {report.findings && report.findings.length > 0 ? (
                    <div className="space-y-3 max-h-[780px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
                      {report.findings.map((f: any, idx: number) => {
                        const isExpanded = expandedFinding === idx;
                        const isLearnMoreOpen = learnMoreFinding === idx;
                        const details = getVulnerabilityDetails(f.vulnerability, f.description);
                        const transFinding = translatedReport?.findings?.[idx];
                        const findingDesc = transFinding?.description || f.description;
                        const transDetails = transFinding?.details || details;
                        
                        return (
                          <div
                            key={idx}
                            className="bg-[#191b26] border border-white/5 rounded-xl p-4 space-y-2.5 text-left transition-all"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-white font-mono tracking-wide">
                                {transFinding?.vulnerability || f.vulnerability}
                              </span>
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${
                                f.severity === "CRITICAL" || f.severity === "HIGH"
                                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              }`}>
                                {f.severity}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                              {findingDesc}
                            </p>
                            {f.line && (
                              <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono">
                                <span>{t('finding.line', 'Line')}: {f.line}</span>
                                <span className="bg-black/35 px-1.5 py-0.5 rounded font-mono truncate max-w-[180px]">
                                  {f.code_snippet}
                                </span>
                              </div>
                            )}
                            
                            <div className="pt-1.5 border-t border-white/[0.04] flex justify-end">
                              <button
                                type="button"
                                onClick={() => setExpandedFinding(isExpanded ? null : idx)}
                                className="text-[9px] font-bold font-mono tracking-wider text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <span>{isExpanded ? "▲ " + t('finding.collapse', 'Collapse Explanation') : "▼ " + t('finding.explain', 'Explain In Plain English')}</span>
                              </button>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden space-y-2.5 pt-2 border-t border-white/[0.04]"
                                >
                                  <div className="space-y-1">
                                    <span className="text-[8px] font-bold uppercase tracking-widest font-mono text-gray-500">{t('finding.simpleExplanation', 'Simple Explanation')}</span>
                                    <p className="text-[9px] text-gray-300 leading-relaxed font-sans">{transDetails.plainEnglish}</p>
                                  </div>
                                  <div className="p-2.5 bg-black/40 rounded-lg border border-white/5 space-y-1">
                                    <span className="text-[8px] font-bold uppercase tracking-widest font-mono text-amber-400">{t('finding.analogy', '💡 Analogy')}</span>
                                    <p className="text-[9px] text-gray-400 italic leading-normal font-sans">{transDetails.analogy}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[8px] font-bold uppercase tracking-widest font-mono text-gray-500">{t('finding.whyItMatters', 'Why It Matters')}</span>
                                    <p className="text-[9px] text-gray-300 leading-relaxed font-sans">{transDetails.whyItMatters}</p>
                                  </div>

                                  <div className="border border-white/5 rounded-lg overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => setLearnMoreFinding(isLearnMoreOpen ? null : idx)}
                                      className="w-full px-2.5 py-1.5 bg-white/[0.01] hover:bg-white/[0.03] text-[8px] font-bold font-mono text-gray-400 hover:text-white flex justify-between items-center transition-colors cursor-pointer"
                                    >
                                      <span>{t('finding.conceptDeepDive', '📚 Concept Deep Dive')}</span>
                                      <span>{isLearnMoreOpen ? "▲" : "▼"}</span>
                                    </button>
                                    {isLearnMoreOpen && (
                                      <div className="p-2.5 bg-black/50 text-[9px] text-gray-400 leading-relaxed border-t border-white/5 font-sans">
                                        {transDetails.learnMore}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 text-center text-emerald-400 space-y-2">
                      <Check className="w-8 h-8 mx-auto" />
                      <h4 className="text-xs font-bold uppercase">{t('finding.zeroIssues', 'Zero Issues Flagged')}</h4>
                      <p className="text-[10px] text-emerald-300/80 leading-normal max-w-[240px] mx-auto font-sans">
                        {t('finding.zeroIssuesDesc', 'Contract source passed all basic reentrancy, access control, and selfdestruct check assertions.')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        /* History scans lists */
        <div className="space-y-4">
          {history.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    setReport(h);
                    setActiveTab("scan");
                  }}
                  className="bg-white/[0.02] border border-white/[0.04] hover:border-white/10 hover:bg-white/[0.03] p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">
                        {h.contract_name || "Unknown Contract"}
                      </span>
                      <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase font-mono">
                        {h.chain}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono truncate max-w-[320px]">
                      {h.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Risk Score</span>
                      <span className={`text-xs font-bold font-mono ${
                        h.risk_score > 75 ? "text-red-400" : h.risk_score > 40 ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        {h.risk_score} / 100
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-500">
              {t('history.empty', 'No analyses logged. Trigger a scan above to build history database records.')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Wallet Intelligence Constants & Component ────────────────────────────────

const WALLET_CHAINS = [
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "base", name: "Base", symbol: "ETH" },
  { id: "arbitrum", name: "Arbitrum", symbol: "ETH" },
  { id: "polygon", name: "Polygon", symbol: "MATIC" },
  { id: "bnb", name: "BNB Chain", symbol: "BNB" },
  { id: "avalanche", name: "Avalanche", symbol: "AVAX" },
  { id: "solana", name: "Solana", symbol: "SOL" },
  { id: "sui", name: "Sui", symbol: "SUI" },
  { id: "aptos", name: "Aptos", symbol: "APT" },
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "tron", name: "Tron", symbol: "TRX" },
];

const riskLevelColor = (level: string) => {
  switch (level) {
    case "CRITICAL": return "text-red-400 bg-red-500/10 border-red-500/20";
    case "HIGH": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    case "MEDIUM": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "LOW": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    case "SAFE": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
  }
};

const scoreColor = (score: number) => {
  if (score >= 80) return "text-red-400";
  if (score >= 60) return "text-orange-400";
  if (score >= 40) return "text-amber-400";
  if (score >= 20) return "text-blue-400";
  return "text-emerald-400";
};

const flagMeta: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  whale: { label: "Whale", icon: "🐋", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", desc: "High-value address with large asset concentration" },
  dormant: { label: "Dormant", icon: "💤", color: "text-gray-400 bg-gray-500/10 border-gray-500/20", desc: "No activity detected in 180+ days" },
  wash_trader: { label: "Wash Trader", icon: "🔄", color: "text-red-400 bg-red-500/10 border-red-500/20", desc: "Circular trading pattern detected" },
  suspicious: { label: "Suspicious", icon: "⚠️", color: "text-orange-400 bg-orange-500/10 border-orange-500/20", desc: "Mixer interaction or dust attack pattern" },
  risky_approvals: { label: "Risky Approvals", icon: "🔓", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", desc: "Unlimited or high-risk token approvals active" },
  high_frequency: { label: "High Frequency", icon: "⚡", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", desc: "Bot-like transaction frequency detected" },
};

const WalletIntelligence = () => {
  const [chain, setChain] = useState("ethereum");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [report, setReport] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"scan" | "history">("scan");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/wallets/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.analyses || []);
      }
    } catch (err) {
      console.error("Failed to load wallet history", err);
    }
  };

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsLoading(true);
    setReport(null);
    setStatusText("Connecting to blockchain intelligence nodes...");

    try {
      const res = await fetch(`${API_BASE_URL}/wallets/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chain, address }),
      });

      if (!res.ok) throw new Error("Server failed to initialize wallet scan");
      const initialReport = await res.json();
      pollReportStatus(initialReport.id);
    } catch (err: any) {
      setIsLoading(false);
      setStatusText(`Error: ${err.message || "Failed to contact backend"}`);
    }
  };

  const pollReportStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/wallets/report/${id}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "PROCESSING") {
          setStatusText("Analyzing wallet behavior, tracing transactions, building risk profile...");
        } else if (data.status === "COMPLETED") {
          clearInterval(interval);
          setReport(data);
          setIsLoading(false);
          setStatusText("");
          fetchHistory();
        } else if (data.status === "FAILED") {
          clearInterval(interval);
          setIsLoading(false);
          setStatusText("Analysis failed. Verify the wallet address is valid on the selected chain.");
        }
      } catch (err) {
        console.error("Status poll error", err);
      }
    }, 2000);
  };

  const handleExportPDF = () => {
    if (!report) return;
    const pw = window.open("", "_blank");
    if (!pw) return;

    pw.document.write(`
      <html>
        <head>
          <title>Wallet Intelligence Report - ${report.wallet_label || report.address}</title>
          <style>
            body { font-family: -apple-system, sans-serif; color: #111; line-height: 1.6; padding: 40px; }
            h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { font-size: 18px; margin-top: 30px; border-bottom: 1px solid #ddd; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
            th { font-weight: 600; color: #666; }
          </style>
        </head>
        <body>
          <h1>BlockSpectra Wallet Intelligence Report</h1>
          <p><strong>Wallet:</strong> ${report.wallet_label || "Unknown"} (${report.address})</p>
          <p><strong>Chain:</strong> ${report.chain.toUpperCase()}</p>
          <p><strong>Wallet Score:</strong> ${report.wallet_score} / 100</p>
          <p><strong>Risk Level:</strong> ${report.risk_level}</p>
          <p><strong>Balance:</strong> $${report.total_balance_usd?.toLocaleString()}</p>

          <h2>Behavior Profile</h2>
          <p>${report.behavior_profile || "No profile generated."}</p>

          <h2>Interaction Summary</h2>
          <p>${report.interaction_summary || "No summary generated."}</p>

          <h2>Risk Assessment</h2>
          <p>${report.risk_assessment || "No assessment generated."}</p>

          <h2>Token Holdings</h2>
          <table>
            <tr><th>Token</th><th>Balance</th><th>Value (USD)</th></tr>
            ${(report.token_holdings || []).map((t: any) => `<tr><td>${t.symbol}</td><td>${t.balance}</td><td>$${t.value_usd?.toLocaleString()}</td></tr>`).join("")}
          </table>

          <h2>Behavioral Flags</h2>
          <ul>
            ${(report.behavior_flags || []).map((f: string) => `<li>${f}</li>`).join("")}
          </ul>
        </body>
      </html>
    `);
    pw.document.close();
    pw.print();
  };

  return (
    <div className="w-full bg-[#12131b]/95 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left">
      {/* Sub-tab Selectors */}
      <div className="flex gap-4 border-b border-white/5 pb-4 mb-6">
        <button
          onClick={() => setActiveTab("scan")}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === "scan" ? "text-amber-400" : "text-gray-500 hover:text-white"
          }`}
        >
          <Wallet className="w-4 h-4" />
          Analyze Wallet
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === "history" ? "text-amber-400" : "text-gray-500 hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          Analysis History
        </button>
      </div>

      {activeTab === "scan" ? (
        <div className="space-y-6">
          <form onSubmit={handleStartScan} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Chain Selection */}
            <div className="md:col-span-4 flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                Select Network
              </label>
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
              >
                {WALLET_CHAINS.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#12131b] text-white">
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Address Input */}
            <div className="md:col-span-6 flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                Wallet Address
              </label>
              <input
                type="text"
                placeholder="0x... or native address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-400 text-black rounded-xl text-xs font-semibold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Loading */}
          {isLoading && (
            <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex items-center gap-3 font-mono text-[10px] text-amber-400">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span>{statusText}</span>
            </div>
          )}

          {/* Error */}
          {!isLoading && statusText.startsWith("Error") && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-xs text-red-400 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{statusText}</span>
            </div>
          )}

          {/* Completed Report Dashboard */}
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 border-t border-white/5 pt-6"
            >
              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Wallet</span>
                  <span className="text-sm font-semibold text-white truncate">{report.wallet_label || "Unknown"}</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Wallet Score</span>
                  <span className={`text-sm font-bold font-mono ${scoreColor(report.wallet_score)}`}>
                    {report.wallet_score} / 100
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Risk Level</span>
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border w-fit ${riskLevelColor(report.risk_level)}`}>
                    {report.risk_level}
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Total Balance</span>
                  <span className="text-sm font-semibold text-white font-mono">
                    ${report.total_balance_usd?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex justify-end">
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white rounded-xl border border-white/10 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export PDF Report
                </button>
              </div>

              {/* Behavioral Flags Grid */}
              {report.behavior_flags && report.behavior_flags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono px-1 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    Behavioral Flags ({report.behavior_flags.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {report.behavior_flags.map((flag: string) => {
                      const meta = flagMeta[flag] || { label: flag, icon: "🔍", color: "text-gray-400 bg-gray-500/10 border-gray-500/20", desc: "Unknown flag" };
                      return (
                        <div key={flag} className={`border rounded-2xl p-4 flex items-start gap-3 ${meta.color}`}>
                          <span className="text-xl mt-0.5">{meta.icon}</span>
                          <div>
                            <span className="text-xs font-bold uppercase">{meta.label}</span>
                            <p className="text-[10px] opacity-75 mt-0.5 leading-relaxed">{meta.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: AI Summaries */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Behavior Profile */}
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-2">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-amber-400" />
                      Behavior Profile
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-sans">
                      {report.behavior_profile || "No behavior profile generated."}
                    </p>
                  </div>

                  {/* Interaction Summary */}
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-2">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                      <Network className="w-3.5 h-3.5 text-blue-400" />
                      Interaction Summary
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-sans">
                      {report.interaction_summary || "No interaction summary generated."}
                    </p>
                  </div>

                  {/* Risk Assessment */}
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-2">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      Risk Assessment
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-sans">
                      {report.risk_assessment || "No risk assessment generated."}
                    </p>
                  </div>
                </div>

                {/* Right Column: Portfolio & Data */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Transaction Timeline */}
                  <div className="bg-[#191b26] border border-white/5 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      Transaction Activity
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-gray-500 font-mono uppercase">Tx Count</span>
                        <p className="text-sm font-bold text-white font-mono">{report.transaction_summary?.tx_count?.toLocaleString() || "0"}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-gray-500 font-mono uppercase">Volume</span>
                        <p className="text-sm font-bold text-white font-mono">${report.transaction_summary?.volume_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || "0"}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-gray-500 font-mono uppercase">First Tx</span>
                        <p className="text-[10px] text-gray-300 font-mono">{report.transaction_summary?.first_tx?.slice(0, 10) || "N/A"}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-gray-500 font-mono uppercase">Last Tx</span>
                        <p className="text-[10px] text-gray-300 font-mono">{report.transaction_summary?.last_tx?.slice(0, 10) || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Token Holdings */}
                  <div className="bg-[#191b26] border border-white/5 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
                      Token Portfolio ({report.token_holdings?.length || 0})
                    </h4>
                    {report.token_holdings && report.token_holdings.length > 0 ? (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {report.token_holdings.map((t: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center py-1.5 border-b border-white/[0.03] last:border-0">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-bold text-gray-300">
                                {t.symbol?.slice(0, 2)}
                              </span>
                              <div>
                                <span className="text-[10px] font-semibold text-white">{t.symbol}</span>
                                <p className="text-[8px] text-gray-500">{t.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-mono text-white">{Number(t.balance).toLocaleString()}</p>
                              <p className="text-[8px] font-mono text-gray-500">${t.value_usd?.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-500">No token holdings detected.</p>
                    )}
                  </div>

                  {/* NFT Holdings */}
                  {report.nft_holdings && report.nft_holdings.length > 0 && (
                    <div className="bg-[#191b26] border border-white/5 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
                        NFT Collections ({report.nft_holdings.length})
                      </h4>
                      <div className="space-y-2">
                        {report.nft_holdings.map((n: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center py-1.5 border-b border-white/[0.03] last:border-0">
                            <span className="text-[10px] font-semibold text-white">{n.collection}</span>
                            <span className="text-[10px] font-mono text-gray-400">{n.count} items</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Approvals */}
                  {report.approvals && report.approvals.length > 0 && (
                    <div className="bg-[#191b26] border border-white/5 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-2">
                        Active Approvals ({report.approvals.length})
                      </h4>
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {report.approvals.map((a: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center py-1.5 border-b border-white/[0.03] last:border-0">
                            <div>
                              <span className="text-[10px] font-semibold text-white">{a.token}</span>
                              <p className="text-[8px] text-gray-500 font-mono truncate max-w-[140px]">{a.spender}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-gray-400">{a.allowance}</span>
                              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full border ${
                                a.risk === "HIGH" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              }`}>{a.risk}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Counterparties */}
                  {report.counterparties && report.counterparties.length > 0 && (
                    <div className="bg-[#191b26] border border-white/5 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
                        Top Counterparties ({report.counterparties.length})
                      </h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {report.counterparties.map((cp: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center py-1.5 border-b border-white/[0.03] last:border-0">
                            <div>
                              <span className="text-[10px] font-mono text-white truncate block max-w-[160px]">
                                {cp.label || `${cp.address?.slice(0, 8)}...${cp.address?.slice(-6)}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] font-mono text-gray-500">{cp.tx_count} txs</span>
                              <span className="text-[9px] font-mono text-gray-400">${cp.volume?.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        /* History Tab */
        <div className="space-y-4">
          {history.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    setReport(h);
                    setActiveTab("scan");
                  }}
                  className="bg-white/[0.02] border border-white/[0.04] hover:border-white/10 hover:bg-white/[0.03] p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">
                        {h.wallet_label || "Unknown Wallet"}
                      </span>
                      <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase font-mono">
                        {h.chain}
                      </span>
                      {h.risk_level && h.risk_level !== "UNKNOWN" && (
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${riskLevelColor(h.risk_level)}`}>
                          {h.risk_level}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono truncate max-w-[320px]">
                      {h.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Score</span>
                      <span className={`text-xs font-bold font-mono ${scoreColor(h.wallet_score)}`}>
                        {h.wallet_score} / 100
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-500">
              No wallet analyses logged. Trigger an analysis above to build the intelligence database.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Cross-Chain Attack Graph Components ─────────────────────────────────────

const CustomGraphNode = ({ data }: { data: any }) => {
  const type = data.type || 'Wallet';
  const label = data.label || '';
  const chain = data.chain || '';
  const riskScore = data.riskScore || 20;
  const isHighlighted = data.isHighlighted || false;
  const isSelected = data.isSelected || false;

  let riskBorder = "border-emerald-500/30 bg-emerald-950/20 text-emerald-400";
  let riskGlow = "shadow-[0_0_12px_rgba(16,185,129,0.05)]";

  if (riskScore >= 75) {
    riskBorder = "border-red-500/50 bg-red-950/30 text-red-400 animate-pulse";
    riskGlow = "shadow-[0_0_20px_rgba(239,68,68,0.2)]";
  } else if (riskScore >= 45) {
    riskBorder = "border-amber-500/40 bg-amber-950/20 text-amber-400";
    riskGlow = "shadow-[0_0_15px_rgba(245,158,11,0.1)]";
  }

  if (isHighlighted) {
    riskBorder = "border-blue-500/80 bg-blue-950/30 text-blue-400 scale-105";
    riskGlow = "shadow-[0_0_25px_rgba(59,130,246,0.4)] ring-2 ring-blue-500/50";
  } else if (isSelected) {
    riskBorder = "border-cyan-400/80 bg-cyan-950/30 text-cyan-400 scale-102";
    riskGlow = "shadow-[0_0_20px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400/30";
  }

  let nodeIcon = "👛";
  if (type === 'Contract') nodeIcon = "📄";
  else if (type === 'Token') nodeIcon = "🪙";
  else if (type === 'Bridge') nodeIcon = "🌉";
  else if (type === 'Protocol') nodeIcon = "⚙️";
  else if (type === 'Exchange') nodeIcon = "🏦";
  else if (type === 'Chain') nodeIcon = "🌐";

  return (
    <div className={`px-3 py-2.5 rounded-xl border text-[10px] font-sans font-medium flex flex-col gap-1 backdrop-blur-md transition-all duration-300 w-44 shadow-lg ${riskBorder} ${riskGlow}`}>
      <Handle type="target" position={Position.Top} style={{ background: '#555', width: 6, height: 6 }} />
      
      <div className="flex items-center justify-between gap-1.5 border-b border-white/[0.06] pb-1">
        <span className="text-[9px] opacity-60 uppercase font-bold tracking-wider font-mono">{type}</span>
        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded font-mono">{chain}</span>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs">{nodeIcon}</span>
        <span className="truncate text-white font-semibold flex-1 text-left">{label}</span>
      </div>

      <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/[0.04] text-[8px] opacity-75">
        <span>Risk Score:</span>
        <span className={riskScore >= 75 ? "text-red-400 font-bold" : riskScore >= 45 ? "text-amber-400 font-bold" : "text-emerald-400"}>
          {riskScore}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#555', width: 6, height: 6 }} />
    </div>
  );
};

const nodeTypes = {
  customNode: CustomGraphNode,
};

const layoutNodes = (backendNodes: any[], backendEdges: any[], searchQuery: string, selectedNodeId: string) => {
  const nodesMap = new Map(backendNodes.map(n => [n.id.toLowerCase(), { ...n }]));
  const centerId = "seed_node";
  const processed = new Set([centerId]);
  
  const nodesList: any[] = [];
  const query = searchQuery.toLowerCase();
  
  const centerNode = nodesMap.get(centerId);
  if (centerNode) {
    const isHighlighted = query ? centerNode.label.toLowerCase().includes(query) || centerNode.id.toLowerCase().includes(query) : false;
    const isSelected = selectedNodeId === centerNode.id;
    nodesList.push({
      id: centerNode.id,
      position: { x: 380, y: 280 },
      data: {
        label: centerNode.label,
        type: centerNode.type,
        chain: centerNode.chain,
        riskScore: centerNode.risk_score,
        properties: centerNode.properties,
        isHighlighted,
        isSelected
      },
      type: 'customNode'
    });
  }

  const hop1: string[] = [];
  backendEdges.forEach(e => {
    const s = e.source.toLowerCase();
    const t = e.target.toLowerCase();
    if (s === centerId && !processed.has(t)) {
      hop1.push(t);
      processed.add(t);
    } else if (t === centerId && !processed.has(s)) {
      hop1.push(s);
      processed.add(s);
    }
  });

  hop1.forEach((id, idx) => {
    const angle = (idx * 2 * Math.PI) / hop1.length;
    const x = 380 + 220 * Math.cos(angle);
    const y = 280 + 220 * Math.sin(angle);
    const node = nodesMap.get(id);
    if (node) {
      const isHighlighted = query ? node.label.toLowerCase().includes(query) || node.id.toLowerCase().includes(query) : false;
      const isSelected = selectedNodeId === node.id;
      nodesList.push({
        id: node.id,
        position: { x, y },
        data: {
          label: node.label,
          type: node.type,
          chain: node.chain,
          riskScore: node.risk_score,
          properties: node.properties,
          isHighlighted,
          isSelected
        },
        type: 'customNode'
      });
    }
  });

  const hop2: string[] = [];
  backendNodes.forEach(n => {
    const nid = n.id.toLowerCase();
    if (!processed.has(nid)) {
      hop2.push(nid);
      processed.add(nid);
    }
  });

  hop2.forEach((id, idx) => {
    const angle = (idx * 2 * Math.PI) / (hop2.length || 1);
    const x = 380 + 440 * Math.cos(angle);
    const y = 280 + 440 * Math.sin(angle);
    const node = nodesMap.get(id);
    if (node) {
      const isHighlighted = query ? node.label.toLowerCase().includes(query) || node.id.toLowerCase().includes(query) : false;
      const isSelected = selectedNodeId === node.id;
      nodesList.push({
        id: node.id,
        position: { x, y },
        data: {
          label: node.label,
          type: node.type,
          chain: node.chain,
          riskScore: node.risk_score,
          properties: node.properties,
          isHighlighted,
          isSelected
        },
        type: 'customNode'
      });
    }
  });

  return nodesList;
};

const buildReactFlowEdges = (backendEdges: any[]) => {
  return backendEdges.map((e, idx) => {
    const type = e.type.toLowerCase();
    const isBridge = type === "bridge";
    const isTransfer = type === "transfer";
    const isApproval = type === "approval";
    
    let stroke = "rgba(255, 255, 255, 0.12)";
    let strokeWidth = 1.5;
    let animated = false;

    if (isBridge) {
      stroke = "rgba(168, 85, 247, 0.7)";
      strokeWidth = 2.5;
      animated = true;
    } else if (isTransfer) {
      stroke = "rgba(59, 130, 246, 0.5)";
      strokeWidth = 1.8;
      animated = true;
    } else if (isApproval) {
      stroke = "rgba(245, 158, 11, 0.4)";
      strokeWidth = 1.2;
    }

    return {
      id: `edge_${idx}`,
      source: e.source,
      target: e.target,
      label: e.label || type,
      animated,
      style: { stroke, strokeWidth },
      labelStyle: { fill: "#aaa", fontSize: "7px", fontFamily: "monospace" },
      labelBgStyle: { fill: "#0a0b10", fillOpacity: 0.8, rx: 4 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isBridge ? "#a855f7" : isTransfer ? "#3b82f6" : "#666",
        width: 10,
        height: 10,
      }
    };
  });
};

const AttackGraph = () => {
  const [chain, setChain] = useState("ethereum");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [report, setReport] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"scan" | "history">("scan");
  
  // Interactive filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCluster, setSelectedCluster] = useState("all");
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [nodeTypeFilter, setNodeTypeFilter] = useState({
    Wallet: true,
    Contract: true,
    Token: true,
    Bridge: true,
    Protocol: true,
    Exchange: true,
    Chain: true
  });
  const [showHighRiskOnly, setShowHighRiskOnly] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/graph/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.analyses || []);
      }
    } catch (err) {
      console.error("Failed to load graph history", err);
    }
  };

  const handleBuildGraph = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsLoading(true);
    setReport(null);
    setSelectedNodeId("");
    setSelectedCluster("all");
    setStatusText("Initializing attack graph analysis pipeline...");

    try {
      const res = await fetch(`${API_BASE_URL}/graph/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chain, address })
      });

      if (!res.ok) throw new Error("Server failed to initialize graph builder");
      const initialReport = await res.json();
      pollReportStatus(initialReport.id);
    } catch (err: any) {
      setIsLoading(false);
      setStatusText(`Error: ${err.message || "Failed to contact graph backend"}`);
    }
  };

  const pollReportStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/graph/${id}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "PROCESSING") {
          setStatusText("Traversing L1/L2 networks, extracting cross-chain bridge logs & computing PageRank...");
        } else if (data.status === "COMPLETED") {
          clearInterval(interval);
          setReport(data);
          setIsLoading(false);
          setStatusText("");
          fetchHistory();
        } else if (data.status === "FAILED") {
          clearInterval(interval);
          setIsLoading(false);
          setStatusText("Analysis pipeline failed. Verify address is active.");
        }
      } catch (err) {
        console.error("Status check error", err);
      }
    }, 2000);
  };

  // Determine nodes to display in React Flow based on filters
  let filteredNodes: any[] = [];
  let filteredEdges: any[] = [];

  if (report && report.nodes) {
    // 1. Gather nodes in selected cluster
    let clusterNodesSet = new Set<string>();
    if (selectedCluster !== "all" && report.report.suspicious_clusters) {
      const matchingComp = report.report.suspicious_clusters.find((c: any) => c.cluster_id === selectedCluster);
      if (matchingComp) {
        // Find matching nodes based on label containing sample list
        report.nodes.forEach((n: any) => {
          if (matchingComp.nodes.includes(n.label)) {
            clusterNodesSet.add(n.id.toLowerCase());
          }
        });
      }
    }

    // 2. Filter nodes based on category checks and risk
    const nodesToLayout = report.nodes.filter((n: any) => {
      // NodeType filter
      const typeKey = n.type as keyof typeof nodeTypeFilter;
      if (!nodeTypeFilter[typeKey]) return false;

      // Risk score filter
      if (showHighRiskOnly && n.risk_score < 70) return false;

      // Cluster filter
      if (selectedCluster !== "all" && !clusterNodesSet.has(n.id.toLowerCase())) return false;

      return true;
    });

    filteredNodes = layoutNodes(nodesToLayout, report.edges, searchQuery, selectedNodeId);

    // 3. Filter edges: source and target must exist in filteredNodes list
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id.toLowerCase()));
    const rawEdges = report.edges.filter((e: any) => 
      visibleNodeIds.has(e.source.toLowerCase()) && visibleNodeIds.has(e.target.toLowerCase())
    );
    filteredEdges = buildReactFlowEdges(rawEdges);
  }

  // Node Inspector helper
  const selectedNodeProperties = report && report.nodes && selectedNodeId
    ? report.nodes.find((n: any) => n.id.toLowerCase() === selectedNodeId.toLowerCase())
    : null;

  const handleExportPDF = () => {
    if (!report) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Cross-Chain Attack Path Analysis Report</title>
          <style>
            body { font-family: -apple-system, sans-serif; color: #111; line-height: 1.6; padding: 40px; }
            h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { font-size: 16px; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f5f5f5; }
            .badge { display: inline-block; padding: 3px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; }
            .high { background: #fee2e2; color: #991b1b; }
            .med { background: #ffedd5; color: #9a3412; }
            .low { background: #f0fdf4; color: #166534; }
          </style>
        </head>
        <body>
          <h1>BlockSpectra Cross-Chain Threat Graph Report</h1>
          <p><strong>Seed Address:</strong> ${report.address}</p>
          <p><strong>Starting Chain:</strong> ${report.chain.toUpperCase()}</p>
          <p><strong>Report ID:</strong> ${report.id}</p>
          <p><strong>Date Generated:</strong> ${new Date(report.created_at).toLocaleString()}</p>

          <h2>Central Entities (PageRank Influences)</h2>
          <table>
            <thead>
              <tr>
                <th>Entity Label</th>
                <th>Type</th>
                <th>Chain</th>
                <th>Risk Score</th>
              </tr>
            </thead>
            <tbody>
              ${(report.report.central_entities || []).map((e: any) => `
                <tr>
                  <td>${e.label}</td>
                  <td>${e.type}</td>
                  <td>${e.chain.toUpperCase()}</td>
                  <td><span class="badge ${e.risk_score >= 70 ? 'high' : e.risk_score >= 40 ? 'med' : 'low'}">${e.risk_score}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <h2>Cross-Chain Bridge Movements</h2>
          <table>
            <thead>
              <tr>
                <th>Source Address</th>
                <th>Target Address</th>
                <th>Source Chain</th>
                <th>Target Chain</th>
                <th>Value (USD)</th>
                <th>Protocol</th>
              </tr>
            </thead>
            <tbody>
              ${(report.report.bridge_movements || []).map((bm: any) => `
                <tr>
                  <td>${bm.source}</td>
                  <td>${bm.target}</td>
                  <td>${bm.source_chain.toUpperCase()}</td>
                  <td>${bm.target_chain.toUpperCase()}</td>
                  <td>$${bm.value_usd.toLocaleString()}</td>
                  <td>${bm.bridge_label}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <h2>Attack Traversal Paths</h2>
          ${(report.report.attack_paths || []).map((ap: any) => `
            <h3>Path to ${ap.target_label} (Severity: ${ap.risk_score >= 70 ? 'CRITICAL' : 'HIGH'})</h3>
            <ul>
              ${ap.steps.map((st: any) => `
                <li>[${st.chain.toUpperCase()}] ${st.source} &rarr; ${st.type} ($${st.value_usd.toLocaleString()}) &rarr; ${st.target}</li>
              `).join("")}
            </ul>
          `).join("")}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="w-full bg-[#12131b]/95 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left">
      {/* Tab Selectors */}
      <div className="flex gap-4 border-b border-white/5 pb-4 mb-6">
        <button
          onClick={() => setActiveTab("scan")}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === "scan" ? "text-blue-400" : "text-gray-500 hover:text-white"
          }`}
        >
          <Network className="w-4 h-4" />
          Threat Canvas
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === "history" ? "text-blue-400" : "text-gray-500 hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          Graph Archives
        </button>
      </div>

      {activeTab === "scan" ? (
        <div className="space-y-6">
          <form onSubmit={handleBuildGraph} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                Source Chain
              </label>
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
              >
                {SUPPORTED_CHAINS.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#12131b] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-6 flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                Seed Wallet / Entity Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-xl text-xs font-semibold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Tracing...
                  </>
                ) : (
                  <>
                    <Network className="w-3.5 h-3.5" />
                    Build Graph
                  </>
                )}
              </button>
            </div>
          </form>

          {isLoading && (
            <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex items-center gap-3 font-mono text-[10px] text-blue-400">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span>{statusText}</span>
            </div>
          )}

          {report && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              
              {/* Left Side: Filter settings & Node properties inspector */}
              <div className="lg:col-span-3 space-y-5">
                
                {/* Search Panel */}
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Search Canvas Nodes
                  </span>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search label/address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-3" />
                  </div>
                </div>

                {/* Node Filtering Toggles */}
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Element Filters
                  </span>
                  <div className="space-y-2 text-xs text-gray-400">
                    {Object.keys(nodeTypeFilter).map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                        <input
                          type="checkbox"
                          checked={nodeTypeFilter[type as keyof typeof nodeTypeFilter]}
                          onChange={(e) => setNodeTypeFilter({
                            ...nodeTypeFilter,
                            [type]: e.target.checked
                          })}
                          className="rounded border-white/10 bg-white/5 text-blue-500 focus:ring-0 w-3.5 h-3.5"
                        />
                        {type}s
                      </label>
                    ))}
                    <div className="w-full h-[1px] bg-white/[0.04] my-2" />
                    <label className="flex items-center gap-2 cursor-pointer text-red-400/90 hover:text-red-400 transition-colors font-semibold">
                      <input
                        type="checkbox"
                        checked={showHighRiskOnly}
                        onChange={(e) => setShowHighRiskOnly(e.target.checked)}
                        className="rounded border-white/10 bg-white/5 text-red-500 focus:ring-0 w-3.5 h-3.5"
                      />
                      High Threat (Risk &ge; 70)
                    </label>
                  </div>
                </div>

                {/* Selected Node Properties Inspector */}
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 space-y-3 min-h-[160px]">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Entity Properties Inspector
                  </span>
                  {selectedNodeProperties ? (
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-white break-all max-w-[160px]">
                          {selectedNodeProperties.label}
                        </span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono bg-white/5 ${
                          selectedNodeProperties.risk_score >= 70 ? 'text-red-400' : selectedNodeProperties.risk_score >= 40 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          Risk {selectedNodeProperties.risk_score}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 space-y-1 font-mono">
                        <div className="flex justify-between border-b border-white/[0.03] py-0.5">
                          <span>Chain:</span>
                          <span className="uppercase text-gray-300">{selectedNodeProperties.chain}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/[0.03] py-0.5">
                          <span>Category:</span>
                          <span className="text-gray-300">{selectedNodeProperties.type}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/[0.03] py-0.5">
                          <span>Centrality:</span>
                          <span className="text-gray-300">{selectedNodeProperties.pagerank} pr</span>
                        </div>
                        {selectedNodeProperties.properties && Object.entries(selectedNodeProperties.properties).map(([k, v]: any) => (
                          <div key={k} className="flex justify-between gap-2 border-b border-white/[0.03] py-0.5">
                            <span className="capitalize">{k.replace("_", " ")}:</span>
                            <span className="text-gray-300 truncate max-w-[100px]" title={String(v)}>
                              {typeof v === "boolean" ? (v ? "Yes" : "No") : String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-[10px] italic">
                      Click a node on the canvas to view detailed cross-chain properties.
                    </div>
                  )}
                </div>

                {/* PDF Export trigger */}
                <button
                  onClick={handleExportPDF}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Threat Report
                </button>
              </div>

              {/* Middle Side: React Flow Canvas */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="bg-[#0b0c10] border border-white/[0.06] rounded-2xl h-[560px] relative overflow-hidden flex flex-col justify-between">
                  
                  {/* Canvas Indicators */}
                  <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-gray-400 bg-black/60 px-2.5 py-1 rounded-full border border-white/5 backdrop-blur-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Trace: {report.address.substring(0, 10)}...
                    </span>
                  </div>

                  {/* React Flow Core Engine */}
                  <ReactFlow
                    nodes={filteredNodes}
                    edges={filteredEdges}
                    nodeTypes={nodeTypes}
                    onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                    fitView
                    minZoom={0.2}
                    maxZoom={1.5}
                    attributionPosition="bottom-right"
                  >
                    <Background color="rgba(255,255,255,0.03)" gap={20} size={1} />
                    <Controls className="!bg-[#12131b] !border-white/5 !text-white !fill-current [&_button]:!bg-[#12131b] [&_button]:!border-white/5 [&_button]:!text-white [&_svg]:!fill-white" />
                    <MiniMap
                      style={{ background: "#12131b", border: "1px solid rgba(255,255,255,0.05)" }}
                      nodeColor={() => "rgba(255,255,255,0.06)"}
                      maskColor="rgba(0,0,0,0.4)"
                    />
                  </ReactFlow>

                  {/* Legend overlay */}
                  <div className="p-3 border-t border-white/[0.05] bg-black/40 flex items-center justify-between text-[8px] sm:text-[9px] text-gray-400 font-mono">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500/20 border border-red-500" /> High Threat</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500/20 border border-amber-500" /> Medium Threat</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500/20 border border-emerald-500" /> Low/Safe</span>
                    </div>
                    <span className="italic">Drag nodes to rearrange node layout</span>
                  </div>

                </div>
              </div>

              {/* Right Side: Threat analysis report */}
              <div className="lg:col-span-3 space-y-5">
                
                {/* Central Entities List */}
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Central Influence Hubs
                  </span>
                  <div className="space-y-2">
                    {(report.report.central_entities || []).map((e: any) => (
                      <div
                        key={e.id}
                        onClick={() => setSelectedNodeId(e.id)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedNodeId === e.id ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/5 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <div className="space-y-0.5 text-left">
                          <div className="font-semibold text-xs text-white truncate max-w-[120px]">{e.label}</div>
                          <div className="text-[8px] text-gray-500 font-mono uppercase">{e.type} &bull; {e.chain}</div>
                        </div>
                        <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-mono">
                          {e.pagerank_score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connected Cluster Selector */}
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Community Clusters
                  </span>
                  <select
                    value={selectedCluster}
                    onChange={(e) => setSelectedCluster(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all" className="bg-[#12131b] text-white">All Clusters</option>
                    {(report.report.suspicious_clusters || []).map((c: any) => (
                      <option key={c.cluster_id} value={c.cluster_id} className="bg-[#12131b] text-white">
                        {c.cluster_id.toUpperCase()} ({c.node_count} nodes) - Risk {c.max_risk}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Traversal Paths list */}
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Vulnerability Attack Paths
                  </span>
                  {(report.report.attack_paths || []).length > 0 ? (
                    <div className="space-y-3">
                      {(report.report.attack_paths || []).map((ap: any, idx: number) => (
                        <div key={idx} className="bg-black/20 border border-white/5 p-3 rounded-xl space-y-2 text-left">
                          <div className="flex justify-between items-center text-[9px] font-bold">
                            <span className="text-red-400">Target: {ap.target_label}</span>
                            <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 font-mono">
                              Risk {ap.risk_score}
                            </span>
                          </div>
                          <div className="space-y-1.5 pl-1.5 border-l border-white/10">
                            {ap.steps.map((st: any, stepIdx: number) => (
                              <div key={stepIdx} className="text-[8px] text-gray-400 font-mono leading-normal">
                                <span className="text-blue-400">{st.source}</span>
                                <span className="mx-1 text-gray-600">&rarr;</span>
                                <span className="text-gray-300 font-semibold">{st.type} (${st.value_usd.toLocaleString()})</span>
                                <span className="mx-1 text-gray-600">&rarr;</span>
                                <span className="text-blue-400">{st.target}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-[10px] text-gray-500 italic font-mono">
                      No paths to high threat nodes detected.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}
        </div>
      ) : (
        /* History Archive List */
        <div className="space-y-4">
          {history.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    setReport(h);
                    setActiveTab("scan");
                  }}
                  className="bg-white/[0.02] border border-white/[0.04] hover:border-white/10 hover:bg-white/[0.03] p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">
                        Seed: {h.address.substring(0, 12)}...
                      </span>
                      <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase font-mono">
                        {h.chain}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono truncate max-w-[320px]">
                      Nodes: {h.nodes.length} &bull; Edges: {h.edges.length}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Cluster Count</span>
                      <span className="text-xs font-bold text-gray-300 font-mono">
                        {h.report.suspicious_clusters ? h.report.suspicious_clusters.length : 0} components
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-500">
              No graph analyses logged. Trigger a scan above to build transaction topologies.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
// ─── Transaction Simulator Constants & Component ─────────────────────────────

const SIMULATION_CHAINS = [
  { id: "ethereum", name: "Ethereum", logo: "Ξ" },
  { id: "arbitrum", name: "Arbitrum", logo: "A" },
  { id: "base", name: "Base", logo: "B" },
  { id: "optimism", name: "Optimism", logo: "O" },
  { id: "solana", name: "Solana", logo: "SOL" },
  { id: "sui", name: "Sui", logo: "SUI" },
  { id: "aptos", name: "Aptos", logo: "APT" }
];

const SIMULATION_BACKENDS = [
  { id: "custom", name: "Custom Simulator (Local)" },
  { id: "tenderly", name: "Tenderly Dev Fork" },
  { id: "foundry", name: "Foundry Anvil RPC" },
  { id: "anvil", name: "Anvil Localnet" }
];

const TRANSACTION_TYPES = [
  { id: "transfer", name: "Token / Asset Transfer" },
  { id: "swap", name: "DeFi Liquidity Swap" },
  { id: "approval", name: "Token Spending Approval" },
  { id: "contract_call", name: "Custom Contract Call" }
];

const TransactionSimulator = () => {
  const [chain, setChain] = useState("ethereum");
  const [backend, setBackend] = useState("custom");
  const [txType, setTxType] = useState("transfer");

  // Input states
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [data, setData] = useState("");
  const [value, setValue] = useState("");
  const [gasLimit, setGasLimit] = useState(1000000);

  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [report, setReport] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"simulate" | "history">("simulate");
  const [resultTab, setResultTab] = useState<"overview" | "assets" | "trace" | "state" | "events" | "risks" | "explanation">("overview");

  // Terminal logging states
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/simulation/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.simulations || []);
      }
    } catch (err) {
      console.error("Failed to load simulation history", err);
    }
  };

  const handleStartSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender.trim()) return;

    setIsLoading(true);
    setReport(null);
    setConsoleLogs([]);
    
    // Simulate terminal logs progress
    const steps = [
      `Initializing node link with selected backend (${backend.toUpperCase()})...`,
      `Impersonating sender address: ${sender}`,
      `Broadcasting raw transaction payload on ${chain.toUpperCase()} block fork...`,
      "EVM/Non-EVM instruction call tree tracing in progress...",
      "Analyzing storage slots & state balance deltas...",
      "Executing security heuristics audit engine...",
      "Compiling final telemetry report summaries..."
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`]);
        setStatusText(step);
      }, index * 800);
    });

    try {
      // Wait for terminal log effect
      await new Promise((resolve) => setTimeout(resolve, steps.length * 800));

      const res = await fetch(`${API_BASE_URL}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chain,
          backend,
          tx_type: txType,
          sender,
          receiver: txType === "contract_call" ? contractAddress : receiver,
          amount: amount ? parseFloat(amount) : null,
          token_address: tokenAddress,
          contract_address: contractAddress,
          data,
          value: value ? parseFloat(value) : 0.0,
          gas_limit: gasLimit
        })
      });

      if (!res.ok) throw new Error("Simulator failed to compile payload");
      const initialReport = await res.json();
      pollReportStatus(initialReport.id);

    } catch (err: any) {
      setIsLoading(false);
      setConsoleLogs((prev) => [...prev, `[ERROR] ${err.message || "Failed to contact simulator backend"}`]);
      setStatusText(`Error: ${err.message || "Failed to contact simulator backend"}`);
    }
  };

  const pollReportStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/simulation/${id}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "COMPLETED") {
          clearInterval(interval);
          setReport(data);
          setIsLoading(false);
          setStatusText("");
          fetchHistory(); // Refresh history
          setResultTab("overview");
        } else if (data.status === "FAILED") {
          clearInterval(interval);
          setIsLoading(false);
          setStatusText(`Simulation Failed: ${data.error_message || "Reverted"}`);
        }
      } catch (err) {
        console.error("Simulation status poll error", err);
      }
    }, 1500);
  };

  const renderMarkdownExplanation = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    let inAlert = false;
    let alertType = "";
    let alertContent: string[] = [];

    return lines.map((line, idx) => {
      // GitHub style alerts
      if (line.startsWith("> [!")) {
        inAlert = true;
        alertType = line.includes("WARNING") ? "WARNING" : line.includes("CAUTION") ? "CAUTION" : "NOTE";
        alertContent = [];
        return null;
      }
      if (inAlert && line.startsWith(">")) {
        alertContent.push(line.replace(/^>\s?/, ""));
        return null;
      }
      if (inAlert && !line.startsWith(">")) {
        inAlert = false;
        const typeClass =
          alertType === "WARNING"
            ? "bg-red-500/10 border-red-500/20 text-red-400"
            : alertType === "CAUTION"
            ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
            : "bg-blue-500/10 border-blue-500/20 text-blue-400";
        const icon = alertType === "WARNING" ? "🚨" : alertType === "CAUTION" ? "⚠️" : "ℹ️";
        return (
          <div key={`alert-${idx}`} className={`p-4 border rounded-2xl my-4 flex items-start gap-3 ${typeClass}`}>
            <span className="text-base mt-0.5">{icon}</span>
            <div className="text-[11px] leading-relaxed font-sans font-medium space-y-1">
              {alertContent.map((c, cIdx) => (
                <p key={cIdx}>{c}</p>
              ))}
            </div>
          </div>
        );
      }

      const trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        return (
          <h3 key={idx} className="text-xs font-bold text-white mt-6 mb-3 uppercase tracking-widest font-mono border-b border-white/5 pb-2">
            {trimmed.substring(2)}
          </h3>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h4 key={idx} className="text-[11px] font-semibold text-gray-300 mt-4 mb-2 uppercase tracking-wider font-mono">
            {trimmed.substring(3)}
          </h4>
        );
      }
      if (trimmed.startsWith("- ")) {
        return (
          <ul key={idx} className="list-disc pl-5 text-[11px] text-gray-400 space-y-1 my-1 leading-relaxed">
            <li>{trimmed.substring(2)}</li>
          </ul>
        );
      }
      if (trimmed === "") {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-[11px] text-gray-400 leading-relaxed font-sans my-1.5">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="w-full bg-[#12131b]/95 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left">
      {/* Tab select option */}
      <div className="flex gap-4 border-b border-white/5 pb-4 mb-6">
        <button
          onClick={() => setActiveTab("simulate")}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === "simulate" ? "text-blue-400" : "text-gray-500 hover:text-white"
          }`}
        >
          <Zap className="w-4 h-4" />
          Simulate TX
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === "history" ? "text-blue-400" : "text-gray-500 hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          Simulation Log
        </button>
      </div>

      {activeTab === "simulate" ? (
        <div className="space-y-6">
          <form onSubmit={handleStartSimulation} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Chain select */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                  Select Chain
                </label>
                <select
                  value={chain}
                  onChange={(e) => setChain(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
                >
                  {SIMULATION_CHAINS.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#12131b] text-white">
                      {c.name} ({c.logo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Backend select */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                  Simulator Backend
                </label>
                <select
                  value={backend}
                  onChange={(e) => setBackend(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
                >
                  {SIMULATION_BACKENDS.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#12131b] text-white">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transaction Type select */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                  Transaction Type
                </label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
                >
                  {TRANSACTION_TYPES.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#12131b] text-white">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dynamic Inputs grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
              {/* Sender */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                  Sender Address (From)
                </label>
                <input
                  type="text"
                  required
                  placeholder="0x... or native wallet address"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
                />
              </div>

              {/* Transfer fields */}
              {txType === "transfer" && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                      Receiver Address (To)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0x... receiver address"
                      value={receiver}
                      onChange={(e) => setReceiver(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                      Token Contract Address (Optional, leave blank for native)
                    </label>
                    <input
                      type="text"
                      placeholder="0x... ERC20/SPL/Move token address"
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
                    />
                  </div>
                </>
              )}

              {/* Swap fields */}
              {txType === "swap" && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                      Amount to Swap
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 1.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                      Target Exchange Router Address (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="0x... Uniswap / Raydium Router"
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                      Swap Token (Contract Address, leave blank for Native to ERC20)
                    </label>
                    <input
                      type="text"
                      placeholder="0x... source/dest ERC20"
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
                    />
                  </div>
                </>
              )}

              {/* Approval fields */}
              {txType === "approval" && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                      Spender Address
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0x... spender contract"
                      value={receiver}
                      onChange={(e) => setReceiver(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                      Token Address
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0x... token being approved"
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                      Approval Amount Limit (0 for Unlimited)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
                    />
                  </div>
                </>
              )}

              {/* Contract Call fields */}
              {txType === "contract_call" && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                      Contract Address
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0x... target contract"
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                      Native Value (Optional)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.0"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                      Transaction Payload Data (Hex bytes)
                    </label>
                    <textarea
                      placeholder="0x..."
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono min-h-[80px]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                      Gas Limit
                    </label>
                    <input
                      type="number"
                      value={gasLimit}
                      onChange={(e) => setGasLimit(parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Execute Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-xl text-xs font-semibold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Run Simulation
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Loading Console Terminal View */}
          {isLoading && (
            <div className="bg-[#0b0c10] border border-white/10 rounded-2xl p-4 font-mono text-[10px] sm:text-xs text-blue-400 space-y-1.5 min-h-[160px] shadow-inner select-none flex flex-col justify-end">
              <div className="text-gray-500 border-b border-white/5 pb-2 mb-2 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                <span>SIMULATION_ENGINE_CONSOLE_LOGGER</span>
              </div>
              <div className="flex-1 space-y-1 overflow-y-auto max-h-[220px]">
                {consoleLogs.map((log, idx) => (
                  <div key={idx} className="truncate">
                    {log}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-emerald-400 mt-2 font-semibold">
                <span className="w-1.5 h-3 bg-emerald-400 animate-pulse inline-block" />
                <span>{statusText}</span>
              </div>
            </div>
          )}

          {/* Completed Simulation Dashboard Viewer */}
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 border-t border-white/5 pt-6"
            >
              {/* Metric Highlights row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Execution Status</span>
                  <span className={`text-xs font-bold uppercase ${report.simulation_success ? "text-emerald-400" : "text-red-400"}`}>
                    {report.simulation_success ? "✔ SUCCESSFUL" : "✘ REVERTED"}
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Gas Used</span>
                  <span className="text-xs font-bold text-white font-mono">
                    {report.gas_used.toLocaleString()} units
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Simulation Gas Fee</span>
                  <span className="text-xs font-bold text-gray-300 font-mono">
                    ${report.gas_cost_usd} USD
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Chain / Backend</span>
                  <span className="text-xs font-semibold text-white uppercase truncate font-mono">
                    {report.chain} / {report.backend}
                  </span>
                </div>
              </div>

              {/* Tab Selector for Results Details */}
              <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "assets", label: "Asset Changes" },
                  { id: "trace", label: "Call Trace" },
                  { id: "state", label: "State Changes" },
                  { id: "events", label: "Events" },
                  { id: "risks", label: "Risks" },
                  { id: "explanation", label: "AI Narrative" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setResultTab(t.id as any)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                      resultTab === t.id
                        ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                        : "bg-transparent border border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Result Panel */}
              <div className="bg-[#12131b]/40 border border-white/5 rounded-2xl p-5 min-h-[220px]">
                {/* 1. Overview */}
                {resultTab === "overview" && (
                  <div className="space-y-4 text-xs font-sans">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">Transaction Attributes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl space-y-1">
                        <span className="text-gray-500 block">Sender Address:</span>
                        <code className="text-gray-300 font-mono text-[10px] select-all break-all">{report.sender}</code>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl space-y-1">
                        <span className="text-gray-500 block">Receiver/Contract:</span>
                        <code className="text-gray-300 font-mono text-[10px] select-all break-all">{report.receiver || report.contract_address || "None"}</code>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl space-y-1">
                        <span className="text-gray-500 block">Transaction Type:</span>
                        <span className="text-white font-semibold uppercase">{report.tx_type}</span>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl space-y-1">
                        <span className="text-gray-500 block">Gas Limit Requested:</span>
                        <code className="text-gray-300 font-mono">{report.gas_limit.toLocaleString()}</code>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Asset Changes */}
                {resultTab === "assets" && (
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">Asset Balance Shifts</h4>
                    {report.asset_changes && report.asset_changes.length > 0 ? (
                      <div className="space-y-3">
                        {report.asset_changes.map((ac: any, idx: number) => (
                          <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div className="flex flex-wrap gap-2 items-center text-xs">
                              <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[9px] font-bold font-mono text-gray-400">
                                {ac.token}
                              </span>
                              <span className="text-gray-400 font-mono text-[10px]">{ac.from.substring(0,6)}...</span>
                              <span className="text-gray-600">→</span>
                              <span className="text-gray-400 font-mono text-[10px]">{ac.to.substring(0,6)}...</span>
                            </div>
                            <div className="flex items-center gap-3 text-right">
                              <span className="text-xs font-bold text-white font-mono">
                                {ac.amount.toLocaleString()} {ac.token}
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono">
                                (~${ac.dollar_value.toFixed(2)} USD)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-xs text-gray-500 font-mono">
                        No asset transfer balance shifts occurred in this transaction.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Call Trace */}
                {resultTab === "trace" && (
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">Contract Execution Trace Call-Tree</h4>
                    {report.execution_trace && report.execution_trace.length > 0 ? (
                      <div className="space-y-2 font-mono text-[10px] max-h-[300px] overflow-y-auto pr-1">
                        {report.execution_trace.map((tr: any, idx: number) => {
                          const depth = idx * 16;
                          return (
                            <div
                              key={idx}
                              style={{ paddingLeft: `${depth}px` }}
                              className="border-l border-white/5 py-1.5 flex items-start gap-2"
                            >
                              <span className="text-gray-600">└─</span>
                              <div className="bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5 flex flex-wrap gap-2 items-center flex-1 justify-between">
                                <div className="flex gap-2 items-center">
                                  <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-bold px-1 py-0.5 rounded font-mono">
                                    {tr.type}
                                  </span>
                                  <span className="text-gray-300 font-semibold">{tr.to.substring(0, 10)}...</span>
                                  {tr.input && (
                                    <span className="text-gray-500 truncate max-w-[120px]">
                                      {tr.input}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-3 items-center">
                                  <span className="text-gray-500">Gas: {tr.gas_used.toLocaleString()}</span>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                                    tr.success
                                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                      : "bg-red-500/10 border-red-500/20 text-red-400"
                                  }`}>
                                    {tr.success ? "SUCCESS" : "REVERT"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-xs text-gray-500">
                        No call traces compiled for this block simulator.
                      </div>
                    )}
                  </div>
                )}

                {/* 4. State Changes */}
                {resultTab === "state" && (
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">Storage Slot Mutations</h4>
                    {report.state_changes && report.state_changes.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-[9px] sm:text-[10px] text-gray-400 border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 text-gray-500 uppercase tracking-wider text-[8px] font-bold">
                              <th className="py-2.5">Target Address</th>
                              <th className="py-2.5">Variable / Key</th>
                              <th className="py-2.5">Original State</th>
                              <th className="py-2.5 text-right">Mutated State</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.state_changes.map((sc: any, idx: number) => (
                              <tr key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                                <td className="py-2.5 text-gray-300 break-all">{sc.address.substring(0, 10)}...</td>
                                <td className="py-2.5 text-blue-400">{sc.variable}</td>
                                <td className="py-2.5 text-gray-500">{sc.original}</td>
                                <td className="py-2.5 text-emerald-400 text-right">{sc.dirty}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-xs text-gray-500 font-mono">
                        No contract storage slot mutations logged.
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Events */}
                {resultTab === "events" && (
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">Emitted Event Logs</h4>
                    {report.events && report.events.length > 0 ? (
                      <div className="space-y-3 font-mono text-[9px] sm:text-[10px] max-h-[300px] overflow-y-auto pr-1">
                        {report.events.map((ev: any, idx: number) => (
                          <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5 space-y-2 text-left">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <span className="text-blue-400 font-bold">{ev.name} event</span>
                              <span className="text-gray-500">Contract: {ev.contract.substring(0, 12)}...</span>
                            </div>
                            {ev.topics && ev.topics.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-gray-500 block text-[8px] font-bold uppercase tracking-wider">Topics (Indexed Keys)</span>
                                {ev.topics.map((t: string, tIdx: number) => (
                                  <div key={tIdx} className="text-gray-400 truncate pl-3 border-l border-white/10 break-all">{t}</div>
                                ))}
                              </div>
                            )}
                            {ev.data && (
                              <div className="space-y-1">
                                <span className="text-gray-500 block text-[8px] font-bold uppercase tracking-wider">Payload Data (Non-Indexed)</span>
                                <div className="text-gray-400 pl-3 border-l border-white/10 break-all select-all font-mono">{ev.data}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-xs text-gray-500 font-mono">
                        No events were emitted during this transaction execution.
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Risks */}
                {resultTab === "risks" && (
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">Transaction Vulnerability & Slippage Risks</h4>
                    {report.risk_analysis && report.risk_analysis.length > 0 ? (
                      <div className="space-y-3 font-sans">
                        {report.risk_analysis.map((r: any, idx: number) => {
                          const levelClass =
                            r.severity === "CRITICAL"
                              ? "bg-red-500/10 border-red-500/20 text-red-400"
                              : r.severity === "HIGH"
                              ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                              : "bg-blue-500/10 border-blue-500/20 text-blue-400";
                          return (
                            <div key={idx} className={`border rounded-xl p-4 flex gap-3 items-start text-left ${levelClass}`}>
                              <span className="text-base mt-0.5">⚠️</span>
                              <div>
                                <span className="text-xs font-bold uppercase">{r.type.replace(/_/g, " ")} ({r.severity})</span>
                                <p className="text-[10px] opacity-80 mt-1 leading-relaxed">{r.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 text-center text-emerald-400 space-y-2">
                        <Check className="w-8 h-8 mx-auto animate-bounce" />
                        <h4 className="text-xs font-bold uppercase">Zero Issues Detected</h4>
                        <p className="text-[10px] text-emerald-300/80 leading-normal max-w-[280px] mx-auto font-sans">
                          Simulation completed execution trace safely with zero flagged token approval, tax, slippage, or reentrancy vulnerability vectors.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. Explanation */}
                {resultTab === "explanation" && (
                  <div className="space-y-2 text-left font-mono">
                    {renderMarkdownExplanation(report.explanation)}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        /* History logs */
        <div className="space-y-4">
          {history.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    setReport(h);
                    setActiveTab("simulate");
                    setResultTab("overview");
                  }}
                  className="bg-white/[0.02] border border-white/[0.04] hover:border-white/10 hover:bg-white/[0.03] p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer transition-all text-left"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase font-mono">
                        {h.tx_type}
                      </span>
                      <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase font-mono">
                        {h.chain}
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                        h.simulation_success
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        {h.simulation_success ? "SUCCESS" : "REVERTED"}
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-500 font-mono truncate max-w-[280px]">
                      From: {h.sender}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Gas Used</span>
                      <span className="text-xs font-bold text-gray-300 font-mono">
                        {h.gas_used.toLocaleString()} units
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-500">
              No simulations logged. Run a transaction simulation above to compile records.
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const DecoderInterface = () => {
  const [decoderType, setDecoderType] = useState<"ethereum" | "solana" | "sui" | "aptos" | "bitcoin">("ethereum");
  const [payload, setPayload] = useState("");
  const [abi, setAbi] = useState("");
  const [metadata, setMetadata] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<any>(null);
  const [resultTab, setResultTab] = useState<"decoded" | "explanation" | "assets" | "risks">("decoded");

  const presets = {
    ethereum: {
      payload: "0xa9059cbb00000000000000000000000072a587db711757529870b1774e3067ddd24a4fcf000000000000000000000000000000000000000000000000000000012a05f200",
      abi: JSON.stringify([{"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}], null, 2),
      metadata: JSON.stringify({"output": "0x0000000000000000000000000000000000000000000000000000000000000001", "events": [{"contract": "0xdac17f958d2ee523a2206206994597c13d831ec7", "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", "0x000000000000000000000000b21359cbb904d9b23267104d9b23267204d9b232", "0x00000000000000000000000072a587db711757529870b1774e3067ddd24a4fcf"], "data": "0x000000000000000000000000000000000000000000000000000000012a05f200"}]}, null, 2)
    },
    solana: {
      payload: "0c00000000e0170f0006",
      abi: "",
      metadata: JSON.stringify({
        program_id: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        accounts: [
          "38z1wQ21G9vBsdY2p5T98v1x38z1wQ21G9vBsdY2p5", 
          "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          "7d89B2BA28fH2pS...", 
          "8xY73aAJbNbG..."
        ]
      }, null, 2)
    },
    sui: {
      payload: JSON.stringify({
        package: "0x2",
        module: "coin",
        function: "transfer",
        type_arguments: ["0x2::sui::SUI"],
        arguments: ["0x7b587db711757529870b1774e3067ddd24a4fcf", "1000000000"]
      }, null, 2),
      abi: "",
      metadata: ""
    },
    aptos: {
      payload: JSON.stringify({
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: ["0x7b587db711757529870b1774e3067ddd24a4fcf", "50000000"]
      }, null, 2),
      abi: "",
      metadata: ""
    },
    bitcoin: {
      payload: "76a9141482089352c1aee2b6bc4c803125642a8b40ae5388ac",
      abi: "",
      metadata: ""
    }
  };

  const loadPreset = (type: "ethereum" | "solana" | "sui" | "aptos" | "bitcoin") => {
    setDecoderType(type);
    setPayload(presets[type].payload);
    setAbi(presets[type].abi);
    setMetadata(presets[type].metadata);
    setErrorMsg("");
    setResult(null);
  };

  const handleDecode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload.trim()) return;

    setIsLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      let parsedAbi = null;
      if (abi.trim()) {
        try {
          parsedAbi = JSON.parse(abi);
        } catch {
          throw new Error("Invalid JSON in ABI field");
        }
      }

      let parsedMetadata = null;
      if (metadata.trim()) {
        try {
          parsedMetadata = JSON.parse(metadata);
        } catch {
          throw new Error("Invalid JSON in Metadata field");
        }
      }

      const res = await fetch(`${API_BASE_URL}/decode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: decoderType,
          payload: payload.trim(),
          abi: parsedAbi,
          metadata: parsedMetadata
        })
      });

      if (!res.ok) {
        throw new Error("Decoder service returned error status code: " + res.status);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.decoded?.parameters?.[0]?.value || "Decoding failed.");
      }

      setResult(data);
      setResultTab("decoded");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect to decoder backend");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans text-left">
      {/* Console Input Controls */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <form onSubmit={handleDecode} className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col gap-4 text-left">
          
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest font-mono">Decoder Setup</h3>
            <div className="flex gap-1.5 flex-wrap">
              {(["ethereum", "solana", "sui", "aptos", "bitcoin"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => loadPreset(t)}
                  className="text-[9px] font-mono px-2 py-0.5 rounded border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/10 transition-colors uppercase cursor-pointer"
                >
                  {t.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Protocol Type Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Select Protocol</label>
            <select
              value={decoderType}
              onChange={(e) => {
                setDecoderType(e.target.value as any);
                setPayload("");
                setAbi("");
                setMetadata("");
                setResult(null);
                setErrorMsg("");
              }}
              className="w-full bg-[#0a0b10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
            >
              <option value="ethereum">Ethereum ABI Calldata</option>
              <option value="solana">Solana Instructions</option>
              <option value="sui">Sui Move Call</option>
              <option value="aptos">Aptos Transaction Payload</option>
              <option value="bitcoin">Bitcoin Script Assembly/Hex</option>
            </select>
          </div>

          {/* Payload Raw Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Transaction Payload / Hex / Tx Hash</label>
            <textarea
              rows={5}
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder={
                decoderType === "ethereum"
                  ? "e.g. 0xa9059cbb... (calldata hex) OR a transaction hash starting with 0x..."
                  : decoderType === "solana"
                  ? "e.g. base58 or hex instruction data..."
                  : decoderType === "bitcoin"
                  ? "e.g. 76a9141482089352c1aee2b6bc4c803125642a8b40ae5388ac or assembly script"
                  : "e.g. JSON transaction payload description..."
              }
              className="w-full bg-[#0a0b10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
            />
          </div>

          {/* Ethereum ABI Helper */}
          {decoderType === "ethereum" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Optional Custom ABI (JSON array)</label>
              <textarea
                rows={3}
                value={abi}
                onChange={(e) => setAbi(e.target.value)}
                placeholder="e.g. [{'inputs':[],'name':'myFunc','type':'function'}]"
                className="w-full bg-[#0a0b10] border border-white/[0.08] rounded-xl px-4 py-2 text-[11px] text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
              />
            </div>
          )}

          {/* Metadata Field */}
          {(decoderType === "ethereum" || decoderType === "solana") && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Optional Metadata (JSON)</label>
                <span className="text-[9px] text-gray-500 font-mono">
                  {decoderType === "solana" ? "program_id, accounts" : "events, output"}
                </span>
              </div>
              <textarea
                rows={3}
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                placeholder='e.g. { "program_id": "...", "accounts": [...] }'
                className="w-full bg-[#0a0b10] border border-white/[0.08] rounded-xl px-4 py-2 text-[11px] text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
              />
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading || !payload.trim()}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:border-transparent text-white font-semibold text-xs py-3 px-4 rounded-xl border border-blue-500 hover:border-blue-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                Decoding Engine Working...
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5" />
                Run Universal Decoder
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex gap-3 text-left">
            <span className="text-sm mt-0.5">⚠️</span>
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Decoding Failed</h4>
              <p className="text-[10px] text-red-300/80 leading-normal mt-1 font-mono">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Telemetry Panel */}
      <div className="lg:col-span-7">
        {result ? (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col gap-6 text-left">
            
            {/* Header Telemetry */}
            <div className="flex justify-between items-start gap-4 pb-4 border-b border-white/[0.04]">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] font-mono bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                    {result.type}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-gray-500 font-mono">Decode Success</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-gray-400" />
                  {result.decoded.method_name}
                </h2>
              </div>
            </div>

            {/* Results Tabs */}
            <div className="flex border-b border-white/[0.03] gap-1 font-mono">
              {(["decoded", "explanation", "assets", "risks"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setResultTab(tab)}
                  className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-4 py-2 border-b-2 transition-all cursor-pointer ${
                    resultTab === tab
                      ? "border-blue-500 text-blue-400 bg-blue-500/[0.02]"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab === "decoded"
                    ? "Structure"
                    : tab === "explanation"
                    ? "Explanation"
                    : tab === "assets"
                    ? "Asset Flows"
                    : "Risks & Implications"}
                </button>
              ))}
            </div>

            {/* Content Windows */}
            <div className="min-h-[250px]">
              
              {/* TAB 1: Structured Fields */}
              {resultTab === "decoded" && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-2.5">Decoded Parameters</h4>
                    {result.decoded.parameters && result.decoded.parameters.length > 0 ? (
                      <div className="border border-white/5 rounded-2xl overflow-hidden font-mono text-[10px]">
                        <div className="grid grid-cols-12 bg-white/[0.01] border-b border-white/5 px-4 py-2.5 text-gray-500 font-bold uppercase">
                          <div className="col-span-4">Name</div>
                          <div className="col-span-3">Type</div>
                          <div className="col-span-5">Value</div>
                        </div>
                        <div className="divide-y divide-white/5">
                          {result.decoded.parameters.map((p: any, idx: number) => (
                            <div key={idx} className="grid grid-cols-12 px-4 py-3 items-center hover:bg-white/[0.01] transition-colors">
                              <div className="col-span-4 text-blue-400 font-semibold truncate pr-2" title={p.name}>{p.name}</div>
                              <div className="col-span-3 text-gray-500 font-semibold truncate pr-2" title={p.type}>{p.type}</div>
                              <div className="col-span-5 text-gray-300 break-all select-all font-mono" title={String(p.value)}>
                                {typeof p.value === "object" ? JSON.stringify(p.value) : String(p.value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-xs text-gray-500 font-mono bg-white/[0.01] border border-white/5 rounded-2xl">
                        No arguments or parameters compiled for this payload.
                      </div>
                    )}
                  </div>

                  {/* Events (if any) */}
                  {result.decoded.events && result.decoded.events.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-2.5">Emitted Events</h4>
                      <div className="space-y-3 font-mono text-[10px]">
                        {result.decoded.events.map((e: any, idx: number) => (
                          <div key={idx} className="border border-white/5 rounded-2xl p-4 bg-white/[0.01] space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-emerald-400 font-bold uppercase">Event: {e.name}</span>
                              {e.contract && <span className="text-gray-500 text-[9px] break-all max-w-[200px] truncate" title={e.contract}>{e.contract}</span>}
                            </div>
                            <div className="space-y-1 pl-2 border-l border-white/10">
                              {e.parameters.map((p: any, pIdx: number) => (
                                <div key={pIdx} className="grid grid-cols-12">
                                  <div className="col-span-4 text-blue-400/80">{p.name}:</div>
                                  <div className="col-span-3 text-gray-500">{p.type}</div>
                                  <div className="col-span-5 text-gray-300 break-all select-all">{String(p.value)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outputs (if any) */}
                  {result.decoded.outputs && result.decoded.outputs.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-2.5">Return Output Values</h4>
                      <div className="border border-white/5 rounded-2xl overflow-hidden font-mono text-[10px]">
                        <div className="grid grid-cols-12 bg-white/[0.01] border-b border-white/5 px-4 py-2 text-gray-500 font-bold uppercase">
                          <div className="col-span-4">Name</div>
                          <div className="col-span-3">Type</div>
                          <div className="col-span-5">Value</div>
                        </div>
                        <div className="divide-y divide-white/5">
                          {result.decoded.outputs.map((o: any, idx: number) => (
                            <div key={idx} className="grid grid-cols-12 px-4 py-2.5 items-center">
                              <div className="col-span-4 text-purple-400 font-semibold">{o.name || `out_${idx}`}</div>
                              <div className="col-span-3 text-gray-500">{o.type}</div>
                              <div className="col-span-5 text-gray-300 break-all select-all">{String(o.value)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Explanation */}
              {resultTab === "explanation" && (
                <div className="space-y-6">
                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 text-left space-y-2">
                    <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                      <Info className="w-4 h-4" />
                      Human-Readable Summary
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed font-sans mt-2">
                      {result.analysis.explanation}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Execution Implications</h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-sans bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                      {result.analysis.implications}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: Asset Flows */}
              {resultTab === "assets" && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-2">Simulated Asset Movements</h4>
                  {result.analysis.asset_movement && result.analysis.asset_movement.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {result.analysis.asset_movement.map((m: any, idx: number) => (
                        <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">💰</span>
                            <div className="text-left">
                              <span className="font-bold text-white block">{m.amount} {m.asset}</span>
                              <span className="text-[10px] text-gray-500 font-mono">Asset type: {m.asset}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 font-mono text-[10px] w-full sm:w-auto justify-between sm:justify-start">
                            <div className="text-right">
                              <span className="text-gray-500 block">From</span>
                              <span className="text-gray-300 select-all truncate max-w-[120px] block" title={m.from_address}>{m.from_address || "Sender"}</span>
                            </div>
                            <span className="text-gray-600 text-lg px-2">➔</span>
                            <div className="text-left">
                              <span className="text-gray-500 block">To</span>
                              <span className="text-gray-300 select-all truncate max-w-[120px] block" title={m.to_address}>{m.to_address || "Receiver"}</span>
                            </div>
                          </div>

                          <div className="self-end sm:self-center">
                            <span className={`inline-block font-mono font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                              m.direction === "in"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : m.direction === "out"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}>
                              {m.direction}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-xs text-gray-500 font-mono bg-white/[0.01] border border-white/5 rounded-2xl">
                      No token transfers or asset modifications detected in this payload.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Risks */}
              {resultTab === "risks" && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-2">Payload Risk Telemetry</h4>
                  {result.analysis.risks && result.analysis.risks.length > 0 ? (
                    <div className="space-y-3 font-sans">
                      {result.analysis.risks.map((r: any, idx: number) => {
                        const levelClass =
                          r.severity === "CRITICAL"
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : r.severity === "HIGH"
                            ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                            : r.severity === "MEDIUM"
                            ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                            : "bg-blue-500/10 border-blue-500/20 text-blue-400";
                        return (
                          <div key={idx} className={`border rounded-2xl p-4 flex gap-3 items-start text-left ${levelClass}`}>
                            <span className="text-base mt-0.5">⚠️</span>
                            <div>
                              <span className="text-xs font-bold uppercase tracking-wider font-mono">{r.severity} Risk</span>
                              <p className="text-[11px] opacity-80 mt-1 leading-relaxed">{r.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-8 text-center text-emerald-400 space-y-2">
                      <Check className="w-8 h-8 mx-auto text-emerald-400" />
                      <h4 className="text-xs font-bold uppercase tracking-widest font-mono">Zero Risks Identified</h4>
                      <p className="text-[10px] text-emerald-300/80 leading-normal max-w-[280px] mx-auto font-sans">
                        Analysis completed structural inspection and flagged zero code signature or mixer interaction risk vectors.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="h-full border border-white/[0.04] bg-white/[0.01] rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-4 text-gray-500 min-h-[400px]">
            <Cpu className="w-12 h-12 text-gray-600 animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Awaiting Telemetry</h4>
              <p className="text-[10px] text-gray-500 max-w-[280px] leading-normal font-sans">
                Select a protocol type, input a transaction payload, or load a preset and run the decoder engine to populate structured telemetry.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const EventIntelligenceInterface = () => {
  const [chain, setChain] = useState("ethereum");
  const [logsText, setLogsText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<any>(null);
  const [resultTab, setResultTab] = useState<"timeline" | "assets" | "alerts">("timeline");

  const presets = {
    ethereum: [
      {
        "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "topics": [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          "0x0000000000000000000000000000000000000000",
          "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266"
        ],
        "data": "0x0000000000000000000000000000000000000000000000056bc75e2d63100000",
        "timestamp": "12:00:00 PM"
      },
      {
        "address": "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
        "topics": [
          "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb34ffd0005592d3c3e2e0",
          "0x000000000000000000000000e592427a0aece92de3edee1f18e0157c05861564",
          "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266"
        ],
        "data": "0x0000000000000000000000000000000000000000000000000000000000000064",
        "timestamp": "12:00:05 PM"
      },
      {
        "address": "0xdAC17F958D2ee523a2206206994597C13d831ec7",
        "topics": [
          "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
          "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "0x00000000000000000000000072a587db711757529870b1774e3067ddd24a4fcf"
        ],
        "data": "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "timestamp": "12:00:10 PM"
      },
      {
        "address": "0xdAC17F958D2ee523a2206206994597C13d831ec7",
        "topics": [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "0x00000000000000000000000072a587db711757529870b1774e3067ddd24a4fcf"
        ],
        "data": "0x0000000000000000000000000000000000000000000000056bc75e2d63100000",
        "timestamp": "12:00:15 PM"
      },
      {
        "address": "0xdAC17F958D2ee523a2206206994597C13d831ec7",
        "topics": [
          "0xbc7cd75a20ee27fd9adebab32041f755214dbc2947c4c864c8db79d55b14e033",
          "0x00000000000000000000000085a6b0c36b418c38858f1dbb0a4f28419497f972"
        ],
        "data": "0x",
        "timestamp": "12:00:20 PM"
      },
      {
        "address": "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
        "topics": [
          "0xe41369c65a0c28c35c673b2c6b4746e974064d43ca1654b1f618a803a676b7db",
          "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "0x0000000000000000000000003267104d9b23267104d9b23267204d9b23267204"
        ],
        "data": "0x0000000000000000000000000000000000000000000000000000000000001000",
        "timestamp": "12:00:30 PM"
      }
    ],
    solana: [
      { "message": "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA {", "timestamp": "10:00:00 AM" },
      { "message": "Program log: Instruction: MintTo", "timestamp": "10:00:02 AM" },
      { "message": "Program log: Instruction: Approve", "timestamp": "10:00:05 AM" },
      { "message": "Program log: Instruction: Transfer", "timestamp": "10:00:08 AM" },
      { "message": "Program log: Instruction: Burn", "timestamp": "10:00:12 AM" }
    ],
    sui: [
      { "type": "0x2::coin::MintEvent<0x2::sui::SUI>", "timestamp": "10:05:00 AM", "fields": { "amount": "10000000000" } },
      { "type": "0x3::sui_system::ValidatorEpochInfoEvent", "timestamp": "10:05:05 AM" },
      { "type": "0x2::package::UpgradeEvent", "timestamp": "10:05:10 AM" },
      { "type": "0x53::bridge::DepositEvent", "timestamp": "10:05:15 AM", "fields": { "amount": "5000000000", "dest_chain": "Ethereum" } }
    ]
  };

  const loadPreset = (t: "ethereum" | "solana" | "sui") => {
    setChain(t);
    setLogsText(JSON.stringify(presets[t], null, 2));
    setErrorMsg("");
    setResult(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logsText.trim()) return;

    setIsLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      let payload: any = { chain };
      const trimmedText = logsText.trim();

      if (trimmedText.startsWith("0x") && trimmedText.length === 66) {
        payload.tx_hash = trimmedText;
      } else if (trimmedText.startsWith("0x") && trimmedText.length === 42) {
        payload.address = trimmedText;
      } else {
        let parsedLogs = null;
        try {
          parsedLogs = JSON.parse(trimmedText);
        } catch {
          throw new Error("Invalid input format. Must be a valid JSON array of logs, a 66-character transaction hash (0x...), or a 42-character contract address (0x...).");
        }

        if (!Array.isArray(parsedLogs)) {
          throw new Error("JSON input must be a valid array of event logs.");
        }
        payload.logs = parsedLogs;
      }

      const res = await fetch(`${API_BASE_URL}/events/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Event intelligence backend returned error status code: " + res.status);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error("Failed to compile event timeline analytics.");
      }

      setResult(data);
      setResultTab("timeline");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to contact event intelligence backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (name: string, color: string) => {
    const iconClass = `w-3.5 h-3.5 ${color}`;
    switch(name) {
      case "Shield": return <ShieldCheck className={iconClass} />;
      case "RefreshCw": return <RefreshCw className={iconClass} />;
      case "ArrowUpRight": return <ArrowUpRight className={iconClass} />;
      case "UserCheck": return <CheckCircle2 className={iconClass} />;
      case "AlertTriangle": return <AlertTriangle className={iconClass} />;
      case "TrendingUp": return <Zap className={iconClass} />;
      case "Flame": return <Flame className={iconClass} />;
      case "Network": return <Network className={iconClass} />;
      default: return <Info className={iconClass} />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans text-left">
      {/* Input panel */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <form onSubmit={handleAnalyze} className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col gap-4 text-left">
          
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest font-mono">Telemetry Setup</h3>
            <div className="flex gap-1.5 flex-wrap">
              {(["ethereum", "solana", "sui"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => loadPreset(t)}
                  className="text-[9px] font-mono px-2 py-0.5 rounded border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/10 transition-colors uppercase cursor-pointer"
                >
                  {t.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Select Blockchain</label>
            <select
              value={chain}
              onChange={(e) => {
                setChain(e.target.value);
                setLogsText("");
                setResult(null);
                setErrorMsg("");
              }}
              className="w-full bg-[#0a0b10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
            >
              <option value="ethereum">Ethereum (EVM Logs)</option>
              <option value="solana">Solana (System Logs)</option>
              <option value="sui">Sui (Move Event List)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Event Source (Tx Hash, Contract Address, or JSON Logs)</label>
            <textarea
              rows={12}
              value={logsText}
              onChange={(e) => setLogsText(e.target.value)}
              placeholder="Paste a Transaction Hash (0x...), Contract Address (0x...), or raw JSON logs array..."
              className="w-full bg-[#0a0b10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !logsText.trim()}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:border-transparent text-white font-semibold text-xs py-3 px-4 rounded-xl border border-blue-500 hover:border-blue-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                Analyzing Events Telemetry...
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5 text-white" />
                Run Event Intelligence
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex gap-3 text-left">
            <span className="text-sm mt-0.5">⚠️</span>
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Analysis Failed</h4>
              <p className="text-[10px] text-red-300/80 leading-normal mt-1 font-mono">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {result ? (
          <div className="flex flex-col gap-6">
            
            {/* Visual cards summary */}
            {result.visual_cards && result.visual_cards.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.visual_cards.slice(0, 4).map((card: any, idx: number) => {
                  const borderColors: Record<string, string> = {
                    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
                    blue: "border-blue-500/20 bg-blue-500/5 text-blue-400",
                    purple: "border-purple-500/20 bg-purple-500/5 text-purple-400",
                    yellow: "border-yellow-500/20 bg-yellow-500/5 text-yellow-400",
                    red: "border-red-500/20 bg-red-500/5 text-red-400",
                    orange: "border-orange-500/20 bg-orange-500/5 text-orange-400",
                    gray: "border-white/10 bg-white/5 text-gray-300"
                  };
                  const colorClass = borderColors[card.accent_color] || "border-white/10 bg-white/5 text-gray-300";
                  return (
                    <div key={idx} className={`border rounded-2xl p-4 flex gap-3 items-center text-left ${colorClass}`}>
                      <div className="p-2 rounded-xl bg-white/5">
                        {getIcon(card.icon_name, "")}
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider opacity-60">{card.type}</span>
                        <h4 className="text-xs sm:text-sm font-bold truncate mt-0.5">{card.title}</h4>
                        <p className="text-[9px] opacity-75 truncate">{card.sub_text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Analysis details panel */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col gap-5 text-left">
              
              <div className="flex border-b border-white/[0.03] gap-1 font-mono">
                {(["timeline", "assets", "alerts"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setResultTab(tab)}
                    className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-4 py-2 border-b-2 transition-all cursor-pointer ${
                      resultTab === tab
                        ? "border-blue-500 text-blue-400 bg-blue-500/[0.02]"
                        : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {tab === "timeline"
                      ? "Chronological Timeline"
                      : tab === "assets"
                      ? "Asset Movements"
                      : "Threat Intel Alerts"}
                  </button>
                ))}
              </div>

              <div className="min-h-[300px]">
                
                {/* TIMELINE TAB */}
                {resultTab === "timeline" && (
                  <div className="relative pl-6 border-l border-white/5 ml-3.5 space-y-6 py-2">
                    {result.timeline.map((event: any, idx: number) => {
                      const dotColors: Record<string, string> = {
                        CRITICAL: "bg-red-500 shadow-red-500/50",
                        HIGH: "bg-orange-500 shadow-orange-500/50",
                        MEDIUM: "bg-yellow-500 shadow-yellow-500/50",
                        LOW: "bg-blue-500 shadow-blue-500/50",
                        INFO: "bg-emerald-500 shadow-emerald-500/50"
                      };
                      const dotColor = dotColors[event.severity] || "bg-gray-500";
                      
                      return (
                        <div key={event.id || idx} className="relative group text-left">
                          
                          {/* Timeline bullet dot */}
                          <div className={`absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full border border-[#07080a] shadow-sm transition-transform duration-200 group-hover:scale-125 ${dotColor}`} />
                          
                          <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[9px] font-mono text-gray-500 font-bold">{event.timestamp}</span>
                              <span className="h-3 w-[1px] bg-white/10" />
                              <span className="text-[9px] font-mono text-blue-400 font-bold tracking-wider uppercase">{event.event_type}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                event.severity === "CRITICAL" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                event.severity === "HIGH" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                                event.severity === "MEDIUM" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                                "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}>
                                {event.severity}
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5">{event.title}</h4>
                            <p className="text-[11px] text-gray-400 leading-relaxed font-sans mt-0.5">{event.description}</p>
                            {event.contract && (
                              <span className="text-[9px] font-mono text-gray-500 break-all select-all mt-1" title={event.contract}>
                                Contract: {event.contract}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ASSETS TAB */}
                {resultTab === "assets" && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2.5">Asset Flow Topology</h4>
                    {result.asset_movement && result.asset_movement.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {result.asset_movement.map((flow: any, idx: number) => (
                          <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">💰</span>
                              <div className="text-left">
                                <span className="font-bold text-white block">{flow.amount} {flow.asset}</span>
                                {flow.dollar_value && <span className="text-[9px] text-gray-500 font-mono">Value: ${flow.dollar_value.toLocaleString()}</span>}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 font-mono text-[10px] w-full sm:w-auto justify-between sm:justify-start">
                              <div className="text-right">
                                <span className="text-gray-500 block">From</span>
                                <span className="text-gray-300 select-all truncate max-w-[120px] block" title={flow.from_address}>{flow.from_address || "Mint Origin"}</span>
                              </div>
                              <span className="text-gray-600 text-lg px-2">➔</span>
                              <div className="text-left">
                                <span className="text-gray-500 block">To</span>
                                <span className="text-gray-300 select-all truncate max-w-[120px] block" title={flow.to_address}>{flow.to_address || "Burn Vault"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-xs text-gray-500 font-mono bg-white/[0.01] border border-white/5 rounded-2xl">
                        No asset flows decoded from event trace logs.
                      </div>
                    )}
                  </div>
                )}

                {/* ALERTS TAB */}
                {resultTab === "alerts" && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2.5">Suspicious Threat Intel Signals</h4>
                    {result.suspicious_activities && result.suspicious_activities.length > 0 ? (
                      <div className="space-y-3 font-sans text-left">
                        {result.suspicious_activities.map((alert: any, idx: number) => {
                          const borderClass =
                            alert.severity === "CRITICAL" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                            alert.severity === "HIGH" ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                            alert.severity === "MEDIUM" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                            "bg-blue-500/10 border-blue-500/20 text-blue-400";
                          return (
                            <div key={idx} className={`border rounded-2xl p-4 flex gap-3 items-start ${borderClass}`}>
                              <span className="text-base mt-0.5">⚠️</span>
                              <div>
                                <h4 className="text-xs font-bold uppercase font-mono tracking-wider">{alert.type} ({alert.severity})</h4>
                                <p className="text-[10px] opacity-80 mt-1 leading-relaxed">{alert.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-8 text-center text-emerald-400 space-y-2">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                        <h4 className="text-xs font-bold uppercase tracking-widest font-mono">Zero Suspicious Indicators</h4>
                        <p className="text-[10px] text-emerald-300/80 leading-normal max-w-[280px] mx-auto font-sans">
                          Inspection completed. Zero high-slippage swaps, proxy hijack upgrades, or mixer deposits flagged in trace.
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        ) : (
          <div className="h-full border border-white/[0.04] bg-white/[0.01] rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-4 text-gray-500 min-h-[400px]">
            <Activity className="w-12 h-12 text-gray-600 animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Awaiting Logs</h4>
              <p className="text-[10px] text-gray-500 max-w-[280px] leading-normal font-sans">
                Select a blockchain protocol, input a sequence of event logs/messages, or load a preset, and run the intelligence engine.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const ThreatIntelligenceInterface = () => {
  const [indicator, setIndicator] = useState("");
  const [indicatorType, setIndicatorType] = useState("auto");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<any>(null);
  const [resultTab, setResultTab] = useState<"summary" | "entities" | "relations">("summary");

  const presets = {
    cve: {
      indicator: "CVE-2024-38472",
      type: "cve"
    },
    wallet: {
      indicator: "0x72a587db711757529870b1774e3067ddd24a4fcf",
      type: "wallet"
    },
    domain: {
      indicator: "lazarus-phish-domain.com",
      type: "domain"
    },
    hash: {
      indicator: "4a123bc45de67f8910ab11121314151617181920212223242526272829303132",
      type: "file_hash"
    }
  };

  const loadPreset = (key: keyof typeof presets) => {
    setIndicator(presets[key].indicator);
    setIndicatorType(presets[key].type);
    setErrorMsg("");
    setResult(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indicator.trim()) return;

    setIsLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/threats/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indicator,
          indicator_type: indicatorType === "auto" ? null : indicatorType
        })
      });

      if (!res.ok) {
        throw new Error("Threat intelligence backend returned error status code: " + res.status);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error("Failed to compile threat intelligence correlation analytics.");
      }

      setResult(data);
      setResultTab("summary");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to contact threat intelligence backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const getEntityIcon = (type: string) => {
    const iconClass = "w-4 h-4 text-gray-300";
    switch (type.toLowerCase()) {
      case "indicator": return <Info className={iconClass} />;
      case "threat_actor": return <CheckCircle2 className="w-4 h-4 text-red-400" />;
      case "campaign": return <Network className="w-4 h-4 text-orange-400" />;
      case "exploit": return <Terminal className={iconClass} />;
      case "malware": return <Flame className="w-4 h-4 text-yellow-400" />;
      case "ransomware": return <Zap className="w-4 h-4 text-red-500" />;
      case "cve": return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default: return <Info className={iconClass} />;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL": return "bg-red-500/10 border-red-500/20 text-red-400 font-bold";
      case "HIGH": return "bg-orange-500/10 border-orange-500/20 text-orange-400 font-bold";
      case "MEDIUM": return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400 font-bold";
      default: return "bg-blue-500/10 border-blue-500/20 text-blue-400 font-bold";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans text-left">
      {/* Input panel */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <form onSubmit={handleAnalyze} className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col gap-4 text-left">
          
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest font-mono">Threat Setup</h3>
            <div className="flex gap-1.5 flex-wrap">
              {(["cve", "wallet", "domain", "hash"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => loadPreset(k)}
                  className="text-[9px] font-mono px-2 py-0.5 rounded border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/10 transition-colors uppercase cursor-pointer"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Select Indicator Type</label>
            <select
              value={indicatorType}
              onChange={(e) => {
                setIndicatorType(e.target.value);
                setResult(null);
                setErrorMsg("");
              }}
              className="w-full bg-[#0a0b10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
            >
              <option value="auto">Auto-Detect Type</option>
              <option value="cve">CVE Identifier</option>
              <option value="wallet">Crypto Wallet Address</option>
              <option value="domain">Domain / IP Address</option>
              <option value="file_hash">File Hash (MD5/SHA256)</option>
              <option value="text">Raw Text Report / Message</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Threat Indicator / IOC Payload</label>
            <textarea
              rows={8}
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
              placeholder="Enter CVE-2024-xxxx, wallet, domain, hash, or security report text..."
              className="w-full bg-[#0a0b10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !indicator.trim()}
            className="w-full mt-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:border-transparent text-white font-semibold text-xs py-3 px-4 rounded-xl border border-red-500 hover:border-red-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/10"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                Correlating Threat Feeds...
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-white" />
                Run Threat Intelligence
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-red-400 font-mono uppercase tracking-wider">Analysis Failed</h4>
              <p className="text-[10px] text-red-300/80 leading-normal font-sans">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* Output Display panel */}
      <div className="lg:col-span-7 h-full flex flex-col min-h-[400px]">
        {result ? (
          <div className="bg-white/[0.01] border border-white/[0.04] rounded-3xl backdrop-blur-md shadow-2xl p-6 flex flex-col gap-6 text-left h-full">
            
            {/* Nav Tabs */}
            <div className="flex border-b border-white/[0.06] pb-3 justify-between items-center">
              <div className="flex gap-4">
                {(["summary", "entities", "relations"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setResultTab(tab)}
                    className={`text-[10px] font-bold uppercase tracking-wider font-mono pb-1 border-b-2 transition-all cursor-pointer ${
                      resultTab === tab
                        ? "border-red-500 text-red-400"
                        : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {tab === "summary" ? "Intel Summary" : tab === "entities" ? "Associated Entities" : "Correlations Map"}
                  </button>
                ))}
              </div>
              <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest hidden sm:block">
                Correlation Feed Active
              </div>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 col-span-1">
              
              {/* SUMMARY TAB */}
              {resultTab === "summary" && (
                <div className="space-y-6">
                  {/* Status header card */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`border rounded-2xl p-4 flex flex-col gap-1 ${getSeverityClass(result.severity)}`}>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider opacity-70">Assessed Severity</span>
                      <span className="text-base font-bold font-mono tracking-wide">{result.severity}</span>
                    </div>

                    <div className="border border-white/[0.08] bg-white/[0.02] rounded-2xl p-4 flex flex-col gap-1">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider opacity-70 text-gray-400">Confidence Score</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold font-mono text-white">{(result.confidence_score * 100).toFixed(0)}%</span>
                        <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden max-w-[60px]">
                          <div 
                            className="bg-red-500 h-full rounded-full" 
                            style={{ width: `${result.confidence_score * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Executive Correlation Report</h4>
                    <div className="border border-white/[0.04] bg-white/[0.01] rounded-2xl p-4 text-xs text-gray-300 leading-relaxed font-sans">
                      {result.summary}
                    </div>
                  </div>

                  {/* Recommended Mitigation */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Incident Response Mitigation</h4>
                    <div className="border border-red-500/10 bg-red-500/[0.02] text-red-300 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed font-sans">
                      <ShieldCheck className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-[11px] uppercase tracking-wider font-mono text-red-400 mb-1">Countermeasures</h5>
                        <p className="text-[10.5px] opacity-90 leading-relaxed">{result.recommended_mitigation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ASSOCIATED ENTITIES TAB */}
              {resultTab === "entities" && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1">Identified Indicators & Threat Nodes</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {result.entities.map((ent: any) => (
                      <div key={ent.id} className="border border-white/[0.06] bg-white/[0.02] rounded-2xl p-4 flex gap-3 items-start text-left hover:border-white/10 transition-colors">
                        <span className="p-2 bg-white/[0.03] border border-white/[0.05] rounded-xl shrink-0">
                          {getEntityIcon(ent.type)}
                        </span>
                        <div className="space-y-1 overflow-hidden">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-white tracking-tight truncate font-sans">{ent.name}</span>
                            <span className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400 select-none">
                              {ent.source}
                            </span>
                          </div>
                          <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-widest">
                            Type: {ent.type}
                          </span>
                          <p className="text-[10px] text-gray-400 leading-normal font-sans pt-1">
                            {ent.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CORRELATIONS MAP (RELATIONSHIPS) TAB */}
              {resultTab === "relations" && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1">Intelligence Relationship Paths</h4>
                  {result.relationships && result.relationships.length > 0 ? (
                    <div className="space-y-3 font-sans text-left">
                      {result.relationships.map((rel: any, idx: number) => {
                        const sourceNode = result.entities.find((e: any) => e.id === rel.source_id);
                        const targetNode = result.entities.find((e: any) => e.id === rel.target_id);
                        const sourceName = sourceNode ? sourceNode.name : rel.source_id;
                        const targetName = targetNode ? targetNode.name : rel.target_id;
                        
                        return (
                          <div key={idx} className="border border-white/[0.04] bg-white/[0.01] rounded-2xl p-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between hover:bg-white/[0.02] transition-colors">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-mono text-[10px] font-bold text-gray-300 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded truncate max-w-[140px] sm:max-w-none">{sourceName}</span>
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 uppercase tracking-widest">{rel.relationship_type}</span>
                              <span className="font-mono text-[10px] font-bold text-gray-300 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded truncate max-w-[140px] sm:max-w-none">{targetName}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 leading-normal max-w-sm sm:text-right font-sans">
                              {rel.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 text-center text-gray-400">
                      <Info className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                      <h4 className="text-xs font-bold uppercase tracking-widest font-mono">No Relational Mapping</h4>
                      <p className="text-[10px] text-gray-500 leading-normal max-w-[280px] mx-auto font-sans mt-1">
                        Select a preset or enter a correlation payload containing multiple threat entities to compile relationship pathways.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="h-full border border-white/[0.04] bg-white/[0.01] rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-4 text-gray-500 min-h-[400px]">
            <ShieldAlert className="w-12 h-12 text-gray-600 animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Awaiting Indicator</h4>
              <p className="text-[10px] text-gray-500 max-w-[280px] leading-normal font-sans">
                Select an indicator type, load a preset threat or enter a custom IOC, and run the Threat Intelligence engine.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const RiskEngineInterface = () => {
  const [preset, setPreset] = useState("custom");
  const [contractCritical, setContractCritical] = useState("0");
  const [contractHigh, setContractHigh] = useState("0");
  const [contractMedium, setContractMedium] = useState("0");
  const [contractLow, setContractLow] = useState("0");

  const [walletRep, setWalletRep] = useState("100");
  const [walletMixer, setWalletMixer] = useState(false);
  const [walletLarge, setWalletLarge] = useState(false);

  const [threatSeverity, setThreatSeverity] = useState("NONE");
  const [threatConf, setThreatConf] = useState("0.80");
  const [threatActor, setThreatActor] = useState("");
  const [threatCampaign, setThreatCampaign] = useState("");

  const [anomalyScore, setAnomalyScore] = useState("0.0");
  const [anomalySlippage, setAnomalySlippage] = useState("0.0");

  const [bridgeVolume, setBridgeVolume] = useState("0");
  const [bridgeFreq, setBridgeFreq] = useState("0");
  const [bridgeMixer, setBridgeMixer] = useState(false);

  const [eventUpgrades, setEventUpgrades] = useState("0");
  const [eventOwnership, setEventOwnership] = useState("0");
  const [eventSuspicious, setEventSuspicious] = useState("0");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<any>(null);
  const [resultTab, setResultTab] = useState<"overall" | "subscores">("overall");

  const presets = {
    defi_exploit: {
      contractCritical: "1",
      contractHigh: "1",
      contractMedium: "0",
      contractLow: "0",
      walletRep: "12",
      walletMixer: true,
      walletLarge: true,
      threatSeverity: "CRITICAL",
      threatConf: "0.95",
      threatActor: "Lazarus Hacker Group",
      threatCampaign: "DeFi Drain",
      anomalyScore: "0.92",
      anomalySlippage: "45.2",
      bridgeVolume: "1250000",
      bridgeFreq: "18",
      bridgeMixer: true,
      eventUpgrades: "2",
      eventOwnership: "1",
      eventSuspicious: "5"
    },
    arbitrage_swap: {
      contractCritical: "0",
      contractHigh: "0",
      contractMedium: "0",
      contractLow: "0",
      walletRep: "95",
      walletMixer: false,
      walletLarge: false,
      threatSeverity: "LOW",
      threatConf: "0.20",
      threatActor: "",
      threatCampaign: "",
      anomalyScore: "0.05",
      anomalySlippage: "0.5",
      bridgeVolume: "0",
      bridgeFreq: "0",
      bridgeMixer: false,
      eventUpgrades: "0",
      eventOwnership: "0",
      eventSuspicious: "0"
    },
    bridge_drain: {
      contractCritical: "0",
      contractHigh: "1",
      contractMedium: "0",
      contractLow: "0",
      walletRep: "45",
      walletMixer: false,
      walletLarge: true,
      threatSeverity: "NONE",
      threatConf: "0.80",
      threatActor: "",
      threatCampaign: "",
      anomalyScore: "0.0",
      anomalySlippage: "0.0",
      bridgeVolume: "450000",
      bridgeFreq: "8",
      bridgeMixer: false,
      eventUpgrades: "0",
      eventOwnership: "0",
      eventSuspicious: "0"
    }
  };

  const loadPreset = (key: keyof typeof presets) => {
    setPreset(key);
    const p = presets[key];
    setContractCritical(p.contractCritical);
    setContractHigh(p.contractHigh);
    setContractMedium(p.contractMedium);
    setContractLow(p.contractLow);
    setWalletRep(p.walletRep);
    setWalletMixer(p.walletMixer);
    setWalletLarge(p.walletLarge);
    setThreatSeverity(p.threatSeverity);
    setThreatConf(p.threatConf);
    setThreatActor(p.threatActor);
    setThreatCampaign(p.threatCampaign);
    setAnomalyScore(p.anomalyScore);
    setAnomalySlippage(p.anomalySlippage);
    setBridgeVolume(p.bridgeVolume);
    setBridgeFreq(p.bridgeFreq);
    setBridgeMixer(p.bridgeMixer);
    setEventUpgrades(p.eventUpgrades);
    setEventOwnership(p.eventOwnership);
    setEventSuspicious(p.eventSuspicious);
    setErrorMsg("");
    setResult(null);
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      // Build smart contract findings input
      const contractFindings = [];
      for (let i = 0; i < parseInt(contractCritical || "0"); i++) {
        contractFindings.push({ vulnerability: "Critical Finding", severity: "CRITICAL", description: "Critical vulnerability detected." });
      }
      for (let i = 0; i < parseInt(contractHigh || "0"); i++) {
        contractFindings.push({ vulnerability: "High Finding", severity: "HIGH", description: "High risk vulnerability detected." });
      }
      for (let i = 0; i < parseInt(contractMedium || "0"); i++) {
        contractFindings.push({ vulnerability: "Medium Finding", severity: "MEDIUM", description: "Medium risk vulnerability detected." });
      }
      for (let i = 0; i < parseInt(contractLow || "0"); i++) {
        contractFindings.push({ vulnerability: "Low Finding", severity: "LOW", description: "Low risk vulnerability detected." });
      }

      // Build behavior flags
      const behaviorFlags = [];
      if (walletMixer) behaviorFlags.push("high_mixer_interaction");
      if (walletLarge) behaviorFlags.push("frequent_large_transfers");

      const payload = {
        contract_findings: contractFindings.length > 0 ? contractFindings : null,
        wallet_intelligence: {
          wallet_score: parseInt(walletRep || "100"),
          behavior_flags: behaviorFlags
        },
        threat_intelligence: threatSeverity !== "NONE" ? {
          severity: threatSeverity,
          confidence_score: parseFloat(threatConf || "0.8"),
          threat_actor: threatActor || null,
          campaign: threatCampaign || null
        } : null,
        transaction_anomalies: parseFloat(anomalyScore) > 0 ? [
          {
            slippage: parseFloat(anomalySlippage || "0"),
            anomaly_score: parseFloat(anomalyScore),
            description: "Telemetry anomaly report"
          }
        ] : [],
        bridge_activity: parseFloat(bridgeVolume) > 0 ? {
          volume_usd: parseFloat(bridgeVolume),
          target_chain: bridgeMixer ? "Tornado Cash" : "Ethereum Mainnet",
          frequency_24h: parseInt(bridgeFreq || "0")
        } : null,
        event_analysis: (parseInt(eventUpgrades) > 0 || parseInt(eventOwnership) > 0 || parseInt(eventSuspicious) > 0) ? {
          upgrade_events_count: parseInt(eventUpgrades || "0"),
          ownership_changes_count: parseInt(eventOwnership || "0"),
          suspicious_events_count: parseInt(eventSuspicious || "0")
        } : null
      };

      const res = await fetch(`${API_BASE_URL}/risk/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Risk engine backend returned error status code: " + res.status);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error("Failed to compile aggregated risk analysis.");
      }

      setResult(data);
      setResultTab("overall");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to contact risk engine backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityGlowClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "text-red-500 border-red-500/20 bg-red-500/10 shadow-red-500/20";
      case "high": return "text-orange-500 border-orange-500/20 bg-orange-500/10 shadow-orange-500/20";
      case "medium": return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10 shadow-yellow-500/20";
      default: return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10 shadow-emerald-500/20";
    }
  };

  const getScoreDialColor = (score: number) => {
    if (score >= 85) return "#ef4444"; // red
    if (score >= 60) return "#f97316"; // orange
    if (score >= 30) return "#eab308"; // yellow
    return "#10b981"; // emerald
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans text-left">
      {/* Input panel */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <form onSubmit={handleCalculate} className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col gap-4 text-left">
          
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest font-mono">Risk Telemetry Configuration</h3>
            <div className="flex gap-1.5 flex-wrap">
              {(["defi_exploit", "arbitrage_swap", "bridge_drain"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => loadPreset(k)}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors uppercase cursor-pointer ${
                    preset === k
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/10 text-gray-400'
                  }`}
                >
                  {k.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 1: Contract Findings */}
          <div className="border border-white/5 rounded-xl p-3 bg-white/[0.01] space-y-2">
            <span className="block text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">1. Contract Auditor Findings</span>
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-red-400">CRIT</span>
                <input
                  type="number"
                  min="0"
                  value={contractCritical}
                  onChange={(e) => setContractCritical(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-white/[0.08] rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-orange-400">HIGH</span>
                <input
                  type="number"
                  min="0"
                  value={contractHigh}
                  onChange={(e) => setContractHigh(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-white/[0.08] rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-yellow-400">MED</span>
                <input
                  type="number"
                  min="0"
                  value={contractMedium}
                  onChange={(e) => setContractMedium(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-white/[0.08] rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-blue-400">LOW</span>
                <input
                  type="number"
                  min="0"
                  value={contractLow}
                  onChange={(e) => setContractLow(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-white/[0.08] rounded px-2 py-1 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Wallet Intel */}
          <div className="border border-white/5 rounded-xl p-3 bg-white/[0.01] space-y-2">
            <span className="block text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">2. Wallet Intelligence</span>
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-mono text-gray-500">REPUTATION SCORE (0-100)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={walletRep}
                  onChange={(e) => setWalletRep(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-white/[0.08] rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <div className="flex flex-col gap-1.5 justify-end h-full">
                <label className="flex items-center gap-2 text-[9px] text-gray-300 font-mono cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={walletMixer}
                    onChange={(e) => setWalletMixer(e.target.checked)}
                    className="rounded border-white/[0.08] bg-[#0a0b10] text-blue-500 cursor-pointer"
                  />
                  MIXER INTERACTION
                </label>
                <label className="flex items-center gap-2 text-[9px] text-gray-300 font-mono cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={walletLarge}
                    onChange={(e) => setWalletLarge(e.target.checked)}
                    className="rounded border-white/[0.08] bg-[#0a0b10] text-blue-500 cursor-pointer"
                  />
                  LARGE TRANSFERS
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 3: Threat Intel */}
          <div className="border border-white/5 rounded-xl p-3 bg-white/[0.01] space-y-2.5">
            <span className="block text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">3. Threat Intelligence Feed</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-gray-500">FEED SEVERITY</span>
                <select
                  value={threatSeverity}
                  onChange={(e) => setThreatSeverity(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-white/[0.08] rounded px-2 py-1 text-xs text-white cursor-pointer"
                >
                  <option value="NONE">None</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-gray-500">CONFIDENCE (0.0-1.0)</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="1"
                  value={threatConf}
                  onChange={(e) => setThreatConf(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-white/[0.08] rounded px-2 py-1 text-xs text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-gray-500">ACTOR ALIAS</span>
                <input
                  type="text"
                  placeholder="e.g. Lazarus Group"
                  value={threatActor}
                  onChange={(e) => setThreatActor(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-white/[0.08] rounded px-2 py-1 text-xs text-white placeholder:text-gray-700"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-gray-500">CAMPAIGN NAME</span>
                <input
                  type="text"
                  placeholder="e.g. DeFi Attack"
                  value={threatCampaign}
                  onChange={(e) => setThreatCampaign(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-white/[0.08] rounded px-2 py-1 text-xs text-white placeholder:text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Anomalies, Bridge, Events */}
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-white/5 rounded-xl p-2.5 bg-white/[0.01] flex flex-col gap-1">
              <span className="text-[8px] font-mono text-gray-400 uppercase font-bold tracking-wider">4. Anomaly Rate</span>
              <input
                type="number"
                step="any"
                min="0"
                max="1"
                placeholder="ML Anomaly"
                value={anomalyScore}
                onChange={(e) => setAnomalyScore(e.target.value)}
                className="w-full bg-[#0a0b10] border border-white/[0.08] rounded px-2 py-1 text-[11px] text-white"
              />
            </div>
            <div className="border border-white/5 rounded-xl p-2.5 bg-white/[0.01] flex flex-col gap-1">
              <span className="text-[8px] font-mono text-gray-400 uppercase font-bold tracking-wider">5. Bridge Vol ($)</span>
              <input
                type="number"
                min="0"
                placeholder="Volume USD"
                value={bridgeVolume}
                onChange={(e) => setBridgeVolume(e.target.value)}
                className="w-full bg-[#0a0b10] border border-white/[0.08] rounded px-2 py-1 text-[11px] text-white"
              />
            </div>
            <div className="border border-white/5 rounded-xl p-2.5 bg-white/[0.01] flex flex-col gap-1">
              <span className="text-[8px] font-mono text-gray-400 uppercase font-bold tracking-wider">6. Log Upgrades</span>
              <input
                type="number"
                min="0"
                placeholder="Upgrades Count"
                value={eventUpgrades}
                onChange={(e) => setEventUpgrades(e.target.value)}
                className="w-full bg-[#0a0b10] border border-white/[0.08] rounded px-2 py-1 text-[11px] text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:border-transparent text-white font-semibold text-xs py-3 px-4 rounded-xl border border-red-500 hover:border-red-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/10"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                Compiling Risk Scoring Metrics...
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-white" />
                Calculate Risk Score
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-red-400 font-mono uppercase tracking-wider">Calculation Failed</h4>
              <p className="text-[10px] text-red-300/80 leading-normal font-sans">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* Output Display panel */}
      <div className="lg:col-span-7 h-full flex flex-col min-h-[400px]">
        {result ? (
          <div className="bg-white/[0.01] border border-white/[0.04] rounded-3xl backdrop-blur-md shadow-2xl p-6 flex flex-col gap-6 text-left h-full">
            
            {/* Nav Tabs */}
            <div className="flex border-b border-white/[0.06] pb-3 justify-between items-center">
              <div className="flex gap-4">
                {(["overall", "subscores"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setResultTab(tab)}
                    className={`text-[10px] font-bold uppercase tracking-wider font-mono pb-1 border-b-2 transition-all cursor-pointer ${
                      resultTab === tab
                        ? "border-red-500 text-red-400"
                        : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {tab === "overall" ? "Overall Threat Analysis" : "Risk Subscores Breakdown"}
                  </button>
                ))}
              </div>
              <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest hidden sm:block">
                Central Risk Engine Active
              </div>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 col-span-1">
              
              {/* OVERALL SUMMARY TAB */}
              {resultTab === "overall" && (
                <div className="space-y-6">
                  {/* Status header dial info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    
                    {/* Ring score */}
                    <div className="flex flex-col items-center justify-center border border-white/[0.06] bg-[#0c0d12]/50 rounded-2xl p-4 text-center shrink-0">
                      <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-gray-500 mb-2">Aggregated Index</span>
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="34" strokeWidth="4" stroke="rgba(255,255,255,0.03)" fill="transparent" />
                          <circle 
                            cx="40" 
                            cy="40" 
                            r="34" 
                            strokeWidth="5" 
                            stroke={getScoreDialColor(result.overall_score)} 
                            fill="transparent" 
                            strokeDasharray={2 * Math.PI * 34}
                            strokeDashoffset={2 * Math.PI * 34 * (1 - result.overall_score / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-base font-bold font-mono text-white">{result.overall_score}</span>
                          <span className="block text-[8px] text-gray-500 font-mono">/ 100</span>
                        </div>
                      </div>
                    </div>

                    <div className={`border rounded-2xl p-4 flex flex-col gap-1 text-left sm:col-span-2 h-full justify-center ${getSeverityGlowClass(result.severity)}`}>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider opacity-70">Calculated Severity Level</span>
                      <span className="text-xl font-bold font-mono tracking-wide uppercase">{result.severity}</span>
                      <span className="block text-[9px] font-mono opacity-65 pt-1">
                        Confidence Index: {(result.confidence * 100).toFixed(0)}% (Based on active telemetry)
                      </span>
                    </div>
                  </div>

                  {/* Executive Reasoning */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Aggregated Risk Reasoning</h4>
                    <div className="border border-white/[0.04] bg-white/[0.01] rounded-2xl p-4 text-xs text-gray-300 leading-relaxed font-sans">
                      {result.reasoning}
                    </div>
                  </div>

                  {/* Mitigation Countermeasures */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Recommended Countermeasures</h4>
                    <div className="border border-red-500/10 bg-red-500/[0.01] text-red-300 rounded-2xl p-4 flex flex-col gap-3 text-xs leading-relaxed font-sans">
                      {result.recommended_actions && result.recommended_actions.length > 0 ? (
                        <ul className="space-y-2">
                          {result.recommended_actions.map((act: string, idx: number) => (
                            <li key={idx} className="flex gap-2.5 items-start">
                              <span className="text-[11px] text-red-500 mt-0.5 shrink-0 select-none">🚨</span>
                              <span className="text-[10.5px] text-red-200/90 leading-normal">{act}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex gap-2.5 items-start text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-[10.5px] text-emerald-300/90">System parameters verify cleanly. No mitigation actions required.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBSCORES TAB */}
              {resultTab === "subscores" && (
                <div className="space-y-5">
                  <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1">Risk Dimension breakdown</h4>
                  <div className="space-y-4">
                    {[
                      { key: "contract_risk", label: "Smart Contract Risk", color: "from-blue-600 to-indigo-500" },
                      { key: "wallet_risk", label: "Wallet Rep Risk", color: "from-cyan-600 to-teal-500" },
                      { key: "threat_risk", label: "Threat Intel Risk", color: "from-red-600 to-orange-500" },
                      { key: "anomaly_risk", label: "Anomaly Risk", color: "from-purple-600 to-pink-500" },
                      { key: "bridge_risk", label: "Cross-Chain Bridge Risk", color: "from-sky-600 to-blue-500" },
                      { key: "event_risk", label: "Telemetry Event Risk", color: "from-amber-600 to-yellow-500" }
                    ].map((item) => {
                      const scoreVal = result.subscores[item.key] || 0.0;
                      return (
                        <div key={item.key} className="space-y-1 text-left font-sans">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[10.5px] font-medium text-gray-300">{item.label}</span>
                            <span className="font-bold font-mono text-[10.5px] text-white">{scoreVal.toFixed(0)} / 100</span>
                          </div>
                          <div className="w-full bg-white/[0.04] border border-white/[0.06] rounded-full h-2 overflow-hidden relative">
                            <div 
                              className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                              style={{ width: `${scoreVal}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="h-full border border-white/[0.04] bg-white/[0.01] rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-4 text-gray-500 min-h-[400px]">
            <ShieldAlert className="w-12 h-12 text-gray-600 animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Awaiting Risk Inputs</h4>
              <p className="text-[10px] text-gray-500 max-w-[280px] leading-normal font-sans">
                Configure findings counts, wallet reputation, threat logs, anomaly scores, and bridge parameters on the setup panel to compute aggregated threat index profiles.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const BridgeIntelligenceInterface = () => {
  const [bridgeProtocol, setBridgeProtocol] = useState("wormhole");
  const [sourceChain, setSourceChain] = useState("ethereum");
  const [destChain, setDestChain] = useState("solana");
  const [senderAddress, setSenderAddress] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [token, setToken] = useState("");
  const [txHash, setTxHash] = useState("");

  const [preset, setPreset] = useState("custom");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<any>(null);
  const [resultTab, setResultTab] = useState<"overview" | "flows" | "paths" | "anomalies" | "exploits" | "money-flow" | "attacks">("overview");

  const protocols = [
    { value: "layerzero", label: "LayerZero" },
    { value: "wormhole", label: "Wormhole" },
    { value: "across", label: "Across" },
    { value: "stargate", label: "Stargate" },
    { value: "hop", label: "Hop" },
    { value: "native", label: "Native Bridge" },
  ];

  const chains = [
    "ethereum", "polygon", "arbitrum", "optimism", "bsc", "avalanche", "solana", "base", "fantom", "gnosis"
  ];

  const presets: Record<string, any> = {
    wormhole_exploit: {
      bridgeProtocol: "wormhole",
      sourceChain: "ethereum",
      destChain: "solana",
      senderAddress: "0x629e7Da20197a5429d30da36E77d06CdF796b71A",
      amountUsd: "320000000",
      token: "wETH",
      txHash: "0x4b5c2aef5e7fab...",
    },
    normal_bridge: {
      bridgeProtocol: "across",
      sourceChain: "ethereum",
      destChain: "arbitrum",
      senderAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
      amountUsd: "2500",
      token: "USDC",
      txHash: "",
    },
    laundering_pattern: {
      bridgeProtocol: "stargate",
      sourceChain: "ethereum",
      destChain: "polygon",
      senderAddress: "0xdeadbeef00000000000000000000000000000000",
      amountUsd: "850000",
      token: "USDT",
      txHash: "0x9a8b7c6d5e4f3a2b1c0d...",
    },
  };

  const loadPreset = (key: string) => {
    setPreset(key);
    if (key === "custom") return;
    const p = presets[key];
    if (!p) return;
    setBridgeProtocol(p.bridgeProtocol);
    setSourceChain(p.sourceChain);
    setDestChain(p.destChain);
    setSenderAddress(p.senderAddress);
    setAmountUsd(p.amountUsd);
    setToken(p.token);
    setTxHash(p.txHash);
    setResult(null);
    setErrorMsg("");
  };

  const handleAnalyze = async () => {
    if (!senderAddress.trim()) {
      setErrorMsg("Sender address is required");
      return;
    }
    if (!amountUsd || parseFloat(amountUsd) <= 0) {
      setErrorMsg("Amount must be greater than 0");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    setResult(null);
    try {
      const body: any = {
        bridge_protocol: bridgeProtocol,
        source_chain: sourceChain,
        destination_chain: destChain,
        sender_address: senderAddress,
        amount_usd: parseFloat(amountUsd),
      };
      if (token.trim()) body.token = token.trim();
      if (txHash.trim()) body.tx_hash = txHash.trim();

      const resp = await fetch(`${API_BASE_URL}/bridges/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
      const data = await resp.json();
      setResult(data);
      setResultTab("overview");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to analyze bridge transfer");
    } finally {
      setIsLoading(false);
    }
  };

  const riskColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case "CRITICAL": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "HIGH": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "MEDIUM": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "LOW": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const severityDot = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case "CRITICAL": return "bg-red-500";
      case "HIGH": return "bg-orange-500";
      case "MEDIUM": return "bg-yellow-500";
      case "LOW": return "bg-emerald-500";
      default: return "bg-gray-500";
    }
  };

  // Build ReactFlow nodes/edges from result
  const buildFlowGraph = () => {
    if (!result?.money_flow_nodes?.length) return { nodes: [], edges: [] };

    const chainColors: Record<string, string> = {
      ethereum: "#627EEA", polygon: "#8247E5", arbitrum: "#28A0F0", optimism: "#FF0420",
      bsc: "#F0B90B", avalanche: "#E84142", solana: "#9945FF", base: "#0052FF",
      fantom: "#1969FF", gnosis: "#04795B",
    };

    const nodeTypeColors: Record<string, string> = {
      WALLET: "#6366f1", BRIDGE_CONTRACT: "#f59e0b", DEX: "#10b981", MIXER: "#ef4444", UNKNOWN: "#6b7280",
    };

    const riskBorders: Record<string, string> = {
      LOW: "#22c55e", MEDIUM: "#eab308", HIGH: "#f97316", CRITICAL: "#ef4444",
    };

    const rfNodes = result.money_flow_nodes.map((n: any, i: number) => ({
      id: n.id,
      position: { x: 80 + i * 220, y: 80 + (i % 2 === 0 ? 0 : 100) },
      data: {
        label: (
          <div className="flex flex-col items-center gap-1 px-2 py-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chainColors[n.chain] || "#6b7280" }} />
            <span className="text-[9px] font-bold text-white/90 text-center leading-tight whitespace-pre-line">{n.label}</span>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: (nodeTypeColors[n.node_type] || "#6b7280") + "22", color: nodeTypeColors[n.node_type] || "#6b7280" }}>{n.node_type}</span>
          </div>
        ),
      },
      style: {
        background: "rgba(15, 16, 24, 0.95)",
        border: `1.5px solid ${riskBorders[n.risk_level] || "#374151"}`,
        borderRadius: "14px",
        padding: "4px",
        minWidth: 130,
      },
    }));

    const rfEdges = result.money_flow_edges.map((e: any) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#6366f1", strokeWidth: 1.5 },
      labelStyle: { fontSize: 9, fill: "#a1a1aa", fontWeight: 600 },
      labelBgStyle: { fill: "#0f1018", strokeWidth: 0 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1", width: 14, height: 14 },
    }));

    return { nodes: rfNodes, edges: rfEdges };
  };

  const tabItems = [
    { key: "overview", label: "Overview" },
    { key: "flows", label: "Flows" },
    { key: "paths", label: "Cross-Chain Paths" },
    { key: "anomalies", label: "Anomalies" },
    { key: "exploits", label: "Exploits" },
    { key: "money-flow", label: "Money Flow" },
    { key: "attacks", label: "Attack Paths" },
  ];

  const inputCls = "w-full bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-white px-3 py-2.5 focus:outline-none focus:border-teal-500/40 transition-colors placeholder-gray-600 font-mono";
  const selectCls = "w-full bg-[#0d0e14] border border-white/[0.06] rounded-xl text-xs text-white px-3 py-2.5 focus:outline-none focus:border-teal-500/40 transition-colors font-mono appearance-none cursor-pointer";
  const labelCls = "text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5";

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: Input Panel */}
      <div className="w-full lg:w-[380px] lg:min-w-[380px] space-y-4 flex-shrink-0">
        {/* Preset Selector */}
        <div className="border border-white/[0.05] bg-white/[0.015] rounded-2xl p-4 space-y-3">
          <p className={labelCls}>Scenario Preset</p>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "custom", label: "Custom" },
              { key: "wormhole_exploit", label: "Wormhole Exploit" },
              { key: "normal_bridge", label: "Normal Bridge" },
              { key: "laundering_pattern", label: "Laundering Pattern" },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => loadPreset(p.key)}
                className={`text-[10px] font-bold font-mono px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  preset === p.key
                    ? "bg-teal-500/15 border-teal-500/30 text-teal-400"
                    : "bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/10"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bridge Config */}
        <div className="border border-white/[0.05] bg-white/[0.015] rounded-2xl p-4 space-y-4">
          <p className={labelCls}>Bridge Configuration</p>

          <div>
            <p className={labelCls}>Protocol</p>
            <select value={bridgeProtocol} onChange={(e) => setBridgeProtocol(e.target.value)} className={selectCls}>
              {protocols.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={labelCls}>Source Chain</p>
              <select value={sourceChain} onChange={(e) => setSourceChain(e.target.value)} className={selectCls}>
                {chains.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <p className={labelCls}>Dest Chain</p>
              <select value={destChain} onChange={(e) => setDestChain(e.target.value)} className={selectCls}>
                {chains.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className={labelCls}>Sender Address</p>
            <input
              type="text"
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
              placeholder="0x742d35Cc6634C0532925a3b..."
              className={inputCls}
            />
          </div>

          <div>
            <p className={labelCls}>Amount (USD)</p>
            <input
              type="number"
              step="any"
              value={amountUsd}
              onChange={(e) => setAmountUsd(e.target.value)}
              placeholder="500000"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={labelCls}>Token (optional)</p>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ETH, USDC..."
                className={inputCls}
              />
            </div>
            <div>
              <p className={labelCls}>TX Hash (optional)</p>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0xabc..."
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-widest border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/30 active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Analyzing Bridge...
            </span>
          ) : (
            "Analyze Bridge Transfer"
          )}
        </button>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-[10px] text-red-400 font-mono">
            <AlertTriangle className="inline w-3 h-3 mr-1" />{errorMsg}
          </div>
        )}
      </div>

      {/* Right: Results Panel */}
      <div className="flex-1 min-w-0">
        {result ? (
          <div className="space-y-4">
            {/* Result Tabs */}
            <div className="flex flex-wrap gap-1 border border-white/[0.05] bg-white/[0.015] rounded-2xl p-1.5">
              {tabItems.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setResultTab(t.key as any)}
                  className={`text-[10px] font-bold font-mono px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    resultTab === t.key
                      ? "bg-teal-500/15 text-teal-400 border border-teal-500/20"
                      : "text-gray-500 hover:text-gray-300 border border-transparent"
                  }`}
                >
                  {t.label}
                  {t.key === "anomalies" && result.anomalies?.length > 0 && (
                    <span className="ml-1 text-[8px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">{result.anomalies.length}</span>
                  )}
                  {t.key === "exploits" && result.known_exploits?.length > 0 && (
                    <span className="ml-1 text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">{result.known_exploits.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {resultTab === "overview" && (
              <div className="space-y-4">
                {/* Risk Score Header */}
                <div className="border border-white/[0.05] bg-white/[0.015] rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                          <circle
                            cx="40" cy="40" r="34" fill="none"
                            stroke={result.risk_level === "CRITICAL" ? "#ef4444" : result.risk_level === "HIGH" ? "#f97316" : result.risk_level === "MEDIUM" ? "#eab308" : "#22c55e"}
                            strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={`${(result.bridge_risk_score / 100) * 213.6} 213.6`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-white font-mono">{Math.round(result.bridge_risk_score)}</span>
                        </div>
                      </div>
                      <div>
                        <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${riskColor(result.risk_level)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${severityDot(result.risk_level)}`} />
                          {result.risk_level} RISK
                        </div>
                        <h3 className="text-sm font-semibold text-white mt-2">{result.bridge_protocol?.toUpperCase()} Bridge Analysis</h3>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{result.source_chain} → {result.destination_chain}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mt-4 font-sans">{result.summary}</p>
                </div>

                {/* Recommended Actions */}
                {result.recommended_actions?.length > 0 && (
                  <div className="border border-white/[0.05] bg-white/[0.015] rounded-2xl p-5">
                    <p className={labelCls + " mb-3"}>Recommended Actions</p>
                    <div className="space-y-2">
                      {result.recommended_actions.map((action: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-gray-300 font-sans leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Flows", value: result.flows?.length || 0, color: "text-blue-400" },
                    { label: "Paths", value: result.cross_chain_paths?.length || 0, color: "text-purple-400" },
                    { label: "Anomalies", value: result.anomalies?.length || 0, color: "text-yellow-400" },
                    { label: "Exploits", value: result.known_exploits?.length || 0, color: "text-red-400" },
                  ].map((s) => (
                    <div key={s.label} className="border border-white/[0.05] bg-white/[0.015] rounded-xl p-3 text-center">
                      <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
                      <p className="text-[9px] text-gray-500 font-mono uppercase">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flows Tab */}
            {resultTab === "flows" && (
              <div className="border border-white/[0.05] bg-white/[0.015] rounded-2xl p-5">
                <p className={labelCls + " mb-3"}>Bridge Transfer Flows</p>
                {result.flows?.length > 0 ? (
                  <div className="space-y-3">
                    {result.flows.map((flow: any) => (
                      <div key={flow.id} className="border border-white/[0.04] bg-white/[0.01] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono text-gray-500">{flow.id}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                            flow.status === "SUSPICIOUS" ? "text-red-400 bg-red-500/10 border-red-500/20" :
                            flow.status === "COMPLETED" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                            flow.status === "PENDING" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
                            "text-gray-400 bg-gray-500/10 border-gray-500/20"
                          }`}>{flow.status}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white font-semibold">
                          <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md text-[10px] font-mono">{flow.source_chain}</span>
                          <ArrowUpRight className="w-3 h-3 text-gray-500" />
                          <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-md text-[10px] font-mono">{flow.destination_chain}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-gray-400 font-mono">
                          <div>From: <span className="text-gray-300">{flow.sender}</span></div>
                          <div>To: <span className="text-gray-300">{flow.receiver}</span></div>
                          <div>Amount: <span className="text-white font-semibold">${flow.amount_usd?.toLocaleString()}</span></div>
                          <div>Token: <span className="text-teal-400">{flow.token}</span></div>
                        </div>
                        <p className="text-[9px] text-gray-600 font-mono mt-1">{flow.timestamp}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 font-mono text-center py-8">No flows detected</p>
                )}
              </div>
            )}

            {/* Cross-Chain Paths Tab */}
            {resultTab === "paths" && (
              <div className="border border-white/[0.05] bg-white/[0.015] rounded-2xl p-5">
                <p className={labelCls + " mb-3"}>Cross-Chain Transfer Paths</p>
                {result.cross_chain_paths?.length > 0 ? (
                  <div className="space-y-4">
                    {result.cross_chain_paths.map((path: any) => (
                      <div key={path.id} className="border border-white/[0.04] bg-white/[0.01] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-white font-semibold">{path.description}</p>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${riskColor(path.risk_level)}`}>
                            {path.risk_level}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {path.waypoints?.map((wp: any, i: number) => (
                            <div key={i} className="flex items-center gap-1">
                              <div className="flex flex-col items-center bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 min-w-[90px]">
                                <span className="text-[8px] font-bold text-teal-400 uppercase font-mono">{wp.chain}</span>
                                <span className="text-[9px] text-gray-400 font-mono truncate max-w-[80px]">{wp.address}</span>
                                <span className="text-[8px] text-gray-600 font-mono mt-0.5">{wp.action}</span>
                              </div>
                              {i < (path.waypoints?.length || 0) - 1 && (
                                <ArrowUpRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-[9px] text-gray-600 font-mono mt-2">{path.total_hops} hops</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 font-mono text-center py-8">No cross-chain paths reconstructed</p>
                )}
              </div>
            )}

            {/* Anomalies Tab */}
            {resultTab === "anomalies" && (
              <div className="border border-white/[0.05] bg-white/[0.015] rounded-2xl p-5">
                <p className={labelCls + " mb-3"}>Detected Anomalies</p>
                {result.anomalies?.length > 0 ? (
                  <div className="space-y-3">
                    {result.anomalies.map((anom: any) => (
                      <div key={anom.id} className={`border rounded-xl p-4 ${
                        anom.severity === "CRITICAL" ? "border-red-500/20 bg-red-500/[0.03]" :
                        anom.severity === "HIGH" ? "border-orange-500/20 bg-orange-500/[0.03]" :
                        anom.severity === "MEDIUM" ? "border-yellow-500/20 bg-yellow-500/[0.03]" :
                        "border-emerald-500/20 bg-emerald-500/[0.03]"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${severityDot(anom.severity)}`} />
                            <span className="text-xs text-white font-semibold">{anom.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${riskColor(anom.severity)}`}>{anom.severity}</span>
                            <span className="text-[9px] text-gray-500 font-mono">{anom.type}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{anom.description}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-400 rounded-full" style={{ width: `${(anom.confidence || 0) * 100}%` }} />
                          </div>
                          <span className="text-[9px] text-gray-600 font-mono">{((anom.confidence || 0) * 100).toFixed(0)}% confidence</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 font-mono text-center py-8">No anomalies detected</p>
                )}
              </div>
            )}

            {/* Exploits Tab */}
            {resultTab === "exploits" && (
              <div className="border border-white/[0.05] bg-white/[0.015] rounded-2xl p-5">
                <p className={labelCls + " mb-3"}>Known Bridge Exploits</p>
                {result.known_exploits?.length > 0 ? (
                  <div className="space-y-3">
                    {result.known_exploits.map((exploit: any) => (
                      <div key={exploit.id} className="border border-white/[0.04] bg-white/[0.01] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs text-white font-semibold">{exploit.name}</h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                            exploit.relevance === "DIRECT" ? "text-red-400 bg-red-500/10 border-red-500/20" :
                            exploit.relevance === "PATTERN_MATCH" ? "text-orange-400 bg-orange-500/10 border-orange-500/20" :
                            "text-gray-400 bg-gray-500/10 border-gray-500/20"
                          }`}>{exploit.relevance}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{exploit.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-[9px] font-mono text-gray-500">
                          <span>Bridge: <span className="text-teal-400">{exploit.affected_bridge}</span></span>
                          <span>Date: {exploit.date}</span>
                          <span>Impact: <span className="text-red-400 font-semibold">${(exploit.impact_usd || 0).toLocaleString()}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 font-mono text-center py-8">No known exploits found</p>
                )}
              </div>
            )}

            {/* Money Flow Tab */}
            {resultTab === "money-flow" && (
              <div className="border border-white/[0.05] bg-white/[0.015] rounded-2xl p-5">
                <p className={labelCls + " mb-3"}>Money Flow Diagram</p>
                {result.money_flow_nodes?.length > 0 ? (
                  <div className="h-[450px] rounded-xl overflow-hidden border border-white/[0.04] bg-[#0a0b10]">
                    <ReactFlow
                      nodes={buildFlowGraph().nodes}
                      edges={buildFlowGraph().edges}
                      fitView
                      proOptions={{ hideAttribution: true }}
                      style={{ background: '#0a0b10' }}
                    >
                      <Background color="#1a1b25" gap={20} size={1} />
                      <Controls
                        showInteractive={false}
                        style={{ background: '#12131b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}
                      />
                      <MiniMap
                        nodeColor="#6366f1"
                        maskColor="rgba(0,0,0,0.8)"
                        style={{ background: '#0a0b10', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}
                      />
                    </ReactFlow>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 font-mono text-center py-8">No money flow data available</p>
                )}
              </div>
            )}

            {/* Attack Paths Tab */}
            {resultTab === "attacks" && (
              <div className="border border-white/[0.05] bg-white/[0.015] rounded-2xl p-5">
                <p className={labelCls + " mb-3"}>Potential Attack Vectors</p>
                {result.attack_paths?.length > 0 ? (
                  <div className="space-y-3">
                    {result.attack_paths.map((path: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 border border-red-500/10 bg-red-500/[0.02] rounded-xl p-4">
                        <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Flame className="w-3 h-3 text-red-400" />
                        </div>
                        <p className="text-[11px] text-gray-300 leading-relaxed font-sans">{path}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 font-mono text-center py-8">No attack paths identified</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full border border-white/[0.04] bg-white/[0.01] rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-4 text-gray-500 min-h-[400px]">
            <Activity className="w-12 h-12 text-gray-600 animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Awaiting Bridge Analysis</h4>
              <p className="text-[10px] text-gray-500 max-w-[280px] leading-normal font-sans">
                Configure the bridge protocol, chains, sender, and amount on the left panel, then click analyze to inspect cross-chain flows, anomalies, and exploit risk.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// ==========================================
// AI INVESTIGATOR INTERFACE COMPONENT
// ==========================================

const SourceCardComponent = ({ card, index, onClick, active }: { card: any, index: number, onClick: () => void, active: boolean }) => {
  const getHeaderStyle = (toolName: string) => {
    switch (toolName) {
      case 'analyze_contract':
        return { bg: 'bg-violet-500/10 border-violet-500/20 text-violet-400', label: 'Contract Intel', icon: ShieldCheck };
      case 'analyze_wallet':
        return { bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400', label: 'Wallet Intel', icon: Wallet };
      case 'analyze_bridge':
        return { bg: 'bg-teal-500/10 border-teal-500/20 text-teal-400', label: 'Bridge Intel', icon: Flame };
      case 'calculate_risk':
        return { bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400', label: 'Risk Score', icon: ShieldAlert };
      case 'build_attack_graph':
        return { bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', label: 'Attack Graph', icon: Network };
      case 'analyze_threats':
        return { bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400', label: 'Threat Intel', icon: AlertTriangle };
      case 'simulate_transaction':
        return { bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', label: 'Tx Simulator', icon: Zap };
      case 'analyze_events':
        return { bg: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400', label: 'Event Intel', icon: Activity };
      default:
        return { bg: 'bg-gray-500/10 border-gray-500/20 text-gray-400', label: 'Intelligence Log', icon: Info };
    }
  };

  const style = getHeaderStyle(card.tool_name);
  const Icon = style.icon;
  const severityColor = {
    CRITICAL: 'bg-red-500/10 border-red-500/30 text-red-400',
    HIGH: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    MEDIUM: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    LOW: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    INFO: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
  }[card.severity as string || 'INFO'] || 'bg-gray-500/10 border-gray-500/30 text-gray-400';

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col border rounded-xl p-3 bg-[#0a0c10]/80 cursor-pointer transition-all duration-300 hover:border-white/10 hover:bg-[#0c0f16] hover:-translate-y-0.5 ${
        active ? 'border-violet-500/50 bg-[#0d0f17] shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'border-white/[0.04]'
      }`}
    >
      <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-white/[0.03] border border-white/[0.05] text-[9px] font-mono text-gray-400 font-bold">
        {index}
      </span>

      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg border ${style.bg}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold text-white leading-tight">{style.label}</span>
          <span className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">{card.chain || 'multi-chain'}</span>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 leading-normal font-sans mb-2 line-clamp-2">
        {card.summary}
      </p>

      <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/[0.03]">
        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 border rounded uppercase ${severityColor}`}>
          {card.severity}
        </span>
        <span className="text-[8px] font-mono text-gray-500 group-hover:text-white transition-colors">
          Expand Details →
        </span>
      </div>
    </div>
  );
};

const SourceCardDetailModal = ({ card, onClose }: { card: any, onClose: () => void }) => {
  if (!card) return null;

  const getToolTitle = (name: string) => {
    const titles: Record<string, string> = {
      analyze_contract: 'Smart Contract Audit Report',
      analyze_wallet: 'Wallet Intelligence Profile',
      analyze_bridge: 'Cross-Chain Bridge Analysis',
      calculate_risk: 'Centralized Risk Telemetry Evaluation',
      build_attack_graph: 'Attack Path Graph Network',
      analyze_threats: 'Threat Intelligence Correlation Feed',
      simulate_transaction: 'Transaction Simulation Trace',
      analyze_events: 'Event Intelligence Log Decoder',
    };
    return titles[name] || 'Intelligence Data Log';
  };

  const getSeverityBadge = (sev: string) => {
    const cls = {
      CRITICAL: 'bg-red-500/10 border-red-500/30 text-red-400',
      HIGH: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
      MEDIUM: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
      LOW: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      INFO: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
    }[sev as string || 'INFO'] || 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    return <span className={`text-[9px] font-mono font-bold px-2 py-0.5 border rounded uppercase ${cls}`}>{sev || 'INFO'}</span>;
  };

  const renderDataView = () => {
    const data = card.data || {};
    switch (card.tool_name) {
      case 'analyze_contract':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                <span className="block text-[8px] font-mono text-gray-500 uppercase">Contract Name</span>
                <span className="text-sm font-mono text-white font-bold">{data.contract_name || 'Unknown'}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                <span className="block text-[8px] font-mono text-gray-500 uppercase">Vulnerability Score</span>
                <span className="text-sm font-mono text-white font-bold">{data.risk_score || 0}/100</span>
              </div>
            </div>
            
            <div>
              <span className="block text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">Findings Checklist</span>
              {data.findings && data.findings.length > 0 ? (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {data.findings.map((f: any, idx: number) => (
                    <div key={idx} className="border border-white/5 bg-white/[0.01] p-3 rounded-lg flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-white">{f.vulnerability}</span>
                        {getSeverityBadge(f.severity)}
                      </div>
                      <p className="text-[10px] text-gray-400 font-sans leading-normal">{f.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 font-mono text-center py-4">No critical flaws identified.</p>
              )}
            </div>
          </div>
        );

      case 'analyze_wallet':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl col-span-2">
                <span className="block text-[8px] font-mono text-gray-500 uppercase">Identity Label</span>
                <span className="text-xs font-mono text-white font-bold truncate block">{data.wallet_label || 'Unknown Wallet'}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                <span className="block text-[8px] font-mono text-gray-500 uppercase">Reputation Score</span>
                <span className="text-xs font-mono text-white font-bold">{data.wallet_score || 50}/100</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
              <span className="block text-[8px] font-mono text-gray-500 uppercase">Current Balance (USD)</span>
              <span className="text-xl font-mono text-emerald-400 font-bold">${(data.total_balance_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div>
              <span className="block text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">Behavior Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {data.behavior_flags && data.behavior_flags.length > 0 ? (
                  data.behavior_flags.map((flag: string, idx: number) => (
                    <span key={idx} className="text-[9px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                      {flag}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-gray-500 font-mono">No suspicious behavioral patterns detected.</span>
                )}
              </div>
            </div>
          </div>
        );

      case 'analyze_bridge':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                <span className="block text-[8px] font-mono text-gray-500 uppercase">Bridge Security Rating</span>
                <span className="text-xs font-mono text-white font-bold">{data.bridge_risk_score || 0}/100</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                <span className="block text-[8px] font-mono text-gray-500 uppercase">Vulnerability Level</span>
                <span className="text-xs font-mono text-white font-bold">{data.risk_level || 'UNKNOWN'}</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
              <span className="block text-[8px] font-mono text-gray-500 uppercase">Telemetry Summary</span>
              <p className="text-[11px] text-gray-300 font-sans leading-normal">{data.summary}</p>
            </div>

            <div>
              <span className="block text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">Bridge Anomalies</span>
              {data.anomalies && data.anomalies.length > 0 ? (
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                  {data.anomalies.map((anom: any, idx: number) => (
                    <div key={idx} className="border border-white/5 bg-white/[0.01] p-2 rounded flex flex-col gap-0.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                        <span className="text-white">{anom.type}</span>
                        <span className="text-yellow-400">{anom.severity}</span>
                      </div>
                      <p className="text-[9px] text-gray-400">{anom.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 font-mono">No anomalies flagged.</p>
              )}
            </div>
          </div>
        );

      case 'calculate_risk':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-6 bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl">
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke={
                    data.overall_score >= 80 ? '#ef4444' : data.overall_score >= 50 ? '#f97316' : '#10b981'
                  } strokeWidth="6" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - (data.overall_score || 0) / 100)}`} strokeLinecap="round" />
                </svg>
                <span className="absolute text-sm font-mono font-bold text-white">{Math.round(data.overall_score || 0)}</span>
              </div>
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[8px] font-mono text-gray-500 uppercase leading-none">Overall Risk Index</span>
                <span className="text-sm font-bold text-white font-sans">{data.severity || 'LOW'} SEVERITY</span>
                <span className="text-[10px] text-gray-400 font-mono">Confidence: {Math.round((data.confidence || 0) * 100)}%</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl text-left">
              <span className="block text-[8px] font-mono text-gray-500 uppercase mb-1">Deductive Reasoning</span>
              <p className="text-[11px] text-gray-300 font-sans leading-normal">{data.reasoning}</p>
            </div>

            <div>
              <span className="block text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">Subscore Breakdown</span>
              <div className="grid grid-cols-2 gap-2">
                {data.subscores && Object.entries(data.subscores).map(([name, val]: [string, any]) => (
                  <div key={name} className="border border-white/5 bg-white/[0.01] p-2 rounded-lg flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[9px] font-mono text-gray-400 uppercase">
                      <span>{name}</span>
                      <span className="font-bold text-white">{Math.round(val)}/100</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'build_attack_graph':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                <span className="block text-[8px] font-mono text-gray-500 uppercase">Graph Nodes</span>
                <span className="text-xs font-mono text-white font-bold">{data.nodes?.length || 0} Entities</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                <span className="block text-[8px] font-mono text-gray-500 uppercase">Connection Edges</span>
                <span className="text-xs font-mono text-white font-bold">{data.edges?.length || 0} Relationships</span>
              </div>
            </div>

            <div>
              <span className="block text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">Reconstructed Attack Paths</span>
              {data.attack_paths && data.attack_paths.length > 0 ? (
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {data.attack_paths.map((path: string, idx: number) => (
                    <div key={idx} className="border border-red-500/10 bg-red-500/[0.01] p-3 rounded-lg flex items-start gap-2.5 text-left">
                      <Flame className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-gray-300 font-sans leading-normal">{path}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 font-mono text-center py-4">No attack paths reconstructed.</p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-[#040507] border border-white/5 rounded-xl p-3 max-h-[300px] overflow-y-auto text-left">
            <pre className="text-[10px] font-mono text-emerald-400 leading-normal whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0a0c10] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="border-b border-white/[0.05] p-5 flex justify-between items-center text-left">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-wider">Source Analysis Details</span>
            <h3 className="text-sm font-bold text-white font-sans">{getToolTitle(card.tool_name)}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center text-gray-400 hover:text-white hover:border-white/10 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow text-left">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.03]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400 uppercase">Target Network:</span>
              <span className="text-xs font-mono text-white font-bold">{card.chain?.toUpperCase() || 'MULTI-CHAIN'}</span>
            </div>
            {getSeverityBadge(card.severity)}
          </div>

          <div className="mb-4">
            <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider mb-1">Executive Summary</span>
            <p className="text-xs text-gray-300 font-sans leading-relaxed bg-white/[0.01] border border-white/5 rounded-xl p-3">
              {card.summary}
            </p>
          </div>

          {renderDataView()}
        </div>

        <div className="border-t border-white/[0.05] p-4 bg-white/[0.01] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-xs font-mono text-white transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

const AIInvestigatorInterface = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedChain, setSelectedChain] = useState("all");
  const [showEvidence, setShowEvidence] = useState(true);
  const [currentReasoning, setCurrentReasoning] = useState<string[]>([]);
  const [currentSourceCards, setCurrentSourceCards] = useState<any[]>([]);
  const [activeSourceCard, setActiveSourceCard] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/agent/history`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setCurrentReasoning([]);
    setCurrentSourceCards([]);
    try {
      const res = await fetch(`${API_BASE_URL}/agent/history/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      } else {
        console.error("Failed to load session messages:", res.status);
      }
    } catch (err) {
      console.error("Error loading session:", err);
    }
  };

  const handleNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setCurrentReasoning([]);
    setCurrentSourceCards([]);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, currentReasoning]);

  const getAllSessionCards = () => {
    const cards: any[] = [];
    messages.forEach((msg) => {
      if (msg.role === "assistant" && msg.source_cards) {
        msg.source_cards.forEach((c: any) => {
          if (!cards.some((ex) => ex.tool_name === c.tool_name && JSON.stringify(ex.data) === JSON.stringify(c.data))) {
            cards.push(c);
          }
        });
      }
    });
    currentSourceCards.forEach((c) => {
      if (!cards.some((ex) => ex.tool_name === c.tool_name && JSON.stringify(ex.data) === JSON.stringify(c.data))) {
        cards.push(c);
      }
    });
    return cards;
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isStreaming) return;

    const userQuery = inputMessage.trim();
    setInputMessage("");

    const userMsg = { role: "user", content: userQuery, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    setIsStreaming(true);
    setCurrentReasoning(["Connecting to AI Investigator agent engine..."]);
    setCurrentSourceCards([]);

    const assistantPlaceholder = {
      role: "assistant",
      content: "",
      source_cards: [],
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, assistantPlaceholder]);

    try {
      const response = await fetch(`${API_BASE_URL}/agent/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          session_id: activeSessionId || null,
          message: userQuery,
          chain_context: selectedChain === "all" ? null : selectedChain
        })
      });

      if (!response.ok) {
        throw new Error(`Agent API returned server error status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Streaming readable stream not available from backend.");
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulatedText = "";
      let localReasoning: string[] = ["Initialized agent engine session."];
      let localCards: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const dataStr = trimmed.substring(6);
          try {
            const event = JSON.parse(dataStr);

            if (event.type === "session") {
              setActiveSessionId(event.session_id);
              fetchSessions();
            } else if (event.type === "reasoning") {
              localReasoning.push(event.content);
              setCurrentReasoning([...localReasoning]);
            } else if (event.type === "tool_start") {
              const startMsg = `[TOOL] Calling ${event.tool} engine...`;
              localReasoning.push(startMsg);
              setCurrentReasoning([...localReasoning]);
            } else if (event.type === "tool_result") {
              const card = event.card;
              localCards.push(card);
              setCurrentSourceCards([...localCards]);
              const resultMsg = `[RESULT] Executed ${event.tool} (Severity: ${card.severity || 'INFO'})`;
              localReasoning.push(resultMsg);
              setCurrentReasoning([...localReasoning]);

              setMessages((prev) => {
                const next = [...prev];
                if (next.length === 0) return next;
                const last = next[next.length - 1];
                if (last.role === "assistant") {
                  next[next.length - 1] = {
                    ...last,
                    source_cards: [...localCards]
                  };
                }
                return next;
              });
            } else if (event.type === "token") {
              accumulatedText += event.content;
              setMessages((prev) => {
                const next = [...prev];
                if (next.length === 0) return next;
                const last = next[next.length - 1];
                if (last.role === "assistant") {
                  next[next.length - 1] = {
                    ...last,
                    content: accumulatedText
                  };
                }
                return next;
              });
            } else if (event.type === "done") {
              accumulatedText = event.message || accumulatedText;
              localCards = event.source_cards || localCards;
              localReasoning = event.reasoning_steps || localReasoning;

              setCurrentSourceCards(localCards);
              setCurrentReasoning(localReasoning);

              setMessages((prev) => {
                const next = [...prev];
                if (next.length === 0) return next;
                const last = next[next.length - 1];
                if (last.role === "assistant") {
                  next[next.length - 1] = {
                    ...last,
                    content: accumulatedText,
                    source_cards: localCards
                  };
                }
                return next;
              });
              fetchSessions();
            }
          } catch (err) {
            console.error("SSE parse error on line:", err, dataStr);
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) => {
        const next = [...prev];
        if (next.length > 0 && next[next.length - 1].role === "assistant" && next[next.length - 1].content === "") {
          next[next.length - 1] = {
            role: "assistant",
            content: `❌ **Forensic Scanner Offline**: ${err.message || "Uvicorn agent engine endpoint is not reachable."}`
          };
        }
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSuggestClick = (query: string) => {
    setInputMessage(query);
  };

  const scrollToCard = (index: number) => {
    setShowEvidence(true);
    const allCards = getAllSessionCards();
    if (allCards[index - 1]) {
      setActiveSourceCard(allCards[index - 1]);
    }
  };

  const renderMessageContent = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");

    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-xs sm:text-sm font-bold text-white font-sans mt-3 mb-1.5 flex items-center gap-2">
            <span className="w-1 h-3.5 bg-violet-500 rounded-full" />
            {renderLineTokens(trimmed.substring(4))}
          </h3>
        );
      }
      if (trimmed.startsWith("#### ")) {
        return (
          <h4 key={idx} className="text-[11px] font-bold font-mono text-violet-400 mt-2.5 mb-1 uppercase tracking-wider">
            {renderLineTokens(trimmed.substring(5))}
          </h4>
        );
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <div key={idx} className="flex items-start gap-2 text-xs text-gray-300 font-sans pl-2 py-0.5">
            <span className="text-violet-400 mt-1 flex-shrink-0">•</span>
            <span>{renderLineTokens(trimmed.substring(2))}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs text-gray-300 font-sans leading-relaxed my-0.5 text-left">
          {renderLineTokens(trimmed)}
        </p>
      );
    });
  };

  const renderLineTokens = (text: string) => {
    const tokenRegex = /(\*\*.*?\*\*|`.*?`|\[\d+\])/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx} className="font-bold text-white">{part.substring(2, part.length - 2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={idx} className="font-mono text-[10px] bg-white/5 border border-white/10 px-1 py-0.5 rounded text-violet-300">
            {part.substring(1, part.length - 1)}
          </code>
        );
      }
      const citationMatch = part.match(/^\[(\d+)\]$/);
      if (citationMatch) {
        const num = parseInt(citationMatch[1]);
        return (
          <span
            key={idx}
            onClick={() => scrollToCard(num)}
            className="inline-flex items-center justify-center w-4.5 h-4.5 rounded-full bg-violet-500/20 hover:bg-violet-500/40 border border-violet-500/30 text-[9px] font-mono text-violet-300 font-bold ml-1 cursor-pointer transition-colors active:scale-95"
            title={`Open Source Card #${num}`}
          >
            {num}
          </span>
        );
      }
      return part;
    });
  };

  const sessionCards = getAllSessionCards();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch font-sans text-left min-h-[620px] max-w-7xl mx-auto">
      
      {/* LEFT COLUMN: Investigation Session Logs (3 cols) */}
      <div className="lg:col-span-3 bg-white/[0.015] border border-white/[0.04] rounded-3xl p-4 flex flex-col gap-4 max-h-[650px] overflow-hidden backdrop-blur-md">
        <div className="flex justify-between items-center pb-2 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-violet-400" />
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest font-mono">Sessions</h3>
          </div>
          <span className="text-[10px] font-mono text-gray-500 bg-white/[0.03] px-1.5 py-0.5 rounded-md border border-white/[0.04]">{sessions.length}</span>
        </div>

        <button
          onClick={handleNewSession}
          className="w-full bg-gradient-to-r from-violet-600/90 to-indigo-600/90 hover:from-violet-500 hover:to-indigo-500 text-white font-mono text-xs font-bold py-2.5 px-4 rounded-xl border border-violet-500/30 hover:border-violet-500/50 shadow-[0_4px_12px_rgba(139,92,246,0.15)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>+</span> New Investigation
        </button>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {sessions.length > 0 ? (
            sessions.map((sess) => {
              const isSelected = activeSessionId === sess.session_id;
              return (
                <button
                  key={sess.session_id}
                  onClick={() => handleSelectSession(sess.session_id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-sans flex flex-col gap-1 cursor-pointer group ${
                    isSelected
                      ? 'bg-violet-950/20 border-violet-500/30 text-white shadow-[0_2px_8px_rgba(139,92,246,0.05)]'
                      : 'bg-white/[0.005] border-white/[0.03] text-gray-400 hover:text-gray-200 hover:border-white/10 hover:bg-white/[0.015]'
                  }`}
                >
                  <span className="font-medium truncate group-hover:text-white transition-colors">{sess.title || 'Untitled Session'}</span>
                  <span className="text-[9px] font-mono text-gray-500">
                    {new Date(sess.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="text-[10px] text-gray-500 font-mono text-center py-8">No historical investigations found.</p>
          )}
        </div>
      </div>

      {/* CENTER COLUMN: Live Chat Agent Interface (6 or 9 cols) */}
      <div className={`flex flex-col bg-white/[0.015] border border-white/[0.04] rounded-3xl overflow-hidden backdrop-blur-md max-h-[650px] relative transition-all duration-300 ${
        showEvidence ? 'lg:col-span-6' : 'lg:col-span-9'
      }`}>
        
        {/* Chat Header */}
        <div className="border-b border-white/[0.04] p-4 flex justify-between items-center bg-white/[0.005]">
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-mono font-bold text-violet-400 uppercase tracking-widest leading-none">Security investigator AI</span>
            <h4 className="text-xs font-bold text-white font-sans mt-1 truncate max-w-[200px] sm:max-w-[320px]">
              {activeSessionId ? (sessions.find((s) => s.session_id === activeSessionId)?.title || "Active Investigation") : "New Investigation Sandbox"}
            </h4>
          </div>
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold tracking-tight cursor-pointer transition-colors select-none flex items-center gap-1.5 ${
              showEvidence
                ? 'bg-violet-500/10 border-violet-500/30 text-violet-300 hover:bg-violet-500/20'
                : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:text-white hover:border-white/10 hover:bg-white/[0.05]'
            }`}
          >
            <span>Evidence Inventory</span>
            <span className="bg-white/10 px-1 py-0.5 rounded text-[9px]">{sessionCards.length}</span>
          </button>
        </div>

        {/* Messages list */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-[350px] flex flex-col bg-gradient-to-b from-transparent to-black/[0.08]">
          {messages.length > 0 ? (
            messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={idx}
                  className={`flex flex-col gap-1.5 max-w-[85%] ${
                    isUser ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <span className="text-[9px] font-mono text-gray-500 uppercase px-1">
                    {isUser ? 'investigator' : 'copilot agent'}
                  </span>
                  
                  <div
                    className={`border p-4 rounded-2xl shadow-md text-left ${
                      isUser
                        ? 'bg-violet-950/10 border-violet-500/20 text-white rounded-tr-sm'
                        : 'bg-white/[0.015] border-white/[0.04] text-gray-200 rounded-tl-sm'
                    }`}
                  >
                    {!isUser && msg.reasoning_steps && msg.reasoning_steps.length > 0 && (
                      <div className="mb-3 border border-white/[0.04] rounded-lg overflow-hidden bg-white/[0.005]">
                        <details className="group">
                          <summary className="list-none flex items-center justify-between p-2 text-[10px] font-mono text-gray-500 bg-white/[0.01] hover:bg-white/[0.02] hover:text-gray-300 cursor-pointer select-none">
                            <span className="flex items-center gap-1.5">
                              <Terminal className="w-3 h-3 text-violet-400" />
                              Investigative Reasoning Logs ({msg.reasoning_steps.length})
                            </span>
                            <span className="transition-transform duration-200 group-open:rotate-180">▼</span>
                          </summary>
                          <div className="p-2 border-t border-white/[0.04] bg-[#050608]/90 font-mono text-[9px] text-gray-400 space-y-1 max-h-[160px] overflow-y-auto leading-normal">
                            {msg.reasoning_steps.map((step: string, sidx: number) => (
                              <div key={sidx} className="flex gap-1.5 text-left">
                                <span className="text-violet-500 flex-shrink-0">&gt;</span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}

                    {isUser ? (
                      <p className="text-xs text-white font-sans whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="space-y-1.5">
                        {renderMessageContent(msg.content)}
                      </div>
                    )}

                    {!isUser && msg.source_cards && msg.source_cards.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/[0.03] space-y-1.5 text-left">
                        <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">Telemetry Scanned</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.source_cards.map((c: any, cidx: number) => (
                            <div
                              key={cidx}
                              onClick={() => setActiveSourceCard(c)}
                              className="border border-white/[0.04] hover:border-violet-500/30 bg-white/[0.005] hover:bg-violet-950/5 p-2 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                <span className="text-[10px] font-mono font-bold text-gray-300 truncate">
                                  {c.tool_name === 'analyze_contract' ? 'Contract Scan' :
                                   c.tool_name === 'analyze_wallet' ? 'Wallet Scan' :
                                   c.tool_name === 'analyze_bridge' ? 'Bridge Scan' :
                                   c.tool_name === 'calculate_risk' ? 'Risk Score' :
                                   c.tool_name === 'build_attack_graph' ? 'Attack Graph' :
                                   c.tool_name === 'analyze_threats' ? 'Threat data' :
                                   c.tool_name === 'simulate_transaction' ? 'Simulation' : 'Telemetry Log'}
                                </span>
                              </div>
                              <span className="text-[8px] font-mono text-gray-500">Expand →</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-5 my-auto max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center relative shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                <Cpu className="w-6 h-6 text-violet-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">AI Intelligence Investigator</h3>
                <p className="text-[10px] sm:text-xs text-gray-400 font-sans leading-relaxed">
                  Enter any blockchain address or smart contract to trace funds, identify vulnerabilities, verify reputation, audit bridge flows, and correlate global threat actor indicators.
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full pt-2">
                <span className="text-[8px] font-mono text-gray-500 uppercase tracking-wider text-left font-bold pl-1">Suggested inquiries</span>
                <div className="flex flex-col gap-1.5">
                  {[
                    "Investigate address 0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18 on ethereum",
                    "Audit smart contract 0x050608a1d2... on solana",
                    "Check threat intelligence correlation for address 0x8f7d8c6b..."
                  ].map((q, qidx) => (
                    <button
                      key={qidx}
                      onClick={() => handleSuggestClick(q)}
                      className="text-left text-[10px] text-gray-400 font-sans border border-white/[0.04] bg-white/[0.005] hover:bg-white/[0.02] hover:border-violet-500/25 hover:text-white px-3 py-2 rounded-xl transition-all truncate cursor-pointer active:scale-99"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isStreaming && currentReasoning.length > 0 && (
            <div className="self-start max-w-[85%] flex flex-col gap-1">
              <span className="text-[9px] font-mono text-gray-500 uppercase px-1">Agent telemetry scan log</span>
              <div className="border border-violet-500/10 bg-violet-950/[0.015] p-3 rounded-2xl rounded-tl-sm flex flex-col gap-1.5 max-w-sm">
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                  <span className="text-[10px] font-mono font-bold text-violet-300">Processing Investigation...</span>
                </div>
                <div className="font-mono text-[9px] text-gray-400 space-y-1 leading-normal text-left max-h-[120px] overflow-y-auto pr-1 border-t border-white/[0.03] pt-1.5">
                  {currentReasoning.map((step, idx) => (
                    <div key={idx} className="flex gap-1.5">
                      <span className="text-violet-500">&gt;</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="border-t border-white/[0.04] p-3 sm:p-4 bg-white/[0.005] flex flex-col gap-2">
          <div className="relative border border-white/[0.08] bg-[#06070a]/90 rounded-2xl overflow-hidden focus-within:border-violet-500/40 transition-all flex flex-col p-2 min-h-[80px]">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Provide a wallet or contract address to scan..."
              disabled={isStreaming}
              rows={2}
              className="w-full bg-transparent text-xs text-white placeholder-gray-500 outline-none resize-none border-none pl-2 pr-12 pt-1.5 max-h-[120px] font-sans"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            
            <div className="flex justify-between items-center pt-2 mt-auto border-t border-white/[0.03]">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-gray-500 uppercase pl-1 select-none">Target Network:</span>
                <select
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                  className="bg-white/[0.02] border border-white/[0.06] text-[9.5px] font-mono text-gray-300 rounded px-1.5 py-0.5 outline-none cursor-pointer hover:border-white/10"
                >
                  <option value="all">Auto-Detect</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="solana">Solana</option>
                  <option value="sui">Sui</option>
                  <option value="aptos">Aptos</option>
                  <option value="bitcoin">Bitcoin</option>
                  <option value="tron">Tron</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isStreaming}
                className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all border outline-none select-none ${
                  inputMessage.trim() && !isStreaming
                    ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95'
                    : 'bg-white/[0.01] border-white/[0.04] text-gray-600 cursor-not-allowed'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-[9px] font-mono text-gray-600 px-1 select-none">
            <span>Unified ReAct Multi-Chain Agent</span>
            <span>Verify forensic telemetry records</span>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Evidence Inventory (3 cols, conditional) */}
      {showEvidence && (
        <div className="lg:col-span-3 bg-white/[0.015] border border-white/[0.04] rounded-3xl p-4 flex flex-col gap-4 max-h-[650px] overflow-hidden backdrop-blur-md animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest font-mono">Evidence Panel</h3>
            </div>
            <span className="text-[10px] font-mono text-gray-500 bg-white/[0.03] px-1.5 py-0.5 rounded-md border border-white/[0.04]">{sessionCards.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {sessionCards.length > 0 ? (
              sessionCards.map((card, idx) => (
                <SourceCardComponent
                  key={idx}
                  card={card}
                  index={idx + 1}
                  onClick={() => setActiveSourceCard(card)}
                  active={activeSourceCard === card}
                />
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-16 text-gray-500">
                <Info className="w-8 h-8 text-gray-600" />
                <div className="space-y-1">
                  <h5 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Awaiting Scan Data</h5>
                  <p className="text-[9px] text-gray-500 font-sans leading-normal max-w-[180px] mx-auto">
                    Evidence cards generated from smart contract scanning or wallet telemetry will compile automatically here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSourceCard && (
        <SourceCardDetailModal card={activeSourceCard} onClose={() => setActiveSourceCard(null)} />
      )}
    </div>
  );
};



const ReportGeneratorWorkspace = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [targetInput, setTargetInput] = useState("");
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [activeTab, setActiveTab] = useState<"contract" | "wallet" | "transaction" | "threat">("contract");
  
  // Progress & loading states
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  
  // Notifications
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [shareNotification, setShareNotification] = useState(false);
  
  // Compare Reports states
  const [compareMode, setCompareMode] = useState(false);
  const [compareReportA, setCompareReportA] = useState<any | null>(null);
  const [compareReportB, setCompareReportB] = useState<any | null>(null);

  const fetchReportsHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.reports || []);
      }
    } catch (err) {
      console.error("Error fetching report history", err);
    }
  };

  const handleGenerateReport = async () => {
    if (!targetInput.trim() || generating) return;
    
    setGenerating(true);
    setProgress(0);
    setLogLines(["Initializing BlockSpectra workspace analyzer nodes..."]);
    setActiveReport(null);

    const logTimeline = [
      { p: 15, msg: "Connecting to multi-chain RPC providers..." },
      { p: 35, msg: `Running telemetry queries on ${selectedChain.toUpperCase()} network...` },
      { p: 55, msg: "Executing heuristics analysis & threat scoring engine..." },
      { p: 75, msg: "Aggregating findings into executive AI prompts..." },
      { p: 90, msg: "Compiling structured markdown report cards..." },
      { p: 98, msg: "Polishing recommendations and checklist items..." }
    ];
    
    let currentIdx = 0;
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        const nextProgress = prev + Math.floor(Math.random() * 8) + 2;
        if (currentIdx < logTimeline.length && nextProgress >= logTimeline[currentIdx].p) {
          setLogLines(old => [...old, `[${new Date().toLocaleTimeString()}] ${logTimeline[currentIdx].msg}`]);
          currentIdx++;
        }
        return nextProgress;
      });
    }, 350);

    try {
      const res = await fetch(`${API_BASE_URL}/reports/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_type: activeTab,
          chain: selectedChain,
          target: targetInput.trim()
        })
      });
      
      if (!res.ok) throw new Error("Report generation failed");
      const report = await res.json();
      
      pollReportStatus(report.id, progressInterval);
      
    } catch (err: any) {
      clearInterval(progressInterval);
      setGenerating(false);
      setLogLines(old => [...old, `❌ Error: ${err.message || "Failed to contact report server"}`]);
    }
  };

  const pollReportStatus = (id: string, progressInterval: any) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/reports/report/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.status === "COMPLETED") {
          clearInterval(interval);
          clearInterval(progressInterval);
          setProgress(100);
          setLogLines(old => [...old, `[${new Date().toLocaleTimeString()}] Report compilation complete! Rendering dashboard...`]);
          
          setTimeout(() => {
            setActiveReport(data);
            setGenerating(false);
            fetchReportsHistory();
          }, 800);
          
        } else if (data.status === "FAILED") {
          clearInterval(interval);
          clearInterval(progressInterval);
          setGenerating(false);
          setLogLines(old => [...old, "🚨 Report compilation failed in background worker node."]);
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 1200);
  };

  const handleRegenerateSectionClick = async (sectionTitle: string) => {
    if (!activeReport) return;
    
    let sectionKey = "";
    const cleanTitle = sectionTitle.toUpperCase();
    if (cleanTitle.includes("EXECUTIVE") || cleanTitle.includes("BEHAVIOR")) sectionKey = "executive_summary";
    else if (cleanTitle.includes("SCENARIOS") || cleanTitle.includes("INTERACTION") || cleanTitle.includes("DETAIL")) sectionKey = "attack_scenarios";
    else if (cleanTitle.includes("RECOMMENDATIONS") || cleanTitle.includes("RISK")) sectionKey = "recommendations";
    
    if (!sectionKey) return;
    
    setRegeneratingSection(sectionKey);
    try {
      const res = await fetch(`${API_BASE_URL}/reports/regenerate-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_id: activeReport.id, section: sectionKey })
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveReport(updated);
        fetchReportsHistory();
        setCopiedNotification(`Regenerated '${sectionKey.replace("_", " ")}' successfully!`);
        setTimeout(() => setCopiedNotification(null), 3000);
      }
    } catch (err) {
      console.error("Failed to regenerate section", err);
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handleCopyMarkdown = (report: any) => {
    if (!report) return;
    navigator.clipboard.writeText(report.markdown_content);
    setCopiedNotification("Markdown report copied to clipboard!");
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleShareReport = (report: any) => {
    if (!report) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}#/reports?id=${report.id}`;
    navigator.clipboard.writeText(shareUrl);
    setShareNotification(true);
    setTimeout(() => setShareNotification(false), 3000);
  };

  const handleExportJSON = (report: any) => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BlockSpectra-Audit-${report.report_type}-${report.id.substring(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = (report: any) => {
    if (!report) return;
    const pw = window.open("", "_blank");
    if (!pw) return;

    const simpleMarkdownToHtml = (md: string) => {
      if (!md) return "";
      let html = md;
      html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
      html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
      html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
      html = html.replace(/\|(.+)\|/g, (match) => {
        const cols = match.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
        if (cols.every(c => c.startsWith('---') || c.startsWith(':---') || c.endsWith('---:'))) {
          return ""; 
        }
        const isHeader = match.includes('Vulnerability') || match.includes('Asset') || match.includes('Contract') || match.includes('Entity');
        const tag = isHeader ? 'th' : 'td';
        return '<tr>' + cols.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
      });
      html = html.replace(/(<tr>.+<\/tr>)+/g, '<table>$1</table>');
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/```solidity([\s\S]+?)```/g, '<pre><code>$1</code></pre>');
      html = html.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');
      html = html.replace(/-\s+\[\s*\]\s+(.+)$/gm, '<div>☐ $1</div>');
      html = html.replace(/-\s+\[x\]\s+(.+)$/gm, '<div>☑ $1</div>');
      html = html.replace(/-\s+(.+)$/gm, '<li>$1</li>');
      html = html.replace(/\n\n/g, '<br/>');
      return html;
    };

    pw.document.write(`
      <html>
        <head>
          <title>BlockSpectra Report - ${report.report_type.toUpperCase()} - ${report.target}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111; line-height: 1.6; padding: 40px; background: #fff; }
            h1 { font-size: 24px; font-weight: 700; border-bottom: 2px solid #222; padding-bottom: 8px; margin-bottom: 20px; }
            h2 { font-size: 18px; font-weight: 600; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
            h3 { font-size: 14px; font-weight: 600; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 12px; }
            th { background-color: #f7f7f7; font-weight: bold; }
            code { font-family: monospace; background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
            pre { background: #f4f4f4; padding: 12px; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 10px; }
            .meta-box { display: flex; gap: 20px; margin-bottom: 25px; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; }
            .meta-item { flex: 1; }
            .meta-label { font-size: 9px; text-transform: uppercase; color: #666; font-weight: bold; }
            .meta-val { font-size: 18px; font-weight: bold; margin-top: 4px; }
          </style>
        </head>
        <body>
          <h1>BlockSpectra Telemetry Audit Report</h1>
          <div class="meta-box">
            <div class="meta-item">
              <div class="meta-label">Audit Class</div>
              <div class="meta-val">${report.report_type.toUpperCase()} REPORT</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Blockchain Ecosystem</div>
              <div class="meta-val">${report.chain.toUpperCase()}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Risk Rating</div>
              <div class="meta-val">${report.risk_score}/100 (${report.severity})</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Confidence</div>
              <div class="meta-val">${report.confidence_score}%</div>
            </div>
          </div>
          <div>${simpleMarkdownToHtml(report.markdown_content)}</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    pw.document.close();
  };

  useEffect(() => {
    fetchReportsHistory();
    
    // Hash query parameter listener (Share URL parser)
    const loadSharedReport = async () => {
      const hash = window.location.hash;
      const match = hash.match(/[?&]id=([^&]+)/);
      if (match && match[1]) {
        const reportId = match[1];
        try {
          const res = await fetch(`${API_BASE_URL}/reports/report/${reportId}`);
          if (res.ok) {
            const data = await res.json();
            setActiveReport(data);
            setActiveTab(data.report_type);
            setSelectedChain(data.chain);
          }
        } catch (err) {
          console.error("Failed to load shared report from hash", err);
        }
      }
    };
    loadSharedReport();
    window.addEventListener("hashchange", loadSharedReport);
    return () => window.removeEventListener("hashchange", loadSharedReport);
  }, []);

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];
    const renderedElements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Table mapping
      if (trimmed.startsWith("|")) {
        inTable = true;
        const cols = trimmed.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
        if (cols.every(c => c.startsWith("---") || c.startsWith(":---") || c.endsWith("---:"))) {
          return;
        }
        if (tableHeaders.length === 0) {
          tableHeaders = cols;
        } else {
          tableRows.push(cols);
        }
        return;
      } else {
        if (inTable && tableHeaders.length > 0) {
          const currentHeaders = tableHeaders;
          const currentRows = tableRows;
          renderedElements.push(
            <div key={`table-${idx}`} className="my-5 overflow-x-auto border border-white/5 rounded-xl bg-white/[0.01]">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    {currentHeaders.map((h, i) => (
                      <th key={i} className="px-4 py-3 font-semibold text-gray-300 font-mono uppercase tracking-wider text-[10px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {currentRows.map((row, ri) => (
                    <tr key={ri} className="hover:bg-white/[0.02] transition-colors">
                      {row.map((cell, ci) => {
                        const isSeverity = cell === "CRITICAL" || cell === "HIGH" || cell === "MEDIUM" || cell === "LOW" || cell === "INFO";
                        let badgeCls = "";
                        if (cell === "CRITICAL") badgeCls = "bg-red-500/10 text-red-400 border border-red-500/25";
                        if (cell === "HIGH") badgeCls = "bg-orange-500/10 text-orange-400 border border-orange-500/25";
                        if (cell === "MEDIUM") badgeCls = "bg-yellow-500/10 text-yellow-400 border border-yellow-500/25";
                        if (cell === "LOW") badgeCls = "bg-blue-500/10 text-blue-400 border border-blue-500/25";
                        if (cell === "INFO") badgeCls = "bg-gray-500/10 text-gray-400 border border-white/10";
                        
                        return (
                          <td key={ci} className="px-4 py-3 text-gray-400 font-normal">
                            {isSeverity ? (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeCls}`}>{cell}</span>
                            ) : (
                              cell.replace(/\*\*(.*?)\*\*/g, '$1')
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          inTable = false;
          tableHeaders = [];
          tableRows = [];
        }
      }

      if (trimmed.startsWith("# ")) {
        const titleText = trimmed.replace("# ", "");
        renderedElements.push(
          <h2 key={idx} className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans mt-8 mb-4 border-b border-white/5 pb-2 text-left uppercase flex justify-between items-center group/heading">
            <span>{titleText}</span>
            {regeneratingSection === null ? (
              <button 
                onClick={() => handleRegenerateSectionClick(titleText)}
                className="opacity-0 group-hover/heading:opacity-100 transition-opacity text-[9px] font-mono font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded-full"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Regenerate
              </button>
            ) : (
              <span className="text-[9px] font-mono text-gray-500 flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Regenerating...
              </span>
            )}
          </h2>
        );
      }
      else if (trimmed.startsWith("## ")) {
        renderedElements.push(
          <h3 key={idx} className="text-sm sm:text-base font-semibold tracking-tight text-gray-200 font-sans mt-6 mb-3 text-left">
            {trimmed.replace("## ", "")}
          </h3>
        );
      }
      else if (trimmed.startsWith("### ")) {
        renderedElements.push(
          <h4 key={idx} className="text-xs sm:text-sm font-semibold text-gray-300 font-sans mt-4 mb-2 text-left">
            {trimmed.replace("### ", "")}
          </h4>
        );
      }
      else if (trimmed.startsWith("- [ ] ")) {
        renderedElements.push(
          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-400 my-1.5 text-left font-normal">
            <input type="checkbox" checked={false} readOnly className="mt-1 rounded bg-[#0a0b10] border-white/10 text-blue-500 focus:ring-0 focus:ring-offset-0 pointer-events-none" />
            <span>{trimmed.replace("- [ ] ", "")}</span>
          </div>
        );
      }
      else if (trimmed.startsWith("- [x] ")) {
        renderedElements.push(
          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300 my-1.5 text-left font-normal line-through opacity-70">
            <input type="checkbox" checked={true} readOnly className="mt-1 rounded bg-blue-500 border-blue-500 text-white focus:ring-0 focus:ring-offset-0 pointer-events-none" />
            <span>{trimmed.replace("- [x] ", "")}</span>
          </div>
        );
      }
      else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        renderedElements.push(
          <li key={idx} className="text-xs sm:text-sm text-gray-400 my-1.5 text-left pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500 font-normal leading-relaxed list-none">
            {trimmed.substring(2).replace(/\*\*(.*?)\*\*/g, '$1')}
          </li>
        );
      }
      else if (trimmed === "") {
        return;
      }
      else {
        renderedElements.push(
          <p key={idx} className="text-xs sm:text-sm text-gray-400 leading-relaxed my-3 text-left font-normal">
            {trimmed.split(" ").map((word, wi) => {
              if (word.startsWith("`") && word.endsWith("`")) {
                return <code key={wi} className="bg-white/[0.04] text-blue-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-white/5 mr-1">{word.replace(/`/g, "")}</code>;
              }
              if (word.startsWith("**") && word.endsWith("**")) {
                return <strong key={wi} className="text-white font-semibold mr-1">{word.replace(/\*\*/g, "")}</strong>;
              }
              return word + " ";
            })}
          </p>
        );
      }
    });

    return <div className="space-y-1 font-sans">{renderedElements}</div>;
  };

  const getStatsElements = (report: any) => {
    const stats = report.statistics || {};
    if (report.report_type === "contract") {
      return (
        <div className="space-y-3">
          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Contract Name</span><span className="text-white font-mono">{stats.contract_name || "N/A"}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Lines of Code</span><span className="text-white font-mono">{stats.lines_of_code || 0}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Vulnerabilities</span><span className="text-red-400 font-mono font-bold">{stats.findings_total || 0} flagged</span></div>
        </div>
      );
    } else if (report.report_type === "wallet") {
      return (
        <div className="space-y-3">
          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">USD Valuation</span><span className="text-emerald-400 font-mono font-bold">${(stats.balance_usd || 0).toLocaleString()}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Token Count</span><span className="text-white font-mono">{stats.token_count || 0}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Tx Count</span><span className="text-white font-mono">{stats.tx_count || 0}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Token Approvals</span><span className="text-amber-400 font-mono">{stats.active_approvals || 0} active</span></div>
        </div>
      );
    } else if (report.report_type === "transaction") {
      return (
        <div className="space-y-3">
          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Gas Limit Consumed</span><span className="text-white font-mono">{(stats.gas_used || 0).toLocaleString()} units</span></div>
          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Gas Cost (USD)</span><span className="text-white font-mono">${(stats.gas_cost_usd || 0).toFixed(4)}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Simulation Status</span><span className={stats.success ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{stats.success ? "SUCCESS" : "REVERTED"}</span></div>
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Associated Entities</span><span className="text-white font-mono">{stats.associated_entities_count || 0} matches</span></div>
          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Relationships Traced</span><span className="text-white font-mono">{stats.relationships_count || 0} nodes</span></div>
          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">MITRE Techniques</span><span className="text-amber-400 font-mono">{stats.mitre_techniques_count || 0} identified</span></div>
        </div>
      );
    }
  };

  const getReportIcon = (type: string) => {
    if (type === "contract") return <ShieldCheck className="w-5 h-5 text-blue-400" />;
    if (type === "wallet") return <Wallet className="w-5 h-5 text-amber-400" />;
    if (type === "transaction") return <Activity className="w-5 h-5 text-emerald-400" />;
    return <AlertTriangle className="w-5 h-5 text-red-400" />;
  };

  const sameTypeHistory = history.filter(r => r.report_type === activeTab);

  return (
    <div className="relative z-10 w-full min-h-[600px] flex flex-col font-sans">
      
      {/* Copied & shared notifications */}
      <AnimatePresence>
        {(copiedNotification || shareNotification) && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#0f111a]/90 border border-blue-500/20 px-6 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono text-gray-200">
              {copiedNotification || "Audit workspace URL shared to clipboard!"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP SECTION: Glass control panel */}
      <div className="w-full bg-white/[0.01] border border-white/[0.04] rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between text-left mb-8">
        <div className="w-full md:flex-1 flex flex-col gap-1.5">
          <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-mono">Address or Target Indicator</label>
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder={
                activeTab === "contract" ? "Enter solidity smart contract address (e.g. 0x...)" :
                activeTab === "wallet" ? "Enter wallet address (EVM, Solana, Sui)..." :
                activeTab === "transaction" ? "Enter transaction hash (EVM, Solana)..." :
                "Enter indicator of compromise (e.g. CVE-2024-3400, hash, domain)..."
              }
              className="w-full bg-[#050608] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto items-end">
          <div className="flex flex-col gap-1.5 flex-1 md:flex-none">
            <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-mono">Ecosystem</label>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="bg-[#050608] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
            >
              <option value="ethereum">Ethereum</option>
              <option value="solana">Solana</option>
              <option value="sui">Sui</option>
              <option value="aptos">Aptos</option>
              <option value="bitcoin">Bitcoin</option>
              <option value="tron">Tron</option>
            </select>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={!targetInput.trim() || generating}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
              generating
                ? "bg-blue-500/10 border border-blue-500/20 text-blue-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white border border-blue-500"
            }`}
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4" /> Run Auditor
              </>
            )}
          </button>
        </div>
      </div>

      {/* HORIZONTAL SELECTOR TABS: Notion style */}
      <div className="flex border-b border-white/5 mb-8 overflow-x-auto gap-2 sm:gap-4 no-scrollbar">
        {[
          { id: "contract", label: "Contract Report", icon: ShieldCheck },
          { id: "wallet", label: "Wallet Report", icon: Wallet },
          { id: "transaction", label: "Transaction Report", icon: Activity },
          { id: "threat", label: "Threat Report", icon: AlertTriangle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!generating) {
                  setActiveTab(tab.id as any);
                  setActiveReport(null);
                }
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "border-blue-500 text-white font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-blue-500" : "text-gray-500"}`} />
              {tab.label}
            </button>
          );
        })}

        <button
          onClick={() => {
            if (sameTypeHistory.length >= 2) {
              setCompareMode(true);
            } else {
              setCopiedNotification("Generate at least 2 reports of this type to compare!");
              setTimeout(() => setCopiedNotification(null), 3000);
            }
          }}
          className="ml-auto flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/10 hover:border-blue-500/20 bg-blue-500/5 px-3 py-1.5 rounded-lg mb-2.5 transition-all cursor-pointer"
        >
          <Network className="w-3.5 h-3.5" /> Compare Audits ({sameTypeHistory.length})
        </button>
      </div>

      {/* LAYOUT CONTAINER: Split screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CENTER REPORT VIEWER CONTAINER */}
        <div className="lg:col-span-8 flex flex-col gap-6 w-full min-h-[400px]">
          
          {generating ? (
            /* Progress state bar and monospace log streams */
            <div className="bg-white/[0.01] border border-white/[0.04] rounded-3xl p-6 backdrop-blur-md shadow-2xl flex flex-col gap-6 text-left animate-pulse">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-mono text-blue-400 font-semibold uppercase">
                  <span>Auditing pipeline running</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="border border-white/5 rounded-2xl p-4 bg-black/40 font-mono text-[11px] text-gray-500 flex flex-col gap-2 leading-relaxed min-h-[160px] max-h-[220px] overflow-y-auto">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-1">Diagnostic Compiler output log</span>
                {logLines.map((line, li) => (
                  <span key={li} className="text-left">{line}</span>
                ))}
              </div>
            </div>
          ) : activeReport ? (
            /* Report content presentation: Notion × Apple */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6 text-left"
            >
              {/* Header Title block */}
              <div className="bg-white/[0.01] border border-white/[0.04] rounded-3xl p-6 backdrop-blur-md shadow-2xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-inner">
                  {getReportIcon(activeReport.report_type)}
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                    {activeReport.report_type === "contract" && `Smart Contract Audit: ${activeReport.statistics.contract_name || "Codebase"}`}
                    {activeReport.report_type === "wallet" && `Wallet Behavior Forensics`}
                    {activeReport.report_type === "transaction" && `Transaction Trace Simulation`}
                    {activeReport.report_type === "threat" && `Multi-Chain Threat Correlation`}
                  </h2>
                  <span className="text-[11px] font-mono text-gray-500">
                    Target: <code className="text-blue-300 font-bold bg-white/[0.02] border border-white/5 px-1.5 py-0.5 rounded">{activeReport.target}</code> on {activeReport.chain.toUpperCase()} blockchain
                  </span>
                </div>
              </div>

              {/* Severity Counts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: "CRITICAL", val: activeReport.statistics.findings_critical ?? (activeReport.severity === "CRITICAL" ? 1 : 0), color: "text-red-400 border-red-500/20 bg-red-500/5 shadow-red-500/5" },
                  { name: "HIGH", val: activeReport.statistics.findings_high ?? (activeReport.severity === "HIGH" ? 1 : 0), color: "text-orange-400 border-orange-500/20 bg-orange-500/5 shadow-orange-500/5" },
                  { name: "MEDIUM", val: activeReport.statistics.findings_medium ?? (activeReport.severity === "MEDIUM" ? 1 : 0), color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5 shadow-yellow-500/5" },
                  { name: "LOW / INFO", val: activeReport.statistics.findings_low ?? (activeReport.severity === "LOW" || activeReport.severity === "INFO" ? 1 : 0), color: "text-blue-400 border-blue-500/20 bg-blue-500/5 shadow-blue-500/5" }
                ].map((s) => (
                  <div key={s.name} className={`border rounded-2xl p-4 flex flex-col gap-1.5 text-center shadow-lg backdrop-blur-sm ${s.color}`}>
                    <span className="text-[9px] font-bold tracking-widest uppercase font-mono opacity-80">{s.name}</span>
                    <span className="text-2xl font-bold tracking-tight">{s.val}</span>
                  </div>
                ))}
              </div>

              {/* Markdown Document Area */}
              <div className="bg-white/[0.01] border border-white/[0.04] rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col">
                {renderMarkdown(activeReport.markdown_content)}
              </div>
            </motion.div>
          ) : (
            /* Empty state Notion prompt card */
            <div className="bg-white/[0.01] border border-white/[0.04] rounded-3xl p-8 sm:p-12 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center mb-4">
                <Search className="w-5 h-5 text-gray-500" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Generate Telemetry Audit Report</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mt-1 mb-6 leading-relaxed">
                Provide an address or indicator tag above to compile data analysis records and verify vulnerability parameters.
              </p>
              
              <div className="w-full max-w-md grid gap-3.5 text-left border border-white/5 rounded-2xl p-4 bg-black/20">
                <span className="text-[9px] font-bold tracking-widest text-gray-500 uppercase font-mono">Sample indicators to test:</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span 
                    onClick={() => {
                      setTargetInput("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
                      setActiveTab("wallet");
                    }} 
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 cursor-pointer text-gray-400 hover:text-white transition-all font-mono"
                  >
                    vitalik.eth (Wallet)
                  </span>
                  <span 
                    onClick={() => {
                      setTargetInput("0x7a250d5630b4cf539739df2c5dacb4c659f2488d");
                      setActiveTab("contract");
                    }} 
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 cursor-pointer text-gray-400 hover:text-white transition-all font-mono"
                  >
                    UniswapV2 Router (Contract)
                  </span>
                  <span 
                    onClick={() => {
                      setTargetInput("CVE-2024-3400");
                      setActiveTab("threat");
                    }} 
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 cursor-pointer text-gray-400 hover:text-white transition-all font-mono"
                  >
                    CVE-2024-3400 (Threat)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR PANEL */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full text-left">
          
          {/* Risk and Confidence Score gauge card */}
          {activeReport && (
            <div className="bg-white/[0.01] border border-white/[0.04] rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col gap-6">
              
              {/* Risk Score circle */}
              <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-mono">Unified Risk Assessment</span>
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="54" className="stroke-white/[0.04]" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="54" 
                      className={
                        activeReport.risk_score > 75 ? "stroke-red-500" :
                        activeReport.risk_score > 45 ? "stroke-amber-500" :
                        "stroke-emerald-500"
                      }
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 54}
                      strokeDashoffset={2 * Math.PI * 54 * (1 - activeReport.risk_score / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center gap-0.5">
                    <span className="text-3xl font-extrabold tracking-tight text-white">{activeReport.risk_score}</span>
                    <span className="text-[8px] font-bold font-mono tracking-widest text-gray-500 uppercase">SCORE</span>
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono uppercase px-3 py-1 rounded-full ${
                  activeReport.risk_score > 75 ? "bg-red-500/10 text-red-400 border border-red-500/25" :
                  activeReport.risk_score > 45 ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" :
                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                }`}>
                  {activeReport.severity} RISK LEVEL
                </span>
              </div>

              {/* Confidence rating progress bar */}
              <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase font-mono">
                  <span>Confidence Rating</span>
                  <span className="text-white">{activeReport.confidence_score}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" style={{ width: `${activeReport.confidence_score}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Key Statistics list */}
          {activeReport && (
            <div className="bg-white/[0.01] border border-white/[0.04] rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col gap-4">
              <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase font-mono">Telemetry Statistics</span>
              {getStatsElements(activeReport)}
            </div>
          )}

          {/* Export & share action buttons */}
          {activeReport && (
            <div className="bg-white/[0.01] border border-white/[0.04] rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase font-mono mb-1">Actions & Exports</span>
              <button
                onClick={() => handleExportPDF(activeReport)}
                className="w-full py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/15 transition-all text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" /> Export PDF Audit Report
              </button>
              <button
                onClick={() => handleCopyMarkdown(activeReport)}
                className="w-full py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/15 transition-all text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" /> Copy Markdown Report
              </button>
              <button
                onClick={() => handleExportJSON(activeReport)}
                className="w-full py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/15 transition-all text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Export JSON telemetry
              </button>
              <button
                onClick={() => handleShareReport(activeReport)}
                className="w-full py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/15 transition-all text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-teal-400" /> Copy Shareable URL
              </button>
            </div>
          )}

          {/* Audit History log list */}
          <div className="bg-white/[0.01] border border-white/[0.04] rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col gap-4">
            <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase font-mono">Workspace Audits History</span>
            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    if (!generating) {
                      setActiveReport(h);
                      setActiveTab(h.report_type);
                      setSelectedChain(h.chain);
                      setTargetInput(h.target);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                    activeReport?.id === h.id
                      ? "border-blue-500 bg-blue-500/5 shadow-inner"
                      : "border-white/5 bg-white/[0.01] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold font-mono tracking-widest text-gray-400 uppercase flex items-center gap-1">
                      {h.report_type.substring(0, 4)} • {h.chain.substring(0, 3)}
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      h.severity === "CRITICAL" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      h.severity === "HIGH" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                      h.severity === "MEDIUM" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                      "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}>
                      {h.risk_score}
                    </span>
                  </div>
                  <span className="text-xs text-white truncate font-mono">{h.target}</span>
                  <span className="text-[9px] text-gray-600 font-mono">{new Date(h.created_at).toLocaleDateString()}</span>
                </div>
              ))}
              {history.length === 0 && (
                <span className="text-xs text-gray-600 font-mono">No audits saved in database.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REPORT COMPARISON SIDE-BY-SIDE TOOL MODAL OVERLAY */}
      {compareMode && (
        <div className="fixed inset-0 z-50 bg-[#050608]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c0d15] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-y-auto flex flex-col p-6 sm:p-8 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <h2 className="text-xl font-bold tracking-tight text-white">Compare Auditing Telemetry</h2>
              <button 
                onClick={() => {
                  setCompareMode(false);
                  setCompareReportA(null);
                  setCompareReportB(null);
                }} 
                className="text-xs font-mono text-gray-500 hover:text-white border border-white/15 hover:border-white/30 bg-white/[0.02] px-3 py-1 rounded-lg cursor-pointer transition-colors"
              >
                Close Comparison
              </button>
            </div>

            {/* Select report dropdown inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-mono">Compare Audit Report A</label>
                <select
                  value={compareReportA?.id || ""}
                  onChange={(e) => {
                    const r = sameTypeHistory.find(x => x.id === e.target.value);
                    setCompareReportA(r || null);
                  }}
                  className="w-full bg-[#050608] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                >
                  <option value="">-- Select Report A --</option>
                  {sameTypeHistory.map(r => (
                    <option key={r.id} value={r.id}>
                      [{r.chain.toUpperCase()} - {r.risk_score}] {r.target.substring(0, 16)}... ({new Date(r.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-mono">Compare Audit Report B</label>
                <select
                  value={compareReportB?.id || ""}
                  onChange={(e) => {
                    const r = sameTypeHistory.find(x => x.id === e.target.value);
                    setCompareReportB(r || null);
                  }}
                  className="w-full bg-[#050608] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                >
                  <option value="">-- Select Report B --</option>
                  {sameTypeHistory.map(r => (
                    <option key={r.id} value={r.id}>
                      [{r.chain.toUpperCase()} - {r.risk_score}] {r.target.substring(0, 16)}... ({new Date(r.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Side by Side Matrix */}
            {compareReportA && compareReportB ? (
              <div className="flex flex-col gap-6 text-left">
                <div className="overflow-x-auto border border-white/5 rounded-2xl bg-white/[0.01]">
                  <table className="w-full border-collapse text-xs sm:text-sm text-gray-400">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02]">
                        <th className="px-4 py-3 font-semibold text-gray-300 font-mono uppercase tracking-wider text-[10px] w-1/4">Parameter</th>
                        <th className="px-4 py-3 font-semibold text-white font-mono uppercase tracking-wider text-[11px] w-3/8 border-l border-white/5">Report A details</th>
                        <th className="px-4 py-3 font-semibold text-white font-mono uppercase tracking-wider text-[11px] w-3/8 border-l border-white/5">Report B details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-normal">
                      <tr className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-bold text-gray-300">Target Address</td>
                        <td className="px-4 py-3 font-mono border-l border-white/5 select-all">{compareReportA.target}</td>
                        <td className="px-4 py-3 font-mono border-l border-white/5 select-all">{compareReportB.target}</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-bold text-gray-300">Ecosystem Network</td>
                        <td className="px-4 py-3 border-l border-white/5 uppercase font-mono">{compareReportA.chain}</td>
                        <td className="px-4 py-3 border-l border-white/5 uppercase font-mono">{compareReportB.chain}</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-bold text-gray-300">Risk Score comparison</td>
                        <td className="px-4 py-3 border-l border-white/5 flex items-center gap-2">
                          <span className="text-lg font-extrabold text-white">{compareReportA.risk_score}</span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            compareReportA.risk_score > 75 ? "bg-red-500/10 text-red-400 border border-red-500/25" :
                            compareReportA.risk_score > 45 ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" :
                            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                          }`}>
                            {compareReportA.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-l border-white/5">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-extrabold text-white">{compareReportB.risk_score}</span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              compareReportB.risk_score > 75 ? "bg-red-500/10 text-red-400 border border-red-500/25" :
                              compareReportB.risk_score > 45 ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" :
                              "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                            }`}>
                              {compareReportB.severity}
                            </span>
                            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                              compareReportB.risk_score - compareReportA.risk_score > 0 
                                ? "bg-red-500/10 text-red-400 border border-red-500/25"
                                : compareReportB.risk_score - compareReportA.risk_score === 0
                                ? "bg-gray-500/10 text-gray-400 border border-white/5"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                            }`}>
                              {compareReportB.risk_score - compareReportA.risk_score > 0 ? "+" : ""}
                              {compareReportB.risk_score - compareReportA.risk_score} score delta
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-bold text-gray-300">Confidence rating</td>
                        <td className="px-4 py-3 border-l border-white/5 font-mono">{compareReportA.confidence_score}%</td>
                        <td className="px-4 py-3 border-l border-white/5 font-mono">{compareReportB.confidence_score}%</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-bold text-gray-300">Key Statistics Metrics</td>
                        <td className="px-4 py-3 border-l border-white/5 leading-relaxed font-mono">
                          {Object.entries(compareReportA.statistics).map(([key, val]) => (
                            <div key={key} className="text-[10px] flex justify-between"><span className="text-gray-500">{key.replace(/_/g, " ")}:</span> <span className="text-white">{String(val)}</span></div>
                          ))}
                        </td>
                        <td className="px-4 py-3 border-l border-white/5 leading-relaxed font-mono">
                          {Object.entries(compareReportB.statistics).map(([key, val]) => (
                            <div key={key} className="text-[10px] flex justify-between"><span className="text-gray-500">{key.replace(/_/g, " ")}:</span> <span className="text-white">{String(val)}</span></div>
                          ))}
                        </td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-bold text-gray-300">Executive summary comparison</td>
                        <td className="px-4 py-3 border-l border-white/5 text-[11px] leading-relaxed text-gray-400 bg-white/[0.01] align-top">{compareReportA.executive_summary}</td>
                        <td className="px-4 py-3 border-l border-white/5 text-[11px] leading-relaxed text-gray-400 bg-white/[0.01] align-top">{compareReportB.executive_summary}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-white/10 rounded-2xl py-12 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-gray-500 font-mono">Select two audit reports from the dropdowns above to compare metrics side-by-side.</span>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};


const DocumentationHub = () => {
  const [activeSection, setActiveSection] = useState(0);

  const docsData = [
    {
      id: 'scanner',
      icon: '🤖',
      name: 'Smart Contract Analysis',
      tagline: 'Automated Heuristic AST Parsing & Security Telemetry',
      overview: 'Fetches verified smart contract source codes from Etherscan/BscScan, parses the files into Abstract Syntax Trees (ASTs), runs static heuristic pattern matching to find high-risk vulnerability footprints, and forwards logs to the LLM agent for contextual hazard reports.',
      logic: [
        { title: 'Connection & Retrieval', detail: 'Determines the active chain (e.g., Ethereum Mainnet, BNB Chain, Polygon) and executes a JSON-RPC / HTTP get-source-code query to the verified explorer database. If unverified, falls back to static template mock files.' },
        { title: 'Static Heuristic Ruleset', detail: 'Runs local regex patterns and AST checks mapping to known attack signatures: Reentrancy (external state calls before balance deductions), Delegatecall to user inputs, Unprotected Selfdestructs, and Timestamp manipulation hazards.' },
        { title: 'AI Audit Expansion', detail: 'Feeds code blocks into the AI investigator agent utilizing OpenAI/Gemini schemas to generate plain-english exploit scenarios, capabilities checklist, and mitigation recommendations.' }
      ],
      resources: [
        { source: 'Etherscan Developer API', purpose: 'Code retrieval via api.etherscan.io (getsourcecode)' },
        { source: 'BscScan API', purpose: 'Code retrieval via api.bscscan.com (getsourcecode)' },
        { source: 'SQLAlchemy Database', purpose: 'Persisting analysis history in the Scan database model' },
        { source: 'OpenRouter / Gemini LLM API', purpose: 'Generating explanatory intelligence reports' }
      ],
      params: [
        { name: 'address', type: 'string (0x...)', desc: 'The contract address to retrieve and analyze.' },
        { name: 'chain', type: '"eth" | "bsc" | "polygon"', desc: 'The target blockchain explorer endpoint identifier.' }
      ],
      apiDemo: {
        method: 'POST /api/analyze',
        request: `{
  "address": "0x791237154fc00A0b29d11F29fBdC420904f979cB",
  "chain": "bsc"
}`,
        response: `{
  "id": 42,
  "address": "0x791237154fc00A0b29d11F29fBdC420904f979cB",
  "chain": "bsc",
  "name": "VulnerableTokenPool",
  "securityScore": 48,
  "vulnerabilities": [
    { "severity": "HIGH", "type": "Reentrancy", "file": "TokenPool.sol" }
  ]
}`
      }
    },
    {
      id: 'wallet',
      icon: '👤',
      name: 'Wallet Intelligence',
      tagline: 'Behavioral Clustering & Tornado Cash Risk Profiling',
      overview: 'Queries active address ledger balances, token assets, transfer counts, contract interactions, and mixer histories to gauge behavioral risk profiles. Runs reputation classifiers to label addresses as low-risk, medium-risk, or high-risk.',
      logic: [
        { title: 'Balance & Token Enumeration', detail: 'Executes concurrent queries to check native ether/BNB holdings alongside ERC20 token balances using contract state readers.' },
        { title: 'Mixer Connection Auditor', detail: 'Traverses recent transaction paths to detect interaction nodes matching Tornado Cash routers, Railgun routers, or known darknet mixing contracts.' },
        { title: 'Behavioral Reputation Engine', detail: 'Calculates the frequency of flash loan utilization, interaction with unverified contracts, and account creation age to construct a profile rating.' }
      ],
      resources: [
        { source: 'Explorer Account API', purpose: 'Fetching account balance, transaction list, and ERC20 token transactions' },
        { source: 'BlockSpectra Threat Feeds', purpose: 'Comparing addresses against known hacker databases' }
      ],
      params: [
        { name: 'address', type: 'string (0x...)', desc: 'The wallet address to profile.' },
        { name: 'chain', type: '"eth" | "bsc" | "polygon"', desc: 'Blockchain network query scope.' }
      ],
      apiDemo: {
        method: 'POST /api/wallet-scan',
        request: `{
  "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
  "chain": "eth"
}`,
        response: `{
  "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
  "nativeBalance": "34.52 ETH",
  "mixerAssociation": false,
  "reputationScore": 96,
  "classification": "TRUSTED_EOA"
}`
      }
    },
    {
      id: 'simulator',
      icon: '⚙️',
      name: 'Transaction Simulation',
      tagline: 'Forked-State EVM Sandbox Pre-execution Analysis',
      overview: 'Preplays raw transaction calls on dynamic local blockchain forks, monitoring storage mutations, balance changes, internal call execution trees, and events without spending real gas or committing changes.',
      logic: [
        { title: 'Local Fork Creation', detail: 'Spins up an ephemeral, sandbox EVM fork of the target mainnet at the current block number.' },
        { title: 'State Mutation Interception', detail: 'Injects the transaction parameters (sender address, destination, calldata, gas, value) and captures all EVM state changes, balance changes, and storage slot changes.' },
        { title: 'Slippage & Frontrun Checks', detail: 'Validates execution outcomes for swap rate variance, honeypots (inability to sell token back), or high tax structures.' }
      ],
      resources: [
        { source: 'Tenderly / Hardhat Node', purpose: 'EVM sandbox execution environment' },
        { source: 'Anvil Local Node', purpose: 'Forked RPC RPC execution tracing' }
      ],
      params: [
        { name: 'from', type: 'string (0x...)', desc: 'The sender address initiating the call.' },
        { name: 'to', type: 'string (0x...)', desc: 'The target contract address.' },
        { name: 'calldata', type: 'string (hex)', desc: 'The raw ABI function call byte code.' },
        { name: 'value', type: 'string (wei)', desc: 'Native asset value attached.' }
      ],
      apiDemo: {
        method: 'POST /api/simulate',
        request: `{
  "from": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "to": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "calldata": "0xa9059cbb0000000000000000000000003b827e1f40d89855b85a371752e50523e1f4d8e800000000000000000000000000000000000000000000000000000003b9aca00",
  "chain": "eth"
}`,
        response: `{
  "success": true,
  "gasUsed": 52310,
  "balanceChanges": [
    { "address": "0x742d35Cc...", "token": "USDC", "delta": "-1000.0" },
    { "address": "0x3b827e1f...", "token": "USDC", "delta": "+1000.0" }
  ],
  "mutations": { "storageSlotsUpdated": 2 }
}`
      }
    },
    {
      id: 'reports',
      icon: '📄',
      name: 'Report Generator',
      tagline: 'Multi-Chain PDF Audit & Intelligence Summarization',
      overview: 'Aggregates smart contract AST heuristics, transaction simulations, threat indexes, and AI vulnerability analysis into styled PDF documents with structured layouts.',
      logic: [
        { title: 'Auditing Aggregation', detail: 'Gathers all scan telemetry from the database (contract vulnerabilities, capabilities, score components).' },
        { title: 'Markdown Template Interpolation', detail: 'Formats findings into structured Markdown layout pages comprising executive scorecards, attack path charts, and mitigations.' },
        { title: 'PDF Generator Flow', detail: 'Utilizes headless printing utilities to compile styling, layouts, and page breaks into a standard PDF format.' }
      ],
      resources: [
        { source: 'Chrome Headless / Print Engine', purpose: 'Compiling HTML layouts into vector PDFs' },
        { source: 'Local DB Templates', purpose: 'Populating findings matrices dynamically' }
      ],
      params: [
        { name: 'scanId', type: 'number', desc: 'The reference identifier of the completed smart contract analysis.' },
        { name: 'template', type: '"executive" | "detailed"', desc: 'The reporting detail level layout.' }
      ],
      apiDemo: {
        method: 'GET /api/reports/download?scanId=42',
        request: `// Download Request`,
        response: `// Binary PDF Stream Content`
      }
    },
    {
      id: 'decoder',
      icon: '🧠',
      name: 'Universal Decoder',
      tagline: 'Multi-Chain Raw Calldata & Bytecode Parameter Parsing',
      overview: 'Deconstructs raw calldata, transaction inputs, instruction logs, and bytecode payloads into structured arguments, matching selectors with signature registries to render readable logic trees.',
      logic: [
        { title: 'Selector Identification', detail: 'Extracts the first 4 bytes of calldata (the function selector hash) and queries signature directories.' },
        { title: 'Parameter Unpacking', detail: 'Decodes sequential 32-byte words mapping to function argument schemas (addresses, uint256s, arrays) via standard ABI specifications.' },
        { title: 'Dynamic Interface Generation', detail: 'Constructs human-readable logs summarizing exactly what function is called and what variables are passed.' }
      ],
      resources: [
        { source: '4Byte Directory API', purpose: 'Mapping 4-byte hex selectors to text function headers' },
        { source: 'Ethereum/Ethers ABI Spec', purpose: 'Standard decoding rules' }
      ],
      params: [
        { name: 'calldata', type: 'string (hex)', desc: 'The raw transaction calldata to decode.' },
        { name: 'abi', type: 'string (optional json)', desc: 'A custom ABI interface representation if available.' }
      ],
      apiDemo: {
        method: 'POST /api/decode',
        request: `{
  "calldata": "0xa9059cbb000000000000000000000000791237154fc00a0b29d11f29fbdc420904f979cb0000000000000000000000000000000000000000000000000de0b6b3a7640000"
}`,
        response: `{
  "selector": "0xa9059cbb",
  "signature": "transfer(address,uint256)",
  "decodedParams": [
    { "name": "to", "type": "address", "value": "0x791237154fc00a0b29d11f29fbdc420904f979cb" },
    { "name": "value", "type": "uint256", "value": "1000000000000000000 (1.0 token)" }
  ]
}`
      }
    },
    {
      id: 'events',
      icon: '📡',
      name: 'Event Intelligence',
      tagline: 'Real-Time Block Event Log Parsing & Upgrade Alerts',
      overview: 'Filters and structures blockchain log receipts emitted during transactions. Monitors upgrades, ownership transfers, liquidity adjustments, and large swaps dynamically.',
      logic: [
        { title: 'Log Topic Indexing', detail: 'Processes event topics (`topic0` is the signature hash of events like `Transfer(address,address,uint256)`).' },
        { title: 'Upgrade Proxy Detection', detail: 'Tracks `Upgraded` event signatures matching EIP-1967 Proxy storage slots to alert users of contract implementations switching.' },
        { title: 'Chronological Logs Stream', detail: 'Combines multiple log outputs into a timeline mapped to block index markers.' }
      ],
      resources: [
        { source: 'JSON-RPC Log Filters', purpose: 'Retrieving transaction receipts and log objects' },
        { source: 'ERC Standard Topics Library', purpose: 'Matching event topics with standard contracts' }
      ],
      params: [
        { name: 'txHash', type: 'string (0x...)', desc: 'The transaction hash to fetch logs for.' },
        { name: 'chain', type: '"eth" | "bsc" | "polygon"', desc: 'Blockchain target identifier.' }
      ],
      apiDemo: {
        method: 'POST /api/event-logs',
        request: `{
  "txHash": "0xe8165cf4...",
  "chain": "eth"
}`,
        response: `{
  "txHash": "0xe8165cf4...",
  "blockNumber": 18210344,
  "events": [
    {
      "name": "OwnershipTransferred",
      "params": {
        "previousOwner": "0x0000...",
        "newOwner": "0x79123715..."
      }
    }
  ]
}`
      }
    },
    {
      id: 'threats',
      icon: '🚨',
      name: 'Threat Intelligence',
      tagline: 'Hacker Campaign Database & IOC Threat Mapping',
      overview: 'Matches smart contracts and wallet signatures against active malicious campaigns, hacker-controlled funding addresses, known vulnerability databases, and CVEs.',
      logic: [
        { title: 'Hacker Address Cross-Match', detail: 'Matches addresses against active lists of exploiters (Lazarus, phishing gangs, smart contract drainage networks).' },
        { title: 'Indicators of Compromise (IOC)', detail: 'Monitors malicious domains, fake websites, or phishing interfaces linked to wallets.' },
        { title: 'Vulnerability Database Check', detail: 'Checks smart contracts for similarities with known hacks stored in security catalogs.' }
      ],
      resources: [
        { source: 'OpenCTI / MISP Feeds', purpose: 'Aggregating active indicator threat lists' },
        { source: 'BlockSpectra Threat DB', purpose: 'Caching malicious actors, wallets, and smart contract patterns' }
      ],
      params: [
        { name: 'target', type: 'string (address/url)', desc: 'The target token, wallet, or domain contract to cross-reference.' }
      ],
      apiDemo: {
        method: 'POST /api/threats/correlate',
        request: `{
  "target": "0x791237154fc00A0b29d11F29fBdC420904f979cB"
}`,
        response: `{
  "matchesFound": false,
  "actorAttribution": null,
  "threatIndicators": [],
  "confidenceIndex": 98
}`
      }
    },
    {
      id: 'risk',
      icon: '🏁',
      name: 'Risk Engine',
      tagline: 'Multi-Dimensional Score Aggregation & Telemetry Feed Scoring',
      overview: 'Calculates the overall security threat score of contract addresses, wallet behaviors, transactions, and bridge hops using dynamic telemetry subscore matrices.',
      logic: [
        { title: 'Subscore Weight Calibration', detail: 'Extracts numeric scores from contract analysis (e.g. Heuristics score), wallet reputation (Reputation score), and Threat logs matching.' },
        { title: 'Risk Aggregation Function', detail: 'Executes mathematical models applying severe hazard modifiers to the aggregate total, ensuring severe vulnerabilities immediately slash the safety score.' },
        { title: 'Trust Classification', detail: 'Maps final scores from 0-100 to ratings (Trusted, Neutral, Dangerous, High Risk).' }
      ],
      resources: [
        { source: 'BlockSpectra Ruleset Config', purpose: 'Loading numeric score weights dynamically' },
        { source: 'Database Audit Engine', purpose: 'Aggregating past runs metrics' }
      ],
      params: [
        { name: 'scanId', type: 'number', desc: 'The database scan ID representing target components.' }
      ],
      apiDemo: {
        method: 'POST /api/risk/evaluate',
        request: `{
  "scanId": 42
}`,
        response: `{
  "aggregateScore": 48,
  "rating": "DANGEROUS",
  "components": {
    "heuristicWeight": 40,
    "ownershipControlWeight": 20,
    "threatAssociationWeight": 0
  }
}`
      }
    },
    {
      id: 'bridges',
      icon: '💰',
      name: 'Bridge Intelligence',
      tagline: 'Cross-Chain Asset Flow gateways & Inflow/Outflow Monitor',
      overview: 'Monitors deposit and withdraw gateway portals on cross-chain bridging networks like LayerZero, Wormhole, Hop, and Across, detecting anomaly transactions or high transfer fees.',
      logic: [
        { title: 'Gateway Event Listening', detail: 'Traces smart contract lock/unlock or burn/mint logs on cross-chain gateway endpoints.' },
        { title: 'Bridging Topologies Mapping', detail: 'Links source chain burn logs with target chain release logs to trace bridge transactions.' },
        { title: 'Flow Anomaly Detection', detail: 'Triggers alerts for deviations in bridge transaction volumes or suspicious changes in lock-up ratios.' }
      ],
      resources: [
        { source: 'Wormhole/LayerZero APIs', purpose: 'Fetching message sequences' },
        { source: 'Cross-Chain Bridge Contracts', purpose: 'Monitoring gateway log activities' }
      ],
      params: [
        { name: 'address', type: 'string (0x...)', desc: 'The bridge router contract address to analyze.' },
        { name: 'chain', type: '"eth" | "bsc" | "polygon"', desc: 'Blockchain target scope.' }
      ],
      apiDemo: {
        method: 'POST /api/bridge/flow',
        request: `{
  "address": "0x3ee18b2214aff97000d974cf647e7c347e8fa585",
  "chain": "eth"
}`,
        response: `{
  "bridge": "Wormhole Portal",
  "tvl": "$1.24B",
  "inflow24h": "$12.4M",
  "outflow24h": "$9.8M",
  "status": "OPERATIONAL"
}`
      }
    },
    {
      id: 'investigator',
      icon: '💬',
      name: 'AI Investigator Copilot',
      tagline: 'Semantic Natural Language Blockchain Threat Assistant',
      overview: 'Provides a conversational assistant utilizing tool calling to fetch blockchain details, query database scans, explain bytecode patterns, and answer smart contract auditing prompts.',
      logic: [
        { title: 'Natural Language Processing', detail: 'Converts chat messages into semantic instructions.' },
        { title: 'Tool Calling Routing', detail: 'Routes request parameters into platform tools like contract analyzers, wallet checkers, or threat intelligence databases.' },
        { title: 'Report Layout Compiler', detail: 'Synthesizes return payloads into clean formatting blocks.' }
      ],
      resources: [
        { source: 'OpenAI / Anthropic Models', purpose: 'Semantic reasoning and response structuring' },
        { source: 'Core Tool Bindings', purpose: 'Connecting chat triggers to platform APIs' }
      ],
      params: [
        { name: 'message', type: 'string', desc: 'Natural language request text.' },
        { name: 'conversationId', type: 'string', desc: 'Session identifier to retain memory.' }
      ],
      apiDemo: {
        method: 'POST /api/chat',
        request: `{
  "message": "Scan contract 0x79123715... on bsc",
  "conversationId": "c3da0caf-ae39-4845-90c0-57460de46aa9"
}`,
        response: `{
  "reply": "I have executed the scan on VulnerableTokenPool. Key findings: 1 High risk reentrancy threat found in TokenPool.sol. Details...",
  "toolCalled": "analyze"
}`
      }
    },
    {
      id: 'graphs',
      icon: '🧬',
      name: 'Cross-Chain Attack Graphs',
      tagline: 'Topological Money Flow & Interactive Threat Map',
      overview: 'Renders interactive transaction flow maps, linking senders, intermediate mixers, contracts, and ultimate endpoints into visual node-link configurations.',
      logic: [
        { title: 'Multi-Hop Querying', detail: 'Fetches successive sender-recipient edges from transaction records to build link histories.' },
        { title: 'Node Classification', detail: 'Classifies addresses into categories (EOA, Smart Contract, Mixer, Bridge Gateway) to color-code elements.' },
        { title: 'Topological Layout', detail: 'Generates coordinates using React Flow models to display logical layout paths.' }
      ],
      resources: [
        { source: 'React Flow / ReactFlow Canvas', purpose: 'Rendering dynamic canvas paths' },
        { source: 'Graph API Data Endpoint', purpose: 'Fetching trace edges' }
      ],
      params: [
        { name: 'sourceAddress', type: 'string (0x...)', desc: 'The entry node address to map flows from.' },
        { name: 'depth', type: 'number (1-4)', desc: 'The quantity of transaction hops to trace.' }
      ],
      apiDemo: {
        method: 'POST /api/graphs/trace',
        request: `{
  "sourceAddress": "0x791237154fc00A0b29d11F29fBdC420904f979cB",
  "depth": 3
}`,
        response: `{
  "nodes": [
    { "id": "1", "type": "contract", "label": "VulnerableTokenPool" },
    { "id": "2", "type": "mixer", "label": "Tornado Cash Router" }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "label": "100 BNB" }
  ]
}`
      }
    }
  ];

  const activeDoc = docsData[activeSection];

  const [simulatedResponse, setSimulatedResponse] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    setSimulatedResponse(null);
  }, [activeSection]);

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimulatedResponse(activeDoc.apiDemo.response);
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
      {/* Left Sidebar: Navigation Tabs */}
      <div className="lg:col-span-4 flex flex-col gap-2 bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl h-fit">
        <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase font-mono px-3 mb-2 block text-left">
          Platform Engines & Subsystems
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
          {docsData.map((doc, idx) => (
            <button
              key={doc.id}
              onClick={() => setActiveSection(idx)}
              className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeSection === idx
                  ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-sm'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <span className="text-base sm:text-lg">{doc.icon}</span>
              <div className="flex flex-col min-w-0">
                <span className="truncate">{doc.name}</span>
                <span className="text-[9px] text-gray-500 font-normal truncate mt-0.5">{doc.id.toUpperCase()} SUB-SYSTEM</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Content Pane: Details */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Hero Section */}
        <div className="bg-white/[0.02] border border-white/[0.05] p-6 sm:p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-blue-500/5 filter blur-2xl" />
          
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-2xl">{activeDoc.icon}</span>
            <span className="text-[9px] font-bold font-mono tracking-widest text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
              {activeDoc.id.toUpperCase()}_ENGINE_V2
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white text-left">
            {activeDoc.name}
          </h2>
          <p className="text-xs text-blue-400/80 font-mono mt-1 text-left">
            {activeDoc.tagline}
          </p>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mt-4 text-left font-normal">
            {activeDoc.overview}
          </p>
        </div>

        {/* Core Logic Execution Timeline */}
        <div className="bg-white/[0.02] border border-white/[0.05] p-6 sm:p-8 rounded-2xl">
          <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase font-mono mb-6 text-left">
            ⚡ Execution Logic Pipeline
          </h3>
          <div className="flex flex-col gap-6 relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-[1px] bg-white/10" />
            {activeDoc.logic.map((step, idx) => (
              <div key={idx} className="flex gap-4 items-start relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#0a0b10] border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-gray-400 shrink-0">
                  {idx + 1}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs sm:text-sm font-semibold text-white">{step.title}</span>
                  <span className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mt-1 font-normal">{step.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources & Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resources */}
          <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl flex flex-col">
            <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase font-mono mb-4 text-left">
              📡 Telemetry & Data Resources
            </h3>
            <div className="flex flex-col gap-3 min-h-[160px]">
              {activeDoc.resources.map((res, idx) => (
                <div key={idx} className="flex flex-col text-left border-l-2 border-blue-500/30 pl-3">
                  <span className="text-xs font-semibold text-white">{res.source}</span>
                  <span className="text-[10px] text-gray-500 mt-0.5 font-normal">{res.purpose}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl flex flex-col">
            <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase font-mono mb-4 text-left">
              ⚙️ Input Parameter Specifications
            </h3>
            <div className="flex flex-col gap-3 min-h-[160px]">
              {activeDoc.params.map((param, idx) => (
                <div key={idx} className="flex flex-col text-left border-l-2 border-emerald-500/30 pl-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-emerald-400">{param.name}</span>
                    <span className="text-[9px] text-gray-500 font-mono">({param.type})</span>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-0.5 font-normal">{param.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive API Simulation Sandbox */}
        <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl flex flex-col text-left">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div className="flex flex-col">
              <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase font-mono">
                🧪 Interactive API Sandbox
              </h3>
              <span className="text-[10px] text-gray-500">Test live simulated payloads directly in your viewport</span>
            </div>
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide shadow-md transition-all cursor-pointer ${
                isSimulating
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isSimulating ? 'Simulating Call...' : 'Simulate API Call'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Request Block */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#0c0d13] border border-white/5 rounded-t-xl text-[10px] font-mono">
                <span className="text-gray-500">REQUEST PAYLOAD</span>
                <span className="text-blue-400 font-semibold">{activeDoc.apiDemo.method}</span>
              </div>
              <pre className="m-0 p-4 bg-[#0a0b10] border border-t-0 border-white/5 rounded-b-xl text-[10px] sm:text-xs font-mono text-gray-300 overflow-x-auto select-all max-h-[160px] scrollbar-thin">
                {activeDoc.apiDemo.request}
              </pre>
            </div>

            {/* Response Block */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#0c0d13] border border-white/5 rounded-t-xl text-[10px] font-mono">
                <span className="text-gray-500">RESPONSE PAYLOAD</span>
                <span className="text-emerald-400 font-semibold">200 OK</span>
              </div>
              <pre className="m-0 p-4 bg-[#0a0b10] border border-t-0 border-white/5 rounded-b-xl text-[10px] sm:text-xs font-mono text-emerald-400 overflow-x-auto max-h-[160px] scrollbar-thin flex items-center justify-start min-h-[160px] relative">
                {isSimulating ? (
                  <div className="absolute inset-0 bg-[#0a0b10]/95 flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-200" />
                  </div>
                ) : null}
                {simulatedResponse || `// Click "Simulate API Call" to execute the request pipeline.`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



function App() {
  const { t, currentLang, setLang, supportedLanguages } = useTranslation();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'scanner' | 'wallet' | 'graphs' | 'simulator' | 'decoder' | 'events' | 'threats' | 'risk' | 'bridges' | 'investigator' | 'reports' | 'docs'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic SEO optimization hook
  useEffect(() => {
    let title = 'BlockSpectra - Smart Contract Investigation & Blockchain Intelligence';
    let description = 'Investigate smart contracts with clarity, confidence, and precision. Uncover risks, trace behavior, and secure Web3 with BlockSpectra.';

    switch (currentPage) {
      case 'scanner':
        title = 'Smart Contract Vulnerability Scanner & Analyzer | BlockSpectra';
        description = 'Analyze Solidity and smart contract code in real-time. Detect reentrancy, overflow, access control flaws, and security exploits.';
        break;
      case 'wallet':
        title = 'Wallet Tracking & Behavioral Intelligence | BlockSpectra';
        description = 'Audit wallet transactions, trace token flows, detect wash trading, and identify whale patterns across 11+ blockchain networks.';
        break;
      case 'graphs':
        title = 'Cross-Chain Attack Graphs & Telemetry | BlockSpectra';
        description = 'Visualize complex hack transactions and trace exploit patterns across multi-chain ecosystems using relational attack graphs.';
        break;
      case 'simulator':
        title = 'EVM Transaction Simulator & Sandbox | BlockSpectra';
        description = 'Simulate transaction executions in a safe sandbox before mainnet deployment. View exact state overrides, log emissions, and gas metrics.';
        break;
      case 'decoder':
        title = 'Universal Calldata & Event Log Decoder | BlockSpectra';
        description = 'Decode raw hexadecimal blockchain transaction payloads and event logs into structured parameters and human-readable fields.';
        break;
      case 'events':
        title = 'Multi-Chain Event Intelligence Node | BlockSpectra';
        description = 'Monitor smart contract event logs and trace block telemetry signatures across multiple networks in real-time.';
        break;
      case 'threats':
        title = 'Real-Time Threat Intelligence & Telemetry | BlockSpectra';
        description = 'Access active smart contract vulnerability vectors and telemetry feeds directly from BlockSpectra security scanners.';
        break;
      case 'risk':
        title = 'Centralized DeFi Risk Scoring Node | BlockSpectra';
        description = 'Assess decentralized finance smart contract hazard levels, proxy controls, audit logs, and trust score metrics.';
        break;
      case 'bridges':
        title = 'Cross-Chain Bridge Analytics & Health | BlockSpectra';
        description = 'Audit cross-chain token bridge contracts, liquidity flows, mint/burn operations, and transaction latency logs.';
        break;
      case 'investigator':
        title = 'Conversational Threat Investigator (AI Copilot) | BlockSpectra';
        description = 'Investigate potential smart contract security breaches and ask natural language questions using AI-powered copilot model.';
        break;
      case 'reports':
        title = 'AI Smart Contract Audit Report Generator | BlockSpectra';
        description = 'Generate publication-grade smart contract audit reports and PDF diagnostics matching professional web3 security standards.';
        break;
      case 'docs':
        title = 'Documentation Hub & Technical API Sandbox | BlockSpectra';
        description = 'Read technical specs, parameters list, logic execution workflows, data resources, and run requests inside the live API sandbox.';
        break;
      default:
        title = 'BlockSpectra - Smart Contract Investigation & Blockchain Intelligence';
        description = 'Investigate smart contracts with clarity, confidence, and precision. Uncover risks, trace behavior, and secure Web3 with BlockSpectra.';
        break;
    }

    // Update document title
    document.title = title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update OpenGraph titles & descriptions
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description);

    // Update Twitter titles & descriptions
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', title);
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', description);

  }, [currentPage]);

  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash || '';
      const hash = rawHash.split('?')[0].toLowerCase();
      if (
        hash === "#scanner" ||
        hash === "#smart-contract-analysis" ||
        hash === "#/scanner" ||
        hash === "#/smart-contract-analysis"
      ) {
        setCurrentPage('scanner');
        window.scrollTo(0, 0);
      } else if (
        hash === "#wallet" ||
        hash === "#wallet-intelligence" ||
        hash === "#/wallet" ||
        hash === "#/wallet-intelligence"
      ) {
        setCurrentPage('wallet');
        window.scrollTo(0, 0);
      } else if (
        hash === "#graphs" ||
        hash === "#attack-graphs" ||
        hash === "#/graphs" ||
        hash === "#/attack-graphs"
      ) {
        setCurrentPage('graphs');
        window.scrollTo(0, 0);
      } else if (
        hash === "#simulator" ||
        hash === "#transaction-simulation" ||
        hash === "#transaction-simulator" ||
        hash === "#/simulator" ||
        hash === "#/transaction-simulation" ||
        hash === "#/transaction-simulator"
      ) {
        setCurrentPage('simulator');
        window.scrollTo(0, 0);
      } else if (
        hash === "#decoder" ||
        hash === "#universal-decoder" ||
        hash === "#/decoder" ||
        hash === "#/universal-decoder"
      ) {
        setCurrentPage('decoder');
        window.scrollTo(0, 0);
      } else if (
        hash === "#event-intelligence" ||
        hash === "#events" ||
        hash === "#/event-intelligence" ||
        hash === "#/events"
      ) {
        setCurrentPage('events');
        window.scrollTo(0, 0);
      } else if (
        hash === "#threat-intelligence" ||
        hash === "#threats" ||
        hash === "#/threat-intelligence" ||
        hash === "#/threats"
      ) {
        setCurrentPage('threats');
        window.scrollTo(0, 0);
      } else if (
        hash === "#risk-engine" ||
        hash === "#risk" ||
        hash === "#/risk-engine" ||
        hash === "#/risk"
      ) {
        setCurrentPage('risk');
        window.scrollTo(0, 0);
      } else if (
        hash === "#bridge-intelligence" ||
        hash === "#bridges" ||
        hash === "#/bridge-intelligence" ||
        hash === "#/bridges"
      ) {
        setCurrentPage('bridges');
        window.scrollTo(0, 0);
      } else if (
        hash === "#ai-investigator" ||
        hash === "#investigator" ||
        hash === "#/ai-investigator" ||
        hash === "#/investigator"
      ) {
        setCurrentPage('investigator');
        window.scrollTo(0, 0);
      } else if (
        hash === "#report-generator" ||
        hash === "#reports" ||
        hash === "#/report-generator" ||
        hash === "#/reports"
      ) {
        setCurrentPage('reports');
        window.scrollTo(0, 0);
      } else if (
        hash === "#docs" ||
        hash === "#documentation" ||
        hash === "#documentation-hub" ||
        hash === "#/docs" ||
        hash === "#/documentation" ||
        hash === "#/documentation-hub"
      ) {
        setCurrentPage('docs');
        window.scrollTo(0, 0);
      } else {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isDarkPage = currentPage === 'scanner' || currentPage === 'wallet' || currentPage === 'graphs' || currentPage === 'simulator' || currentPage === 'decoder' || currentPage === 'events' || currentPage === 'threats' || currentPage === 'risk' || currentPage === 'bridges' || currentPage === 'investigator' || currentPage === 'reports' || currentPage === 'docs';

  const [activeDropdown, setActiveDropdown] = useState<'platform' | 'features' | null>(null);





  // Active feature item state for Section 5
  const [activeFeature, setActiveFeature] = useState<number>(0);
  const [hoverPaused, setHoverPaused] = useState<boolean>(false);

  // Auto cycle features for Section 5
  useEffect(() => {
    if (hoverPaused) return;
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(interval);
  }, [hoverPaused]);

  // 3D Mouse Tilt parameters for Section 5 dashboard
  const tiltRef = useRef<HTMLDivElement>(null);
  const mouseXMotion = useMotionValue(0);
  const mouseYMotion = useMotionValue(0);

  // Map mouse positions [-0.5, 0.5] to tilt rotations
  const rotateX = useSpring(useTransform(mouseYMotion, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useTransform(mouseXMotion, [-0.5, 0.5], [-12, 12]), { stiffness: 120, damping: 20 });

  // Map mouse positions to card translation offset values (for holographic parallax depth)
  const card1X = useSpring(useTransform(mouseXMotion, [-0.5, 0.5], [-15, 15]), { stiffness: 100, damping: 22 });
  const card1Y = useSpring(useTransform(mouseYMotion, [-0.5, 0.5], [-15, 15]), { stiffness: 100, damping: 22 });

  const card2X = useSpring(useTransform(mouseXMotion, [-0.5, 0.5], [20, -20]), { stiffness: 100, damping: 22 });
  const card2Y = useSpring(useTransform(mouseYMotion, [-0.5, 0.5], [20, -20]), { stiffness: 100, damping: 22 });

  const card3X = useSpring(useTransform(mouseXMotion, [-0.5, 0.5], [-25, 25]), { stiffness: 100, damping: 22 });
  const card3Y = useSpring(useTransform(mouseYMotion, [-0.5, 0.5], [-25, 25]), { stiffness: 100, damping: 22 });

  const card4X = useSpring(useTransform(mouseXMotion, [-0.5, 0.5], [12, -12]), { stiffness: 100, damping: 22 });
  const card4Y = useSpring(useTransform(mouseYMotion, [-0.5, 0.5], [12, -12]), { stiffness: 100, damping: 22 });

  const card5X = useSpring(useTransform(mouseXMotion, [-0.5, 0.5], [-30, 30]), { stiffness: 100, damping: 22 });
  const card5Y = useSpring(useTransform(mouseYMotion, [-0.5, 0.5], [-30, 30]), { stiffness: 100, damping: 22 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltRef.current) return;
    const rect = tiltRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    // Calculate raw mouse coordinates relative to card center, scaled to [-0.5, 0.5]
    const currentMouseX = (event.clientX - rect.left) / width - 0.5;
    const currentMouseY = (event.clientY - rect.top) / height - 0.5;
    mouseXMotion.set(currentMouseX);
    mouseYMotion.set(currentMouseY);
  };

  const handleMouseLeave = () => {
    mouseXMotion.set(0);
    mouseYMotion.set(0);
  };

  // Active showcase tab for Section 7
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<number>(0);

  // Active step for Section 8 How It Works
  const [activeStep, setActiveStep] = useState<number>(0);
  const [stepHoverPaused, setStepHoverPaused] = useState<boolean>(false);

  // Auto cycle steps for Section 8
  useEffect(() => {
    if (stepHoverPaused) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(interval);
  }, [stepHoverPaused]);

  // Active pipeline stage for Section 10
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);
  const [pipelineHoverPaused, setPipelineHoverPaused] = useState<boolean>(false);

  // Auto cycle pipeline steps for Section 10
  useEffect(() => {
    if (pipelineHoverPaused) return;
    const interval = setInterval(() => {
      setActivePipelineStep((prev) => (prev + 1) % 6);
    }, 3800);
    return () => clearInterval(interval);
  }, [pipelineHoverPaused]);

  // 3D Mouse Tilt parameters for Section 7 dashboard
  const tiltRefShowcase = useRef<HTMLDivElement>(null);
  const mouseXShowcase = useMotionValue(0);
  const mouseYShowcase = useMotionValue(0);

  // Map mouse positions [-0.5, 0.5] to tilt rotations
  const rotateXShowcase = useSpring(useTransform(mouseYShowcase, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 22 });
  const rotateYShowcase = useSpring(useTransform(mouseXShowcase, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 22 });

  // Parallax offsets for accessory panels
  const cardShowcase1X = useSpring(useTransform(mouseXShowcase, [-0.5, 0.5], [-12, 12]), { stiffness: 100, damping: 24 });
  const cardShowcase1Y = useSpring(useTransform(mouseYShowcase, [-0.5, 0.5], [-12, 12]), { stiffness: 100, damping: 24 });

  const cardShowcase2X = useSpring(useTransform(mouseXShowcase, [-0.5, 0.5], [15, -15]), { stiffness: 100, damping: 24 });
  const cardShowcase2Y = useSpring(useTransform(mouseYShowcase, [-0.5, 0.5], [15, -15]), { stiffness: 100, damping: 24 });

  const cardShowcase3X = useSpring(useTransform(mouseXShowcase, [-0.5, 0.5], [-20, 20]), { stiffness: 100, damping: 24 });
  const cardShowcase3Y = useSpring(useTransform(mouseYShowcase, [-0.5, 0.5], [-20, 20]), { stiffness: 100, damping: 24 });

  const handleMouseMoveShowcase = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltRefShowcase.current) return;
    const rect = tiltRefShowcase.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const currentMouseX = (event.clientX - rect.left) / width - 0.5;
    const currentMouseY = (event.clientY - rect.top) / height - 0.5;
    mouseXShowcase.set(currentMouseX);
    mouseYShowcase.set(currentMouseY);
  };

  const handleMouseLeaveShowcase = () => {
    mouseXShowcase.set(0);
    mouseYShowcase.set(0);
  };

  return (
    <div className={`relative min-h-screen scroll-smooth overflow-x-hidden ${isDarkPage ? 'bg-[#07080a]' : 'bg-[#f0f0ee]'}`}>
      
      {/* Click-away backdrop overlay to dismiss active dropdowns */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* Floating Navbar */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6">
        <div className={`max-w-5xl mx-auto w-full border rounded-2xl px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-300 ${
          isDarkPage
            ? 'bg-[#0a0b10]/80 border-white/[0.08] backdrop-blur-md text-white shadow-black/40 shadow-md'
            : 'bg-white border-gray-200 text-gray-900 shadow-md'
        }`}>
          
          {/* Desktop Version: Logo, Navigation, Actions */}
          {/* Left side: Logo & Wordmark */}
          <a
            href="#"
            className="flex items-center hover:opacity-90 transition-opacity"
          >
            <img src={isDarkPage ? Wlogo : Blogo} alt="BlockSpectra Logo" className="h-6 w-auto object-contain" />
          </a>

          {/* Center navigation items (Desktop) */}
          {/* 1. Large Screen Viewport: Core Links directly visible + Rest in sub-dropdown */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-6">
            <a
              href="#smart-contract-analysis"
              className={`text-[13px] font-semibold transition-colors cursor-pointer select-none ${
                isDarkPage ? 'text-gray-400 hover:text-white' : 'text-gray-800 hover:text-gray-950'
              }`}
            >
              {t('nav.contractScan', 'Smart Contract Analysis')}
            </a>
            
            <a
              href="#wallet-intelligence"
              className={`text-[13px] font-semibold transition-colors cursor-pointer select-none ${
                isDarkPage ? 'text-gray-400 hover:text-white' : 'text-gray-800 hover:text-gray-950'
              }`}
            >
              {t('nav.walletIntel', 'Wallet Intelligence')}
            </a>

            <a
              href="#transaction-simulator"
              className={`text-[13px] font-semibold transition-colors cursor-pointer select-none ${
                isDarkPage ? 'text-gray-400 hover:text-white' : 'text-gray-800 hover:text-gray-950'
              }`}
            >
              {t('nav.txSimulator', 'Transaction Simulator')}
            </a>

            <a
              href="#ai-investigator"
              className={`text-[13px] font-semibold transition-colors cursor-pointer select-none ${
                isDarkPage ? 'text-gray-400 hover:text-white' : 'text-gray-800 hover:text-gray-950'
              }`}
            >
              {t('nav.aiInvestigator', 'AI Investigator')}
            </a>

            {/* Platform Submenu (Remaining Items) */}
            <div
              className="relative py-2"
              onMouseEnter={() => setActiveDropdown('platform')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors focus:outline-none cursor-pointer select-none ${
                isDarkPage ? 'text-gray-400 hover:text-white' : 'text-gray-800 hover:text-gray-950'
              }`}>
                {t('nav.platform', 'Platform')}
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === 'platform'
                      ? 'rotate-180 ' + (isDarkPage ? 'text-white' : 'text-gray-900')
                      : 'text-gray-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {activeDropdown === 'platform' && (
                  <DropdownMenu items={platformDropdownItems} isDark={isDarkPage} onItemClick={() => setActiveDropdown(null)} />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 2. Tablet Viewport (md-to-lg): Consolidate all 10 links inside single dropdown to prevent menu wrapping */}
          <div className="hidden md:max-lg:flex items-center gap-6">
            <div
              className="relative py-2"
              onMouseEnter={() => setActiveDropdown('platform')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors focus:outline-none cursor-pointer select-none ${
                isDarkPage ? 'text-gray-400 hover:text-white' : 'text-gray-800 hover:text-gray-950'
              }`}>
                {t('nav.platform', 'Platform')}
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === 'platform'
                      ? 'rotate-180 ' + (isDarkPage ? 'text-white' : 'text-gray-900')
                      : 'text-gray-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {activeDropdown === 'platform' && (
                  <DropdownMenu items={platformItems} isDark={isDarkPage} onItemClick={() => setActiveDropdown(null)} />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side controls (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#docs"
              className={`flex items-center gap-1.5 text-[12px] sm:text-[13px] font-semibold transition-colors px-2 py-1 ${
                isDarkPage ? 'text-gray-400 hover:text-white' : 'text-gray-800 hover:text-gray-950'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              {t('nav.docs', 'Docs')}
            </a>

            {/* Language Selector Dropdown */}
            <div
              className="relative py-2"
              onMouseEnter={() => setLangDropdownOpen(true)}
              onMouseLeave={() => setLangDropdownOpen(false)}
            >
              <button className={`flex items-center gap-1 text-[12px] sm:text-[13px] font-semibold transition-colors px-2 py-1 focus:outline-none cursor-pointer select-none ${
                isDarkPage ? 'text-gray-400 hover:text-white' : 'text-gray-800 hover:text-gray-950'
              }`}>
                <span>🌐</span> {supportedLanguages.find(l => l.code === currentLang)?.nativeName || 'English'}
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${
                    langDropdownOpen
                      ? 'rotate-180 ' + (isDarkPage ? 'text-white' : 'text-gray-900')
                      : 'text-gray-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-2 w-72 rounded-2xl p-4 shadow-xl border backdrop-blur-md z-[100] ${
                      isDarkPage
                        ? 'bg-[#0f111a]/95 border-white/[0.08] text-white shadow-black/60 shadow-md'
                        : 'bg-white border-gray-200 text-gray-900 shadow-gray-200/50 shadow-md'
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto pr-1">
                      {supportedLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLang(lang.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`text-left text-xs px-2 py-1.5 rounded-lg font-medium transition-colors select-none cursor-pointer ${
                            currentLang === lang.code
                              ? 'bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20'
                              : isDarkPage
                                ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                          }`}
                        >
                          {lang.nativeName}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Mobile Floating Menu Button */}
      <div className="flex md:hidden fixed top-6 right-6 z-50">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg border backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          style={{
            backgroundColor: isDarkPage ? 'rgba(10, 11, 16, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDarkPage ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
            color: isDarkPage ? '#ffffff' : '#111827',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Fullscreen Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg text-white flex flex-col p-6 overflow-y-auto"
          >
            {/* Header: Logo & Close Button */}
            <div className="flex items-center justify-between w-full pb-6 border-b border-white/10">
              <img src={Wlogo} alt="BlockSpectra Logo" className="h-6 w-auto object-contain" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Sections */}
            <div className="flex flex-col gap-8 py-8">
              {/* Category 1: Security Engines */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase font-mono text-left">
                  {t('category.engines', 'Security Engines')}
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { name: 'Smart Contract Analysis', href: '#smart-contract-analysis' },
                    { name: 'Wallet Intelligence', href: '#wallet-intelligence' },
                    { name: 'Transaction Simulator', href: '#transaction-simulator' },
                    { name: 'Bridge Intelligence', href: '#bridge-intelligence' },
                    { name: 'Threat Intelligence', href: '#threat-intelligence' }
                  ].map((item) => {
                    const keys = getToolTranslationKeys(item.name);
                    const nameText = keys.name ? t(keys.name) : item.name;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] transition-all text-[13px] font-medium cursor-pointer"
                      >
                        {nameText}
                        <ArrowUpRight className="w-4 h-4 text-gray-500" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Category 2: Data & Threat Analysis */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase font-mono text-left">
                  {t('category.analysis', 'Data & Threat Analysis')}
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { name: 'Universal Decoder', href: '#universal-decoder' },
                    { name: 'Event Intelligence', href: '#event-intelligence' },
                    { name: 'Attack Graphs', href: '#attack-graphs' },
                    { name: 'Risk Engine', href: '#risk-engine' }
                  ].map((item) => {
                    const keys = getToolTranslationKeys(item.name);
                    const nameText = keys.name ? t(keys.name) : item.name;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] transition-all text-[13px] font-medium cursor-pointer"
                      >
                        {nameText}
                        <ArrowUpRight className="w-4 h-4 text-gray-500" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Category 3: Workspace & Reference */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase font-mono text-left">
                  {t('category.reference', 'Workspace & Reference')}
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { name: 'AI Investigator', href: '#ai-investigator' },
                    { name: 'Report Generator', href: '#report-generator' },
                    { name: 'Documentation Hub', href: '#documentation-hub' }
                  ].map((item) => {
                    const keys = getToolTranslationKeys(item.name);
                    const nameText = keys.name ? t(keys.name) : item.name;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] transition-all text-[13px] font-medium cursor-pointer"
                      >
                        {nameText}
                        <ArrowUpRight className="w-4 h-4 text-gray-500" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Language Selection */}
              <div className="flex flex-col gap-3 pb-6 border-t border-white/10 pt-6">
                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-mono text-left">
                  Language / भाषा / భాష
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLang(lang.code);
                        setMobileMenuOpen(false);
                      }}
                      className={`text-left text-xs px-3.5 py-2.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between ${
                        currentLang === lang.code
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 font-bold'
                          : 'bg-white/[0.02] border-white/[0.05] text-gray-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      {currentLang === lang.code && <span className="text-[10px]">●</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: currentPage === 'home' ? 'block' : 'none' }}>
          {/* Hero Viewport (restrict background video boundaries) */}
      <div className="p-4 sm:p-6 lg:p-8 bg-[#f0f0ee] w-full min-h-screen flex items-center justify-center">
        <div className="relative w-full h-[calc(100vh-32px)] sm:h-[calc(100vh-48px)] lg:h-[calc(100vh-64px)] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-black/10 bg-black">
          {/* Fullscreen Background Video */}
          <video
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={introVideo} type="video/mp4" />
          </video>

          {/* Dark overlay for contrast and legibility */}
          <div className="absolute inset-0 bg-black/45 z-0 pointer-events-none" />

          {/* Foreground Content Wrapper */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Hero Content (bottom-left aligned) */}
            <div className="flex-1 flex items-end pb-12 sm:pb-20 lg:pb-24 px-6 sm:px-12 md:px-20 lg:px-28">
              <div className="max-w-2xl">
                {/* 1. Badge link */}
                <div className="mb-4">
                   <a
                    href="#badge"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors group"
                  >
                    {t('hero.badge', 'AI-powered blockchain intelligence')}
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                      →
                    </span>
                  </a>
                </div>

                {/* 2. Headline */}
                <div className="mb-4">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.25] drop-shadow-md">
                    {t('hero.title', 'Investigate smart contracts with clarity, confidence, and precision.')}
                  </h1>
                </div>

                {/* 3. Subtext */}
                <div className="mb-6">
                  <p className="text-sm sm:text-base md:text-lg text-gray-200 font-normal leading-[1.85] drop-shadow-sm">
                    {t('hero.desc', 'Uncover risks, trace behavior, and secure Web3 with BlockSpectra.')}
                  </p>
                </div>

                {/* 4. CTA anchor */}
                <div>
                  <a
                    href="#smart-contract-analysis"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm md:text-base font-semibold text-white bg-blue-500 hover:bg-blue-600 border border-blue-500 rounded-full px-6 py-3.5 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 group cursor-pointer"
                  >
                    {t('hero.btnStart', 'Start analyzing contracts')}
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                      →
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Cinematic Problem Statement Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 md:px-20 lg:px-28 py-24 sm:py-32 lg:py-40 flex flex-col items-center justify-center text-center gap-14 sm:gap-20 overflow-hidden bg-[#f0f0ee]"
      >
        {/* Soft mesh gradients background decoration */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.03),transparent_60%)] filter blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.04),transparent_60%)] filter blur-3xl" />
        </div>

        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

        {/* Headings */}
        <motion.div variants={itemVariants} className="max-w-3xl flex flex-col items-center gap-4 z-10">
          <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem] leading-[1.15] font-semibold text-gray-900 tracking-tight">
            Modern blockchain threats demand deeper intelligence.
          </h2>
          <p className="text-[14px] sm:text-[16px] text-gray-500 max-w-xl font-normal leading-relaxed">
            Traditional scanners miss context, relationships, and behavioral patterns.
          </p>
        </motion.div>

        {/* Floating Glass Cards Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full z-10"
        >
          {problems.map((prob, idx) => (
            <motion.div
              key={idx}
              animate={floatAnimation(prob.delay)}
              whileHover={{
                scale: 1.03,
                boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.9)',
                y: -10,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-start text-left p-8 rounded-3xl bg-white/35 backdrop-blur-md border border-white/60 shadow-sm transition-all duration-300 relative overflow-hidden group min-h-[220px]"
            >
              {/* Inner card light sheen overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Card index indicator */}
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-4">
                Challenge 0{idx + 1}
              </span>
              
              <h3 className="text-base font-semibold text-gray-900 leading-snug tracking-tight mb-2">
                {t(`${prob.key}.title`, prob.title)}
              </h3>
              
              <p className="text-[12px] text-gray-500 font-normal leading-relaxed">
                {t(`${prob.key}.desc`, prob.desc)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Section 5 — Solution (Apple Keynote-inspired Split Section) */}
      <section className="relative z-20 w-full py-24 sm:py-32 md:py-40 bg-[#07080b] border-t border-white/[0.03] overflow-hidden">
        {/* Slowly shifting background gradients */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Indigo Radial Glow */}
          <motion.div
            animate={{
              x: [-40, 40, -40],
              y: [-30, 50, -30],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-10 left-10 w-[450px] h-[450px] md:w-[650px] md:h-[650px] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_60%)] filter blur-3xl"
          />
          {/* Cyan/Teal Radial Glow */}
          <motion.div
            animate={{
              x: [30, -30, 30],
              y: [50, -30, 50],
              scale: [1.1, 0.9, 1.1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-10 right-10 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06),transparent_60%)] filter blur-3xl"
          />
          {/* Purple Radial Glow */}
          <motion.div
            animate={{
              x: [-20, 20, -20],
              y: [20, -20, 20],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05),transparent_60%)] filter blur-3xl"
          />
        </div>

        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

        {/* Content Wrapper */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 md:px-20 lg:px-28 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Left Side: Headline, Description & Feature Items */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="col-span-1 lg:col-span-5 flex flex-col justify-center text-left"
          >
            {/* Tagline */}
            <motion.div variants={itemVariants} className="mb-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                <Zap className="w-3.5 h-3.5" />
                The Solution
              </span>
            </motion.div>

            {/* Headline (scroll fade-up) */}
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] leading-[1.1] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-100 to-gray-400"
            >
              AI-powered blockchain intelligence for modern investigations.
            </motion.h2>

            {/* Description (scroll fade-up) */}
            <motion.p
              variants={itemVariants}
              className="mt-4 text-[14px] sm:text-[16px] text-gray-400 leading-relaxed max-w-lg font-normal"
            >
              Analyze contracts, uncover threats, and understand attack behavior with clarity.
            </motion.p>

            {/* Features (scroll fade-up & staggered) */}
            <motion.div
              variants={itemVariants}
              className="mt-8 md:mt-10 flex flex-col gap-3"
              onMouseLeave={() => setHoverPaused(false)}
            >
              {solutionFeatures.map((feat) => {
                const Icon = feat.icon;
                const isActive = activeFeature === feat.id;
                return (
                  <motion.div
                    key={feat.id}
                    onMouseEnter={() => {
                      setActiveFeature(feat.id);
                      setHoverPaused(true);
                    }}
                    onClick={() => {
                      if (feat.id === 0) {
                        window.location.hash = "#smart-contract-analysis";
                      } else if (feat.id === 1) {
                        window.location.hash = "#wallet-intelligence";
                      } else {
                        window.location.hash = `#${feat.title.toLowerCase().replace(/\s+/g, '-')}`;
                      }
                    }}
                    whileHover={{ x: 6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                      isActive
                        ? 'bg-white/[0.04] border-white/15 shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
                        : 'bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/[0.05]'
                    }`}
                  >
                    {/* Glowing background bubble when active */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="activeFeatureGlow"
                          className={`absolute inset-0 bg-gradient-to-r ${feat.glow} opacity-60 z-0`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.6 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Active Left Border Glow */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="activeFeatureBorder"
                          className="absolute left-0 top-3 bottom-3 w-[3px] bg-blue-500 rounded-r-md z-10"
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          exit={{ scaleY: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Icon wrapper */}
                    <div
                      className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border transition-colors z-10 ${
                        isActive ? feat.color : 'text-gray-500 border-white/5 bg-white/[0.02] group-hover:text-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Text block */}
                    <div className="z-10 flex-1">
                      <h3 className={`text-sm font-semibold tracking-tight transition-colors ${
                        isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {feat.title}
                      </h3>
                      <p className="text-[12px] text-gray-400 font-normal leading-relaxed mt-1">
                        {feat.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right Side: Large 3D Tilt Dashboard Mockup */}
          <div className="col-span-1 lg:col-span-7 flex items-center justify-center py-6 lg:py-12 w-full overflow-visible">
            {/* Responsive scaling wrapper to fit mobile viewports */}
            <div className="w-full flex items-center justify-center section5-scale py-8 lg:py-12">
              {/* Tilt container */}
              <div
                ref={tiltRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative w-full max-w-xl aspect-[1.45/1] cursor-grab active:cursor-grabbing"
                style={{ perspective: 1200 }}
              >
              {/* Outer 3D Rotated Card Wrapper */}
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: 'preserve-3d',
                }}
                className="relative w-full aspect-[1.45/1] bg-[#12131b]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] rounded-2xl flex flex-col transition-shadow duration-300 group-hover:shadow-[0_40px_80px_-15px_rgba(59,130,246,0.15)] overflow-visible"
              >
                {/* 3D Reflection Shine overlay */}
                <motion.div
                  style={{
                    background: useTransform(
                      mouseXMotion,
                      [-0.5, 0.5],
                      [
                        'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.06) 0%, transparent 60%)',
                        'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.06) 0%, transparent 60%)',
                      ]
                    ),
                  }}
                  className="absolute inset-0 rounded-2xl pointer-events-none z-10"
                />

                {/* Dashboard Header/Mac window chrome */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-black/40 rounded-t-2xl">
                  {/* Traffic Light Windows Dots */}
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>
                  {/* Terminal Tab/Title */}
                  <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase font-mono flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-blue-400" />
                    BlockSpectra AI Audit Engine v2.4
                  </span>
                  {/* Network Indicator */}
                  <span className="flex items-center gap-1.5 text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Trace
                  </span>
                </div>

                {/* Code Window / Content Split */}
                <div className="flex-1 grid grid-cols-12 overflow-hidden font-mono text-[8px] sm:text-[10px] md:text-[11px] leading-relaxed">
                  
                  {/* Fake sidebar */}
                  <div className="col-span-3 border-r border-white/[0.04] bg-black/20 p-3 hidden sm:flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[8px] font-bold text-gray-500 tracking-widest uppercase">WORKSPACE</span>
                      <span className="text-gray-300 font-semibold truncate hover:text-white cursor-pointer flex items-center gap-1">📂 contracts</span>
                      <span className="text-blue-400 font-semibold truncate cursor-pointer pl-3 flex items-center gap-1">📄 AuditEngine.sol</span>
                      <span className="text-gray-400 truncate hover:text-white cursor-pointer pl-3 flex items-center gap-1">📄 RiskTracer.ts</span>
                    </div>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <span className="text-[8px] font-bold text-gray-500 tracking-widest uppercase">METRICS</span>
                      <span className="text-emerald-400 font-medium">Safe: 94.2%</span>
                      <span className="text-red-400 font-medium">Alerts: 3 Active</span>
                    </div>
                  </div>

                  {/* Code editor content */}
                  <div className="col-span-12 sm:col-span-9 p-4 bg-black/10 overflow-y-auto flex flex-col justify-between relative">
                    {/* Solidity Code Lines */}
                    <div className="text-left text-gray-400 space-y-0.5 select-none relative z-0">
                      <div><span className="text-gray-600 inline-block w-4 mr-2 text-right">01</span><span className="text-purple-400">pragma solidity</span> <span className="text-gray-200">^0.8.20;</span></div>
                      <div><span className="text-gray-600 inline-block w-4 mr-2 text-right">02</span></div>
                      <div><span className="text-gray-600 inline-block w-4 mr-2 text-right">03</span><span className="text-purple-400">contract</span> <span className="text-blue-400">SecureVault</span> <span className="text-gray-300">{'{'}</span></div>
                      <div><span className="text-gray-600 inline-block w-4 mr-2 text-right">04</span>  <span className="text-purple-400">mapping</span><span className="text-gray-300">(</span><span className="text-emerald-400">address</span> <span className="text-gray-300">=&gt;</span> <span className="text-emerald-400">uint</span><span className="text-gray-300">)</span> <span className="text-purple-400">public</span> <span className="text-gray-300">balances;</span></div>
                      <div><span className="text-gray-600 inline-block w-4 mr-2 text-right">05</span>  </div>
                      <div><span className="text-gray-600 inline-block w-4 mr-2 text-right">06</span>  <span className="text-gray-500">// Audit vulnerability path below</span></div>
                      <div className="relative">
                        <span className="text-gray-600 inline-block w-4 mr-2 text-right">07</span>  <span className="text-purple-400">function</span> <span className="text-amber-400">withdraw</span><span className="text-gray-300">(</span><span className="text-emerald-400">uint</span> <span className="text-gray-200">_amount</span><span className="text-gray-300">)</span> <span className="text-purple-400">external</span> <span className="text-gray-300">{'{'}</span>
                      </div>
                      
                      {/* Vulnerability line highlights dynamically depending on active state */}
                      <div className={`relative transition-colors duration-300 ${activeFeature === 0 ? 'bg-red-500/10 border-l-2 border-red-500 -ml-1 pl-1' : ''}`}>
                        <span className="text-gray-600 inline-block w-4 mr-2 text-right">08</span>    <span className="text-purple-400">require</span><span className="text-gray-300">(</span><span className="text-gray-200">balances[msg.sender] &gt;= _amount</span><span className="text-gray-300">);</span>
                      </div>
                      <div className={`relative transition-colors duration-300 ${activeFeature === 0 ? 'bg-red-500/10 border-l-2 border-red-500 -ml-1 pl-1' : ''}`}>
                        <span className="text-gray-600 inline-block w-4 mr-2 text-right">09</span>    <span className="text-gray-300">(</span><span className="text-emerald-400">bool</span> <span className="text-gray-200">success,</span> <span className="text-gray-300">) =</span> <span className="text-emerald-400">msg.sender</span><span className="text-gray-300">.</span><span className="text-blue-400">call</span><span className="text-gray-300">{'{'}</span><span className="text-gray-200">value: _amount</span><span className="text-gray-300">{'}'}</span><span className="text-gray-300">(</span><span className="text-green-300">""</span><span className="text-gray-300">);</span>
                      </div>
                      <div className="relative">
                        <span className="text-gray-600 inline-block w-4 mr-2 text-right">10</span>    <span className="text-purple-400">require</span><span className="text-gray-300">(</span><span className="text-gray-200">success</span><span className="text-gray-300">);</span>
                      </div>
                      <div className={`relative transition-colors duration-300 ${activeFeature === 0 ? 'bg-red-500/10 border-l-2 border-red-500 -ml-1 pl-1' : ''}`}>
                        <span className="text-gray-600 inline-block w-4 mr-2 text-right">11</span>    <span className="text-gray-200">balances[msg.sender] -= _amount;</span>
                      </div>
                      <div><span className="text-gray-600 inline-block w-4 mr-2 text-right">12</span>  <span className="text-gray-300">{'}'}</span></div>
                      <div><span className="text-gray-600 inline-block w-4 mr-2 text-right">13</span><span className="text-gray-300">{'}'}</span></div>
                    </div>

                    {/* Inline alert warning that displays when feature 0 is hovered */}
                    <AnimatePresence>
                      {activeFeature === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 backdrop-blur-md flex items-start gap-2.5 z-10 text-left font-sans"
                        >
                          <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-[11px] font-bold text-red-300 uppercase tracking-wider">Critical Vulnerability Detected</h4>
                            <p className="text-[10px] text-red-200 mt-0.5 leading-normal font-sans">
                              Reentrancy Exploit: State variable modification occurs after nested external call. Attacker can drain contract balance.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <motion.div
                  style={{
                    x: card1X,
                    y: card1Y,
                    transformStyle: 'preserve-3d',
                    translateZ: 50,
                  }}
                  animate={{
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className={`absolute -top-8 -left-6 sm:-top-12 sm:-left-10 md:-top-16 md:-left-16 w-44 sm:w-56 md:w-64 bg-[#141620]/90 backdrop-blur-xl border rounded-2xl p-3 sm:p-4 shadow-xl text-left transition-all duration-300 pointer-events-none ${
                    activeFeature === 0
                      ? 'border-emerald-500 shadow-emerald-500/10 scale-105 bg-emerald-500/5'
                      : 'border-white/[0.08] shadow-black/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-2.5">
                    <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-emerald-400 uppercase font-mono flex items-center gap-1 sm:gap-1.5">
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      SECURE AUDIT
                    </span>
                    <ShieldCheck className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${activeFeature === 0 ? 'text-emerald-400' : 'text-gray-500'}`} />
                  </div>
                  <h4 className="text-[9px] sm:text-[11px] font-semibold text-white truncate">ERC20Swap.sol</h4>
                  <div className="mt-2 sm:mt-2.5 space-y-1 sm:space-y-1.5 font-mono text-[8px] sm:text-[9px]">
                    <div className="flex justify-between text-gray-400">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-bold">Scanning Complete</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1">
                      <div className="bg-emerald-400 h-1 rounded-full w-full" />
                    </div>
                    <div className="flex justify-between text-gray-500 text-[7px] sm:text-[8px] pt-0.5 sm:pt-1">
                      <span>Critical: 1</span>
                      <span>Medium: 0</span>
                      <span>Low: 2</span>
                    </div>
                  </div>
                </motion.div>

                {/* Layered Card 2: Wallet Risk Profile (floating bottom-right) */}
                <motion.div
                  style={{
                    x: card2X,
                    y: card2Y,
                    transformStyle: 'preserve-3d',
                    translateZ: 80,
                  }}
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                  className={`absolute -bottom-8 -right-6 sm:-bottom-12 sm:-right-8 md:-bottom-16 md:-right-12 w-48 sm:w-60 md:w-68 bg-[#161722]/90 backdrop-blur-xl border rounded-2xl p-3 sm:p-4 shadow-xl text-left transition-all duration-300 pointer-events-none ${
                    activeFeature === 1
                      ? 'border-amber-500 shadow-amber-500/10 scale-105 bg-amber-500/5'
                      : 'border-white/[0.08] shadow-black/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-amber-400 uppercase font-mono flex items-center gap-1 sm:gap-1.5">
                      <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      WALLET PROFILE
                    </span>
                    <span className="text-[7px] sm:text-[8px] text-gray-500 font-mono flex items-center gap-1">
                      ID: 0x71c...a39
                      <Copy className="w-2.5 h-2.5 hover:text-gray-300 cursor-pointer" />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-0.5 sm:gap-1 mt-1">
                    <span className="text-lg sm:text-xl font-bold text-white">94</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-500 font-semibold font-mono">/ 100 Risk</span>
                  </div>
                  <div className="mt-2 font-mono text-[7px] sm:text-[8px] bg-amber-500/5 border border-amber-500/15 rounded-lg p-2 text-amber-300 flex items-start gap-1 sm:gap-1.5">
                    <span className="text-amber-400 text-[9px] sm:text-[10px] leading-none">⚠️</span>
                    <span>Tornado Cash connection verified: 45 ETH incoming transfer detected.</span>
                  </div>
                </motion.div>

                {/* Layered Card 3: Threat Live Feed (floating bottom-left) */}
                <motion.div
                  style={{
                    x: card3X,
                    y: card3Y,
                    transformStyle: 'preserve-3d',
                    translateZ: 60,
                  }}
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                  className={`absolute hidden sm:block -bottom-16 -left-6 md:-bottom-20 md:-left-8 w-52 md:w-60 bg-[#111218]/90 backdrop-blur-xl border rounded-2xl p-4 shadow-xl text-left transition-all duration-300 pointer-events-none ${
                    activeFeature === 2
                      ? 'border-red-500 shadow-red-500/10 scale-105 bg-red-500/5'
                      : 'border-white/[0.08] shadow-black/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold tracking-widest text-red-400 uppercase font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      THREAT MONITOR
                    </span>
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div className="space-y-1.5 font-mono text-[8px]">
                    <div className="p-1 rounded bg-red-500/5 text-red-300/90 truncate border-l border-red-500">
                      [14:32] Flash Loan Attack detected (Uniswap v3)
                    </div>
                    <div className="p-1 rounded bg-white/5 text-gray-400 truncate">
                      [14:31] Malicious contract deploying (Arbitrum)
                    </div>
                    <div className="p-1 rounded bg-white/5 text-gray-400 truncate">
                      [14:29] Zero-day vector flagged on DeFi clone
                    </div>
                  </div>
                </motion.div>

                {/* Layered Card 4: Audit Report Visual Checklist (floating center-right) */}
                <motion.div
                  style={{
                    x: card4X,
                    y: card4Y,
                    transformStyle: 'preserve-3d',
                    translateZ: 70,
                  }}
                  animate={{
                    y: [0, -7, 0],
                  }}
                  transition={{
                    duration: 6.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.2,
                  }}
                  className={`absolute hidden sm:block top-1/4 -right-12 md:-right-16 w-56 md:w-64 bg-[#13141c]/90 backdrop-blur-xl border rounded-2xl p-4 shadow-xl text-left transition-all duration-300 pointer-events-none ${
                    activeFeature === 3
                      ? 'border-cyan-500 shadow-cyan-500/10 scale-105 bg-cyan-500/5'
                      : 'border-white/[0.08] shadow-black/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[9px] font-bold tracking-widest text-cyan-400 uppercase font-mono flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      AUDIT EXPORT
                    </span>
                    <span className="text-[8px] text-gray-500 font-mono">PDF / HTML</span>
                  </div>
                  <div className="space-y-2 text-[10px]">
                    <div className="flex items-center gap-2 text-gray-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Formal Verification Complete</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Signature Validation Checked</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>AI Exploit Simulation Pass</span>
                    </div>
                  </div>
                </motion.div>

                {/* Layered Card 5: Attack Graph Visual Nodes (floating top-right) */}
                <motion.div
                  style={{
                    x: card5X,
                    y: card5Y,
                    transformStyle: 'preserve-3d',
                    translateZ: 90,
                  }}
                  animate={{
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 5.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.8,
                  }}
                  className={`absolute -top-8 -right-6 sm:-top-14 sm:-right-10 md:-top-16 md:-right-12 w-44 sm:w-56 md:w-64 bg-[#14151e]/90 backdrop-blur-xl border rounded-2xl p-3 sm:p-4 shadow-xl text-left transition-all duration-300 pointer-events-none ${
                    activeFeature === 4
                      ? 'border-purple-500 shadow-purple-500/10 scale-105 bg-purple-500/5'
                      : 'border-white/[0.08] shadow-black/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-purple-400 uppercase font-mono flex items-center gap-1 sm:gap-1.5">
                      <Network className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      EXPLOIT PATH
                    </span>
                    <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
                  </div>
                  {/* Graph visualization */}
                  <div className="mt-2.5 flex items-center justify-between relative px-2 py-1 bg-black/30 border border-white/5 rounded-xl">
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[7px] sm:text-[8px] font-bold text-red-400 font-mono">
                        Att
                      </div>
                      <span className="text-[7px] sm:text-[8px] text-gray-500">Exploiter</span>
                    </div>
                    {/* SVG Connector Lines */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6 sm:px-10">
                      <svg className="w-full h-6 sm:h-8" viewBox="0 0 100 20">
                        <line
                          x1="0"
                          y1="10"
                          x2="100"
                          y2="10"
                          stroke="rgba(168,85,247,0.3)"
                          strokeWidth="1.5"
                          strokeDasharray={activeFeature === 4 ? "4 2" : "6 4"}
                          className={activeFeature === 4 ? "animate-[marquee_2s_linear_infinite]" : "animate-[marquee_6s_linear_infinite]"}
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-[7px] sm:text-[8px] font-bold text-purple-400 font-mono">
                        Pool
                      </div>
                      <span className="text-[7px] sm:text-[8px] text-gray-500">DeFi Pool</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[7px] sm:text-[8px] font-bold text-emerald-400 font-mono">
                        Dst
                      </div>
                      <span className="text-[7px] sm:text-[8px] text-gray-500">Vault</span>
                    </div>
                  </div>
                </motion.div>

              </motion.div>
            </div>
          </div>
        </div>

        </div>
      </section>

      {/* Section 6 — Bento Grid Suite (Nothing & Apple-inspired) */}
      <section className="relative z-20 w-full py-28 sm:py-36 md:py-40 bg-[#07080b] border-t border-white/[0.03] overflow-hidden">
        {/* Nothing-style Dot Grid Background */}
        <div className="absolute inset-0 z-0 opacity-[0.05] bg-[radial-gradient(rgba(255,255,255,1)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        {/* Soft Background Gradient Blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03),transparent_60%)] filter blur-3xl" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 md:px-20 lg:px-28 flex flex-col items-start">
          
          {/* Section Header (Scroll fade-up) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="max-w-2xl text-left flex flex-col items-start"
          >
            {/* Tagline with Nothing-style red indicator */}
            <motion.div variants={itemVariants} className="mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                BENTO CAPABILITIES
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl leading-[1.1] font-bold tracking-tight text-white font-sans"
            >
              Everything needed to investigate blockchain threats.
            </motion.h2>
          </motion.div>

          {/* Asymmetrical Bento Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 w-full mt-14 sm:mt-20"
          >
            
            {/* Card 1: Smart Contract Analysis (laser scan loop) */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="col-span-1 md:col-span-2 lg:col-span-8 group rounded-[32px] bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.05] hover:border-white/10 p-8 flex flex-col md:flex-row justify-between gap-8 overflow-hidden transition-all duration-300 shadow-2xl"
            >
              <div className="flex flex-col justify-between max-w-sm">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 mb-4 text-left">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
                    <span className="text-[9px] font-bold tracking-widest uppercase font-mono">CODE VERIFIER</span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Smart Contract Analysis</h3>
                  <p className="text-xs text-gray-400 mt-2 font-normal leading-relaxed">
                    Verify contract safety and integrity with a real-time scanner mapping security vulnerabilities.
                  </p>
                </div>
                <div className="mt-8 md:mt-0 font-mono text-[9px] text-gray-500">
                  ⚡ SECURE COMPILE ACTIVE
                </div>
              </div>

              {/* Graphic: Self-scanning code panel */}
              <div className="flex-1 min-h-[160px] md:min-h-0 bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-[9px] leading-relaxed text-gray-400 relative overflow-hidden flex flex-col justify-between">
                
                {/* Sweeping laser line */}
                <motion.div
                  animate={{ y: ["0%", "100%", "0%"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(52,211,153,0.7)] z-10 pointer-events-none"
                />

                <div className="space-y-1 relative z-0 text-left">
                  <div className="text-emerald-400/90 font-semibold">// Continuous security scan...</div>
                  <div><span className="text-purple-400">function</span> <span className="text-blue-400">executeOrder</span>(address target) {'{'}</div>
                  <div>  require(whitelist[target], <span className="text-amber-300">"Not authorized"</span>);</div>
                  <div>  <span className="text-gray-500">// Audit check passed</span></div>
                  <div>  (bool success, ) = target.call(abi.encodeWithSignature(<span className="text-amber-300">"run()"</span>));</div>
                  <div>  require(success, <span className="text-amber-300">"Execution failed"</span>);</div>
                  <div>{'}'}</div>
                </div>
                <div className="text-[8px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full w-fit mt-3">
                  COMPILER: v0.8.20 OK
                </div>
              </div>
            </motion.div>

            {/* Card 2: Risk Scoring Engine (rotating circular ring) */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="col-span-1 md:col-span-1 lg:col-span-4 group rounded-[32px] bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.05] hover:border-white/10 p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 shadow-2xl text-left"
            >
              <div>
                <div className="flex items-center gap-2 text-blue-400 mb-4 text-left">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
                  <span className="text-[9px] font-bold tracking-widest uppercase font-mono">METRIC CALCULATOR</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Risk Scoring Engine</h3>
                <p className="text-xs text-gray-400 mt-2 font-normal leading-relaxed">
                  Real-time threat level assessment mapping complex security vectors into scores.
                </p>
              </div>

              {/* Graphic: Slow rotating ring with center score */}
              <div className="mt-8 flex items-center justify-center relative py-2">
                
                {/* SVG Ring container */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  
                  {/* Slow rotating segmented track */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, ease: "linear", repeat: Infinity }}
                    className="absolute inset-0"
                  >
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Segmented Ring */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="rgba(59, 130, 246, 0.4)"
                        strokeWidth="4"
                        strokeDasharray="12 8"
                        fill="transparent"
                      />
                    </svg>
                  </motion.div>

                  {/* Anti-rotating inner ring for visual detail */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 18, ease: "linear", repeat: Infinity }}
                    className="absolute w-24 h-24"
                  >
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth="2"
                        strokeDasharray="40 180"
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                  </motion.div>

                  {/* Score Text in Center */}
                  <div className="flex flex-col items-center justify-center z-10 font-mono">
                    <span className="text-2xl font-bold text-white tracking-tighter">88</span>
                    <span className="text-[7px] text-emerald-400 uppercase tracking-widest font-bold">SECURE</span>
                  </div>

                </div>

              </div>
            </motion.div>

            {/* Card 3: Threat Intelligence (expanding radar waves) */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="col-span-1 md:col-span-1 lg:col-span-4 group rounded-[32px] bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.05] hover:border-white/10 p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 shadow-2xl text-left"
            >
              <div>
                <div className="flex items-center gap-2 text-red-400 mb-4 text-left">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
                  <span className="text-[9px] font-bold tracking-widest uppercase font-mono">RADAR FEED</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Threat Intelligence</h3>
                <p className="text-xs text-gray-400 mt-2 font-normal leading-relaxed">
                  Aggregated blockchain feeds keeping you updated with malicious wallet behaviors.
                </p>
              </div>

              {/* Graphic: Expanding radar waves */}
              <div className="mt-8 flex items-center justify-center relative py-6">
                
                {/* Radar grid ring backdrop */}
                <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center relative bg-black/20">
                  <div className="w-12 h-12 rounded-full border border-white/[0.03] flex items-center justify-center" />
                  
                  {/* Rotating Sweeper Line */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                    className="absolute w-full h-full border-r border-red-500/10 origin-center pointer-events-none rounded-full"
                  />

                  {/* Center Signal Point */}
                  <div className="absolute w-2 h-2 rounded-full bg-red-500 z-10 shadow-[0_0_10px_#ef4444]" />

                  {/* Concentric Expanding Radar Waves */}
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.8, opacity: 0.6 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 1,
                        ease: "easeOut",
                      }}
                      className="absolute w-12 h-12 rounded-full border border-red-500/25 bg-red-500/[0.02] pointer-events-none"
                    />
                  ))}
                </div>

              </div>
            </motion.div>

            {/* Card 4: Attack Graph Visualization (connections animate) */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="col-span-1 md:col-span-2 lg:col-span-8 group rounded-[32px] bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.05] hover:border-white/10 p-8 flex flex-col md:flex-row justify-between gap-8 overflow-hidden transition-all duration-300 shadow-2xl text-left"
            >
              <div className="flex flex-col justify-between max-w-sm">
                <div>
                  <div className="flex items-center gap-2 text-purple-400 mb-4 text-left">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
                    <span className="text-[9px] font-bold tracking-widest uppercase font-mono">FLOW GRAPH</span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Attack Graph Visualization</h3>
                  <p className="text-xs text-gray-400 mt-2 font-normal leading-relaxed">
                    Map vulnerability paths and trace malicious transaction trails through interactive graph node visualizers.
                  </p>
                </div>
                <div className="mt-8 md:mt-0 font-mono text-[9px] text-gray-500">
                  ⚙️ AUTOMATIC LINK CHECK
                </div>
              </div>

              {/* Graphic: Animating path connections */}
              <div className="flex-1 min-h-[160px] md:min-h-0 bg-black/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden flex items-center justify-center">
                
                {/* Node cluster and SVG paths */}
                <div className="w-full flex items-center justify-between px-2 relative">
                  
                  {/* Node 1 */}
                  <div className="flex flex-col items-center gap-1.5 z-10">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center">
                      <Terminal className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Inflow</span>
                  </div>

                  {/* SVG paths with flowing transaction signals */}
                  <div className="absolute inset-x-12 inset-y-0 pointer-events-none flex items-center justify-center">
                    <svg className="w-full h-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                      {/* Base path line */}
                      <path
                        d="M 5,10 C 25,20 75,0 95,10"
                        fill="none"
                        stroke="rgba(168, 85, 247, 0.12)"
                        strokeWidth="2"
                      />
                      {/* Flowing animated dash signals */}
                      <motion.path
                        d="M 5,10 C 25,20 75,0 95,10"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2"
                        strokeDasharray="6 14"
                        animate={{ strokeDashoffset: [-20, 0] }}
                        transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                      />
                    </svg>
                  </div>

                  {/* Node 2 */}
                  <div className="flex flex-col items-center gap-1.5 z-10">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center">
                      <Network className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Exploit</span>
                  </div>

                  {/* Node 3 */}
                  <div className="flex flex-col items-center gap-1.5 z-10">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Drain</span>
                  </div>

                </div>

              </div>
            </motion.div>

            {/* Card 5: Wallet Intelligence (nodes pulse) */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="col-span-1 md:col-span-1 lg:col-span-6 group rounded-[32px] bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.05] hover:border-white/10 p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 shadow-2xl text-left"
            >
              <div>
                <div className="flex items-center gap-2 text-amber-400 mb-4 text-left">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
                  <span className="text-[9px] font-bold tracking-widest uppercase font-mono">ACCOUNT TRACE</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Wallet Intelligence</h3>
                <p className="text-xs text-gray-400 mt-2 font-normal leading-relaxed">
                  Map dynamic address structures and trace mixer transaction links through nested wallet visualizers.
                </p>
              </div>

              {/* Graphic: Pulsing wallet nodes */}
              <div className="mt-8 flex items-center justify-center min-h-[160px] bg-black/20 border border-white/5 rounded-2xl relative p-6">
                
                {/* Node cluster wrapper */}
                <div className="relative w-full h-full flex items-center justify-center">
                  
                  {/* Central Node */}
                  <motion.div
                    animate={{
                      scale: [1, 1.06, 1],
                      boxShadow: [
                        "0 0 0px rgba(245,158,11,0)",
                        "0 0 20px rgba(245,158,11,0.2)",
                        "0 0 0px rgba(245,158,11,0)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center z-10"
                  >
                    <Wallet className="w-5 h-5 text-amber-400" />
                  </motion.div>

                  {/* Satellite Node 1 */}
                  <motion.div
                    animate={{ scale: [0.95, 1.05, 0.95] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    className="absolute top-2 left-6 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-mono text-gray-400"
                  >
                    0x71
                  </motion.div>
                  {/* Connection Line 1 */}
                  <div className="absolute top-10 left-12 w-12 h-[1px] bg-dashed bg-white/10 -rotate-45 origin-left" />

                  {/* Satellite Node 2 */}
                  <motion.div
                    animate={{ scale: [1, 0.9, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                    className="absolute bottom-2 right-8 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-mono text-gray-400"
                  >
                    Torn
                  </motion.div>
                  {/* Connection Line 2 */}
                  <div className="absolute bottom-10 right-14 w-12 h-[1px] bg-dashed bg-white/10 -rotate-45 origin-left" />

                  {/* Satellite Node 3 */}
                  <motion.div
                    animate={{ scale: [0.9, 1.02, 0.9] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
                    className="absolute top-4 right-10 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-mono text-gray-400"
                  >
                    0x3a
                  </motion.div>

                </div>

              </div>
            </motion.div>

            {/* Card 6: AI Reports (typing animation) */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="col-span-1 md:col-span-1 lg:col-span-6 group rounded-[32px] bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.05] hover:border-white/10 p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 shadow-2xl text-left"
            >
              <div>
                <div className="flex items-center gap-2 text-cyan-400 mb-4 text-left">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
                  <span className="text-[9px] font-bold tracking-widest uppercase font-mono">EXPLAINABILITY LOGS</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">AI Reports</h3>
                <p className="text-xs text-gray-400 mt-2 font-normal leading-relaxed">
                  Generate publication-ready diagnostic summaries explaining blockchain threat behaviors automatically.
                </p>
              </div>

              {/* Graphic: Typing console log */}
              <div className="mt-8 flex flex-col min-h-[160px] bg-black/40 border border-white/5 rounded-2xl p-5 relative text-left">
                
                {/* Console header */}
                <div className="flex items-center gap-1.5 border-b border-white/5 pb-2.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#27c93f]" />
                  <span className="text-[8px] font-mono text-gray-500 ml-2">report_compiler.log</span>
                </div>

                {/* Custom typing element */}
                <div className="flex-1 flex items-start">
                  <BentoAITypingText />
                </div>

              </div>
            </motion.div>

          </motion.div>

        </div>
      </section>

      {/* Section 7 — Product Showcase (Cinematic MacBook-style Dashboard) */}
      <section className="relative z-20 w-full py-28 sm:py-36 md:py-44 bg-[#05070a] overflow-hidden border-t border-white/[0.03]">
        {/* Animated Ambient Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                top: `${(i * 7 + 13) % 100}%`,
                left: `${(i * 13 + 7) % 100}%`,
              }}
              animate={{
                y: [0, -60, 0],
                x: [0, 30, 0],
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: 10 + (i % 5) * 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Slowly Shifting Mesh Gradients */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Violet glow */}
          <motion.div
            animate={{
              x: [-60, 60, -60],
              y: [40, -40, 40],
              scale: [1, 1.25, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.06),transparent_60%)] filter blur-3xl"
          />
          {/* Blue glow */}
          <motion.div
            animate={{
              x: [40, -40, 40],
              y: [-60, 60, -60],
              scale: [1.1, 0.9, 1.1],
            }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_60%)] filter blur-3xl"
          />
        </div>

        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

        {/* Content wrapper */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 md:px-20 lg:px-28 flex flex-col items-center text-center">
          
          {/* Section Header (Scroll fade-up) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="max-w-3xl flex flex-col items-center gap-4"
          >
            {/* Tagline */}
            <motion.div variants={itemVariants} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                PRODUCT IN ACTION
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-100 to-gray-400 font-sans"
            >
              Security intelligence made visual.
            </motion.h2>
          </motion.div>

          {/* Interactive Horizontal Tab Selector */}
          <div className="mt-12 sm:mt-16 w-full max-w-3xl bg-white/[0.02] border border-white/[0.05] p-1.5 rounded-2xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-1 backdrop-blur-md relative z-30">
            {[
              { id: 0, label: "Contract Analysis" },
              { id: 1, label: "Wallet Intelligence" },
              { id: 2, label: "Attack Graph" },
              { id: 3, label: "Risk Report" }
            ].map((tab) => {
              const isActive = activeShowcaseTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveShowcaseTab(tab.id)}
                  className={`relative flex-1 py-3 text-[11px] sm:text-xs font-semibold rounded-xl transition-colors duration-300 focus:outline-none cursor-pointer text-center z-10 ${
                    isActive ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {/* Fluid sliding capsule overlay */}
                  {isActive && (
                    <motion.div
                      layoutId="showcaseActiveTabIndicator"
                      className="absolute inset-0 bg-white/[0.05] border border-white/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 26 }}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Giant MacBook Screen Dashboard Wrapper */}
          <div className="w-full flex items-center justify-center py-10 lg:py-16 overflow-visible relative z-20">
            {/* Sizing scale container to fit mobile perfectly */}
            <div className="w-full flex items-center justify-center section7-scale py-10">
              
              {/* Perspective mouse container */}
              <div
                ref={tiltRefShowcase}
                onMouseMove={handleMouseMoveShowcase}
                onMouseLeave={handleMouseLeaveShowcase}
                className="relative w-full max-w-5xl aspect-[16/10] cursor-grab active:cursor-grabbing"
                style={{ perspective: 1500 }}
              >
                
                {/* 3D Tilted MacBook Bezel Screen Frame */}
                <motion.div
                  style={{
                    rotateX: rotateXShowcase,
                    rotateY: rotateYShowcase,
                    transformStyle: 'preserve-3d',
                  }}
                  className="absolute inset-0 border-[14px] md:border-[18px] border-black bg-black rounded-[28px] md:rounded-[36px] shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col overflow-visible"
                >
                  {/* MacBook Web Camera Notch Indicator */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#1b1b1b] border border-white/5 z-40" />

                  {/* Inner screen content with glass reflection gloss */}
                  <div className="flex-1 w-full bg-[#0a0b10] rounded-[16px] md:rounded-[20px] overflow-hidden flex flex-col relative">
                    
                    {/* Screen reflection overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-transparent to-white/[0.04] pointer-events-none z-20" />

                    {/* Window Controls chrome */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04] bg-black/40">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 font-mono tracking-widest uppercase">
                        blockspectra_showcase_engine.sh
                      </span>
                      <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/15">
                        ACTIVE AUDIT
                      </span>
                    </div>

                    {/* Display active tab content */}
                    <div className="flex-1 w-full relative">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeShowcaseTab}
                          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="absolute inset-0"
                        >
                          <ShowcaseTabContent activeTab={activeShowcaseTab} />
                        </motion.div>
                      </AnimatePresence>
                    </div>

                  </div>
                </motion.div>

                {/* Floating Card A: Audit Security Tracker (top-left offset) */}
                <motion.div
                  style={{
                    x: cardShowcase1X,
                    y: cardShowcase1Y,
                    transformStyle: 'preserve-3d',
                    translateZ: 70,
                  }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-12 -left-12 w-48 sm:w-56 bg-black/45 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] text-left pointer-events-none z-20"
                >
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-bold text-emerald-400 font-mono uppercase tracking-widest">SYSTEM OK</span>
                  </div>
                  <h4 className="text-[10px] font-bold text-white uppercase font-sans">Formal Check Status</h4>
                  <div className="mt-2 font-mono text-[8px] text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Assertions:</span>
                      <span className="text-emerald-400">Pass</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Safety Dials:</span>
                      <span className="text-emerald-400">Stable</span>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Card B: Gas Analytics (bottom-left offset) */}
                <motion.div
                  style={{
                    x: cardShowcase2X,
                    y: cardShowcase2Y,
                    transformStyle: 'preserve-3d',
                    translateZ: 90,
                  }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -bottom-10 -left-10 w-48 sm:w-56 bg-black/45 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] text-left pointer-events-none z-20"
                >
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[8px] font-bold text-blue-400 font-mono uppercase tracking-widest">GAS METRICS</span>
                  </div>
                  <h4 className="text-[10px] font-bold text-white uppercase font-sans">Execution Gas Cost</h4>
                  <div className="mt-2 font-mono text-[8px] text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Gas Limit:</span>
                      <span>30,000,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gas Used:</span>
                      <span className="text-blue-400 font-bold">21,492 (Avg)</span>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Card C: Actions Tracker Alert (bottom-right offset) */}
                <motion.div
                  style={{
                    x: cardShowcase3X,
                    y: cardShowcase3Y,
                    transformStyle: 'preserve-3d',
                    translateZ: 80,
                  }}
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-12 -right-12 w-52 sm:w-60 bg-black/45 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] text-left pointer-events-none z-20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-bold text-red-400 font-mono uppercase tracking-widest">EXPLORE FEEDS</span>
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  </div>
                  <div className="font-mono text-[7px] sm:text-[8px] bg-red-500/5 border border-red-500/15 rounded-lg p-2 text-red-300">
                    Flash Loan arbitrage block alert: 0x9a29...f1a drained 245 ETH from swap reserve pool.
                  </div>
                </motion.div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Section 8 — How It Works (Minimal Timeline with Glowing Connections) */}
      <section className="relative z-20 w-full py-28 sm:py-36 md:py-44 bg-[#07080b] border-t border-white/[0.03] overflow-hidden">
        {/* Soft Background Radial Glows */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.04),transparent_60%)] filter blur-3xl" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-12 md:px-20 flex flex-col items-center">
          
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="max-w-2xl text-center flex flex-col items-center gap-4"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                WORKFLOW FLOW
              </span>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-100 to-gray-400 font-sans"
            >
              Analyze in minutes.
            </motion.h2>
          </motion.div>

          {/* Interactive Steps Grid & Timeline */}
          <div className="w-full mt-20 md:mt-28 relative">
            
            {/* Desktop Timeline Connection Line (Horizontal SVG) */}
            <div className="absolute top-16 left-[16%] right-[16%] h-0.5 hidden md:block pointer-events-none z-0">
              <svg className="w-full h-1 overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background track */}
                <line x1="0" y1="2" x2="100%" y2="2" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="4 4" />
                {/* Glowing progression line */}
                <motion.line
                  x1="0"
                  y1="2"
                  x2="100%"
                  y2="2"
                  stroke="url(#timelineGlowGradient)"
                  strokeWidth="3"
                  strokeDasharray="15 35"
                  animate={{ strokeDashoffset: [-100, 0] }}
                  transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                />
                <defs>
                  <linearGradient id="timelineGlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Steps Columns */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 w-full relative z-10"
            >
              {[
                {
                  id: 0,
                  title: "Upload",
                  desc: "Paste a contract address.",
                  icon: Upload,
                  color: "group-hover:text-blue-400 group-hover:border-blue-500/30 group-hover:bg-blue-500/5",
                  glow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
                },
                {
                  id: 1,
                  title: "Analyze",
                  desc: "AI and threat intelligence inspect the code.",
                  icon: Cpu,
                  color: "group-hover:text-purple-400 group-hover:border-purple-500/30 group-hover:bg-purple-500/5",
                  glow: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
                },
                {
                  id: 2,
                  title: "Investigate",
                  desc: "Receive actionable reports.",
                  icon: FileText,
                  color: "group-hover:text-cyan-400 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/5",
                  glow: "group-hover:shadow-[0_0_20px_rgba(6,180,212,0.15)]",
                }
              ].map((step, idx) => {
                const Icon = step.icon;
                const isStepActive = activeStep === step.id;

                return (
                  <motion.div
                    key={step.id}
                    variants={itemVariants}
                    onMouseEnter={() => {
                      setActiveStep(step.id);
                      setStepHoverPaused(true);
                    }}
                    onMouseLeave={() => setStepHoverPaused(false)}
                    className="group flex flex-col items-center text-center relative cursor-pointer"
                  >
                    
                    {/* Mobile Timeline Vertical Connecting Line (Visible only on mobile between steps) */}
                    {idx < 2 && (
                      <div className="absolute top-24 bottom-[-36px] left-1/2 -translate-x-1/2 w-0.5 md:hidden pointer-events-none z-0">
                        <svg className="w-1 h-full overflow-visible" fill="none">
                          <line x1="2" y1="0" x2="2" y2="100%" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="4 4" />
                          <motion.line
                            x1="2"
                            y1="0"
                            x2="2"
                            y2="100%"
                            stroke="#8b5cf6"
                            strokeWidth="2.5"
                            strokeDasharray="10 20"
                            animate={{ strokeDashoffset: [-50, 0] }}
                            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                          />
                        </svg>
                      </div>
                    )}

                    {/* Step Icon Badge with Morphing Hover */}
                    <motion.div
                      whileHover={{ scale: 1.08, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                      className={`w-20 h-20 rounded-3xl border flex items-center justify-center relative transition-all duration-300 z-10 ${step.color} ${step.glow} ${
                        isStepActive
                          ? "bg-white/[0.04] border-white/15 text-white shadow-[0_10px_30px_rgba(255,255,255,0.03)]"
                          : "bg-[#0b0c14] border-white/[0.03] text-gray-500"
                      }`}
                    >
                      {/* Active glow backing bubbles */}
                      {isStepActive && (
                        <motion.div
                          layoutId="timelineActiveGlow"
                          className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-3xl -z-10"
                        />
                      )}
                      
                      <Icon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />

                      {/* Morphing step number node */}
                      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-black border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-gray-400 group-hover:text-white group-hover:border-blue-500/50 transition-colors">
                        {idx + 1}
                      </span>
                    </motion.div>

                    {/* Card Content with Floating Animation */}
                    <motion.div
                      animate={{ y: isStepActive ? -6 : 0 }}
                      className="mt-6 flex flex-col items-center max-w-xs"
                    >
                      <h3 className={`text-lg font-bold transition-colors duration-300 ${
                        isStepActive ? "text-white" : "text-gray-300 group-hover:text-white"
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-2 font-normal leading-relaxed">
                        {step.desc}
                      </p>
                    </motion.div>

                  </motion.div>
                );
              })}
            </motion.div>

          </div>

          {/* Interactive Morphing Screen (displaying selected step mockup) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="w-full max-w-xl aspect-[1.7/1] mt-16 sm:mt-24 relative z-10 border border-white/[0.05] bg-[#0c0d14]/60 backdrop-blur-xl rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Morph reflection shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-transparent to-white/[0.03] pointer-events-none z-20" />
            
            {/* Dynamic visual window preview */}
            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-full h-full"
                >
                  <HowItWorksMockup activeStep={activeStep} />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Section 9 — Metrics (Massive Typography & Pulse Glows) */}
      <section className="relative z-20 w-full py-32 sm:py-40 md:py-48 bg-[#050608] border-t border-white/[0.03] overflow-hidden">
        {/* Glowing Background Radial Blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03),transparent_60%)] filter blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03),transparent_60%)] filter blur-3xl" />
        </div>

        {/* Floating background particles */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                top: `${(i * 9 + 17) % 100}%`,
                left: `${(i * 11 + 23) % 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.15, 0.35, 0.15],
              }}
              transition={{
                duration: 8 + (i % 4) * 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 md:px-20 lg:px-28">
          
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="max-w-3xl text-left flex flex-col gap-4 mb-20 md:mb-28"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                SECURED NETWORK
              </span>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white font-sans leading-[1.1]"
            >
              Security and trust at scale.
            </motion.h2>
          </motion.div>

          {/* Metrics Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full"
          >
            {[
              {
                id: 0,
                value: "100M+",
                label: "Transactions Processed",
                glow: "from-blue-500/10 to-transparent",
                border: "border-blue-500/10 hover:border-blue-500/20",
                floatDelay: 0,
                floatDuration: 6
              },
              {
                id: 1,
                value: "50K+",
                label: "Contracts Analyzed",
                glow: "from-purple-500/10 to-transparent",
                border: "border-purple-500/10 hover:border-purple-500/20",
                floatDelay: 0.5,
                floatDuration: 7
              },
              {
                id: 2,
                value: "99%",
                label: "Detection Accuracy",
                glow: "from-emerald-500/10 to-transparent",
                border: "border-emerald-500/10 hover:border-emerald-500/20",
                floatDelay: 1,
                floatDuration: 6.5
              },
              {
                id: 3,
                value: "500+",
                label: "Attack Patterns",
                glow: "from-cyan-500/10 to-transparent",
                border: "border-cyan-500/10 hover:border-cyan-500/20",
                floatDelay: 1.5,
                floatDuration: 7.5
              }
            ].map((metric) => (
              <motion.div
                key={metric.id}
                variants={itemVariants}
                animate={{
                  y: [0, -12, 0]
                }}
                transition={{
                  duration: metric.floatDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: metric.floatDelay
                }}
                className={`relative flex flex-col justify-between p-6 sm:p-8 lg:p-6 xl:p-8 rounded-[32px] bg-white/[0.01] border backdrop-blur-md overflow-hidden group hover:bg-white/[0.02] transition-colors duration-300 min-h-[220px] ${metric.border}`}
              >
                {/* Soft Radial Backglow inside Card */}
                <div className={`absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-gradient-to-br ${metric.glow} filter blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                {/* Massive Number Typography */}
                <div className="z-10 text-left">
                  <span className="text-4xl xs:text-5xl sm:text-6xl lg:text-[3.8rem] xl:text-[4.5rem] font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-100 to-gray-400 font-sans leading-none block pr-2">
                    <CountUp value={metric.value} />
                  </span>
                </div>

                {/* Label description */}
                <div className="z-10 text-left mt-8">
                  <span className="text-[12px] sm:text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">
                    {metric.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* Section 10 — Intelligence Pipeline */}
      <section className="relative z-20 w-full py-28 sm:py-36 md:py-44 bg-[#07080b] border-t border-white/[0.03] overflow-hidden">
        {/* Shifting radial mesh background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.03),transparent_60%)] filter blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03),transparent_60%)] filter blur-3xl" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 md:px-20 lg:px-28">
          
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="max-w-3xl text-left flex flex-col gap-4 mb-20"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                INTEL PIPELINE
              </span>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white font-sans leading-[1.1]"
            >
              Real-time intelligence flow.
            </motion.h2>
          </motion.div>

          {/* Interactive Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start w-full">
            
            {/* Left Side: Jarvis Diagnostic Terminal Box */}
            <div className="col-span-1 lg:col-span-5 lg:sticky lg:top-28">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="w-full bg-black/45 border border-white/5 rounded-[32px] p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden"
              >
                {/* Header controls */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                    diagnostic_pipeline.sh
                  </span>
                  <span className="text-[8px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    JARVIS ENG
                  </span>
                </div>

                {/* Log outputs stream */}
                <div className="min-h-[140px] flex flex-col justify-between">
                  <PipelineJarvisLogs activeStep={activePipelineStep} />
                </div>

                {/* Telemetry Metrics Footer inside terminal */}
                <div className="mt-8 pt-4 border-t border-white/5 grid grid-cols-3 gap-4 font-mono text-[8px] sm:text-[9px] text-gray-500">
                  <div>
                    <span className="block text-gray-400 font-semibold uppercase">AST DEPTH</span>
                    <span className="text-white font-bold mt-0.5 block">14 Layers</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-semibold uppercase">TRACE RATE</span>
                    <span className="text-white font-bold mt-0.5 block">10.4K lines/s</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-semibold uppercase">CPU LOAD</span>
                    <span className="text-emerald-400 font-bold mt-0.5 block">3.2% OK</span>
                  </div>
                </div>

              </motion.div>
            </div>

            {/* Right Side: Vertical Nodes Pipeline Track */}
            <div className="col-span-1 lg:col-span-7 relative flex pl-2 sm:pl-12 gap-8 flex-col justify-between">
              
              {/* Glowing vertical line track background */}
              <div className="absolute left-[36px] sm:left-[80px] top-6 bottom-6 w-0.5 pointer-events-none z-0">
                <svg className="w-1 h-full overflow-visible" fill="none">
                  {/* Background track line */}
                  <line x1="0" y1="0" x2="0" y2="100%" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
                  
                  {/* Animated flowing particles (progressively runs down) */}
                  <motion.line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="100%"
                    stroke="url(#pipelineFlowGradient)"
                    strokeWidth="3"
                    strokeDasharray="12 28"
                    animate={{ strokeDashoffset: [-150, 0] }}
                    transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                  />
                  
                  <defs>
                    <linearGradient id="pipelineFlowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Six Layers */}
              {[
                {
                  id: 0,
                  title: "AI Layer",
                  desc: "Neural network AST scanning and semantic risk trace auditing.",
                  glow: "shadow-blue-500/10 border-blue-500/30",
                  textGlow: "text-blue-400"
                },
                {
                  id: 1,
                  title: "Static Analysis",
                  desc: "Mathematical formal property checks resolving code structure logic traps.",
                  glow: "shadow-purple-500/10 border-purple-500/30",
                  textGlow: "text-purple-400"
                },
                {
                  id: 2,
                  title: "Dynamic Simulation",
                  desc: "Replaying transactions in simulated block sandboxes using flashloan models.",
                  glow: "shadow-cyan-500/10 border-cyan-500/30",
                  textGlow: "text-cyan-400"
                },
                {
                  id: 3,
                  title: "Threat Intelligence",
                  desc: "Cross-referencing active global addresses and known dark web routers.",
                  glow: "shadow-red-500/10 border-red-500/30",
                  textGlow: "text-red-400"
                },
                {
                  id: 4,
                  title: "Behavior Analysis",
                  desc: "Auditing token flows, swap patterns, and mixers for high-risk flags.",
                  glow: "shadow-amber-500/10 border-amber-500/30",
                  textGlow: "text-amber-400"
                },
                {
                  id: 5,
                  title: "Risk Scoring",
                  desc: "Aggregating pipeline telemetry logs to compile a unified security rating.",
                  glow: "shadow-emerald-500/10 border-emerald-500/30",
                  textGlow: "text-emerald-400"
                }
              ].map((layer) => {
                const isActive = activePipelineStep === layer.id;

                return (
                  <motion.div
                    key={layer.id}
                    onMouseEnter={() => {
                      setActivePipelineStep(layer.id);
                      setPipelineHoverPaused(true);
                    }}
                    onMouseLeave={() => setPipelineHoverPaused(false)}
                    onClick={() => setActivePipelineStep(layer.id)}
                    className={`group flex items-start gap-6 p-4 sm:p-5 rounded-2xl border transition-all duration-300 relative cursor-pointer overflow-hidden z-10 ${
                      isActive
                        ? `bg-white/[0.03] ${layer.glow} shadow-lg scale-[1.02]`
                        : "bg-transparent border-transparent hover:bg-white/[0.01]"
                    }`}
                  >
                    
                    {/* Glass node connector */}
                    <div className="flex-shrink-0 relative w-6 h-6 flex items-center justify-center">
                      <motion.div
                        animate={{
                          scale: isActive ? [1, 1.15, 1] : 1,
                          boxShadow: isActive ? "0 0 12px currentColor" : "none"
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-3.5 h-3.5 rounded-full border transition-colors duration-300 z-10 ${
                          isActive
                            ? `${layer.textGlow} border-current bg-current`
                            : "border-white/20 bg-[#07080b] group-hover:border-white/40"
                        }`}
                      />
                    </div>

                    {/* Card text content */}
                    <div className="flex-1 text-left">
                      <h3 className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
                        isActive ? "text-white" : "text-gray-300 group-hover:text-white"
                      }`}>
                        {layer.title}
                      </h3>
                      <p className="text-xs text-gray-400 leading-normal mt-1 max-w-lg font-normal">
                        {layer.desc}
                      </p>
                    </div>

                  </motion.div>
                );
              })}

            </div>

          </div>

        </div>
      </section>

      {/* Section 11 — Comparison */}
      <section className="relative z-20 w-full py-28 sm:py-36 md:py-44 bg-[#050608] border-t border-white/[0.03] overflow-hidden">
        {/* Shifting radial mesh background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.02),transparent_60%)] filter blur-3xl" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-12 md:px-20">
          
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="max-w-3xl text-left flex flex-col gap-4 mb-16"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                THE COMPARISON
              </span>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white font-sans leading-[1.1]"
            >
              Built beyond traditional scanners.
            </motion.h2>
          </motion.div>

          {/* Table Container */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="w-full bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-[28px] overflow-hidden shadow-2xl"
          >
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-white/[0.05] bg-white/[0.01] text-[10px] sm:text-xs font-mono font-bold tracking-wider text-gray-400 uppercase text-center">
              <div className="col-span-6 text-left pl-2">Features</div>
              <div className="col-span-3 text-center text-white font-bold bg-white/[0.03] py-2 rounded-xl border border-white/[0.05]">BlockSpectra</div>
              <div className="col-span-3 text-center py-2">Traditional Tools</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-white/[0.03]">
              {comparisonRows.map((row, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                  className="grid grid-cols-12 gap-4 px-6 py-5 sm:py-6 items-center text-center transition-colors duration-200"
                >
                  {/* Feature Name */}
                  <div className="col-span-6 text-left text-xs sm:text-sm font-semibold text-gray-200 pl-2">
                    {row.feature}
                  </div>

                  {/* BlockSpectra Score */}
                  <div className="col-span-3 flex justify-center items-center relative">
                    <div className="absolute inset-0 bg-emerald-500/5 filter blur-md rounded-full pointer-events-none" />
                    <AnimatedCheckmark delay={idx * 0.1} />
                  </div>

                  {/* Traditional Tools Score */}
                  <div className="col-span-3 flex justify-center items-center">
                    {row.traditional ? (
                      <AnimatedCheckmark delay={idx * 0.1 + 0.15} />
                    ) : (
                      <MutedDash delay={idx * 0.1} />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>




      </div>

      <div style={{ display: currentPage === 'scanner' ? 'block' : 'none' }} className="relative z-10 w-full min-h-screen bg-[#07080a] text-white pt-32 pb-20 overflow-hidden">
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

          {/* Shifting radial mesh background glows */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_60%)] filter blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.04),transparent_60%)] filter blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-[92%] 2xl:max-w-[1536px] mx-auto px-6 sm:px-12">
            {/* Back Button Action */}
            <div className="mb-8 flex items-center">
              <a
                href="#"
                className="group inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
              >
                <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
                  ←
                </span>
                Back to Platform Home
              </a>
            </div>

            {/* Title Block Header */}
            <div className="max-w-3xl text-left flex flex-col gap-3 mb-12">
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                  ENGINE SCANNER
                </span>
                <span className="h-4 w-[1px] bg-white/10" />
                {/* Operational live badge */}
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                  Systems Operational
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans leading-[1.1]">
                Smart Contract Analysis
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed mt-1">
                Audit smart contract code, trace exploit vectors, and analyze token behavior using deep custom heuristics and OpenRouter AI engines. Supports 13 major blockchain networks.
              </p>
            </div>

            {/* main scanning module */}
            <ScannerInterface />
          </div>
        </div>

      {/* Wallet Intelligence Page */}
      <div style={{ display: currentPage === 'wallet' ? 'block' : 'none' }} className="relative z-10 w-full min-h-screen bg-[#07080a] text-white pt-32 pb-20 overflow-hidden">
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

          {/* Shifting radial mesh background glows */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06),transparent_60%)] filter blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.04),transparent_60%)] filter blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-[92%] 2xl:max-w-[1536px] mx-auto px-6 sm:px-12">
            {/* Back Button */}
            <div className="mb-8 flex items-center">
              <a
                href="#"
                className="group inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
              >
                <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
                  ←
                </span>
                Back to Platform Home
              </a>
            </div>

            {/* Title Block */}
            <div className="max-w-3xl text-left flex flex-col gap-3 mb-12">
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                  WALLET INTELLIGENCE
                </span>
                <span className="h-4 w-[1px] bg-white/10" />
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                  Systems Operational
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans leading-[1.1]">
                Wallet Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed mt-1">
                Trace wallet behavior, analyze token portfolios, detect whale patterns, wash trading, and suspicious activity using deep behavioral heuristics and AI engines. Supports 11 major blockchain networks.
              </p>
            </div>

            {/* Wallet Intelligence Module */}
            <WalletIntelligence />
          </div>
        </div>

      {/* Attack Graphs Page */}
      <div style={{ display: currentPage === 'graphs' ? 'block' : 'none' }} className="relative z-10 w-full min-h-screen bg-[#07080a] text-white pt-32 pb-20 overflow-hidden">
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

          {/* Shifting radial mesh background glows */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.06),transparent_60%)] filter blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.04),transparent_60%)] filter blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-[92%] 2xl:max-w-[1536px] mx-auto px-6 sm:px-12">
            {/* Back Button */}
            <div className="mb-8 flex items-center">
              <a
                href="#"
                className="group inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
              >
                <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
                  ←
                </span>
                Back to Platform Home
              </a>
            </div>

            {/* Title Block */}
            <div className="max-w-3xl text-left flex flex-col gap-3 mb-12">
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                  CROSS-CHAIN GRAPH ENGINE
                </span>
                <span className="h-4 w-[1px] bg-white/10" />
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                  Systems Operational
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans leading-[1.1]">
                Cross-Chain Attack Graphs
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed mt-1">
                Visualize multi-hop money flow topologies, token swaps, and cross-chain bridge movements across 13 major blockchain networks. Trace security threats, exploit origins, and Mixer interactions in real-time.
              </p>
            </div>

            {/* Attack Graph visual wrapper */}
            <AttackGraph />
          </div>
        </div>
      {/* Transaction Simulator Page */}
      <div style={{ display: currentPage === 'simulator' ? 'block' : 'none' }} className="relative z-10 w-full min-h-screen bg-[#07080a] text-white pt-32 pb-20 overflow-hidden">
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

          {/* Shifting radial mesh background glows */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_60%)] filter blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.04),transparent_60%)] filter blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-[92%] 2xl:max-w-[1536px] mx-auto px-6 sm:px-12">
            {/* Back Button */}
            <div className="mb-8 flex items-center">
              <a
                href="#"
                className="group inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
              >
                <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
                  ←
                </span>
                Back to Platform Home
              </a>
            </div>

            {/* Title Block */}
            <div className="max-w-3xl text-left flex flex-col gap-3 mb-12">
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                  MULTI-CHAIN SIMULATOR
                </span>
                <span className="h-4 w-[1px] bg-white/10" />
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                  Simulation Core Live
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans leading-[1.1]">
                Transaction Simulation Engine
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed mt-1">
                Preview execution outcomes for transfers, swaps, approvals, and contract calls before publishing them on-chain. Evaluates storage mutations, call-trees, asset balance movements, events, and exploit safety.
              </p>
            </div>

            {/* Simulation Interface component */}
            <TransactionSimulator />
          </div>
        </div>

      {/* Universal Decoder Page */}
      <div style={{ display: currentPage === 'decoder' ? 'block' : 'none' }} className="relative z-10 w-full min-h-screen bg-[#07080a] text-white pt-32 pb-20 overflow-hidden">
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

          {/* Shifting radial mesh background glows */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_60%)] filter blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.04),transparent_60%)] filter blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-[92%] 2xl:max-w-[1536px] mx-auto px-6 sm:px-12">
            {/* Back Button */}
            <div className="mb-8 flex items-center">
              <a
                href="#"
                className="group inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
              >
                <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
                  ←
                </span>
                Back to Platform Home
              </a>
            </div>

            {/* Title Block */}
            <div className="max-w-3xl text-left flex flex-col gap-3 mb-12">
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                  UNIVERSAL DECODER ENGINE
                </span>
                <span className="h-4 w-[1px] bg-white/10" />
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                  Decoder Core Live
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans leading-[1.1]">
                Universal Transaction Decoder
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed mt-1">
                Deconstruct raw execution inputs, ABI calldata, instructions, and scripts across Ethereum, Solana, Sui, Aptos, and Bitcoin. Automatically generates human-readable explanations, asset transfer maps, implications, and safety risks.
              </p>
            </div>

            {/* Decoder Interface component */}
            <DecoderInterface />
          </div>
        </div>

      {/* Event Intelligence Page */}
      <div style={{ display: currentPage === 'events' ? 'block' : 'none' }} className="relative z-10 w-full min-h-screen bg-[#07080a] text-white pt-32 pb-20 overflow-hidden">
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

          {/* Shifting radial mesh background glows */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_60%)] filter blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.04),transparent_60%)] filter blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-[92%] 2xl:max-w-[1536px] mx-auto px-6 sm:px-12">
            {/* Back Button */}
            <div className="mb-8 flex items-center">
              <a
                href="#"
                className="group inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
              >
                <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
                  ←
                </span>
                Back to Platform Home
              </a>
            </div>

            {/* Title Block */}
            <div className="max-w-3xl text-left flex flex-col gap-3 mb-12">
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                  EVENT INTELLIGENCE ENGINE
                </span>
                <span className="h-4 w-[1px] bg-white/10" />
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                  Logs Intelligence Live
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans leading-[1.1]">
                Multi-Chain Event Intel
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed mt-1">
                Deconstruct block event logs, upgrades, swaps, liquidations, and bridge movements in a chronological timeline. Traces tokens flow routes, provides visual spec cards, and flags high-risk transactions.
              </p>
            </div>

            {/* Event Intelligence Interface component */}
            <EventIntelligenceInterface />
          </div>
        </div>

      {/* Threat Intelligence Page */}
      <div style={{ display: currentPage === 'threats' ? 'block' : 'none' }} className="relative z-10 w-full min-h-screen bg-[#07080a] text-white pt-32 pb-20 overflow-hidden">
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

        {/* Shifting radial mesh background glows */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.06),transparent_60%)] filter blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.04),transparent_60%)] filter blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[92%] 2xl:max-w-[1536px] mx-auto px-6 sm:px-12">
          {/* Back Button */}
          <div className="mb-8 flex items-center">
            <a
              href="#"
              className="group inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
            >
              <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
                ←
              </span>
              Back to Platform Home
            </a>
          </div>

          {/* Title Block */}
          <div className="max-w-3xl text-left flex flex-col gap-3 mb-12">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                THREAT INTELLIGENCE ENGINE
              </span>
              <span className="h-4 w-[1px] bg-white/10" />
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-400 uppercase font-mono bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                <span className="w-1 h-1 rounded-full bg-red-400 animate-ping" />
                Threat Intel Live
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans leading-[1.1]">
              Threat Intel & Correlations
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed mt-1">
              Correlate indicators of compromise (IOCs), threat actors, campaigns, known exploits, malware, and ransomware across OpenCTI, MISP, MITRE ATT&CK, CVE, and public databases.
            </p>
          </div>

          {/* Threat Intelligence Interface component */}
          <ThreatIntelligenceInterface />
        </div>
      </div>

      {/* Risk Engine Page */}
      <div style={{ display: currentPage === 'risk' ? 'block' : 'none' }} className="relative z-10 w-full min-h-screen bg-[#07080a] text-white pt-32 pb-20 overflow-hidden">
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

        {/* Shifting radial mesh background glows */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06),transparent_60%)] filter blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.04),transparent_60%)] filter blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[92%] 2xl:max-w-[1536px] mx-auto px-6 sm:px-12">
          {/* Back Button */}
          <div className="mb-8 flex items-center">
            <a
              href="#"
              className="group inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
            >
              <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
                ←
              </span>
              Back to Platform Home
            </a>
          </div>

          {/* Title Block */}
          <div className="max-w-3xl text-left flex flex-col gap-3 mb-12">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                RISK CORRELATION ENGINE
              </span>
              <span className="h-4 w-[1px] bg-white/10" />
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-400 uppercase font-mono bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping" />
                Risk Index Live
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans leading-[1.1]">
              Centralized Risk Scoring
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed mt-1">
              Correlate contract findings, wallet intelligence, threat actor metrics, transaction anomalies, bridge activities, and telemetry logs to compute multi-dimensional threat scores.
            </p>
          </div>

          {/* Risk Engine Interface component */}
          <RiskEngineInterface />
        </div>
      </div>

      {/* Bridge Intelligence Page */}
      <div style={{ display: currentPage === 'bridges' ? 'block' : 'none' }} className="relative z-10 w-full min-h-screen bg-[#07080a] text-white pt-32 pb-20 overflow-hidden">
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

        {/* Shifting radial mesh background glows */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.06),transparent_60%)] filter blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.04),transparent_60%)] filter blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[92%] 2xl:max-w-[1536px] mx-auto px-6 sm:px-12">
          {/* Back Button */}
          <div className="mb-8 flex items-center">
            <a
              href="#"
              className="group inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
            >
              <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
                ←
              </span>
              Back to Platform Home
            </a>
          </div>

          {/* Title Block */}
          <div className="max-w-3xl text-left flex flex-col gap-3 mb-12">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                BRIDGE INTELLIGENCE ENGINE
              </span>
              <span className="h-4 w-[1px] bg-white/10" />
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-teal-400 uppercase font-mono bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">
                <span className="w-1 h-1 rounded-full bg-teal-400 animate-ping" />
                Bridge Monitor Live
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans leading-[1.1]">
              Cross-Chain Bridge Analysis
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed mt-1">
              Track LayerZero, Wormhole, Across, Stargate, Hop, and native bridges. Analyze bridge flows, asset movements, cross-chain paths, anomalies, and known exploits.
            </p>
          </div>

          {/* Bridge Intelligence Interface component */}
          <BridgeIntelligenceInterface />
        </div>
      </div>

      {/* AI Investigator Page */}
      <div style={{ display: currentPage === 'investigator' ? 'block' : 'none' }} className="relative z-10 w-full min-h-screen bg-[#07080a] text-white pt-32 pb-20 overflow-hidden">
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

        {/* Shifting radial mesh background glows */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06),transparent_60%)] filter blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.04),transparent_60%)] filter blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[92%] 2xl:max-w-[1536px] mx-auto px-6 sm:px-12">
          {/* Back Button */}
          <div className="mb-8 flex items-center">
            <a
              href="#"
              className="group inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
            >
              <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
                ←
              </span>
              Back to Platform Home
            </a>
          </div>

          {/* Title Block */}
          <div className="max-w-3xl text-left flex flex-col gap-3 mb-12">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                AI INVESTIGATOR ENGINE
              </span>
              <span className="h-4 w-[1px] bg-white/10" />
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-violet-400 uppercase font-mono bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">
                <span className="w-1 h-1 rounded-full bg-violet-400 animate-ping" />
                Copilot Online
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans leading-[1.1]">
              Conversational Threat Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed mt-1">
              Investigate addresses, verify smart contracts, trace bridge flows, and correlate threat actor patterns using natural language and direct engine tool-calling capabilities.
            </p>
          </div>

          {/* AI Investigator Interface component */}
          <AIInvestigatorInterface />
        </div>
      </div>

      {/* Report Generator Page */}
      <div style={{ display: currentPage === 'reports' ? 'block' : 'none' }} className="relative z-10 w-full min-h-screen bg-[#07080a] text-white pt-32 pb-20 overflow-hidden">
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

        {/* Shifting radial mesh background glows */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_60%)] filter blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.04),transparent_60%)] filter blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[92%] 2xl:max-w-[1536px] mx-auto px-6 sm:px-12">
          {/* Back Button */}
          <div className="mb-8 flex items-center">
            <a
              href="#"
              className="group inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
            >
              <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
                ←
              </span>
              Back to Platform Home
            </a>
          </div>

          {/* Title Block */}
          <div className="max-w-3xl text-left flex flex-col gap-3 mb-12">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                AI REPORT GENERATOR
              </span>
              <span className="h-4 w-[1px] bg-white/10" />
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-400 uppercase font-mono bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                <span className="w-1 h-1 rounded-full bg-blue-400 animate-ping" />
                Audit Workspace Online
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans leading-[1.1]">
              AI Report Generator Workspace
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed mt-1">
              Generate comprehensive multi-chain auditing reports for smart contracts, address transaction summaries, wallet behavioral intelligence, and threat indicators of compromise.
            </p>
          </div>

          {/* Report Generator Workspace Interface component */}
          <ReportGeneratorWorkspace />
        </div>
      </div>

      {/* Documentation Hub Page */}
      <div style={{ display: currentPage === 'docs' ? 'block' : 'none' }} className="relative z-10 w-full min-h-screen bg-[#07080a] text-white pt-32 pb-20 overflow-hidden">
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

        {/* Shifting radial mesh background glows */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_60%)] filter blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.04),transparent_60%)] filter blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[92%] 2xl:max-w-[1536px] mx-auto px-6 sm:px-12">
          {/* Back Button */}
          <div className="mb-8 flex items-center">
            <a
              href="#"
              className="group inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
            >
              <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
                ←
              </span>
              Back to Platform Home
            </a>
          </div>

          {/* Title Block */}
          <div className="max-w-3xl text-left flex flex-col gap-3 mb-12">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase font-mono">
                BLOCKSPECTRA ENGINE REFERENCE
              </span>
              <span className="h-4 w-[1px] bg-white/10" />
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-400 uppercase font-mono bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                Documentation Hub Live
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-sans leading-[1.1]">
              Engine Documentation & Resource Map
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed mt-1">
              Deep-dive technical guide mapping telemetry feeds, logic pipelines, dependencies, parameter definitions, and external data sources for all 11 security engines of the BlockSpectra Platform.
            </p>
          </div>

          <DocumentationHub />
        </div>
      </div>

      {/* Section 14 — Apple Footer */}
      <footer className="relative z-20 w-full bg-[#030406] border-t border-white/[0.03] pt-20 pb-12 overflow-hidden">
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.01] mix-blend-overlay bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

        {/* Slow shifting background gradients */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              x: [-100, 100, -100],
              y: [-50, 50, -50],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.015),transparent_70%)] filter blur-3xl"
          />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-12">
          {/* Footer Navigation Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pb-16">
            
            {/* Column 1: Security Engines */}
            <div className="flex flex-col items-start text-left gap-4">
              <span className="text-[10px] font-bold tracking-widest text-white uppercase font-mono">{t('category.engines', 'Security Engines')}</span>
              <ul className="flex flex-col gap-2.5 text-xs text-gray-500 font-medium">
                {[
                  { name: 'Smart Contract Analysis', href: '#smart-contract-analysis' },
                  { name: 'Wallet Intelligence', href: '#wallet-intelligence' },
                  { name: 'Transaction Simulator', href: '#transaction-simulator' },
                  { name: 'Bridge Intelligence', href: '#bridge-intelligence' },
                  { name: 'Threat Intelligence', href: '#threat-intelligence' }
                ].map((item) => {
                  const keys = getToolTranslationKeys(item.name);
                  const nameText = keys.name ? t(keys.name) : item.name;
                  return (
                    <li key={item.name}>
                      <a href={item.href} className="footer-link hover:text-gray-300 transition-colors">
                        {nameText}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Column 2: Data & Threat Analysis */}
            <div className="flex flex-col items-start text-left gap-4">
              <span className="text-[10px] font-bold tracking-widest text-white uppercase font-mono">{t('category.analysis', 'Data & Threat Analysis')}</span>
              <ul className="flex flex-col gap-2.5 text-xs text-gray-500 font-medium">
                {[
                  { name: 'Universal Decoder', href: '#universal-decoder' },
                  { name: 'Event Intelligence', href: '#event-intelligence' },
                  { name: 'Attack Graphs', href: '#attack-graphs' },
                  { name: 'Risk Engine', href: '#risk-engine' }
                ].map((item) => {
                  const keys = getToolTranslationKeys(item.name);
                  const nameText = keys.name ? t(keys.name) : item.name;
                  return (
                    <li key={item.name}>
                      <a href={item.href} className="footer-link hover:text-gray-300 transition-colors">
                        {nameText}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Column 3: Workspace & Reference */}
            <div className="flex flex-col items-start text-left gap-4">
              <span className="text-[10px] font-bold tracking-widest text-white uppercase font-mono">{t('category.reference', 'Workspace & Reference')}</span>
              <ul className="flex flex-col gap-2.5 text-xs text-gray-500 font-medium">
                {[
                  { name: 'AI Investigator', href: '#ai-investigator' },
                  { name: 'Report Generator', href: '#report-generator' },
                  { name: 'Documentation Hub', href: '#documentation-hub' }
                ].map((item) => {
                  const keys = getToolTranslationKeys(item.name);
                  const nameText = keys.name ? t(keys.name) : item.name;
                  return (
                    <li key={item.name}>
                      <a href={item.href} className="footer-link hover:text-gray-300 transition-colors">
                        {nameText}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Thin Divider */}
          <div className="w-full h-[1px] bg-white/[0.04] mb-8" />

          {/* Footer bottom metadata block */}
          <div className="flex items-center justify-center text-[11px] text-gray-500 font-medium">
            <span>{t('footer.copyright', '© 2026 BlockSpectra Inc. All rights reserved.')}</span>
          </div>
        </div>
      </footer>

      {/* Footer or close tag */}
    </div>
  );
}

export default App;
