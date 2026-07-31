import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {icon && (
        <div className="mb-4 text-text-muted opacity-50">
          {icon}
        </div>
      )}
      <h3 className="text-2xl font-serif text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-text-muted max-w-md mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
