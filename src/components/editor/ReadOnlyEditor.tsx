import { useRef, useEffect } from "react";

/**
 * Detects if text contains Telugu characters (U+0C00–U+0C7F).
 */
const isTeluguText = (text: string): boolean => {
    const cleaned = text.replace(/\s+/g, '');
    if (cleaned.length === 0) return false;
    const teluguChars = (cleaned.match(/[\u0C00-\u0C7F]/g) || []).length;
    return teluguChars / cleaned.length > 0.3;
};

const ReadOnlyEditor = ({ content }: { content: any }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    let htmlContent = '';

    if (typeof content === 'string') {
        htmlContent = content;
    } else if (content && typeof content === 'object') {
        if ('html' in content) {
            htmlContent = content.html;
        } else {
            htmlContent = JSON.stringify(content);
        }
    }

    // Apply language-based font sizes after render
    useEffect(() => {
        if (!contentRef.current || !htmlContent) return;

        const textElements = contentRef.current.querySelectorAll(
            'p, li, span, h1, h2, h3, h4, h5, h6, blockquote, td, th'
        );

        textElements.forEach((el) => {
            const text = el.textContent || '';
            if (text.trim().length === 0) return;

            const htmlEl = el as HTMLElement;

            if (isTeluguText(text)) {
                htmlEl.style.setProperty('font-size', '14px', 'important');
                htmlEl.style.setProperty('line-height', '1.8', 'important');
            } else {
                htmlEl.style.setProperty('font-size', '12px', 'important');
                htmlEl.style.setProperty('line-height', '1.7', 'important');
            }
        });
    }, [htmlContent]);

    if (!htmlContent) {
        return <p className="text-muted-foreground italic">No content available.</p>;
    }

    return (
        <div
            ref={contentRef}
            className="prose prose-neutral dark:prose-invert max-w-none font-teluguBody
            prose-headings:font-teluguHeading prose-headings:font-bold prose-headings:text-maroon dark:prose-headings:text-marigold
            prose-p:text-foreground/90 prose-p:leading-relaxed
            prose-a:text-marigold prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-lg
            prose-blockquote:border-l-marigold prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:rounded-r-lg
            [&_span]:!bg-transparent [&_p]:!bg-transparent"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
};

export default ReadOnlyEditor;

