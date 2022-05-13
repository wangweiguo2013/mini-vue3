import { h, ref } from '../../lib/mini-vue.esm.js'

export const App = {
    name: 'app',
    setup() {
        const count = ref(0)
        return {
            count
        }
    },
    render() {
        console.log(this.count)
        return h('div', {}, [
            h('p', {}, 'count is:' + this.count),
            h(
                'button',
                {
                    onClick() {
                        this.count++
                    }
                },
                'add'
            )
        ])
    }
}
