<template>
    <div class="container">
        <div ref="gantt" tasks="tasks" class="left-container"></div>
    </div>
</template>

<script>
import Gantt     from './components/gantt.vue';
import { gantt } from 'dhtmlx-gantt';
export default {
    name      : 'app',
    components: { Gantt },
    data      : () => ({
        tasks: {
            data: [
                {
                    id      : 1,
                    state   : 'user',
                    priority: '',
                    parentId: null,
                    text    : 'Пользователь',
                    time_sum: 10
                },
                {
                    id      : 21001,
                    state   : 'proj',
                    parent  : 1,
                    text    : 'Фонд Потанина',
                    time_sum: 10
                },
                {
                    id        : 45,
                    parent    : 21001,
                    state     : 'task',
                    text      : 'Англ версия. Поправить тайтл',
                    duration  : 3,
                    priority  : 1,
                    start_date: '20-06-2019',
                    end_date  : '10-07-2019',
                    progress  : 0.6,
                    time      : 14,
                    time_used : 4
                },
                {
                    id        : 2400,
                    parent    : 21001,
                    text      : 'поправить слайдер истории в мобиле ipod iphone',
                    duration  : 1,
                    priority  : 1,
                    start_date: '20-06-2019',
                    end_date  : '21-06-2019',
                    progress  : 0.4,
                    time      : 4,
                    time_used : 1.2
                }
            ]
        },
    }),
    mounted() {
        gantt.templates.task_text  = (start,end,task) => {
            console.log(task);
            if(task.state === 'user') { 
                console.log(task);
            
                return `${task.time_sum}` ; 
            }
            if (task.state === 'proj') {  
                return `${task.time_sum}`;
            }
            else { 
                console.log();
                
                return `${task.time - task.time_used}`;
            }
        };
        gantt.config.columns       = [
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
        gantt.config.fit_tasks     = true; 
        gantt.config.duration_unit = 'hour';//an hour
        gantt.config.duration_step = 1; 
    
        gantt.config.scale_unit = 'day';
        gantt.config.step       = 1;
        gantt.config.date_scale = '%D, %d';

        gantt.config.subscales          = [
            {unit : 'month', step : 1, date : '%F'},
            {unit : 'week', step : 1, date : '%W неделя'}
        ];
        gantt.config.scale_height       = 90;
        gantt.templates.task_cell_class = (task,date) => {
            if(date.getDay() === 0 || date.getDay() === 6) { 
                return 'weekend' ;
            }
        };
        var markerId                    = gantt.addMarker({
            start_date: new Date(), //a Date object that sets the marker's date
            css       : 'today', //a CSS class applied to the marker
            title     : new Date().toString()// the marker's tooltip
        });

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
        gantt.getMarker(markerId);
        gantt.init(this.$refs.gantt);
        gantt.parse(this.tasks);
    }
};
</script>
<style>
.gantt_layout_root{
    height: 500px!important;
    
}
.weekend{ background: rgba(238, 149, 149, 0.24) !important;}
@import "~dhtmlx-gantt/codebase/dhtmlxgantt.css";
</style>