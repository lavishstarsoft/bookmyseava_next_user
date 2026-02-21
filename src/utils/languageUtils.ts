/**
 * Detects if text contains a significant amount of Telugu characters (U+0C00–U+0C7F).
 * Returns true if Telugu characters make up more than 30% of non-whitespace characters.
 * Useful for adjusting font sizes based on language.
 */
export const isTeluguText = (text: string | undefined): boolean => {
    if (!text) return false;
    const cleaned = text.replace(/\s+/g, '');
    if (cleaned.length === 0) return false;
    const teluguChars = (cleaned.match(/[\u0C00-\u0C7F]/g) || []).length;
    return teluguChars / cleaned.length > 0.3;
};

/**
 * Returns the appropriate font size and line height classes based on the detected language.
 * @param text The text content to analyze
 * @param isTitle Whether this is for a title (needs larger font sizes) or body text
 * @returns A string of Tailwind classes
 */
export const getLanguageClasses = (text: string | undefined, isTitle: boolean = false): string => {
    const isTelugu = isTeluguText(text);

    if (isTitle) {
        // Titles are generally handled by specific classes (e.g. text-xl), 
        // but if we want to enforce language-specific sizing we can do so here.
        // For now, returning empty so we don't accidentally override specific title sizes,
        // or we can add specific logic if needed. User mainly asked for content, but we'll 
        // handle both gracefully.
        return isTelugu ? 'text-[20px] leading-[1.6]' : 'text-[18px] leading-[1.5]';
    } else {
        // Body text (excerpt, etc.)
        return isTelugu ? 'text-[14px] leading-[1.8]' : 'text-[12px] leading-[1.7]';
    }
};
