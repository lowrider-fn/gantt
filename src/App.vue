<template>
    <div class="container">
        <gantt :tasks="tasks" class="left-container"/>
    </div>
</template>

<script>
import Gantt from './components/gantt.vue';

export default {
    name      : 'app',
    components: {Gantt},
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
                    end_date  : '23-06-2019',
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
                }]}
        // {
        //     id      : 2,
        //     orderId : 1,
        //     priority: '',
        //     parentId: null,
        //     title   : 'Пользователь2',
        //     summary : true,
        //     expanded: true
        // },
        // {
        //     id             : 2100,
        //     orderId        : 2100,
        //     parentId       : 1,
        //     priority       : 1,
        //     title          : 'Фонд Потанина',
        //     percentComplete: 0.47,
        //     summary        : true,
        //     expanded       : true,
        // },
        // {
        //     id             : 21,
        //     orderId        : 21,
        //     parentId       : 2100,
        //     title          : 'Англ версия.',
        //     percentComplete: 0.5,
        //     priority       : 1,
        //     summary        : true,
        //     expanded       : true,
        //     start          : '2019/6/08',
        //     end            : '2019/6/17'
        // },
        // {
        //     id             : 27,
        //     orderId        : 27,
        //     parentId       : 21,
        //     title          : ' Поправить тайтл',
        //     percentComplete: 0.5,
        //     priority       : 1,
        //     start          : '2019/6/15',
        //     end            : '2019/6/19'
        // },
        // {
        //     id             : 27,
        //     orderId        : 27,
        //     parentId       : 21,
        //     title          : 'поправить слайдер истории в мобиле ipod iphone',
        //     percentComplete: 0.5,
        //     priority       : 1,
        //     start          : '2019/6/15',
        //     end            : '2019/6/19'
        // }
        // ],
        // tasks: {
        //     data: [
        //         {id : 1, text : 'Task #1', start_date : '15-04-2017', duration : 3, progress : 0.6},
        //         {id : 2, text : 'Task #2', start_date : '18-04-2017', duration : 3, progress : 0.4}
        //     ],
        //     links: [
        //         {id : 1, source : 1, target : 2, type : '0'}
        //     ]
        // },
    }),
    mounted() {
        window.gantt.templates.task_text = (start,end,task) => {
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

        // window.gantt.templates.histogram_cell_allocated =(start_date,end_date,resource,tasks) => {
        //     return tasks.length * 8;
        // };

        // window.gantt.config.scale_unit = 'mounth';
        // window.gantt.config.date_scale = '%M';

        // window.gantt.attachEvent('onAfterTaskAdd', (id, task) => {
        //     this.$emit('task-updated', id, 'inserted', task);
        // });

        // window.gantt.attachEvent('onAfterTaskUpdate', (id, task) => {
        //     this.$emit('task-updated', id, 'updated', task);
        // });

        // window.gantt.attachEvent('onAfterTaskDelete', (id) => {
        //     this.$emit('task-updated', id, 'deleted');
        //     if(!gantt.getSelectedId()) {
        //         this.$emit('task-selected', null);
        //     }
        // });

        // window.gantt.attachEvent('onAfterLinkAdd', (id, link) => {
        //     this.$emit('link-updated', id, 'inserted', link);
        // });

        // window.gantt.attachEvent('onAfterLinkUpdate', (id, link) => {
        //     this.$emit('link-updated', id, 'updated', link);
        // });

        // window.gantt.attachEvent('onAfterLinkDelete', (id, link) => {
        //     this.$emit('link-updated', id, 'deleted');
        // });
    }
};
</script>