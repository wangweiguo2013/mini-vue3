# mini-vue3

一个3.X版本的mini-vue

##
 - reactivity
 - runtime-core
 - runtime-dom
## diff
diff算法是基于前端常见的列表更新这一特殊场景编写的一种更新算法。在更新列表的子节点时，会做三件事：
1. 创建新节点（旧的没有新的有）
2. 删除老节点（旧的有新的没有）
3. 移动节点（新旧都有，但是位置发生了变化）

