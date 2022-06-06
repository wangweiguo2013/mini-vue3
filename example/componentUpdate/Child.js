import { h } from '../../lib/mini-vue.esm.js'

export const Child = {
    setup(props, { emit }) {},
    render() {
        return h('p', {}, 'parent msg is ' + this.$props.msg)
    }
}
