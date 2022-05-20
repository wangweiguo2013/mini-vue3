import { h, ref } from '../../lib/mini-vue.esm.js'

export const ArrayToText = {
    setup() {
        const isChange = ref(false)
        window.isChange = isChange

        return {
            isChange
        }
    },
    render() {
        const children = this.isChange ? 'text' : [h('div', {}, ' A'), h('div', {}, 'B')]
        return h('div', {}, children)
    }
}
