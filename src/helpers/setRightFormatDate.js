const setRightFormatDate = (date) => {
    const [y,m,d] = new Date(date).toISOString().substring(0, 10).split('-');
    return `${d}-${m}-${y}`;
};
export default setRightFormatDate;