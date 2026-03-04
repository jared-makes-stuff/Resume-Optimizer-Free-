import { toast } from 'sonner';

export const formatLabel = (key) => {
  const result = key.replace(/([A-Z])/g, " $1").replace(/_/g, " ");
  return result
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
};

export const handleCopy = (text, label) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard!`);
};
