import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Copy } from 'lucide-react';
import { formatLabel, handleCopy } from './utils';

export function BasicInfo({ profile = {}, updateProfile }) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
        >
            <Card className="p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium">Basic Information</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(
                            Object.entries(profile)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join('\n'),
                            'Profile'
                        )}
                        className="rounded-xl"
                    >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(profile).map(([key, value], index) => (
                        <motion.div
                            key={key}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            className="space-y-2"
                        >
                            <Label htmlFor={key}>{formatLabel(key)}</Label>
                            {key.toLowerCase().includes('summary') ? (
                                <Textarea
                                    id={key}
                                    value={value || ''}
                                    onChange={(e) => updateProfile(key, e.target.value)}
                                    className="rounded-xl min-h-32"
                                />
                            ) : (
                                <Input
                                    id={key}
                                    value={value || ''}
                                    onChange={(e) => updateProfile(key, e.target.value)}
                                    className="rounded-xl"
                                />
                            )}
                        </motion.div>
                    ))}
                </div>
            </Card>
        </motion.div>
    );
}
