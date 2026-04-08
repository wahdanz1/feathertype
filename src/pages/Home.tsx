import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Footer } from '../components/layout/Footer';
import { Section } from '../components/Section';
import { SectionHeader } from '../components/SectionHeader';
import { GlassCard } from '../components/GlassCard';
import { 
  Zap, 
  FileText, 
  Monitor, 
  Download, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-editor-bg text-gray-100 selection:bg-theme-primary selection:text-white">
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 text-center ">
          {/* Subtle background glow */}
          <div className="absolute -top-24 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-theme-primary/10 blur-[120px]" />
          
          <div className="container mx-auto flex max-w-4xl flex-col items-center gap-8 py-12 md:py-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center gap-3 rounded-full bg-theme-primary/10 px-4 py-1.5 text-sm font-medium text-theme-primary ring-1 ring-inset ring-theme-primary/20 hover:bg-theme-primary/20 transition-all cursor-default">
              <span className="flex h-1.5 w-1.5 rounded-full bg-theme-primary animate-pulse" />
              v1.0.0 is now available for Windows & Web
            </div>
            
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
              Focus on <span className="text-transparent bg-clip-text bg-gradient-to-r from-theme-primary to-theme-primary/80">writing</span>, <br />
              leave the noise behind.
            </h1>
            
            <p className="max-w-2xl text-lg sm:text-xl md:text-2xl leading-relaxed">
              FeatherType is a feather-light Markdown editor built for writers who crave speed, 
              minimalism, and local-first control. No distractions, just your words.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 mt-4">
              <Link to="/editor">
                <Button variant="primary" size="lg" className="shadow-2xl shadow-theme-primary/30 group">
                  Try Editor Online
                  <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
                </Button>
              </Link>
              <Link to="/download">
                <Button variant="secondary" size="lg">
                  Download for Desktop
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Editor Mockup / UI Preview */}
          <div className="relative mt-8 w-full max-w-6xl overflow-hidden rounded-2xl border border-border/40 bg-editor-bg shadow-2xl shadow-black/50 transition-transform hover:scale-[1.01] duration-500 group">
             <div className="flex h-10 items-center justify-between border-b border-border/20 bg-editor-bg/50 px-4">
                <div className="flex items-center gap-1.5 focus-within:ring-1 focus-within:ring-theme-primary/40 rounded px-2 py-0.5">
                   <div className="h-3 w-3 rounded-full bg-red-400/30" />
                   <div className="h-3 w-3 rounded-full bg-yellow-400/30" />
                   <div className="h-3 w-3 rounded-full bg-green-400/30" />
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-widest">
                   <FileText size={12} />
                   FeatherType Editor
                </div>
                <div className="w-12 h-4" />
             </div>
             <div className="flex bg-gradient-to-b from-[#1e1e1e] to-[#121212] overflow-hidden min-h-[400px]">
                {/* Editor Pane (Left) */}
                <div className="flex-1 p-8 md:p-12 border-r border-white/5 opacity-90">
                  <div className="space-y-6 font-mono text-sm md:text-base">
                    <div className="flex gap-4">
                       <span className="text-theme-primary">#</span>
                       <span className="text-white font-bold">FeatherType Editor</span>
                    </div>
                    <div className="space-y-2">
                      <p>Focus on <span className="text-theme-primary italic">writing</span>, the noise is gone.</p>
                      <p>Your ideas deserve a lightweight home.</p>
                    </div>
                    <div className="h-px w-full bg-white/5" />
                    <div className="space-y-3">
                      <div className="flex gap-4">
                         <span className="text-theme-primary">-</span>
                         <span className="text-gray-300">Markdown native support</span>
                      </div>
                      <div className="flex gap-4">
                         <span className="text-theme-primary">-</span>
                         <span className="text-gray-300">Local-first privacy</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Pane (Right) - Hidden on mobile for mockup simplicity */}
                <div className="hidden md:block flex-1 p-8 md:p-12 bg-white/5 backdrop-blur-sm">
                  <div className="prose prose-invert prose-sm md:prose-base space-y-6">
                    <h1 className="text-2xl font-bold text-white border-b border-white/10 pb-2">FeatherType Editor</h1>
                    <div className="space-y-4">
                      <p>Focus on <em className="text-theme-primary">writing</em>, the noise is gone.</p>
                      <p>Your ideas deserve a lightweight home.</p>
                    </div>
                    <ul className="space-y-2 list-disc list-inside text-gray-300 decoration-theme-primary">
                      <li>Markdown native support</li>
                      <li>Local-first privacy</li>
                      <li>DOCX import and export</li>
                    </ul>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* Features Grid */}
        <Section>
          <SectionHeader 
            title={<>Everything you need, <br /> nothing you don't.</>}
            description="Designed for maximum focus and zero friction. We didn't reinvent the wheel, we just made it lighter."
          />
          
          <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              icon={<Zap size={24} />}
              title="Extreme Performance"
              description="Built with Rust and optimized React, FeatherType opens in milliseconds and stays fluid even with massive documents."
            />
            <FeatureCard 
              icon={<ShieldCheck size={24} />}
              title="Markdown Support"
              description="Native GFM support with live vertical split-pane preview. Write with speed, see with clarity."
            />
            <FeatureCard 
              icon={<FileText size={24} />}
              title="DOCX Import"
              description="Open Microsoft Word documents directly. FeatherType converts them to clean Markdown automatically for seamless editing."
            />
            <FeatureCard 
              icon={<CheckCircle2 size={24} />}
              title="Multi-Tab Editing"
              description="Organize multiple projects in one window. Unsaved changes are tracked so you never lose your progress."
            />
            <FeatureCard 
              icon={<Monitor size={24} />}
              title="Offline First"
              description="Your data stays on your machine. No cloud, no tracking, just local-first privacy and speed."
            />
          </div>
        </Section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-24 mb-16">
          <div className="relative overflow-hidden rounded-3xl bg-theme-primary/5 border border-theme-primary/10 px-8 py-16 text-center md:px-16 md:py-24">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-theme-primary/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-32 w-32 rounded-full bg-theme-primary/20 blur-3xl" />
            
            <div className="relative z-10 flex flex-col items-center gap-8">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Ready to write?</h2>
              <p className="max-w-2xl text-lg">
                Experience the lightness of FeatherType today. Available as a desktop application for offline power, 
                or right here in your browser.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                 <Link to="/download">
                    <Button variant="primary" className="px-8 shadow-lg shadow-theme-primary/20">
                       <Download className="mr-2" size={18} />
                       Download Latest
                    </Button>
                 </Link>
                 <Link to="/editor">
                    <Button variant="secondary" className="px-8">
                       Launch Web Editor
                    </Button>
                 </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <GlassCard className="flex flex-col gap-4 w-full md:max-w-[350px]">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-theme-primary/10 transition-all duration-300 text-theme-primary">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white transition-colors">{title}</h3>
      <p className="leading-relaxed transition-colors">{description}</p>
    </GlassCard>
  );
}
