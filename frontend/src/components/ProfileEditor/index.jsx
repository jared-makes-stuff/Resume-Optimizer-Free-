import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Code } from 'lucide-react';
import { toast } from 'sonner';

import { BasicInfo } from './BasicInfo';
import { Experience } from './Experience';
import { Education } from './Education';
import { Projects } from './Projects';
import { Organizations } from './Organizations';
import { Skills } from './Skills';
import { JsonEditor } from './JsonEditor';

const normalizeProfileData = (data = {}) => {
    const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};

    return {
        ...source,
        profile: source.profile && typeof source.profile === 'object' ? source.profile : { name: 'Unknown Name' },
        experience: Array.isArray(source.experience) ? source.experience : [],
        education: Array.isArray(source.education) ? source.education : [],
        skills: Array.isArray(source.skills) ? source.skills : [],
        certifications: Array.isArray(source.certifications) ? source.certifications : [],
        projects: Array.isArray(source.projects) ? source.projects : [],
        organizations: Array.isArray(source.organizations) ? source.organizations : [],
        importedAt: source.importedAt || new Date().toISOString(),
    };
};

export function ProfileEditor({ data, onDataChange }) {
    const [viewMode, setViewMode] = useState('cards');
    const [profileData, setProfileData] = useState(() => normalizeProfileData(data));

    useEffect(() => {
        setProfileData(normalizeProfileData(data));
    }, [data]);

    const updateProfile = (field, value) => {
        const newData = {
            ...profileData,
            profile: { ...profileData.profile, [field]: value }
        };
        setProfileData(newData);
        if (onDataChange) onDataChange(newData);
    };

    const updateExperience = (index, field, value) => {
        const newExperience = [...(profileData.experience || [])];
        newExperience[index] = { ...newExperience[index], [field]: value };
        const newData = { ...profileData, experience: newExperience };
        setProfileData(newData);
        if (onDataChange) onDataChange(newData);
    };

    const addItem = (section) => {
        const newItem = section === 'experience' ? { company: 'New Company', title: 'Position', startDate: '', endDate: '', description: '', location: '' }
            : section === 'education' ? { school: 'University', degree: 'Degree', startYear: '', endYear: '', location: '' }
                : section === 'projects' ? { name: 'Project Name', technologies: '', date: '', details: [''] }
                    : section === 'certifications' ? { name: 'Certification', authority: 'Org', date: '2025' }
                        : section === 'organizations' ? { name: 'Organization Name', role: 'Member', startDate: '', endDate: '' }
                            : {};

        const newData = { ...profileData, [section]: [...(profileData[section] || []), newItem] };
        setProfileData(newData);
        if (onDataChange) onDataChange(newData);
    };

    const removeItem = (section, index) => {
        const list = [...(profileData[section] || [])];
        list.splice(index, 1);
        const newData = { ...profileData, [section]: list };
        setProfileData(newData);
        if (onDataChange) onDataChange(newData);
    };

    const updateEducation = (index, field, value) => {
        const newEducation = [...(profileData.education || [])];
        newEducation[index] = { ...newEducation[index], [field]: value };
        const newData = { ...profileData, education: newEducation };
        setProfileData(newData);
        if (onDataChange) onDataChange(newData);
    };

    const updateProjects = (index, field, value) => {
        const newProjects = [...(profileData.projects || [])];
        newProjects[index] = { ...newProjects[index], [field]: value };
        const newData = { ...profileData, projects: newProjects };
        setProfileData(newData);
        if (onDataChange) onDataChange(newData);
    };

    const updateProjectDetail = (projectIndex, detailIndex, value) => {
        const newProjects = [...(profileData.projects || [])];
        const details = [...(newProjects[projectIndex].details || [])];
        details[detailIndex] = value;
        newProjects[projectIndex] = { ...newProjects[projectIndex], details };
        const newData = { ...profileData, projects: newProjects };
        setProfileData(newData);
        if (onDataChange) onDataChange(newData);
    };

    const addProjectDetail = (projectIndex) => {
        const newProjects = [...(profileData.projects || [])];
        const details = [...(newProjects[projectIndex].details || []), ''];
        newProjects[projectIndex] = { ...newProjects[projectIndex], details };
        const newData = { ...profileData, projects: newProjects };
        setProfileData(newData);
        if (onDataChange) onDataChange(newData);
    };

    const updateOrganizations = (index, field, value) => {
        const newOrgs = [...(profileData.organizations || [])];
        newOrgs[index] = { ...newOrgs[index], [field]: value };
        const newData = { ...profileData, organizations: newOrgs };
        setProfileData(newData);
        if (onDataChange) onDataChange(newData);
    };

    return (
        <div className="space-y-6">
            {/* Header with Toggle */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex justify-between items-center"
            >
                <h2 className="text-2xl font-semibold">Profile Editor</h2>
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === 'cards' ? 'default' : 'outline'}
                        onClick={() => setViewMode('cards')}
                        className="rounded-xl"
                    >
                        Card View
                    </Button>
                    <Button
                        variant={viewMode === 'json' ? 'default' : 'outline'}
                        onClick={() => setViewMode('json')}
                        className="rounded-xl"
                    >
                        <Code className="mr-2 h-4 w-4" />
                        JSON View
                    </Button>
                </div>
            </motion.div>

            {viewMode === 'cards' ? (
                <div className="space-y-6">
                    <BasicInfo
                        profile={profileData.profile}
                        updateProfile={updateProfile}
                    />
                    <Experience
                        experience={profileData.experience}
                        updateExperience={updateExperience}
                        addItem={addItem}
                        removeItem={removeItem}
                    />
                    <Education
                        education={profileData.education}
                        updateEducation={updateEducation}
                        addItem={addItem}
                        removeItem={removeItem}
                    />
                    <Projects
                        projects={profileData.projects}
                        updateProjects={updateProjects}
                        updateProjectDetail={updateProjectDetail}
                        addProjectDetail={addProjectDetail}
                        addItem={addItem}
                        removeItem={removeItem}
                    />
                    <Organizations
                        organizations={profileData.organizations}
                        updateOrganizations={updateOrganizations}
                        addItem={addItem}
                        removeItem={removeItem}
                    />
                    <Skills skills={profileData.skills} />
                </div>
            ) : (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <Card className="p-6 rounded-3xl space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-medium">JSON Editor</h3>
                        </div>

                        <JsonEditor
                            initialData={profileData}
                            onSave={(newData) => {
                                const normalizedData = normalizeProfileData(newData);
                                setProfileData(normalizedData);
                                if (onDataChange) onDataChange(normalizedData);
                                toast.success('Profile updated from JSON!');
                            }}
                        />
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
