export const createElement = (type) => {
    return document.createElement(type)
}

export const patchProps = (params) => {}

export const insert = (el, parent) => {
    parent.append(el)
}

export const createRenderer = {
    createElement,
    patchProps,
    insert
}
