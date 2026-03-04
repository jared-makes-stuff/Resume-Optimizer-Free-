import { useState } from 'react';
import { FileDown, AlertCircle } from 'lucide-react';
import apiService from '../../services/apiService';
import './ResumeBuilder.css';

function ResumeBuilder({ profileData }) {
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: profileData?.name || '',
    phone: '',
    email: profileData?.email || '',
    linkedinUrl: profileData?.linkedinUrl || profileData?.publicProfileUrl || '',
    githubUrl: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateResume = async () => {
    setIsBuilding(true);
    setError(null);

    try {
      // Load the template
      const response = await fetch('/templates/resume_blank.tex');
      let template = await response.text();

      // Replace placeholders
      template = template
        .replace(/{{NAME}}/g, formData.name)
        .replace(/{{PHONE}}/g, formData.phone)
        .replace(/{{EMAIL}}/g, formData.email)
        .replace(/{{LINKEDIN_URL}}/g, formData.linkedinUrl)
        .replace(/{{LINKEDIN_DISPLAY}}/g, formData.linkedinUrl.replace('https://', ''))
        .replace(/{{GITHUB_URL}}/g, formData.githubUrl)
        .replace(/{{GITHUB_DISPLAY}}/g, formData.githubUrl.replace('https://', ''));

      // Send to backend for compilation
      const pdfBlob = await apiService.compileLatex(template);

      // Download PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Error generating resume:', err);
      setError('Failed to compile resume. Make sure LaTeX is installed on your system.');
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="resume-builder">
      <div className="builder-header">
        <h2>
          <FileDown size={24} />
          Resume Builder
        </h2>
        <p>Fill in your details below to generate a professional LaTeX resume PDF.</p>
      </div>

      <div className="latex-info">
        <AlertCircle size={18} />
        <p><strong>Note:</strong> This feature requires LaTeX to be installed on your computer. 
        If you don't have LaTeX, use the <strong>Prompt Generator</strong> tab to create a customized resume with an LLM instead.</p>
      </div>

      <form className="resume-form" onSubmit={(e) => { e.preventDefault(); generateResume(); }}>
        <div className="form-section">
          <h3>Personal Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="123-456-7890"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="linkedinUrl">LinkedIn URL</label>
              <input
                type="url"
                id="linkedinUrl"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="githubUrl">GitHub URL (Optional)</label>
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/..."
              />
            </div>
          </div>
        </div>

        <div className="form-note">
          <p><strong>Note:</strong> This is a simplified builder. For full customization, use the Prompt Generator to create a tailored resume with all your experiences, projects, and skills.</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <button 
          type="submit" 
          className="build-btn"
          disabled={isBuilding}
        >
          {isBuilding ? 'Generating PDF...' : 'Generate Resume PDF'}
        </button>
      </form>
    </div>
  );
}

export default ResumeBuilder;
