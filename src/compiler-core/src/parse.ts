import { NodeTypes } from './ast'

const enum TagType {
    Start,
    End
}

export const baseParse = (content: string) => {
    const context = createParserContext(content)
    return createRoot(parseChildren(context, []))
}
function createParserContext(content: string) {
    return {
        source: content
    }
}

function createRoot(children) {
    return {
        children
    }
}

/**
 * @param ancestors 祖先元素栈
 */
function parseChildren(context, ancestors): any {
    const nodes: any[] = []

    while (!isEnd(context, ancestors)) {
        let node
        const s = context.source
        if (s.startsWith('{{')) {
            node = parseInterpolation(context)
        } else if (s[0] === '<') {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors)
            }
        }
        if (!node) {
            // 默认为文本
            node = parseText(context)
        }

        nodes.push(node)
    }

    return nodes
}

function isEnd(context, ancestors) {
    const s = context.source
    if (s.startsWith('<')) {
        // 栈使用倒序循环可以提升速度
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag
            if (startsWithEndTagOpen(s, tag)) {
                return true
            }
        }
    }
    return !s
}

function startsWithEndTagOpen(source, tag) {
    const endTagPrefixLength = 2 // </ 的长度
    return (
        source.startsWith('<') &&
        source.slice(endTagPrefixLength, endTagPrefixLength + tag.length).toLowerCase() ===
            tag.toLowerCase()
    )
}

function parseText(context) {
    // 为啥不是length - 1?
    let endIndex = context.source.length
    let endTokens = ['<', '{{'] // 遇到兄弟标签和插值都视作文本结束
    // 解析文本，遇到{{就判定为文本终点
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i])
        // 文本节点最近的一个结束标记，视作endIndex
        if (index !== -1 && endIndex > index) {
            endIndex = index
        }
    }

    const content = parseTextData(context, endIndex)

    return {
        type: NodeTypes.TEXT,
        content
    }
}

function parseElement(context, ancestors) {
    const element: any = parseTag(context, TagType.Start)
    ancestors.push(element)
    element.children = parseChildren(context, ancestors)
    ancestors.pop()

    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, TagType.End)
    } else {
        throw new Error(`缺少结束标签:${element.tag}`)
    }

    return element
}

function parseTag(context, type: TagType) {
    const match: any = /^<\/?([a-z]*)/i.exec(context.source)
    console.log('match', match)
    const tag = match[1]

    advancedBy(context, match[0].length)
    advancedBy(context, 1) //删掉开始标签的闭合符>

    if (type === TagType.End) return
    return {
        type: NodeTypes.ELEMENT,
        tag
    }
}

function parseInterpolation(context) {
    const openDelimiter = '{{'
    const closeDelimiter = '}}'

    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

    advancedBy(context, openDelimiter.length)

    const rawContentLength = closeIndex - openDelimiter.length

    const rawContent = parseTextData(context, rawContentLength)

    const content = rawContent.trim()

    advancedBy(context, closeDelimiter.length)

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content
        }
    }
}

// 解析完的代码，用推进方法删除掉
function advancedBy(context, length) {
    context.source = context.source.slice(length)
}

function parseTextData(context, length) {
    const content = context.source.slice(0, length)
    advancedBy(context, length)
    return content
}
