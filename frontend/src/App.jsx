import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/ui/button';
import LandingPage from './pages/LandingPage';
import { ProfileEditor } from './components/ProfileEditor';
import { ResumeGenerator } from './components/ResumeGenerator';
import { JobMatcher } from './components/JobMatcher';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Toaster } from './components/ui/sonner';
import storageService from './services/storageService';
import { useTheme } from 'next-themes';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [linkedInData, setLinkedInData] = useState(null);
  const [generatedResume, setGeneratedResume] = useState('');
  const [loading, setLoading] = useState(true);

  // Handle dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Load data from LocalStorage
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const saved = storageService.getProfile();
        // Validate data structure (must have profile object)
        if (saved && saved.profile) {
          setLinkedInData(saved);
        } else if (saved) {
          // Legacy data structure detected, clear it to prevent crash
          console.warn('Legacy data structure detected, clearing storage.');
          storageService.clearProfile();
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSavedData();
  }, []);

  const handleFileUpload = (data) => {
    setLinkedInData(data);
    storageService.saveProfile(data);
  };

  const handleResumeGenerate = (resume) => {
    setGeneratedResume(resume);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      storageService.clearProfile();
      setLinkedInData(null);
      setGeneratedResume('');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans">
      <Toaster />
      
      {/* Header with Theme Toggle */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 right-0 p-6 z-50 pointer-events-none"
      >
        <div className="pointer-events-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="rounded-full w-10 h-10 bg-background/50 backdrop-blur-sm shadow-sm"
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!linkedInData ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage onFileUpload={handleFileUpload} />
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 py-8 max-w-7xl"
          >
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={handleClearData}
                className="rounded-full"
              >
                ← Back to Upload (Clear Data)
              </Button>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 rounded-2xl h-auto p-1 bg-muted">
                <TabsTrigger value="profile" className="rounded-xl py-2">
                  Profile Editor
                </TabsTrigger>
                <TabsTrigger value="resume" className="rounded-xl py-2">
                  Resume Generator
                </TabsTrigger>
                <TabsTrigger value="job-match" className="rounded-xl py-2">
                  Job Matcher
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="focus-visible:outline-none">
                <ProfileEditor data={linkedInData} onDataChange={handleFileUpload} />
              </TabsContent>

              <TabsContent value="resume" className="focus-visible:outline-none">
                <ResumeGenerator 
                  data={linkedInData} 
                  onResumeGenerate={handleResumeGenerate}
                />
              </TabsContent>

              <TabsContent value="job-match" className="focus-visible:outline-none">
                <JobMatcher resume={generatedResume} />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
