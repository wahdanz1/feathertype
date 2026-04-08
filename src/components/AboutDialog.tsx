import { useEditorStore } from '../store/useEditorStore';
import { X, ExternalLink, Download, MessageSquare, Heart } from 'lucide-react';

export function AboutDialog() {
  const isOpen = useEditorStore((s) => s.showAboutDialog);
  const setShowAboutDialog = useEditorStore((s) => s.setShowAboutDialog);
  const theme = useEditorStore((s) => s.theme);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md overflow-hidden rounded-xl shadow-2xl border animate-in fade-in zoom-in duration-200 ${isDark
          ? 'bg-[#252526] border-[#3e3e42] text-gray-200'
          : 'bg-white border-gray-300 text-gray-900'
        }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-[#3e3e42] bg-[#2a2d2e]' : 'border-gray-200 bg-gray-50'
          }`}>
          <h3 className="text-lg font-bold">About FeatherType</h3>
          <button
            onClick={() => setShowAboutDialog(false)}
            className="p-1 rounded-md hover:bg-black/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg mb-4">
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-white fill-current">
              <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.08-.34.12-.57.12s-.41-.04-.57-.12l-7.9-4.44A1.01 1.01 0 013 16.5V7.5c0-.38.21-.71.53-.88l7.9-4.44c.16-.08.34-.12.57-.12s.41.04.57.12l7.9 4.44c.32.17.53.5.53.88v9z" />
            </svg>
          </div>

          <h2 className="text-2xl font-black tracking-tight">FeatherType</h2>
          <p className="text-sm font-medium text-blue-500 mb-6">Version 1.0.0</p>

          <p className={`text-sm leading-relaxed mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            A minimalist, distraction-free markdown editor <br />
            crafted for speed and elegance.
          </p>

          <div className="grid grid-cols-1 gap-3 w-full">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isDark
                  ? 'bg-[#2d2d2d] hover:bg-[#3e3e42] border border-[#3e3e42]'
                  : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                }`}
            >
              <ExternalLink size={16} />
              Visit Website
            </a>
            <a
              href="https://feathertype.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isDark
                  ? 'bg-[#2d2d2d] hover:bg-[#3e3e42] border border-[#3e3e42]'
                  : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                }`}
            >
              <Download size={16} />
              Check for Updates
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md active:scale-95"
            >
              <MessageSquare size={16} />
              Send Feedback
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex flex-col items-center justify-center gap-1 ${isDark ? 'border-[#3e3e42] bg-[#2a2d2e]' : 'border-gray-200 bg-gray-50'
          }`}>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
            Handcrafted with <Heart size={10} className="inline text-red-500 fill-current mx-0.5 mb-0.5" /> by Daniel
          </p>
          <p className="text-[10px] text-gray-500 opacity-60">
            © 2026 FeatherType. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
