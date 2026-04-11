import { Flex, Grid } from './Layout';
import { LuCircleCheck } from 'react-icons/lu';
import { cn } from '../../lib/utils';

interface BulletListProps {
  items: string[];
  cols?: 1 | 2;
  className?: string;
}

export function BulletList({ items, cols = 1, className }: BulletListProps) {
  return (
    <Grid cols={cols} gap={2} className={cn("mt-8", className)}>
      {items.map((item) => (
        <Flex key={item} gap={3} items="start" className="text-sm">
          <LuCircleCheck size={16} className="text-theme-accent mt-0.5 shrink-0" />
          <span className="leading-relaxed">{item}</span>
        </Flex>
      ))}
    </Grid>
  );
}
