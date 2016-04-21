function getSongDic() {
    var songdic = {};
    var url = targeturl[sdgvt] + "getsongdic.php";

    // 新着情報取得
    console.log("曲データ辞書取得");
    var http = new XMLHttpRequest();
    http.open("GET", url, false);
    http.send();

    if (400 <= http.status) {
        console.log(http.status + "通信エラー");
        return null;
    }

    var xml = http.responseXML;

    try {
        // 新着情報ルートノードの取得
        var root = xml.getElementsByTagName("songiddic")[0];

        // ルートノード確認
        if (!root) {
            // ルートノードが取得できない場合
            console.log("データの取得に失敗しました");
            return null;
        }
        else {
            // <song>タグの配列を取得
            var records = root.getElementsByTagName("song");

            // ループ用変数
            var index;
            var maxRecords = records.length;

            for (index = 0; index < maxRecords; index++) {
                // 曲名
                var songname = records[index].getElementsByTagName("songname")[0].firstChild.nodeValue;

                // 曲ID
                var songid = records[index].getElementsByTagName("songid")[0].firstChild.nodeValue;

                songdic[songname] = songid;
            }
        }
    }
    catch (e) {
        console.log("曲データ辞書作成失敗：" + e.description);
        return null;
    }

    console.log("曲データ辞書作成終了");

    return songdic;
}
