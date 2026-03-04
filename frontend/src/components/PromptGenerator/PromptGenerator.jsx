import { useState } from 'react';
import { FileText, Copy, Check, AlertCircle } from 'lucide-react';
import apiService from '../../services/apiService';
import './PromptGenerator.css';

function PromptGenerator({ profileData }) {
  const [jobDescription, setJobDescription] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [latexCompilerAvailable, setLatexCompilerAvailable] = useState(true);

  const promptTemplate = `I need help customizing my resume for a specific job posting. Please generate a complete LaTeX resume using the provided template and my profile information, tailored to the job requirements.

=== JOB POSTING ===
{{JOB_DESCRIPTION}}

=== MY PROFILE INFORMATION ===
{{LINKEDIN_JSON_DATA}}

=== LATEX RESUME TEMPLATE ===
\`\`\`latex
{{RESUME_BLANK_TEX}}
\`\`\`

=== INSTRUCTIONS ===
Please:
1. Analyze the job posting to identify key requirements, skills, and qualifications
2. Review my profile information and identify relevant experiences, projects, and skills
3. Fill in the LaTeX template with my information, prioritizing and highlighting:
   - Experience most relevant to this specific role
   - Skills explicitly mentioned in the job posting
   - Projects that demonstrate required competencies
   - Education credentials that match requirements
4. Customize bullet points to use keywords and terminology from the job posting
5. Quantify achievements where possible (numbers, percentages, scale)
6. Keep the total resume to 1-2 pages maximum
7. Ensure all LaTeX syntax is correct and compilable
8. Use action verbs and strong, concise language

Please output ONLY the complete filled LaTeX resume code that I can compile directly (no explanations or markdown, just the raw .tex file content).`;

  const generatePrompt = async () => {
    if (!jobDescription.trim()) {
      alert('Please paste a job description first');
      return;
    }

    // Get resume template
    let resumeTemplate = '';
    try {
      const response = await fetch('/templates/resume_blank.tex');
      resumeTemplate = await response.text();
    } catch (error) {
      console.error('Error loading template:', error);
      resumeTemplate = '% LaTeX template not loaded - you can add it manually';
    }

    // Generate prompt
    const prompt = promptTemplate
      .replace('{{JOB_DESCRIPTION}}', jobDescription)
      .replace('{{LINKEDIN_JSON_DATA}}', JSON.stringify(profileData, null, 2))
      .replace('{{RESUME_BLANK_TEX}}', resumeTemplate);

    setGeneratedPrompt(prompt);
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="prompt-generator">
      <div className="generator-header">
        <h2>
          <FileText size={24} />
          LLM Prompt Generator
        </h2>
        <p>Paste a job description below to generate a customized prompt for ChatGPT, Claude, or other LLMs to create a tailored resume.</p>
      </div>

      {!latexCompilerAvailable && (
        <div className="latex-warning">
          <AlertCircle size={20} />
          <div>
            <strong>LaTeX Compiler Not Detected</strong>
            <p>You can still generate a prompt and use an external LLM to create your resume. 
            Compile the generated LaTeX code on <a href="https://www.overleaf.com" target="_blank" rel="noopener noreferrer">Overleaf</a>.</p>
          </div>
        </div>
      )}

      <div className="generator-content">
        <div className="input-section">
          <label htmlFor="job-description">
            <strong>Step 1:</strong> Paste Job Description
          </label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here...

Example:
Senior Software Engineer
Company XYZ is looking for an experienced software engineer...
Requirements:
- 5+ years of experience with React
- Strong knowledge of...
"
            rows={12}
          />
          <button 
            className="generate-btn"
            onClick={generatePrompt}
            disabled={!jobDescription.trim()}
          >
            Generate Prompt
          </button>
        </div>

        {generatedPrompt && (
          <div className="output-section">
            <div className="output-header">
              <label>
                <strong>Step 2:</strong> Copy & Paste into ChatGPT/Claude
              </label>
              <button
                className="copy-prompt-btn"
                onClick={copyPrompt}
              >
                {isCopied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Prompt
                  </>
                )}
              </button>
            </div>
            <div className="prompt-preview">
              <pre>{generatedPrompt}</pre>
            </div>
            <div className="usage-instructions">
              <h4>How to Use:</h4>
              <ol>
                <li>Click "Copy Prompt" above</li>
                <li>Open <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer">ChatGPT</a> or <a href="https://claude.ai" target="_blank" rel="noopener noreferrer">Claude</a></li>
                <li>Paste the prompt and send</li>
                <li>Copy the generated LaTeX code</li>
                <li>Compile it locally or on <a href="https://www.overleaf.com" target="_blank" rel="noopener noreferrer">Overleaf</a></li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PromptGenerator;
