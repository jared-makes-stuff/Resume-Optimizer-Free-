/**
 * LinkedIn PDF Parser Service
 * Parses LinkedIn profile PDF exports client-side
 */

import * as pdfjsLib from 'pdfjs-dist';
// Let Vite and pdfjs automatically handle the worker path in the modern build
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

class LinkedInPdfParser {
  /**
   * Parse LinkedIn profile PDF
   * @param {File} file - The PDF file from LinkedIn
   * @returns {Promise<Object>} Parsed profile data
   */
  async parsePdf(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let fullText = '';

      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Join with newlines to preserve horizontal and vertical structure
        const pageText = textContent.items.map(item => item.str).join('\n');
        fullText += pageText + '\n';
      }

      return this.parseTextContent(fullText);

    } catch (error) {
      console.error('Detailed parsing error:', error);
      if (error.name === 'MissingPDFException') {
        console.error('PDF data missing or invalid');
      }
      throw error;
    }
  }

  parseTextContent(text) {
    // Split by lines and clean up
    // Remove "Page x of y" footers
    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.match(/^Page \d+ of \d+$/));

    // Initial data structure
    const data = {
      profile: {},
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      projects: [],
      organizations: [],
      importedAt: new Date().toISOString()
    };

    // Keyword markers for sections
    const sectionMap = {
      'Experience': 'experience',
      'Education': 'education',
      'Licenses & Certifications': 'certifications',
      'Certifications': 'certifications',
      'Skills': 'skills',
      'Top Skills': 'skills',
      'Honors-Awards': 'honors',
      'Projects': 'projects',
      'Summary': 'summary',
      'Contact': 'contact',
      'Languages': 'languages'
    };

    // Scan for sections
    let currentSection = 'header'; // Start with header (unclaimed)
    let buffer = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Fuzzy detect section headers
      let detectedKey = null;
      for (const key of Object.keys(sectionMap)) {
        // Check for exact match or start match with reasonable length limit
        // Avoid false positives like "Experience with Java" by checking length
        if (line === key || (line.startsWith(key) && line.length < key.length + 10)) {
          detectedKey = key;
          break;
        }
      }

      if (detectedKey) {
        // Process previous buffer
        this.processSection(currentSection, buffer, data);

        // Start new section
        currentSection = sectionMap[detectedKey];
        buffer = [];
        continue;
      }

      buffer.push(line);
    }

    // Process last section
    this.processSection(currentSection, buffer, data);

    // Post-processing fill gaps
    this.fillProfileGaps(data);

    return data;
  }

  processSection(section, buffer, data) {
    if (buffer.length === 0) return;

    // Check if the END of the buffer contains Header Info
    if (section !== 'header' && section !== 'summary' && section !== 'experience' && section !== 'education') {
      const tail = this.extractHeaderFromTail(buffer, data.profile.url);
      if (tail.name || tail.location) {
        if (tail.name && !data.profile.name) data.profile.name = tail.name;
        if (tail.headline && !data.profile.headline) data.profile.headline = tail.headline;
        if (tail.location && !data.profile.location) data.profile.location = tail.location;

        // Remove extracted lines from buffer
        // We assume they were at the distinct end.
        const linesToRemove = (tail.name ? 1 : 0) + (tail.headline ? 1 : 0) + (tail.location ? 1 : 0);
        if (linesToRemove > 0) {
          buffer = buffer.slice(0, buffer.length - linesToRemove);
        }
      }
    }

    switch (section) {
      case 'header':
        this.parseHeader(buffer, data);
        break;

      case 'summary':
        data.profile.summary = buffer.join(' ');
        break;

      case 'contact':
        this.parseContact(buffer, data);
        break;

      case 'experience':
        data.experience = this.parseExperience(buffer);
        break;

      case 'education':
        data.education = this.parseEducation(buffer);
        break;

      case 'skills':
        const newSkills = this.parseSkills(buffer);
        data.skills = [...data.skills, ...newSkills];
        break;

      case 'certifications':
        data.certifications = this.parseCertifications(buffer);
        break;

      case 'projects':
        data.projects = this.parseProjects(buffer);
        break;

      case 'languages':
        break;
    }
  }

  extractHeaderFromTail(buffer, url) {
    if (buffer.length < 1) return {};
    const res = {};

    let idx = buffer.length - 1;
    let line = buffer[idx];

    if (line === 'Singapore' || line.match(/^[A-Z][a-zA-Z\s]+, [A-Z][a-zA-Z\s]+$/)) {
      res.location = line;
      idx--;
    }

    if (idx >= 0) {
      line = buffer[idx];
      if (this.isNameCandidate(line, url)) {
        res.name = line;
      } else {
        res.headline = line;
        idx--;

        if (idx >= 0) {
          line = buffer[idx];
          if (this.isNameCandidate(line, url)) {
            res.name = line;
          }
        }
      }
    }
    return res;
  }

  parseHeader(buffer, data) {
    // 1. Identify key indices
    let nameIndex = -1;
    let locationIndex = -1;

    for (let i = 0; i < buffer.length; i++) {
      const line = buffer[i];
      if (line.length < 2 || line.includes('Page 1 of') || line.match(/^[a-z.]/)) continue;

      if (nameIndex === -1 && this.isNameCandidate(line, data.profile.url)) {
        nameIndex = i;
      }

      // Location detection (Singapore or "City, Country")
      if (locationIndex === -1 && i > nameIndex && (line === 'Singapore' || line.match(/^[A-Z][a-zA-Z\s]+, [A-Z][a-zA-Z\s]+$/))) {
        locationIndex = i;
      }
    }

    // 2. Extract Data
    if (nameIndex !== -1) {
      data.profile.name = buffer[nameIndex];

      // Headline: Lines between Name and Location (or end if no location)
      // Usually immediately follows Name
      const headlineStart = nameIndex + 1;
      const headlineEnd = locationIndex !== -1 ? locationIndex : buffer.length;

      const headlineLines = [];
      for (let i = headlineStart; i < headlineEnd; i++) {
        const line = buffer[i];
        // Filter garbage
        if (line.length > 2 && !line.includes('@') && !line.match(/^\d/)) {
          headlineLines.push(line);
        }
      }

      if (headlineLines.length > 0) {
        // Join multi-line headlines?
        // "Software Engineer | \n React Developer" -> "Software Engineer | React Developer"
        // "Software Engineer \n @ Google" -> "Software Engineer @ Google"
        data.profile.headline = headlineLines.join(' ');
      }
    } else {
      // Fallback: Scan linearly (Old Logic, but stricter)
      buffer.forEach(line => {
        // Skip obvious garbage
        if (line.length < 2 || line.includes('Page 1 of') || line.match(/^[a-z.]/)) return;

        if (!data.profile.location && (line === 'Singapore' || line.match(/^[A-Z][a-zA-Z\s]+, [A-Z][a-zA-Z\s]+$/))) {
          data.profile.location = line;
        } else if (!data.profile.headline && line.length > 2 && !line.includes('@') && !line.match(/^\d/)) {
          // Be careful extracting headline without name
          // Only if it really looks like one?
          if (!line.includes('(LinkedIn)')) {
            data.profile.headline = line;
          }
        }
      });
    }

    if (locationIndex !== -1) {
      data.profile.location = buffer[locationIndex];
    }
  }

  parseContact(buffer, data) {
    let combinedBuffer = [];
    // Merge split lines (especially emails)
    for (let i = 0; i < buffer.length; i++) {
      let line = buffer[i];

      // Aggressive merge: if line contains '@' but not a valid domain ending?
      // Or if line ends with '@'.
      // Or if the NEXT line looks like a domain extension (.com, .sg)
      const isPartialEmail = line.includes('@') && !line.match(/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);

      if (isPartialEmail || line.endsWith('@') || (i < buffer.length - 1 && buffer[i + 1].match(/^[a-z]+\.[a-z]+$/))) {
        if (i < buffer.length - 1) {
          line += buffer[i + 1];
          i++;
        }
      }
      combinedBuffer.push(line);
    }

    combinedBuffer.forEach(line => {
      if (line.includes('@')) {
        const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
        if (emailMatch) data.profile.email = emailMatch[0];
      } else if (line.includes('www.linkedin.com') || line.includes('http')) {
        data.profile.url = line.split(' ')[0];
      } else if (line.match(/[\d\-\(\)\s]{10,}/) && line.length < 30) {
        data.profile.phone = line;
      } else {
        this.parseHeader([line], data);
      }
    });
  }

  isNameCandidate(line, url) {
    if (line.length > 30) return false;
    if (line.match(/[\d@]/)) return false;
    // Name usually is matched title case
    if (!line.match(/^[A-Z][a-z]+( [A-Z][a-z]+){1,3}$/)) return false;

    // Filter common false positives
    const badKeywords = ['Cloud Management', 'Top Skills', 'Contact', 'Summary', 'Experience', 'Education'];
    if (badKeywords.some(kw => line.includes(kw))) return false;

    // URL Validation (if available)
    if (url) {
      // Extract slug: linkedin.com/in/jaredtanshuyi -> jaredtanshuyi
      const slug = url.split('/in/')[1]?.split('/')[0]?.replace(/-/g, '').toLowerCase();
      if (slug) {
        const nameLower = line.toLowerCase().replace(/[^a-z]/g, '');
        // Check if name parts are in slug? 
        // e.g. "Jared Tan" -> "jaredtan" in "jaredtanshuyi"? Yes.
        // "Cloud Management" -> "cloudmanagement" in "jaredtanshuyi"? No.

        // Only apply strict check if slug is found
        if (!slug.includes(nameLower)) {
          // Relaxed check: Does the FIRST name appear in slug?
          const firstName = line.split(' ')[0].toLowerCase();
          if (!slug.includes(firstName)) return false;
        }
      }
    }

    return true;
  }

  parseExperience(lines) {
    const experiences = [];
    let currentExp = null;

    // Regex for date ranges
    // Matches: "Jan 2020 - Present" or "Jan 2020 - Dec 2020" or "2019 - 2020"
    const month = '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*';
    const year = '\\d{4}';
    const dateRegex = new RegExp(`^(${month}\\s+${year}|${year})\\s*-\\s*(Present|${month}\\s+${year}|${year})`, 'i');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if line contains a date range
      if (line.match(dateRegex)) {
        if (currentExp) {
          experiences.push(currentExp);
        }

        // Find Title and Company from previous lines
        // In standard LinkedIn PDFs, Job Title immediately precedes Company Name,
        // which then precedes the Date line.
        let company = 'Unknown Company';
        let title = 'Unknown Title';

        if (i >= 2) {
          company = lines[i - 2];
          title = lines[i - 1];
        } else if (i === 1) {
          title = lines[i - 1];
        }

        // Clean up Duration from Date line if present
        let dateRange = line;
        const parenIndex = line.indexOf('(');
        if (parenIndex > -1) {
          dateRange = line.substring(0, parenIndex).trim();
        }

        currentExp = {
          company: company,
          title: title,
          startDate: dateRange.split('-')[0]?.trim(),
          endDate: dateRange.split('-')[1]?.trim(),
          description: '',
          location: ''
        };
      } else if (currentExp) {
        // Validation: skip duration lines and location lines
        if (line.startsWith('(') && line.endsWith(')')) continue; // Duration line
        if (line.match(/^[A-Z][a-zA-Z\s]+, [A-Z][a-zA-Z\s]+$/) || line === 'Singapore') {
          currentExp.location = line;
          continue;
        }

        // Map description details
        currentExp.description += line + ' ';
      }
    }

    if (currentExp) experiences.push(currentExp);

    // Post-cleanup: The linear reading appends the next job's headers (Title/Company) 
    // to the previous job's description. We need to strip these trailing headers.
    for (let k = 0; k < experiences.length - 1; k++) {
      const curr = experiences[k];
      const next = experiences[k + 1];

      let desc = curr.description.trim();

      // Check if desc ends with Company?
      if (desc.endsWith(next.title)) {
        desc = desc.substring(0, desc.lastIndexOf(next.title)).trim();
      }
      if (desc.endsWith(next.company)) {
        desc = desc.substring(0, desc.lastIndexOf(next.company)).trim();
      }

      // Iterative cleanup (sometimes repeated or interleaved)
      let changed = true;
      while (changed) {
        changed = false;
        if (desc.endsWith(next.title)) {
          desc = desc.substring(0, desc.lastIndexOf(next.title)).trim();
          changed = true;
        }
        if (desc.endsWith(next.company)) {
          desc = desc.substring(0, desc.lastIndexOf(next.company)).trim();
          changed = true;
        }
      }

      curr.description = desc;
    }

    return experiences;
  }

  parseEducation(lines) {
    const education = [];

    // Robust date regex (matches "Aug 2024 - Dec 2027" or "2019 - 2022")
    const month = '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*';
    const year = '\\d{4}';
    const dateRegex = new RegExp(`^(${month}\\s+${year}|${year})\\s*-\\s*(Present|${month}\\s+${year}|${year})`, 'i');

    let currentEdu = null;
    let buffer = []; // Potential School/Degree lines

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Super relaxed check: Any line with a year is likely the date line in Education section
      const isDateLine = line.match(/\d{4}/);

      if (isDateLine) {
        // Found date line
        let school = 'Unknown School';
        let degree = '';

        if (buffer.length > 0) {
          school = buffer[0];
          if (buffer.length > 1) {
            degree = buffer.slice(1).join(' ');
          }
        }

        // Clean date
        let dates = line.replace(/[()·]/g, '').trim();
        const startYear = dates.split('-')[0]?.trim();
        const endYear = dates.split('-')[1]?.trim();

        education.push({
          school,
          degree,
          startYear,
          endYear
        });
        buffer = [];
      } else {
        // Buffer potential info
        // Skip garbage
        if (line.length > 2 && !line.includes('Page')) {
          buffer.push(line);
        }
      }
    }
    return education;
  }

  fillProfileGaps(data) {
    // Fallback defaults
    if (!data.profile.name) data.profile.name = "Unknown Name";
  }

  parseSkills(lines) {
    let skills = [];
    lines.forEach(line => {
      if (line.includes('Page') && line.includes('of')) return;
      if (line.length < 2) return;

      // Split by bullets or commas
      const parts = line.split(/[,•·]/);
      parts.forEach(p => {
        const clean = p.trim();
        if (clean.length > 1 && clean.length < 100) {
          skills.push({ name: clean });
        }
      });
    });
    return skills;
  }

  parseCertifications(lines) {
    const certs = [];
    // Pattern: Name -> Authority -> Date (Optional)
    // Hard to separate Name and Authority if they look same.
    // But usually Authority is a Company.
    // Heuristic: chunk by empty lines? (We filtered empty lines).
    // Heuristic: Every 2-3 lines is a cert?
    // Better: Date format "Issued Jan 2020" or just "Jan 2020".

    let buffer = [];
    const flushBuffer = () => {
      if (buffer.length === 0) return;
      // Last line might be date if it matches date?
      let date = '';
      let name = '';
      let authority = '';

      const last = buffer[buffer.length - 1];
      if (last.match(/\d{4}/) || last.includes('Issued')) {
        date = last;
        buffer.pop();
      }

      if (buffer.length > 0) {
        name = buffer[0];
        if (buffer.length > 1) authority = buffer.slice(1).join(' ');
      }

      if (name) {
        certs.push({ name, authority, date });
      }
      buffer = [];
    };

    lines.forEach(line => {
      // If line looks like a date/credential ID -> end of cert
      if (line.match(/Issued \w+ \d{4}/) || line.match(/Credential ID/)) {
        buffer.push(line);
        flushBuffer();
      } else {
        // Start of new cert?
        // If buffer gets too long (>3 lines), maybe force flush?
        if (buffer.length >= 3) flushBuffer();
        buffer.push(line);
      }
    });
    flushBuffer();

    return certs;
  }

  parseProjects(lines) {
    return [];
  }
}

export default new LinkedInPdfParser();
