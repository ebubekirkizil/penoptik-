"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ArrowRight, Globe, Zap, Database, Shield, Activity, 
  CheckCircle2, TrendingUp, Users, Package, Cloud, Cpu, 
  Terminal, Workflow, Box, BarChart3, Fingerprint, Code2, Lock
} from "lucide-react";

export default function SentientWireLanding() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden font-sans">
      
      {/* Dynamic Background System */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] mix-blend-screen transform translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDuration: '8s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#050505]/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-500">
              <span className="font-bold text-white text-lg">S</span>
              <div className="absolute inset-0 rounded-lg ring-1 ring-white/20"></div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white">Sentient</span>
              <span className="text-lg font-medium text-white/50 tracking-tight">Wire</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#platform" className="text-sm text-white/60 hover:text-white transition-colors">Platform</Link>
            <Link href="#solutions" className="text-sm text-white/60 hover:text-white transition-colors">Solutions</Link>
            <Link href="#developers" className="text-sm text-white/60 hover:text-white transition-colors">Developers</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link href="/admin" className="px-4 py-2 bg-white text-black hover:bg-gray-200 text-sm font-semibold rounded-lg transition-colors">
              Console
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <a href="#" className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-pointer group">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-medium text-white/80">Introducing SentientWire v2.0</span>
              <ArrowRight className="w-3 h-3 text-white/50 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tighter leading-[1.05] mb-8">
              The operating system <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                for modern enterprise.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/50 max-w-2xl leading-relaxed mb-10">
              Unify your entire business logic—from E-Commerce and Inventory to Finance and Logistics—into one blazingly fast, highly scalable cloud infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/admin" className="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group">
                Start Building
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#architecture" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-medium text-white transition-colors flex items-center justify-center gap-2">
                <Terminal className="w-4 h-4 text-white/50" />
                Read the Docs
              </Link>
            </div>
          </motion.div>

          {/* Abstract Hero Visual */}
          <motion.div 
            style={{ y, opacity }}
            className="mt-20 relative max-w-5xl mx-auto perspective-[2000px]"
          >
            <div className="relative rounded-2xl border border-white/10 bg-black/50 backdrop-blur-2xl p-2 shadow-2xl overflow-hidden transform rotate-x-12 scale-95 hover:rotate-x-0 hover:scale-100 transition-all duration-700 ease-out">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-50"></div>
              
              {/* Fake Dashboard Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="ml-4 text-xs font-mono text-white/40 flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  console.sentientwire.com
                </div>
              </div>

              {/* Dashboard Content Mockup */}
              <div className="p-6 grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  {/* Chart area */}
                  <div className="h-48 rounded-xl border border-white/5 bg-white/[0.02] flex items-end px-4 pb-4 gap-2">
                    {[30, 45, 20, 60, 40, 80, 50, 90, 70, 100, 85].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-500/20 hover:bg-blue-500/40 rounded-t-sm transition-colors relative group" style={{ height: `${h}%` }}>
                        <div className="absolute -top-2 left-0 right-0 h-px bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    ))}
                  </div>
                  {/* Table area */}
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 rounded-lg border border-white/5 bg-white/[0.01] flex items-center px-4 gap-4">
                        <div className="w-8 h-8 rounded bg-white/5"></div>
                        <div className="w-32 h-3 rounded-full bg-white/10"></div>
                        <div className="ml-auto w-16 h-3 rounded-full bg-blue-500/20"></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Side panels */}
                  <div className="h-32 rounded-xl border border-white/5 bg-gradient-to-br from-violet-500/10 to-transparent p-4 flex flex-col justify-between">
                    <div className="w-20 h-3 rounded-full bg-violet-400/50"></div>
                    <div>
                      <div className="text-2xl font-mono text-white mb-1">$1.42M</div>
                      <div className="text-xs text-white/40 font-mono">+12.5% this week</div>
                    </div>
                  </div>
                  <div className="h-32 rounded-xl border border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent p-4 flex flex-col justify-between">
                    <div className="w-20 h-3 rounded-full bg-emerald-400/50"></div>
                    <div>
                      <div className="text-2xl font-mono text-white mb-1">99.99%</div>
                      <div className="text-xs text-white/40 font-mono">System uptime</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid - Linear Style */}
      <section id="platform" className="relative z-10 py-32 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4">A complete ecosystem.</h2>
            <p className="text-lg text-white/50 max-w-2xl">Replace dozen of fragmented tools with one tightly integrated system. SentientWire brings data consistency and operational speed.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-500/20 transition-colors"></div>
              <Database className="w-6 h-6 text-blue-400 mb-6" />
              <h3 className="text-lg font-medium text-white mb-2">Omnichannel ERP</h3>
              <p className="text-sm text-white/50 leading-relaxed">Centralized inventory, multi-warehouse sync, and automated B2B/B2C fulfillment rules running in real-time.</p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-500/20 transition-colors"></div>
              <BarChart3 className="w-6 h-6 text-emerald-400 mb-6" />
              <h3 className="text-lg font-medium text-white mb-2">Financial Engine</h3>
              <p className="text-sm text-white/50 leading-relaxed">Automated ledgers, real-time P&L, multi-currency support, and instant tax compliance reporting.</p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-violet-500/20 transition-colors"></div>
              <Workflow className="w-6 h-6 text-violet-400 mb-6" />
              <h3 className="text-lg font-medium text-white mb-2">Event-Driven Logistics</h3>
              <p className="text-sm text-white/50 leading-relaxed">Connect to 100+ carriers instantly. Automated label generation, tracking webhooks, and intelligent routing.</p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative overflow-hidden lg:col-span-2">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent group-hover:translate-x-full duration-1000 transition-transform"></div>
              <Cpu className="w-6 h-6 text-white/80 mb-6" />
              <h3 className="text-lg font-medium text-white mb-2">Developer First Architecture</h3>
              <p className="text-sm text-white/50 leading-relaxed max-w-xl mb-6">Built on Next.js 16, TypeScript, and Prisma. Extend the core system via webhooks, GraphQL APIs, and custom serverless functions deployed to the edge.</p>
              <div className="flex gap-4">
                <span className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-white/60">TypeScript</span>
                <span className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-white/60">PostgreSQL</span>
                <span className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-white/60">Redis Edge</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-900/20 to-transparent border border-blue-500/20 hover:border-blue-500/40 transition-colors relative overflow-hidden">
              <Shield className="w-6 h-6 text-blue-400 mb-6" />
              <h3 className="text-lg font-medium text-white mb-2">Bank-grade Security</h3>
              <p className="text-sm text-white/50 leading-relaxed">SOC 2 Type II certified. AES-256 encryption at rest, role-based access control, and comprehensive audit logs.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Code Demo Section */}
      <section className="relative z-10 py-32 px-6 border-y border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight mb-6">Extend without limits.</h2>
            <p className="text-lg text-white/50 mb-8">SentientWire provides a fully typed SDK. You can write custom logic that runs directly on our edge network with zero cold starts.</p>
            
            <ul className="space-y-6">
              {[
                { icon: Zap, title: "Edge Computing", desc: "Run your custom business logic close to your users globally." },
                { icon: Code2, title: "Type-Safe APIs", desc: "End-to-end type safety from the database to your frontend." },
                { icon: Fingerprint, title: "Granular Permissions", desc: "Define precise access controls for every API endpoint." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-white/80" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">{item.title}</h4>
                    <p className="text-sm text-white/50">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
              </div>
              <div className="text-xs font-mono text-white/40">src/api/webhook.ts</div>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm font-mono leading-relaxed">
                <span className="text-purple-400">import</span> <span className="text-white">{"{ SentientClient }"}</span> <span className="text-purple-400">from</span> <span className="text-green-400">'@sentient/sdk'</span>;<br/><br/>
                <span className="text-blue-400">const</span> <span className="text-white">client</span> <span className="text-blue-400">=</span> <span className="text-purple-400">new</span> <span className="text-white">SentientClient</span>({`{`}<br/>
                {"  "}apiKey: process.env.<span className="text-yellow-200">SENTIENT_KEY</span><br/>
                {`}`});<br/><br/>
                <span className="text-purple-400">export async function</span> <span className="text-yellow-200">POST</span>(req: Request) {`{`}<br/>
                {"  "}<span className="text-blue-400">const</span> order <span className="text-blue-400">=</span> <span className="text-purple-400">await</span> req.<span className="text-yellow-200">json</span>();<br/><br/>
                {"  "}<span className="text-white/40">{"// Automatically route to nearest warehouse"}</span><br/>
                {"  "}<span className="text-blue-400">const</span> allocation <span className="text-blue-400">=</span> <span className="text-purple-400">await</span> client.inventory.<span className="text-yellow-200">allocate</span>({`{`}<br/>
                {"    "}items: order.items,<br/>
                {"    "}strategy: <span className="text-green-400">'NEAREST_FIRST'</span><br/>
                {"  "}{`}`});<br/><br/>
                {"  "}<span className="text-purple-400">return</span> Response.<span className="text-yellow-200">json</span>(allocation);<br/>
                {`}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-medium tracking-tight mb-6">Ready to scale?</h2>
          <p className="text-lg text-white/50 mb-10">Join forward-thinking enterprises building on SentientWire.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/admin" className="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-medium transition-colors">
              Deploy Now
            </Link>
            <Link href="#" className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border border-white/20 hover:bg-white/5 rounded-xl font-medium transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Minimal */}
      <footer className="relative z-10 border-t border-white/10 bg-[#050505] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-bold text-xs">S</div>
                <span className="font-bold text-white tracking-tight">SentientWire</span>
              </div>
              <p className="text-sm text-white/40 max-w-xs">The infrastructure for modern commerce and enterprise management.</p>
            </div>
            
            <div className="flex gap-16">
              <div>
                <h4 className="text-white font-medium mb-4 text-sm">Product</h4>
                <ul className="space-y-3 text-sm text-white/50">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-4 text-sm">Developers</h4>
                <ul className="space-y-3 text-sm text-white/50">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5 text-xs text-white/40">
            <p>© {new Date().getFullYear()} SentientWire Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
