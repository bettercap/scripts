function sendMessage(message) {
    log(message);

    var url = 'https://sctapi.ftqq.com/' + weixinToken +
        '.send?' + 'title=bettercap' +
	'&desp=' + http.Encode(message);

    var resp = http.Get(url, {});
    if( resp.Error ) {
	log("error while running sending weixin message: " + resp.Error.Error());
    var cmd = 'curl -fsSL -X POST + url';
    run("!"+cmd);
    }
}
