// Update .innerHtml
async function updateRenderingStatus(text, element) {
    return new Promise((resolve) => {
        // メッセージを更新し、次のフレームで反映させる
        element.innerHTML = text;
        requestAnimationFrame(() => {
            resolve();
        });
    });
}

