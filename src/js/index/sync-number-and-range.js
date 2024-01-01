    // `Width:` value sync between `number` and `range`
    const syncWidthNum = (element) => {
        const id = element.id; // 入力された要素のidを取得
        const value = element.value; // 入力された要素の値を取得
        const targetId = id === "png-size-number" ? "png-size-range" : "png-size-number"; // idによって対応する要素を決める
        const target = document.getElementById(targetId); // 対応する要素を取得
        target.value = value; // 対応する要素の値を入力された要素の値と同じにする
      }