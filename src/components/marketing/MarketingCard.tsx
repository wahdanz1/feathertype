import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../GlassCard';
import { Stack, Flex } from '../ui/Layout';
import { IconBox } from '../ui/IconBox';
import { ActionLink } from '../ui/ActionLink';
import { cn } from '../../lib/utils';

interface MarketingCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  metadata?: string;
  ctaLabel?: string;
  href?: string;
  isExternal?: boolean;
  active?: boolean;
  variant?: 'feature' | 'access' | 'social';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  className?: string;
}

const variantConfig = {
  feature: {
    padding: 'md' as const,
    border: 'subtle' as const,
    glassVariant: 'default' as const,
    gap: 4 as const,
    iconSize: 'sm' as const,
    iconVariant: 'primary' as const,
    iconAlign: 'start' as const,
    hoverable: true,
    titleSize: 'text-lg',
    descriptionStyle: 'text-theme-text-secondary',
  },
  access: {
    padding: 'xl' as const,
    border: 'none' as const,
    glassVariant: 'none' as const,
    gap: 6 as const,
    iconSize: 'lg' as const,
    iconVariant: 'primary' as const,
    iconAlign: 'center' as const,
    hoverable: false,
    titleSize: 'text-xl',
    descriptionStyle: 'text-theme-text-secondary',
  },
  social: {
    padding: 'xl' as const,
    border: 'subtle' as const,
    glassVariant: 'none' as const,
    gap: 6 as const,
    iconSize: 'lg' as const,
    iconVariant: 'secondary' as const,
    iconAlign: 'center' as const,
    hoverable: true,
    titleSize: 'text-xl',
    descriptionStyle: 'text-theme-text-muted mt-auto',
  },
};

export function MarketingCard({
  icon,
  title,
  description,
  metadata,
  ctaLabel,
  href,
  isExternal,
  active = false,
  variant = 'feature',
  rounded = '2xl',
  className
}: MarketingCardProps) {
  const isInteractive = !!href;
  const config = variantConfig[variant];

  const content = (
    <GlassCard
      className={cn("h-full group", className)}
      padding={config.padding}
      interactive={isInteractive}
      active={active}
      rounded={rounded}
      border={config.border}
      variant={config.glassVariant}
      hoverable={isInteractive && config.hoverable}
    >
      <Stack gap={config.gap} className="h-full">
        <Flex gap={config.gap} items={config.iconAlign}>
          <IconBox
            icon={icon}
            size={config.iconSize}
            variant={config.iconVariant}
            className={cn((active || variant === 'access') && "text-theme-accent")}
          />
          <Stack gap={1}>
            <h3 className={cn(
              config.titleSize,
              isInteractive && "group-hover:text-theme-accent transition-colors"
            )}>
              {title}
            </h3>
            {metadata && (
              <p className="text-sm font-mono text-theme-accent">{metadata}</p>
            )}
          </Stack>
        </Flex>
        <p className={cn("text-sm leading-relaxed", config.descriptionStyle)}>
          {description}
        </p>

        {ctaLabel && (
          <ActionLink as="span" className="mt-auto pt-2">
            {ctaLabel}
          </ActionLink>
        )}
      </Stack>
    </GlassCard>
  );

  if (!href) return content;

  if (isExternal || href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
        {content}
      </a>
    );
  }

  return (
    <Link to={href} className="block h-full">
      {content}
    </Link>
  );
}
