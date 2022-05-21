import { createRenderer } from '../runtime-core'

export const createElement = (type) => {
    return document.createElement(type)
}
const isEvent = (key: string) => /^on[A-Z]/.test(key)

export const patchProp = (el, key, preValue, nextValue) => {
    console.log('update prop, new value is %s, old value is %s', nextValue, preValue)
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

export const setElementText = (container, text) => {
    container.textContent = text
}
export const remove = (el) => {
    const parent = el.parentNode
    parent & parent.remove(el)
}

const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert,
    setElementText,
    remove
})

export const createApp = (...args) => {
    return renderer.createApp(...args)
}

export * from '../runtime-core'
