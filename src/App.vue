<template>
    <div>
        <div v-if="!isInit">{{ 'preloader' }}</div>
        <div class="container">
            <div v-if="errorText">{{ errorText }}</div>
            <div v-if="tasks.data">
                <button v-for="(state,i) in statesScale"
                        :key="i" 
                        :id="state"
                        @click="setScaleConfig(state)"
                        type="button"
                >
                    {{ state }}
                </button>
            </div>
            <div ref="gantt" class="gantt"></div>
        </div>
    </div>
</template>

<script>

import axios     from 'axios';
import { gantt } from 'dhtmlx-gantt';

export default {
    name: 'app',
    data: () => ({
        errorText  : '',
        tasks      : {data : null},
        isReadonly : false,
        statesScale: ['day','week','month'],
        stateScale : 'day',
    }),
    computed: {
        isInit() {
            return this.tasks.data;
        }
    },
    mounted() {
        this.createRequest({url : '/get/data.json'})
            .then(tasks => this.initGantt(tasks))
            .catch(error => {
                console.error(error);
                this.errorText = error.text || 'Неизвестная ошибка' ;
            });
    },
    methods: {
        initGantt(tasks) {
            this.setWorkDays();
            this.tasks.data = tasks;
            this.setColumnsConfig();
            this.setColumnsConfig();
            this.setTasksConfig();
            this.setRowsConfig();
            this.setMarkerToday();
            this.setScaleDay();
           
            gantt.config.readonly = this.isReadonly;
            gantt.init(this.$refs.gantt);
            gantt.parse(this.tasks);
        },
        setScaleConfig(state) {
            this.stateScale = state;
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
                date = date.getDay();
                if(this.stateScale === 'day' && (date === 0 || date === 6)) return 'gantt__weekend';
                return 'gantt__workday';
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
        setColumnsConfig() {
            gantt.config.columns = [
                {
                    name    : 'text',     
                    label   : 'Тема', 
                    width   : 400,
                    tree    : true ,
                    template: (obj) => `<a  href="${obj.url}">${obj.text}</a> `
                },
                {
                    name    : 'priority',        
                    label   : 'Приоритет',   
                    align   : 'center',   
                    width   : 100 ,
                    template: (obj) => obj.priority || '' 
                }
            ];
        },
        setTasksConfig() {
            gantt.config.types.user    = 'user';
            gantt.config.fit_tasks     = true; 
            gantt.config.duration_unit = 'hour';
            gantt.config.duration_step = 1; 
            gantt.templates.task_text  = (start,end,task) => {
                if(task.time && task.time_used) {
                    return  `<div class="gantt__row-label">(${task.time} - ${task.time_used})</div>`;
                }
                return '';
            };
               
            gantt.templates.task_class = function (start, end, task) {
                task.type = gantt.config.types[task.type];
                if(task.type === gantt.config.types.user) {
                    return 'gantt__user-scale';
                }
                if(task.type === gantt.config.types.project) {
                    return 'gantt__project-scale';
                }
                return 'gantt__task-scale';
            };
            // gantt.config.type_renderers[gantt.config.types.user] = function (task, defaultRender) {
            //     var main_el = document.createElement('div');
            //     main_el.setAttribute(gantt.config.task_attribute, task.id);
            //     var size          = gantt.getTaskPosition(task);
            //     main_el.innerHTML = [
            //         '<div class=\'project-left\'></div>',
            //         '<div class=\'project-right\'></div>'
            //     ].join('');
            //     main_el.className = 'custom-project';
 
            //     main_el.style.left  = size.left + 'px';
            //     main_el.style.top   = size.top + 7 + 'px';
            //     main_el.style.width = size.width + 'px';
 
            //     return main_el;
            // };
            // gantt.config.type_renderers[gantt.config.types.project] = function (task,defaultRender) {
            //     var main_el       = document.createElement('div');
            //     var size          = gantt.getTaskPosition(task);
            //     main_el.innerHTML = [
            //         '<div class=\'project-left\'></div>',
            //         '<div class=\'project-right\'></div>'
            //     ].join('');
            //     main_el.className = 'custom-project';
 
            //     main_el.style.left  = size.left + 'px';
            //     main_el.style.top   = size.top + 7 + 'px';
            //     main_el.style.width = size.width + 'px';
 
            //     return main_el;
            // };
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
        },

    }
};
</script>
<style lang="scss">
@import "~dhtmlx-gantt/codebase/dhtmlxgantt.css";
// @import "~dhtmlx-gantt/codebase/skins/dhtmlxgantt_material.css";
// @import "~dhtmlx-gantt/codebase/skins/dhtmlxgantt_skyblue.css";
// @import "~dhtmlx-gantt/codebase/skins/dhtmlxgantt_broadway.css";
// @import "~dhtmlx-gantt/codebase/skins/dhtmlxgantt_contrast_black.css";
// @import "~dhtmlx-gantt/codebase/skins/dhtmlxgantt_contrast_white.css";
// @import "~dhtmlx-gantt/codebase/skins/dhtmlxgantt_meadow.css";
// @import "~dhtmlx-gantt/codebase/skins/dhtmlxgantt_terrace.css";
body{
    margin: 0;

padding: 0;

.gantt{
    height: 380px;
    &_link_control{
        display: none;
    }
    &_task_progress_drag{
        display: none!important;
    }
    &_task_content{
        overflow: visible;
    }
    &_task_line.gantt_selected{
        box-shadow: 0 0 5px #299cb4!important;
    }
    // &_task_cell{
    //     border: 1px solid rgba(128, 128, 128, 0.466);
    // }
    &__user-scale{
        border: none;
box-shadow: none!important;
background-color: transparent;
    }
    &__project-scale{
        border:1px solid rgba(109, 108, 108, 0.8)!important;

background: rgba(109, 108, 108, 0.2) !important;

        .gantt_task_progress{
            background: #4aaec2!important;
        }
    }
    &__task-scale{
        border:1px solid #3dbad38e;

background: #3dbad363 !important;

        .gantt_task_progress {
            background-color: #54d3ec!important;
        }
    }
    &__row-label{
        position: absolute;

transform: translateX(-110%);

color: black;
    }
    &__weekend{
        background: rgba(238, 149, 149, 0.24) !important;
    }
    &__workday{
        background: rgba(109, 108, 108, 0.02) !important;
    }
}}

</style>