import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export function JsonEditor({ initialData, onSave }) {
    const [jsonText, setJsonText] = useState(JSON.stringify(initialData, null, 2));
    const [error, setError] = useState(null);

    useEffect(() => {
        setJsonText(JSON.stringify(initialData, null, 2));
        setError(null);
    }, [initialData]);

    const handleSave = () => {
        try {
            const parsed = JSON.parse(jsonText);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Profile JSON must be an object');
            }
            onSave(parsed);
            setError(null);
        } catch (e) {
            setError(e.message);
            toast.error('Invalid JSON: ' + e.message);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(jsonText);
            toast.success('JSON copied to clipboard!');
        } catch {
            toast.error('Unable to copy JSON.');
        }
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
                You can edit this JSON directly. Paste content from an LLM here and click &quot;Apply Changes&quot; to update your profile.
            </p>
        </div>
    );
}
