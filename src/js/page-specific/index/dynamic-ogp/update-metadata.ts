// OGタグを更新する関数
export function updateMetadataForOGP(
  title: string,
  description: string,
  url: string,
  imageUrl: string,
): void {
  const metaOgTitle = document.querySelector('meta[property="og:title"]') as
    | HTMLMetaElement
    | null;
  const metaOgType = document.querySelector('meta[property="og:type"]') as
    | HTMLMetaElement
    | null;
  const metaOgDescription = document.querySelector(
    'meta[property="og:description"]',
  ) as HTMLMetaElement | null;
  const metaOgUrl = document.querySelector('meta[property="og:url"]') as
    | HTMLMetaElement
    | null;
  const metaOgImage = document.querySelector('meta[property="og:image"]') as
    | HTMLMetaElement
    | null;

  if (metaOgTitle === null) {
    throw new Error('updateMetadataForOGP: missing meta[property="og:title"]');
  }
  if (metaOgType === null) {
    throw new Error('updateMetadataForOGP: missing meta[property="og:type"]');
  }
  if (metaOgDescription === null) {
    throw new Error(
      'updateMetadataForOGP: missing meta[property="og:description"]',
    );
  }
  if (metaOgUrl === null) {
    throw new Error('updateMetadataForOGP: missing meta[property="og:url"]');
  }
  if (metaOgImage === null) {
    throw new Error('updateMetadataForOGP: missing meta[property="og:image"]');
  }

  metaOgTitle.content = title;
  metaOgDescription.content = description;
  metaOgUrl.content = url;
  metaOgImage.content = imageUrl;

  // og:type is fixed value
  metaOgType.content = "website";
}
