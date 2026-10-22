//http://developer.chrome.com/extensions/getstarted.html

String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g, "");
};

(function() {
	var req = {};
	req.type = 'queryRule';
	req.hostName = location.hostname;
	req.url = location.href;
	var checkCount=0;
	chrome.runtime.sendMessage(req, function(resp) {
		console.log("Receive response:", resp);
		if (resp.status == 1) {
			executeRules(resp.rules);
		}
	});

	function executeRules(rules) {
		if (!rules || rules.length==0) {
			return;
		}

		var loadjq=false;
		for(var idx in rules){
			if(typeof rules[idx].loadjq != "undefined" && rules[idx].loadjq==1){
				loadjq=true;
				break;
			}
		}
		if(loadjq){
			var script=document.createElement("script");
			script.src="https://lib.sinaapp.com/js/jquery/1.8.3/jquery.min.js"
			document.body.appendChild(script);
			console.log("Loading jQuery 1.8.3 ...");
			checkRunWithJQ(rules);
		}else{
			runRule(rules);
		}
	}

	function runRule(rules){
		for (var i = 0; i < rules.length; i++) {
			if (!rules[i].type) {
				console.log("run code:", rules[i].code);
				eval(rules[i].code);
			} else {
				//Run with page script context
				var script = document.createElement("script");
				script.setAttribute("type","text/javascript");
				script.innerHTML = rules[i].code;
				document.body.appendChild(script);
			}
		}
		console.log("Run rules end !");
	}

	function checkRunWithJQ(rules){
		if(checkCount++>60){
			return;
		}
		if(typeof jQuery=="function"){
			console.log("jQuery 1.8.3 loaded !");
			runRule(rules);
			return;
		}else{
			setTimeout(function(){
				checkRunWithJQ(rules);
			},1000);
		}
	}
})();
