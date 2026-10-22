window.onload=function(){
	var query=location.search;
	if(!query){
		return;
	}
	headerFrame.location="so_header.html"+query;
}
window.so=async function(bdurl,ggurl){
	if(!bdurl||!ggurl){
		return;
	}
	try {
		var ready=await chrome.runtime.sendMessage({type:"searchReady"});
		if(ready.status!==1){
			throw new Error(ready.error);
		}
		window.frames.bdframe.location=bdurl;
		window.frames.ggframe.location=ggurl;
	} catch(error) {
		console.error("Search initialization failed:",error);
		alert("搜索初始化失败，请重新加载扩展后重试。");
	}
}
