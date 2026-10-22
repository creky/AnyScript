importScripts('./js/storedb.js');

const networkRulesReady = chrome.declarativeNetRequest.updateDynamicRules({
	removeRuleIds: [1, 2, 3],
	addRules: [{
		id: 1,
		priority: 1,
		action: {
			type: "modifyHeaders",
			responseHeaders: [
				{ header: "x-frame-options", operation: "remove" },
				{ header: "content-security-policy", operation: "remove" }
			]
		},
		condition: {
			requestDomains: ["www.baidu.com", "www.google.com", "www.google.com.hk"],
			topDomains: [chrome.runtime.id],
			resourceTypes: ["sub_frame"]
		}
	}, {
		id: 2,
		priority: 1,
		action: {
			type: "modifyHeaders",
			requestHeaders: [{ header: "referer", operation: "set", value: "https://weibo.com" }]
		},
		condition: { requestDomains: ["weibocdn.com"] }
	}, {
		id: 3,
		priority: 1,
		action: {
			type: "modifyHeaders",
			requestHeaders: [{ header: "referer", operation: "set", value: "https://mp.weixin.qq.com" }]
		},
		condition: { requestDomains: ["qpic.cn"] }
	}]
}).then(function() {
	return { status: 1 };
}).catch(function(error) {
	console.error("Network rules initialization failed:", error);
	return { status: 0, error: error.message };
});

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
		} else if (req.type == "searchReady") {
			networkRulesReady.then(sendResponse);
			return true;
		} else {
			sendResponse({
				"status": 0
			});
		}
	}
);
