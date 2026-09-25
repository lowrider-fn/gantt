import { gantt } from 'dhtmlx-gantt';
import {
    setWorkDays,
    dateToLocaleString,
    dateToString,
    minToHour,
} from '@/lib';

export function configureCommon(tasksMeta) {
    const { config } = gantt;
    config.undo_steps = 1;
    config.details_on_dblclick = false;
    const markerId = gantt.addMarker({
        start_date: new Date(),
        css       : 'today',
    });
    gantt.getMarker(markerId);
    config.start_date = dateToString(tasksMeta.startDate);
    config.end_date = dateToString(tasksMeta.endDate);
}

export function configureColumns() {
    gantt.config.columns = [
        {
            name    : 'text',
            label   : 'ФИО',
            width   : 300,
            tree    : true,
            template: obj => `<a  href="${obj.url}">${obj.text}</a> `,
        },
        {
            name    : 'priority',
            label   : 'Должность',
            align   : 'center',
            width   : 160,
            template: obj => obj.priority || '',
        },
    ];
}

export function configureTasks(getStateScale) {
    const { config } = gantt;
    const { templates } = gantt;
    config.types.user = 'user';
    config.fit_tasks = true;
    config.duration_unit = 'week';
    config.duration_step = 1;

    templates.task_class = (start, end, task) => {
        task.type = config.types[task.type];
        if (task.type === config.types.user) return 'gantt__user-scale';
        if (task.type === config.types.project) return 'gantt__project-scale';
        return 'gantt__task-scale';
    };

    templates.leftside_text = (start, end, task) => {
        if (task.time && task.time_used) return `(${minToHour(task.time)} - ${minToHour(task.time_used)})`;
    };
    gantt.templates.scale_cell_class = date => setWorkDays(date, getStateScale());
    templates.timeline_cell_class = (task, date) => `${setWorkDays(date, getStateScale())} ${dateToLocaleString(date)}`;
    gantt.templates.task_text = () => '';
    gantt.config.show_task_cells = true;
}

export function configureScaleDay(tasksMeta) {
    const { config } = gantt;
    config.scale_unit = 'day';
    config.step = 1;
    config.date_scale = '%d';
    config.subscales = [{ unit: 'month', step: 1, date: '%F, %Y' }];
    config.scale_height = 60;
    config.min_column_width = 36;
    config.readonly = tasksMeta.readonly;
}

export function configureScaleWeek() {
    const { config } = gantt;
    config.scale_unit = 'month';
    config.date_scale = '%F, %Y';
    config.scale_height = 60;
    config.min_column_width = 80;
    config.subscales = [{ unit: 'week', step: 1, date: '%W' }];
    gantt.templates.date_scale = null;
    config.readonly = true;
}

export function configureScaleMonth() {
    const { config } = gantt;
    config.scale_unit = 'year';
    config.date_scale = '%Y';
    config.scale_height = 60;
    config.min_column_width = 90;
    config.subscales = [{ unit: 'month', step: 1, date: '%M' }];
    gantt.templates.date_scale = null;
    config.readonly = true;
}

export function setLayoutConfig(tasksMeta, getStateScale) {
    gantt.config.layout = {
        css   : 'gantt_container',
        config: configureCommon(tasksMeta),
        rows  : [
            {
                cols: [
                    { view: 'scrollbar', id: 'scrollVer' },
                    {
                        width    : 500,
                        min_width: 300,
                        config   : configureColumns(),
                        rows     : [
                            {
                                view   : 'grid',
                                scrollX: 'scrollHor',
                                scrollY: 'scrollVer',
                                config : configureTasks(getStateScale),
                            },
                        ],
                    },
                    {
                        rows: [
                            {
                                view   : 'timeline',
                                scrollX: 'scrollHor',
                                scrollY: 'scrollVer',
                                config : configureScaleDay(tasksMeta),
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
}

export function applyScaleConfig(scale, tasksMeta) {
    gantt.config.smart_scales = true;

    switch (scale) {
    case 'day':
        configureScaleDay(tasksMeta);
        break;
    case 'week':
        configureScaleWeek();
        break;
    case 'month':
        configureScaleMonth();
        break;
    default:
        break;
    }

    gantt.render();
}
