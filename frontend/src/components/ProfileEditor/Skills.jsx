import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Copy } from 'lucide-react';
import { handleCopy } from './utils';

export function Skills({ skills = [] }) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
        >
            <Card className="p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium">Skills</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(
                            skills.map(s => s.name || s).join(', '),
                            'Skills'
                        )}
                        className="rounded-xl"
                    >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                        <motion.div
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.02 }}
                            className="px-4 py-2 bg-muted rounded-full"
                        >
                            {typeof skill === 'string' ? skill : skill.name}
                        </motion.div>
                    ))}
                </div>
            </Card>
        </motion.div>
    );
}
