import { Github, Globe2 } from 'lucide-react';
import { Button } from './ui/button';

const PROJECT_LINKS = {
  github: 'https://github.com/jared-makes-stuff/Resume-Optimizer-Free-',
  portfolio: 'https://www.jared-makes-stuff.com/',
};

export function ProjectLinks({ className = '' }) {
  return (
    <div className={`flex flex-wrap items-center justify-end gap-2 ${className}`}>
      <Button asChild variant="outline" size="sm" className="bg-background/85 backdrop-blur">
        <a
          href={PROJECT_LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open the GitHub repository"
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
      </Button>

      <Button asChild variant="outline" size="sm" className="bg-background/85 backdrop-blur">
        <a
          href={PROJECT_LINKS.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Jared's portfolio website"
        >
          <Globe2 className="h-4 w-4" />
          Portfolio
        </a>
      </Button>
    </div>
  );
}

