import { h, renderSlots } from '../../lib/mini-vue.esm.js'

export const Foo = {
    setup() {
        return {}
    },
    render() {
        console.log(this.$slots)
        const foo = h('p', {}, 'foo')
        return h('div', {}, [foo, renderSlots(this.$slots)])
    }
}
