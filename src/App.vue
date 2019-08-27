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
                    :disabled="stateScale === state.id"
                    @click="setScaleConfig(state.id)"
            >
                {{ state.text }}
            </button>
            <div v-if="changes.length > 0">
                <button type="button"
                        @click="checkTaskChangesFromServer(changes)"
                >
                    Сохранить
                </button>
                <button type="button"
                        @click="cancelEdit()"
                >
                    Отменить
                </button>
            </div>
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
    createRequest,
    setWorkDays,
    dateToLocaleString,
    dateToString,
    minToHour,
    querySelectorAll,
    addClass,
    querySelector,
    getElementsByClassName,
    dateToNumberArray,
} from '@/helpers';

import { gantt } from 'dhtmlx-gantt';

export default {
    name      : 'App',
    components: {
        preloader,
    },
    data: () => ({
        gantt,
        errorText  : '',
        tasks      : { data: null },
        statesScale: [
            { text: 'День', id: 'day' },
            { text: 'Неделя', id: 'week' },
            { text: 'Месяц', id: 'month' },
        ],
        stateScale: 'day',
        isLoading : false,
        changes   : [],
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
        initGantt(data) {
            const { tasks } = this;
            tasks.data      = data.tasks;
            tasks.readonly  = data.readonly;
            tasks.startDate = data.start_date;
            tasks.endDate   = data.end_date;
            this.setLayoutConfig();
            gantt.init(this.$refs.gantt);
            gantt.parse(this.tasks);
            this.afterTaskDragProcessing();
            // this.taskDragProcessing();
            this.setMonthWeekWorkload();
        },

        // http logic ==>

        // get tasks http://dev01.bitrix.defa.ru/project/api/?method=getGunt
        getTasksData() {
            createRequest({ url: '/get/data.json' })
                .then(data => this.initGantt(data))
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
                    id,
                    start_date: dateToLocaleString(task.start_date),
                    end_date  : dateToLocaleString(task.end_date),
                };
                this.checkTaskChangesFromServer(changes);
            });
        },
        // taskDragProcessing() {
        //     gantt.attachEvent('onTaskDrag', (id, mode, task, original) => {
        //         const state   = gantt.getState();
        //         const minDate = state.min_date;
        //         const maxDate = state.max_date;

        //         const scaleStep = gantt.date.add(new Date(), state.scale_step, state.scale_unit) - new Date();

        //         let showDate;
        //         let repaint = false;
        //         if (mode === 'resize' || mode === 'move') {
        //             if (Math.abs(task.start_date - minDate) < scaleStep) {
        //                 showDate = task.start_date;
        //                 repaint  = true;
        //             } else if (Math.abs(task.end_date - maxDate) < scaleStep) {
        //                 showDate = task.end_date;
        //                 repaint  = true;
        //             }

        //             if (repaint) {
        //                 gantt.render();
        //                 gantt.showDate(showDate);
        //             }
        //         }
        //     });
        // },

        async checkTaskChangesFromServer(changes) {
            this.setIsLoading();
            await createRequest({ url: '/post/data.json' })
                .then((data) => {
                    this.changes = [];
                    this.refreshTasksData(data.tasks);
                    this.createHttpMessage(true);
                    this.setIsLoading();
                })
                .catch((error) => {
                    console.error(error);
                    this.changes = [];
                    gantt.undo();
                    this.createHttpMessage(false);
                    gantt.refreshData();
                    this.setIsLoading();
                });
        },
        refreshTasksData(tasks) {
            tasks.forEach((newTask) => {
                const oldTask = gantt.getTask(newTask.id);
                if (newTask.type === gantt.config.types.task) {
                    if (oldTask.start_date) oldTask.start_date = dateToString(newTask.start_date);
                    if (oldTask.end_date) oldTask.end_date = dateToString(newTask.end_date);
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
            const { config }           = gantt;
            config.undo_steps          = 1;
            config.details_on_dblclick = false;
            const markerId             = gantt.addMarker({
                start_date: new Date(),
                css       : 'today',
            });
            gantt.getMarker(markerId);
            config.start_date = dateToString(this.tasks.startDate);
            config.end_date   = dateToString(this.tasks.endDate);
        },

        // task config:
        setTasksConfig() {
            const { config }     = gantt;
            const { templates }  = gantt;
            config.types.user    = 'user';
            config.fit_tasks     = true;
            config.duration_unit = 'week';
            config.duration_step = 1;

            templates.task_class =  (start, end, task) => {
                task.type = config.types[task.type];
                if (task.type === config.types.user) return 'gantt__user-scale';
                if (task.type === config.types.project) return 'gantt__project-scale';
                return 'gantt__task-scale';
            };

            templates.leftside_text          = (start, end, task) => {
                if (task.time && task.time_used) return `(${minToHour(task.time)} - ${minToHour(task.time_used)})`;
            };
            gantt.templates.scale_cell_class = date => setWorkDays(date, this.stateScale);
            templates.task_cell_class        = (task, date) => `${setWorkDays(date, this.stateScale)} ${dateToLocaleString(date)}`;
            this.setDayWorkLoadCell();
        },
        // only day standart logic
        setDayWorkLoadCell() {
            gantt.templates.task_text = (start, end, task) => {
                const isReadonly = this.tasks.readonly || task.type !== gantt.config.types.task;
                if (this.stateScale === 'day') {
                    return task.loads.day.map((l) => {
                        let className = '';
                        const load    = minToHour(l.time);
                        if (load > 7) className = 'error';
                        else if (load === 7) className = 'success';
                        if (!isReadonly) {
                            return `<input task_cell_id="${task.id}"
                                    date="${l.date}"
                                    value="${load || ''}" 
                                    readonly
                                    class="js-workload gantt__load-cell ${className}"
                                >`;
                        }

                        return `<div class="gantt__load-cell ${className}"
                                >
                                    ${load || ''}
                                </div>`;
                    }).join('');
                }
                return '';
            };
        },

        setMonthWeekWorkload() {
            gantt.attachEvent('onTaskRowClick', (id, row) => {
                this.setReadOnlyWorkloadCell();
                return true;
            });
            gantt.attachEvent('onTaskSelected', (id, row) => {
                this.editWorkload(id, row);
                this.setReadOnlyWorkloadCell();
                return false;
            });
        },
        // proccessing edit workload:
        editWorkload(id, row) {
            if (this.stateScale === 'day') {
                const fields = querySelectorAll('.js-workload', row);
                Array.from(fields).forEach((field) => {
                    field.oninput = (e) => {
                        e.preventDefault();
                        const load              = field.value.trim();
                        const isCorrectWorkload = /[0-9]$/.test(load) || load === '';

                        if (isCorrectWorkload) {
                            const date        =  field.getAttribute('date');
                            const editChanges = this.changes.find((el) => {
                                if (el.id === id && el.date === date) {
                                    el.load = load;
                                    return el;
                                }
                            });
                            if (!editChanges) this.changes.push({ id, date, load  });
                        } else field.value = '';
                    };
                    field.ondblclick = e => e.target.removeAttribute('readonly');

                    field.onblur = e => e.target.setAttribute('readonly', true);
                });
            }
        },
        setReadOnlyWorkloadCell() {
            if (this.stateScale !== 'day') {
                const rows = querySelectorAll('[task_id]');
                Array.from(rows).forEach((row) => {
                    const id      = row.getAttribute('task_id');
                    const task    = gantt.getTask(id);
                    const loads   = task.loads[this.stateScale];
                    let className = 'normal';
                    loads.forEach((l) => {
                        const load = minToHour(l.time);
                        if (this.stateScale === 'week') {
                            if (load > 35) className = 'error';
                            else if (load === 35) className = 'success';
                        } else if (this.stateScale === 'month') {
                            if (load > 170) className = 'error';
                            else if (load === 170) className = 'success';
                        }
                        const cell = getElementsByClassName(l.date, row);
                        if (cell.length > 0 && load) {
                            cell[0].textContent = load;
                            addClass(cell[0], className);
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
                this.setReadOnlyWorkloadCell();
                break;
            case 'month':
                this.setScaleMonth();
                this.setReadOnlyWorkloadCell();
                break;
            }
        },
        setScaleDay() {
            const { config } = gantt;

            config.scale_unit   = 'day';
            config.step         = 1;
            config.date_scale   = '%d';
            config.subscales    = [
                { unit: 'month', step: 1, date: '%F, %Y' },
            ];
            config.scale_height = 60;

            config.readonly = this.tasks.readonly;
        },
        setScaleWeek() {
            const { config } = gantt;

            config.scale_unit          = 'month';
            config.date_scale          = '%F, %Y';
            config.scale_height        = 60;
            config.subscales           = [
                { unit: 'week', step: 1, date: '%W' },
            ];
            gantt.templates.date_scale = null;
            config.readonly            = true;

            gantt.render();
        },
        setScaleMonth() {
            const { config } = gantt;

            config.scale_unit          = 'year';
            config.date_scale          = '%Y';
            config.scale_height        = 60;
            config.subscales           = [
                { unit: 'month', step: 1, date: '%M' },
            ];
            gantt.templates.date_scale = null;
            config.readonly            = true;
            gantt.render();
        },
        cancelEdit() {
            gantt.refreshData();
            this.changes = [];
        },
    },
};
</script>
