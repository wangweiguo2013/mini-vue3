import { createTextVNode, h } from '../../lib/mini-vue.esm.js'

export const Foo = {
    setup(props) {
        // props.count
        console.log(props)
        props.count++
    },
    render() {
        return h('div', { class: ['root', 'con'], id: 'root' }, [
            createTextVNode('count is ' + this.count)
        ])
    }
}
