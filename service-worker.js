importScripts('./js/storedb.js');

function queryRule(req, sendResponse) {
	var ruleDB = storedb("rulesTable");
	var rules = new Array();
	ruleDB.find({
		"domain": req.hostName
	}, function(err, res) {
		if (!err && res && res.length > 0) {
			for (var i = 0; i < res.length; i++) {
				if (parseInt(res[i].forbid)) {
					continue;
				}
				var reg = new RegExp(res[i].url, "gi");
				if (reg.test(req.url)) {
					rules.push(res[i]);
				}
			}
		}
		sendResponse({
			"status": 1,
			"rules": rules
		});
	});
}

chrome.runtime.onMessage.addListener(
	function(req, sender, sendResponse) {
		//console.log(sender.tab);
		if (req.type == "queryRule") {
			queryRule(req, sendResponse);
		} else {
			sendResponse({
				"status": 0
			});
		}
	}
);

chrome.webRequest.onHeadersReceived.addListener(function(rsp) {
	//console.log("RSP",rsp);
	if(rsp.url.indexOf("baidu.c")>=0 || rsp.url.indexOf("google.")>=0){
		for (var i = 0; i < rsp.responseHeaders.length; i++) {
			if (rsp.responseHeaders[i].name === 'x-frame-options' || rsp.responseHeaders[i].name ==='Content-Security-Policy') {
				console.log("Remove header：",rsp.responseHeaders[i].name,rsp.responseHeaders[i].value);
				rsp.responseHeaders.splice(i, 1);
				break;
			}
			if (rsp.responseHeaders[i].name === 'Access-Control-Allow-Origin'){
				rsp.responseHeaders[i].value="*";
			}
		}
	}

	return {
		responseHeaders: rsp.responseHeaders
	};
}, {
	urls: ["<all_urls>"],
	types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
},
["responseHeaders","blocking","extraHeaders"]);

let cfgs={
	"weibocdn":"https://weibo.com",
	"qpic.cn":"https://mp.weixin.qq.com"
};

chrome.webRequest.onBeforeSendHeaders.addListener(
	function(details) {
		for(let k in cfgs){
			if (details.url.indexOf(k)>=0){
				let referExists=false;
				for (let i = 0; i < details.requestHeaders.length; ++i) {
					if (details.requestHeaders[i].name === 'Referer') {
						referExists=true;
						break;
					}
				}
				if(!referExists){
					console.log("Add referer:",cfgs[k]);
					details.requestHeaders.push({
						name: 'Referer',
						value: cfgs[k]
					});
				}
			}
		}

	  return { requestHeaders: details.requestHeaders };
	},
	{ urls: ["<all_urls>"] },
	["blocking", "requestHeaders","extraHeaders"]
  );
