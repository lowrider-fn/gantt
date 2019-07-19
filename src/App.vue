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
import {
    createRequest, setWorkDays, setRightFormatDate, setGanttFormatDate,
} from '@/helpers';

import { gantt } from 'dhtmlx-gantt';

export default {
    name      : 'App',
    components: {
        preloader,
    },
    data: () => ({
        errorText  : '',
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
        initGantt(tasks) {
            this.tasks.data = tasks;
            this.setLayoutConfig();
            gantt.init(this.$refs.gantt);
            gantt.parse(this.tasks);
            this.afterTaskDragProcessing();
            this.afterEditWorkloadProcessing();
            this.taskDragProcessing();
        },

        // http logic ==>

        // get tasks
        getTasksData() {
            createRequest({ url: '/get/data.json' })
                .then(tasks => this.initGantt(tasks))
                .catch((error) => {
                    console.error(error);
                    this.errorText = error.text || 'Неизвестная ошибка';
                });
        },
        // proccessing move and resize  task:
        afterTaskDragProcessing() {
            gantt.attachEvent('onAfterTaskDrag', (id, mode, e) => {
                const task    = gantt.getTask(id);
                const changes = {
                    id        : task.id,
                    start_date: setRightFormatDate(task.start_date),
                    end_date  : setRightFormatDate(task.end_date),
                };
                this.checkTaskChangesFromServer(changes);
            });
        },
        taskDragProcessing() {
            gantt.attachEvent('onTaskDrag', (id, mode, task, original) => {
                const state = gantt.getState();
                const minDate = state.min_date;
                const maxDate = state.max_date;

                const scaleStep = gantt.date.add(new Date(), state.scale_step, state.scale_unit) - new Date();

                let showDate;
                let repaint = false;
                if (mode === 'resize' || mode === 'move') {
                    if (Math.abs(task.start_date - minDate) < scaleStep) {
                        showDate = task.start_date;
                        repaint = true;
                    } else if (Math.abs(task.end_date - maxDate) < scaleStep) {
                        showDate = task.end_date;
                        repaint = true;
                    }

                    if (repaint) {
                        gantt.render();
                        gantt.showDate(showDate);
                    }
                }
            });
        },
        // proccessing edit workload:
        afterEditWorkloadProcessing() {
            if (this.stateScale === 'day') {
                gantt.attachEvent('onTaskClick', (id, e) => {
                    const fields = this.$el.getElementsByClassName('js-workload');
                    Array.from(fields).forEach((field) => {
                        field.oninput = () => {
                            e.preventDefault();
                            const load              = field.value.trim();
                            const isCorrectWorkload = /^[0-7]$/.test(load);
                            const isCorrectVal      = isCorrectWorkload && load;
                            const changes           = {
                                id     : field.getAttribute('task_cell_id'),
                                index  : field.getAttribute('index'),
                                oldLoad: field.defaultValue,
                                newLoad: load,
                            };
                            isCorrectVal ? this.checkTaskChangesFromServer(changes, field) : field.value = '';
                        };
                    });

                    return true;
                });
            }
        },
        async checkTaskChangesFromServer(task, input) {
            this.setIsLoading();

            await createRequest({ url: '/post/data.json' })
                .then((tasks) => {
                    this.refreshTasksData(tasks, input);
                    this.createHttpMessage(true);
                    this.setMonthWeekWorkload();
                    this.setIsLoading();
                })
                .catch((error) => {
                    console.error(error);
                    input ? input.value = task.oldLoad : gantt.undo();
                    this.createHttpMessage(false);
                    this.setIsLoading();
                });
        },
        refreshTasksData(tasks, input) {
            tasks.forEach((newTask) => {
                const oldTask = gantt.getTask(newTask.id);
                if (!input && newTask.type === gantt.config.types.task) {
                    if (oldTask.start_date) oldTask.start_date = setGanttFormatDate(newTask.start_date);
                    if (oldTask.end_date) oldTask.end_date = setGanttFormatDate(newTask.end_date);
                    // console.log(setGanttFormatDate(newTask.end_date));
                }
                oldTask.loads = newTask.loads;
            });
            gantt.refreshData();
        },
        setIsLoading() {
            this.isLoading = !this.isLoading;
        },
        // create post http message
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
                rows  : [
                    {
                        cols: [
                            { view: 'scrollbar', id: 'scrollVer' },
                            {
                                width    : 500,
                                min_width: 300,
                                config   : this.setColumnsConfig(),
                                rows     : [
                                    {
                                        view   : 'grid',
                                        scrollX: 'scrollHor',
                                        scrollY: 'scrollVer',
                                        config : this.setTasksConfig(),
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
                                    {
                                        view: 'scrollbar',
                                        id  : 'scrollHor',
                                    },
                                ],
                            },
                        ],
                    },

                ],
            };
        },
        setGanttCommonConfig() {
            gantt.config.undo_steps          = 1;
            gantt.config.details_on_dblclick = false;
            const markerId                   = gantt.addMarker({
                start_date: new Date(),
                css       : 'today',
            });
            gantt.getMarker(markerId);
        },

        // task config:
        setTasksConfig() {
            gantt.config.types.user    = 'user';
            gantt.config.fit_tasks     = true;
            gantt.config.duration_unit = 'week';
            gantt.config.duration_step = 1;

            gantt.templates.task_class =  (start, end, task) => {
                task.type = gantt.config.types[task.type];
                if (task.type === gantt.config.types.user) return 'gantt__user-scale';
                if (task.type === gantt.config.types.project) return 'gantt__project-scale';
                return 'gantt__task-scale';
            };

            gantt.templates.leftside_text = (start, end, task) => {
                if (task.time && task.time_used) return `(${task.time} - ${task.time_used})`;
            };

            gantt.templates.task_cell_class = (task, date) => `${setWorkDays(date, this.stateScale)} ${setRightFormatDate(date)}`;

            this.setDayWorkLoadTemplates();
        },
        // only day standart logic
        setDayWorkLoadTemplates() {
            gantt.templates.task_text = (start, end, task) => {
                const isReadonly = this.isReadonly || task.type !== gantt.config.types.task;
                if (this.stateScale === 'day') {
                    return task.loads.day.map((load) => {
                        let className = '';

                        if (load.time > 7) className = 'error';
                        else if (load.time === 7)className = 'success';

                        if (!isReadonly) {
                            return `<input task_cell_id="${task.id}"
                                    index="${load.date}"
                                    value="${load.time || ''}" 
                                    class="js-workload gantt__load-cell ${className}"
                                >`;
                        }
                        return `<div class="gantt__load-cell ${className}">
                                ${load.time || ''}
                            </div>`;
                    }).join('');
                }
                return '';
            };
        },

        setMonthWeekWorkload() {
            this.setReadOnlyWorkloadCell();
            gantt.attachEvent('onTaskRowClick', (id, row) => {
                this.setReadOnlyWorkloadCell();
                return true;
            });
            gantt.attachEvent('onTaskSelected', (id) => {
                this.setReadOnlyWorkloadCell();
                return true;
            });
        },

        setReadOnlyWorkloadCell() {
            if (this.stateScale !== 'day') {
                const rows = document.querySelectorAll('[task_id]');

                Array.from(rows).forEach((row) => {
                    const id      = row.getAttribute('task_id');
                    const task    = gantt.getTask(id);
                    const loads   = task.loads[this.stateScale];
                    let className = 'normal';
                    loads.forEach((load) => {
                        if (this.stateScale === 'week') {
                            if (load.time > 35) className = 'error';
                            else if (load.time === 35)className = 'success';
                        } else if (this.stateScale === 'month') {
                            if (load.time > 170) className = 'error';
                            else if (load.time === 170)className = 'success';
                        }
                        const cell = row.getElementsByClassName(load.date);
                        if (cell.length > 0 && load.time) {
                            cell[0].textContent = load.time;
                            cell[0].classList.add(className);
                        }
                    });
                });
            }
        },

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
            this.stateScale           = state;
            switch (state) {
            case 'day':
                this.setScaleDay();
                gantt.render();
                break;
            case 'week':
                this.setScaleWeek();
                this.setMonthWeekWorkload();
                break;
            case 'month':
                this.setScaleMonth();
                this.setMonthWeekWorkload();
                break;
            }
        },
        setScaleDay() {
            gantt.config.scale_unit          = 'day';
            gantt.config.step                = 1;
            gantt.config.date_scale          = '%d';
            gantt.config.subscales           = [
                { unit: 'month', step: 1, date: '%F, %Y' },
            ];
            gantt.config.scale_height        = 60;
            gantt.templates.scale_cell_class = date => setWorkDays(date, this.stateScale);
            gantt.config.readonly            = this.isReadonly;
        },
        setScaleWeek() {
            gantt.config.scale_unit    = 'month';
            gantt.config.date_scale    = '%F, %Y';
            gantt.templates.date_scale = null;

            gantt.config.scale_height = 60;

            gantt.config.subscales = [
                { unit: 'week', step: 1, date: '%W' },
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
                { unit: 'month', step: 1, date: '%M' },
            ];
            gantt.config.readonly  = true;
            gantt.render();
        },
    },
};
</script>
