const setWorkDays = (date,state) => {
    date             = date.getDay();
    const rightState = 'day';
    
    if(state === rightState && (date === 0 || date === 6)) return 'gantt__weekend';
    return 'gantt__workday';
};
export default setWorkDays;