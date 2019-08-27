
const dateToNumberArray = (date) => {
    const [dd, mm, yyyy] = date.toLocaleString('ru').substring(0, 10).split('.');
    return [dd, mm, yyyy];
};
const dateToLocaleString = (date) => {
    const [dd, mm, yyyy] = dateToNumberArray(date);
    return `${dd}-${mm}-${yyyy}`;
};

const dateToString = (date) => {
    const [yyyy, mm, dd] = date.split('-');
    return new Date(dd, +mm - 1, yyyy);
};

const mathFloor = num => Math.floor(num * 100) / 100;

const minToHour = min => mathFloor(min / 60);

export {
    minToHour,
    dateToLocaleString,
    dateToString,
    dateToNumberArray,
};
