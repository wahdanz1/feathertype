import { Footer } from '../components/layout/Footer';
import { Button } from '../components/Button';
import { Section } from '../components/Section';
import { SectionHeader } from '../components/SectionHeader';
import { GlassCard } from '../components/GlassCard';
import { Mail, Feather as Github, Send, HelpCircle, Heart } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-editor-bg text-gray-100 selection:bg-theme-primary selection:text-white">
      
      <main>
        <Section containerClassName="max-w-4xl">
           <SectionHeader 
              title="We'd love to hear from you."
              description="Questions about FeatherType? Feedback on a feature? Want to say hi? We're just a message away."
              center={true}
           />

        <div className="grid gap-12 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
           {/* Direct Channels */}
           <div className="space-y-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-border/20 pb-4">
                 <HelpCircle className="text-theme-primary" size={20} />
                 Support & Info
              </h3>
              
              <div className="space-y-6">
                 <Channel 
                   icon={<Mail className="text-theme-primary" />}
                   title="Email"
                   value="support@feathertype.app"
                   description="For account issues, business inquiries, or general support."
                 />
                 <Channel 
                   icon={<Github className="text-theme-primary" />}
                   title="GitHub"
                   value="Original Repository"
                   description="For bug reports, feature requests, and community contributions."
                   link="https://github.com/wahdanz1/feathertype"
                 />
              </div>

              <div className="p-6 rounded-2xl bg-theme-primary/10 border border-theme-primary/20 mt-12 flex items-center gap-4 group">
                 <div className="h-12 w-12 rounded-xl bg-theme-primary/20 text-theme-primary flex items-center justify-center shrink-0 group-hover:bg-theme-primary group-hover:text-white transition-all">
                    <Heart size={24} />
                 </div>
                 <p className="text-sm leading-relaxed italic">
                   "FeatherType is a labor of love. Every piece of feedback helps make it better for everyone."
                 </p>
              </div>
           </div>

           {/* Contact Form */}
           <GlassCard hoverable={false} className="p-8 md:p-10 shadow-2xl backdrop-blur-3xl bg-white/[0.02] border-white/5">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                 <Send className="text-theme-primary" size={20} />
                 Send a message
              </h3>
              
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                 <div className="space-y-2 group">
                    <label className="text-sm font-medium group-focus-within:text-theme-primary transition-colors">Name</label>
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-md px-4 text-white focus:outline-none focus:border-theme-primary/50 focus:bg-white/[0.07] transition-all placeholder:text-gray-500"
                    />
                 </div>
                 <div className="space-y-2 group">
                    <label className="text-sm font-medium group-focus-within:text-theme-primary transition-colors">Email</label>
                    <input 
                      type="email" 
                      placeholder="your@email.com" 
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-md px-4 text-white focus:outline-none focus:border-theme-primary/50 focus:bg-white/[0.07] transition-all placeholder:text-gray-500"
                    />
                 </div>
                 <div className="space-y-2 group">
                    <label className="text-sm font-medium group-focus-within:text-theme-primary transition-colors">Message</label>
                    <textarea 
                      rows={5} 
                      placeholder="What's on your mind?" 
                      className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-theme-primary/50 focus:bg-white/[0.07] transition-all placeholder:text-gray-500 resize-none"
                    />
                 </div>
                 
                 <Button variant="primary" className="w-full h-14 text-lg font-bold shadow-xl shadow-theme-primary/20 group">
                    Send Message
                    <Send className="ml-2 transition-transform group-hover:translate-x-1" size={18} />
                 </Button>
              </form>
           </GlassCard>
        </div>
      </Section>
    </main>
      
      <Footer />
    </div>
  );
}

function Channel({ icon, title, value, description, link }: { icon: React.ReactNode, title: string, value: string, description: string, link?: string }) {
  const content = (
    <div className="flex gap-4 group cursor-pointer transition-all hover:translate-x-1">
       <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center shrink-0 group-hover:bg-theme-primary/20 group-hover:text-theme-primary group-hover:border-theme-primary/30 transition-all duration-300">
          {icon}
       </div>
       <div>
          <h4 className="text-sm font-bold text-white group-hover:text-theme-primary transition-colors">{title}</h4>
          <p className="text-xs text-theme-primary font-mono mb-1">{value}</p>
          <p className="text-xs max-w-[240px] leading-relaxed transition-colors">{description}</p>
       </div>
    </div>
  );

  return link ? <a href={link} className="no-underline">{content}</a> : <div>{content}</div>;
}
