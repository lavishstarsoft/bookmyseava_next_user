
const ReadOnlyEditor = ({ content }: { content: any }) => {
    let htmlContent = '';

    if (typeof content === 'string') {
        htmlContent = content;
    } else if (content && typeof content === 'object') {
        if ('html' in content) {
            htmlContent = content.html;
        } else {
            // Fallback for Tiptap JSON if needed, but for now we expect HTML string in object
            // If it's raw JSON, we might need a parser, but currently backend saves { html: ... }
            htmlContent = JSON.stringify(content);
        }
    }

    if (!htmlContent) {
        return <p className="text-muted-foreground italic">No content available.</p>;
    }

    return (
        <div
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
