import { getSvgString } from 'button/download-as-file'

export
    { copyPngToClipboard
    , copySvgToClipboard
    }

// Copy PNG blob to clipboard

async function copyPngToClipboard() {
    try {
        const imgElem = document.getElementById('img');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = imgElem.naturalWidth;
        canvas.height = imgElem.naturalHeight;
        ctx.drawImage(imgElem, 0, 0);

        canvas.toBlob(async (blob) => {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            console.log("PNG image copied to clipboard");

            const pngActionButtonElement = document.getElementById("png-action-button");
            const originalText = pngActionButtonElement.innerHTML;

            pngActionButtonElement.textContent = '✔️ Successfully copied!';

            setTimeout(() => {
                pngActionButtonElement.innerHTML = originalText;
            }, 1500);
        });

    } catch (error) {
        console.error("Failed to copy PNG image: ", error);
    }
}


// Copy SVG text to clipboard

async function copySvgToClipboard() {
    try {
        await navigator.clipboard.writeText(getSvgString());
        console.log("SVG Text copied to clipboard");

        const svgActionButtonElement = document.getElementById("svg-action-button")
        const originalHtml = svgActionButtonElement.innerHTML

        // 成功メッセージを表示し、success-message クラスを追加
        svgActionButtonElement.textContent = '✔️ Successfully copied!'

        setTimeout(() => {
            svgActionButtonElement.innerHTML = originalHtml
        }, 1500)

    } catch (error) {
        console.error("Failed to copy SVG text: ", error);
    }
}

