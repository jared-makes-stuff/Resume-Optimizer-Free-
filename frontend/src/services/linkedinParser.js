/**
 * LinkedIn Data Parser Service
 * Parses LinkedIn data export ZIP files client-side
 */

import JSZip from 'jszip';
import Papa from 'papaparse';

class LinkedInParser {
  /**
   * Parse LinkedIn export ZIP file
   * @param {File} file - The ZIP file from LinkedIn export
   * @returns {Promise<Object>} Parsed profile data
   */
  async parseZipFile(file) {
    try {
      // Load ZIP file in browser
      const zip = await JSZip.loadAsync(file);
      
      // Extract CSV files
      const profile = await this.parseCSV(zip, 'Profile.csv');
      const positions = await this.parseCSV(zip, 'Positions.csv');
      const education = await this.parseCSV(zip, 'Education.csv');
      const skills = await this.parseCSV(zip, 'Skills.csv');
      const certifications = await this.parseCSV(zip, 'Certifications.csv');
      const projects = await this.parseCSV(zip, 'Projects.csv');
      
      // Transform to application schema
      return this.transformData({
        profile,
        positions,
        education,
        skills,
        certifications,
        projects
      });
    } catch (error) {
      console.error('Error parsing ZIP file:', error);
      throw new Error('Failed to parse LinkedIn export file');
    }
  }
  
  /**
   * Parse a CSV file from the ZIP archive
   * @param {JSZip} zip - The loaded ZIP archive
   * @param {string} filename - Name of the CSV file to parse
   * @returns {Promise<Array>} Parsed CSV data as array of objects
   */
  async parseCSV(zip, filename) {
    try {
      const file = zip.file(filename);
      if (!file) {
        console.warn(`File not found in ZIP: ${filename}`);
        return null;
      }
      
      const csvText = await file.async('text');
      const result = Papa.parse(csvText, { 
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      });
      
      return result.data;
    } catch (error) {
      console.error(`Error parsing ${filename}:`, error);
      return null;
    }
  }
  
  /**
   * Transform LinkedIn data to application schema
   * @param {Object} data - Raw parsed CSV data
   * @returns {Object} Transformed profile data
   */
  transformData(data) {
    const rawProfile = (data.profile && data.profile[0]) || {};
    
    return {
      // Profile Information
      profile: {
        ...rawProfile,
        // Add normalized fields if missing from raw
        name: rawProfile['First Name'] && rawProfile['Last Name'] 
          ? `${rawProfile['First Name']} ${rawProfile['Last Name']}` 
          : (rawProfile.Name || 'Unknown'),
        headline: rawProfile.Headline || '',
        summary: rawProfile.Summary || '',
        email: rawProfile['Email Address'] || '',
        phone: rawProfile.Phone || '',
        location: rawProfile.Location || '',
        url: rawProfile['LinkedIn Profile URL'] || ''
      },
      
      // Work experience
      experience: this.transformPositions(data.positions),
      
      // Education
      education: this.transformEducation(data.education),
      
      // Skills
      skills: this.transformSkills(data.skills),
      
      // Certifications
      certifications: this.transformCertifications(data.certifications),
      
      // Projects
      projects: this.transformProjects(data.projects),
      
      // Metadata
      importedAt: new Date().toISOString()
    };
  }
  
  /**
   * Transform positions/experience data
   */
  transformPositions(positions) {
    if (!positions || !Array.isArray(positions)) return [];
    
    return positions
      .filter(pos => pos['Company Name'] || pos.Title)
      .map(pos => ({
        company: pos['Company Name'] || '',
        title: pos.Title || '',
        description: pos.Description || '',
        location: pos.Location || '',
        startDate: pos['Started On'] || '',
        endDate: pos['Finished On'] || '',
        current: pos['Finished On'] === 'Present' || !pos['Finished On']
      }));
  }
  
  /**
   * Transform education data
   */
  transformEducation(education) {
    if (!education || !Array.isArray(education)) return [];
    
    return education
      .filter(edu => edu['School Name'] || edu['Degree Name'])
      .map(edu => ({
        school: edu['School Name'] || '',
        degree: edu['Degree Name'] || '',
        field: edu['Field Of Study'] || '',
        startYear: edu['Start Year'] || '',
        endYear: edu['End Year'] || '',
        activities: edu['Activities and Societies'] || '',
        notes: edu.Notes || ''
      }));
  }
  
  /**
   * Transform skills data
   */
  transformSkills(skills) {
    if (!skills || !Array.isArray(skills)) return [];
    
    return skills
      .map(skill => skill.Name)
      .filter(Boolean)
      .filter(name => name.trim().length > 0);
  }
  
  /**
   * Transform certifications data
   */
  transformCertifications(certifications) {
    if (!certifications || !Array.isArray(certifications)) return [];
    
    return certifications
      .filter(cert => cert.Name)
      .map(cert => ({
        name: cert.Name || '',
        authority: cert.Authority || '',
        startDate: cert['Start Date'] || '',
        endDate: cert['End Date'] || '',
        url: cert.Url || ''
      }));
  }
  
  /**
   * Transform projects data
   */
  transformProjects(projects) {
    if (!projects || !Array.isArray(projects)) return [];
    
    return projects
      .filter(proj => proj.Title)
      .map(proj => ({
        title: proj.Title || '',
        description: proj.Description || '',
        url: proj.Url || '',
        startDate: proj['Start Date'] || '',
        endDate: proj['End Date'] || ''
      }));
  }
}

export default new LinkedInParser();
