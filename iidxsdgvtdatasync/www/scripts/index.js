// 空白のテンプレートの概要については、次のドキュメントを参照してください:
// http://go.microsoft.com/fwlink/?LinkID=397704
// ページ上のコードをデバッグするには、Ripple で読み込むか、Android デバイス/エミュレーターで読み込みます。アプリを起動し、ブレークポイントを設定します。
// 次に、JavaScript コンソールで "window.location.reload()" を実行します。
(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Cordova の一時停止を処理し、イベントを再開します
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener('resume', onResume.bind(this), false);

        // TODO: Cordova が読み込まれました。ここで、Cordova を必要とする初期化を実行します。
        initialize();
    };

    function onPause() {
        // TODO: このアプリケーションは中断されました。ここで、アプリケーションの状態を保存します。
    };

    function onResume() {
        // TODO: このアプリケーションが再アクティブ化されました。ここで、アプリケーションの状態を復元します。
    };

    function initialize()
    {
        var storage = localStorage;
        var userid = storage.getItem("userid");
        var password = storage.getItem("password");
        if (!userid || !password) {
            _("loginregist").style.display = 'block';
            _("control.newuser").disabled = false;
            _("control.saveid").disabled = false;
            _("control.removeid").disabled = true;
            _("control.run").disabled = true;
            _("control.viewscore").disabled = true;
        }
        else
        {
            _("loginregist").style.display = 'none';
            _("control.newuser").disabled = true;
            _("control.newuser").style.display = 'none';
            _("control.saveid").disabled = true;
            _("control.removeid").disabled = false;
            _("control.run").disabled = false;
            _("control.viewscore").disabled = false;
        }
        _("control.cancel").disabled = true;

        _("control.newuser").addEventListener('click', function () {
            window.open(targeturl[sdgvt] + "newuser.html");
        }, false);

        _("control.saveid").addEventListener('click', function () {
            try {
                var userid = _("userid").value;
                var password = _("password").value;

                var http = new XMLHttpRequest();
                http.open("POST", targeturl[sdgvt] + "login.php", false);
                http.setRequestHeader("content-type", "application/x-www-form-urlencoded");
                http.send("userid=" + encodeURIComponent(userid) + "&password=" + encodeURIComponent(password));
                var xml = http.responseXML;
                var root = xml.getElementsByTagName("login")[0];

                var status = eval(root.getElementsByTagName("status")[0].firstChild.nodeValue + "");

                if (status) {
                    userid = root.getElementsByTagName("userid")[0].firstChild.nodeValue;
                }
                else {
                    userid = null;
                    showMessage("ログインに失敗しました", _LOG_ERROR_);
                }

                if (userid && password) {
                    http.open("GET", targeturl[sdgvt] + "logout.php", false);
                    http.send();
                    storage.setItem('userid', userid);
                    storage.setItem('password', password);

                    _("loginregist").style.display = 'none';
                    _("control.newuser").disabled = true;
                    _("control.newuser").style.display = 'none';
                    _("control.saveid").disabled = true;
                    _("control.removeid").disabled = false;
                    _("control.run").disabled = false;
                    _("control.viewscore").disabled = false;
                    _("userid").value = "";
                    _("password").value = "";

                    showMessage("ログイン情報を保存しました");
                }
            }
            catch (e) {
                showMessage("システムエラーが発生しました(" + e.description + ")");
            }
        }, false);

        _("control.removeid").addEventListener('click', function () {
            storage.removeItem('userid');
            storage.removeItem('userid');
            _("loginregist").style.display = 'block';
            _("control.newuser").disabled = false;
            _("control.newuser").style.display = '';
            _("control.saveid").disabled = false;
            _("control.removeid").disabled = true;
            _("control.run").disabled = true;
            _("control.viewscore").disabled = true;
        }, false);

        _("control.run").addEventListener('click', function () {
            app.start();
            var value = this.value;
            this.disabled = true;
            this.value = "処理中..."
            var object = this;
            _("control.cancel").disabled = false;
            showMessage("同期しています");

            // 進捗プログレスバー
            var progresstable = document.createElement("table");
            progresstable.style.width = "90%";
            var _tbody = document.createElement("tbody");
            progresstable.appendChild(_tbody);

            // バージョン進捗
            var _tr = document.createElement("tr");
            _tbody.appendChild(_tr);
            var _td = document.createElement("td");
            _td.style.width = "25%";
            _tr.appendChild(_td);
            var _div = document.createElement("div");
            _div.id = "vrate";
            _div.innerHTML = "";
            _td.appendChild(_div);

            var _td = document.createElement("td");
            _td.style.width = "75%";
            _tr.appendChild(_td);
            var versionbarbase = document.createElement("div");
            versionbarbase.style.height = "20px";
            versionbarbase.style.witdh = "100%";
            versionbarbase.style.borderStyle = "solid";
            versionbarbase.style.borderWidth = "1px";
            versionbarbase.style.backgroundColor = "#999999";
            _td.appendChild(versionbarbase);

            var versionbar = document.createElement("div");
            versionbar.style.height = "20px";
            versionbar.style.witdh = "0%";
            versionbar.style.backgroundColor = "#3399CC";
            versionbarbase.appendChild(versionbar);


            // 曲進捗
            var _tr = document.createElement("tr");
            _tbody.appendChild(_tr);
            var _td = document.createElement("td");
            _tr.appendChild(_td);
            var _div = document.createElement("div");
            _div.id = "srate";
            _div.innerHTML = "";
            _td.appendChild(_div);

            var _td = document.createElement("td");
            _tr.appendChild(_td);
            var songbarbase = document.createElement("div");
            songbarbase.style.height = "20px";
            songbarbase.style.witdh = "100%";
            songbarbase.style.borderStyle = "solid";
            songbarbase.style.borderWidth = "1px";
            songbarbase.style.backgroundColor = "#999999";
            _td.appendChild(songbarbase);

            var songbar = document.createElement("div");
            songbar.style.height = "20px";
            songbar.style.witdh = "0%";
            songbar.style.backgroundColor = "#3399FF";
            songbarbase.appendChild(songbar);

            _("progressview").appendChild(progresstable);

            var vmax = _VERSION_;
            var timer = setInterval(function () {
                if (app.getStatus() != _RUNNING_) {
                    clearInterval(timer);
                    object.value = value;
                    object.disabled = false;
                    _("control.cancel").disabled = true;

                    if (app.getStatus() == _ERROR_) {
                        if (!app.eamusement()) {
                            showMessage("同期処理を中止しました")
                            eamusement();
                        }
                        else {
                            showMessage(app.getError(), _LOG_ERROR_);
                        }
                    }
                    else if (app.getStatus() == _COMPLETE_) {
                        showMessage("同期が完了しました");
                    }

                    _("progressview").removeChild(progresstable);
                }
                else {
                    var progress = app.getProgress();
                    var srate = progress.rate;
                    _("srate").innerHTML = progress.count + "/" + progress.songcount;
                    _("vrate").innerHTML = progress.version + "/" + vmax;
                    versionbar.style.width = Math.floor((progress.version / vmax) * 100) + "%";
                    songbar.style.width = progress.rate + "%";
                }
            }, 100);
        });

        _("control.cancel").addEventListener('click', function () {
            app.cancel();
            showMessage("同期処理を中止しました");
        }, false);

        _("control.viewscore").addEventListener('click', function () {
            (function () {
                var storage = localStorage;
                window.open(targeturl[sdgvt] + "score.mobile.html?userid=" + storage.getItem("userid"));
            })();
        }, false);

        if (AdMob)
        {
            AdMob.createBanner({
                adId: _ADMOB_DEFAULT_,
                position: AdMob.AD_POSITION.BOTTOM_CENTER,
                isTesting: false, // TODO: remove this line when release
                overlap: false,
                offsetTopBar: false,
                bgColor: 'black'
            });
        }

        _("content.main").style.display = 'block';
    }

    function _(id) {
        return document.getElementById(id);
    }

    function showMessage(message, type) {
        if (type == _LOG_ERROR_)
        {
            _("message").style.color = "#FF3300";
            _("message").style.backgroundColor = "#FFFF00";
        }
        else
        {
            _("message").style.color = "#0033CC";
            _("message").style.backgroundColor = "#FFFFFF";
        }
        _("message").innerHTML = message;
    }

    function eamusement()
    {
        var layer = document.createElement("div");
        layer.style.position = "fixed";
        layer.style.left = "0px";
        layer.style.top = "0px";
        layer.style.width = "100%";
        layer.style.height = "100%";
        layer.style.backgroundColor = "rgba(64,64,64,0.8)";
        document.body.appendChild(layer);

        var url = "https://p.eagate.573.jp/gate/p/login.html";
        var _iframe = document.createElement("iframe");
        _iframe.width = "90%";
        _iframe.height = "80%";
        _iframe.name = "web";
        _iframe.src = url;
        _iframe.style.position = "absolute";
        _iframe.style.left = "5%";
        _iframe.style.top = "5%";
        layer.appendChild(_iframe);

        var _div = document.createElement("div");
        _div.innerHTML = "eAMUSEMENTにログインしてください";
        _div.style.color = '#FFFFFF';
        _div.width = "90%";
        _div.style.display = "block";
        _div.style.position = "absolute";
        _div.style.left = "5%";
        _div.style.top = "87%";
        _div.style.textAlign = "center";
        layer.appendChild(_div);

        var _input = document.createElement("input");
        _input.type = "button";
        _input.value = "データ同期ツールに戻る";
        _input.onclick = function () {
            layer.removeChild(_iframe);
            document.body.removeChild(layer);
        };
        _input.style.position = "absolute";
        _input.style.top = "90%";
        _input.style.left = "0px";
        _input.style.width = "100%";
        _input.style.textAlign = "center";
        _input.style.padding = "10px";
        layer.appendChild(_input);
    }
} )();