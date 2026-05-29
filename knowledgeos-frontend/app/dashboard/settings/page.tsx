'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Key, Save, FolderOpen, Plus, Trash2,
    Brain, Target, AlertTriangle, ShieldCheck, Folder, Palette, MessageSquare, UserRound
} from 'lucide-react';
import type { ProfileRefineResponse } from '@/lib/types';
import { useTheme, Theme } from '@/lib/ThemeProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Category {
    id: string;
    name: string;
}

interface UserPreferences {
    professionalContext: string;
    learningGoals: string;
    hobbies: string;
    topicsToAvoid: string;
}

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [catLoading, setCatLoading] = useState(false);

    const [preferences, setPreferences] = useState<UserPreferences>({
        professionalContext: '',
        learningGoals: '',
        hobbies: '',
        topicsToAvoid: ''
    });
    const [prefLoading, setPrefLoading] = useState(false);

    const [refineMessage, setRefineMessage] = useState('');
    const [refineLoading, setRefineLoading] = useState(false);
    const [refineError, setRefineError] = useState('');
    const [refinePreview, setRefinePreview] = useState<ProfileRefineResponse | null>(null);

    const [nickname, setNickname] = useState('');
    const [nickLoading, setNickLoading] = useState(false);

    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [securityMsg, setSecurityMsg] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const catData = await api.getCategories();
            setCategories(catData);

            const meRes = await api.getMe();
            if (meRes.ok) {
                const meData = await meRes.json();
                if (meData?.displayName) setNickname(meData.displayName);
            }

            const prefRes = await api.getPreferences();
            if (prefRes.ok) {
                const data = await prefRes.json();
                if (data) {
                    setPreferences({
                        professionalContext: data.professionalContext || '',
                        learningGoals: data.learningGoals || '',
                        hobbies: data.hobbies || '',
                        topicsToAvoid: data.topicsToAvoid || ''
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

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
        if (!confirm("Are you sure?")) return;
        try {
            await api.deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
        } catch(e) { console.error(e); }
    };

    const handleUpdateNickname = async () => {
        if (!nickname.trim()) return;
        setNickLoading(true);
        try {
            await api.updateProfile(nickname);
        } catch(e) { console.error(e); }
        finally { setNickLoading(false); }
    };

    const handleRefineProfile = async () => {
        if (!refineMessage.trim()) return;
        setRefineLoading(true);
        setRefineError('');
        setRefinePreview(null);
        try {
            const result: ProfileRefineResponse = await api.refinePreferences(refineMessage.trim(), undefined);
            setRefinePreview(result);
        } catch (e) {
            setRefineError(e instanceof Error ? e.message : 'Refine failed');
        } finally {
            setRefineLoading(false);
        }
    };

    const handleApplyRefine = async () => {
        if (!refinePreview?.hasChanges) return;
        const proposed = refinePreview.proposedPreferences;
        setPreferences({
            professionalContext: proposed.professionalContext ?? '',
            learningGoals: proposed.learningGoals ?? '',
            hobbies: proposed.hobbies ?? '',
            topicsToAvoid: proposed.topicsToAvoid ?? '',
        });
        setPrefLoading(true);
        try {
            await api.updatePreferences(proposed);
            setRefinePreview(null);
            setRefineMessage('');
        } catch (e) {
            console.error(e);
            setRefineError('Failed to save refined profile');
        } finally {
            setPrefLoading(false);
        }
    };

    const isFieldChanged = (field: string) => refinePreview?.changedFields.includes(field) ?? false;

    const handleSavePreferences = async () => {
        setPrefLoading(true);
        try {
            await api.updatePreferences(preferences);
        } catch(e) { console.error(e); }
        finally { setPrefLoading(false); }
    };

    const handlePasswordChange = async () => {
        setSecurityMsg('');
        if (passwords.new !== passwords.confirm) {
            setSecurityMsg('Hasła nie są takie same.');
            return;
        }
        if (passwords.new.length < 6) {
            setSecurityMsg('Hasło jest za krótkie (min. 6 znaków).');
            return;
        }
        try {
            const res = await api.changePassword(passwords.current, passwords.new);
            if (res.ok) {
                setSecurityMsg('Hasło zostało zaktualizowane.');
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                setSecurityMsg('Nie udało się zaktualizować hasła.');
            }
        } catch (error) {
            setSecurityMsg('Błąd połączenia z serwerem.');
            console.error(error);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <section>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    Profil i personalizacja AI
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Tu ustawiasz, co AI ma preferować oraz jak ma klasyfikować nowe zasoby.
                </p>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <Card className="xl:col-span-8">
                    <CardHeader className="flex flex-row items-center justify-between gap-3">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-slate-900">
                                <Brain className="w-4 h-4 text-indigo-600" />
                                Profil poznawczy
                            </CardTitle>
                            <CardDescription>Kontekst, cele nauki, hobby i tematy do unikania.</CardDescription>
                        </div>
                        <Button onClick={handleSavePreferences} disabled={prefLoading}>
                            {prefLoading ? 'Zapisywanie...' : 'Zapisz'}
                            <Save className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-medium text-slate-600">Professional Context</label>
                            <textarea
                                className={`w-full rounded-md border bg-white p-3 text-sm h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                                    isFieldChanged('professionalContext') ? 'border-indigo-400' : 'border-slate-300'
                                }`}
                                spellCheck={false}
                                placeholder="Opisz swoją rolę, obszary odpowiedzialności i poziom zaawansowania."
                                value={refinePreview?.proposedPreferences.professionalContext ?? preferences.professionalContext}
                                onChange={e => setPreferences({ ...preferences, professionalContext: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                <Target className="w-3.5 h-3.5" />
                                Learning Goals
                            </label>
                            <textarea
                                className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                spellCheck={false}
                                placeholder="Czego chcesz się teraz uczyć?"
                                value={refinePreview?.proposedPreferences.learningGoals ?? preferences.learningGoals}
                                onChange={e => setPreferences({ ...preferences, learningGoals: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-600">Hobbies & Interests</label>
                            <textarea
                                className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                placeholder="Co Cię ciekawi prywatnie?"
                                value={refinePreview?.proposedPreferences.hobbies ?? preferences.hobbies}
                                onChange={e => setPreferences({ ...preferences, hobbies: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Topics To Avoid
                            </label>
                            <textarea
                                className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                spellCheck={false}
                                placeholder="Jakie treści mają być obniżane albo pomijane?"
                                value={refinePreview?.proposedPreferences.topicsToAvoid ?? preferences.topicsToAvoid}
                                onChange={e => setPreferences({ ...preferences, topicsToAvoid: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="xl:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <MessageSquare className="w-4 h-4 text-indigo-600" />
                            Profile Refine
                        </CardTitle>
                        <CardDescription>
                            Opisz zmianę preferencji, a AI zaproponuje aktualizację profilu.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <textarea
                            className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            spellCheck={false}
                            placeholder='Np. "Mniej polityki, więcej gotowania i analiz biznesowych."'
                            value={refineMessage}
                            onChange={e => setRefineMessage(e.target.value)}
                        />
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                onClick={handleRefineProfile}
                                disabled={refineLoading || !refineMessage.trim()}
                                variant="outline"
                            >
                                {refineLoading ? 'Analizuję...' : 'Zaproponuj zmiany'}
                            </Button>
                            {refinePreview && (
                                <>
                                    <Button
                                        type="button"
                                        onClick={handleApplyRefine}
                                        disabled={!refinePreview.hasChanges || prefLoading}
                                    >
                                        Zastosuj
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={() => setRefinePreview(null)}>
                                        Odrzuć
                                    </Button>
                                </>
                            )}
                        </div>
                        {refineError && <p className="text-xs text-red-500">{refineError}</p>}
                        {refinePreview && (
                            <div className="rounded-md border border-slate-200 p-3 bg-slate-50 space-y-2">
                                <Badge variant="outline">Podsumowanie AI</Badge>
                                <p className="text-sm text-slate-600">{refinePreview.assistantSummary}</p>
                                {!refinePreview.hasChanges && (
                                    <p className="text-xs text-slate-500">Brak sugerowanych zmian.</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <section>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <UserRound className="w-5 h-5 text-indigo-600" />
                    Konto i bezpieczeństwo
                </h2>
            </section>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <Card className="xl:col-span-5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <Key className="w-4 h-4 text-indigo-600" />
                            Tożsamość
                        </CardTitle>
                        <CardDescription>Nazwa widoczna w panelu i nagłówku.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <label className="text-xs font-medium text-slate-600">Display Name</label>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="Twoja nazwa"
                            />
                            <Button onClick={handleUpdateNickname} disabled={nickLoading} variant="outline">
                                {nickLoading ? '...' : 'Zapisz'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="xl:col-span-7">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                            Hasło
                        </CardTitle>
                        <CardDescription>Zmień hasło dostępu do konta.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                type="password"
                                value={passwords.current}
                                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                placeholder="Aktualne hasło"
                            />
                            <input
                                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                type="password"
                                value={passwords.new}
                                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                placeholder="Nowe hasło"
                            />
                            <input
                                className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                                    passwords.confirm && passwords.new !== passwords.confirm
                                        ? 'border-red-400 text-red-500'
                                        : 'border-slate-300 bg-white'
                                }`}
                                type="password"
                                value={passwords.confirm}
                                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                placeholder="Potwierdź hasło"
                            />
                        </div>
                        {securityMsg && (
                            <p className={`text-xs ${securityMsg.includes('zostało') ? 'text-emerald-600' : 'text-red-500'}`}>
                                {securityMsg}
                            </p>
                        )}
                        <Button
                            onClick={handlePasswordChange}
                            disabled={!passwords.current || !passwords.new || !passwords.confirm}
                            variant="outline"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Zapisz nowe hasło
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <section>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-indigo-600" />
                    Organizacja i wygląd
                </h2>
            </section>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <Card className="xl:col-span-7">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <FolderOpen className="w-4 h-4 text-indigo-600" />
                            Kategorie
                        </CardTitle>
                        <CardDescription>Dodawaj i usuwaj kategorie dla elementów w Vault.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex gap-2">
                            <input
                                className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                placeholder="Nowa kategoria..."
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            />
                            <Button onClick={handleAddCategory} disabled={catLoading} variant="outline">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="rounded-md border border-slate-200 divide-y divide-slate-200 bg-white">
                            {categories.length === 0 ? (
                                <div className="p-4 text-sm text-slate-500 text-center">Brak kategorii.</div>
                            ) : (
                                categories.map((cat) => (
                                    <div key={cat.id} className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Folder className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-700 truncate">{cat.name}</span>
                                        </div>
                                        <Button
                                            onClick={() => handleDeleteCategory(cat.id)}
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="xl:col-span-5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <Palette className="w-4 h-4 text-indigo-600" />
                            Motyw
                        </CardTitle>
                        <CardDescription>Wybierz styl interfejsu.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {([
                            {
                                id: 'clean-light',
                                label: 'Clean Light',
                                desc: 'Jasny, minimalistyczny',
                                accent: '#6366f1',
                                bg: '#f8fafc',
                            },
                            {
                                id: 'clean-dark',
                                label: 'Clean Dark',
                                desc: 'Nowoczesny ciemny',
                                accent: '#818cf8',
                                bg: '#020617',
                            },
                            {
                                id: 'cyber-green',
                                label: 'Cyber Green',
                                desc: 'Klasyczny terminal',
                                accent: '#a3ffbf',
                                bg: '#050505',
                            },
                            {
                                id: 'cyber-purple',
                                label: 'Cyber Purple',
                                desc: 'Dark z fioletem',
                                accent: '#c084fc',
                                bg: '#06000f',
                            },
                        ] as { id: Theme; label: string; desc: string; accent: string; bg: string }[]).map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-md border transition-all text-left ${
                                    theme === t.id
                                        ? 'border-indigo-400 bg-indigo-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div
                                    className="flex-shrink-0 w-8 h-8 border border-slate-300 overflow-hidden rounded-md flex items-center justify-center"
                                    style={{ backgroundColor: t.bg }}
                                >
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.accent }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-800">{t.label}</div>
                                    <div className="text-xs text-slate-500">{t.desc}</div>
                                </div>
                                {theme === t.id && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                            </button>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


