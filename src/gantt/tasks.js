import { gantt } from 'dhtmlx-gantt';
import { dateToLocaleString, dateToString } from '@/lib';

export function refreshTasksData(tasks) {
    tasks.forEach((newTask) => {
        const oldTask = gantt.getTask(newTask.id);
        if (newTask.type === gantt.config.types.task) {
            if (oldTask.start_date) oldTask.start_date = dateToString(newTask.start_date);
            if (oldTask.end_date) oldTask.end_date = dateToString(newTask.end_date);
        }
        oldTask.loads = newTask.loads;
    });
    gantt.refreshData();
}

export function formatDragChange(id) {
    const task = gantt.getTask(id);
    return {
        id,
        start_date: dateToLocaleString(task.start_date),
        end_date  : dateToLocaleString(task.end_date),
    };
}

export function showSaveMessage(isSave) {
    gantt.message({
        type  : isSave ? 'success' : 'error',
        text  : isSave ? 'Сохранено' : 'Данные изменения не возможны',
        expire: 5000,
    });
}
