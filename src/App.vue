<template>
    <div>
        <div v-if="!isInit">{{ 'preloader' }}</div>
        <div class="container">
            <div v-if="errorText">{{ errorText }}</div>
            <div v-if="tasks.data">
                <button v-for="(grid,i) in statesScale"
                        :key="i" 
                        :id="grid"
                        @click="setScaleConfig(grid)"
                        type="button"
                >
                    {{ grid }}
                </button>
            </div>
            <div ref="gantt" class="left-container"></div>
        </div>
    </div>
</template>

<script>
import axios     from 'axios';
import Gantt     from './components/gantt.vue';
import { gantt } from 'dhtmlx-gantt';
export default {
    name      : 'app',
    components: { Gantt },
    data      : () => ({
        errorText  : '',
        tasks      : {data : null},
        isReadonly : false,
        statesScale: ['day','week','month'],
        // stateScale  : '',
    }),
    computed: {
        isInit() {
            return this.tasks.data;
        }
    },
    mounted() {
        this.createRequest({url : '/get/data.json'})
            .then(tasks => this.initGantt(tasks))
            .catch(error => this.errorText = error.text || 'Неизвестная ошибка');
    },
    methods: {
        initGantt(tasks) {
            this.tasks.data = tasks;
            this.setColumnsComfig();
            this.setColumnsComfig();
            this.setTasksComfig();
            this.setRowsConfig();
            this.setMarkerToday();
            this.setWorkDays();
            this.setScaleDay();
              
            gantt.config.readonly = this.isReadonly;
            gantt.init(this.$refs.gantt);
            gantt.parse(this.tasks);
        },
        setScaleConfig(state) {
            // this.stateScale = state;
            switch (state) {
            case 'day':
                this.setScaleDay();
                break;
            case 'week':
                gantt.config.scale_unit    = 'month';
                gantt.config.date_scale    = '%F, %Y';
                gantt.templates.date_scale = null;
 
                gantt.config.scale_height = 60;
 
                gantt.config.subscales = [
                    {unit : 'week', step : 1, date : '%W'}
                ];
 
                break;
            case 'month':
                gantt.config.scale_unit    = 'year';
                gantt.config.date_scale    = '%Y';
                gantt.templates.date_scale = null;
                gantt.config.scale_height  = 60;
 
                gantt.config.subscales = [
                    {unit : 'month', step : 1, date : '%M'}
                ];
 
                break;
            }
            gantt.render();
        },
        setWorkDays() {
            gantt.templates.task_cell_class = (task,date) => {
                if(date.getDay() === 0 || date.getDay() === 6) return 'weekend';
            };
        },
        setScaleDay() {
            gantt.config.scale_unit = 'day';
            gantt.config.step       = 1;
            gantt.config.date_scale = '%D, %d';

            gantt.config.subscales    = [
                {unit : 'month', step : 1, date : '%F, %Y'}
            ];
            gantt.config.scale_height = 60;
        },
        setColumnsComfig() {
            gantt.config.columns = [
                {
                    name : 'text',     
                    label: 'Тема', 
                    width: 400,
                    tree : true 
                },
                {
                    name : 'priority',        
                    label: 'Приоритет',   
                    align: 'center',   
                    width: 100 ,
                    template(obj) {
                        return obj.priority || '' ; }
                }
            ];
        },
        setTasksComfig() {
            gantt.config.fit_tasks     = true; 
            gantt.config.duration_unit = 'hour';//an hour
            gantt.config.duration_step = 1; 
            gantt.templates.task_text  = (start,end,task) => {
                if(task.state === 'user') return `${task.time_sum}` ; 
                if (task.state === 'proj') return `${task.time_sum}`;
                else return `${task.time - task.time_used}`;
            };
        },
        setRowsConfig() {
            gantt.config.layout = {
                css : 'gantt_container',
                cols: [
                    {
                        width    : 500,
                        min_width: 300,
                        rows     : [
                            {view : 'grid', scrollX : 'gridScroll', scrollable : true, scrollY : 'scrollVer'}, 
                            {view : 'scrollbar', id : 'gridScroll'}  
                        ]
                    },
                    {
                        rows: [
                            {view : 'timeline', scrollX : 'scrollHor', scrollY : 'scrollVer'},
                            {view : 'scrollbar', id : 'scrollHor'}
                        ]
                    },
                    {view : 'scrollbar', id : 'scrollVer'}
                ],
            };
        },
        setMarkerToday() {
            var markerId = gantt.addMarker({
                start_date: new Date(),
                css       : 'today',
            // title     : new Date().toString()
            });
        
            gantt.getMarker(markerId);
        },

        async createRequest(requestData)  {
            const { payload } = requestData;
            const { data }    = payload 
                ? await axios.post(requestData.url, payload)
                : await axios.get(requestData.url);
            return data;
        }
    }
};
</script>
<style>
body{
    margin: 0;

padding: 0;
}
.gantt_layout_root{
    height: 500px!important;
}
.weekend{
    background: rgba(238, 149, 149, 0.24) !important;
}
.gantt_link_control{
    display: none;
}
.gantt_task_progress_drag{
    display: none!important;
}
@import "~dhtmlx-gantt/codebase/dhtmlxgantt.css";

</style>