import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Copy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { generateLatex } from '../lib/latexGenerator';

export function ResumeGenerator({ data, onResumeGenerate }) {
  const [latexResume, setLatexResume] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLatexResume = () => {
    setIsGenerating(true);

    // Simulate generation delay
    setTimeout(() => {
      const latex = generateLatex(data);
      setLatexResume(latex);
      onResumeGenerate(latex);
      setIsGenerating(false);
      toast.success('LaTeX resume generated!');
    }, 1000);
  };

  useEffect(() => {
    generateLatexResume();
  }, [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(latexResume);
    toast.success('LaTeX code copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-2xl font-semibold">LaTeX Resume Generator</h2>
          <p className="text-muted-foreground">
            Generated resume based on your LinkedIn profile
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={generateLatexResume}
            disabled={isGenerating}
            className="rounded-xl"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Regenerate'}
          </Button>
          <Button
            variant="outline"
            onClick={handleCopy}
            className="rounded-xl"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy LaTeX
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 rounded-3xl space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-medium">LaTeX Source Code</h3>
            <p className="text-sm text-muted-foreground">
              Copy this code and compile it with a LaTeX editor like Overleaf, TeXworks, or paste it into an LLM for modifications.
            </p>
          </div>

          <Textarea
            value={latexResume}
            onChange={(e) => {
              setLatexResume(e.target.value);
              onResumeGenerate(e.target.value);
            }}
            className="rounded-2xl font-mono text-sm min-h-[500px] bg-muted"
          />
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 rounded-3xl bg-muted/50">
          <div className="space-y-3">
            <h4 className="font-medium">How to Use Your LaTeX Resume</h4>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Copy the LaTeX code above</li>
              <li>Paste it into <a href="https://www.overleaf.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Overleaf</a> (free online LaTeX editor)</li>
              <li>Compile to see your formatted resume</li>
              <li>Edit the content directly or use the Job Matcher tab to optimize it for specific positions</li>
              <li>Download as PDF when ready</li>
            </ul>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
