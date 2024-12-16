export function updateMetadata(title, description, url, image) {
    const metaOgTitle = document.querySelector('meta[property="og:title"]');
    const metaOgType = document.querySelector('meta[property="og:type"]');
    const metaOgDescription = document.querySelector('meta[property="og:description"]');
    const metaOgUrl = document.querySelector('meta[property="og:url"]');
    const metaOgImage = document.querySelector('meta[property="og:image"]');

    metaOgTitle.content = title;
    metaOgDescription.content = description;
    metaOgUrl.content = url;
    metaOgImage.content = image;

    // og:type is fixed value
    metaOgType.content = "website";
}

