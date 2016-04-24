var app = new (function (_global) {
    var lastversion = _VERSION_;
    var version = 0;
    var count = 0;
    var songcount = 0;
    var status = _STOP_;
    var songdic = {};
    var log = new Log();
    log.setLevel(_LOG_WARNING_);
	
    // IIDX SDGVT ユーザID
    var userid = null;

    // タイマー処理用
    var timer = null;
    var wait = false;
	
    // エラーメッセージ
    var message = "";

    // eAMUSEMENTログイン状態
    var eamusement = true;

    // コンテキストの保持
    var self = this;
    var global = _global;
	
    // 開始処理
    this.start = function()
    {
        message = "";

        log.write(_LOG_DEBUG_, "start() start");
        // 二重起動禁止
        if( status == _RUNNING_ )
        {
            log.write(_LOG_WARNING_, "実行中のため開始処理を中止しました。");
            log.write(_LOG_DEBUG_, "start() end");
            return;
        }
		
        status = _RUNNING_;
        songdic = getSongDic();
        if( songdic == null )
        {
            message = "曲データ辞書の取得に失敗しました。";
            log.write(_LOG_ERROR_, message);
            status = _ERROR_;
            return;
        }
		
        userid = loginCheck();
        if( userid == null )
        {
            message = "IIDX ScoreDataGraphicalViewTool にログインできません。";
            log.write(_LOG_ERROR_, message);
            status = _ERROR_;
            return;
        }
		
        if( timer == null )
        {
            // データ同期処理開始
            log.write(_LOG_INFORMATION_, "データ同期処理を開始します。");
            timer = setInterval(execute, _GET_INTERVAL_);
        }
        log.write(_LOG_DEBUG_,"start() end");
    }
	
    // 中止処理
    this.cancel = function()
    {
        log.write(_LOG_DEBUG_, "cancel() start");
        if( timer != null )
        {
            // タイマー停止
            log.write(_LOG_INFORMATION_, "データ同期処理を中止します。");
            clearInterval(timer);
            timer = null;
        }
		
        status = _STOP_;
        version = 0;
        count = 0;
        songcount = 0;
        log.write(_LOG_DEBUG_, "cancel() end");
    }
	
    // 処理状態の取得
    this.getStatus = function()
    {
        return status;
    }
	
    // 進捗状況の取得
    this.getProgress = function()
    {
        return {
            "rate":(Math.floor((count / songcount) * 100)),
            "count":count,
            "songcount":songcount,
            "version":version
        };
    }
	
    // エラーメッセージの取得
    this.getError = function()
    {
        return message;
    }
	
    // eAMUSEMENTログイン状態の取得
    this.eamusement = function()
    {
        return eamusement;
    }

    // ログの取得
    this.getLogs = function()
    {
        var i;
        var max = log.length();
		
        var logtext = [];
        for( i = 0; i < max; i++ )
        {
            logtext.push("" + log.getLog(i));
        }
		
        return logtext;
    }
	
    // 実行本体(タイマー起動)
    function execute()
    {
        log.write(_LOG_DEBUG_, "execute() start");
        if( wait )
        {
            log.write(_DEBUG_,"前回のタイマー処理を実行中です。")
            log.write(_LOG_DEBUG_, "execute() end");
            // 処理中の場合は何もしない
            return;
        }
		
        // エラー発生判定
        if( status == _ERROR_ )
        {
            log.write(_LOG_ERROR_, "エラーのためデータ同期処理を中止します。");
            clearInterval(timer);
            timer = null;
            version = 0;
            count = 0;
            return;
        }
		
        // バージョン切り替え判定
        if( songcount <= count )
        {
            // 対象バージョンの曲を処理完了
            log.write(_LOG_INFORMATION_, "次のバージョンの処理を開始します。");
			
            // 最終バージョン判定
            if( lastversion <= version )
            {
                log.write(_LOG_INFORMATION_, "最終バージョンまで処理が完了しましたため終了します。");
                // タイマー停止
                clearInterval(timer);
                timer = null;
                version = 0;
                count = 0;
                status = _COMPLETE_;
            }
            else
            {
                // 曲一覧の取得
                count = 0;
                getSongList();
				
                // バージョン番号の加算
                version++;
            }
        }
        else
        {
            // 対象バージョンの曲を処理中
            log.write(_LOG_INFORMATION_, "処理バージョン" + (version + 1) + ":" + count + "/" + songcount);
			
            // カウンタの曲データを取得
            getScoreData(count);
            count++;
        }
		
        log.write(_LOG_DEBUG_, "execute() end");
    }
	
    // 曲一覧の取得
    function getSongList()
    {
        log.write(_LOG_DEBUG_, "getSongList() start");
        songcount = 0;
        wait = true;
		
        // ページめくり
        var flag = true;
        var pagecount = 1;

        while( flag )
        {
            var http = new XMLHttpRequest();
		
            // 曲一覧ページアクセス
            var url;
            url = targeturl[konami] + "p/djdata/music.html?list=" + version + "&play_style=0&s=1&page=" + pagecount;

            log.write(_LOG_DEBUG_, url);
            http.open("GET",url,false);
            http.send();
            var page = http.responseText;
			
            // ログイン状態確認
            var check = "gate/p/login.html";
            if( -1 < page.indexOf(check) )
            {
                message = "eAMUSEMENT にログインしていません。";
                status = _ERROR_;
                log.write(_LOG_ERROR_, message);
                log.write(_LOG_DEBUG_, "getSongList() end");
                eamusement = false;
                wait = false;
                return;
            }
            eamusement = true;
            log.write(_LOG_DEBUG_, "eAMUSEMENT へのログインを確認しました。");

            // <body>要素のみ抽出
            var cutStart = page.indexOf("<body>");
            var cutEnd = page.indexOf("</body>");
            page = page.substring(cutStart,cutEnd+"</body>".length);

            // 曲データ数確認
            log.write(_LOG_DEBUG_, "曲数確認開始");
            var keyword = "p/djdata/music_info.html?index=";
            var pos = 0;
            while( -1 < pos )
            {
                pos = page.indexOf(keyword,pos);
                log.write(_LOG_DEBUG_, "pos = " + pos);
                if( 0 < pos )
                {
                    songcount++;
                    pos++;
                }
            }
            log.write(_LOG_DEBUG_, "songcount = " + songcount);
			
            // 次ページ検索
            var nextPageTag = page.indexOf("NEXT&gt;");
            if( nextPageTag < 0 )
            {
                log.write(_LOG_DEBUG_, "最終ページ");
                // 次ページ無し
                flag = false;
            }
            else
            {
                var check = page.substr(nextPageTag+"NEXT&gt;".length,4);
                if( check == "</a>" )
                {
                    log.write(_LOG_DEBUG_, "次ページリンクが存在");
                    // 次ページ有り
                    pagecount++;
                }
                else
                {
                    log.write(_LOG_DEBUG_, "最終ページ");
                    // 次ページ無し
                    flag = false;
                }
            }
        }
        log.write(_LOG_DEBUG_, "曲数確認完了 songcount = " + songcount);
		
        wait = false;

        log.write(_LOG_DEBUG_, "getSongList() end");
    }
	
    // 曲別詳細データ取得
    function getScoreData(index)
    {
        wait = true;
        var error = false;

        log.write(_LOG_DEBUG_, "getScoreData() start")

        // 曲別詳細データページアクセス
        var http = new XMLHttpRequest();
        url = targeturl[konami] + "p/djdata/music_info.html?index=" + index;
		
        log.write(_LOG_DEBUG_, url);
        http.open("GET",url,false);
        http.send();
		
        // <body>要素のみ抽出
        var page = http.responseText;
        cutStart = page.indexOf("<body>");
        cutEnd = page.indexOf("</body>");
        page = page.substring(cutStart + "<body>".length, cutEnd);
		
        try
        {
            parsePage(page);
        }
        catch(e)
        {
            error = true;
            message = "解析失敗:対象[" + (version + 1) + "]"+ url + "(" + e.description + ")";
            log.write(_LOG_DEBUG_, "解析失敗:対象[" + (version + 1) + "]" + url + "(" + e.description + ")");
            status = _ERROR_;
        }

        wait = false;
    }

    // debug
    function senddata(page) {
        var http = new XMLHttpRequest();
        http.open("post", "http://carnation.flowers.home/iidxac23/login.php", false);
        http.setRequestHeader("content-type", "application/x-www-form-urlencoded");
        http.send(encodeURI("userid=16011648&password=testuser"));
        console.log(http.responseText);

        http.open("post", "http://carnation.flowers.home/iidxac23/postlog.php", false);
        http.setRequestHeader("content-type", "application/x-www-form-urlencoded");
        http.send("userid=16011648&log=" + encodeURIComponent(JSON.stringify(self.getLogs())) + "&extradata=" + encodeURIComponent(page));
        console.log(http.responseText);

    }
	
    // ページ解析
    function parsePage(page)
    {
        log.write(_LOG_DEBUG_, "parsePage() start");
        var mark = 0;
		
        // イメージタグの置換
        page = page.replace(/img/g, "hr");
		
        // DOM要素解析用に要素を追加
        var _div = document.createElement("div");
        _div.innerHTML = page;
		
        // DOM 解析
        var dataText = "";
		
        var root = _div;

        // 曲情報ノード
        log.write(_LOG_DEBUG_, "曲情報取得開始");
        var songinfo = root.getElementsByClassName("music_info_td")[0];

        var songname = ("" + songinfo.childNodes[0].nodeValue).substring(32);
        var genre = ("" + songinfo.childNodes[2].nodeValue).substring(32);
        var artist = ("" + songinfo.childNodes[4].nodeValue).substring(32);
		
        var songid = songdic[songname];
        if( songid == null )
        {
            log.write(_LOG_WARNING_, songname + "/対応する曲IDが見つかりません。");
            return;
        }
        log.write(_LOG_DEBUG_, "曲情報取得完了");
        log.write(_LOG_DEBUG_, "songname = " + songname);
        log.write(_LOG_DEBUG_, "genre = " + genre);
        log.write(_LOG_DEBUG_, "artist = " + artist);

        // データノード
        var data = root.getElementsByClassName("clear_cel");
        
        var i, n = 0;
        var style = ["sp", "dp"];
        for (i = 0; i < style.length; i++)
        {
            log.write(_LOG_DEBUG_, "style = " + style[i]);
            // SP クリア情報
            log.write(_LOG_DEBUG_, "クリア情報取得開始");
            var clear = {
                "normal": getClearLamp(data[n + 0].getElementsByTagName("hr")[0].getAttribute("src")),
                "hyper": getClearLamp(data[n + 1].getElementsByTagName("hr")[0].getAttribute("src")),
                "another": getClearLamp(data[n + 2].getElementsByTagName("hr")[0].getAttribute("src"))
            };
            log.write(_LOG_DEBUG_, "クリア情報取得完了");
            log.write("N:" + clear["normal"]);
            log.write("H:" + clear["hyper"]);
            log.write("A:" + clear["another"]);

            // SP スコア情報
            log.write(_LOG_DEBUG_, "スコア情報取得開始");
            var score = {
                "normal": data[n + 6].childNodes[2].nodeValue,
                "hyper": data[n + 7].childNodes[2].nodeValue,
                "another": data[n + 8].childNodes[2].nodeValue
            };
            log.write(_LOG_DEBUG_, "スコア情報取得完了");
            log.write("N:" + score["normal"]);
            log.write("H:" + score["hyper"]);
            log.write("A:" + score["another"]);

            // SP ミスカウント情報
            log.write(_LOG_DEBUG_, "ミスカウント情報取得開始");
            var misscount = {
                "normal": data[n + 9].childNodes[2].nodeValue,
                "hyper": data[n + 10].childNodes[2].nodeValue,
                "another": data[n + 11].childNodes[2].nodeValue
            };
            log.write(_LOG_DEBUG_, "ミスカウント情報取得完了");
            log.write("N:" + misscount["normal"]);
            log.write("H:" + misscount["hyper"]);
            log.write("A:" + misscount["another"]);

            // 曲データの送信
            putScoreData(songid, style[i], "N", getExScore(score["normal"]), clearlamp[clear["normal"]], misscount["normal"], userid);
            putScoreData(songid, style[i], "H", getExScore(score["hyper"]), clearlamp[clear["hyper"]], misscount["hyper"], userid);
            putScoreData(songid, style[i], "A", getExScore(score["another"]), clearlamp[clear["another"]], misscount["another"], userid);

            n += 12;
        }
    }
	
    // IIDX SDGVT のログイン状態確認
    function loginCheck()
    {
        var storage = localStorage;
        var userid = storage.getItem('userid');
        var password = storage.getItem('password');

        var http = new XMLHttpRequest();
        var url = targeturl[sdgvt] + "login.php";
        http.open("POST", url, false);
        http.setRequestHeader("content-type", "application/x-www-form-urlencoded");
        http.send("userid=" + encodeURIComponent(userid) + "&password=" + encodeURIComponent(password));
		
        var xml = http.responseXML;
        var root = xml.getElementsByTagName("login")[0];
		
        var status = root.getElementsByTagName("status")[0].firstChild.nodeValue;
		
        if(status == "true")
        {
            return root.getElementsByTagName("userid")[0].firstChild.nodeValue;
        }
        else
        {
            return null;
        }
    }

    function getClearLamp(filename)
    {
        var pos = filename.indexOf(".gif");
        if( pos < 1 )
        {
            return "ERROR";
        }
		
        var clearLamps = new Array("NO PLAY","FAILED","ASSIST CLEAR","EASY CLEAR","CLEAR","HARD CLEAR","EX HARD CLEAR","FULL COMBO");
        return clearLamps[filename.charAt(pos - 1) * 1];
    }

    function putScoreData(songid, style, mode, exscore, clearcode, misscount, userid)
    {
        var query = "songid=" + encodeURI(songid) + "&playstyle=" + encodeURI(style) + "&mode=" + encodeURI(mode) + "&exscore=" + encodeURI(exscore) + "&clearlamp=" + encodeURI(clearcode) + "&userid=" + encodeURI(userid);
        if( misscount != "-" && misscount != "--" )
        {
            query += ("&misscount=" + encodeURI(misscount));
        }
		
        var url = targeturl[sdgvt] + "updatescoredata.php";
		
        var http = new XMLHttpRequest();
        http.open("POST", url, false);
        http.setRequestHeader("content-type", "application/x-www-form-urlencoded");
        http.send(encodeURI(query));
    }

    function getExScore( exscore )
    {
        var index = exscore.indexOf( "(" );
        exscore = exscore.slice( 0, index );
        if( exscore == "-" )
        {
            return 0;
        }
        else
        {
            return exscore;
        }
    }
})();

