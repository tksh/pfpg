export function updateMetadata(title, description, url) {
    const metaTitle = document.querySelector('meta[property="og:title"]');
    const metaType = document.querySelector('meta[property="og:type"]');
    const metaDescription = document.querySelector('meta[property="og:description"]');
    const metaUrl = document.querySelector('meta[property="og:url"]');

    if (title) metaTitle.content = title;
    if (description) metaDescription.content = description;
    if (url) metaUrl.content = url;

    // タイプは固定
    metaType.content = "website";
}

