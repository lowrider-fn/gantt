<template>
    <div class="app">
        <preloader v-if="!isInit" />

        <div v-if="errorText" class="app__error">
            {{ errorText }}
        </div>

        <template v-else>
            <gantt-toolbar
                :scale-options="scaleOptions"
                :active-scale="stateScale"
                :has-changes="changes.length > 0"
                @scale-change="setScaleConfig"
                @save="checkTaskChangesFromServer(changes)"
                @cancel="cancelEdit"
            />
            <div
                ref="gantt"
                :class="['app__gantt', 'gantt', `gantt--${stateScale}`]"
            ></div>
        </template>
    </div>
</template>

<script>
import preloader from './components/preloader';
import GanttToolbar from './components/GanttToolbar';
import { get } from '@/lib';
import { gantt } from 'dhtmlx-gantt';
import { SCALE_OPTIONS } from '@/gantt/constants';
import { setLayoutConfig, applyScaleConfig } from '@/gantt/config';
import { renderWorkloadCells, bindWorkloadInputs } from '@/gantt/workload';
import { getBarsArea, renderProjectVacationBars } from '@/gantt/vacation-bars';
import {
    refreshTasksData,
    formatDragChange,
    showSaveMessage,
} from '@/gantt/tasks';

export default {
    name      : 'App',
    components: {
        preloader,
        GanttToolbar,
    },
    data: () => ({
        errorText   : '',
        tasks       : { data: null },
        scaleOptions: SCALE_OPTIONS,
        stateScale  : 'day',
        isLoading   : false,
        changes     : [],
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
        getStateScale() {
            return this.stateScale;
        },

        initGantt(data) {
            const { tasks } = this;
            tasks.data = data.tasks;
            tasks.readonly = data.readonly;
            tasks.startDate = data.start_date;
            tasks.endDate = data.end_date;

            setLayoutConfig(tasks, () => this.getStateScale());
            gantt.init(this.$refs.gantt);
            this.bindGanttRendering();
            gantt.parse(this.tasks);
            this.bindTaskDrag();
            this.bindTaskClick();
            this.$nextTick(() => this.renderTimelineOverlays());
        },

        bindGanttRendering() {
            gantt.attachEvent('onGanttRender', () => {
                this.$nextTick(() => this.renderTimelineOverlays());
            });
        },

        renderTimelineOverlays() {
            const ganttRoot = this.$refs.gantt || this.$el;
            renderProjectVacationBars({
                barsArea : getBarsArea(ganttRoot),
                tasksData: this.tasks.data,
            });
            renderWorkloadCells({
                rootEl    : this.$el,
                stateScale: this.stateScale,
                tasksMeta : this.tasks,
                changes   : this.changes,
            });
        },

        async getTasksData() {
            const { res, err } = await get();
            if (res) {
                this.initGantt(res);
            } else {
                console.error(err);
                this.errorText = err.text || 'Неизвестная ошибка';
            }
        },

        bindTaskDrag() {
            gantt.attachEvent('onAfterTaskDrag', (id) => {
                this.checkTaskChangesFromServer(formatDragChange(id));
            });
        },

        bindTaskClick() {
            gantt.attachEvent('onTaskClick', (id) => {
                bindWorkloadInputs({
                    rootEl    : this.$el,
                    stateScale: this.stateScale,
                    changes   : this.changes,
                    taskId    : id,
                });
                return true;
            });
        },

        async checkTaskChangesFromServer(changes) {
            this.setIsLoading();
            const { res, err } = await get();
            if (res) {
                this.changes = [];
                refreshTasksData(res.tasks);
                showSaveMessage(true);
                this.setIsLoading();
            } else {
                console.error(err);
                this.changes = [];
                gantt.undo();
                showSaveMessage(false);
                gantt.refreshData();
                this.setIsLoading();
            }
        },

        setIsLoading() {
            this.isLoading = !this.isLoading;
        },

        setScaleConfig(state) {
            this.stateScale = state;
            applyScaleConfig(state, this.tasks);
        },

        cancelEdit() {
            gantt.refreshData();
            this.changes = [];
        },
    },
};
</script>
