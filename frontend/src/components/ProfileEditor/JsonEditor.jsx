import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export function JsonEditor({ initialData, onSave }) {
    const [jsonText, setJsonText] = useState(JSON.stringify(initialData, null, 2));
    const [error, setError] = useState(null);

    const handleSave = () => {
        try {
            const parsed = JSON.parse(jsonText);
            onSave(parsed);
            setError(null);
        } catch (e) {
            setError(e.message);
            toast.error('Invalid JSON: ' + e.message);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonText);
        toast.success('JSON copied to clipboard!');
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCopy} size="sm" className="rounded-xl">
                    <Copy className="mr-2 h-4 w-4" /> Copy JSON
                </Button>
                <Button onClick={handleSave} size="sm" className="rounded-xl">
                    Apply Changes
                </Button>
            </div>

            {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-xl">
                    Error: {error}
                </div>
            )}

            <Textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="font-mono text-xs min-h-[500px] whitespace-pre"
            />

            <p className="text-sm text-muted-foreground">
                You can edit this JSON directly. Paste content from an LLM here and click "Apply Changes" to update your profile.
            </p>
        </div>
    );
}
