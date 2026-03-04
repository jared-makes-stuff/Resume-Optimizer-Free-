import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Copy, Trash2, Plus } from 'lucide-react';
import { formatLabel, handleCopy } from './utils';

export function Education({ education, updateEducation, addItem, removeItem }) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
        >
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium">Education</h3>
                <Button onClick={() => addItem('education')} size="sm" variant="outline" className="rounded-xl">
                    <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
            </div>
            {education.map((edu, index) => (
                <Card key={index} className="p-6 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium">Education {index + 1}</h4>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem('education', index)}
                                className="text-destructive h-8 w-8 rounded-xl"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopy(
                                    Object.entries(edu)
                                        .map(([key, value]) => `${key}: ${value}`)
                                        .join('\n'),
                                    'Education'
                                )}
                                className="rounded-xl"
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(edu).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <Label htmlFor={`edu-${index}-${key}`}>{formatLabel(key)}</Label>
                                <Input
                                    id={`edu-${index}-${key}`}
                                    value={value || ''}
                                    onChange={(e) => updateEducation(index, key, e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                        ))}
                    </div>
                </Card>
            ))}
        </motion.div>
    );
}
