const setGanttFormatDate = (date) => {
    const [yyyy, mm, dd] = date.split('-');
    return new Date(dd, mm, yyyy);
};
export default setGanttFormatDate;
