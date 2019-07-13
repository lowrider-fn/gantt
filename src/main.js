import Vue from 'vue';
import App from './App.vue';

import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import './assets/styles/styles.scss';

import 'dhtmlx-gantt/codebase/locale/locale_ru.js';
import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_marker.js';
import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_undo.js';

Vue.config.productionTip = false;
new Vue({
    render: h => h(App),
}).$mount('#app');

