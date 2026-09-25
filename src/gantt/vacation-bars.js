import { gantt } from 'dhtmlx-gantt';

export function getBarsArea(rootEl) {
    if (!rootEl) return null;
    return rootEl.querySelector('.gantt_bars_area');
}

export function renderProjectVacationBars({ barsArea, tasksData }) {
    if (!barsArea || !tasksData) return;

    const oldBars = barsArea.querySelectorAll('.gantt__project-vacation-bar');
    Array.from(oldBars).forEach(bar => bar.remove());

    const projects = tasksData.filter(item => item.type === 'project');

    projects.forEach((project) => {
        let parentTask;
        try {
            parentTask = gantt.getTask(project.id);
        } catch (err) {
            return;
        }

        const vacations = tasksData.filter(
            item => item.parent === project.id && item.type === 'task',
        );

        vacations.forEach((vacation) => {
            let childTask;
            try {
                childTask = gantt.getTask(vacation.id);
            } catch (err) {
                return;
            }

            if (!childTask.start_date || !childTask.end_date) return;

            const pos = gantt.getTaskPosition(
                parentTask,
                childTask.start_date,
                childTask.end_date,
            );

            if (!pos || !pos.width) return;

            const bar = document.createElement('div');
            bar.className =        'gantt_task_line gantt__task-scale gantt__project-vacation-bar';
            bar.style.position = 'absolute';
            bar.style.left = `${pos.left}px`;
            bar.style.top = `${pos.top}px`;
            bar.style.width = `${pos.width}px`;
            bar.style.height = `${pos.height}px`;
            barsArea.appendChild(bar);
        });
    });
}
