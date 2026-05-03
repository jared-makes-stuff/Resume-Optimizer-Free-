import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Copy, Trash2, Plus } from 'lucide-react';
import { formatLabel, handleCopy } from './utils';

export function Experience({ experience = [], updateExperience, addItem, removeItem }) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
        >
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium">Experience</h3>
                <Button onClick={() => addItem('experience')} size="sm" variant="outline" className="rounded-xl">
                    <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
            </div>
            {experience.map((exp, index) => (
                <Card key={index} className="p-6 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium">Position {index + 1}</h4>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem('experience', index)}
                                className="text-destructive h-8 w-8 rounded-xl"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopy(
                                    Object.entries(exp)
                                        .map(([key, value]) => `${key}: ${value}`)
                                        .join('\n'),
                                    'Experience'
                                )}
                                className="rounded-xl"
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(exp).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <Label htmlFor={`exp-${index}-${key}`}>{formatLabel(key)}</Label>
                                {key.toLowerCase().includes('description') ? (
                                    <Textarea
                                        id={`exp-${index}-${key}`}
                                        value={value || ''}
                                        onChange={(e) => updateExperience(index, key, e.target.value)}
                                        className="rounded-xl min-h-24"
                                    />
                                ) : (
                                    <Input
                                        id={`exp-${index}-${key}`}
                                        value={value || ''}
                                        onChange={(e) => updateExperience(index, key, e.target.value)}
                                        className="rounded-xl"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            ))}
        </motion.div>
    );
}
