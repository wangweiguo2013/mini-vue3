import { createRenderer } from '../runtime-core'

export const createElement = (type) => {
    return document.createElement(type)
}
const isEvent = (key: string) => /^on[A-Z]/.test(key)

export const patchProp = (el, key, preValue, nextValue) => {
    if (isEvent(key)) {
        const eventName = key.slice(2).toLocaleLowerCase()
        el.addEventListener(eventName, nextValue)
    } else if (nextValue === null || nextValue === undefined) {
        el.removeAttribute(key)
    } else {
        el.setAttribute(key, nextValue)
    }
}

export const insert = (el, parent) => {
    parent.append(el)
}

const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert
})

export const createApp = (...args) => {
    return renderer.createApp(...args)
}

export * from '../runtime-core'
