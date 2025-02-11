// Return as Plain text
// export default () => new Response("First Function");


// Return as HTML
// export default async () => {
//     return new Response("Hello, World! This is HTML response!!", {
//         headers: { "content-type": "text/html" }
//     });
// };

export default async () => {
    const title = "Your Page Title";
    const description = "A short description of your page.";
    const url = "https://pfpg,netlify.app/ogp"; // Replace with your URL
    const imageUrl = "https://res.cloudinary.com/ddoy3pmjg/image/upload/pfpg1800257fb1cee265b6e648903f635165ce594f56c9c3cb146f0dfcaacca5a3406.png"; // Replace with your image URL

    const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>

    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:type" content="website">  <meta property="og:site_name" content="Your Site Name"> <meta name="description" content="${description}">  </head>
  <body>
    <h1>Hello, World! This is HTML response!!</h1>
    </body>
  </html>
  `;

    return new Response(html, {
        headers: { "content-type": "text/html" },
    });
};
