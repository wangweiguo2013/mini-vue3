import { createVnode } from './vnode'

export const h = (type, props?, children?) => {
    return createVnode(type, props, children)
}
