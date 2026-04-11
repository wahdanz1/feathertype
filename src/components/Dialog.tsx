import React, { useEffect } from 'react';
import { LuX } from 'react-icons/lu';
import { cn } from '../lib/utils';
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

  // These classes auto-switch via .light-theme in globals.css
  const panelClass = 'panel';
  const headerFooterClass = 'panel-header';

  return (
    <div className="dialog-overlay animate-in fade-in duration-200">
      <div
        className={cn(
          "w-full overflow-hidden rounded-xl",
          maxWidthClasses[maxWidth],
          panelClass
        )}
      >
        {/* Header */}
        <Flex
          justify="between"
          className={cn("px-6 py-4 border-b", headerFooterClass)}
        >
          <Flex gap={3}>
            {icon && (
              <IconBox icon={icon} size="sm" variant="ghost" className="text-yellow-500" />
            )}
            <h3>{title}</h3>
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
            <p className="text-sm mb-6 text-muted">
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
            className={cn("px-6 py-4 border-t flex-wrap", headerFooterClass)}
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
          <div className={cn("px-6 py-4 border-t", headerFooterClass)}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
