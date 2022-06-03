import { h, ref } from '../../lib/mini-vue.esm.js'

// 1. 左侧的对比
// ab(c)
// ab(de)
// const preChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C')
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'E' }, 'E')
// ]
// 2.右侧的对比
// (a)bc
// (de)bc
// const preChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C')
// ]
// const nextChildren = [
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'E' }, 'E'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C')
// ]

// 3. 新的比老的长
// const preChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B')]
// const nextChildren = [
//     h('p', { key: 'C' }, 'C'),
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B')
// ]
// 3. 新的比老的短
// const preChildren = [
//     h('p', { key: 'C' }, 'C'),
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B')
// ]
// const nextChildren = [h('p', { key: 'C' }, 'C'), h('p', { key: 'D' }, 'D')]
// 5. 中间对比
// const preChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C', id: 'pre-c' }, 'C'),
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'F' }, 'F'),
//     h('p', { key: 'G' }, 'G')
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'E' }, 'E'),
//     h('p', { key: 'C', id: 'next-c' }, 'C'),
//     h('p', { key: 'F' }, 'F'),
//     h('p', { key: 'G' }, 'G')
// ]

const preChildren = [
    h('p', { key: 'A' }, 'A'),
    h('p', { key: 'B' }, 'B'),
    h('p', { key: 'C' }, 'C'),
    h('p', { key: 'D' }, 'D'),
    h('p', { key: 'E' }, 'E'),
    h('p', { key: 'F' }, 'F'),
    h('p', { key: 'G' }, 'G')
]

const nextChildren = [
    h('p', { key: 'A' }, 'A'),
    h('p', { key: 'B' }, 'B'),
    h('p', { key: 'E' }, 'E'),
    h('p', { key: 'C' }, 'C'),
    h('p', { key: 'D' }, 'D'),
    h('p', { key: 'F' }, 'F'),
    h('p', { key: 'G' }, 'G')
]

export const ArrayToArray = {
    setup() {
        const isChange = ref(false)
        window.isChange = isChange

        return {
            isChange
        }
    },
    render() {
        const children = this.isChange ? nextChildren : preChildren
        return h('div', {}, children)
    }
}
