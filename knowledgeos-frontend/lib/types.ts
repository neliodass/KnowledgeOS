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
    aiVerdict?: string;
    correctedTitle?: string;
    substanceDepth?: string;
    contentIntent?: string;
    relevance?: string;
    takeaway?: string;
    scoredFromMetadataOnly?: boolean;
}

// Vault (VaultResourceDto)
export interface VaultResource extends ResourceBase {
    status: string;
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

export interface ProfileRefineResponse {
    assistantSummary: string;
    proposedPreferences: UserPreferences;
    changedFields: string[];
    hasChanges: boolean;
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