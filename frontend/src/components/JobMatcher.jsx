import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Copy, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

const MAX_JOB_DESCRIPTION_LENGTH = 20000;

export function JobMatcher({ resume = '' }) {
  const [jobDescription, setJobDescription] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const generatePrompt = () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description first');
      return;
    }

    if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
      toast.error('Please keep the job description under 20,000 characters.');
      return;
    }

    if (!resume.trim()) {
      toast.error('Please generate a resume in the Resume Generator tab first');
      return;
    }

    const prompt = `You are an expert resume writer and career consultant. I need you to tailor my LaTeX resume to match a specific job description while maintaining truthfulness and highlighting relevant experience.

**Job Description:**
${jobDescription}

**Current LaTeX Resume:**
\`\`\`latex
${resume}
\`\`\`

**Instructions:**
1. Analyze the job description and identify key requirements, skills, and keywords
2. Modify the Professional Summary to emphasize relevant experience and skills that match the job requirements
3. Reorder and rewrite experience bullet points to highlight achievements and responsibilities most relevant to this position
4. Incorporate important keywords from the job description naturally throughout the resume
5. Adjust the skills section to prioritize skills mentioned in the job description
6. Ensure all modifications remain truthful - do not fabricate experience or skills
7. Maintain the LaTeX formatting and structure
8. Keep the resume concise and impactful (ideally 1-2 pages)

**Output:**
Please provide the modified LaTeX resume code that is optimized for this specific job posting. Include brief comments (as LaTeX comments using %) explaining major changes you made and why.`;

    setGeneratedPrompt(prompt);
    toast.success('Prompt generated! Copy it to use with ChatGPT or Claude.');
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      toast.success('Prompt copied to clipboard!');
    } catch {
      toast.error('Unable to copy prompt.');
    }
  };

  const handleCopyJobDescription = async () => {
    try {
      await navigator.clipboard.writeText(jobDescription);
      toast.success('Job description copied to clipboard!');
    } catch {
      toast.error('Unable to copy job description.');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h2 className="text-2xl font-semibold">Job Description Matcher</h2>
        <p className="text-muted-foreground">
          Generate an AI prompt to tailor your resume for a specific job
        </p>
      </motion.div>

      {/* Job Description Input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="job-description">Paste Job Description</Label>
            {jobDescription && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyJobDescription}
                className="rounded-xl"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            )}
          </div>
          
          <Textarea
            id="job-description"
            placeholder="Paste the job description here... Include the job title, responsibilities, requirements, qualifications, and any other relevant information."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="rounded-2xl min-h-[200px] bg-muted"
          />

          <Button
            onClick={generatePrompt}
            className="rounded-xl w-full"
            size="lg"
          >
            <Wand2 className="mr-2 h-5 w-5" />
            Generate AI Optimization Prompt
          </Button>
        </Card>
      </motion.div>

      {/* Generated Prompt */}
      {generatedPrompt && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-medium">Generated Prompt for LLM</h3>
                <p className="text-sm text-muted-foreground">
                  Copy this prompt and use it with ChatGPT, Claude, or your preferred AI assistant
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleCopyPrompt}
                className="rounded-xl"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Prompt
              </Button>
            </div>
            
            <div className="bg-muted rounded-2xl p-4 overflow-auto max-h-[400px]">
              <pre className="text-sm whitespace-pre-wrap">
                {generatedPrompt}
              </pre>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: generatedPrompt ? 0.3 : 0.2 }}
      >
        <Card className="p-6 rounded-3xl bg-muted/50">
          <div className="space-y-3">
            <h4 className="font-medium">How to Use the Generated Prompt</h4>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Paste the job description in the text area above</li>
              <li>Click &quot;Generate AI Optimization Prompt&quot;</li>
              <li>Copy the generated prompt</li>
              <li>Open ChatGPT, Claude, or your preferred AI assistant</li>
              <li>Paste the prompt and let the AI optimize your resume</li>
              <li>Review the AI&apos;s suggestions and make any final adjustments</li>
              <li>Compile the modified LaTeX code in Overleaf or your LaTeX editor</li>
            </ol>
            <p className="text-sm text-muted-foreground pt-2">
              <strong>Tip:</strong> The prompt includes your resume and specific instructions to help the AI tailor it effectively while keeping all information truthful.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
