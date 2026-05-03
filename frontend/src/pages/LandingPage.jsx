import { useState, useCallback } from 'react';
import { Upload, FileText, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import linkedinPdfParser from '../services/linkedinPdfParser';
import { toast } from 'sonner';

const MAX_PDF_SIZE_BYTES = 15 * 1024 * 1024;

const validatePdfFile = (file) => {
  if (!file) {
    return 'Please choose a PDF file.';
  }

  const hasPdfExtension = file.name.toLowerCase().endsWith('.pdf');
  const hasPdfType = file.type === 'application/pdf' || file.type === '';

  if (!hasPdfExtension || !hasPdfType) {
    return 'Please upload a valid PDF file.';
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return 'Please upload a PDF smaller than 15 MB.';
  }

  return null;
};

export function LandingPage({ onFileUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = useCallback(async (file) => {
    const validationError = validatePdfFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    try {
      const data = await linkedinPdfParser.parsePdf(file);
      onFileUpload(data);
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error(error?.message ? `Error parsing PDF: ${error.message}` : 'Unable to parse this PDF.');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, onFileUpload]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    if (isProcessing) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    };
    input.click();
  };

  const handleUploadKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 pt-24 text-foreground">
      <div className="max-w-4xl w-full space-y-8">
        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl font-semibold tracking-tight">LinkedIn Profile Optimizer</h1>
          <p className="text-muted-foreground text-lg">
            Transform your LinkedIn PDF into optimized profiles and resumes
          </p>
        </motion.div>

        {/* Upload Card */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            onKeyDown={handleUploadKeyDown}
            role="button"
            tabIndex={0}
            aria-busy={isProcessing}
            className={`
              relative overflow-hidden rounded-3xl p-12 cursor-pointer
              transition-all duration-300 hover:shadow-xl border-dashed border-2
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              ${isDragging ? 'border-foreground scale-[1.02] bg-muted/50' : 'border-muted'}
              ${isProcessing ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <motion.div
              animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <motion.div
                animate={isProcessing ? { rotate: 360 } : { rotate: 0 }}
                transition={isProcessing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                className="rounded-full bg-muted p-6"
              >
                {isProcessing ? (
                  <FileText className="h-12 w-12 text-muted-foreground" />
                ) : (
                  <Upload className="h-12 w-12 text-muted-foreground" />
                )}
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {isProcessing ? 'Processing your PDF...' : 'Upload LinkedIn PDF'}
                </h3>
                <p className="text-muted-foreground">
                  {isProcessing
                    ? 'Please wait while we parse your LinkedIn profile'
                    : 'Click to select or drag and drop your LinkedIn Profile PDF'
                  }
                </p>
              </div>
            </motion.div>
          </Card>
        </motion.div>

        {/* Guide */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="rounded-3xl p-8 bg-muted/30">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-muted p-3">
                  <Info className="h-6 w-6 text-foreground" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">How to Get Your LinkedIn PDF</h3>
                <ol className="space-y-4 text-muted-foreground list-decimal list-inside">
                  <li>
                    Click <span className="font-medium text-foreground">Go to LinkedIn Profile</span> (your own profile)
                  </li>
                  <li>
                    Click <span className="font-medium text-foreground">&apos;More&apos;</span> (or &apos;Resource&apos;) button near your profile picture, then select <span className="font-medium text-foreground">&apos;Save to PDF&apos;</span>
                  </li>
                  <li>
                    Upload the downloaded PDF file here
                  </li>
                </ol>
                <div className="pt-2 flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">
                    Note: Your data is processed locally in your browser.
                  </p>
                  <Button
                    asChild
                    className="max-w-xs"
                  >
                    <a
                      href="https://www.linkedin.com/in/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Go to LinkedIn Profile
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default LandingPage;