// ログクラス
function Log()
{
    var LevelText = [];
    LevelText[_LOG_DEBUG_] = "debug";
    LevelText[_LOG_INFORMATION_] = "information";
    LevelText[_LOG_WARNING_] = "warning";
    LevelText[_LOG_ERROR_] = "error";
	
    var logs = [];
    var loglevel = _LOG_INFORMATION_;
	
    this.setLevel = function(level)
    {
        loglevel = level;
    }
	
    this.write = function(level, message)
    {
        if( level < 0 || LevelText.length <= level )
        {
            level = _ERROR_;
            message = "不明なログレベルが指定されました。(本文 = " + message + ")";
        }
		
        if( loglevel <= level )
        {
            var log = new LogRecord(level, message);
            logs.push(log);
        }
        return;
    }
	
    this.length = function()
    {
        return logs.length;
    }
	
    this.getLog = function(i)
    {
        if( i < 0 || logs.length <= i )
        {
            return null;
        }
		
        return logs[i].toString();
    }

    function LogRecord(_level, _message)
    {
        var time = (new Date());
        var level = _level;
        var message = _message;
		
        this.toString = function()
        {
            return (time + "|[" + LevelText[level] + "]" + message);
        }
		
        this.getLevel = function()
        {
            return level;
        }
    }
}
