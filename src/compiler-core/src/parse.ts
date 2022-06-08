import { NodeTypes } from './ast'

const enum TagType {
    Start,
    End
}

export const baseParse = (content: string) => {
    const context = createParserContext(content)
    return createRoot(parseChildren(context))
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

function parseChildren(context): any {
    const nodes: any[] = []

    let node
    const s = context.source
    if (s.startsWith('{{')) {
        node = parseInterpolation(context)
    } else if (s[0] === '<') {
        console.log('parse element')
        if (/[a-z]/i.test(s[1])) {
            node = parseElement(context)
        }
    }

    nodes.push(node)

    return nodes
}

function parseElement(context) {
    const element = parseTag(context, TagType.Start)

    parseTag(context, TagType.End)

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

    const rawContent = context.source.slice(0, rawContentLength)
    const content = rawContent.trim()

    advancedBy(context, rawContentLength + closeDelimiter.length)

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
