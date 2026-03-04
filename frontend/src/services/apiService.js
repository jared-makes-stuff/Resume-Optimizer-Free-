/**
 * API Service
 * Handles all HTTP requests to backend and external APIs
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
  }

  /**
   * Initiate LinkedIn OAuth flow
   */
  initiateLinkedInAuth() {
    window.location.href = `${API_BASE_URL}/api/auth/linkedin`;
  }

  /**
   * Compile LaTeX to PDF
   */
  async compileLatex(latexContent) {
    try {
      const response = await this.axiosInstance.post('/api/compile/latex', {
        content: latexContent
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error compiling LaTeX:', error);
      throw error;
    }
  }

  /**
   * Check LaTeX compiler status
   */
  async checkLatexCompiler() {
    try {
      const response = await this.axiosInstance.get('/api/compile/status');
      return response.data;
    } catch (error) {
      console.error('Error checking LaTeX compiler:', error);
      return { available: false, error: error.message };
    }
  }
}

export default new ApiService();
