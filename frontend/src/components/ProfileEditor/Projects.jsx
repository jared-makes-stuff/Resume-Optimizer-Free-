import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Trash2, Plus } from 'lucide-react';

export function Projects({ projects = [], updateProjects, updateProjectDetail, addProjectDetail, addItem, removeItem }) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="space-y-4"
        >
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium">Projects</h3>
                <Button onClick={() => addItem('projects')} size="sm" variant="outline" className="rounded-xl">
                    <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
            </div>
            {projects.map((proj, index) => (
                <Card key={index} className="p-6 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium">Project {index + 1}</h4>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem('projects', index)}
                                className="text-destructive h-8 w-8 rounded-xl"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={proj.name || ''} onChange={(e) => updateProjects(index, 'name', e.target.value)} className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input value={proj.date || ''} onChange={(e) => updateProjects(index, 'date', e.target.value)} className="rounded-xl" />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <Label>Technologies</Label>
                            <Input value={proj.technologies || ''} onChange={(e) => updateProjects(index, 'technologies', e.target.value)} className="rounded-xl" />
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <Label>Details</Label>
                            {(proj.details || []).map((detail, dIndex) => (
                                <div key={dIndex} className="flex gap-2 mb-2">
                                    <Input value={detail} onChange={(e) => updateProjectDetail(index, dIndex, e.target.value)} className="rounded-xl" />
                                </div>
                            ))}
                            <Button size="sm" variant="ghost" onClick={() => addProjectDetail(index)} className="text-xs">+ Add Detail Line</Button>
                        </div>
                    </div>
                </Card>
            ))}
        </motion.div>
    );
}
