const setRightFormatDate = (date) => {
    const [yyyy, mm, dd] = new Date(date).toISOString().substring(0, 10).split('-');
    return `${dd}-${mm}-${yyyy}`;
};
export default setRightFormatDate;
