import { updateState } from "state/url-state-manager";

export { initViewScalingSelect, switchViewScaling };

function initViewScalingSelect(): void {
  // セレクトメニューの要素を取得
  const selectOfViewScaling = document.getElementById("view-scaling");
  if (!selectOfViewScaling) throw new Error("Element 'view-scaling' not found");
  const viewScalingSelect = selectOfViewScaling as HTMLSelectElement;

  // changeイベントを設定
  viewScalingSelect.addEventListener("change", () => {
    // チェックされたセレクトメニューの値を取得
    const viewScaling = viewScalingSelect.value;
    console.log("viewScaling: ", viewScaling);

    // Update the state
    updateState("viewScaling", viewScaling);

    // Apply to img elem
    switchViewScaling(viewScaling);
  });
}

function switchViewScaling(viewScaling: string): void {
  // PNG img要素を 取得
  const img = document.querySelector("img");
  if (!img) throw new Error("Element 'img' not found");

  // Toggle the classes for img elem
  if (viewScaling == "fit") {
    img.classList.add("fit-to-display-area");
    img.classList.remove("actual-image-size");
  } else if (viewScaling == "actual") {
    img.classList.add("actual-image-size");
    img.classList.remove("fit-to-display-area");
  }

  // レイアウトの再適用をトリガーする
  // - クラスの切り替え後に #img-boxのstyle.displayを 一時的に"none"に設定し
  //   offsetHeightの取得により強制的にレイアウトの再計算を行う
  // - これにより、クラスの変更が 確実にレイアウトに反映される ようになる
  // - style.display を空文字に戻すことで 再び要素が表示されるようになる
  // この一連の操作によって クラスの切り替え時に スクロールバーの表示/非表示 が安定する

  const imgBox = document.getElementById("img-box");
  if (!imgBox) throw new Error("Element 'img-box' not found");
  imgBox.style.display = "none";
  void imgBox.offsetHeight; // レイアウト強制
  imgBox.style.display = "";
}
