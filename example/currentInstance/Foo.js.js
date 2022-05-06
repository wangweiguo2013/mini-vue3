import { h, getCurrentInstance } from '../../lib/mini-vue.esm.js'

export const Foo = {
    setup() {
        console.log('foo', getCurrentInstance())
        return {}
    },
    render() {
        return h('p', {}, 'foo')
    }
}
