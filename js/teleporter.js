var teleporter = {debug: false, fadetime: 2000, ignore: ['no-transition','no-teleporter'], iframe: 'teleporter-iframe', loading: 'teleporter-loading'};
var ttopwin; ttopwin = teleporter_top_window();
if (typeof ttopwin.poppedstate == 'undefined') {
	if  (typeof ttopwin.History == 'function') {ttopwin.poppedstate = ttopwin.History.getState();}
	else {ttopwin.poppedstate = ('state' in ttopwin.history && ttopwin.history.state !== null);}
}
if (typeof ttopwin.initialurl == 'undefined') {ttopwin.initialurl = window.location.href;}
function teleporter_transition_page(link) {
	if ((typeof History != 'function') && !window.history) {return true;}
	if (typeof ttopwin.stateurls !== 'undefined') {
		if (teleporter.debug) {console.log(ttopwin.stateurls);}
		stateurls = ttopwin.stateurls;
		for (i in stateurls) {
			if (stateurls[i] == link.href) {
				if (i == ttopwin.currentstate) {return false;}
				if (teleporter.debug) {console.log('Switching to Existing State: '+i);}
				teleporter_switch_state(i);
				title = ttopwin.statetitles[i];
				var obj = {id: i, title: title, url: link.href};
				ttopwin.pushing = true;
				if (typeof ttopwin.History == 'function') {ttopwin.History.replaceState(obj, title, link.href);}
				else if (ttopwin.history) {ttopwin.history.replaceState(obj, title, link.href);}
				if (teleporter.debug) {
					if (typeof ttopwin.History == 'function') {console.log(ttopwin.History.getState());}
					else if (ttopwin.history) {console.log(ttopwin.history.state);}
				}
				ttopwin.pushing = false;
				ttopwin.currentstate = i;
				return false;
			}
		}
	}
	iframe = teleporter_add_iframe(link.href);
	if (teleporter.debug) {console.log('Loading New Iframe:'); console.log(iframe);}
	teleporter_show_loading();
	return false;
}
function teleporter_transition_check() {
	href = null; iframe = null; topdoc = ttopwin.document;
	if (ttopwin != window.self) {
		iframes = parent.document.getElementsByClassName(teleporter.iframe);
		if (teleporter.debug) {console.log(iframes);}
		for (i = 0; i < iframes.length; i++) {
			if (window.location.href == iframes[i].src) {iframe = iframes[i];}
		}
		if (!iframe) {
			if (teleporter.debug) {console.log('No matching parent iframe found for '+window.location.href+' !');}
			return;
		}
		if (iframe.src != ttopwin.location.href) {
			teleporter_hide_loading();
	    	body = topdoc.getElementsByTagName('body')[0];
	    	if (!ttopwin.bodymargin) {ttopwin.bodymargin = body.style.margin;}
	    	if (!ttopwin.bodypadding) {ttopwin.bodypadding = body.style.padding;}
	    	body.style.margin = '0'; body.style.padding = '0'; body.style.overflow = 'hidden';
			if ((typeof parent.jQuery == 'function') && teleporter.fadetime) {
				ttopwin.jQuery(iframe).fadeIn(teleporter.fadetime);
			} else {iframe.style.display = 'block';}
			href = iframe.src;
	    }
	} else {href = window.location.href;}
	if (href) {
		titletag = document.getElementsByTagName('title');
		if (titletag.length) {title = titletag[0].innerHTML;} else {title = '';}
		if (typeof ttopwin.statecount === 'undefined') {
			ttopwin.statecount = 0; ttopwin.windowstateid = 0; stateid = 0;
			if (teleporter.debug) {console.log('Loaded Window with New State '+stateid);}
			stateurls = []; stateurls[0] = href; ttopwin.stateurls = stateurls;
			statetitles = []; statetitles[0] = title; ttopwin.statetitles = statetitles;
		} else {
			ttopwin.statecount++; stateid = ttopwin.statecount;
			if (teleporter.debug) {console.log('Loaded Window with New State '+stateid);}
			if ((ttopwin != window.self) && (typeof window.windowstateid == 'undefined') ) {
				window.windowstateid = stateid;
				if (teleporter.debug) {console.log(ttopwin.stateurls);}
				ttopwin.stateurls[stateid] = href;
				ttopwin.statetitles[stateid] = title;
			}
		}
		if (teleporter.debug) {
			console.log('Setting Window PushState');
			console.log('ID: '+stateid+' - Title: '+title+' - URL: '+href);
			console.log(ttopwin.stateurls); console.log(ttopwin.statetitles);
		}
		var obj = {id: stateid, title: title, url: href};
		ttopwin.pushing = true;
		if (typeof ttopwin.History == 'function') {ttopwin.History.pushState(obj, title, href);}
		else if (ttopwin.history) {ttopwin.history.pushState(obj, title, href);}
		ttopwin.pushing = false;
		teleporter_custom_event('teleporter-state-pushed', obj);
		if (teleporter.debug) {
			if (typeof ttopwin.History == 'function') {console.log(ttopwin.History.getState());}
			else if (ttopwin.history) {console.log(ttopwin.history.state);}
		}
		ttopwin.currentstate = stateid;
		if (iframe) {iframe.setAttribute('id', teleporter.iframe+'-'+stateid);}
	}
}
function teleporter_show_loading() {
	if (!teleporter.loading) {return;}
	topdoc = ttopwin.document;
	topdoc.getElementsByTagName('body')[0].classList.add('teleporter-loading');
	topdoc.getElementById(teleporter.loading).className = 'reset';
	setTimeout(function() {topdoc.getElementById(teleporter.loading).className = 'loading';}, 250);
	iframes = topdoc.getElementsByClassName(teleporter.iframe);
	for (i = 0; i < iframes.length; i++) {
		doc = iframes[i].contentDocument || iframes[i].contentWindow.document;
		if (doc.getElementById(teleporter.loading)) {doc.getElementById(teleporter.loading).className = 'reset';}
	}
	setTimeout(function() {
		for (i = 0; i < iframes.length; i++) {
			doc = iframes[i].contentDocument || iframes[i].contentWindow.document;
			doc.getElementsByTagName('body')[0].classList.add('teleporter-loading');
			if (doc.getElementById(teleporter.loading)) {doc.getElementById(teleporter.loading).className = 'loading';}
		}
	}, 250);
}
function teleporter_hide_loading() {
	if (!teleporter.loading) {return;}
	topdoc = ttopwin.document;
	topdoc.getElementById(teleporter.loading).className = '';
	topdoc.getElementsByTagName('body')[0].classList.remove('teleporter-loading');
	iframes = topdoc.getElementsByClassName(teleporter.iframe);
	for (i = 0; i < iframes.length; i++) {
		doc = iframes[i].contentDocument || iframes[i].contentWindow.document;
		doc.getElementsByTagName('body')[0].classList.remove('teleporter-loading');
		doc.getElementById(teleporter.loading).className = '';
	}
}
function teleporter_add_popstate_checker() {
	if (teleporter.debug) {console.log('Adding Window Popstate Event');}
	if (typeof window.History == 'function') {
		(function(window,undefined) {
			History.Adapter.bind(window, 'statechange', function (event) {
				if (teleporter.debug) {console.log('State Change Event');}
				teleporter_custom_event('teleporter-popstate-event', {event: event});
				teleporter_popstate_checker(event);
			});
		})(window);
	} else {
		window.addEventListener('popstate', function(event) {
			if (teleporter.debug) {console.log('Window PopState Event');}
			teleporter_custom_event('teleporter-popstate-event', {event: event});
			teleporter_popstate_checker(event);
		}, false );
	}
}
function teleporter_popstate_checker(event) {
	ttopwin.initialpop = !ttopwin.poppedstate && (window.location.href == ttopwin.initialurl);
	ttopwin.poppedstate = true; if (ttopwin.initialpop) {return;}
	if (ttopwin.pushing) {return;}
	if (teleporter.debug) {
		if (window.document.referrer == (ttopwin.location.protocol+'//'+ttopwin.location.hostname)) {
			console.log('Referrer matches top window hostname.');
		}
	}
	if ((typeof ttopwin.backclicked != 'undefined') && ttopwin.backclicked) {
		ttopwin.backclicked = false; return;
	}
	stateid = null;
	if (event.state) {console.log('Event State'); console.log(event);}
	if  (typeof ttopwin.History != 'undefined') {
		state = ttopwin.History.getState();
		if (state.data.id) {stateid = state.data.id;}
		else {
			if (teleporter.debug) {console.log(state);}
			for (i = 0; i < ttopwin.stateurls.length; i++) {
				if (stateurls[i] == state.url) {stateid = i;}
			}
		}
	} else if (ttopwin.history) {
		if (event.state) {state = event.state; stateid = state.id;}
		else if (ttopwin.history.state) {state = ttopwin.history.state; stateid = state.id;}
		else {return true;}
	} else {return true;}
	if (teleporter.debug) {console.log('Popstate Event'); console.log(event); console.log(state);}
	if ((stateid === null) || (ttopwin.stateurls == 'undefined') || (state.url != ttopwin.stateurls[stateid])) {
			if (teleporter.debug) {
				console.log('State mismatch. No transition action.');
				console.log('ID: '+stateid+' - URL: '+state.url);
				console.log(ttopwin.stateurls);
			}
			if (state.url == ttopwin.initialurl) {
				ttopwin.backclicked = true;
				if (typeof ttopwin.History == 'function') {ttopwin.History.back();}
				else if (ttopwin.history) {history.back();}
			} else {
				teleporter_transition_page({href: state.url});
			}
			return;
	}
	if (teleporter.debug) {console.log('Switching to State '+stateid);}
	if (event.preventDefault) {event.preventDefault();}
	if (event.stopImmediatePropagation) {event.stopImmediatePropagation();}
	teleporter_switch_state(stateid);
}
function teleporter_switch_state(stateid) {
	if (typeof ttopwin.windowstateid == 'undefined') {return;}
	if (typeof ttopwin.currentstate != 'undefined') {currentstate = ttopwin.currentstate;}
	else {currentstate = 0; ttopwin.currentstate = 0;}
	if (stateid == currentstate) {return;}
	if (teleporter.debug) {console.log('Switching to State ID: '+stateid+' (Current State: '+currentstate+')');}
	teleporter_custom_event('teleporter-switch-state', {stateid: stateid});
	iframes = ttopwin.document.getElementsByClassName(teleporter.iframe);
	if (teleporter.debug) {console.log(iframes);}
	for (i = 0; i < iframes.length; i++) {
		if (iframes[i].id == teleporter.iframe+'-'+stateid) {iframe = iframes[i]; j = i;}
	}
	if (teleporter.debug) {console.log('Matched State '+stateid+' to Iframe '+j); console.log(iframe);}
	if (ttopwin.windowstateid == stateid) {
		if (teleporter.debug) {console.log('Restoring First Page State');}
		body = ttopwin.document.getElementsByTagName('body')[0];
		body.style.margin = ttopwin.bodymargin;
		body.style.padding = ttopwin.bodypadding;
		body.style.overflow = 'scroll';
		for (i = 0; i < iframes.length; i++) {
			if (teleporter.debug) {console.log('Hiding Iframes');}
			if (iframes[i].style.display != 'none') {
				if ((typeof jQuery == 'function') && teleporter.fadetime) {
					jQuery(iframes[i]).fadeOut(teleporter.fadetime);
				} else {iframes[i].style.display = 'none';}
			}
		}
		ttopwin.currentstate = 0;
	} else {
		doc = iframe.contentDocument || iframe.contentWindow.document;
		body = doc.getElementsByTagName('body')[0];
		body.style.margin = '0'; body.style.padding = '0'; body.style.overflow = 'hidden';
		if (teleporter.debug) {console.log('Removed Margins, Padding and Scroll on Window '+j);}
		for (i = 0; i < iframes.length; i++) {
			if (teleporter.debug) {console.log('Hiding Iframes');}
			if ((i != j) && (iframes[i].style.display != 'none')) {
				if ((typeof jQuery == 'function') && teleporter.fadetime) {
					jQuery(iframes[i]).fadeOut(teleporter.fadetime);
				} else {iframes[i].style.display = 'none';}
			}
		}
		if ((typeof jQuery == 'function') && teleporter.fadetime) {
			jQuery(iframe).fadeIn(teleporter.fadetime);
		} else {iframe.style.display = 'block';}
	}
	ttopwin.document.title = ttopwin.statetitles[stateid];
	ttopwin.currentstate = stateid;
	teleporter_custom_event('teleporter-transitioned', {stateid: stateid});
}
function teleporter_add_iframe(src) {
	iframe = document.createElement('iframe');
	iframe.setAttribute('class', teleporter.iframe);
	iframe.setAttribute('name', teleporter.iframe);
	iframe.setAttribute('src', src);
	iframe.setAttribute('width', '100%');
	iframe.setAttribute('height', '100%');
	iframe.setAttribute('frameborder', '0');
	iframe.setAttribute('scrolling', 'auto');
	iframe.setAttribute('allowfullscreen', 'true');
	iframe.setAttribute('style', 'display:none;');
	ttopwin.document.getElementsByTagName('body')[0].appendChild(iframe);
	return iframe;
}
addEventListener('unload', function(event) {
	ttopwin.windowstateid = 'undefined';
}, false);
function teleporter_top_window() {
	try {test = window.top.location; return window.top;} catch(e) {
		return teleporter_get_window_parent(window.self);
	}
}
function teleporter_get_window_parent(win) {
	parentwindow = false;
	try {test = win.parent.location; parentwindow = win.parent;} catch(e) {return false;}
	if (parentwindow) {
		if (parentwindow == win) {return win;}
		maybe = teleporter_get_window_parent(parentwindow);
		if (maybe) {return maybe;}
		return parentwindow;
	}
	return win;
}
if (typeof window.jQuery !== 'undefined') {
	jQuery(document).ready(function() {
		if (!teleporter.iframe) {return;}
		if (parent.document) {document.getElementsByTagName('body')[0].style.overflow = 'scroll';}
		teleporter_custom_event('teleporter-check-links', false);
		jQuery('a').each(function() {
			element = jQuery(this)[0];
			if ( !element.onclick && !jQuery(this).attr('onclick')
			  && !jQuery(this).attr('target') && (element.href.indexOf('#') < 0)
			  && (element.href.indexOf('javascript:') < 0) ) {
				skip = false;
				if (teleporter.ignore.length) {
					for (i in teleporter.ignore) {
						if (jQuery(this).hasClass(teleporter.ignore[i])) {skip = true;}
					}
				}
				if (!skip) {
					ev = jQuery._data(element, 'events');
					if (!ev || !ev.click) {
						if (teleporter.debug) {console.log('Adding onclick attribute to link.');}
						jQuery(this).attr('onclick', 'return teleporter_transition_page(this);');
					}
				}
			}
		});
		teleporter_custom_event('teleporter-links-checked', false);
		teleporter_transition_check();
		teleporter_add_popstate_checker();
	});
} else {
	(function(funcName, baseObj) {
		"use strict"; funcName = funcName || 'documentReady'; baseObj = baseObj || window;
		var readyList = []; var readyFired = false; var readyEventHandlersInstalled = false;
		function ready() {
			if (!readyFired) {
				readyFired = true;
				for (var i = 0; i < readyList.length; i++) {
					readyList[i].fn.call(window, readyList[i].ctx);
				}
				readyList = [];
			}
		}
		function readyStateChange() {if (document.readyState === "complete") {ready();} }
		baseObj[funcName] = function(callback, context) {
			if (readyFired) {setTimeout(function() {callback(context);}, 1); return;}
			else {readyList.push({fn: callback, ctx: context});}
			if (document.readyState === 'complete' || (!document.attachEvent && document.readyState === 'interactive')) {
				setTimeout(ready, 1);
			} else if (!readyEventHandlersInstalled) {
				if (document.addEventListener) {
					document.addEventListener('DOMContentLoaded', ready, false);
					window.addEventListener('load', ready, false);
				} else {
					document.attachEvent('onreadystatechange', readyStateChange);
					window.attachEvent('onload', ready);
				}
				readyEventHandlersInstalled = true;
			}
		}
	})('documentReady', window);
	window.documentReady(function() {
		if (!teleporter.iframe) {return;}
		if (parent.document) {document.getElementsByTagName('body')[0].style.overflow = 'scroll';}
		teleporter_custom_event('teleporter-check-links', false);
		alinks = document.getElementsByTagName('a');
		for (var i = 0; i < alinks.length; i++) {
			if ( !alinks[i].onclick && !alinks[i].getAttribute('onclick')
			  && !alinks[i].getAttribute('target') && (alinks[i].href.indexOf('#') < 0)
			  && (alinks[i].href.indexOf('javascript:') < 0) ) {
				skip = false;
				if (teleporter.ignore.length) {
					for (i in teleporter.ignore) {
						if (alinks[i].classList.contains(teleporter.ignore[i])) {skip = true;}
					}
				}
				if (!skip) {
					if (teleporter.debug) {console.log('Adding onclick attribute to link '+alinks[i]);}
					alinks[i].setAttribute('onclick', 'return teleporter_transition_page(this);');
				}
			}
		}
		teleporter_custom_event('teleporter-links-checked', false);
		teleporter_transition_check();
		teleporter_add_popstate_checker();
	});
}
function teleporter_custom_event(name, detail) {
	params = {bubbles: false, cancelable: false, detail: detail};
	var event = new CustomEvent(name, params); document.dispatchEvent(event);
	if (teleporter.debug) {console.log('Teleporter Custom Event: '+name); console.log(detail);}
}
(function () {
	if (typeof window.CustomEvent === 'function') {return false;}
	function CustomEvent(event, params) {
		params = params || {bubbles: false, cancelable: false, detail: undefined};
		var evt = document.createEvent('CustomEvent');
		evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
		return evt;
	}
	CustomEvent.prototype = window.Event.prototype;
	window.CustomEvent = CustomEvent;
})();