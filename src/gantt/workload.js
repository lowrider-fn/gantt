import { gantt } from 'dhtmlx-gantt';
import { dateToLocaleString, dateToString, minToHour } from '@/lib';

export function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function findLoadForCell(task, cellDateStr, stateScale) {
    const loads = task.loads && task.loads[stateScale];
    if (!loads || !loads.length) return null;

    if (stateScale === 'day') {
        return loads.find(l => l.date === cellDateStr) || null;
    }

    const [, cellMm, cellYyyy] = cellDateStr.split('-');

    if (stateScale === 'month') {
        return (
            loads.find((l) => {
                const [, mm, yyyy] = l.date.split('-');
                return mm === cellMm && yyyy === cellYyyy;
            }) || null
        );
    }

    if (stateScale === 'week') {
        const cellWeekStart = dateToLocaleString(
            getWeekStart(dateToString(cellDateStr)),
        );
        return (
            loads.find((l) => {
                const loadWeekStart = dateToLocaleString(
                    getWeekStart(dateToString(l.date)),
                );
                return loadWeekStart === cellWeekStart;
            }) || null
        );
    }

    return null;
}

export function getLoadStatusClass(load, stateScale) {
    if (!load) return 'normal';

    const hours = minToHour(load.time);
    if (stateScale === 'day') {
        if (hours > 7) return 'error';
        if (hours === 7) return 'success';
    } else if (stateScale === 'week') {
        if (hours > 35) return 'error';
        if (hours === 35) return 'success';
    } else if (hours > 170) return 'error';
    else if (hours === 170) return 'success';

    return 'normal';
}

function getCellDateStr(cell) {
    return Array.from(cell.classList).find(className => /^\d{2}-\d{2}-\d{4}$/.test(className));
}

export function bindWorkloadInputs({
    rootEl, stateScale, changes, taskId,
}) {
    if (stateScale !== 'day') return;

    const fields = rootEl.querySelectorAll(`[task_cell_id="${taskId}"]`);
    Array.from(fields).forEach((field) => {
        field.oninput = (e) => {
            e.preventDefault();
            const load = field.value.trim();
            const isCorrectWorkload = /[0-9]$/.test(load) || load === '';

            if (isCorrectWorkload) {
                const date = field.getAttribute('date');
                const editChanges = changes.find((el) => {
                    if (el.id === taskId && el.date === date) {
                        el.load = load;
                        return el;
                    }
                });
                if (!editChanges) changes.push({ id: taskId, date, load });
            } else {
                field.value = '';
            }
        };
        field.ondblclick = e => e.target.removeAttribute('readonly');
        field.onblur = e => e.target.setAttribute('readonly', true);
    });
}

export function renderWorkloadCells({
    rootEl, stateScale, tasksMeta, changes,
}) {
    const rows = rootEl.querySelectorAll('.gantt_task_row');

    Array.from(rows).forEach((row) => {
        const id = row.getAttribute('task_id');
        if (!id) return;

        const task = gantt.getTask(id);
        if (!task || !task.loads) return;

        const isEditableDayCell =      stateScale === 'day'
      && !tasksMeta.readonly
      && task.type === gantt.config.types.task;

        Array.from(row.querySelectorAll('.gantt_task_cell')).forEach((cell) => {
            const cellDateStr = getCellDateStr(cell);
            if (!cellDateStr) return;

            const load = findLoadForCell(task, cellDateStr, stateScale);
            const loadHours = load ? minToHour(load.time) : '';
            const statusClass = getLoadStatusClass(load, stateScale);

            cell.classList.remove('success', 'error', 'normal');
            if (loadHours !== '') cell.classList.add(statusClass);

            if (isEditableDayCell) {
                cell.innerHTML = `<input task_cell_id="${task.id}"
              date="${cellDateStr}"
              value="${loadHours || ''}"
              readonly
              class="js-workload gantt__load-cell ${statusClass}">`;
            } else {
                cell.textContent = loadHours || '';
            }
        });

        if (isEditableDayCell) {
            bindWorkloadInputs({
                rootEl, stateScale, changes, taskId: id,
            });
        }
    });
}
