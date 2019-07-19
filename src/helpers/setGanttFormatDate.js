const setGanttFormatDate = (date) => {
    const [yyyy, mm, dd] = date.split('-');
    return new Date(dd, +mm - 1, yyyy);
};
export default setGanttFormatDate;
