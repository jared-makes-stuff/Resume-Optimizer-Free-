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
  if (!navigator.clipboard) {
    toast.error('Clipboard is not available in this browser.');
    return;
  }

  navigator.clipboard
    .writeText(String(text ?? ''))
    .then(() => toast.success(`${label} copied to clipboard!`))
    .catch(() => toast.error(`Unable to copy ${label.toLowerCase()}.`));
};
