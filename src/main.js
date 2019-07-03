import Vue from 'vue';
import App from './App.vue';
import 'dhtmlx-gantt/codebase/locale/locale_ru.js';
import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_marker.js';
Vue.config.productionTip = false;

new Vue({
    render: h => h(App),
}).$mount('#app');
