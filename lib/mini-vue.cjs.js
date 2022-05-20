'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const EMPTY_OBJ = {};
const isObject = (raw) => {
    return raw !== undefined && raw !== null && typeof raw === 'object';
};
const hasChanged = (value, newValue) => {
    return !Object.is(value, newValue);
};
const capitalize = (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
};
const camelize = (str) => {
    return str.replace(/-\w?/g, (_, c) => {
        return _.slice(1).toUpperCase();
    });
};

let activeEffect;
// 被stop的effect不能被收集依赖
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = [];
        this.isActive = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        // 全局一次只有一个正在执行的effect(vue2中的watcher)
        // if(!this.isActive) return this._fn()
        if (!this.isActive)
            return this._fn();
        activeEffect = this;
        shouldTrack = true;
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.isActive) {
            cleanupEffect(this);
            this.isActive = false;
            if (this.onStop)
                this.onStop();
        }
    }
}
const targetMap = new Map();
const trigger = function (target, key) {
    // 取出该key的依赖
    const depMap = targetMap.get(target);
    const dep = depMap.get(key);
    // 执行依赖
    triggerEffect(dep);
};
//收集依赖
const track = function (target, key) {
    if (!isTracking())
        return;
    // 取出该key的依赖
    let depMap = targetMap.get(target);
    if (!depMap) {
        depMap = new Map();
        targetMap.set(target, depMap);
    }
    let dep = depMap.get(key);
    if (!dep) {
        dep = new Set();
        depMap.set(key, dep);
    }
    trackEffect(dep);
};
const trackEffect = function (dep) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
};
const triggerEffect = function (dep) {
    // 优化
    if (!dep.has(activeEffect))
        return;
    dep.forEach((_effect) => {
        if (_effect.scheduler) {
            _effect.scheduler();
        }
        else {
            _effect.run();
        }
    });
};
const isTracking = function () {
    return shouldTrack && activeEffect !== undefined;
};
const effect = function (fn, options = {}) {
    const _effect = new ReactiveEffect(fn);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    // 挂载到runner上，方便执行stop
    runner._effect = _effect;
    return runner;
};
const cleanupEffect = (effect) => {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    // 可以直接清空effect的deps
    effect.deps.length = 0;
};

