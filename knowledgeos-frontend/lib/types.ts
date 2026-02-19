// ResourceBaseDto
export interface ResourceBase {
    id: string;
    url: string;
    title: string;
    imageUrl?: string;
    resourceType: string;
    createdAt: string;
    aiSummary?: string;
    tags: string[];
    // Specific Video/Article
    channelName?: string;
    duration?: string;
    viewCount?: number;
    siteName?: string;
    author?: string;
    estimatedReadingTimeMinutes?: number;
}

// Inbox (InboxResourceDto)
export interface InboxResource extends ResourceBase {
    aiScore?: number;
    aiVerdict?: string;
    correctedTitle?: string;
}

// Vault (VaultResourceDto)
export interface VaultResource extends ResourceBase {
    categoryId?: string;
    categoryName?: string;
    suggestedCategoryName?: string;
    userNote?: string;
    promotedToVaultAt?: string;
}

// Auth
export interface AuthResponse {
    token: string;
}

export interface UserPreferences {
    professionalContext?: string;
    learningGoals?: string;
    hobbies?: string;
    topicsToAvoid?: string;
}
export interface Category {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    resourceCount?: number;
}

export interface CreateResourceRequest {
    url: string;
    addToVault: boolean;
    categoryId?: string;
}