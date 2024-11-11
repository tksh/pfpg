import { decodeUrlParams } from 'common-utils/read-url-params'
import { generateSvg } from 'decode/generate-svg'


async function serveSvgImage() {

    if (window.location.search) {
        console.log('SVG decoding started.')
        const decodedParams = decodeUrlParams()
        // console.log('decodedParams: ', decodedParams)
        const isRelative = true
        const svgString = generateSvg(isRelative, decodedParams)
        console.log('svgString: ', svgString)

        const base64Svg = btoa(svgString);
        console.log('base64Svg: ', base64Svg)
        document.body.innerHTML = `<img src="data:image/svg+xml;base64,${base64Svg}" alt="SVG Image">`;

//        // SVG をページに追加
//        const svgElement = new DOMParser().parseFromString(svgString, 'image/svg+xml').documentElement;
//        console.log('svgElement: ', svgElement)
//
//        // SVG要素のスタイルを適用
//        svgElement.style.width = '800px';
//        svgElement.style.height = '600px';
//
//
//        document.body.appendChild(svgElement);
//
//        // 画像が生成されたら、ページを閉じる
//        setTimeout(() => {
//            window.close();
//        }, 5000); // 5秒後にページを閉じる

    } else {
        try {
            document.body.innerHTML = '<p>There is no data to decode to SVG.</p>';
//            const txtElement = document.createElement('div');
//            txtElement.textContent = 'There is no data to decode to SVG.';
//            document.body.appendChild(txtElement);
        } catch (error) {
            console.error('Failed to display error message:', error);
        }

    }
}

serveSvgImage();