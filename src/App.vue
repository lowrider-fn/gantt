<template>
       
    <div class="container">
        <preloader v-if="!isInit"/>

        <div v-if="errorText">{{ errorText }}</div>

        <div v-else>
            <button v-for="(state,i) in statesScale"
                    :key="i" 
                    :id="state.id"
                    @click="setScaleConfig(state.id)"
                    type="button"
            >
                {{ state.text }}
            </button>
        
            <div :class="`gantt--${stateScale}`"
                 ref="gantt"
                 class="gantt"
            >
            </div>
        </div>
    </div>
</template>

<script>
import preloader                                               from './components/preloader';
import  { createRequest, setWorkDays, setRightFormatDate }     from '@/helpers';

import { gantt }                                               from 'dhtmlx-gantt';
import clonedeep                                               from 'lodash.clonedeep';
import isequal                                                 from 'lodash.isequal';

export default {
    name      : 'app',
    components: {
        preloader
    },
    data: () => ({
        dataTasks  : null,
        errorText  : '',
        errorEdit  : '',
        tasks      : { data : null },
        isReadonly : false,
        statesScale: [
            { text : 'День', id : 'day' },
            { text : 'Неделя', id : 'week' },
            { text : 'Месяц', id : 'month' } 
        ],
        stateScale: 'day',
        isLoading : false,
    }),
    computed: {
        isInit() {
            return (this.tasks.data || this.errorText) && !this.isLoading;
        }
    },
    mounted() {
        this.getTasksData();
    },
    methods: {
        getTasksData() {
            createRequest({url : '/get/data.json'})
                .then(tasks => this.initGantt(tasks))
                .catch(error => {
                    console.error(error);
                    this.errorText = error.text || 'Неизвестная ошибка' ;
                });
        },
        checkTaskChangesFromServer(task) {
            this.setIsLoading();
            createRequest({url : '/get/data.json'})
                .then(tasks => {
                    this.setTasksData(tasks);
                    gantt.parse(this.tasks);
                    this.setIsLoading();
                    //not work refresh
                    
                    gantt.refreshData();
                })
                .catch(error => {
                    console.error(error);
                    this.errorEdit = error.text || 'Данные изменения невозможны' ;
                    this.setIsLoading();
                    //process error
                });
        },
        setIsLoading() {
            this.isLoading = !this.isLoading;
        },
        setTasksData(tasks) {
            this.dataTasks  = clonedeep(tasks);
            this.tasks.data = tasks;
        },
        initGantt(tasks) {
            this.setTasksData(tasks);
            this.setLayoutConfig();
            gantt.init(this.$refs.gantt);
            gantt.parse(this.tasks);

            this.afterTaskDragProcessing();
        },

        afterTaskDragProcessing() {
            gantt.attachEvent('onAfterTaskDrag', id => {
                const task    = gantt.getTask(id);
                const changes = {};
                changes.id    = task.id; 
                
                const newStartDate = setRightFormatDate(task.start_date);
                const newEndDate   = setRightFormatDate(task.end_date);

                if(this.dataTasks.start_date !== newStartDate) {
                    changes.start_date = newStartDate; 
                } 
                if(this.dataTasks.end_date !== newEndDate) {
                    changes.end_date = newEndDate; 
                }
                
                if(Object.keys(changes).length > 1) this.checkTaskChangesFromServer(changes);
            });
        },
        cancel() {
            this.tasks.data = clonedeep(this.dataTasks);
        },
                
        setLayoutConfig() {
            gantt.config.layout = {
                css   : 'gantt_container',
                config: this.setGanttCommonConfig(),
                cols  : [
                    {
                        width    : 500,
                        min_width: 300,
                        config   : this.setColumnsConfig(),
                        rows     : [
                            {
                                view      : 'grid', 
                                scrollX   : 'gridScroll', 
                                scrollable: true, 
                                scrollY   : 'scrollVer'  ,
                                config    : this.setTasksConfig()
                            } ,
                            {
                                view: 'scrollbar', 
                                id  : 'gridScroll'
                            }  
                        ]
                    },
                    {
                        rows: [
                            {
                                view   : 'timeline',
                                scrollX: 'scrollHor',
                                scrollY: 'scrollVer', 
                                config : this.setScaleDay()
                            },
                            {
                                view: 'scrollbar', 
                                id  : 'scrollHor'
                            }
                        ]
                    }
                ],
            };
        },
        //common config
        setGanttCommonConfig() {
            gantt.config.details_on_dblclick = false;
            const markerId                   = gantt.addMarker({
                start_date: new Date(),
                css       : 'today',
            });
            gantt.getMarker(markerId);
        },
        //left grid config
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
        //task config
        setTasksConfig() {
            gantt.config.types.user    = 'user';
            gantt.config.fit_tasks     = true; 
            gantt.config.duration_unit = 'week';
            gantt.config.duration_step = 1; 

            gantt.templates.task_class = function (start, end, task) {
                task.type = gantt.config.types[task.type];
                if(task.type === gantt.config.types.user) return 'gantt__user-scale';
                if(task.type === gantt.config.types.project) return 'gantt__project-scale';
                return 'gantt__task-scale';
            };
        
            gantt.templates.leftside_text = function (start, end, task) {
                if(task.time && task.time_used) return `(${task.time} - ${task.time_used})`;
            };

            gantt.templates.task_cell_class = (task, date) => setWorkDays(date, this.stateScale);
            this.setWorkLoadTemplates(); 
        },
        setWorkLoadTemplates() {
            gantt.templates.task_text = (start,end,task) => {
                const loads = task.loads[this.stateScale];

                let loadHtml = ``;
                loads.forEach(load => {
                    const className = load > 7 
                        ? 'error' : load === 7 
                            ? 'success' : ''
                    loadHtml += `<div  class="gantt__load-cell ${className} ">${load || ''}</div>`;
                });
                return loadHtml;
            };
        },
        //right grid config
        setScaleConfig(state) {
            gantt.config.smart_scales = true;
            this.stateScale           = state;
            switch (state) {
            case 'day':
                this.setScaleDay();
                gantt.render();
                break;
            case 'week':
                this.setScaleWeek();
                break;
            case 'month':
                this.setScaleMonth();
                break;
            }
        },
        setScaleDay() {
            gantt.config.scale_unit          = 'day';
            gantt.config.step                = 1;
            gantt.config.date_scale          = '%d';
            gantt.config.subscales           = [
                {unit : 'month', step : 1, date : '%F, %Y'}
            ];
            gantt.config.scale_height        = 60;
            gantt.templates.scale_cell_class =  (date) => setWorkDays(date, this.stateScale);
            gantt.config.readonly            = this.isReadonly ;
        },
        setScaleWeek() {
            gantt.config.scale_unit    = 'month';
            gantt.config.date_scale    = '%F, %Y';
            gantt.templates.date_scale = null;
 
            gantt.config.scale_height = 60;
 
            gantt.config.subscales = [
                {unit : 'week', step : 1, date : '%W'}
            ];
            gantt.config.readonly  = true;
            gantt.render();
        },
        setScaleMonth() {
            gantt.config.scale_unit    = 'year';
            gantt.config.date_scale    = '%Y';
            gantt.templates.date_scale = null;
            gantt.config.scale_height  = 60;
 
            gantt.config.subscales = [
                {unit : 'month', step : 1, date : '%M'}
            ];
            gantt.config.readonly  = true;
            gantt.render();
        },
    }
};
</script>
<style lang="scss">

</style>
