'use client';

import { Category, VaultResource } from '@/lib/types';
import { X, PlayCircle, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { categoryBadgeClass } from '@/lib/categoryColor';
import { getResourceTypeConfig } from '@/lib/resourceCardUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface VaultDetailModalProps {
    resource: VaultResource;
    onClose: () => void;
    onDelete: () => void;
    onReanalyze?: () => void;
    onUpdated?: (patch: Partial<VaultResource>) => void;
}

export function VaultDetailModal({ resource, onClose, onDelete, onUpdated }: VaultDetailModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(resource.categoryId ?? null);

    const config = getResourceTypeConfig(resource.resourceType);
    const TypeIcon = config.icon;
    const isVideo = resource.resourceType === 'Video';

    useEffect(() => {
        setSelectedCategoryId(resource.categoryId ?? null);
    }, [resource.categoryId]);

    useEffect(() => {
        let cancelled = false;
        api.getCategories()
            .then((data) => {
                if (cancelled) return;
                setCategories(data);
            })
            .catch(console.error);
        return () => {
            cancelled = true;
        };
    }, []);

    const selectedCategoryName = useMemo(() => {
        if (!selectedCategoryId) return undefined;
        return categories.find((c) => c.id === selectedCategoryId)?.name ?? resource.categoryName;
    }, [categories, resource.categoryName, selectedCategoryId]);

    const handleSaveCategory = async (categoryId: string | null) => {
        setIsSavingCategory(true);
        try {
            await api.updateVaultResourceCategory(resource.id, categoryId);

            const patch: Partial<VaultResource> = {
                categoryId: categoryId ?? undefined,
                categoryName: categoryId ? (categories.find((c) => c.id === categoryId)?.name ?? resource.categoryName) : undefined,
                suggestedCategoryName: undefined,
            };
            onUpdated?.(patch);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSavingCategory(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Na pewno przenieść ten zasób do kosza?')) return;
        setIsDeleting(true);
        try {
            const res = await api.deleteResource(resource.id);
            if (res.ok) {
                onDelete();
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-slate-900/50"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl bg-white border border-slate-200 shadow-xl rounded-xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-200 p-4">
                    <h2 className="text-sm font-semibold text-slate-900">
                        Vault · {resource.id.substring(0, 8)}
                    </h2>
                    <Button onClick={onClose} variant="outline" size="icon" className="h-8 w-8">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="overflow-y-auto flex-1">
                    <div className="p-6 md:p-8">
                        {resource.imageUrl && (
                            <div className="relative w-full aspect-video border border-slate-200 mb-8 group cursor-pointer bg-slate-100 overflow-hidden rounded-lg">
                                <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                                    <Image
                                        src={resource.imageUrl}
                                        alt={resource.title}
                                        fill
                                        sizes="(max-width: 1200px) 100vw, 800px"
                                        className="object-cover grayscale-50 group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100"
                                    />
                                    {isVideo && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <PlayCircle className="w-20 h-20 text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
                                        </div>
                                    )}
                                </Link>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <Badge variant="outline" className="text-slate-600">
                                            <TypeIcon className="w-3 h-3 mr-1.5" />
                                            {config.label}
                                        </Badge>
                                        {resource.siteName && (
                                            <span className="text-xs text-slate-500">{resource.siteName}</span>
                                        )}
                                        {selectedCategoryName ? (
                                            <span className={categoryBadgeClass(selectedCategoryName)}>
                                                {selectedCategoryName}
                                            </span>
                                        ) : (
                                            <Badge variant="secondary" className="rounded-md text-[11px]">
                                                Bez kategorii
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-semibold text-slate-900 leading-tight">
                                        <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-indigo-600 flex items-start gap-2"
                                        >
                                            {resource.title}
                                            <ExternalLink className="w-4 h-4 mt-1 opacity-50 flex-shrink-0" />
                                        </a>
                                    </h3>
                                </div>

                                {resource.aiSummary && (
                                    <div className="border-l-2 border-slate-200 pl-6 space-y-2">
                                        <h4 className="text-xs font-semibold text-slate-700">Podsumowanie AI</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                            {resource.aiSummary}
                                        </p>
                                    </div>
                                )}

                                {resource.userNote && (
                                    <div className="border-l-2 border-slate-200 pl-6 space-y-2">
                                        <h4 className="text-xs font-semibold text-slate-700">Twoja notatka</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                            {resource.userNote}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <Card className="p-4 border-slate-200 bg-slate-50 space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <h4 className="text-xs font-semibold text-slate-600">Kategoria</h4>
                                        {isSavingCategory && (
                                            <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Zapisuję...
                                            </span>
                                        )}
                                    </div>

                                    <select
                                        value={selectedCategoryId ?? ''}
                                        onChange={(e) => {
                                            const next = e.target.value || null;
                                            setSelectedCategoryId(next);
                                            void handleSaveCategory(next);
                                        }}
                                        disabled={isSavingCategory}
                                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
                                    >
                                        <option value="">Bez kategorii</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </Card>

                                <Card className="p-4 border-slate-200 bg-slate-50">
                                    <h4 className="text-xs font-semibold text-slate-600 mb-3">Tagi</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {resource.tags && resource.tags.length > 0 ? (
                                            resource.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="rounded-md">
                                                    #{tag}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-500">Brak tagów</span>
                                        )}
                                    </div>
                                </Card>

                                {resource.author && (
                                    <Card className="p-4 border-slate-200 bg-slate-50">
                                        <h4 className="text-xs font-semibold text-slate-600 mb-2">Autor</h4>
                                        <span className="text-xs text-slate-700">{resource.author}</span>
                                    </Card>
                                )}

                                {resource.promotedToVaultAt && (
                                    <Card className="p-4 border-slate-200 bg-slate-50">
                                        <h4 className="text-xs font-semibold text-slate-600 mb-2">W vault od</h4>
                                        <span className="text-xs text-slate-700">
                                            {new Date(resource.promotedToVaultAt).toLocaleDateString('pl-PL')}
                                        </span>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 bg-white sticky bottom-0 z-10">
                    <Button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        variant="destructive"
                        className="w-full justify-center"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        {isDeleting ? 'Usuwam...' : 'Przenieś do kosza'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