const createGetter = function (isReadOnly = false, isShallow = false) {
    return function (target, key) {
        const res = Reflect.get(target, key);
        if (isObject(res) && !isShallow) {
            return isReadOnly ? readonly(res) : reactive(res);
        }
        if (key === "__v_is_reactive" /* IS_REACTIVE */) {
            return !isReadOnly;
        }
        else if (key === "__v_is_readonly" /* IS_READONLY */) {
            return isReadOnly;
        }
        // 收集依赖
        if (!isReadOnly) {
            track(target, key);
        }
        return res;
    };
};
const createSetter = function () {
    return function (target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
};
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key, value) {
        console.warn(`read only object cannot be set, accessing key is ${String(key)}, value is ${value}`, target);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

const reactive = function (raw) {
    return new Proxy(raw, mutableHandlers);
};
const readonly = function (raw) {
    return createActiveObject(raw, readonlyHandlers);
};
const shallowReadonly = function (raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
};
const createActiveObject = function (raw, handler) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} is not object`);
        return;
    }
    return new Proxy(raw, handler);
};

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
const createVnode = (type, props, children) => {
    const vnode = {
        type,
        props: shallowReadonly(props),
        children,
        el: null,
        shapeFlag: getShapeFlag(type)
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 8 /* TEXT_CHILD */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 16 /* ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */ && typeof children === 'object') {
        vnode.shapeFlag |= 32 /* SLOT_CHILDREN */;
    }
    return vnode;
};
const createTextVNode = (text) => {
    return createVnode(Text, {}, text);
};
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ELEMENT */ : 4 /* STATEFUL_COMPONENT */;
}

const h = (type, props, children) => {
    return createVnode(type, props, children);
};

const renderSlots = (slots, slotKey = 'default', props = {}) => {
    const slot = slots[slotKey];
    if (typeof slot === 'function') {
        return createVnode(Fragment, {}, slot(props));
    }
};

class RefImplement {
    constructor(value) {
        this.__v_isRef = true;
        this._value = convert(value);
        this._rawValue = value;
        this.dep = new Set();
    }
    get value() {
        if (isTracking()) {
            trackEffect(this.dep);
        }
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(this._rawValue, newValue)) {
            this._value = convert(newValue);
            this._rawValue = newValue;
            triggerEffect(this.dep);
        }
    }
}
const ref = function (value) {
    return new RefImplement(value);
};
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
const isRef = function (value) {
    return !!value.__v_isRef;
};
const unRef = function (value) {
    return isRef(value) ? value.value : value;
};
const proxyRefs = function (objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, newValue) {
            if (isRef(target[key]) && !isRef(newValue)) {
                return (target[key].value = newValue);
            }
            return Reflect.set(target, key, newValue);
        }
    });
};

const emit = (instance, eventName, ...args) => {
    const { props } = instance;
    const eventKey = 'on' + capitalize(eventName);
    const handler = props[camelize(eventKey)];
    handler && handler(...args);
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 32 /* SLOT_CHILDREN */) {
        normalizeSlotObject(children, instance.slots);
    }
}
const normalizeSlotObject = (children, slots) => {
    for (const key in children) {
        const val = children[key];
        // renderSlots说的时候是函数调用，所以这里需要变成函数
        slots[key] = (props) => normalizeSlotsValues(val(props));
    }
};
const normalizeSlotsValues = (val) => {
    return Array.isArray(val) ? val : [val];
};

const createComponentInstance = (vnode, parent) => {
    const component = {
        vnode,
        type: vnode.type,
        proxy: {},
        emit: () => { },
        slots: {},
        parent,
        isMounted: false,
        subTree: {},
        provides: parent ? parent.provides : {},
        setupState: {}
    };
    console.log('createComponentInstance', component);
    component.emit = emit.bind(null, component);
    return component;
};
const setupComponent = (instance) => {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
};
function setupStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(instance.props, { emit: instance.emit });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
// setup可以返回一个state对象，也可以是一个render函数
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        instance.render = component.render;
    }
}
function initProps(instance, props) {
    instance.props = props;
}
let currentInstance = null;
const setCurrentInstance = (instance) => {
    currentInstance = instance;
};
const getCurrentInstance = () => {
    return currentInstance;
};

const provide = (key, value) => {
    var _a;
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        //初始化provide
        //使用原型链，向上查找父provide的值
        const parentProvides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        // 如果跟父组件一个provides，说明当前组件里没有执行过provide方法，在这里初始化一下  见createComponentInstance方法
        if (provides === parentProvides) {
            // 这两个provides都是对父provides的引用，必须都重新赋值
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
};
const inject = (key, defaultValue) => {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        const hasOwn = (target, key) => {
            return Object.prototype.hasOwnProperty.call(target, key);
        };
        if (hasOwn(setupState, key))
            return setupState[key];
        if (hasOwn(props, key))
            return props[key];
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

const createAppApi = (render) => {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVnode(rootComponent);
                return render(vnode, rootContainer);
            }
        };
    };
};

const createRenderer = (options) => {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, setElementText: hostSetElementText } = options;
    const render = (vnode, container) => {
        patch(null, vnode, container, null);
    };
    /**
     *
     * @param n1 旧的vnode节点
     * @param n2 新的vnode节点
     * @param container 容器
     * @param parentComponent 父组件
     */
    const patch = (n1, n2, container, parentComponent) => {
        console.log('patch');
        const { shapeFlag, type } = n2;
        switch (type) {
            case Text:
                processText(n1, n2, container);
                break;
            case Fragment:
                // 只渲染children，不使用div等元素包裹
                processFragment(n1, n2, container, parentComponent);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    };
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2.children, container, parentComponent);
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(vnode, container, parentComponent) {
        const instance = createComponentInstance(vnode, parentComponent);
        setupComponent(instance);
        //  ctx
        instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance, vnode, container) {
        effect(() => {
            if (!instance.isMounted) {
                console.log('before mount');
                const { proxy } = instance;
                // 组件render返回的vnode
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('update');
                const { proxy } = instance;
                // 组件render返回的vnode
                const subTree = instance.render.call(proxy);
                const preSubTree = instance.subTree;
                console.log('subtree', subTree);
                console.log('presubtree', preSubTree);
                patch(preSubTree, subTree, container, instance);
                // 更新subTree
                instance.subTree = subTree;
            }
        });
    }
    function processElement(n1, n2, container, parentComponent) {
        console.log('process element');
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2, container, parentComponent);
        }
    }
    function patchElement(n1, n2, container, parentComponent) {
        console.log('patch element');
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        // 把n1的el挂载到新的vnode上
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent) {
        const { shapeFlag } = n2;
        const c1 = n1.children;
        const c2 = n2.children;
        // element的children可能是array 和 text两种
        // 如果现在是text，则直接设置文本内容
        if (shapeFlag & 8 /* TEXT_CHILD */) {
            if (c2 !== c1) {
                hostSetElementText(container, c2);
            }
            // if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            //     hostSetElementText(container, '')
            //     mountChildren(c2, container, parentComponent)
            // } else if (shapeFlag & ShapeFlags.TEXT_CHILD) {
            //     if (c2 !== c1) {
            //         hostSetElementText(container, c2)
            //     }
            // }
        }
        else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            hostSetElementText(container, c2);
            hostSetElementText(container, '');
            mountChildren(c2, container, parentComponent);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps === newProps)
            return;
        // 遍历新属性，变化时执行更新
        for (const key in newProps) {
            const preVal = oldProps[key];
            const nextVal = newProps[key];
            if (preVal !== nextVal) {
                hostPatchProp(el, key, preVal, nextVal);
            }
        }
        // 更新被删除的属性
        if (oldProps !== EMPTY_OBJ) {
            for (const key in oldProps) {
                const preVal = oldProps[key];
                const nextVal = newProps[key];
                // 当属性被删除时，交给hostPatchProp删除改属性
                if (nextVal === null || nextVal === undefined) {
                    hostPatchProp(el, key, preVal, nextVal);
                }
            }
        }
    }
    function mountElement(initialVNode, container, parentComponent) {
        // 这里的vnode其实是element的vnode， 而不是组件的vnode
        // 因此不能在这里给el赋值
        const el = (initialVNode.el = hostCreateElement(initialVNode.type));
        const { props, children, shapeFlag } = initialVNode;
        for (const key in props) {
            const value = props[key];
            hostPatchProp(el, key, null, value);
        }
        if (shapeFlag & 8 /* TEXT_CHILD */) {
            el.textContent = children;
        }
        else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            mountChildren(initialVNode.children, el, parentComponent);
        }
        hostInsert(el, container);
    }
    function mountChildren(children, container, parentComponent) {
        children.forEach((v) => {
            patch(null, v, container, parentComponent);
        });
    }
    return {
        createApp: createAppApi(render)
    };
};

const createElement = (type) => {
    return document.createElement(type);
};
const isEvent = (key) => /^on[A-Z]/.test(key);
const patchProp = (el, key, preValue, nextValue) => {
    console.log('update prop, new value is %s, old value is %s', nextValue, preValue);
    if (isEvent(key)) {
        const eventName = key.slice(2).toLocaleLowerCase();
        el.addEventListener(eventName, nextValue);
    }
    else if (nextValue === null || nextValue === undefined) {
        el.removeAttribute(key);
    }
    else {
        el.setAttribute(key, nextValue);
    }
};
const insert = (el, parent) => {
    parent.append(el);
};
const setElementText = (container, text) => {
    container.textContent = text;
};
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    setElementText
});
const createApp = (...args) => {
    return renderer.createApp(...args);
};

exports.createApp = createApp;
exports.createElement = createElement;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.insert = insert;
exports.patchProp = patchProp;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
exports.setElementText = setElementText;
