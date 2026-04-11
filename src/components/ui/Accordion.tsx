import React, { createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../GlassCard';

interface AccordionContextProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionContext = createContext<AccordionContextProps | undefined>(undefined);

function useAccordion() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an AccordionItem');
  }
  return context;
}

interface AccordionItemProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
  activeIndicator?: React.ReactNode;
}

export function AccordionItem({ 
  isOpen, 
  onToggle, 
  children, 
  className,
  activeIndicator 
}: AccordionItemProps) {
  return (
    <AccordionContext.Provider value={{ isOpen, onToggle }}>
      <div className={cn("group relative w-full", className)}>
        {activeIndicator}
        <GlassCard
          variant="muted"
          padding="none"
          border="subtle"
          overflow="hidden"
          className="border-l-0 rounded-l-none"
        >
          {children}
        </GlassCard>
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { onToggle } = useAccordion();
  return (
    <button
      onClick={onToggle}
      className={cn("w-full text-left p-6 md:p-8 transition-colors hover:bg-white/[0.01] cursor-pointer", className)}
    >
      {children}
    </button>
  );
}

export function AccordionContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isOpen } = useAccordion();

  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="overflow-hidden">
        <div className={cn("px-8 pb-10 border-t border-white/5", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
