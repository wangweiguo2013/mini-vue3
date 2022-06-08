import { getCurrentInstance, h, ref, nextTick } from '../../lib/mini-vue.esm.js'

export const App = {
    setup() {
        const count = ref(0)
        const instance = getCurrentInstance()

        const onClick = () => {
            for (let i = 0; i < 99; i++) {
                console.log('update')
                count.value = i
            }

            console.log(instance)
            nextTick(() => {
                console.log(instance)
            })
        }
        return {
            count,
            onClick
        }
    },
    render() {
        window.vm = this
        return h('div', { class: ['root', 'con'], id: 'root' }, [
            h(
                'button',
                {
                    onClick: this.onClick
                },
                '+ +'
            ),
            h(
                'p',
                {
                    style: 'color: red'
                },
                'count is : ' + this.count
            )
        ])
    }
}
