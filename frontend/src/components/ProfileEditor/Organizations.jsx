import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Trash2, Plus } from 'lucide-react';
import { formatLabel } from './utils';

export function Organizations({ organizations = [], updateOrganizations, addItem, removeItem }) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.38 }}
            className="space-y-4"
        >
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium">Organizations</h3>
                <Button onClick={() => addItem('organizations')} size="sm" variant="outline" className="rounded-xl">
                    <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
            </div>
            {organizations.map((org, index) => (
                <Card key={index} className="p-6 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium">Organization {index + 1}</h4>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem('organizations', index)}
                                className="text-destructive h-8 w-8 rounded-xl"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(org).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <Label htmlFor={`org-${index}-${key}`}>{formatLabel(key)}</Label>
                                <Input
                                    id={`org-${index}-${key}`}
                                    value={value || ''}
                                    onChange={(e) => updateOrganizations(index, key, e.target.value)}
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
