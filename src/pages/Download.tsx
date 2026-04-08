import { Footer } from '../components/layout/Footer';
import { Button } from '../components/Button';
import { Section } from '../components/Section';
import { SectionHeader } from '../components/SectionHeader';
import { GlassCard } from '../components/GlassCard';
import { Download as DownloadIcon, Terminal, Monitor, Info, CheckCircle2, ArrowRight, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Download() {
  const versions = [
    { 
      version: '1.0.0', 
      date: '2026-04-05', 
      changes: [
        'Initial stable release',
        'Multi-tab editing support',
        'DOCX import capability',
        'Dark/light theme toggle',
        'Word count & status bar',
        'Custom zoom controls'
      ],
      type: 'Stable'
    },
    { 
      version: '0.9.5', 
      date: '2026-03-28', 
      changes: [
        'Added DOCX import via Mammoth',
        'Improved Markdown formatting logic',
        'Fixed tab close behavior bug'
      ],
      type: 'Beta'
    },
    { 
      version: '0.9.0', 
      date: '2026-03-15', 
      changes: [
        'Initial beta release',
        'Core Markdown editor & preview',
        'Basic file operations'
      ],
      type: 'Alpha'
    }
  ];

  return (
    <div className="min-h-screen bg-editor-bg text-gray-100">
      
      <main>
        <Section containerClassName="max-w-5xl">
          <div className="flex flex-col md:flex-row items-start gap-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">Get FeatherType</h1>
              <p className="text-xl max-w-xl">
                Experience the full power of FeatherType with the native desktop application. 
                Enjoy native file system access, system integration, and better performance.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button variant="primary" className="h-16 px-10 text-xl font-bold shadow-2xl shadow-theme-primary/30 group">
                  <DownloadIcon className="mr-3" size={24} />
                  Download v1.0.0
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400 transition-colors hover:border-white/20">
                  <Terminal size={16} />
                  Check for updates via CLI
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 pt-8 border-t border-border/20">
                <div className="flex items-center gap-2">
                  <Monitor size={16} />
                  <span>Windows 10/11</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <Monitor size={16} />
                  <span>macOS (Coming soon)</span>
                </div>
              </div>
            </div>
            
            <GlassCard hoverable={false} className="w-full md:w-80 bg-gradient-to-br from-theme-primary/10 to-transparent border-theme-primary/20 shadow-xl">
               <div className="flex items-center gap-3 mb-4 text-theme-primary">
                  <Info size={24} />
                  <h3 className="text-lg font-bold">Latest Stable</h3>
               </div>
               <div className="space-y-4">
                  <div>
                     <span className="text-xs text-gray-500 uppercase tracking-widest">Version</span>
                     <p className="text-2xl font-mono font-bold text-white">1.0.0</p>
                  </div>
                  <div>
                     <span className="text-xs text-gray-500 uppercase tracking-widest">Released</span>
                     <p className="text-lg text-white">April 5, 2026</p>
                  </div>
                  <div>
                     <span className="text-xs text-gray-500 uppercase tracking-widest">Size</span>
                     <p className="text-lg text-white">8.4 MB</p>
                  </div>
               </div>
            </GlassCard>
          </div>
        </Section>

        {/* Release Log Section */}
        <Section id="releases" containerClassName="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 max-w-5xl">
           <div className="border-b border-border/20 pb-4 mb-12">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                 <CheckCircle2 className="text-theme-primary" />
                 Release History
              </h2>
           </div>
           
           <div className="space-y-8">
              {versions.map((ver, idx) => (
                <div key={ver.version} className="relative pl-8 md:pl-0 border-l md:border-l-0 border-theme-primary/20">
                   <div className="md:grid md:grid-cols-4 gap-8">
                      <div className="mb-4 md:mb-0">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl font-bold text-white">v{ver.version}</span>
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase",
                              ver.type === 'Stable' ? "bg-green-500/20 text-green-400" : "bg-theme-primary/20 text-theme-primary"
                            )}>
                              {ver.type}
                            </span>
                         </div>
                         <p className="text-sm text-gray-500 font-mono italic">{ver.date}</p>
                      </div>
                      
                      <div className="col-span-3">
                         <ul className="grid gap-3 sm:grid-cols-2">
                            {ver.changes.map((change, cIdx) => (
                              <li key={cIdx} className="flex gap-2 text-sm group hover:text-gray-200 transition-colors">
                                 <ArrowRight size={14} className="mt-1 text-theme-primary/50 group-hover:text-theme-primary transition-colors shrink-0" />
                                 {change}
                              </li>
                            ))}
                         </ul>
                      </div>
                   </div>
                   {idx < versions.length - 1 && <div className="hidden md:block h-px w-full bg-border/20 mt-12" />}
                </div>
              ))}
           </div>
        </Section>
        <Section id="feedback" className="pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400" containerClassName="max-w-5xl">
           <GlassCard hoverable={false} className="p-8 md:p-12 shadow-2xl backdrop-blur-3xl bg-white/[0.02] border-white/5">
              <div className="space-y-10">
                 <SectionHeader 
                    title={<span className="italic">Thoughts? I'd love to hear them!</span>}
                    description="Your feedback is essential for the future of FeatherType."
                    className="mb-0"
                 />
                 
                 <form className="grid gap-6 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">Name</label>
                       <input type="text" placeholder="John Doe" className="w-full h-12 bg-white/5 border border-white/10 rounded-md px-4 text-white focus:outline-none focus:border-theme-primary/50 transition-all placeholder:text-gray-500" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">Email</label>
                       <input type="email" placeholder="john@example.com" className="w-full h-12 bg-white/5 border border-white/10 rounded-md px-4 text-white focus:outline-none focus:border-theme-primary/50 transition-all placeholder:text-gray-500" />
                    </div>
                    <div className="col-span-full space-y-2">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">Subject</label>
                       <div className="relative">
                          <select className="w-full h-12 bg-white/5 border border-white/10 rounded-md px-4 text-white focus:outline-none focus:border-theme-primary/50 transition-all appearance-none cursor-pointer pr-10">
                             <option className="bg-[#1e1e1e]">General Inquiry</option>
                             <option className="bg-[#1e1e1e]">Feature Request</option>
                             <option className="bg-[#1e1e1e]">Bug Report</option>
                             <option className="bg-[#1e1e1e]">Other</option>
                          </select>
                          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                       </div>
                    </div>
                    <div className="col-span-full space-y-2">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">Message</label>
                       <textarea rows={4} placeholder="Your message..." className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-theme-primary/50 transition-all resize-none placeholder:text-gray-500" />
                    </div>
                    <div className="col-span-full">
                       <Button variant="primary" className="w-full h-14 text-lg font-bold">
                          Submit Feedback
                       </Button>
                    </div>
                 </form>
              </div>
           </GlassCard>
        </Section>
      </main>
      
      <Footer />
    </div>
  );
}
