/*
@license

dhtmlxGantt v.6.1.7 Professional Evaluation
This software is covered by DHTMLX Evaluation License. Contact sales@dhtmlx.com to get Commercial or Enterprise license. Usage without proper license is prohibited.

(c) Dinamenta, UAB.

*/
Gantt.plugin(function(e){!function(e,t){if("object"==typeof exports&&"object"==typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n=t();for(var o in n)("object"==typeof exports?exports:e)[o]=n[o]}}(window,function(){return function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="/codebase/",n(n.s=193)}({193:function(t,n){e.locale={date:{month_full:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],month_short:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],day_full:["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"],day_short:["日","月","火","水","木","金","土"]},labels:{new_task:"新しい仕事",dhx_cal_today_button:"今日",day_tab:"日",week_tab:"週",month_tab:"月",new_event:"新イベント",icon_save:"保存",icon_cancel:"キャンセル",icon_details:"詳細",icon_edit:"編集",icon_delete:"削除",confirm_closing:"",confirm_deleting:"イベント完全に削除されます、宜しいですか？",section_description:"デスクリプション",section_time:"期間",section_type:"Type",column_wbs:"WBS",column_text:"Task name",column_start_date:"Start time",column_duration:"Duration",column_add:"",link:"Link",confirm_link_deleting:"will be deleted",link_start:" (start)",link_end:" (end)",type_task:"Task",type_project:"Project",type_milestone:"Milestone",minutes:"Minutes",hours:"Hours",days:"Days",weeks:"Week",months:"Months",years:"Years",message_ok:"OK",message_cancel:"キャンセル",section_constraint:"Constraint",constraint_type:"Constraint type",constraint_date:"Constraint date",asap:"As Soon As Possible",alap:"As Late As Possible",snet:"Start No Earlier Than",snlt:"Start No Later Than",fnet:"Finish No Earlier Than",fnlt:"Finish No Later Than",mso:"Must Start On",mfo:"Must Finish On",resources_filter_placeholder:"type to filter",resources_filter_label:"hide empty"}}}})})});