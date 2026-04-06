import { Link } from 'react-router-dom';
import { Feather, Feather as Github, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-editor-bg py-12 px-4 shadow-inner">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-theme-primary/10 text-theme-primary transition-all group-hover:bg-theme-primary group-hover:text-white">
              <Feather size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">FeatherType</span>
          </Link>
          <p className="text-sm max-w-xs transition-colors">
            A feather-light writing experience that stays out of your way. Built with modern tools and a minimalist philosophy.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-theme-primary mb-4">Product</h4>
          <ul className="flex flex-col gap-2">
            <li><Link to="/editor" className="text-sm text-gray-400 hover:text-theme-primary transition-colors">Web Editor</Link></li>
            <li><Link to="/download" className="text-sm text-gray-400 hover:text-theme-primary transition-colors">Download App</Link></li>
            <li><Link to="/download#releases" className="text-sm text-gray-400 hover:text-theme-primary transition-colors">Release Log</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-theme-primary mb-4">Community</h4>
          <ul className="flex flex-col gap-2">
            <li><a href="https://github.com/wahdanz1/feathertype" className="text-sm text-gray-400 hover:text-theme-primary transition-colors flex items-center gap-2">GitHub <Github size={14} /></a></li>
            <li><Link to="/download#feedback" className="text-sm text-gray-400 hover:text-theme-primary transition-colors">Feedback Form</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-theme-primary mb-4">Legal</h4>
          <ul className="flex flex-col gap-2">
            <li><Link to="/privacy" className="text-sm text-gray-400 hover:text-theme-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-sm text-gray-400 hover:text-theme-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto mt-12 pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs flex items-center gap-1">
          © {new Date().getFullYear()} FeatherType.
        </p>
        <div className="flex gap-6">
          <span className="text-xs text-gray-600 bg-border/20 px-2 py-1 rounded transition-colors hover:bg-border/30">v1.0.0 Stable</span>
        </div>
      </div>
    </footer>
  );
}
