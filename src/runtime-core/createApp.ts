import { render } from './render'
import { createVnode } from './vnode'

export const createApp = (rootComponent) => {
    return {
        mount(rootContainer) {
            const vnode = createVnode(rootComponent)
            render(vnode, rootContainer)
        }
    }
}
