/*
@license

dhtmlxGantt v.6.1.7 Professional Evaluation
This software is covered by DHTMLX Evaluation License. Contact sales@dhtmlx.com to get Commercial or Enterprise license. Usage without proper license is prohibited.

(c) Dinamenta, UAB.

*/
Gantt.plugin(function(e){!function(e,n){if("object"==typeof exports&&"object"==typeof module)module.exports=n();else if("function"==typeof define&&define.amd)define([],n);else{var t=n();for(var o in t)("object"==typeof exports?exports:e)[o]=t[o]}}(window,function(){return function(e){var n={};function t(o){if(n[o])return n[o].exports;var l=n[o]={i:o,l:!1,exports:{}};return e[o].call(l.exports,l,l.exports,t),l.l=!0,l.exports}return t.m=e,t.c=n,t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:o})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(t.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var l in e)t.d(o,l,function(n){return e[n]}.bind(null,l));return o},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="/codebase/",t(t.s=233)}({233:function(n,t){!function(){var n=e.getState;function t(){var e=document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement||document.msFullscreenElement;return e&&e===document.body}e.getState=function(){var e=n.apply(this,arguments);return e.fullscreen=t(),e};var o=!1,l={width:null,height:null,modified:!1};function u(){e.$container&&(t()?(o=!0,function(){var n=e.$root;n.offsetWidth<window.innerWidth&&(l.width=n.style.width,l.height=n.style.height,n.style.width="100vw",n.style.height="100vh",l.modified=!0)}(),setTimeout(function(){e.callEvent("onExpand")})):o&&(o=!1,function(){var n=e.$root;l.modified&&(n.style.width=l.width,n.style.height=l.height,l.modified=!1)}(),setTimeout(function(){e.callEvent("onCollapse")})))}function r(){return!e.$container||!(document.fullscreenEnabled||document.webkitFullscreenEnabled||document.mozFullScreenEnabled||document.msFullscreenEnabled)&&((console.warning||console.log)("The `fullscreen` feature not being allowed, or full-screen mode not being supported"),!0)}e.event(document,"webkitfullscreenchange",u),e.event(document,"mozfullscreenchange",u),e.event(document,"MSFullscreenChange",u),e.event(document,"fullscreenChange",u),e.event(document,"fullscreenchange",u),e.expand=function(){if(!r()&&e.callEvent("onBeforeExpand",[])){var n=document.body;n.requestFullscreen?n.requestFullscreen():n.msRequestFullscreen?n.msRequestFullscreen():n.mozRequestFullScreen?n.mozRequestFullScreen():n.webkitRequestFullscreen&&n.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)}},e.collapse=function(){r()||t()&&e.callEvent("onBeforeCollapse",[])&&(document.exitFullscreen?document.exitFullscreen():document.msExitFullscreen?document.msExitFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitExitFullscreen&&document.webkitExitFullscreen())}}()}})})});