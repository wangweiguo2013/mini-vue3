import { h } from '../../lib/mini-vue.esm.js'

export const App = {
    setup() {
        return {
            msg: 'hello mini-vue'
        }
    },
    render() {
        return h('div', { class: ['root', 'con'], id: 'root' }, [
            h('p', { style: 'color: red' }, 'hi'),
            h('p', { style: 'color:blue' }, 'mini - vue')
        ])
    }
}
