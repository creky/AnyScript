(function(){
	document.getElementById("so").addEventListener("click",function(){
		search(document.getElementById('q').value);
	},false);
	document.getElementById("q").addEventListener("keydown",function(event){
		if(event.keyCode==13){
			search(document.getElementById('q').value);
		}
	},false);
	var qu=new URLSearchParams(location.search).get("q");
	if(qu){
		document.getElementById("q").value=qu;
		search(qu);
	}
})();
function search(qu){
	if(!qu){
		return;
	}
	qu=encodeURIComponent(qu);
	var bdurl="https://www.baidu.com/s?ie=UTF-8&wd="+qu;
	var ggurl="https://www.google.com/search?newwindow=1&q="+qu;
	parent.so(bdurl,ggurl);
}
