
const querySelectorAll = (attr, root) => {
    const el = root || document;
    return el.querySelectorAll(attr);
};
const querySelector = (attr, root) => {
    const el = root || document;
    return el.querySelector(attr);
};

const getElementsByClassName = (attr, root) => {
    const el = root || document;
    return el.getElementsByClassName(attr);
};
const addClass = (el, className) => el.classList.add(className);

export {

    querySelectorAll,
    getElementsByClassName,
    addClass,
    querySelector,
};

