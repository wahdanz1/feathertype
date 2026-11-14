import React, { useEffect, useId, useLayoutEffect, useRef } from 'react';
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

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Dialog(props: DialogProps) {
  if (!props.isOpen) return null;
  return <ModalDialog {...props} />;
}

function ModalDialog({
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  actions,
  maxWidth = 'md',
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();

    return () => {
      if (dialog.open) dialog.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);

  // The parent owns open state. Chrome refuses to cancel a repeated Escape without user activation,
  // so a close that still happens is reported through onClose as well.
  const handleCancel = (e: React.SyntheticEvent) => {
    if (!e.cancelable) return;
    e.preventDefault();
    onCloseRef.current();
  };

  // showModal makes the page inert but would still let Tab reach the browser chrome; wrap inside the dialog instead.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;
    if (e.shiftKey && (current === first || !e.currentTarget.contains(current))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && current === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const primary = actions?.find((a) => a.variant === 'primary') ?? actions?.[0];

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleCancel}
      onClose={() => { if (!ref.current?.open) onCloseRef.current(); }}
      onKeyDown={handleKeyDown}
      className={cn("dialog panel animate-in fade-in duration-200", maxWidthClasses[maxWidth])}
    >
      <Flex justify="between" className="px-6 py-4 border-b panel-header">
        <Flex gap={3}>
          {icon && (
            <IconBox icon={icon} size="sm" variant="ghost" className="text-yellow-500" />
          )}
          <h2 id={titleId} className="dialog-title">{title}</h2>
        </Flex>
        <Button
          variant="ghost"
          iconOnly
          size="sm"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <LuX size={20} aria-hidden />
        </Button>
      </Flex>

      <div className="p-8">
        {description && (
          <p id={descriptionId} className="text-sm mb-6 text-muted">
            {description}
          </p>
        )}
        {children}
      </div>

      {actions && (
        <Flex
          justify="end"
          gap={2}
          className="px-6 py-4 border-t flex-wrap panel-header"
        >
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant ?? 'secondary'}
              size="sm"
              onClick={action.onClick}
              data-autofocus={action === primary ? true : undefined}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </Flex>
      )}
      {footer && !actions && (
        <div className="px-6 py-4 border-t panel-header">
          {footer}
        </div>
      )}
    </dialog>
  );
}
