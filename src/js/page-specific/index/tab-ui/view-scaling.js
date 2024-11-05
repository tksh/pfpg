import { updateState } from 'state/url-state-manager'

export
    { initViewScalingSelect
    , switchViewScaling
    }


function initViewScalingSelect() {

    // セレクトメニューの要素を取得
    const selectOfViewScaling = document.getElementById('view-scaling')

    // changeイベントを設定
    selectOfViewScaling.addEventListener('change', () => {

        // チェックされたセレクトメニューの値を取得
        const viewScaling = selectOfViewScaling.value
        console.log('viewScaling: ', viewScaling)

        // Update the state
        updateState('viewScaling', viewScaling)

        // Apply to img elem
        switchViewScaling(viewScaling)
    })
}

function switchViewScaling(viewScaling) {
        // PNG img要素を 取得
        const img = document.querySelector('img')

        // Toggle the classes for img elem
        if (viewScaling == 'fit') {
            img.classList.add('fit-to-display-area')
            img.classList.remove('actual-image-size')
        } else if (viewScaling == 'actual') {
            img.classList.add('actual-image-size')
            img.classList.remove('fit-to-display-area')
        }


        // レイアウトの再適用をトリガーする
        // - クラスの切り替え後に #img-boxのstyle.displayを 一時的に"none"に設定し
        //   offsetHeightの取得により強制的にレイアウトの再計算を行う
        // - これにより、クラスの変更が 確実にレイアウトに反映される ようになる
        // - style.display を空文字に戻すことで 再び要素が表示されるようになる
        // この一連の操作によって クラスの切り替え時に スクロールバーの表示/非表示 が安定する

        const imgBox = document.getElementById("img-box")
        imgBox.style.display = "none";
        void imgBox.offsetHeight; // レイアウト強制
        imgBox.style.display = "";
}


