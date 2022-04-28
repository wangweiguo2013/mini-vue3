import { h, renderSlots } from '../../lib/mini-vue.esm.js'

export const Foo = {
    setup() {
        return {}
    },
    render() {
        console.log(this.$slots)
        const foo = h('p', {}, 'foo')
        const age = 18
        return h('div', {}, [
            foo,
            renderSlots(this.$slots, 'header', {}),
            renderSlots(this.$slots, 'footer', { age }),
            renderSlots(this.$slots)
        ])
    }
}
