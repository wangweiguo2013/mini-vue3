export const enum ShapeFlags {
    // dom元素 0001
    ELEMENT = 1,
    // 状态组件 0010
    STATEFUL_COMPONENT = 1 << 1,
    // 文本节点 0100
    TEXT_CHILD = 1 << 2,
    // 1000
    ARRAY_CHILDREN = 1 << 3,
    SLOT_CHILDREN = 1 << 4
}
