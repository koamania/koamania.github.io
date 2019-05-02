// By: h01000110 (hi)
// github.com/h01000110

var max = document.getElementsByClassName("btn")[1];
var min = document.getElementsByClassName("btn")[2];
var pageTitle = document.getElementsByClassName("post_title")[0];
var isMaxized = false;

function maximize (event) {
	if (event) {
		event.stopPropagation();
	}
	var post = document.getElementsByClassName("content")[0];
	var cont = document.getElementsByClassName("post_content")[0];
	var wid = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName("body")[0].clientWidth;

	if (wid > 900) {
		widf = wid * 0.9;
		post.style.width = widf + "px";

		if (wid < 1400) {
			cont.style.width = "99%";
		} else {
			cont.style.width = "99.4%";
		}

		isMaxized = true;
	}
}

function minimize (event) {
	if (event) {
		event.stopPropagation();
	}
	var post = document.getElementsByClassName("content")[0];
	var cont = document.getElementsByClassName("post_content")[0];
	var wid = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName("body")[0].clientWidth;

	if ( wid > 900 ) {
		post.style.width = "800px";
		cont.style.width = "98.5%";

		isMaxized = false;
	}
}

max.addEventListener('click', maximize, false);
min.addEventListener('click', minimize, false);
pageTitle.addEventListener('dblclick', function(e) {
	if (isMaxized) {
		minimize(e);
	} else {
		maximize(e);
	}
}, false);
