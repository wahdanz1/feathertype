import React, { useEffect } from 'react';
import { LuX } from 'react-icons/lu';
import { cn } from '../lib/utils';
import { useEditorStore } from '../store/useEditorStore';
import { Button } from './Button';
import { Flex } from './ui/Layout';
import { IconBox } from './ui/IconBox';

export interface DialogAction {
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  onClick: () => void;
}

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: DialogAction[];
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  actions,
  maxWidth = 'md',
}: DialogProps) {
  const theme = useEditorStore((s) => s.theme);
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const panelStyles = isDark
    ? 'bg-editor-surface border-border text-theme-text'
    : 'bg-white border-gray-300 text-gray-900';

  const headerFooterStyles = isDark
    ? 'border-border bg-editor-surface-raised'
    : 'border-gray-200 bg-gray-50';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={cn(
          "w-full overflow-hidden rounded-xl shadow-2xl border animate-in zoom-in duration-200",
          maxWidthClasses[maxWidth],
          panelStyles
        )}
      >
        {/* Header */}
        <Flex
          justify="between"
          className={cn("px-6 py-4 border-b", headerFooterStyles)}
        >
          <Flex gap={3}>
            {icon && (
              <IconBox icon={icon} size="sm" variant="ghost" className="text-yellow-500" />
            )}
            <h3 className="text-lg font-bold">{title}</h3>
          </Flex>
          <Button
            variant="ghost"
            iconOnly
            size="sm"
            onClick={onClose}
          >
            <LuX size={20} />
          </Button>
        </Flex>

        {/* Body */}
        <div className="p-8">
          {description && (
            <p className={cn("text-sm mb-6", isDark ? 'text-theme-text-muted' : 'text-gray-500')}>
              {description}
            </p>
          )}
          {children}
        </div>

        {/* Footer: actions or custom */}
        {actions && (
          <Flex
            justify="end"
            gap={2}
            className={cn("px-6 py-4 border-t flex-wrap", headerFooterStyles)}
          >
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant ?? 'secondary'}
                size="sm"
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </Flex>
        )}
        {footer && !actions && (
          <div className={cn("px-6 py-4 border-t", headerFooterStyles)}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
