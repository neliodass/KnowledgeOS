'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Key, Save, FolderOpen, Plus, Trash2, Edit2,
    Brain, Target, AlertTriangle, ShieldCheck, Folder
} from 'lucide-react';

interface Category {
    id: string;
    name: string;
}

interface UserPreferences {
    professionalContext: string;
    learningGoals: string;
    topicsToAvoid: string;
}

export default function SettingsPage() {
    // categories state
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [catLoading, setCatLoading] = useState(false);

    // user profile state
    const [preferences, setPreferences] = useState<UserPreferences>({
        professionalContext: '',
        learningGoals: '',
        topicsToAvoid: ''
    });
    const [prefLoading, setPrefLoading] = useState(false);

    // security stuff
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [securityMsg, setSecurityMsg] = useState('');

    // fetch everything on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // get categories from api
            const catData = await api.getCategories();
            setCategories(catData);

            // get user prefs
            const prefRes = await api.getPreferences();
            if (prefRes.ok) {
                const data = await prefRes.json();
                if (data) {
                    setPreferences({
                        professionalContext: data.professionalContext || '',
                        learningGoals: data.learningGoals || '',
                        topicsToAvoid: data.topicsToAvoid || ''
                    });
                }
            }
        } catch (e) {
            console.error("failed to load settings", e);
        }
    };

    // category actions
    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        setCatLoading(true);
        try {
            const createdCategory = await api.createCategory(newCategory);
            setCategories([...categories, createdCategory]);
            setNewCategory('');
        } catch(e) { console.error(e); }
        finally { setCatLoading(false); }
    };

    const handleDeleteCategory = async (id: string) => {
        if(!confirm("Are you sure?")) return;
        try {
            await api.deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
        } catch(e) { console.error(e); }
    };

    // preference actions
    const handleSavePreferences = async () => {
        setPrefLoading(true);
        try {
            await api.updatePreferences(preferences);
        } catch(e) { console.error(e); }
        finally { setPrefLoading(false); }
    };

    // security actions
    const handlePasswordChange = async () => {
        setSecurityMsg('');
        if (passwords.new !== passwords.confirm) {
            setSecurityMsg('ERROR: Passwords do not match');
            return;
        }
        if (passwords.new.length < 6) {
            setSecurityMsg('ERROR: Password too short');
            return;
        }

        // todo: actual api call for password
        setSecurityMsg('MOCK: Password update request sent.');
        setPasswords({ current: '', new: '', confirm: '' });
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 max-w-7xl mx-auto">

            {/* security section */}
            <section className="xl:col-span-4 flex flex-col gap-4">
                <div className="border-b border-tech-border pb-2 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-tech-primary uppercase tracking-tighter flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        [CREDENTIAL_UPDATE]
                    </h3>
                </div>

                <div className="border border-tech-border bg-tech-surface p-6 flex flex-col gap-6">
                    <div className="space-y-4">

                        {/* current user display */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-tech-text-muted uppercase font-bold">System Nickname</label>
                            <input
                                className="bg-black border border-tech-border px-3 py-2 text-xs focus:ring-0 text-tech-primary font-mono cursor-not-allowed opacity-70"
                                type="text"
                                readOnly
                                defaultValue="Current User"
                            />
                        </div>

                        <div className="h-[1px] bg-tech-border w-full my-2"></div>

                        {/* pass fields */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-tech-text-muted uppercase font-bold">Current Password</label>
                            <input
                                className="bg-black border border-tech-border px-3 py-2 text-xs focus:outline-none focus:border-tech-primary text-tech-primary font-mono transition-colors"
                                type="password"
                                value={passwords.current}
                                onChange={e => setPasswords({...passwords, current: e.target.value})}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-tech-text-muted uppercase font-bold">New Password</label>
                            <input
                                className="bg-black border border-tech-border px-3 py-2 text-xs focus:outline-none focus:border-tech-primary text-tech-primary font-mono transition-colors"
                                type="password"
                                value={passwords.new}
                                onChange={e => setPasswords({...passwords, new: e.target.value})}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-tech-text-muted uppercase font-bold">Confirm New Password</label>
                            <input
                                className={`bg-black border px-3 py-2 text-xs focus:outline-none font-mono transition-colors ${
                                    passwords.confirm && passwords.new !== passwords.confirm
                                        ? 'border-red-500 text-red-400'
                                        : 'border-tech-border focus:border-tech-primary text-tech-primary'
                                }`}
                                type="password"
                                value={passwords.confirm}
                                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                            />
                        </div>
                    </div>

                    {securityMsg && (
                        <div className={`text-[10px] uppercase font-bold ${securityMsg.includes('ERROR') ? 'text-red-500' : 'text-tech-primary'}`}>
                            &gt; {securityMsg}
                        </div>
                    )}

                    <button
                        onClick={handlePasswordChange}
                        disabled={!passwords.current || !passwords.new || !passwords.confirm}
                        className="w-full py-3 border border-tech-primary text-tech-primary text-xs font-bold uppercase flex items-center justify-center gap-2 hover:bg-tech-primary hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        SYMB_SAVE_CREDENTIALS
                    </button>
                </div>
            </section>

            {/* category manager */}
            <section className="xl:col-span-4 flex flex-col gap-4">
                <div className="border-b border-tech-border pb-2 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-tech-primary uppercase tracking-tighter flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" />
                        [CATEGORIES_DATABASE]
                    </h3>
                </div>

                <div className="border border-tech-border bg-tech-surface flex flex-col h-full max-h-[600px]">
                    {/* input area */}
                    <div className="p-4 border-b border-tech-border bg-black/50">
                        <div className="flex gap-2">
                            <input
                                className="flex-1 bg-black border border-tech-border px-3 py-2 text-[10px] focus:outline-none focus:border-tech-primary text-tech-primary font-mono uppercase placeholder:text-gray-700"
                                placeholder="INITIALIZE_NEW..."
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            />
                            <button
                                onClick={handleAddCategory}
                                disabled={catLoading}
                                className="w-10 h-10 border border-tech-border flex items-center justify-center text-tech-primary hover:bg-tech-primary-dim transition-colors disabled:opacity-50"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* list area */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="divide-y divide-tech-border">
                            {categories.length === 0 ? (
                                <div className="p-4 text-[10px] text-gray-600 text-center italic">NO_DATA_FOUND</div>
                            ) : (
                                categories.map((cat) => (
                                    <div key={cat.id} className="p-4 flex items-center justify-between group hover:bg-tech-primary-dim transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Folder className="text-tech-text-muted w-5 h-5 group-hover:text-tech-primary transition-colors" />
                                            <span className="text-xs font-bold text-gray-300 group-hover:text-white uppercase w-full">
                            {cat.name}
                        </span>
                                        </div>
                                        <div className="flex items-center gap-4 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-tech-text-muted hover:text-tech-primary transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                className="p-2 text-tech-text-muted hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* cognitive profile section */}
            <section className="xl:col-span-4 flex flex-col gap-4">
                <div className="border-b border-tech-border pb-2 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-tech-primary uppercase tracking-tighter flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        [USER_COGNITIVE_PROFILE]
                    </h3>
                    <button
                        onClick={handleSavePreferences}
                        disabled={prefLoading}
                        className="text-[10px] font-bold text-tech-primary border border-tech-primary px-3 py-1 hover:bg-tech-primary hover:text-black transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                        {prefLoading ? 'SAVING...' : 'SAVE_CONFIG'} <Save className="w-3 h-3" />
                    </button>
                </div>

                <div className="border border-tech-border bg-tech-surface p-6 flex flex-col gap-5">

                    {/* professional field */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-1">
                            <Brain className="w-3 h-3 text-tech-primary" />
                            <span className="text-[10px] text-tech-text-muted uppercase font-bold">Professional Context</span>
                        </div>
                        <textarea
                            className="w-full bg-black border border-tech-border p-3 text-xs leading-relaxed h-28 focus:outline-none focus:border-tech-primary text-gray-300 font-mono resize-none transition-colors"
                            spellCheck="false"
                            placeholder="Describe your role and expertise..."
                            value={preferences.professionalContext}
                            onChange={e => setPreferences({...preferences, professionalContext: e.target.value})}
                        />
                    </div>

                    {/* goals field */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="w-3 h-3 text-tech-primary" />
                            <span className="text-[10px] text-tech-text-muted uppercase font-bold">Learning Goals</span>
                        </div>
                        <textarea
                            className="w-full bg-black border border-tech-border p-3 text-xs leading-relaxed h-28 focus:outline-none focus:border-tech-primary text-gray-300 font-mono resize-none transition-colors"
                            spellCheck="false"
                            placeholder="What do you want to master?"
                            value={preferences.learningGoals}
                            onChange={e => setPreferences({...preferences, learningGoals: e.target.value})}
                        />
                    </div>

                    {/* filters field */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-3 h-3 text-tech-primary" />
                            <span className="text-[10px] text-tech-text-muted uppercase font-bold">Topics to Avoid</span>
                        </div>
                        <textarea
                            className="w-full bg-black border border-tech-border p-3 text-xs leading-relaxed h-28 focus:outline-none focus:border-tech-primary text-gray-300 font-mono resize-none transition-colors"
                            spellCheck="false"
                            placeholder="Content you want to filter out..."
                            value={preferences.topicsToAvoid}
                            onChange={e => setPreferences({...preferences, topicsToAvoid: e.target.value})}
                        />
                    </div>

                </div>
            </section>

        </div>
    );
}