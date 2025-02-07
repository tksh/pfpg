// Return as Plain text
// export default () => new Response("First Function");


// Return as HTML
export default async () => {
    return new Response("Hello, World! This is HTML response!!", {
        headers: { "content-type": "text/html" }
    });
};

