<template>
    <div class="container">
        <preloader v-if="!isInit" />

        <div v-if="errorText">
            {{ errorText }}
        </div>

        <div v-else>
            <button v-for="(state,i) in statesScale"
                    :id="state.id"
                    :key="i"
                    type="button"
                    @click="setScaleConfig(state.id)"
            >
                {{ state.text }}
            </button>

            <div ref="gantt"
                 :class="`gantt--${stateScale}`"
                 class="gantt"
            >
            </div>
        </div>
    </div>
</template>

<script>
import preloader from './components/preloader';
import { createRequest, setWorkDays, setRightFormatDate } from '@/helpers';

import { gantt } from 'dhtmlx-gantt';
import clonedeep from 'lodash.clonedeep';
import debounce from 'lodash.debounce';

export default {
    name      : 'App',
    components: {
        preloader,
    },
    data: () => ({
        dataTasks  : null,
        errorText  : '',
        errorEdit  : '',
        tasks      : { data: null },
        isReadonly : false,
        statesScale: [
            { text: 'День', id: 'day' },
            { text: 'Неделя', id: 'week' },
            { text: 'Месяц', id: 'month' },
        ],
        stateScale: 'day',
        isLoading : false,
    }),
    computed: {
        isInit() {
            return (this.tasks.data || this.errorText) && !this.isLoading;
        },
    },
    mounted() {
        this.getTasksData();
    },
    methods: {
        getTasksData() {
            createRequest({ url: '/get/data.json' })
                .then(tasks => this.initGantt(tasks))
                .catch((error) => {
                    console.error(error);
                    this.errorText = error.text || 'Неизвестная ошибка';
                });
        },
        initGantt(tasks) {
            this.setTasksData(tasks);
            this.setLayoutConfig();
            gantt.init(this.$refs.gantt);
            gantt.parse(this.tasks);

            this.afterTaskDragProcessing();

            this.afterEditWorkloadProcessing();
        },
        setTasksData(tasks) {
            this.dataTasks = clonedeep(tasks);
            this.tasks.data = tasks;
        },

        // proccessing move and resize task:
        afterTaskDragProcessing() {
            gantt.attachEvent('onAfterTaskDrag', (id, mode, e) => {
                // console.log(id, mode);

                const task = gantt.getTask(id);
                const changes = {};
                changes.id = task.id;

                // const newStartDate = setRightFormatDate(task.start_date);
                // const newEndDate   = setRightFormatDate(task.end_date);

                // if(this.dataTasks.start_date !== newStartDate) {
                changes.start_date = setRightFormatDate(task.start_date);
                // }
                // if(this.dataTasks.end_date !== newEndDate) {
                changes.end_date = setRightFormatDate(task.end_date);
                // }

                // if(Object.keys(changes).length > 1)

                this.checkTaskChangesFromServer(changes);
            });
        },
        checkTaskChangesFromServer(task) {
            this.setIsLoading();
            createRequest({ url: '/get/data.jso' })
                .then((tasks) => {
                    this.setIsLoading();
                    this.createHttpMessage(true);
                    // not work refresh
                })
                .catch((error) => {
                    console.error(error);
                    this.errorEdit = error.text || 'Данные изменения невозможны';
                    //  undo not correct work
                    gantt.undo();
                    console.log('undo call');

                    this.setIsLoading();
                    this.createHttpMessage(false);
                    // process error
                });
        },

        // proccessing edit workload:
        afterEditWorkloadProcessing() {
            if (this.stateScale === 'day') {
                gantt.attachEvent('onTaskClick', (id, e) => {
                    const fields = document.getElementsByClassName('js-workload');

                    for (let i = 0; i < fields.length; i++) {
                        fields[i].oninput = (e) => {
                            e.preventDefault();
                            const load = e.target.value.trim();

                            const isCorrectWorkload = /^[1-7]$/.test(load);
                            const isCorrectVal = isCorrectWorkload && load;

                            isCorrectVal ? this.checkWorkloadChangesFromServer(id) : fields[i].value = '';
                        };
                    }
                    return true;
                });
            }
        },
        checkWorkloadChangesFromServer: debounce(function (task) {
            this.setIsLoading();
            createRequest({ url: '/get/data.jso' })
                .then((tasks) => {
                    this.setIsLoading();
                    // not work refresh
                    this.createHttpMessage(true);
                })
                .catch((error) => {
                    console.error(error);
                    this.errorEdit = error.text || 'Данные изменения невозможны';

                    this.setIsLoading();
                    this.createHttpMessage(false);
                    // process error
                }, 200);
        }),
        setIsLoading() {
            this.isLoading = !this.isLoading;
        },
        // create http message
        createHttpMessage(isSave) {
            gantt.message({
                type  : isSave ? 'success' : 'error',
                text  : isSave ? 'Сохранено' : 'Данные изменения не возможны',
                expire: 5000,
            });
        },

        // common config:
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
                                scrollY   : 'scrollVer',
                                config    : this.setTasksConfig(),
                            },
                            {
                                view: 'scrollbar',
                                id  : 'gridScroll',
                            },
                        ],
                    },
                    {
                        rows: [
                            {
                                view   : 'timeline',
                                scrollX: 'scrollHor',
                                scrollY: 'scrollVer',
                                config : this.setScaleDay(),
                            },
                            // {
                            //     // config: resourceConfig,
                            //     cols: [
                            //         {view : 'resourceGrid', group : 'grids', width : 435, scrollY : 'resourceVScroll'},
                            //         {resizer : true, width : 1},
                            //         {view : 'resourceTimeline', scrollX : 'scrollHor', scrollY : 'resourceVScroll'},
                            //         {view : 'scrollbar', id : 'resourceVScroll', group : 'vertical'}
                            //     ],
                            //     gravity: 1
                            // },
                            {
                                view: 'scrollbar',
                                id  : 'scrollHor',
                            },
                        ],
                    },
                ],
            };
        },
        setGanttCommonConfig() {
            gantt.config.details_on_dblclick = false;
            const markerId = gantt.addMarker({
                start_date: new Date(),
                css       : 'today',
            });
            gantt.getMarker(markerId);
        },

        // right grid config ==>

        // task config:
        setTasksConfig() {
            gantt.config.types.user = 'user';
            gantt.config.fit_tasks = true;
            gantt.config.duration_unit = 'week';
            gantt.config.duration_step = 1;

            gantt.templates.task_class = function (start, end, task) {
                task.type = gantt.config.types[task.type];
                if (task.type === gantt.config.types.user) return 'gantt__user-scale';
                if (task.type === gantt.config.types.project) return 'gantt__project-scale';
                return 'gantt__task-scale';
            };

            gantt.templates.leftside_text = function (start, end, task) {
                if (task.time && task.time_used) return `(${task.time} - ${task.time_used})`;
            };

            gantt.templates.task_cell_class = (task, date) => setWorkDays(date, this.stateScale);
            this.setWorkLoadTemplates();
        },
        setWorkLoadTemplates() {
            gantt.templates.task_text = (start, end, task) => {
                const loads = task.loads[this.stateScale];
                return this.createWorkLoadCell(loads, task);
            };
        },
        // create workload cell:
        createWorkLoadCell(loads, task) {
            const isReadonly = this.isReadonly || (task.type !== 'task' || this.stateScale !== 'day');

            if (!isReadonly) return this.createEditableCell(loads, task);
            return this.createReadonlyCell(loads, task);
        },
        createEditableCell(loads, task) {
            let loadHtml = '';
            loads.forEach((load, i) => {
                const className = load > 7
                    ? 'error' : load === 7
                        ? 'success' : '';

                loadHtml += `<input task_id="${task.id}"
                                        index="${i}"
                                        value="${load || ''}" 
                                        class="js-workload gantt__load-cell ${className}"
                                >`;
            });
            return loadHtml;
        },
        createReadonlyCell(loads, task) {
            let loadHtml = '';

            loads.forEach((load, i) => {
                const className = load > 7
                    ? 'error' : load === 7
                        ? 'success' : '';

                loadHtml += `<div class="gantt__load-cell ${className}">
                                ${load || ''}
                            </div>`;
            });
            return loadHtml;
        },

        // left grid config ==>

        // left columns config
        setColumnsConfig() {
            gantt.config.columns = [
                {
                    name    : 'text',
                    label   : 'Тема',
                    width   : 400,
                    tree    : true,
                    template: obj => `<a  href="${obj.url}">${obj.text}</a> `,
                },
                {
                    name    : 'priority',
                    label   : 'Приоритет',
                    align   : 'center',
                    width   : 100,
                    template: obj => obj.priority || '',
                },
            ];
        },
        // set calendar config:
        setScaleConfig(state) {
            gantt.config.smart_scales = true;
            this.stateScale = state;
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
            gantt.config.scale_unit = 'day';
            gantt.config.step = 1;
            gantt.config.date_scale = '%d';
            gantt.config.subscales = [
                { unit: 'month', step: 1, date: '%F, %Y' },
            ];
            gantt.config.scale_height = 60;
            gantt.templates.scale_cell_class = date => setWorkDays(date, this.stateScale);
            gantt.config.readonly = this.isReadonly;
        },
        setScaleWeek() {
            gantt.config.scale_unit = 'month';
            gantt.config.date_scale = '%F, %Y';
            gantt.templates.date_scale = null;

            gantt.config.scale_height = 60;

            gantt.config.subscales = [
                { unit: 'week', step: 1, date: '%W' },
            ];
            gantt.config.readonly = true;
            gantt.render();
        },
        setScaleMonth() {
            gantt.config.scale_unit = 'year';
            gantt.config.date_scale = '%Y';
            gantt.templates.date_scale = null;
            gantt.config.scale_height = 60;

            gantt.config.subscales = [
                { unit: 'month', step: 1, date: '%M' },
            ];
            gantt.config.readonly = true;
            gantt.render();
        },
    },
};
</script>
