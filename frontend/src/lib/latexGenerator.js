// Helper function to escape special LaTeX characters
const escapeLatex = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/([&%$#_{}])/g, '\\$1')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
};

export const generateLatex = (data) => {
    const profile = data.profile || {};
    const experiences = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const certifications = data.certifications || [];

    // Construct Header dynamically to avoid empty delimiters or broken hrefs
    const headerParts = [];
    if (profile.phone) headerParts.push(escapeLatex(profile.phone));
    if (profile.email) headerParts.push(`\\href{mailto:${escapeLatex(profile.email)}}{\\underline{${escapeLatex(profile.email)}}}`);
    if (profile.url) {
        const displayUrl = profile.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        headerParts.push(`\\href{${escapeLatex(profile.url)}}{\\underline{${escapeLatex(displayUrl)}}}`);
    }
    if (profile.location) headerParts.push(escapeLatex(profile.location));

    const headerString = headerParts.join(' $|$ ');

    return `%-------------------------
% Resume in Latex
% Author : Jake Gutierrez
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage{tabularx}
\\usepackage[english]{babel}
\\input{glyphtounicode}


%----------FONT OPTIONS----------
% sans-serif
% \\usepackage[sfdefault]{FiraSans}
% \\usepackage[sfdefault]{roboto}
% \\usepackage[sfdefault]{noto-sans}
% \\usepackage[default]{sourcesanspro}

% serif
% \\usepackage{CormorantGaramond}
% \\usepackage{charter}


\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%


\\begin{document}

%----------HEADING----------
% \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
%   \\textbf{\\href{http://sourabhbajaj.com/}{\\Large Sourabh Bajaj}} & Email : \\href{mailto:sourabh@sourabhbajaj.com}{sourabh@sourabhbajaj.com}\\\\
%   \\href{http://sourabhbajaj.com/}{http://www.sourabhbajaj.com} & Mobile : +1-123-456-7890 \\\\
% \\end{tabular*}

\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(profile.name || 'Your Name')}} \\\\ \\vspace{1pt}
    \\small ${headerString}
\\end{center}


${profile.summary ? `
\\section{Summary}
\\small{${escapeLatex(profile.summary)}}
` : ''}


${education.length > 0 ? `\\section{Education}
  \\resumeSubHeadingListStart
${education.map(edu => `    \\resumeSubheading
      {${escapeLatex(edu.school || edu.schoolName || 'University')}}
      {${escapeLatex(edu.location || edu.schoolLocation || '')}}
      {${escapeLatex(edu.degree || edu.degreeName || 'Degree')}}
      {${escapeLatex(edu.startYear || edu.startDate || '')} -- ${escapeLatex(edu.endYear || edu.endDate || 'Present')}}
`).join('')}
  \\resumeSubHeadingListEnd` : ''}


${experiences.length > 0 ? `\\section{Experience}
  \\resumeSubHeadingListStart
${experiences.map(exp => `    \\resumeSubheading
      {${escapeLatex(exp.title || 'Title')}}
      {${escapeLatex(exp.startDate || '')} -- ${escapeLatex(exp.endDate || 'Present')}}
      {${escapeLatex(exp.company || 'Company')}}
      {${escapeLatex(exp.location || '')}}
      \\resumeItemListStart
        ${(exp.description ? exp.description.split('. ').filter(d => d.trim()).map(d => `\\resumeItem{${escapeLatex(d.trim())}${d.trim().endsWith('.') ? '' : '.'}}`).join('\n        ') : '\\resumeItem{Description}')}
      \\resumeItemListEnd
`).join('')}
  \\resumeSubHeadingListEnd` : ''}


${projects.length > 0 ? `\\section{Projects}
    \\resumeSubHeadingListStart
      ${projects.map(proj => `\\resumeProjectHeading
          {\\textbf{${escapeLatex(proj.name || 'Project Name')}}${proj.technologies ? ` $|$ \\emph{${escapeLatex(proj.technologies)}}` : ''}}{${escapeLatex(proj.date || '')}}
          \\resumeItemListStart
            ${(proj.details && proj.details.length > 0) ? proj.details.map(d => `\\resumeItem{${escapeLatex(d)}}`).join('\n') : '\\resumeItem{Project description}'}
          \\resumeItemListEnd
      `).join('')}
    \\resumeSubHeadingListEnd` : ''}


${(certifications && certifications.length > 0) ? `\\section{Certifications}
    \\resumeSubHeadingListStart
${certifications.map(cert => `      \\resumeProjectHeading
          {\\textbf{${escapeLatex(cert.name || 'Certification Name')}}${cert.authority ? ` $|$ \\emph{${escapeLatex(cert.authority)}}` : ''}}{${escapeLatex(cert.date || '')}}
`).join('')}
    \\resumeSubHeadingListEnd` : ''}


\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{Skills}{: ${skills.map(skill => escapeLatex(typeof skill === 'string' ? skill : skill.name)).join(', ')}}
    }}
 \\end{itemize}

\\end{document}`;
};
