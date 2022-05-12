import { createRenderer } from '../runtime-core'

export const createElement = (type) => {
    return document.createElement(type)
}
const isEvent = (key: string) => /^on[A-Z]/.test(key)

export const patchProp = (el, key, value) => {
    if (isEvent(key)) {
        const eventName = key.slice(2).toLocaleLowerCase()
        el.addEventListener(eventName, value)
    } else {
        el.setAttribute(key, value)
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
