const setGanttFormatDate = (date) => {
    const [y, m, d] = date.split('-');
    return new Date(d, m, y);
};
export default setGanttFormatDate;
