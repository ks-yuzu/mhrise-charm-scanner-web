
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const skillToSlotLevel = {
      '無し':               0,

      '龍耐性':             1,
      '氷耐性':             1,
      '雷耐性':             1,
      '水耐性':             1,
      '火耐性':             1,
      '毒耐性':             1,
      '麻痺耐性':           1,
      '睡眠耐性':           1,
      '爆破やられ耐性':     1,
      '植生学':             1,
      '地質学':             1,
      '飛び込み':           1,
      '陽動':               1,
      '泥雪耐性':           1,
      '満足感':             1,
      '腹減り耐性':         1,
      '剥ぎ取り鉄人':       1,
      '防御':               1,
      '龍属性攻撃強化':     1,
      '氷属性攻撃強化':     1,
      '雷属性攻撃強化':     1,
      '水属性攻撃強化':     1,
      '火属性攻撃強化':     1,
      'ボマー':             1,
      '滑走強化':           1,
      '毒属性強化':         1,
      'スタミナ奪取':       1,
      '笛吹き名人':         1,
      '回復速度':           1,
      '砥石使用高速化':     1,
      '風圧耐性':           1,
      'ひるみ軽減':         1,
      'ブレ抑制':           1,
      '気絶耐性':           1,
      '装填速度':           1,
      '反動軽減':           1,

      '不屈':               2,
      '乗り名人':           2,
      '体術':               2,
      '体力回復量UP':       2,
      'アイテム使用強化':   2,
      '翔蟲使い':           2,
      '壁面移動':           2,
      '精霊の加護':         2,
      '早食い':             2,
      '属性やられ耐性':     2,
      '破壊王':             2,
      '広域化':             2,
      'KO術':               2,
      '納刀術':             2,
      '回避性能':           2,
      '回避距離UP':         2,
      '抜刀術【力】':       2,
      '泡沫の舞':           2,
      '逆襲':               2,
      '耐震':               2,
      '鈍器使い':           2,
      '高速変形':           2,
      '見切り':             2,
      '攻撃':               2,
      '渾身':               2,
      '強化持続':           2,
      'スタミナ急速回復':   2,
      'ガード性能':         2,
      'ガード強化':         2,
      '砲弾装填':           2,
      '特殊射撃強化':       2,
      '火事場力':           2,
      '心眼':               2,
      '集中':               2,
      'ランナー':           2,
      '砲術':               2,
      '会心撃【属性】':     2,
      '弾導強化':           2,
      '超会心':             2,
      '弱点特効':           2,
      '挑戦者':             2,
      'フルチャージ':       2,
      '逆恨み':             2,
      '死中に活':           2,
      '力の解放':           2,
      '麻痺属性強化':       2,
      '睡眠属性強化':       2,
      '爆破属性強化':       2,
      '剛刃研磨':           2,
      '業物':               2,
      '弾丸節約':           2,
      '達人芸':             2,

      '耳栓':               3,
      '抜刀術【技】':       3,
      'キノコ大好き':       3,
      '攻めの守勢':         3,
      '装填拡張':           3,
      '通常弾・連射矢強化': 3,
      '貫通弾・貫通矢強化': 3,
      '散弾・拡散矢強化':   3,
      '速射強化':           3,
      'ジャンプ鉄人':       3,
      '鬼火纏':             3,
      '幸運':               3,
      '匠':                 3,
    };

    class MHRiseCharmManager {
      MAX_SKILLS = 2
      MAX_SLOTS  = 3

      db        = null              // WebSQL
      indexeddb = null              // IndexedDB

      constructor() {
        this.db = openDatabase('mhrise-charm-manager', '', 'MHRise charm manager', 5000);
        this._createTable();
        this.sql(`alter table charms add column imagename varchar(128)`).catch(() => {}); // for old schema

        this.indexeddb = new Dexie('charms');
        this.indexeddb.version(1).stores({images: 'name'});
      }


      sql(query, placeholderValues) {
        return new Promise((resolve, reject) => {
          this.db.transaction(
            tx => tx.executeSql(
              query,
              placeholderValues,
              (tx, result) => resolve({tx, result}),
              (...args) => reject(args)
            )
          );
        })
      }


      async reset() {
        await this.sql('drop table if exists charms');
        await this._createTable();
      }


      async registerCharms(charms) {
        const values = charms
          .map(c => `("${c.skills[0]}", ${c.skillLevels[0]}, "${c.skills[1]}", ${c.skillLevels[1]}, ${c.slots.replace(/-/g, ', ')}, "${c.imageName}")`)
          .join(',\n');

        console.log(values);
        await this.sql(`insert or ignore into charms values ${values}`);
      }


      async searchCharms(query) {
        const {tx, result} = await this.sql(query);
        return result.rows
      }


      async _createTable() {
        await this.sql(`create table if not exists charms(
               skill1      varchar(20),
               skill1Level int,
               skill2      varchar(20),
               skill2Level int,
               slot1       int,
               slot2       int,
               slot3       int,
               imagename   varchar(128),
               unique (skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3))`);

        await this.sql(`create index if not exists 'charms.skill1' on charms(skill1, skill1Level)`);
        await this.sql(`create index if not exists 'charms.skill2' on charms(skill2, skill2Level)`);
        await this.sql(`create index if not exists 'charms.slots' on charms(slot1, slot2, slot3)`);
      }


      async getScreenshot(name) {
        const result = await this.indexeddb.images.get(name);
        const img = cv.matFromArray(result.rows, result.cols, result.type, result.data);

        return img
      }


      async findSubstitutableCharms(charm) {
        // interface Charm {
        //   skills:      string[]
        //   skillLevels: number[]
        //   slots:       number[]
        // }
        const sl = [];
        const substitutableCharms = [];

        for (sl[0] = charm.skillLevels[0]; sl[0] >= 0; sl[0]--) {
          for (sl[1] = charm.skillLevels[1]; sl[1] >= 0; sl[1]--) {
            // console.log(sl[0], sl[1])
            // 装飾品で実現するスキルレベル
            const skillLevelsRequiredInDecorations = [...Array(this.MAX_SKILLS).keys()].map(i => charm.skillLevels[i] - sl[i]);

            // スキル用の要求スロット数
            const slotRequirementForSkill = skillLevelsRequiredInDecorations.reduce(((a, b) => a + b), 0);

            // 装飾品の要求スロット数 + charm のスロット数 > 3 なら実現不可能
            if ( slotRequirementForSkill + charm.slots.filter(i => i).length > this.MAX_SLOTS ) {
              // それ以上 sl (=スキル要求) を減らして探索しても意味がない
              break
            }

            const requiredSlots = [
              ...charm.slots,
              ...Array.from( {length: skillLevelsRequiredInDecorations[0]}, () => skillToSlotLevel[charm.skills[0]] ),
              ...Array.from( {length: skillLevelsRequiredInDecorations[1]}, () => skillToSlotLevel[charm.skills[1]] ),
            ].filter(i => i).sort().reverse();

            // conbination にしないといけない
            const skill1Constraints = sl[0] ? `(skill1 = '${charm.skills[0]}' and skill1Level >= ${sl[0]})` : '';
            const skill2Constraints = sl[1] ? `(skill2 = '${charm.skills[1]}' and skill2Level >= ${sl[1]})` : '';
            const skillConstraints = [skill1Constraints, skill2Constraints].filter(i => i).join(' and ');

            const skill1ConstraintsRev = sl[1] ? `(skill1 = '${charm.skills[1]}' and skill1Level >= ${sl[1]})` : '';
            const skill2ConstraintsRev = sl[0] ? `(skill2 = '${charm.skills[0]}' and skill2Level >= ${sl[0]})` : '';
            const skillConstraintsRev  = [skill1ConstraintsRev, skill2ConstraintsRev].filter(i => i).join(' and ');

            const sc = skillConstraints.length
                  ? '(' + [`(${skillConstraints})`, `(${skillConstraintsRev})`].filter(i => i).join(' or ') + ') and '
                  : '';

            const query =`select rowid,* from charms where ${sc} slot1 >= ${requiredSlots[0] || 0} and slot2 >= ${requiredSlots[1] || 0} and slot3 >= ${requiredSlots[2] || 0}`;
            // console.log(query)
            const {result} = await this.sql(query);
            // console.log(result.rows)

            substitutableCharms.push(
              ...[...result.rows].filter(i => !this._isSameCharm(this._row2obj(i), charm))
            );
            // TODO: 合計スキルレベルの条件 (WebSQL 用) は必要？
          }
        }

        return substitutableCharms.sort((a, b) => (a.rowid < b.rowid) ? -1 : (a.rowid > b.rowid) ? 1 : 0)
      }

      // TODO: charm class 作ってコンストラクタでやる
      _row2obj(row) {
        return {
          skills:      [row.skill1, row.skill2],
          skillLevels: [row.skill1Level, row.skill2Level],
          slots:       [row.slot1, row.slot2, row.slot3],
        }
      }

      _isSameCharm(a, b) {
        return JSON.stringify(a) === JSON.stringify(b)
      }
    }

    function fetchImage(path) {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = path;

        img.onload = () => {
          // console.log(`fetched ${path}`)
          const imgmat = cv.imread(img);
    	    resolve(imgmat);
        };
      })
    }


    function countImageDiffAtPoint(image, templateImage, point, maskBinaryThreshold, diffBinaryThreshold) {
      const size = new cv.Size(templateImage.cols, templateImage.rows);
      const rect = new cv.Rect(point, size);
      const trimmed = image.roi(rect);

      const templateMask = new cv.Mat();
      cv.threshold(templateImage, templateMask, maskBinaryThreshold, 255, cv.THRESH_BINARY);

      const masked = new cv.Mat();
      trimmed.copyTo(masked, templateMask);

      const diff = new cv.Mat();
      cv.absdiff(templateImage, masked, diff);
      cv.cvtColor(diff, diff, cv.COLOR_BGR2GRAY);

      const result = new cv.Mat();
      cv.threshold(diff, result, diffBinaryThreshold, 255, cv.THRESH_BINARY);
      // // cv::imwrite("./tmp/debug.png", diff); // for debug

      diff.delete();
      masked.delete();
      templateMask.delete();
      trimmed.delete();

      return result;
    }


    function getMostMatchedImage(image, templates, point, maskBinaryThreshold = 63, diffBinaryThreshold = 63, debug = ()=>{}) {
      let minDiffCount = Number.MAX_SAFE_INTEGER;
      let candidate = null;

      // console.log(templates)
      for (const [name, template] of Object.entries(templates)) {
        const diff = countImageDiffAtPoint(image, template, point, maskBinaryThreshold, diffBinaryThreshold);
        debug(diff, name);
        const diffCount = cv.countNonZero(diff);

        if ( minDiffCount > diffCount ) {
          minDiffCount = diffCount;
          candidate = name;
        }

        diff.delete();
      }

      return candidate;
    }



    function promiseAllRecursive(value) {
      if (value instanceof Promise) {
        return value
      }

      if (Array.isArray(value)) {
        return Promise.all(value.map(promiseAllRecursive))
      }

      if (typeof value === 'object') {
        return resolveObject(value)
      }

      return Promise.resolve(value)
    }

    function resolveObject(object) {
      const promises = Object.keys(object).map(key => {
        return promiseAllRecursive(object[key]).then(value => ({ key, value }))
      });

      return Promise.all(promises).then(results => {
        return results.reduce((obj, pair) => {
          obj[pair.key] = pair.value;
          return obj
        }, {})
      })
    }

    // import moment from 'moment'

    class MHRiseCharmScanner {
      MAX_PAGE = 34
      COLUMNS_PER_PAGE = 10
      ROWS_PER_PAGE    = 5

      POINT_RARITY       = new cv.Point(1190, 176)
      POINT_SLOTS        = new cv.Point(1160, 200)
      POINT_SKILL1       = new cv.Point(1033, 266)
      POINT_SKILL2       = new cv.Point(1033, 317)
      POINT_SKILL_LEVEL1 = new cv.Point(1190, 290)
      POINT_SKILL_LEVEL2 = new cv.Point(1190, 340)
      POINT_PAGE         = new cv.Point(787, 582)

      POINT_CHARM_AREA_LEFT_TOP = new cv.Point(634, 359)
      SIZE_CHARM_AREA           = new cv.Size(357, 199)

      indexeddb = null
      nCharms = 0
      charms = {}
      templates = null

      // page = -1
      // col = -1
      // row = -1

      async init() {
        this.templates = {
          frame: fetchImage('img/templates/frame.png'),
          rare: {
            7:                    fetchImage('img/templates/rare/7.jpg'),
            6:                    fetchImage('img/templates/rare/6.jpg'),
            5:                    fetchImage('img/templates/rare/5.jpg'),
            4:                    fetchImage('img/templates/rare/4.jpg'),
          },
          lvl: {
            0:                    fetchImage('img/templates/lvl/0.jpg'),
            1:                    fetchImage('img/templates/lvl/1.jpg'),
            2:                    fetchImage('img/templates/lvl/2.jpg'),
            3:                    fetchImage('img/templates/lvl/3.jpg'),
            4:                    fetchImage('img/templates/lvl/4.jpg'),
            5:                    fetchImage('img/templates/lvl/5.jpg'),
          },
          slot: {
            '0-0-0':              fetchImage('img/templates/slot/0.jpg'),
            '1-0-0':              fetchImage('img/templates/slot/1.jpg'),
            '1-1-0':              fetchImage('img/templates/slot/11.jpg'),
            '1-1-1':              fetchImage('img/templates/slot/111.jpg'),
            '2-0-0':              fetchImage('img/templates/slot/2.jpg'),
            '2-1-0':              fetchImage('img/templates/slot/21.jpg'),
            '2-1-1':              fetchImage('img/templates/slot/211.jpg'),
            '2-2-0':              fetchImage('img/templates/slot/22.jpg'),
            '2-2-1':              fetchImage('img/templates/slot/221.jpg'),
            '3-0-0':              fetchImage('img/templates/slot/3.jpg'),
            '3-1-0':              fetchImage('img/templates/slot/31.jpg'),
            '3-1-1':              fetchImage('img/templates/slot/311.jpg'),
            '3-2-0':              fetchImage('img/templates/slot/32.jpg'),
            '3-2-1':              fetchImage('img/templates/slot/321.jpg'),
          },
          skill: {
            'KO術':               fetchImage('img/templates/skill/KO術.jpg'),
            '匠':                 fetchImage('img/templates/skill/匠.jpg'),
            '不屈':               fetchImage('img/templates/skill/不屈.jpg'),
            '体術':               fetchImage('img/templates/skill/体術.jpg'),
            '幸運':               fetchImage('img/templates/skill/幸運.jpg'),
            '心眼':               fetchImage('img/templates/skill/心眼.jpg'),
            '攻撃':               fetchImage('img/templates/skill/攻撃.jpg'),
            '業物':               fetchImage('img/templates/skill/業物.jpg'),
            '渾身':               fetchImage('img/templates/skill/渾身.jpg'),
            '無し':               fetchImage('img/templates/skill/無し.jpg'),
            '砲術':               fetchImage('img/templates/skill/砲術.jpg'),
            '耐震':               fetchImage('img/templates/skill/耐震.jpg'),
            '耳栓':               fetchImage('img/templates/skill/耳栓.jpg'),
            '逆襲':               fetchImage('img/templates/skill/逆襲.jpg'),
            '防御':               fetchImage('img/templates/skill/防御.jpg'),
            '陽動':               fetchImage('img/templates/skill/陽動.jpg'),
            '集中':               fetchImage('img/templates/skill/集中.jpg'),
            'ボマー':             fetchImage('img/templates/skill/ボマー.jpg'),
            '地質学':             fetchImage('img/templates/skill/地質学.jpg'),
            '広域化':             fetchImage('img/templates/skill/広域化.jpg'),
            '挑戦者':             fetchImage('img/templates/skill/挑戦者.jpg'),
            '早食い':             fetchImage('img/templates/skill/早食い.jpg'),
            '植生学':             fetchImage('img/templates/skill/植生学.jpg'),
            '毒耐性':             fetchImage('img/templates/skill/毒耐性.jpg'),
            '水耐性':             fetchImage('img/templates/skill/水耐性.jpg'),
            '氷耐性':             fetchImage('img/templates/skill/氷耐性.jpg'),
            '満足感':             fetchImage('img/templates/skill/満足感.jpg'),
            '火耐性':             fetchImage('img/templates/skill/火耐性.jpg'),
            '破壊王':             fetchImage('img/templates/skill/破壊王.jpg'),
            '納刀術':             fetchImage('img/templates/skill/納刀術.jpg'),
            '見切り':             fetchImage('img/templates/skill/見切り.jpg'),
            '超会心':             fetchImage('img/templates/skill/超会心.jpg'),
            '逆恨み':             fetchImage('img/templates/skill/逆恨み.jpg'),
            '達人芸':             fetchImage('img/templates/skill/達人芸.jpg'),
            '雷耐性':             fetchImage('img/templates/skill/雷耐性.jpg'),
            '鬼火纏':             fetchImage('img/templates/skill/鬼火纏.jpg'),
            '龍耐性':             fetchImage('img/templates/skill/龍耐性.jpg'),
            'ブレ抑制':           fetchImage('img/templates/skill/ブレ抑制.jpg'),
            'ランナー':           fetchImage('img/templates/skill/ランナー.jpg'),
            '乗り名人':           fetchImage('img/templates/skill/乗り名人.jpg'),
            '剛刃研磨':           fetchImage('img/templates/skill/剛刃研磨.jpg'),
            '力の解放':           fetchImage('img/templates/skill/力の解放.jpg'),
            '反動軽減':           fetchImage('img/templates/skill/反動軽減.jpg'),
            '回復速度':           fetchImage('img/templates/skill/回復速度.jpg'),
            '回避性能':           fetchImage('img/templates/skill/回避性能.jpg'),
            '壁面移動':           fetchImage('img/templates/skill/壁面移動.jpg'),
            '弱点特効':           fetchImage('img/templates/skill/弱点特効.jpg'),
            '強化持続':           fetchImage('img/templates/skill/強化持続.jpg'),
            '弾丸節約':           fetchImage('img/templates/skill/弾丸節約.jpg'),
            '弾導強化':           fetchImage('img/templates/skill/弾導強化.jpg'),
            '死中に活':           fetchImage('img/templates/skill/死中に活.jpg'),
            '気絶耐性':           fetchImage('img/templates/skill/気絶耐性.jpg'),
            '泡沫の舞':           fetchImage('img/templates/skill/泡沫の舞.jpg'),
            '泥雪耐性':           fetchImage('img/templates/skill/泥雪耐性.jpg'),
            '滑走強化':           fetchImage('img/templates/skill/滑走強化.jpg'),
            '火事場力':           fetchImage('img/templates/skill/火事場力.jpg'),
            '睡眠耐性':           fetchImage('img/templates/skill/睡眠耐性.jpg'),
            '砲弾装填':           fetchImage('img/templates/skill/砲弾装填.jpg'),
            '翔蟲使い':           fetchImage('img/templates/skill/翔蟲使い.jpg'),
            '装填拡張':           fetchImage('img/templates/skill/装填拡張.jpg'),
            '装填速度':           fetchImage('img/templates/skill/装填速度.jpg'),
            '速射強化':           fetchImage('img/templates/skill/速射強化.jpg'),
            '鈍器使い':           fetchImage('img/templates/skill/鈍器使い.jpg'),
            '風圧耐性':           fetchImage('img/templates/skill/風圧耐性.jpg'),
            '飛び込み':           fetchImage('img/templates/skill/飛び込み.jpg'),
            '高速変形':           fetchImage('img/templates/skill/高速変形.jpg'),
            '麻痺耐性':           fetchImage('img/templates/skill/麻痺耐性.jpg'),
            '回避距離UP':         fetchImage('img/templates/skill/回避距離UP.jpg'),
            'ひるみ軽減':         fetchImage('img/templates/skill/ひるみ軽減.jpg'),
            'ガード強化':         fetchImage('img/templates/skill/ガード強化.jpg'),
            'ガード性能':         fetchImage('img/templates/skill/ガード性能.jpg'),
            '攻めの守勢':         fetchImage('img/templates/skill/攻めの守勢.jpg'),
            '毒属性強化':         fetchImage('img/templates/skill/毒属性強化.jpg'),
            '笛吹き名人':         fetchImage('img/templates/skill/笛吹き名人.jpg'),
            '精霊の加護':         fetchImage('img/templates/skill/精霊の加護.jpg'),
            '腹減り耐性':         fetchImage('img/templates/skill/腹減り耐性.jpg'),
            '体力回復量UP':       fetchImage('img/templates/skill/体力回復量UP.jpg'),
            'キノコ大好き':       fetchImage('img/templates/skill/キノコ大好き.jpg'),
            'ジャンプ鉄人':       fetchImage('img/templates/skill/ジャンプ鉄人.jpg'),
            'スタミナ奪取':       fetchImage('img/templates/skill/スタミナ奪取.jpg'),
            'フルチャージ':       fetchImage('img/templates/skill/フルチャージ.jpg'),
            '剥ぎ取り鉄人':       fetchImage('img/templates/skill/剥ぎ取り鉄人.jpg'),
            '抜刀術【力】':       fetchImage('img/templates/skill/抜刀術【力】.jpg'),
            '抜刀術【技】':       fetchImage('img/templates/skill/抜刀術【技】.jpg'),
            '爆破属性強化':       fetchImage('img/templates/skill/爆破属性強化.jpg'),
            '特殊射撃強化':       fetchImage('img/templates/skill/特殊射撃強化.jpg'),
            '睡眠属性強化':       fetchImage('img/templates/skill/睡眠属性強化.jpg'),
            '麻痺属性強化':       fetchImage('img/templates/skill/麻痺属性強化.jpg'),
            '会心撃【属性】':     fetchImage('img/templates/skill/会心撃【属性】.jpg'),
            '属性やられ耐性':     fetchImage('img/templates/skill/属性やられ耐性.jpg'),
            '水属性攻撃強化':     fetchImage('img/templates/skill/水属性攻撃強化.jpg'),
            '氷属性攻撃強化':     fetchImage('img/templates/skill/氷属性攻撃強化.jpg'),
            '火属性攻撃強化':     fetchImage('img/templates/skill/火属性攻撃強化.jpg'),
            '爆破やられ耐性':     fetchImage('img/templates/skill/爆破やられ耐性.jpg'),
            '砥石使用高速化':     fetchImage('img/templates/skill/砥石使用高速化.jpg'),
            '雷属性攻撃強化':     fetchImage('img/templates/skill/雷属性攻撃強化.jpg'),
            '龍属性攻撃強化':     fetchImage('img/templates/skill/龍属性攻撃強化.jpg'),
            'アイテム使用強化':   fetchImage('img/templates/skill/アイテム使用強化.jpg'),
            'スタミナ急速回復':   fetchImage('img/templates/skill/スタミナ急速回復.jpg'),
            '散弾・拡散矢強化':   fetchImage('img/templates/skill/散弾・拡散矢強化.jpg'),
            '貫通弾・貫通矢強化': fetchImage('img/templates/skill/貫通弾・貫通矢強化.jpg'),
            '通常弾・連射矢強化': fetchImage('img/templates/skill/通常弾・連射矢強化.jpg'),
          },
        };

        this.templates.page = {};
        for (let i = 1; i <= this.MAX_PAGE; i++) {
          this.templates.page[i] = fetchImage(`img/templates/page/${i}.png`);
        }

        this.templates = await promiseAllRecursive(this.templates);
        this.reset();

        this.indexeddb = new Dexie('charms');
        this.indexeddb.version(1).stores({images: 'name'});
      }

      reset() {
        this.nCharms = 0;
        this.charms = {};
        for (let p = 1; p <= this.MAX_PAGE; p++) {
          this.charms[p] = {};
          for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
            this.charms[p][r] = {};
          }
        }
      }

      isScaned(page, row, col) {
        return this.charms[page][row][col] != null
      }

      store(charmData, metadata) {
        const {page, row, col} = charmData;
        const {screenshot, movieName} = metadata;

        const name = `${movieName}_${page}-${row}-${col}`;
        // console.log({movieName, row, col})

        this.indexeddb.images.put({
          name,
          rows: screenshot.rows,
          cols: screenshot.cols,
          type: screenshot.type(),
          data: screenshot.data.slice(0),
        });
        this.charms[page][row][col] = {...charmData, imageName: name};
        this.nCharms++;
      }

      scan(screenshot, movieName) {
        const page          = this._getCurrentPage(screenshot);
        const [pos, match]  = this._getCurrentCharmPos(screenshot);

        if ( match < 0.35 ) {
          // 放置すると blink するので一致度が低い時はスキップ
          // console.log(`low match degress ${match} for charm position searching. skip`)
          return null
        }

        const [col, row]    = pos;
        // this.page = page; this.col = col; this.row = row
        if (this.isScaned(page, row, col)) {
          // console.log(`this charm is already scanned. skip: p${page} (${row}, ${col})`);
          return null
        }

        const rarity        = this._getRarity(screenshot);
        const slots         = this._getSlots(screenshot);
        const skills        = this._getSkills(screenshot);
        const skillLevels   = this._getSkillLevels(screenshot);

        // console.log(`scaned ${row} ${col}`)

        // console.log({col, row, match, page, rarity, slots, skills, skillLevels})
        this.store({page, row, col, rarity, slots, skills, skillLevels}, {screenshot, movieName});
      }

      countCharms() {
        return this.nCharms
      }

      generateInsertScript() {
        const buf = [];

        for (let p = 1; p <= this.MAX_PAGE; p++) {
          for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
            for (let c = 1; c <= this.COLUMNS_PER_PAGE; c++) {
              const charm = this.charms[p][r][c];
              if ( charm == null ) { continue }

              // console.log(`${charm.slots} ${charm.skills[0]} ${charm.skillLevels[0]} ${charm.skills[1]} ${charm.skillLevels[1]}`)
              buf.push({
                "第一スキル":         charm.skills[0],
                "第一スキルポイント": charm.skillLevels[0],
                "第二スキル":         charm.skills[1],
                "第二スキルポイント": charm.skillLevels[1],
                "スロット":           charm.slots,
              });
            }
          }
        }

        return `const inputs = ${JSON.stringify(buf)}

eval( await (await fetch('https://code.jquery.com/jquery-3.6.0.slim.min.js')).text() )

for (const input of inputs) {
  Object.entries(input).forEach(([key, value]) => {
    \$(\`select[aria-label="\${key}"]\`).val(value)
    \$(\`select[aria-label="\${key}"]\`)[0].dispatchEvent(new Event('change', { bubbles: true }))
  })

  \$('button:contains("追加")').click()
}`
      }

      exportAsText() {
        const buf = [];

        for (let p = 1; p <= this.MAX_PAGE; p++) {
          for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
            for (let c = 1; c <= this.COLUMNS_PER_PAGE; c++) {
              const charm = this.charms[p][r][c];
              if ( charm == null ) { continue }

              buf.push(`${charm.skills[0]},${charm.skillLevels[0]},${charm.skills[1]},${charm.skillLevels[1]},${charm.slots.replace(/-/g, ',')}`);
            }
          }
        }

        return buf.join('\n')
      }

      getCharms() {
        const buf = [];

        for (let p = 1; p <= this.MAX_PAGE; p++) {
          for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
            for (let c = 1; c <= this.COLUMNS_PER_PAGE; c++) {
              const charm = this.charms[p][r][c];
              if ( charm == null ) { continue }

              buf.push(charm);
            }
          }
        }

        return buf
      }

      _getRarity(screenshot) {
        return getMostMatchedImage(screenshot, this.templates.rare, this.POINT_RARITY, 63, 63)
      }

      _getSlots(screenshot) {
        return getMostMatchedImage(screenshot, this.templates.slot, this.POINT_SLOTS, 0, 63)
      }

      _getSkills(screenshot) {
        return [
          getMostMatchedImage(screenshot, this.templates.skill, this.POINT_SKILL1, 0, 63),
          getMostMatchedImage(screenshot, this.templates.skill, this.POINT_SKILL2, 0, 63),
        ]
      }

      _getSkillLevels(screenshot) {
        // const debug = (this.page === "1" && this.row === 1 && this.col === 7)
        //       ? ((diff, name) => { console.log(`debug${name}`); cv.imshow(document.getElementById(`debug${name}`), diff) })
        //       : (() => {})

        return [
          getMostMatchedImage(screenshot, this.templates.lvl, this.POINT_SKILL_LEVEL1, 0, 127),
          getMostMatchedImage(screenshot, this.templates.lvl, this.POINT_SKILL_LEVEL2, 0, 127),
        ]
      }

      _getCurrentPage(screenshot) {
        return getMostMatchedImage(screenshot, this.templates.page, this.POINT_PAGE, 31, 63)
      }


      _getCurrentCharmPos(screenshot) {
        const rect = new cv.Rect(this.POINT_CHARM_AREA_LEFT_TOP, this.SIZE_CHARM_AREA);
        const trimmed = screenshot.roi(rect);

        const result = new cv.Mat();
        cv.matchTemplate(trimmed, this.templates.frame, result, cv.TM_CCOEFF_NORMED);

        const {maxLoc, maxVal} = cv.minMaxLoc(result);
        // console.log({maxVal, maxLoc})

        result.delete();
        trimmed.delete();

        return [
          [
            1 + Math.floor(0.5 + maxLoc.x / 36.0),
            1 + Math.floor(0.5 + maxLoc.y / 41.0),
          ],
          maxVal,
        ]
      }
    }

    /* src/Hamburger.svelte generated by Svelte v3.38.2 */

    const file$g = "src/Hamburger.svelte";

    function create_fragment$i(ctx) {
    	let div;
    	let label;
    	let input;
    	let t;
    	let svg;
    	let circle;
    	let path0;
    	let path1;
    	let path2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			input = element("input");
    			t = space();
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "svelte-vpaeku");
    			add_location(input, file$g, 7, 4, 95);
    			attr_dev(circle, "cx", "50");
    			attr_dev(circle, "cy", "50");
    			attr_dev(circle, "r", "30");
    			attr_dev(circle, "class", "svelte-vpaeku");
    			add_location(circle, file$g, 9, 6, 214);
    			attr_dev(path0, "class", "line--1 svelte-vpaeku");
    			attr_dev(path0, "d", "M0 55l14-10c4.7-3.3 9-5 13-5h72");
    			add_location(path0, file$g, 10, 6, 254);
    			attr_dev(path1, "class", "line--2 svelte-vpaeku");
    			attr_dev(path1, "d", "M0 50h99");
    			add_location(path1, file$g, 11, 6, 321);
    			attr_dev(path2, "class", "line--3 svelte-vpaeku");
    			attr_dev(path2, "d", "M0 45l14 10c4.7 3.3 9 5 13 5h72");
    			add_location(path2, file$g, 12, 6, 365);
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$g, 8, 4, 145);
    			attr_dev(label, "class", "svelte-vpaeku");
    			add_location(label, file$g, 6, 2, 83);
    			attr_dev(div, "class", "menu toggle-back svelte-vpaeku");
    			add_location(div, file$g, 5, 0, 50);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, input);
    			input.checked = /*isOpen*/ ctx[0];
    			append_dev(label, t);
    			append_dev(label, svg);
    			append_dev(svg, circle);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isOpen*/ 1) {
    				input.checked = /*isOpen*/ ctx[0];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hamburger", slots, []);
    	let { isOpen = false } = $$props;
    	const writable_props = ["isOpen"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hamburger> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		isOpen = this.checked;
    		$$invalidate(0, isOpen);
    	}

    	$$self.$$set = $$props => {
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    	};

    	$$self.$capture_state = () => ({ isOpen });

    	$$self.$inject_state = $$props => {
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isOpen, input_change_handler];
    }

    class Hamburger extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { isOpen: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hamburger",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get isOpen() {
    		throw new Error("<Hamburger>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Hamburger>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/LightboxThumbnail.svelte generated by Svelte v3.38.2 */
    const file$f = "node_modules/svelte-lightbox/src/LightboxThumbnail.svelte";

    function create_fragment$h(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*thumbnailClasses*/ ctx[0]) + " svelte-1u332e1"));
    			attr_dev(div0, "style", /*thumbnailStyle*/ ctx[1]);
    			toggle_class(div0, "svelte-lightbox-unselectable", /*protect*/ ctx[2]);
    			add_location(div0, file$f, 10, 4, 290);
    			attr_dev(div1, "class", "clickable svelte-1u332e1");
    			add_location(div1, file$f, 9, 0, 225);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*thumbnailClasses*/ 1 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*thumbnailClasses*/ ctx[0]) + " svelte-1u332e1"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*thumbnailStyle*/ 2) {
    				attr_dev(div0, "style", /*thumbnailStyle*/ ctx[1]);
    			}

    			if (dirty & /*thumbnailClasses, protect*/ 5) {
    				toggle_class(div0, "svelte-lightbox-unselectable", /*protect*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LightboxThumbnail", slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { thumbnailClasses = "" } = $$props;
    	let { thumbnailStyle = "" } = $$props;
    	let { protect = false } = $$props;
    	const writable_props = ["thumbnailClasses", "thumbnailStyle", "protect"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LightboxThumbnail> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("click");

    	$$self.$$set = $$props => {
    		if ("thumbnailClasses" in $$props) $$invalidate(0, thumbnailClasses = $$props.thumbnailClasses);
    		if ("thumbnailStyle" in $$props) $$invalidate(1, thumbnailStyle = $$props.thumbnailStyle);
    		if ("protect" in $$props) $$invalidate(2, protect = $$props.protect);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		thumbnailClasses,
    		thumbnailStyle,
    		protect
    	});

    	$$self.$inject_state = $$props => {
    		if ("thumbnailClasses" in $$props) $$invalidate(0, thumbnailClasses = $$props.thumbnailClasses);
    		if ("thumbnailStyle" in $$props) $$invalidate(1, thumbnailStyle = $$props.thumbnailStyle);
    		if ("protect" in $$props) $$invalidate(2, protect = $$props.protect);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		thumbnailClasses,
    		thumbnailStyle,
    		protect,
    		dispatch,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class LightboxThumbnail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			thumbnailClasses: 0,
    			thumbnailStyle: 1,
    			protect: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightboxThumbnail",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get thumbnailClasses() {
    		throw new Error("<LightboxThumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnailClasses(value) {
    		throw new Error("<LightboxThumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbnailStyle() {
    		throw new Error("<LightboxThumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnailStyle(value) {
    		throw new Error("<LightboxThumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get protect() {
    		throw new Error("<LightboxThumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set protect(value) {
    		throw new Error("<LightboxThumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* node_modules/svelte-lightbox/src/Modal/LightboxHeader.svelte generated by Svelte v3.38.2 */
    const file$e = "node_modules/svelte-lightbox/src/Modal/LightboxHeader.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let button;
    	let t;
    	let button_class_value;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t = text("×");
    			attr_dev(button, "size", /*size*/ ctx[0]);
    			attr_dev(button, "style", /*style*/ ctx[1]);
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*buttonClasses*/ ctx[3]) + " svelte-12yipzn"));
    			add_location(button, file$e, 11, 4, 304);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("svelte-lightbox-header " + /*headerClasses*/ ctx[2]) + " svelte-12yipzn"));
    			add_location(div, file$e, 10, 0, 244);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 1) {
    				attr_dev(button, "size", /*size*/ ctx[0]);
    			}

    			if (dirty & /*style*/ 2) {
    				attr_dev(button, "style", /*style*/ ctx[1]);
    			}

    			if (dirty & /*buttonClasses*/ 8 && button_class_value !== (button_class_value = "" + (null_to_empty(/*buttonClasses*/ ctx[3]) + " svelte-12yipzn"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*headerClasses*/ 4 && div_class_value !== (div_class_value = "" + (null_to_empty("svelte-lightbox-header " + /*headerClasses*/ ctx[2]) + " svelte-12yipzn"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LightboxHeader", slots, []);
    	const dispatch = createEventDispatcher();
    	let { size = "xs" } = $$props;
    	let { style = "" } = $$props;
    	let { headerClasses = "" } = $$props;
    	let { buttonClasses = "" } = $$props;
    	const writable_props = ["size", "style", "headerClasses", "buttonClasses"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LightboxHeader> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("close");

    	$$self.$$set = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("headerClasses" in $$props) $$invalidate(2, headerClasses = $$props.headerClasses);
    		if ("buttonClasses" in $$props) $$invalidate(3, buttonClasses = $$props.buttonClasses);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		size,
    		style,
    		headerClasses,
    		buttonClasses
    	});

    	$$self.$inject_state = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("headerClasses" in $$props) $$invalidate(2, headerClasses = $$props.headerClasses);
    		if ("buttonClasses" in $$props) $$invalidate(3, buttonClasses = $$props.buttonClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, style, headerClasses, buttonClasses, dispatch, click_handler];
    }

    class LightboxHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			size: 0,
    			style: 1,
    			headerClasses: 2,
    			buttonClasses: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightboxHeader",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get size() {
    		throw new Error("<LightboxHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<LightboxHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<LightboxHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<LightboxHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get headerClasses() {
    		throw new Error("<LightboxHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headerClasses(value) {
    		throw new Error("<LightboxHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonClasses() {
    		throw new Error("<LightboxHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonClasses(value) {
    		throw new Error("<LightboxHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Modal/LightboxBody.svelte generated by Svelte v3.38.2 */

    const file$d = "node_modules/svelte-lightbox/src/Modal/LightboxBody.svelte";

    // (10:4) {:else}
    function create_else_block$5(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-x9zrc7");
    			toggle_class(div, "svelte-lightbox-image-portrait", /*portrait*/ ctx[2]);
    			add_location(div, file$d, 10, 8, 318);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (dirty & /*portrait*/ 4) {
    				toggle_class(div, "svelte-lightbox-image-portrait", /*portrait*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(10:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (8:4) {#if image.src}
    function create_if_block$6(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let img_style_value;
    	let img_class_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*image*/ ctx[0].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*image*/ ctx[0].alt);
    			attr_dev(img, "style", img_style_value = /*image*/ ctx[0].style);
    			attr_dev(img, "class", img_class_value = /*image*/ ctx[0].class);
    			add_location(img, file$d, 8, 8, 220);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*image*/ 1 && img.src !== (img_src_value = /*image*/ ctx[0].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*image*/ 1 && img_alt_value !== (img_alt_value = /*image*/ ctx[0].alt)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*image*/ 1 && img_style_value !== (img_style_value = /*image*/ ctx[0].style)) {
    				attr_dev(img, "style", img_style_value);
    			}

    			if (dirty & /*image*/ 1 && img_class_value !== (img_class_value = /*image*/ ctx[0].class)) {
    				attr_dev(img, "class", img_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(8:4) {#if image.src}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$6, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*image*/ ctx[0].src) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "svelte-lightbox-body svelte-x9zrc7");
    			toggle_class(div, "svelte-lightbox-unselectable", /*protect*/ ctx[1]);
    			add_location(div, file$d, 6, 0, 112);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if (dirty & /*protect*/ 2) {
    				toggle_class(div, "svelte-lightbox-unselectable", /*protect*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LightboxBody", slots, ['default']);
    	let { image = {} } = $$props;
    	let { protect = false } = $$props;
    	let { portrait = false } = $$props;
    	const writable_props = ["image", "protect", "portrait"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LightboxBody> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("protect" in $$props) $$invalidate(1, protect = $$props.protect);
    		if ("portrait" in $$props) $$invalidate(2, portrait = $$props.portrait);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ image, protect, portrait });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("protect" in $$props) $$invalidate(1, protect = $$props.protect);
    		if ("portrait" in $$props) $$invalidate(2, portrait = $$props.portrait);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image, protect, portrait, $$scope, slots];
    }

    class LightboxBody extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { image: 0, protect: 1, portrait: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightboxBody",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get image() {
    		throw new Error("<LightboxBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<LightboxBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get protect() {
    		throw new Error("<LightboxBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set protect(value) {
    		throw new Error("<LightboxBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get portrait() {
    		throw new Error("<LightboxBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set portrait(value) {
    		throw new Error("<LightboxBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Modal/LightboxFooter.svelte generated by Svelte v3.38.2 */

    const file$c = "node_modules/svelte-lightbox/src/Modal/LightboxFooter.svelte";

    // (18:4) {#if galleryLength}
    function create_if_block$5(ctx) {
    	let p;
    	let t0;
    	let t1_value = /*activeImage*/ ctx[3] + 1 + "";
    	let t1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Image ");
    			t1 = text(t1_value);
    			t2 = text(" of ");
    			t3 = text(/*galleryLength*/ ctx[2]);
    			add_location(p, file$c, 18, 8, 373);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*activeImage*/ 8 && t1_value !== (t1_value = /*activeImage*/ ctx[3] + 1 + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*galleryLength*/ 4) set_data_dev(t3, /*galleryLength*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(18:4) {#if galleryLength}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div;
    	let h2;
    	let t0;
    	let h5;
    	let t1;
    	let div_class_value;
    	let if_block = /*galleryLength*/ ctx[2] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = space();
    			h5 = element("h5");
    			t1 = space();
    			if (if_block) if_block.c();
    			add_location(h2, file$c, 11, 4, 257);
    			add_location(h5, file$c, 14, 4, 298);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("svelte-lightbox-footer " + /*classes*/ ctx[4]) + " svelte-1u8lh7d"));
    			attr_dev(div, "style", /*style*/ ctx[5]);
    			add_location(div, file$c, 10, 0, 195);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			h2.innerHTML = /*title*/ ctx[0];
    			append_dev(div, t0);
    			append_dev(div, h5);
    			h5.innerHTML = /*description*/ ctx[1];
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) h2.innerHTML = /*title*/ ctx[0];			if (dirty & /*description*/ 2) h5.innerHTML = /*description*/ ctx[1];
    			if (/*galleryLength*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*classes*/ 16 && div_class_value !== (div_class_value = "" + (null_to_empty("svelte-lightbox-footer " + /*classes*/ ctx[4]) + " svelte-1u8lh7d"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*style*/ 32) {
    				attr_dev(div, "style", /*style*/ ctx[5]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LightboxFooter", slots, []);
    	let { title = "" } = $$props;
    	let { description = "" } = $$props;
    	let { galleryLength } = $$props;
    	let { activeImage } = $$props;
    	let { classes = "" } = $$props;
    	let { style = "" } = $$props;
    	const writable_props = ["title", "description", "galleryLength", "activeImage", "classes", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LightboxFooter> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("galleryLength" in $$props) $$invalidate(2, galleryLength = $$props.galleryLength);
    		if ("activeImage" in $$props) $$invalidate(3, activeImage = $$props.activeImage);
    		if ("classes" in $$props) $$invalidate(4, classes = $$props.classes);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({
    		title,
    		description,
    		galleryLength,
    		activeImage,
    		classes,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("galleryLength" in $$props) $$invalidate(2, galleryLength = $$props.galleryLength);
    		if ("activeImage" in $$props) $$invalidate(3, activeImage = $$props.activeImage);
    		if ("classes" in $$props) $$invalidate(4, classes = $$props.classes);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, description, galleryLength, activeImage, classes, style];
    }

    class LightboxFooter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			title: 0,
    			description: 1,
    			galleryLength: 2,
    			activeImage: 3,
    			classes: 4,
    			style: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightboxFooter",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*galleryLength*/ ctx[2] === undefined && !("galleryLength" in props)) {
    			console.warn("<LightboxFooter> was created without expected prop 'galleryLength'");
    		}

    		if (/*activeImage*/ ctx[3] === undefined && !("activeImage" in props)) {
    			console.warn("<LightboxFooter> was created without expected prop 'activeImage'");
    		}
    	}

    	get title() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get galleryLength() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set galleryLength(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeImage() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeImage(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Modal/Index.svelte generated by Svelte v3.38.2 */
    const file$b = "node_modules/svelte-lightbox/src/Modal/Index.svelte";

    // (43:12) <Body bind:image={image} bind:protect={protect} bind:portrait={portrait}>
    function create_default_slot$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[25], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 33554432)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[25], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(43:12) <Body bind:image={image} bind:protect={protect} bind:portrait={portrait}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let header;
    	let t0;
    	let body;
    	let updating_image;
    	let updating_protect;
    	let updating_portrait;
    	let t1;
    	let footer;
    	let updating_title;
    	let updating_description;
    	let updating_galleryLength;
    	let updating_activeImage;
    	let div1_class_value;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	header = new LightboxHeader({ $$inline: true });
    	header.$on("close", /*close_handler*/ ctx[15]);

    	function body_image_binding(value) {
    		/*body_image_binding*/ ctx[16](value);
    	}

    	function body_protect_binding(value) {
    		/*body_protect_binding*/ ctx[17](value);
    	}

    	function body_portrait_binding(value) {
    		/*body_portrait_binding*/ ctx[18](value);
    	}

    	let body_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	if (/*image*/ ctx[2] !== void 0) {
    		body_props.image = /*image*/ ctx[2];
    	}

    	if (/*protect*/ ctx[3] !== void 0) {
    		body_props.protect = /*protect*/ ctx[3];
    	}

    	if (/*portrait*/ ctx[4] !== void 0) {
    		body_props.portrait = /*portrait*/ ctx[4];
    	}

    	body = new LightboxBody({ props: body_props, $$inline: true });
    	binding_callbacks.push(() => bind(body, "image", body_image_binding));
    	binding_callbacks.push(() => bind(body, "protect", body_protect_binding));
    	binding_callbacks.push(() => bind(body, "portrait", body_portrait_binding));

    	function footer_title_binding(value) {
    		/*footer_title_binding*/ ctx[19](value);
    	}

    	function footer_description_binding(value) {
    		/*footer_description_binding*/ ctx[20](value);
    	}

    	function footer_galleryLength_binding(value) {
    		/*footer_galleryLength_binding*/ ctx[21](value);
    	}

    	function footer_activeImage_binding(value) {
    		/*footer_activeImage_binding*/ ctx[22](value);
    	}

    	let footer_props = {};

    	if (/*actualTitle*/ ctx[7] !== void 0) {
    		footer_props.title = /*actualTitle*/ ctx[7];
    	}

    	if (/*actualDescription*/ ctx[8] !== void 0) {
    		footer_props.description = /*actualDescription*/ ctx[8];
    	}

    	if (/*gallery*/ ctx[0].length !== void 0) {
    		footer_props.galleryLength = /*gallery*/ ctx[0].length;
    	}

    	if (/*activeImage*/ ctx[1] !== void 0) {
    		footer_props.activeImage = /*activeImage*/ ctx[1];
    	}

    	footer = new LightboxFooter({ props: footer_props, $$inline: true });
    	binding_callbacks.push(() => bind(footer, "title", footer_title_binding));
    	binding_callbacks.push(() => bind(footer, "description", footer_description_binding));
    	binding_callbacks.push(() => bind(footer, "galleryLength", footer_galleryLength_binding));
    	binding_callbacks.push(() => bind(footer, "activeImage", footer_activeImage_binding));

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(body.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div0, "class", "svelte-lightbox svelte-tpon2m");
    			add_location(div0, file$b, 38, 8, 1218);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*allModalClasses*/ ctx[9]) + " svelte-tpon2m"));
    			attr_dev(div1, "style", /*modalStyle*/ ctx[5]);
    			add_location(div1, file$b, 36, 4, 1067);
    			attr_dev(div2, "class", "cover clearfix svelte-tpon2m");
    			add_location(div2, file$b, 34, 0, 1033);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			mount_component(header, div0, null);
    			append_dev(div0, t0);
    			mount_component(body, div0, null);
    			append_dev(div0, t1);
    			mount_component(footer, div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[23], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[24], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const body_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				body_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_image && dirty & /*image*/ 4) {
    				updating_image = true;
    				body_changes.image = /*image*/ ctx[2];
    				add_flush_callback(() => updating_image = false);
    			}

    			if (!updating_protect && dirty & /*protect*/ 8) {
    				updating_protect = true;
    				body_changes.protect = /*protect*/ ctx[3];
    				add_flush_callback(() => updating_protect = false);
    			}

    			if (!updating_portrait && dirty & /*portrait*/ 16) {
    				updating_portrait = true;
    				body_changes.portrait = /*portrait*/ ctx[4];
    				add_flush_callback(() => updating_portrait = false);
    			}

    			body.$set(body_changes);
    			const footer_changes = {};

    			if (!updating_title && dirty & /*actualTitle*/ 128) {
    				updating_title = true;
    				footer_changes.title = /*actualTitle*/ ctx[7];
    				add_flush_callback(() => updating_title = false);
    			}

    			if (!updating_description && dirty & /*actualDescription*/ 256) {
    				updating_description = true;
    				footer_changes.description = /*actualDescription*/ ctx[8];
    				add_flush_callback(() => updating_description = false);
    			}

    			if (!updating_galleryLength && dirty & /*gallery*/ 1) {
    				updating_galleryLength = true;
    				footer_changes.galleryLength = /*gallery*/ ctx[0].length;
    				add_flush_callback(() => updating_galleryLength = false);
    			}

    			if (!updating_activeImage && dirty & /*activeImage*/ 2) {
    				updating_activeImage = true;
    				footer_changes.activeImage = /*activeImage*/ ctx[1];
    				add_flush_callback(() => updating_activeImage = false);
    			}

    			footer.$set(footer_changes);

    			if (!current || dirty & /*allModalClasses*/ 512 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*allModalClasses*/ ctx[9]) + " svelte-tpon2m"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*modalStyle*/ 32) {
    				attr_dev(div1, "style", /*modalStyle*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(body.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: /*transitionDuration*/ ctx[6] }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(body.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: /*transitionDuration*/ ctx[6] }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(header);
    			destroy_component(body);
    			destroy_component(footer);
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let allModalClasses;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Index", slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { modalClasses = "" } = $$props;
    	let { modalStyle = "" } = $$props;
    	let { transitionDuration = 500 } = $$props;
    	let { image = {} } = $$props;
    	let { protect = false } = $$props;
    	let { portrait = false } = $$props;
    	let { title = "" } = $$props;
    	let { description = "" } = $$props;
    	let { gallery } = $$props;
    	let { activeImage } = $$props;
    	let actualTitle;
    	let actualDescription;

    	const writable_props = [
    		"modalClasses",
    		"modalStyle",
    		"transitionDuration",
    		"image",
    		"protect",
    		"portrait",
    		"title",
    		"description",
    		"gallery",
    		"activeImage"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	const close_handler = () => dispatch("close");

    	function body_image_binding(value) {
    		image = value;
    		$$invalidate(2, image);
    	}

    	function body_protect_binding(value) {
    		protect = value;
    		$$invalidate(3, protect);
    	}

    	function body_portrait_binding(value) {
    		portrait = value;
    		$$invalidate(4, portrait);
    	}

    	function footer_title_binding(value) {
    		actualTitle = value;
    		(((($$invalidate(7, actualTitle), $$invalidate(12, title)), $$invalidate(0, gallery)), $$invalidate(13, description)), $$invalidate(1, activeImage));
    	}

    	function footer_description_binding(value) {
    		actualDescription = value;
    		(((($$invalidate(8, actualDescription), $$invalidate(13, description)), $$invalidate(0, gallery)), $$invalidate(12, title)), $$invalidate(1, activeImage));
    	}

    	function footer_galleryLength_binding(value) {
    		if ($$self.$$.not_equal(gallery.length, value)) {
    			gallery.length = value;
    			$$invalidate(0, gallery);
    		}
    	}

    	function footer_activeImage_binding(value) {
    		activeImage = value;
    		$$invalidate(1, activeImage);
    	}

    	const click_handler = () => dispatch("modalClick");
    	const click_handler_1 = () => dispatch("topModalClick");

    	$$self.$$set = $$props => {
    		if ("modalClasses" in $$props) $$invalidate(11, modalClasses = $$props.modalClasses);
    		if ("modalStyle" in $$props) $$invalidate(5, modalStyle = $$props.modalStyle);
    		if ("transitionDuration" in $$props) $$invalidate(6, transitionDuration = $$props.transitionDuration);
    		if ("image" in $$props) $$invalidate(2, image = $$props.image);
    		if ("protect" in $$props) $$invalidate(3, protect = $$props.protect);
    		if ("portrait" in $$props) $$invalidate(4, portrait = $$props.portrait);
    		if ("title" in $$props) $$invalidate(12, title = $$props.title);
    		if ("description" in $$props) $$invalidate(13, description = $$props.description);
    		if ("gallery" in $$props) $$invalidate(0, gallery = $$props.gallery);
    		if ("activeImage" in $$props) $$invalidate(1, activeImage = $$props.activeImage);
    		if ("$$scope" in $$props) $$invalidate(25, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		createEventDispatcher,
    		dispatch,
    		Header: LightboxHeader,
    		Body: LightboxBody,
    		Footer: LightboxFooter,
    		modalClasses,
    		modalStyle,
    		transitionDuration,
    		image,
    		protect,
    		portrait,
    		title,
    		description,
    		gallery,
    		activeImage,
    		actualTitle,
    		actualDescription,
    		allModalClasses
    	});

    	$$self.$inject_state = $$props => {
    		if ("modalClasses" in $$props) $$invalidate(11, modalClasses = $$props.modalClasses);
    		if ("modalStyle" in $$props) $$invalidate(5, modalStyle = $$props.modalStyle);
    		if ("transitionDuration" in $$props) $$invalidate(6, transitionDuration = $$props.transitionDuration);
    		if ("image" in $$props) $$invalidate(2, image = $$props.image);
    		if ("protect" in $$props) $$invalidate(3, protect = $$props.protect);
    		if ("portrait" in $$props) $$invalidate(4, portrait = $$props.portrait);
    		if ("title" in $$props) $$invalidate(12, title = $$props.title);
    		if ("description" in $$props) $$invalidate(13, description = $$props.description);
    		if ("gallery" in $$props) $$invalidate(0, gallery = $$props.gallery);
    		if ("activeImage" in $$props) $$invalidate(1, activeImage = $$props.activeImage);
    		if ("actualTitle" in $$props) $$invalidate(7, actualTitle = $$props.actualTitle);
    		if ("actualDescription" in $$props) $$invalidate(8, actualDescription = $$props.actualDescription);
    		if ("allModalClasses" in $$props) $$invalidate(9, allModalClasses = $$props.allModalClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*modalClasses*/ 2048) {
    			//let allModalClasses = modalClasses;
    			$$invalidate(9, allModalClasses = `${modalClasses} svelte-lightbox-overlay clearfix`);
    		}

    		if ($$self.$$.dirty & /*title*/ 4096) {
    			$$invalidate(7, actualTitle = title);
    		}

    		if ($$self.$$.dirty & /*description*/ 8192) {
    			$$invalidate(8, actualDescription = description);
    		}

    		if ($$self.$$.dirty & /*gallery, title, description, activeImage*/ 12291) {
    			if (gallery && !title && !description) {
    				$$invalidate(7, actualTitle = gallery[activeImage].title);
    				$$invalidate(8, actualDescription = gallery[activeImage].description);
    			}
    		}
    	};

    	return [
    		gallery,
    		activeImage,
    		image,
    		protect,
    		portrait,
    		modalStyle,
    		transitionDuration,
    		actualTitle,
    		actualDescription,
    		allModalClasses,
    		dispatch,
    		modalClasses,
    		title,
    		description,
    		slots,
    		close_handler,
    		body_image_binding,
    		body_protect_binding,
    		body_portrait_binding,
    		footer_title_binding,
    		footer_description_binding,
    		footer_galleryLength_binding,
    		footer_activeImage_binding,
    		click_handler,
    		click_handler_1,
    		$$scope
    	];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			modalClasses: 11,
    			modalStyle: 5,
    			transitionDuration: 6,
    			image: 2,
    			protect: 3,
    			portrait: 4,
    			title: 12,
    			description: 13,
    			gallery: 0,
    			activeImage: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*gallery*/ ctx[0] === undefined && !("gallery" in props)) {
    			console.warn("<Index> was created without expected prop 'gallery'");
    		}

    		if (/*activeImage*/ ctx[1] === undefined && !("activeImage" in props)) {
    			console.warn("<Index> was created without expected prop 'activeImage'");
    		}
    	}

    	get modalClasses() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalClasses(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalStyle() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalStyle(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionDuration() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionDuration(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get protect() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set protect(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get portrait() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set portrait(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gallery() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gallery(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeImage() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeImage(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Gallery/InternalGallery.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1$3, console: console_1$4 } = globals;
    const file$a = "node_modules/svelte-lightbox/src/Gallery/InternalGallery.svelte";

    function create_fragment$c(ctx) {
    	let div1;
    	let button0;
    	let svg0;
    	let g0;
    	let path0;
    	let button0_disabled_value;
    	let t0;
    	let div0;
    	let t1;
    	let button1;
    	let svg1;
    	let g1;
    	let path1;
    	let button1_disabled_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			t0 = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			g1 = svg_element("g");
    			path1 = svg_element("path");
    			attr_dev(path0, "class", "arrow svelte-wwe8hv");
    			attr_dev(path0, "d", "M8.7,7.22,4.59,11.33a1,1,0,0,0,0,1.41l4,4");
    			add_location(path0, file$a, 33, 16, 909);
    			add_location(g0, file$a, 32, 12, 889);
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "class", "svelte-wwe8hv");
    			add_location(svg0, file$a, 31, 8, 816);
    			button0.disabled = button0_disabled_value = /*activeImage*/ ctx[0] === 0;
    			attr_dev(button0, "class", "previous-button svelte-wwe8hv");
    			add_location(button0, file$a, 30, 4, 721);
    			attr_dev(div0, "class", "slot svelte-wwe8hv");
    			add_location(div0, file$a, 38, 4, 1028);
    			attr_dev(path1, "class", "arrow svelte-wwe8hv");
    			attr_dev(path1, "d", "M15.3,16.78l4.11-4.11a1,1,0,0,0,0-1.41l-4-4");
    			add_location(path1, file$a, 46, 16, 1313);
    			add_location(g1, file$a, 45, 12, 1293);
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "class", "svelte-wwe8hv");
    			add_location(svg1, file$a, 44, 8, 1220);
    			button1.disabled = button1_disabled_value = /*activeImage*/ ctx[0] === /*images*/ ctx[2]?.length - 1;
    			attr_dev(button1, "class", "next-button svelte-wwe8hv");
    			add_location(button1, file$a, 43, 4, 1118);
    			attr_dev(div1, "class", "wrapper svelte-wwe8hv");
    			add_location(div1, file$a, 29, 0, 695);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, g0);
    			append_dev(g0, path0);
    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[7](div0);
    			append_dev(div1, t1);
    			append_dev(div1, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, g1);
    			append_dev(g1, path1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*previousImage*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*nextImage*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*activeImage*/ 1 && button0_disabled_value !== (button0_disabled_value = /*activeImage*/ ctx[0] === 0)) {
    				prop_dev(button0, "disabled", button0_disabled_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*activeImage, images*/ 5 && button1_disabled_value !== (button1_disabled_value = /*activeImage*/ ctx[0] === /*images*/ ctx[2]?.length - 1)) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InternalGallery", slots, ['default']);
    	let { activeImage = 0 } = $$props;
    	let slotContent;
    	let images;

    	const previousImage = () => {
    		$$invalidate(0, activeImage--, activeImage);
    	};

    	const nextImage = () => {
    		$$invalidate(0, activeImage++, activeImage);
    	};

    	const writable_props = ["activeImage"];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<InternalGallery> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			slotContent = $$value;
    			$$invalidate(1, slotContent);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("activeImage" in $$props) $$invalidate(0, activeImage = $$props.activeImage);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		activeImage,
    		slotContent,
    		images,
    		previousImage,
    		nextImage
    	});

    	$$self.$inject_state = $$props => {
    		if ("activeImage" in $$props) $$invalidate(0, activeImage = $$props.activeImage);
    		if ("slotContent" in $$props) $$invalidate(1, slotContent = $$props.slotContent);
    		if ("images" in $$props) $$invalidate(2, images = $$props.images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*slotContent*/ 2) {
    			$$invalidate(2, images = slotContent?.children);
    		}

    		if ($$self.$$.dirty & /*images, activeImage*/ 5) {
    			{
    				console.log(typeof images);

    				if (images && activeImage < images.length) {
    					Object.values(images).forEach(img => {
    						img.hidden = true;
    						return img;
    					});

    					$$invalidate(2, images[activeImage].hidden = false, images);
    				} else if (images && activeImage >= images.length) {
    					console.error("LightboxGallery: Selected image doesn't exist, invalid activeImage");
    				}
    			}
    		}
    	};

    	return [
    		activeImage,
    		slotContent,
    		images,
    		previousImage,
    		nextImage,
    		$$scope,
    		slots,
    		div0_binding
    	];
    }

    class InternalGallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { activeImage: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InternalGallery",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get activeImage() {
    		throw new Error("<InternalGallery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeImage(value) {
    		throw new Error("<InternalGallery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* node_modules/svelte-lightbox/src/Gallery/ExternalGallery.svelte generated by Svelte v3.38.2 */

    function create_fragment$b(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ExternalGallery", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ExternalGallery> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class ExternalGallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExternalGallery",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* node_modules/svelte-lightbox/src/Lightbox.svelte generated by Svelte v3.38.2 */
    const get_thumbnail_slot_changes_1 = dirty => ({});
    const get_thumbnail_slot_context_1 = ctx => ({});
    const get_image_slot_changes = dirty => ({});
    const get_image_slot_context = ctx => ({});
    const get_thumbnail_slot_changes = dirty => ({});
    const get_thumbnail_slot_context = ctx => ({});

    // (65:4) {:else}
    function create_else_block_1$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[32], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[32], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(65:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:4) {#if thumbnail || gallery}
    function create_if_block_3$3(ctx) {
    	let current;
    	const thumbnail_slot_template = /*#slots*/ ctx[17].thumbnail;
    	const thumbnail_slot = create_slot(thumbnail_slot_template, ctx, /*$$scope*/ ctx[32], get_thumbnail_slot_context);

    	const block = {
    		c: function create() {
    			if (thumbnail_slot) thumbnail_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (thumbnail_slot) {
    				thumbnail_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (thumbnail_slot) {
    				if (thumbnail_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot(thumbnail_slot, thumbnail_slot_template, ctx, /*$$scope*/ ctx[32], dirty, get_thumbnail_slot_changes, get_thumbnail_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (thumbnail_slot) thumbnail_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(63:4) {#if thumbnail || gallery}",
    		ctx
    	});

    	return block;
    }

    // (62:0) <Thumbnail bind:thumbnailClasses bind:thumbnailStyle bind:protect on:click={toggle}>
    function create_default_slot_2$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3$3, create_else_block_1$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*thumbnail*/ ctx[12] || /*gallery*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(62:0) <Thumbnail bind:thumbnailClasses bind:thumbnailStyle bind:protect on:click={toggle}>",
    		ctx
    	});

    	return block;
    }

    // (70:0) {#if visible}
    function create_if_block$4(ctx) {
    	let modal;
    	let updating_modalClasses;
    	let updating_modalStyle;
    	let updating_transitionDuration;
    	let updating_image;
    	let updating_protect;
    	let updating_portrait;
    	let updating_title;
    	let updating_description;
    	let updating_gallery;
    	let updating_activeImage;
    	let current;

    	function modal_modalClasses_binding(value) {
    		/*modal_modalClasses_binding*/ ctx[22](value);
    	}

    	function modal_modalStyle_binding(value) {
    		/*modal_modalStyle_binding*/ ctx[23](value);
    	}

    	function modal_transitionDuration_binding(value) {
    		/*modal_transitionDuration_binding*/ ctx[24](value);
    	}

    	function modal_image_binding(value) {
    		/*modal_image_binding*/ ctx[25](value);
    	}

    	function modal_protect_binding(value) {
    		/*modal_protect_binding*/ ctx[26](value);
    	}

    	function modal_portrait_binding(value) {
    		/*modal_portrait_binding*/ ctx[27](value);
    	}

    	function modal_title_binding(value) {
    		/*modal_title_binding*/ ctx[28](value);
    	}

    	function modal_description_binding(value) {
    		/*modal_description_binding*/ ctx[29](value);
    	}

    	function modal_gallery_binding(value) {
    		/*modal_gallery_binding*/ ctx[30](value);
    	}

    	function modal_activeImage_binding(value) {
    		/*modal_activeImage_binding*/ ctx[31](value);
    	}

    	let modal_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*modalClasses*/ ctx[2] !== void 0) {
    		modal_props.modalClasses = /*modalClasses*/ ctx[2];
    	}

    	if (/*modalStyle*/ ctx[3] !== void 0) {
    		modal_props.modalStyle = /*modalStyle*/ ctx[3];
    	}

    	if (/*transitionDuration*/ ctx[8] !== void 0) {
    		modal_props.transitionDuration = /*transitionDuration*/ ctx[8];
    	}

    	if (/*image*/ ctx[10] !== void 0) {
    		modal_props.image = /*image*/ ctx[10];
    	}

    	if (/*protect*/ ctx[9] !== void 0) {
    		modal_props.protect = /*protect*/ ctx[9];
    	}

    	if (/*portrait*/ ctx[11] !== void 0) {
    		modal_props.portrait = /*portrait*/ ctx[11];
    	}

    	if (/*title*/ ctx[6] !== void 0) {
    		modal_props.title = /*title*/ ctx[6];
    	}

    	if (/*description*/ ctx[7] !== void 0) {
    		modal_props.description = /*description*/ ctx[7];
    	}

    	if (/*gallery*/ ctx[5] !== void 0) {
    		modal_props.gallery = /*gallery*/ ctx[5];
    	}

    	if (/*activeImage*/ ctx[4] !== void 0) {
    		modal_props.activeImage = /*activeImage*/ ctx[4];
    	}

    	modal = new Index({ props: modal_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal, "modalClasses", modal_modalClasses_binding));
    	binding_callbacks.push(() => bind(modal, "modalStyle", modal_modalStyle_binding));
    	binding_callbacks.push(() => bind(modal, "transitionDuration", modal_transitionDuration_binding));
    	binding_callbacks.push(() => bind(modal, "image", modal_image_binding));
    	binding_callbacks.push(() => bind(modal, "protect", modal_protect_binding));
    	binding_callbacks.push(() => bind(modal, "portrait", modal_portrait_binding));
    	binding_callbacks.push(() => bind(modal, "title", modal_title_binding));
    	binding_callbacks.push(() => bind(modal, "description", modal_description_binding));
    	binding_callbacks.push(() => bind(modal, "gallery", modal_gallery_binding));
    	binding_callbacks.push(() => bind(modal, "activeImage", modal_activeImage_binding));
    	modal.$on("close", /*toggle*/ ctx[14]);
    	modal.$on("topModalClick", /*toggle*/ ctx[14]);
    	modal.$on("modalClick", /*toggle*/ ctx[14]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty[0] & /*thumbnail, activeImage, gallery*/ 4144 | dirty[1] & /*$$scope*/ 2) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_modalClasses && dirty[0] & /*modalClasses*/ 4) {
    				updating_modalClasses = true;
    				modal_changes.modalClasses = /*modalClasses*/ ctx[2];
    				add_flush_callback(() => updating_modalClasses = false);
    			}

    			if (!updating_modalStyle && dirty[0] & /*modalStyle*/ 8) {
    				updating_modalStyle = true;
    				modal_changes.modalStyle = /*modalStyle*/ ctx[3];
    				add_flush_callback(() => updating_modalStyle = false);
    			}

    			if (!updating_transitionDuration && dirty[0] & /*transitionDuration*/ 256) {
    				updating_transitionDuration = true;
    				modal_changes.transitionDuration = /*transitionDuration*/ ctx[8];
    				add_flush_callback(() => updating_transitionDuration = false);
    			}

    			if (!updating_image && dirty[0] & /*image*/ 1024) {
    				updating_image = true;
    				modal_changes.image = /*image*/ ctx[10];
    				add_flush_callback(() => updating_image = false);
    			}

    			if (!updating_protect && dirty[0] & /*protect*/ 512) {
    				updating_protect = true;
    				modal_changes.protect = /*protect*/ ctx[9];
    				add_flush_callback(() => updating_protect = false);
    			}

    			if (!updating_portrait && dirty[0] & /*portrait*/ 2048) {
    				updating_portrait = true;
    				modal_changes.portrait = /*portrait*/ ctx[11];
    				add_flush_callback(() => updating_portrait = false);
    			}

    			if (!updating_title && dirty[0] & /*title*/ 64) {
    				updating_title = true;
    				modal_changes.title = /*title*/ ctx[6];
    				add_flush_callback(() => updating_title = false);
    			}

    			if (!updating_description && dirty[0] & /*description*/ 128) {
    				updating_description = true;
    				modal_changes.description = /*description*/ ctx[7];
    				add_flush_callback(() => updating_description = false);
    			}

    			if (!updating_gallery && dirty[0] & /*gallery*/ 32) {
    				updating_gallery = true;
    				modal_changes.gallery = /*gallery*/ ctx[5];
    				add_flush_callback(() => updating_gallery = false);
    			}

    			if (!updating_activeImage && dirty[0] & /*activeImage*/ 16) {
    				updating_activeImage = true;
    				modal_changes.activeImage = /*activeImage*/ ctx[4];
    				add_flush_callback(() => updating_activeImage = false);
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(70:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (82:8) {:else}
    function create_else_block$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[32], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[32], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(82:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (76:26) 
    function create_if_block_2$4(ctx) {
    	let internalgallery;
    	let updating_activeImage;
    	let current;

    	function internalgallery_activeImage_binding(value) {
    		/*internalgallery_activeImage_binding*/ ctx[21](value);
    	}

    	let internalgallery_props = {
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	};

    	if (/*activeImage*/ ctx[4] !== void 0) {
    		internalgallery_props.activeImage = /*activeImage*/ ctx[4];
    	}

    	internalgallery = new InternalGallery({
    			props: internalgallery_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(internalgallery, "activeImage", internalgallery_activeImage_binding));

    	const block = {
    		c: function create() {
    			create_component(internalgallery.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(internalgallery, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const internalgallery_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				internalgallery_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_activeImage && dirty[0] & /*activeImage*/ 16) {
    				updating_activeImage = true;
    				internalgallery_changes.activeImage = /*activeImage*/ ctx[4];
    				add_flush_callback(() => updating_activeImage = false);
    			}

    			internalgallery.$set(internalgallery_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(internalgallery.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(internalgallery.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(internalgallery, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(76:26) ",
    		ctx
    	});

    	return block;
    }

    // (74:8) {#if thumbnail}
    function create_if_block_1$4(ctx) {
    	let current;
    	const image_slot_template = /*#slots*/ ctx[17].image;
    	const image_slot = create_slot(image_slot_template, ctx, /*$$scope*/ ctx[32], get_image_slot_context);

    	const block = {
    		c: function create() {
    			if (image_slot) image_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (image_slot) {
    				image_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (image_slot) {
    				if (image_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot(image_slot, image_slot_template, ctx, /*$$scope*/ ctx[32], dirty, get_image_slot_changes, get_image_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (image_slot) image_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(74:8) {#if thumbnail}",
    		ctx
    	});

    	return block;
    }

    // (77:12) <InternalGallery bind:activeImage>
    function create_default_slot_1$1(ctx) {
    	let t;
    	let current;
    	const thumbnail_slot_template = /*#slots*/ ctx[17].thumbnail;
    	const thumbnail_slot = create_slot(thumbnail_slot_template, ctx, /*$$scope*/ ctx[32], get_thumbnail_slot_context_1);
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[32], null);

    	const block = {
    		c: function create() {
    			if (thumbnail_slot) thumbnail_slot.c();
    			t = space();
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (thumbnail_slot) {
    				thumbnail_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (thumbnail_slot) {
    				if (thumbnail_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot(thumbnail_slot, thumbnail_slot_template, ctx, /*$$scope*/ ctx[32], dirty, get_thumbnail_slot_changes_1, get_thumbnail_slot_context_1);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[32], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail_slot, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail_slot, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (thumbnail_slot) thumbnail_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(77:12) <InternalGallery bind:activeImage>",
    		ctx
    	});

    	return block;
    }

    // (71:4) <Modal bind:modalClasses bind:modalStyle bind:transitionDuration bind:image bind:protect            bind:portrait bind:title bind:description bind:gallery bind:activeImage            on:close={toggle} on:topModalClick={toggle} on:modalClick={toggle}>
    function create_default_slot$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$4, create_if_block_2$4, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*thumbnail*/ ctx[12]) return 0;
    		if (/*gallery*/ ctx[5]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(71:4) <Modal bind:modalClasses bind:modalStyle bind:transitionDuration bind:image bind:protect            bind:portrait bind:title bind:description bind:gallery bind:activeImage            on:close={toggle} on:topModalClick={toggle} on:modalClick={toggle}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let thumbnail_1;
    	let updating_thumbnailClasses;
    	let updating_thumbnailStyle;
    	let updating_protect;
    	let t;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function thumbnail_1_thumbnailClasses_binding(value) {
    		/*thumbnail_1_thumbnailClasses_binding*/ ctx[18](value);
    	}

    	function thumbnail_1_thumbnailStyle_binding(value) {
    		/*thumbnail_1_thumbnailStyle_binding*/ ctx[19](value);
    	}

    	function thumbnail_1_protect_binding(value) {
    		/*thumbnail_1_protect_binding*/ ctx[20](value);
    	}

    	let thumbnail_1_props = {
    		$$slots: { default: [create_default_slot_2$1] },
    		$$scope: { ctx }
    	};

    	if (/*thumbnailClasses*/ ctx[0] !== void 0) {
    		thumbnail_1_props.thumbnailClasses = /*thumbnailClasses*/ ctx[0];
    	}

    	if (/*thumbnailStyle*/ ctx[1] !== void 0) {
    		thumbnail_1_props.thumbnailStyle = /*thumbnailStyle*/ ctx[1];
    	}

    	if (/*protect*/ ctx[9] !== void 0) {
    		thumbnail_1_props.protect = /*protect*/ ctx[9];
    	}

    	thumbnail_1 = new LightboxThumbnail({ props: thumbnail_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(thumbnail_1, "thumbnailClasses", thumbnail_1_thumbnailClasses_binding));
    	binding_callbacks.push(() => bind(thumbnail_1, "thumbnailStyle", thumbnail_1_thumbnailStyle_binding));
    	binding_callbacks.push(() => bind(thumbnail_1, "protect", thumbnail_1_protect_binding));
    	thumbnail_1.$on("click", /*toggle*/ ctx[14]);
    	let if_block = /*visible*/ ctx[13] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			create_component(thumbnail_1.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(thumbnail_1, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeyDown*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const thumbnail_1_changes = {};

    			if (dirty[0] & /*thumbnail, gallery*/ 4128 | dirty[1] & /*$$scope*/ 2) {
    				thumbnail_1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_thumbnailClasses && dirty[0] & /*thumbnailClasses*/ 1) {
    				updating_thumbnailClasses = true;
    				thumbnail_1_changes.thumbnailClasses = /*thumbnailClasses*/ ctx[0];
    				add_flush_callback(() => updating_thumbnailClasses = false);
    			}

    			if (!updating_thumbnailStyle && dirty[0] & /*thumbnailStyle*/ 2) {
    				updating_thumbnailStyle = true;
    				thumbnail_1_changes.thumbnailStyle = /*thumbnailStyle*/ ctx[1];
    				add_flush_callback(() => updating_thumbnailStyle = false);
    			}

    			if (!updating_protect && dirty[0] & /*protect*/ 512) {
    				updating_protect = true;
    				thumbnail_1_changes.protect = /*protect*/ ctx[9];
    				add_flush_callback(() => updating_protect = false);
    			}

    			thumbnail_1.$set(thumbnail_1_changes);

    			if (/*visible*/ ctx[13]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*visible*/ 8192) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail_1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail_1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(thumbnail_1, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Lightbox", slots, ['thumbnail','default','image']);
    	let { thumbnailClasses = "" } = $$props;
    	let { thumbnailStyle = "" } = $$props;
    	let { modalClasses = "" } = $$props;
    	let { modalStyle = "" } = $$props;
    	let { activeImage = 0 } = $$props;
    	let { gallery = false } = $$props;
    	let { title = "" } = $$props;
    	let { description = "" } = $$props;
    	let { transitionDuration = 500 } = $$props;
    	let { protect = false } = $$props;
    	let { image = {} } = $$props;
    	let { portrait = false } = $$props;
    	let { noScroll = true } = $$props;
    	let { thumbnail = false } = $$props;
    	let visible = false;

    	const toggle = () => {
    		$$invalidate(13, visible = !visible);

    		if (noScroll) {
    			mountedT();
    		}
    	};

    	let mountedT = () => {
    		
    	};

    	onMount(() => {
    		let defaultOverflow = document.body.style.overflow;

    		mountedT = () => {
    			if (visible) {
    				document.body.style.overflow = "hidden";
    			} else {
    				document.body.style.overflow = defaultOverflow;
    			}
    		};
    	});

    	const handleKeyDown = e => {
    		if (e.code === "Escape") {
    			$$invalidate(13, visible = false);
    		}
    	};

    	const writable_props = [
    		"thumbnailClasses",
    		"thumbnailStyle",
    		"modalClasses",
    		"modalStyle",
    		"activeImage",
    		"gallery",
    		"title",
    		"description",
    		"transitionDuration",
    		"protect",
    		"image",
    		"portrait",
    		"noScroll",
    		"thumbnail"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Lightbox> was created with unknown prop '${key}'`);
    	});

    	function thumbnail_1_thumbnailClasses_binding(value) {
    		thumbnailClasses = value;
    		$$invalidate(0, thumbnailClasses);
    	}

    	function thumbnail_1_thumbnailStyle_binding(value) {
    		thumbnailStyle = value;
    		$$invalidate(1, thumbnailStyle);
    	}

    	function thumbnail_1_protect_binding(value) {
    		protect = value;
    		$$invalidate(9, protect);
    	}

    	function internalgallery_activeImage_binding(value) {
    		activeImage = value;
    		$$invalidate(4, activeImage);
    	}

    	function modal_modalClasses_binding(value) {
    		modalClasses = value;
    		$$invalidate(2, modalClasses);
    	}

    	function modal_modalStyle_binding(value) {
    		modalStyle = value;
    		$$invalidate(3, modalStyle);
    	}

    	function modal_transitionDuration_binding(value) {
    		transitionDuration = value;
    		$$invalidate(8, transitionDuration);
    	}

    	function modal_image_binding(value) {
    		image = value;
    		$$invalidate(10, image);
    	}

    	function modal_protect_binding(value) {
    		protect = value;
    		$$invalidate(9, protect);
    	}

    	function modal_portrait_binding(value) {
    		portrait = value;
    		$$invalidate(11, portrait);
    	}

    	function modal_title_binding(value) {
    		title = value;
    		$$invalidate(6, title);
    	}

    	function modal_description_binding(value) {
    		description = value;
    		$$invalidate(7, description);
    	}

    	function modal_gallery_binding(value) {
    		gallery = value;
    		$$invalidate(5, gallery);
    	}

    	function modal_activeImage_binding(value) {
    		activeImage = value;
    		$$invalidate(4, activeImage);
    	}

    	$$self.$$set = $$props => {
    		if ("thumbnailClasses" in $$props) $$invalidate(0, thumbnailClasses = $$props.thumbnailClasses);
    		if ("thumbnailStyle" in $$props) $$invalidate(1, thumbnailStyle = $$props.thumbnailStyle);
    		if ("modalClasses" in $$props) $$invalidate(2, modalClasses = $$props.modalClasses);
    		if ("modalStyle" in $$props) $$invalidate(3, modalStyle = $$props.modalStyle);
    		if ("activeImage" in $$props) $$invalidate(4, activeImage = $$props.activeImage);
    		if ("gallery" in $$props) $$invalidate(5, gallery = $$props.gallery);
    		if ("title" in $$props) $$invalidate(6, title = $$props.title);
    		if ("description" in $$props) $$invalidate(7, description = $$props.description);
    		if ("transitionDuration" in $$props) $$invalidate(8, transitionDuration = $$props.transitionDuration);
    		if ("protect" in $$props) $$invalidate(9, protect = $$props.protect);
    		if ("image" in $$props) $$invalidate(10, image = $$props.image);
    		if ("portrait" in $$props) $$invalidate(11, portrait = $$props.portrait);
    		if ("noScroll" in $$props) $$invalidate(16, noScroll = $$props.noScroll);
    		if ("thumbnail" in $$props) $$invalidate(12, thumbnail = $$props.thumbnail);
    		if ("$$scope" in $$props) $$invalidate(32, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Thumbnail: LightboxThumbnail,
    		Modal: Index,
    		InternalGallery,
    		onMount,
    		writable,
    		ExternalGallery,
    		thumbnailClasses,
    		thumbnailStyle,
    		modalClasses,
    		modalStyle,
    		activeImage,
    		gallery,
    		title,
    		description,
    		transitionDuration,
    		protect,
    		image,
    		portrait,
    		noScroll,
    		thumbnail,
    		visible,
    		toggle,
    		mountedT,
    		handleKeyDown
    	});

    	$$self.$inject_state = $$props => {
    		if ("thumbnailClasses" in $$props) $$invalidate(0, thumbnailClasses = $$props.thumbnailClasses);
    		if ("thumbnailStyle" in $$props) $$invalidate(1, thumbnailStyle = $$props.thumbnailStyle);
    		if ("modalClasses" in $$props) $$invalidate(2, modalClasses = $$props.modalClasses);
    		if ("modalStyle" in $$props) $$invalidate(3, modalStyle = $$props.modalStyle);
    		if ("activeImage" in $$props) $$invalidate(4, activeImage = $$props.activeImage);
    		if ("gallery" in $$props) $$invalidate(5, gallery = $$props.gallery);
    		if ("title" in $$props) $$invalidate(6, title = $$props.title);
    		if ("description" in $$props) $$invalidate(7, description = $$props.description);
    		if ("transitionDuration" in $$props) $$invalidate(8, transitionDuration = $$props.transitionDuration);
    		if ("protect" in $$props) $$invalidate(9, protect = $$props.protect);
    		if ("image" in $$props) $$invalidate(10, image = $$props.image);
    		if ("portrait" in $$props) $$invalidate(11, portrait = $$props.portrait);
    		if ("noScroll" in $$props) $$invalidate(16, noScroll = $$props.noScroll);
    		if ("thumbnail" in $$props) $$invalidate(12, thumbnail = $$props.thumbnail);
    		if ("visible" in $$props) $$invalidate(13, visible = $$props.visible);
    		if ("mountedT" in $$props) mountedT = $$props.mountedT;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		thumbnailClasses,
    		thumbnailStyle,
    		modalClasses,
    		modalStyle,
    		activeImage,
    		gallery,
    		title,
    		description,
    		transitionDuration,
    		protect,
    		image,
    		portrait,
    		thumbnail,
    		visible,
    		toggle,
    		handleKeyDown,
    		noScroll,
    		slots,
    		thumbnail_1_thumbnailClasses_binding,
    		thumbnail_1_thumbnailStyle_binding,
    		thumbnail_1_protect_binding,
    		internalgallery_activeImage_binding,
    		modal_modalClasses_binding,
    		modal_modalStyle_binding,
    		modal_transitionDuration_binding,
    		modal_image_binding,
    		modal_protect_binding,
    		modal_portrait_binding,
    		modal_title_binding,
    		modal_description_binding,
    		modal_gallery_binding,
    		modal_activeImage_binding,
    		$$scope
    	];
    }

    class Lightbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$a,
    			create_fragment$a,
    			safe_not_equal,
    			{
    				thumbnailClasses: 0,
    				thumbnailStyle: 1,
    				modalClasses: 2,
    				modalStyle: 3,
    				activeImage: 4,
    				gallery: 5,
    				title: 6,
    				description: 7,
    				transitionDuration: 8,
    				protect: 9,
    				image: 10,
    				portrait: 11,
    				noScroll: 16,
    				thumbnail: 12
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lightbox",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get thumbnailClasses() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnailClasses(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbnailStyle() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnailStyle(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalClasses() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalClasses(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalStyle() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalStyle(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeImage() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeImage(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gallery() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gallery(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionDuration() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionDuration(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get protect() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set protect(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get portrait() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set portrait(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noScroll() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noScroll(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbnail() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnail(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Description.svelte generated by Svelte v3.38.2 */
    const file$9 = "src/Description.svelte";

    // (33:8) <Lightbox thumbnailStyle="width: 24rem; max-width: 90%; border: solid 1px #eee">
    function create_default_slot_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "img/screenshots/charm-scanning.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "charm scanning");
    			add_location(img, file$9, 33, 10, 1086);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(33:8) <Lightbox thumbnailStyle=\\\"width: 24rem; max-width: 90%; border: solid 1px #eee\\\">",
    		ctx
    	});

    	return block;
    }

    // (62:8) <Lightbox thumbnailStyle="width: 24rem; max-width: 90%; border: solid 1px #eee">
    function create_default_slot_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "img/screenshots/charm-img.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "charm image");
    			add_location(img, file$9, 62, 10, 2105);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(62:8) <Lightbox thumbnailStyle=\\\"width: 24rem; max-width: 90%; border: solid 1px #eee\\\">",
    		ctx
    	});

    	return block;
    }

    // (65:8) <Lightbox thumbnailStyle="width: 24rem; max-width: 90%; border: solid 1px #eee">
    function create_default_slot(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "img/screenshots/charm-substitutes.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "charm substitutes");
    			add_location(img, file$9, 65, 10, 2284);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(65:8) <Lightbox thumbnailStyle=\\\"width: 24rem; max-width: 90%; border: solid 1px #eee\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div10;
    	let div1;
    	let div0;
    	let h20;
    	let t1;
    	let p0;
    	let t2;
    	let br0;
    	let t3;
    	let br1;
    	let t4;
    	let div4;
    	let div3;
    	let h21;
    	let t6;
    	let p1;
    	let t7;
    	let br2;
    	let t8;
    	let a0;
    	let t10;
    	let br3;
    	let t11;
    	let br4;
    	let t12;
    	let br5;
    	let t13;
    	let a1;
    	let t15;
    	let br6;
    	let t16;
    	let br7;
    	let t17;
    	let br8;
    	let t18;
    	let span0;
    	let t20;
    	let br9;
    	let t21;
    	let br10;
    	let t22;
    	let div2;
    	let lightbox0;
    	let t23;
    	let div7;
    	let div6;
    	let h22;
    	let t25;
    	let p2;
    	let t26;
    	let br11;
    	let t27;
    	let br12;
    	let t28;
    	let br13;
    	let t29;
    	let br14;
    	let t30;
    	let span1;
    	let br15;
    	let t32;
    	let br16;
    	let t33;
    	let br17;
    	let t34;
    	let br18;
    	let t35;
    	let span2;
    	let br19;
    	let t37;
    	let br20;
    	let t38;
    	let br21;
    	let t39;
    	let br22;
    	let t40;
    	let br23;
    	let t41;
    	let span3;
    	let t42;
    	let br24;
    	let t43;
    	let div5;
    	let lightbox1;
    	let t44;
    	let lightbox2;
    	let t45;
    	let div9;
    	let div8;
    	let h23;
    	let t47;
    	let p3;
    	let t48;
    	let a2;
    	let t50;
    	let current;

    	lightbox0 = new Lightbox({
    			props: {
    				thumbnailStyle: "width: 24rem; max-width: 90%; border: solid 1px #eee",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	lightbox1 = new Lightbox({
    			props: {
    				thumbnailStyle: "width: 24rem; max-width: 90%; border: solid 1px #eee",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	lightbox2 = new Lightbox({
    			props: {
    				thumbnailStyle: "width: 24rem; max-width: 90%; border: solid 1px #eee",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "■ 概要";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("モンスターハンターライズの護石用ツールです。");
    			br0 = element("br");
    			t3 = text("\n        機能追加、UI 改善は随時行っています。");
    			br1 = element("br");
    			t4 = space();
    			div4 = element("div");
    			div3 = element("div");
    			h21 = element("h2");
    			h21.textContent = "■ 護石スキャン";
    			t6 = space();
    			p1 = element("p");
    			t7 = text("護石のスキルやスロットを自動読み取りします。");
    			br2 = element("br");
    			t8 = text("\n        Nintendo Switch の 30 秒キャプチャ動画を用意するだけで、自動でデータ化できます。\n        (");
    			a0 = element("a");
    			a0.textContent = "動画例";
    			t10 = text(")");
    			br3 = element("br");
    			t11 = space();
    			br4 = element("br");
    			t12 = text("\n        出力形式は、<スキル1>,<スキル1Lv>,<スキル2>,<スキル2Lv>,<スロット1Lv>,<スロット2Lv>,<スロット3Lv> です。");
    			br5 = element("br");
    			t13 = space();
    			a1 = element("a");
    			a1.textContent = "泣きシミュ";
    			t15 = text(" さんでそのままインポートできます。");
    			br6 = element("br");
    			t16 = space();
    			br7 = element("br");
    			t17 = text("\n        (注意)");
    			br8 = element("br");
    			t18 = text("\n        - ");
    			span0 = element("span");
    			span0.textContent = "装飾品をつけたままだと、装飾品分のスキルも読み込まれてしまいます。";
    			t20 = text(" (一括解除が有用です)");
    			br9 = element("br");
    			t21 = text("\n        - キャプチャ動画のファイル名はデフォルトのまま使用することを推奨します。");
    			br10 = element("br");
    			t22 = space();
    			div2 = element("div");
    			create_component(lightbox0.$$.fragment);
    			t23 = space();
    			div7 = element("div");
    			div6 = element("div");
    			h22 = element("h2");
    			h22.textContent = "■ 護石管理";
    			t25 = space();
    			p2 = element("p");
    			t26 = text("スキャンした護石の一覧を見ることができます。");
    			br11 = element("br");
    			t27 = text("\n        護石データは蓄積され、次回、同じブラウザで開いた時にも保持されます。");
    			br12 = element("br");
    			t28 = space();
    			br13 = element("br");
    			t29 = text("\n        表中の \"合計スキルレベル\" は、");
    			br14 = element("br");
    			t30 = space();
    			span1 = element("span");
    			span1.textContent = "(スキルを装飾品換算した場合のスロットLv) × (スキルLv) + (スロットLv)";
    			br15 = element("br");
    			t32 = text("\n        として計算しています。");
    			br16 = element("br");
    			t33 = space();
    			br17 = element("br");
    			t34 = text("\n        例: 納刀術2, ひるみ軽減1, スロット 3-1-0 の場合");
    			br18 = element("br");
    			t35 = space();
    			span2 = element("span");
    			span2.textContent = "2 × 2 + 1 × 1 + 3 + 1 + 0 = 9";
    			br19 = element("br");
    			t37 = space();
    			br20 = element("br");
    			t38 = text("\n        右端の画像ボタンを押すことで、スキャン時のスクリーンショットを確認できます。");
    			br21 = element("br");
    			t39 = text("\n        右端に上向き矢印がある場合、上位互換の護石があります。クリックで該当の護石を確認することができます。");
    			br22 = element("br");
    			t40 = space();
    			br23 = element("br");
    			t41 = space();
    			span3 = element("span");
    			t42 = text("輪廻錬金の際は充分に確認し、自己責任にて行ってください。");
    			br24 = element("br");
    			t43 = space();
    			div5 = element("div");
    			create_component(lightbox1.$$.fragment);
    			t44 = space();
    			create_component(lightbox2.$$.fragment);
    			t45 = space();
    			div9 = element("div");
    			div8 = element("div");
    			h23 = element("h2");
    			h23.textContent = "■ お問い合わせ";
    			t47 = space();
    			p3 = element("p");
    			t48 = text("不具合報告や要望は ");
    			a2 = element("a");
    			a2.textContent = "GitHub issue";
    			t50 = text(" にてお願いします。");
    			attr_dev(h20, "class", "svelte-1l76kga");
    			add_location(h20, file$9, 7, 6, 171);
    			add_location(br0, file$9, 9, 30, 225);
    			add_location(br1, file$9, 10, 28, 258);
    			attr_dev(p0, "class", "svelte-1l76kga");
    			add_location(p0, file$9, 8, 6, 191);
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$9, 6, 4, 141);
    			attr_dev(div1, "class", "card border border-light shadow-sm svelte-1l76kga");
    			add_location(div1, file$9, 5, 2, 88);
    			attr_dev(h21, "class", "svelte-1l76kga");
    			add_location(h21, file$9, 17, 6, 380);
    			add_location(br2, file$9, 19, 30, 438);
    			attr_dev(a0, "href", "sample/input.mp4");
    			add_location(a0, file$9, 21, 9, 511);
    			add_location(br3, file$9, 21, 44, 546);
    			add_location(br4, file$9, 22, 8, 559);
    			add_location(br5, file$9, 23, 121, 685);
    			attr_dev(a1, "href", "https://mhrise.wiki-db.com/sim/");
    			add_location(a1, file$9, 24, 8, 698);
    			add_location(br6, file$9, 24, 77, 767);
    			add_location(br7, file$9, 25, 8, 780);
    			add_location(br8, file$9, 26, 12, 797);
    			set_style(span0, "color", "red");
    			add_location(span0, file$9, 27, 10, 812);
    			add_location(br9, file$9, 27, 87, 889);
    			add_location(br10, file$9, 28, 45, 939);
    			attr_dev(p1, "class", "svelte-1l76kga");
    			add_location(p1, file$9, 18, 6, 404);
    			attr_dev(div2, "class", "lightboxes svelte-1l76kga");
    			add_location(div2, file$9, 31, 6, 962);
    			attr_dev(div3, "class", "card-body");
    			add_location(div3, file$9, 16, 4, 350);
    			attr_dev(div4, "class", "card border border-light shadow-sm svelte-1l76kga");
    			add_location(div4, file$9, 15, 2, 297);
    			attr_dev(h22, "class", "svelte-1l76kga");
    			add_location(h22, file$9, 41, 6, 1293);
    			add_location(br11, file$9, 43, 30, 1349);
    			add_location(br12, file$9, 44, 42, 1396);
    			add_location(br13, file$9, 45, 8, 1409);
    			add_location(br14, file$9, 46, 25, 1439);
    			attr_dev(span1, "class", "px-3 font-weight-bold");
    			add_location(span1, file$9, 47, 8, 1452);
    			add_location(br15, file$9, 47, 94, 1538);
    			add_location(br16, file$9, 48, 19, 1562);
    			add_location(br17, file$9, 49, 8, 1575);
    			add_location(br18, file$9, 50, 39, 1619);
    			attr_dev(span2, "class", "px-3");
    			add_location(span2, file$9, 51, 8, 1632);
    			add_location(br19, file$9, 51, 63, 1687);
    			add_location(br20, file$9, 52, 8, 1700);
    			add_location(br21, file$9, 53, 46, 1751);
    			add_location(br22, file$9, 54, 58, 1814);
    			add_location(br23, file$9, 55, 8, 1827);
    			add_location(br24, file$9, 56, 61, 1893);
    			set_style(span3, "color", "red");
    			add_location(span3, file$9, 56, 8, 1840);
    			attr_dev(p2, "class", "svelte-1l76kga");
    			add_location(p2, file$9, 42, 6, 1315);
    			attr_dev(div5, "class", "lightboxes svelte-1l76kga");
    			add_location(div5, file$9, 60, 6, 1981);
    			attr_dev(div6, "class", "card-body");
    			add_location(div6, file$9, 40, 4, 1263);
    			attr_dev(div7, "class", "card border border-light shadow-sm svelte-1l76kga");
    			add_location(div7, file$9, 39, 2, 1210);
    			attr_dev(h23, "class", "svelte-1l76kga");
    			add_location(h23, file$9, 73, 6, 2497);
    			attr_dev(a2, "href", "https://github.com/ks-yuzu/mhrise-charm-scanner-web/issues");
    			add_location(a2, file$9, 75, 18, 2543);
    			attr_dev(p3, "class", "svelte-1l76kga");
    			add_location(p3, file$9, 74, 6, 2521);
    			attr_dev(div8, "class", "card-body");
    			add_location(div8, file$9, 72, 4, 2467);
    			attr_dev(div9, "class", "card border border-light shadow-sm svelte-1l76kga");
    			add_location(div9, file$9, 71, 2, 2414);
    			attr_dev(div10, "id", "description");
    			attr_dev(div10, "class", "svelte-1l76kga");
    			add_location(div10, file$9, 4, 0, 63);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(p0, t2);
    			append_dev(p0, br0);
    			append_dev(p0, t3);
    			append_dev(p0, br1);
    			append_dev(div10, t4);
    			append_dev(div10, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h21);
    			append_dev(div3, t6);
    			append_dev(div3, p1);
    			append_dev(p1, t7);
    			append_dev(p1, br2);
    			append_dev(p1, t8);
    			append_dev(p1, a0);
    			append_dev(p1, t10);
    			append_dev(p1, br3);
    			append_dev(p1, t11);
    			append_dev(p1, br4);
    			append_dev(p1, t12);
    			append_dev(p1, br5);
    			append_dev(p1, t13);
    			append_dev(p1, a1);
    			append_dev(p1, t15);
    			append_dev(p1, br6);
    			append_dev(p1, t16);
    			append_dev(p1, br7);
    			append_dev(p1, t17);
    			append_dev(p1, br8);
    			append_dev(p1, t18);
    			append_dev(p1, span0);
    			append_dev(p1, t20);
    			append_dev(p1, br9);
    			append_dev(p1, t21);
    			append_dev(p1, br10);
    			append_dev(div3, t22);
    			append_dev(div3, div2);
    			mount_component(lightbox0, div2, null);
    			append_dev(div10, t23);
    			append_dev(div10, div7);
    			append_dev(div7, div6);
    			append_dev(div6, h22);
    			append_dev(div6, t25);
    			append_dev(div6, p2);
    			append_dev(p2, t26);
    			append_dev(p2, br11);
    			append_dev(p2, t27);
    			append_dev(p2, br12);
    			append_dev(p2, t28);
    			append_dev(p2, br13);
    			append_dev(p2, t29);
    			append_dev(p2, br14);
    			append_dev(p2, t30);
    			append_dev(p2, span1);
    			append_dev(p2, br15);
    			append_dev(p2, t32);
    			append_dev(p2, br16);
    			append_dev(p2, t33);
    			append_dev(p2, br17);
    			append_dev(p2, t34);
    			append_dev(p2, br18);
    			append_dev(p2, t35);
    			append_dev(p2, span2);
    			append_dev(p2, br19);
    			append_dev(p2, t37);
    			append_dev(p2, br20);
    			append_dev(p2, t38);
    			append_dev(p2, br21);
    			append_dev(p2, t39);
    			append_dev(p2, br22);
    			append_dev(p2, t40);
    			append_dev(p2, br23);
    			append_dev(p2, t41);
    			append_dev(p2, span3);
    			append_dev(span3, t42);
    			append_dev(span3, br24);
    			append_dev(div6, t43);
    			append_dev(div6, div5);
    			mount_component(lightbox1, div5, null);
    			append_dev(div5, t44);
    			mount_component(lightbox2, div5, null);
    			append_dev(div10, t45);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h23);
    			append_dev(div8, t47);
    			append_dev(div8, p3);
    			append_dev(p3, t48);
    			append_dev(p3, a2);
    			append_dev(p3, t50);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const lightbox0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				lightbox0_changes.$$scope = { dirty, ctx };
    			}

    			lightbox0.$set(lightbox0_changes);
    			const lightbox1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				lightbox1_changes.$$scope = { dirty, ctx };
    			}

    			lightbox1.$set(lightbox1_changes);
    			const lightbox2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				lightbox2_changes.$$scope = { dirty, ctx };
    			}

    			lightbox2.$set(lightbox2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lightbox0.$$.fragment, local);
    			transition_in(lightbox1.$$.fragment, local);
    			transition_in(lightbox2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lightbox0.$$.fragment, local);
    			transition_out(lightbox1.$$.fragment, local);
    			transition_out(lightbox2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			destroy_component(lightbox0);
    			destroy_component(lightbox1);
    			destroy_component(lightbox2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Description", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Description> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Lightbox });
    	return [];
    }

    class Description extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Description",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/CharmIxporter.svelte generated by Svelte v3.38.2 */

    const { console: console_1$3 } = globals;
    const file$8 = "src/CharmIxporter.svelte";

    function create_fragment$8(ctx) {
    	let div2;
    	let div1;
    	let textarea;
    	let t0;
    	let div0;
    	let button;
    	let t1;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			textarea = element("textarea");
    			t0 = space();
    			div0 = element("div");
    			button = element("button");
    			t1 = text("export");
    			attr_dev(textarea, "id", "input");
    			attr_dev(textarea, "class", "svelte-1m5otor");
    			add_location(textarea, file$8, 25, 4, 590);
    			attr_dev(button, "class", button_class_value = "btn btn-primary shadow-0 " + (/*charmManager*/ ctx[0] ? "" : "disabled"));
    			add_location(button, file$8, 29, 6, 845);
    			add_location(div0, file$8, 27, 4, 655);
    			attr_dev(div1, "id", "charm-ixporter");
    			attr_dev(div1, "class", "svelte-1m5otor");
    			add_location(div1, file$8, 24, 2, 560);
    			attr_dev(div2, "class", "tab-content svelte-1m5otor");
    			add_location(div2, file$8, 23, 0, 532);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, textarea);
    			set_input_value(textarea, /*textareaValue*/ ctx[1]);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[3]),
    					listen_dev(button, "click", /*exportCharms*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*textareaValue*/ 2) {
    				set_input_value(textarea, /*textareaValue*/ ctx[1]);
    			}

    			if (dirty & /*charmManager*/ 1 && button_class_value !== (button_class_value = "btn btn-primary shadow-0 " + (/*charmManager*/ ctx[0] ? "" : "disabled"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CharmIxporter", slots, []);
    	let { charmManager } = $$props;
    	let textareaValue = "";

    	async function importCharms() {
    		if (textareaValue.trim()) {
    			console.log("blank!!");
    		}
    	}

    	async function exportCharms() {
    		$$invalidate(1, textareaValue = [...(await charmManager.sql("select * from charms")).result.rows].map(row => {
    			const { skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3 } = row;
    			return [skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3].join(",");
    		}).join("\n"));
    	}

    	const writable_props = ["charmManager"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<CharmIxporter> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		textareaValue = this.value;
    		$$invalidate(1, textareaValue);
    	}

    	$$self.$$set = $$props => {
    		if ("charmManager" in $$props) $$invalidate(0, charmManager = $$props.charmManager);
    	};

    	$$self.$capture_state = () => ({
    		charmManager,
    		textareaValue,
    		importCharms,
    		exportCharms
    	});

    	$$self.$inject_state = $$props => {
    		if ("charmManager" in $$props) $$invalidate(0, charmManager = $$props.charmManager);
    		if ("textareaValue" in $$props) $$invalidate(1, textareaValue = $$props.textareaValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [charmManager, textareaValue, exportCharms, textarea_input_handler];
    }

    class CharmIxporter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { charmManager: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CharmIxporter",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*charmManager*/ ctx[0] === undefined && !("charmManager" in props)) {
    			console_1$3.warn("<CharmIxporter> was created without expected prop 'charmManager'");
    		}
    	}

    	get charmManager() {
    		throw new Error("<CharmIxporter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charmManager(value) {
    		throw new Error("<CharmIxporter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/simple-svelte-autocomplete/src/SimpleAutocomplete.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1$2, console: console_1$2 } = globals;
    const file$7 = "node_modules/simple-svelte-autocomplete/src/SimpleAutocomplete.svelte";

    const get_no_results_slot_changes = dirty => ({
    	noResultsText: dirty[0] & /*noResultsText*/ 2
    });

    const get_no_results_slot_context = ctx => ({ noResultsText: /*noResultsText*/ ctx[1] });

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[79] = list[i];
    	child_ctx[81] = i;
    	return child_ctx;
    }

    const get_item_slot_changes = dirty => ({
    	item: dirty[0] & /*filteredListItems*/ 131072,
    	label: dirty[0] & /*filteredListItems*/ 131072
    });

    const get_item_slot_context = ctx => ({
    	item: /*listItem*/ ctx[79].item,
    	label: /*listItem*/ ctx[79].highlighted
    	? /*listItem*/ ctx[79].highlighted.label
    	: /*listItem*/ ctx[79].label
    });

    // (775:2) {#if showClear}
    function create_if_block_6$1(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "✖";
    			attr_dev(span, "class", "autocomplete-clear-button svelte-77usy");
    			add_location(span, file$7, 775, 4, 17914);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*clear*/ ctx[27], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(775:2) {#if showClear}",
    		ctx
    	});

    	return block;
    }

    // (812:28) 
    function create_if_block_5$2(ctx) {
    	let div;
    	let current;
    	const no_results_slot_template = /*#slots*/ ctx[50]["no-results"];
    	const no_results_slot = create_slot(no_results_slot_template, ctx, /*$$scope*/ ctx[49], get_no_results_slot_context);
    	const no_results_slot_or_fallback = no_results_slot || fallback_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (no_results_slot_or_fallback) no_results_slot_or_fallback.c();
    			attr_dev(div, "class", "autocomplete-list-item-no-results svelte-77usy");
    			add_location(div, file$7, 812, 6, 19343);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (no_results_slot_or_fallback) {
    				no_results_slot_or_fallback.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (no_results_slot) {
    				if (no_results_slot.p && (!current || dirty[0] & /*noResultsText*/ 2 | dirty[1] & /*$$scope*/ 262144)) {
    					update_slot(no_results_slot, no_results_slot_template, ctx, /*$$scope*/ ctx[49], dirty, get_no_results_slot_changes, get_no_results_slot_context);
    				}
    			} else {
    				if (no_results_slot_or_fallback && no_results_slot_or_fallback.p && dirty[0] & /*noResultsText*/ 2) {
    					no_results_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(no_results_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(no_results_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (no_results_slot_or_fallback) no_results_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(812:28) ",
    		ctx
    	});

    	return block;
    }

    // (782:4) {#if filteredListItems && filteredListItems.length > 0}
    function create_if_block$3(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	let each_value = /*filteredListItems*/ ctx[17];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*maxItemsToShowInList*/ ctx[0] > 0 && /*filteredListItems*/ ctx[17].length > /*maxItemsToShowInList*/ ctx[0] && create_if_block_1$3(ctx);

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*highlightIndex, onListItemClick, filteredListItems, maxItemsToShowInList*/ 1212417 | dirty[1] & /*$$scope*/ 262144) {
    				each_value = /*filteredListItems*/ ctx[17];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*maxItemsToShowInList*/ ctx[0] > 0 && /*filteredListItems*/ ctx[17].length > /*maxItemsToShowInList*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(782:4) {#if filteredListItems && filteredListItems.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (814:48) {noResultsText}
    function fallback_block_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*noResultsText*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*noResultsText*/ 2) set_data_dev(t, /*noResultsText*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1$1.name,
    		type: "fallback",
    		source: "(814:48) {noResultsText}",
    		ctx
    	});

    	return block;
    }

    // (784:8) {#if listItem && (maxItemsToShowInList <= 0 || i < maxItemsToShowInList)}
    function create_if_block_2$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*listItem*/ ctx[79] && create_if_block_3$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*listItem*/ ctx[79]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*filteredListItems*/ 131072) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_3$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(784:8) {#if listItem && (maxItemsToShowInList <= 0 || i < maxItemsToShowInList)}",
    		ctx
    	});

    	return block;
    }

    // (785:10) {#if listItem}
    function create_if_block_3$2(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const item_slot_template = /*#slots*/ ctx[50].item;
    	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[49], get_item_slot_context);
    	const item_slot_or_fallback = item_slot || fallback_block(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[53](/*listItem*/ ctx[79]);
    	}

    	function pointerenter_handler() {
    		return /*pointerenter_handler*/ ctx[54](/*i*/ ctx[81]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (item_slot_or_fallback) item_slot_or_fallback.c();

    			attr_dev(div, "class", div_class_value = "autocomplete-list-item " + (/*i*/ ctx[81] === /*highlightIndex*/ ctx[15]
    			? "selected"
    			: "") + " svelte-77usy");

    			add_location(div, file$7, 785, 12, 18369);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (item_slot_or_fallback) {
    				item_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", click_handler, false, false, false),
    					listen_dev(div, "pointerenter", pointerenter_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (item_slot) {
    				if (item_slot.p && (!current || dirty[0] & /*filteredListItems*/ 131072 | dirty[1] & /*$$scope*/ 262144)) {
    					update_slot(item_slot, item_slot_template, ctx, /*$$scope*/ ctx[49], dirty, get_item_slot_changes, get_item_slot_context);
    				}
    			} else {
    				if (item_slot_or_fallback && item_slot_or_fallback.p && dirty[0] & /*filteredListItems*/ 131072) {
    					item_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty[0] & /*highlightIndex*/ 32768 && div_class_value !== (div_class_value = "autocomplete-list-item " + (/*i*/ ctx[81] === /*highlightIndex*/ ctx[15]
    			? "selected"
    			: "") + " svelte-77usy")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (item_slot_or_fallback) item_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(785:10) {#if listItem}",
    		ctx
    	});

    	return block;
    }

    // (798:16) {:else}
    function create_else_block$3(ctx) {
    	let html_tag;
    	let raw_value = /*listItem*/ ctx[79].label + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredListItems*/ 131072 && raw_value !== (raw_value = /*listItem*/ ctx[79].label + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(798:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (796:16) {#if listItem.highlighted}
    function create_if_block_4$2(ctx) {
    	let html_tag;
    	let raw_value = /*listItem*/ ctx[79].highlighted.label + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredListItems*/ 131072 && raw_value !== (raw_value = /*listItem*/ ctx[79].highlighted.label + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(796:16) {#if listItem.highlighted}",
    		ctx
    	});

    	return block;
    }

    // (795:91)                  
    function fallback_block(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*listItem*/ ctx[79].highlighted) return create_if_block_4$2;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(795:91)                  ",
    		ctx
    	});

    	return block;
    }

    // (783:6) {#each filteredListItems as listItem, i}
    function create_each_block$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*listItem*/ ctx[79] && (/*maxItemsToShowInList*/ ctx[0] <= 0 || /*i*/ ctx[81] < /*maxItemsToShowInList*/ ctx[0]) && create_if_block_2$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*listItem*/ ctx[79] && (/*maxItemsToShowInList*/ ctx[0] <= 0 || /*i*/ ctx[81] < /*maxItemsToShowInList*/ ctx[0])) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*filteredListItems, maxItemsToShowInList*/ 131073) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(783:6) {#each filteredListItems as listItem, i}",
    		ctx
    	});

    	return block;
    }

    // (807:6) {#if maxItemsToShowInList > 0 && filteredListItems.length > maxItemsToShowInList}
    function create_if_block_1$3(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*filteredListItems*/ ctx[17].length - /*maxItemsToShowInList*/ ctx[0] + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("...");
    			t1 = text(t1_value);
    			t2 = text(" results not shown");
    			attr_dev(div, "class", "autocomplete-list-item-no-results svelte-77usy");
    			add_location(div, file$7, 807, 8, 19152);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredListItems, maxItemsToShowInList*/ 131073 && t1_value !== (t1_value = /*filteredListItems*/ ctx[17].length - /*maxItemsToShowInList*/ ctx[0] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(807:6) {#if maxItemsToShowInList > 0 && filteredListItems.length > maxItemsToShowInList}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div1;
    	let input_1;
    	let input_1_class_value;
    	let input_1_id_value;
    	let input_1_autocomplete_value;
    	let t0;
    	let t1;
    	let div0;
    	let current_block_type_index;
    	let if_block1;
    	let div0_class_value;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*showClear*/ ctx[11] && create_if_block_6$1(ctx);
    	const if_block_creators = [create_if_block$3, create_if_block_5$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*filteredListItems*/ ctx[17] && /*filteredListItems*/ ctx[17].length > 0) return 0;
    		if (/*noResultsText*/ ctx[1]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			input_1 = element("input");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(input_1, "type", "text");

    			attr_dev(input_1, "class", input_1_class_value = "" + ((/*inputClassName*/ ctx[4]
    			? /*inputClassName*/ ctx[4]
    			: "") + " input autocomplete-input" + " svelte-77usy"));

    			attr_dev(input_1, "id", input_1_id_value = /*inputId*/ ctx[5] ? /*inputId*/ ctx[5] : "");
    			attr_dev(input_1, "autocomplete", input_1_autocomplete_value = /*html5autocomplete*/ ctx[8] ? "on" : "off");
    			attr_dev(input_1, "placeholder", /*placeholder*/ ctx[2]);
    			attr_dev(input_1, "name", /*name*/ ctx[6]);
    			input_1.disabled = /*disabled*/ ctx[12];
    			attr_dev(input_1, "title", /*title*/ ctx[7]);
    			add_location(input_1, file$7, 758, 2, 17476);

    			attr_dev(div0, "class", div0_class_value = "" + ((/*dropdownClassName*/ ctx[9]
    			? /*dropdownClassName*/ ctx[9]
    			: "") + " autocomplete-list " + (/*showList*/ ctx[18] ? "" : "hidden") + "\n    is-fullwidth" + " svelte-77usy"));

    			add_location(div0, file$7, 777, 2, 17997);
    			attr_dev(div1, "class", div1_class_value = "" + ((/*className*/ ctx[3] ? /*className*/ ctx[3] : "") + "\n  " + (/*hideArrow*/ ctx[10] ? "hide-arrow is-multiple" : "") + "\n  " + (/*showClear*/ ctx[11] ? "show-clear" : "") + " autocomplete select is-fullwidth " + /*uniqueId*/ ctx[19] + " svelte-77usy"));
    			add_location(div1, file$7, 754, 0, 17305);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input_1);
    			/*input_1_binding*/ ctx[51](input_1);
    			set_input_value(input_1, /*text*/ ctx[16]);
    			append_dev(div1, t0);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div0, null);
    			}

    			/*div0_binding*/ ctx[55](div0);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "click", /*onDocumentClick*/ ctx[21], false, false, false),
    					listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[52]),
    					listen_dev(input_1, "input", /*onInput*/ ctx[24], false, false, false),
    					listen_dev(input_1, "focus", /*onFocus*/ ctx[26], false, false, false),
    					listen_dev(input_1, "keydown", /*onKeyDown*/ ctx[22], false, false, false),
    					listen_dev(input_1, "click", /*onInputClick*/ ctx[25], false, false, false),
    					listen_dev(input_1, "keypress", /*onKeyPress*/ ctx[23], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*inputClassName*/ 16 && input_1_class_value !== (input_1_class_value = "" + ((/*inputClassName*/ ctx[4]
    			? /*inputClassName*/ ctx[4]
    			: "") + " input autocomplete-input" + " svelte-77usy"))) {
    				attr_dev(input_1, "class", input_1_class_value);
    			}

    			if (!current || dirty[0] & /*inputId*/ 32 && input_1_id_value !== (input_1_id_value = /*inputId*/ ctx[5] ? /*inputId*/ ctx[5] : "")) {
    				attr_dev(input_1, "id", input_1_id_value);
    			}

    			if (!current || dirty[0] & /*html5autocomplete*/ 256 && input_1_autocomplete_value !== (input_1_autocomplete_value = /*html5autocomplete*/ ctx[8] ? "on" : "off")) {
    				attr_dev(input_1, "autocomplete", input_1_autocomplete_value);
    			}

    			if (!current || dirty[0] & /*placeholder*/ 4) {
    				attr_dev(input_1, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (!current || dirty[0] & /*name*/ 64) {
    				attr_dev(input_1, "name", /*name*/ ctx[6]);
    			}

    			if (!current || dirty[0] & /*disabled*/ 4096) {
    				prop_dev(input_1, "disabled", /*disabled*/ ctx[12]);
    			}

    			if (!current || dirty[0] & /*title*/ 128) {
    				attr_dev(input_1, "title", /*title*/ ctx[7]);
    			}

    			if (dirty[0] & /*text*/ 65536 && input_1.value !== /*text*/ ctx[16]) {
    				set_input_value(input_1, /*text*/ ctx[16]);
    			}

    			if (/*showClear*/ ctx[11]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6$1(ctx);
    					if_block0.c();
    					if_block0.m(div1, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					} else {
    						if_block1.p(ctx, dirty);
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				} else {
    					if_block1 = null;
    				}
    			}

    			if (!current || dirty[0] & /*dropdownClassName, showList*/ 262656 && div0_class_value !== (div0_class_value = "" + ((/*dropdownClassName*/ ctx[9]
    			? /*dropdownClassName*/ ctx[9]
    			: "") + " autocomplete-list " + (/*showList*/ ctx[18] ? "" : "hidden") + "\n    is-fullwidth" + " svelte-77usy"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty[0] & /*className, hideArrow, showClear*/ 3080 && div1_class_value !== (div1_class_value = "" + ((/*className*/ ctx[3] ? /*className*/ ctx[3] : "") + "\n  " + (/*hideArrow*/ ctx[10] ? "hide-arrow is-multiple" : "") + "\n  " + (/*showClear*/ ctx[11] ? "show-clear" : "") + " autocomplete select is-fullwidth " + /*uniqueId*/ ctx[19] + " svelte-77usy"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*input_1_binding*/ ctx[51](null);
    			if (if_block0) if_block0.d();

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			/*div0_binding*/ ctx[55](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function safeStringFunction(theFunction, argument) {
    	if (typeof theFunction !== "function") {
    		console.error("Not a function: " + theFunction + ", argument: " + argument);
    	}

    	let originalResult;

    	try {
    		originalResult = theFunction(argument);
    	} catch(error) {
    		console.warn("Error executing Autocomplete function on value: " + argument + " function: " + theFunction);
    	}

    	let result = originalResult;

    	if (result === undefined || result === null) {
    		result = "";
    	}

    	if (typeof result !== "string") {
    		result = result.toString();
    	}

    	return result;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let showList;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SimpleAutocomplete", slots, ['item','no-results']);
    	let { items = [] } = $$props;
    	let { searchFunction = false } = $$props;
    	let { labelFieldName = undefined } = $$props;
    	let { keywordsFieldName = labelFieldName } = $$props;
    	let { valueFieldName = undefined } = $$props;

    	let { labelFunction = function (item) {
    		if (item === undefined || item === null) {
    			return "";
    		}

    		return labelFieldName ? item[labelFieldName] : item;
    	} } = $$props;

    	let { keywordsFunction = function (item) {
    		if (item === undefined || item === null) {
    			return "";
    		}

    		return keywordsFieldName
    		? item[keywordsFieldName]
    		: labelFunction(item);
    	} } = $$props;

    	let { valueFunction = function (item) {
    		if (item === undefined || item === null) {
    			return item;
    		}

    		return valueFieldName ? item[valueFieldName] : item;
    	} } = $$props;

    	let { keywordsCleanFunction = function (keywords) {
    		return keywords;
    	} } = $$props;

    	let { textCleanFunction = function (userEnteredText) {
    		return userEnteredText;
    	} } = $$props;

    	let { beforeChange = function (oldSelectedItem, newSelectedItem) {
    		return true;
    	} } = $$props;

    	let { onChange = function (newSelectedItem) {
    		
    	} } = $$props;

    	let { selectFirstIfEmpty = false } = $$props;
    	let { minCharactersToSearch = 1 } = $$props;
    	let { maxItemsToShowInList = 0 } = $$props;
    	let { delay = 0 } = $$props;
    	let { localFiltering = true } = $$props;
    	let { noResultsText = "No results found" } = $$props;
    	let { placeholder = undefined } = $$props;
    	let { className = undefined } = $$props;
    	let { inputClassName = undefined } = $$props;
    	let { inputId = undefined } = $$props;
    	let { name = undefined } = $$props;
    	let { title = undefined } = $$props;
    	let { html5autocomplete = undefined } = $$props;
    	let { dropdownClassName = undefined } = $$props;
    	let { hideArrow = false } = $$props;
    	let { showClear = false } = $$props;
    	let { disabled = false } = $$props;
    	let { debug = false } = $$props;
    	let { selectedItem = undefined } = $$props;
    	let { value = undefined } = $$props;

    	// --- Internal State ----
    	const uniqueId = "sautocomplete-" + Math.floor(Math.random() * 1000);

    	// HTML elements
    	let input;

    	let list;

    	// UI state
    	let opened = false;

    	let highlightIndex = -1;
    	let text;
    	let filteredTextLength = 0;

    	// view model
    	let filteredListItems;

    	let listItems = [];

    	// other state
    	let inputDelayTimeout;

    	// -- Reactivity --
    	function onSelectedItemChanged() {
    		$$invalidate(30, value = valueFunction(selectedItem));
    		$$invalidate(16, text = safeLabelFunction(selectedItem));
    		onChange(selectedItem);
    	}

    	function safeLabelFunction(item) {
    		// console.log("labelFunction: " + labelFunction);
    		// console.log("safeLabelFunction, item: " + item);
    		return safeStringFunction(labelFunction, item);
    	}

    	function safeKeywordsFunction(item) {
    		// console.log("safeKeywordsFunction");
    		const keywords = safeStringFunction(keywordsFunction, item);

    		let result = safeStringFunction(keywordsCleanFunction, keywords);
    		result = result.toLowerCase().trim();

    		if (debug) {
    			console.log("Extracted keywords: '" + result + "' from item: " + JSON.stringify(item));
    		}

    		return result;
    	}

    	function prepareListItems() {
    		let tStart;

    		if (debug) {
    			tStart = performance.now();
    			console.log("prepare items to search");
    			console.log("items: " + JSON.stringify(items));
    		}

    		if (!Array.isArray(items)) {
    			console.warn("Autocomplete items / search function did not return array but", items);
    			$$invalidate(28, items = []);
    		}

    		const length = items ? items.length : 0;
    		listItems = new Array(length);

    		if (length > 0) {
    			items.forEach((item, i) => {
    				const listItem = getListItem(item);

    				if (listItem == undefined) {
    					console.log("Undefined item for: ", item);
    				}

    				listItems[i] = listItem;
    			});
    		}

    		if (debug) {
    			const tEnd = performance.now();
    			console.log(listItems.length + " items to search prepared in " + (tEnd - tStart) + " milliseconds");
    		}
    	}

    	function getListItem(item) {
    		return {
    			// keywords representation of the item
    			keywords: safeKeywordsFunction(item),
    			// item label
    			label: safeLabelFunction(item),
    			// store reference to the origial item
    			item
    		};
    	}

    	function prepareUserEnteredText(userEnteredText) {
    		if (userEnteredText === undefined || userEnteredText === null) {
    			return "";
    		}

    		const textFiltered = userEnteredText.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, " ").trim();
    		$$invalidate(48, filteredTextLength = textFiltered.length);

    		if (minCharactersToSearch > 1) {
    			if (filteredTextLength < minCharactersToSearch) {
    				return "";
    			}
    		}

    		const cleanUserEnteredText = textCleanFunction(textFiltered);
    		const textFilteredLowerCase = cleanUserEnteredText.toLowerCase().trim();

    		if (debug) {
    			console.log("Change user entered text '" + userEnteredText + "' into '" + textFilteredLowerCase + "'");
    		}

    		return textFilteredLowerCase;
    	}

    	async function search() {
    		let tStart;

    		if (debug) {
    			tStart = performance.now();
    			console.log("Searching user entered text: '" + text + "'");
    		}

    		const textFiltered = prepareUserEnteredText(text);

    		if (textFiltered === "") {
    			$$invalidate(17, filteredListItems = listItems);
    			closeIfMinCharsToSearchReached();

    			if (debug) {
    				console.log("User entered text is empty set the list of items to all items");
    			}

    			return;
    		}

    		// external search which provides items
    		if (searchFunction) {
    			$$invalidate(28, items = await searchFunction(textFiltered));
    			prepareListItems();
    		}

    		// local search
    		let tempfilteredListItems;

    		if (localFiltering) {
    			const searchWords = textFiltered.split(" ");

    			tempfilteredListItems = listItems.filter(listItem => {
    				if (!listItem) {
    					return false;
    				}

    				const itemKeywords = listItem.keywords;
    				let matches = 0;

    				searchWords.forEach(searchWord => {
    					if (itemKeywords.includes(searchWord)) {
    						matches++;
    					}
    				});

    				return matches >= searchWords.length;
    			});
    		} else {
    			tempfilteredListItems = listItems;
    		}

    		const hlfilter = highlightFilter(textFiltered, ["label"]);
    		const filteredListItemsHighlighted = tempfilteredListItems.map(hlfilter);
    		$$invalidate(17, filteredListItems = filteredListItemsHighlighted);
    		closeIfMinCharsToSearchReached();

    		if (debug) {
    			const tEnd = performance.now();
    			console.log("Search took " + (tEnd - tStart) + " milliseconds, found " + filteredListItems.length + " items");
    		}
    	}

    	// $: text, search();
    	function selectListItem(listItem) {
    		if (debug) {
    			console.log("selectListItem");
    		}

    		if ("undefined" === typeof listItem) {
    			if (debug) {
    				console.log(`listItem ${i} is undefined. Can not select.`);
    			}

    			return false;
    		}

    		const newSelectedItem = listItem.item;

    		if (beforeChange(selectedItem, newSelectedItem)) {
    			$$invalidate(29, selectedItem = newSelectedItem);
    		}

    		return true;
    	}

    	function selectItem() {
    		if (debug) {
    			console.log("selectItem");
    		}

    		const listItem = filteredListItems[highlightIndex];

    		if (selectListItem(listItem)) {
    			close();
    		}
    	}

    	function up() {
    		if (debug) {
    			console.log("up");
    		}

    		open();
    		if (highlightIndex > 0) $$invalidate(15, highlightIndex--, highlightIndex);
    		highlight();
    	}

    	function down() {
    		if (debug) {
    			console.log("down");
    		}

    		open();
    		if (highlightIndex < filteredListItems.length - 1) $$invalidate(15, highlightIndex++, highlightIndex);
    		highlight();
    	}

    	function highlight() {
    		if (debug) {
    			console.log("highlight");
    		}

    		const query = ".selected";

    		if (debug) {
    			console.log("Seaching DOM element: " + query + " in " + list);
    		}

    		const el = list && list.querySelector(query);

    		if (el) {
    			if (typeof el.scrollIntoViewIfNeeded === "function") {
    				if (debug) {
    					console.log("Scrolling selected item into view");
    				}

    				el.scrollIntoViewIfNeeded();
    			} else {
    				if (debug) {
    					console.warn("Could not scroll selected item into view, scrollIntoViewIfNeeded not supported");
    				}
    			}
    		} else {
    			if (debug) {
    				console.warn("Selected item not found to scroll into view");
    			}
    		}
    	}

    	function onListItemClick(listItem) {
    		if (debug) {
    			console.log("onListItemClick");
    		}

    		if (selectListItem(listItem)) {
    			close();
    		}
    	}

    	function onDocumentClick(e) {
    		if (debug) {
    			console.log("onDocumentClick: " + JSON.stringify(e.target));
    		}

    		if (e.target.closest("." + uniqueId)) {
    			if (debug) {
    				console.log("onDocumentClick inside");
    			}

    			// resetListToAllItemsAndOpen();
    			highlight();
    		} else {
    			if (debug) {
    				console.log("onDocumentClick outside");
    			}

    			close();
    		}
    	}

    	function onKeyDown(e) {
    		if (debug) {
    			console.log("onKeyDown");
    		}

    		let key = e.key;
    		if (key === "Tab" && e.shiftKey) key = "ShiftTab";

    		const fnmap = {
    			Tab: opened ? down.bind(this) : null,
    			ShiftTab: opened ? up.bind(this) : null,
    			ArrowDown: down.bind(this),
    			ArrowUp: up.bind(this),
    			Escape: onEsc.bind(this)
    		};

    		const fn = fnmap[key];

    		if (typeof fn === "function") {
    			e.preventDefault();
    			fn(e);
    		}
    	}

    	function onKeyPress(e) {
    		if (debug) {
    			console.log("onKeyPress");
    		}

    		if (e.key === "Enter") {
    			e.preventDefault();
    			selectItem();
    		}
    	}

    	function onInput(e) {
    		if (debug) {
    			console.log("onInput");
    		}

    		$$invalidate(16, text = e.target.value);

    		if (inputDelayTimeout) {
    			clearTimeout(inputDelayTimeout);
    		}

    		if (delay) {
    			inputDelayTimeout = setTimeout(processInput, delay);
    		} else {
    			processInput();
    		}
    	}

    	function processInput() {
    		search();
    		$$invalidate(15, highlightIndex = 0);
    		open();
    	}

    	function onInputClick() {
    		if (debug) {
    			console.log("onInputClick");
    		}

    		resetListToAllItemsAndOpen();
    	}

    	function onEsc(e) {
    		if (debug) {
    			console.log("onEsc");
    		}

    		//if (text) return clear();
    		e.stopPropagation();

    		if (opened) {
    			input.focus();
    			close();
    		}
    	}

    	function onFocus() {
    		if (debug) {
    			console.log("onFocus");
    		}

    		resetListToAllItemsAndOpen();
    	}

    	function resetListToAllItemsAndOpen() {
    		if (debug) {
    			console.log("resetListToAllItemsAndOpen");
    		}

    		$$invalidate(17, filteredListItems = listItems);
    		open();

    		// find selected item
    		if (selectedItem) {
    			if (debug) {
    				console.log("Searching currently selected item: " + JSON.stringify(selectedItem));
    			}

    			for (let i = 0; i < listItems.length; i++) {
    				const listItem = listItems[i];

    				if ("undefined" === typeof listItem) {
    					if (debug) {
    						console.log(`listItem ${i} is undefined. Skipping.`);
    					}

    					continue;
    				}

    				if (debug) {
    					console.log("Item " + i + ": " + JSON.stringify(listItem));
    				}

    				if (selectedItem == listItem.item) {
    					$$invalidate(15, highlightIndex = i);

    					if (debug) {
    						console.log("Found selected item: " + i + ": " + JSON.stringify(listItem));
    					}

    					highlight();
    					break;
    				}
    			}
    		}
    	}

    	function open() {
    		if (debug) {
    			console.log("open");
    		}

    		// check if the search text has more than the min chars required
    		if (isMinCharsToSearchReached()) {
    			return;
    		}

    		$$invalidate(47, opened = true);
    	}

    	function close() {
    		if (debug) {
    			console.log("close");
    		}

    		$$invalidate(47, opened = false);

    		if (!text && selectFirstIfEmpty) {
    			highlightFilter = 0;
    			selectItem();
    		}
    	}

    	function isMinCharsToSearchReached() {
    		return minCharactersToSearch > 1 && filteredTextLength < minCharactersToSearch;
    	}

    	function closeIfMinCharsToSearchReached() {
    		if (isMinCharsToSearchReached()) {
    			close();
    		}
    	}

    	function clear() {
    		if (debug) {
    			console.log("clear");
    		}

    		$$invalidate(16, text = "");
    		$$invalidate(29, selectedItem = undefined);

    		setTimeout(() => {
    			input.focus();
    			close();
    		});
    	}

    	function onBlur() {
    		if (debug) {
    			console.log("onBlur");
    		}

    		close();
    	}

    	// 'item number one'.replace(/(it)(.*)(nu)(.*)(one)/ig, '<b>$1</b>$2 <b>$3</b>$4 <b>$5</b>')
    	function highlightFilter(q, fields) {
    		const qs = "(" + q.trim().replace(/\s/g, ")(.*)(") + ")";
    		const reg = new RegExp(qs, "ig");
    		let n = 1;
    		const len = qs.split(")(").length + 1;
    		let repl = "";
    		for (; n < len; n++) repl += n % 2 ? `<b>$${n}</b>` : `$${n}`;

    		return i => {
    			const newI = Object.assign({ highlighted: {} }, i);

    			if (fields) {
    				fields.forEach(f => {
    					if (!newI[f]) return;
    					newI.highlighted[f] = newI[f].replace(reg, repl);
    				});
    			}

    			return newI;
    		};
    	}

    	const writable_props = [
    		"items",
    		"searchFunction",
    		"labelFieldName",
    		"keywordsFieldName",
    		"valueFieldName",
    		"labelFunction",
    		"keywordsFunction",
    		"valueFunction",
    		"keywordsCleanFunction",
    		"textCleanFunction",
    		"beforeChange",
    		"onChange",
    		"selectFirstIfEmpty",
    		"minCharactersToSearch",
    		"maxItemsToShowInList",
    		"delay",
    		"localFiltering",
    		"noResultsText",
    		"placeholder",
    		"className",
    		"inputClassName",
    		"inputId",
    		"name",
    		"title",
    		"html5autocomplete",
    		"dropdownClassName",
    		"hideArrow",
    		"showClear",
    		"disabled",
    		"debug",
    		"selectedItem",
    		"value"
    	];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<SimpleAutocomplete> was created with unknown prop '${key}'`);
    	});

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(13, input);
    		});
    	}

    	function input_1_input_handler() {
    		text = this.value;
    		$$invalidate(16, text);
    	}

    	const click_handler = listItem => onListItemClick(listItem);

    	const pointerenter_handler = i => {
    		$$invalidate(15, highlightIndex = i);
    	};

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			list = $$value;
    			$$invalidate(14, list);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(28, items = $$props.items);
    		if ("searchFunction" in $$props) $$invalidate(31, searchFunction = $$props.searchFunction);
    		if ("labelFieldName" in $$props) $$invalidate(32, labelFieldName = $$props.labelFieldName);
    		if ("keywordsFieldName" in $$props) $$invalidate(33, keywordsFieldName = $$props.keywordsFieldName);
    		if ("valueFieldName" in $$props) $$invalidate(34, valueFieldName = $$props.valueFieldName);
    		if ("labelFunction" in $$props) $$invalidate(35, labelFunction = $$props.labelFunction);
    		if ("keywordsFunction" in $$props) $$invalidate(36, keywordsFunction = $$props.keywordsFunction);
    		if ("valueFunction" in $$props) $$invalidate(37, valueFunction = $$props.valueFunction);
    		if ("keywordsCleanFunction" in $$props) $$invalidate(38, keywordsCleanFunction = $$props.keywordsCleanFunction);
    		if ("textCleanFunction" in $$props) $$invalidate(39, textCleanFunction = $$props.textCleanFunction);
    		if ("beforeChange" in $$props) $$invalidate(40, beforeChange = $$props.beforeChange);
    		if ("onChange" in $$props) $$invalidate(41, onChange = $$props.onChange);
    		if ("selectFirstIfEmpty" in $$props) $$invalidate(42, selectFirstIfEmpty = $$props.selectFirstIfEmpty);
    		if ("minCharactersToSearch" in $$props) $$invalidate(43, minCharactersToSearch = $$props.minCharactersToSearch);
    		if ("maxItemsToShowInList" in $$props) $$invalidate(0, maxItemsToShowInList = $$props.maxItemsToShowInList);
    		if ("delay" in $$props) $$invalidate(44, delay = $$props.delay);
    		if ("localFiltering" in $$props) $$invalidate(45, localFiltering = $$props.localFiltering);
    		if ("noResultsText" in $$props) $$invalidate(1, noResultsText = $$props.noResultsText);
    		if ("placeholder" in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ("className" in $$props) $$invalidate(3, className = $$props.className);
    		if ("inputClassName" in $$props) $$invalidate(4, inputClassName = $$props.inputClassName);
    		if ("inputId" in $$props) $$invalidate(5, inputId = $$props.inputId);
    		if ("name" in $$props) $$invalidate(6, name = $$props.name);
    		if ("title" in $$props) $$invalidate(7, title = $$props.title);
    		if ("html5autocomplete" in $$props) $$invalidate(8, html5autocomplete = $$props.html5autocomplete);
    		if ("dropdownClassName" in $$props) $$invalidate(9, dropdownClassName = $$props.dropdownClassName);
    		if ("hideArrow" in $$props) $$invalidate(10, hideArrow = $$props.hideArrow);
    		if ("showClear" in $$props) $$invalidate(11, showClear = $$props.showClear);
    		if ("disabled" in $$props) $$invalidate(12, disabled = $$props.disabled);
    		if ("debug" in $$props) $$invalidate(46, debug = $$props.debug);
    		if ("selectedItem" in $$props) $$invalidate(29, selectedItem = $$props.selectedItem);
    		if ("value" in $$props) $$invalidate(30, value = $$props.value);
    		if ("$$scope" in $$props) $$invalidate(49, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		items,
    		searchFunction,
    		labelFieldName,
    		keywordsFieldName,
    		valueFieldName,
    		labelFunction,
    		keywordsFunction,
    		valueFunction,
    		keywordsCleanFunction,
    		textCleanFunction,
    		beforeChange,
    		onChange,
    		selectFirstIfEmpty,
    		minCharactersToSearch,
    		maxItemsToShowInList,
    		delay,
    		localFiltering,
    		noResultsText,
    		placeholder,
    		className,
    		inputClassName,
    		inputId,
    		name,
    		title,
    		html5autocomplete,
    		dropdownClassName,
    		hideArrow,
    		showClear,
    		disabled,
    		debug,
    		selectedItem,
    		value,
    		uniqueId,
    		input,
    		list,
    		opened,
    		highlightIndex,
    		text,
    		filteredTextLength,
    		filteredListItems,
    		listItems,
    		inputDelayTimeout,
    		onSelectedItemChanged,
    		safeStringFunction,
    		safeLabelFunction,
    		safeKeywordsFunction,
    		prepareListItems,
    		getListItem,
    		prepareUserEnteredText,
    		search,
    		selectListItem,
    		selectItem,
    		up,
    		down,
    		highlight,
    		onListItemClick,
    		onDocumentClick,
    		onKeyDown,
    		onKeyPress,
    		onInput,
    		processInput,
    		onInputClick,
    		onEsc,
    		onFocus,
    		resetListToAllItemsAndOpen,
    		open,
    		close,
    		isMinCharsToSearchReached,
    		closeIfMinCharsToSearchReached,
    		clear,
    		onBlur,
    		highlightFilter,
    		showList
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(28, items = $$props.items);
    		if ("searchFunction" in $$props) $$invalidate(31, searchFunction = $$props.searchFunction);
    		if ("labelFieldName" in $$props) $$invalidate(32, labelFieldName = $$props.labelFieldName);
    		if ("keywordsFieldName" in $$props) $$invalidate(33, keywordsFieldName = $$props.keywordsFieldName);
    		if ("valueFieldName" in $$props) $$invalidate(34, valueFieldName = $$props.valueFieldName);
    		if ("labelFunction" in $$props) $$invalidate(35, labelFunction = $$props.labelFunction);
    		if ("keywordsFunction" in $$props) $$invalidate(36, keywordsFunction = $$props.keywordsFunction);
    		if ("valueFunction" in $$props) $$invalidate(37, valueFunction = $$props.valueFunction);
    		if ("keywordsCleanFunction" in $$props) $$invalidate(38, keywordsCleanFunction = $$props.keywordsCleanFunction);
    		if ("textCleanFunction" in $$props) $$invalidate(39, textCleanFunction = $$props.textCleanFunction);
    		if ("beforeChange" in $$props) $$invalidate(40, beforeChange = $$props.beforeChange);
    		if ("onChange" in $$props) $$invalidate(41, onChange = $$props.onChange);
    		if ("selectFirstIfEmpty" in $$props) $$invalidate(42, selectFirstIfEmpty = $$props.selectFirstIfEmpty);
    		if ("minCharactersToSearch" in $$props) $$invalidate(43, minCharactersToSearch = $$props.minCharactersToSearch);
    		if ("maxItemsToShowInList" in $$props) $$invalidate(0, maxItemsToShowInList = $$props.maxItemsToShowInList);
    		if ("delay" in $$props) $$invalidate(44, delay = $$props.delay);
    		if ("localFiltering" in $$props) $$invalidate(45, localFiltering = $$props.localFiltering);
    		if ("noResultsText" in $$props) $$invalidate(1, noResultsText = $$props.noResultsText);
    		if ("placeholder" in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ("className" in $$props) $$invalidate(3, className = $$props.className);
    		if ("inputClassName" in $$props) $$invalidate(4, inputClassName = $$props.inputClassName);
    		if ("inputId" in $$props) $$invalidate(5, inputId = $$props.inputId);
    		if ("name" in $$props) $$invalidate(6, name = $$props.name);
    		if ("title" in $$props) $$invalidate(7, title = $$props.title);
    		if ("html5autocomplete" in $$props) $$invalidate(8, html5autocomplete = $$props.html5autocomplete);
    		if ("dropdownClassName" in $$props) $$invalidate(9, dropdownClassName = $$props.dropdownClassName);
    		if ("hideArrow" in $$props) $$invalidate(10, hideArrow = $$props.hideArrow);
    		if ("showClear" in $$props) $$invalidate(11, showClear = $$props.showClear);
    		if ("disabled" in $$props) $$invalidate(12, disabled = $$props.disabled);
    		if ("debug" in $$props) $$invalidate(46, debug = $$props.debug);
    		if ("selectedItem" in $$props) $$invalidate(29, selectedItem = $$props.selectedItem);
    		if ("value" in $$props) $$invalidate(30, value = $$props.value);
    		if ("input" in $$props) $$invalidate(13, input = $$props.input);
    		if ("list" in $$props) $$invalidate(14, list = $$props.list);
    		if ("opened" in $$props) $$invalidate(47, opened = $$props.opened);
    		if ("highlightIndex" in $$props) $$invalidate(15, highlightIndex = $$props.highlightIndex);
    		if ("text" in $$props) $$invalidate(16, text = $$props.text);
    		if ("filteredTextLength" in $$props) $$invalidate(48, filteredTextLength = $$props.filteredTextLength);
    		if ("filteredListItems" in $$props) $$invalidate(17, filteredListItems = $$props.filteredListItems);
    		if ("listItems" in $$props) listItems = $$props.listItems;
    		if ("inputDelayTimeout" in $$props) inputDelayTimeout = $$props.inputDelayTimeout;
    		if ("showList" in $$props) $$invalidate(18, showList = $$props.showList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*selectedItem*/ 536870912) {
    			(onSelectedItemChanged());
    		}

    		if ($$self.$$.dirty[0] & /*items*/ 268435456 | $$self.$$.dirty[1] & /*opened, filteredTextLength*/ 196608) {
    			$$invalidate(18, showList = opened && (items && items.length > 0 || filteredTextLength > 0));
    		}

    		if ($$self.$$.dirty[0] & /*items*/ 268435456) {
    			(prepareListItems());
    		}
    	};

    	return [
    		maxItemsToShowInList,
    		noResultsText,
    		placeholder,
    		className,
    		inputClassName,
    		inputId,
    		name,
    		title,
    		html5autocomplete,
    		dropdownClassName,
    		hideArrow,
    		showClear,
    		disabled,
    		input,
    		list,
    		highlightIndex,
    		text,
    		filteredListItems,
    		showList,
    		uniqueId,
    		onListItemClick,
    		onDocumentClick,
    		onKeyDown,
    		onKeyPress,
    		onInput,
    		onInputClick,
    		onFocus,
    		clear,
    		items,
    		selectedItem,
    		value,
    		searchFunction,
    		labelFieldName,
    		keywordsFieldName,
    		valueFieldName,
    		labelFunction,
    		keywordsFunction,
    		valueFunction,
    		keywordsCleanFunction,
    		textCleanFunction,
    		beforeChange,
    		onChange,
    		selectFirstIfEmpty,
    		minCharactersToSearch,
    		delay,
    		localFiltering,
    		debug,
    		opened,
    		filteredTextLength,
    		$$scope,
    		slots,
    		input_1_binding,
    		input_1_input_handler,
    		click_handler,
    		pointerenter_handler,
    		div0_binding
    	];
    }

    class SimpleAutocomplete extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$7,
    			create_fragment$7,
    			safe_not_equal,
    			{
    				items: 28,
    				searchFunction: 31,
    				labelFieldName: 32,
    				keywordsFieldName: 33,
    				valueFieldName: 34,
    				labelFunction: 35,
    				keywordsFunction: 36,
    				valueFunction: 37,
    				keywordsCleanFunction: 38,
    				textCleanFunction: 39,
    				beforeChange: 40,
    				onChange: 41,
    				selectFirstIfEmpty: 42,
    				minCharactersToSearch: 43,
    				maxItemsToShowInList: 0,
    				delay: 44,
    				localFiltering: 45,
    				noResultsText: 1,
    				placeholder: 2,
    				className: 3,
    				inputClassName: 4,
    				inputId: 5,
    				name: 6,
    				title: 7,
    				html5autocomplete: 8,
    				dropdownClassName: 9,
    				hideArrow: 10,
    				showClear: 11,
    				disabled: 12,
    				debug: 46,
    				selectedItem: 29,
    				value: 30
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SimpleAutocomplete",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get items() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelFieldName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelFieldName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keywordsFieldName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keywordsFieldName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valueFieldName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valueFieldName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keywordsFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keywordsFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valueFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valueFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keywordsCleanFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keywordsCleanFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textCleanFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textCleanFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get beforeChange() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set beforeChange(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onChange() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onChange(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectFirstIfEmpty() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectFirstIfEmpty(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minCharactersToSearch() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minCharactersToSearch(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxItemsToShowInList() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxItemsToShowInList(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get delay() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set delay(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get localFiltering() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set localFiltering(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noResultsText() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noResultsText(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputClassName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputClassName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputId() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputId(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get html5autocomplete() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set html5autocomplete(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dropdownClassName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dropdownClassName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideArrow() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideArrow(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showClear() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showClear(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get debug() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set debug(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedItem() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedItem(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const allSkills = [
      // 'あ行のスキル',
      'アイテム使用強化',
      '泡沫の舞',
      '炎鱗の恩恵',
      '鬼火纏',
      // 'か行のスキル',
      'ガード強化',
      'ガード性能',
      '会心撃【属性】',
      '回避距離UP',
      '回避性能',
      '回復速度',
      '翔蟲使い',
      '火事場力',
      '滑走強化',
      '霞皮の恩恵',
      '雷属性攻撃強化',
      '雷耐性',
      '貫通弾・貫通矢強化',
      '気絶耐性',
      'キノコ大好き',
      '逆襲',
      '強化持続',
      'KO術',
      '広域化',
      '幸運',
      '鋼殻の恩恵',
      '攻撃',
      '剛刃研磨',
      '高速変形',
      '氷属性攻撃強化',
      '氷耐性',
      '渾身',
      // 'さ行のスキル',
      '逆恨み',
      '散弾・拡散矢強化',
      '死中に活',
      '弱点特効',
      'ジャンプ鉄人',
      '集中',
      '植生学',
      '心眼',
      '睡眠属性強化',
      '睡眠耐性',
      'スタミナ急速回復',
      'スタミナ奪取',
      '精霊の加護',
      '攻めの守勢',
      '装填拡張',
      '装填速度',
      '速射強化',
      '属性やられ耐性',
      // 'た行のスキル',
      '体術',
      '耐震',
      '体力回復量UP',
      '匠',
      '達人芸',
      '弾丸節約',
      '弾導強化',
      '力の解放',
      '地質学',
      '超会心',
      '挑戦者',
      '通常弾・連射矢強化',
      '泥雪耐性',
      '砥石使用高速化',
      '特殊射撃強化',
      '毒属性強化',
      '毒耐性',
      '飛び込み',
      '鈍器使い',
      // 'な行のスキル',
      '納刀術',
      '乗り名人',
      // 'は行のスキル',
      '破壊王',
      '剥ぎ取り鉄人',
      '剥ぎ取り名人',
      '爆破属性強化',
      '爆破やられ耐性',
      '抜刀術【力】',
      '抜刀術【技】',
      '早食い',
      '腹減り耐性',
      '反動軽減',
      '火属性攻撃強化',
      '火耐性',
      'ひるみ軽減',
      '風圧耐性',
      '風紋の一致',
      '笛吹き名人',
      '不屈',
      'フルチャージ',
      'ブレ抑制',
      '壁面移動',
      '防御',
      '砲術',
      '砲弾装填',
      '捕獲名人',
      'ボマー',
      // 'ま行のスキル',
      '麻痺属性強化',
      '麻痺耐性',
      '満足感',
      '見切り',
      '水属性攻撃強化',
      '水耐性',
      '耳栓',
      // 'や行のスキル',
      '弓溜め段階解放',
      '陽動',
      // 'ら行のスキル',
      '雷紋の一致',
      'ランナー',
      '龍属性攻撃強化',
      '龍耐性',
      // 'わ行のスキル',
      '業物',
    ];


    const allSkillDetails = [
      // 'あ行のスキル',
      { name: 'アイテム使用強化',   hiragana: 'あいてむしようきょうか',           englishCharacters: 'aitemusiyoukyouka'            },
      { name: '泡沫の舞',           hiragana: 'うたかたのまい',                   englishCharacters: 'utakatanomai'                 },
      { name: '炎鱗の恩恵',         hiragana: 'えんりんのおんけい',               englishCharacters: 'enrinnoonkei'                 },
      { name: '鬼火纏',             hiragana: 'おにびまとい',                     englishCharacters: 'onibimatoi'                   },
      // 'か行のスキル',
      { name: 'ガード強化',         hiragana: 'がーどきょうか',                   englishCharacters: 'ga-dokyouka'                  },
      { name: 'ガード性能',         hiragana: 'がーどせいのう',                   englishCharacters: 'ga-doseinou'                  },
      { name: '会心撃【属性】',     hiragana: 'かいしんげきぞくせい',             englishCharacters: 'kaisingekizokusei'            },
      { name: '回避距離UP',         hiragana: 'かいひきょりあっぷ',               englishcharacters: 'kaihikyoriappu'               },
      { name: '回避性能',           hiragana: 'かいひせいのう',                   englishCharacters: 'kaihiseinou'                  },
      { name: '回復速度',           hiragana: 'かいふくそくど',                   englishCharacters: 'kaihukusokudo'                },
      { name: '翔蟲使い',           hiragana: 'かけりむしつかい',                 englishCharacters: 'kakerimusitukai'              },
      { name: '火事場力',           hiragana: 'かじばりょく',                     englishCharacters: 'kajibaryoku'                  },
      { name: '滑走強化',           hiragana: 'かっそうきょうか',                 englishCharacters: 'kassoukyouka'                 },
      { name: '霞皮の恩恵',         hiragana: 'かすみがわのおんけい',             englishCharacters: 'kasumigawanoonkei'            },
      { name: '雷属性攻撃強化',     hiragana: 'かみなりぞくせいこうげききょうか', englishCharacters: 'kaminarizokuseikougekikyouka' },
      { name: '雷耐性',             hiragana: 'かみなりたいせい',                 englishCharacters: 'kaminaritaisei'               },
      { name: '貫通弾・貫通矢強化', hiragana: 'かんつうだんかんつうやきょうか',   englishCharacters: 'kantuudankantuuyakyouka'      },
      { name: '気絶耐性',           hiragana: 'きぜつたいせい',                   englishCharacters: 'kizetutaisei'                 },
      { name: 'キノコ大好き',       hiragana: 'きのこだいすき',                   englishCharacters: 'kinokodaisuki'                },
      { name: '逆襲',               hiragana: 'ぎゃくしゅう',                     englishCharacters: 'gyakusyuu'                    },
      { name: '強化持続',           hiragana: 'きょうかじぞく',                   englishCharacters: 'kyoukajizoku'                 },
      { name: 'KO術',               hiragana: 'けーおーじゅつ',                   englishcharacters: 'ke-o-jutu'                    },
      { name: '広域化',             hiragana: 'こういきか',                       englishCharacters: 'kouikika'                     },
      { name: '幸運',               hiragana: 'こううん',                         englishCharacters: 'kouun'                        },
      { name: '鋼殻の恩恵',         hiragana: 'こうかくのおんけい',               englishCharacters: 'koukakunoonkei'               },
      { name: '攻撃',               hiragana: 'こうげき',                         englishCharacters: 'kougeki'                      },
      { name: '剛刃研磨',           hiragana: 'ごうじんけんま',                   englishCharacters: 'goujinkenma'                  },
      { name: '高速変形',           hiragana: 'こうそくへんけい',                 englishCharacters: 'kousokuhenkei'                },
      { name: '氷属性攻撃強化',     hiragana: 'こおりぞくせいきょうか',           englishCharacters: 'koorizokuseikyouka'           },
      { name: '氷耐性',             hiragana: 'こおりたいせい',                   englishCharacters: 'kooritaisei'                  },
      { name: '渾身',               hiragana: 'こんしん',                         englishCharacters: 'konsin'                       },
      // 'さ行のスキル',
      { name: '逆恨み',             hiragana: 'さかうらみ',                       englishCharacters: 'sakaurami'                    },
      { name: '散弾・拡散矢強化',   hiragana: 'さんだんかんつうやきょうか',       englishCharacters: 'sandankantuuyakyouka'         },
      { name: '死中に活',           hiragana: 'しちゅうにかつ',                   englishCharacters: 'sityuunikatu'                 },
      { name: '弱点特効',           hiragana: 'じゃくてんとっこう',               englishCharacters: 'jakutentokkou'                },
      { name: 'ジャンプ鉄人',       hiragana: 'じゃんぷてつじん',                 englishCharacters: 'janputetujin'                 },
      { name: '集中',               hiragana: 'しゅうちゅう',                     englishCharacters: 'syuutyuu'                     },
      { name: '植生学',             hiragana: 'しょくせいがく',                   englishCharacters: 'syokuseigaku'                 },
      { name: '心眼',               hiragana: 'しんがん',                         englishCharacters: 'singan'                       },
      { name: '睡眠属性強化',       hiragana: 'すいみんぞくせいきょうか',         englishCharacters: 'suiminzokuseikyouka'          },
      { name: '睡眠耐性',           hiragana: 'すいみんたいせい',                 englishCharacters: 'suimintaisei'                 },
      { name: 'スタミナ急速回復',   hiragana: 'すたみなきゅうそくかいふく',       englishCharacters: 'sutaminakyuusokukaihuku'      },
      { name: 'スタミナ奪取',       hiragana: 'すたみなだっしゅ',                 englishCharacters: 'sutaminadassyu'               },
      { name: '精霊の加護',         hiragana: 'せいれいのかご',                   englishCharacters: 'seireinokago'                 },
      { name: '攻めの守勢',         hiragana: 'せめのしゅせい',                   englishCharacters: 'semenosyusei'                 },
      { name: '装填拡張',           hiragana: 'そうてんかくちょう',               englishCharacters: 'soutenkakutyou'               },
      { name: '装填速度',           hiragana: 'そうてんそくど',                   englishCharacters: 'soutensokudo'                 },
      { name: '速射強化',           hiragana: 'そくしゃきょうか',                 englishCharacters: 'sokusyakyouka'                },
      { name: '属性やられ耐性',     hiragana: 'ぞくせいやられたいせい',           englishCharacters: 'zokuseiyararetaisei'          },
      // 'た行のスキル',
      { name: '体術',               hiragana: 'たいじゅつ',                       englishCharacters: 'taijutu'                      },
      { name: '耐震',               hiragana: 'たいしん',                         englishCharacters: 'taisin'                       },
      { name: '体力回復量UP',       hiragana: 'たいりょくかいふくりょうあっぷ',   englishcharacters: 'tairyokukaihukuryouappu'      },
      { name: '匠',                 hiragana: 'たくみ',                           englishCharacters: 'takumi'                       },
      { name: '達人芸',             hiragana: 'たつじんげい',                     englishCharacters: 'tatujingei'                   },
      { name: '弾丸節約',           hiragana: 'だんがんせつやく',                 englishCharacters: 'dangansetuyaku'               },
      { name: '弾導強化',           hiragana: 'だんどうきょうか',                 englishCharacters: 'dandoukyouka'                 },
      { name: '力の解放',           hiragana: 'ちからのかいほう',                 englishCharacters: 'tikaranokaihou'               },
      { name: '地質学',             hiragana: 'ちしつがく',                       englishCharacters: 'tisitugaku'                   },
      { name: '超会心',             hiragana: 'ちょうかいしん',                   englishCharacters: 'tyoukaisin'                   },
      { name: '挑戦者',             hiragana: 'ちょうせんしゃ',                   englishCharacters: 'tyousensya'                   },
      { name: '通常弾・連射矢強化', hiragana: 'つうじょうだんそくしゃやきょうか', englishCharacters: 'tuujoudansokusyayakyouka'     },
      { name: '泥雪耐性',           hiragana: 'でいせつたいせい',                 englishCharacters: 'deisetutaisei'                },
      { name: '砥石使用高速化',     hiragana: 'といししようこうそくか',           englishCharacters: 'toisisiyoukousokuka'          },
      { name: '特殊射撃強化',       hiragana: 'とくしゅしゃげききょうか',         englishCharacters: 'tokusyusyagekikyouka'         },
      { name: '毒属性強化',         hiragana: 'どくぞくせいきょうか',             englishCharacters: 'dokuzokuseikyouka'            },
      { name: '毒耐性',             hiragana: 'どくたいせい',                     englishCharacters: 'dokutaisei'                   },
      { name: '飛び込み',           hiragana: 'とびこみ',                         englishCharacters: 'tobikomi'                     },
      { name: '鈍器使い',           hiragana: 'どんきつかい',                     englishCharacters: 'donkitukai'                   },
      // 'な行のスキル',
      { name: '納刀術',             hiragana: 'のうとうじゅつ',                   englishCharacters: 'noutoujutu'                   },
      { name: '乗り名人',           hiragana: 'のりめいじん',                     englishCharacters: 'norimeijin'                   },
      // 'は行のスキル',
      { name: '破壊王',             hiragana: 'はかいおう',                       englishCharacters: 'hakaiou'                      },
      { name: '剥ぎ取り鉄人',       hiragana: 'はぎとりてつじん',                 englishCharacters: 'hagitoritetujin'              },
      { name: '剥ぎ取り名人',       hiragana: 'はぎとりめいじん',                 englishCharacters: 'hagitorimeijin'               },
      { name: '爆破属性強化',       hiragana: 'ばくはぞくせいきょうか',           englishCharacters: 'bakuhazokuseikyouka'          },
      { name: '爆破やられ耐性',     hiragana: 'ばくはやられたいせい',             englishCharacters: 'bakuhayararetaisei'           },
      { name: '抜刀術【力】',       hiragana: 'ばっとうじゅつちから',             englishCharacters: 'battoujututikara'             },
      { name: '抜刀術【技】',       hiragana: 'ばっとうじゅつわざ',               englishCharacters: 'battoujutuwaza'               },
      { name: '早食い',             hiragana: 'はやぐい',                         englishCharacters: 'hayagui'                      },
      { name: '腹減り耐性',         hiragana: 'はらへりたいせい',                 englishCharacters: 'haraheritaisei'               },
      { name: '反動軽減',           hiragana: 'はんどうけいげん',                 englishCharacters: 'handoukeigen'                 },
      { name: '火属性攻撃強化',     hiragana: 'ひぞくせいこうげききょうか',       englishCharacters: 'hizokuseikougekikyouka'       },
      { name: '火耐性',             hiragana: 'ひたいせい',                       englishCharacters: 'hitaisei'                     },
      { name: 'ひるみ軽減',         hiragana: 'ひるみけいげん',                   englishCharacters: 'hirumikeigen'                 },
      { name: '風圧耐性',           hiragana: 'ふうあつたいせい',                 englishCharacters: 'huuatutaisei'                 },
      { name: '風紋の一致',         hiragana: 'ふうもんのいっち',                 englishCharacters: 'huumonnoitti'                 },
      { name: '笛吹き名人',         hiragana: 'ふえふきめいじん',                 englishCharacters: 'huehukimeijin'                },
      { name: '不屈',               hiragana: 'ふくつ',                           englishCharacters: 'hukutu'                       },
      { name: 'フルチャージ',       hiragana: 'ふるちゃーじ',                     englishCharacters: 'hurutya-ji'                   },
      { name: 'ブレ抑制',           hiragana: 'ぶれよくせい',                     englishCharacters: 'bureyokusei'                  },
      { name: '壁面移動',           hiragana: 'へきめんいどう',                   englishCharacters: 'hekimenidou'                  },
      { name: '防御',               hiragana: 'ぼうぎょ',                         englishCharacters: 'bougyo'                       },
      { name: '砲術',               hiragana: 'ほうじゅつ',                       englishCharacters: 'houjutu'                      },
      { name: '砲弾装填',           hiragana: 'ほうだんそうてん',                 englishCharacters: 'houdansouten'                 },
      { name: '捕獲名人',           hiragana: 'ほかくめいじん',                   englishCharacters: 'hokakumeijin'                 },
      { name: 'ボマー',             hiragana: 'ぼまー',                           englishCharacters: 'boma-'                        },
      // 'ま行のスキル',
      { name: '麻痺属性強化',       hiragana: 'まひぞくせいきょうか',             englishCharacters: 'mahizokuseikyouka'            },
      { name: '麻痺耐性',           hiragana: 'まひたいせい',                     englishCharacters: 'mahitaisei'                   },
      { name: '満足感',             hiragana: 'まんぞくかん',                     englishCharacters: 'manzokukan'                   },
      { name: '見切り',             hiragana: 'みきり',                           englishCharacters: 'mikiri'                       },
      { name: '水属性攻撃強化',     hiragana: 'みずぞくせいこうげききょうか',     englishCharacters: 'mizuzokuseikougekikyouka'     },
      { name: '水耐性',             hiragana: 'みずたいせい',                     englishCharacters: 'mizutaisei'                   },
      { name: '耳栓',               hiragana: 'みみせん',                         englishCharacters: 'mimisen'                      },
      // 'や行のスキル',
      { name: '弓溜め段階解放',     hiragana: 'ゆみためだんかいかいほう',         englishCharacters: 'yumitamedankaikaihou'         },
      { name: '陽動',               hiragana: 'ようどう',                         englishCharacters: 'youdou'                       },
      // 'ら行のスキル',
      { name: '雷紋の一致',         hiragana: 'らいもんのいっち',                 englishCharacters: 'raimonnoitti'                 },
      { name: 'ランナー',           hiragana: 'らんなー',                         englishCharacters: 'ranna-'                       },
      { name: '龍属性攻撃強化',     hiragana: 'りゅうぞくせいこうげききょうか',   englishCharacters: 'ryuuzokuseikougekikyouka'     },
      { name: '龍耐性',             hiragana: 'りゅうたいせい',                   englishCharacters: 'ryuutaisei'                   },
      // 'わ行のスキル',
      { name: '業物',               hiragana: 'わざもの',                         englishCharacters: 'wazamono'                     },
    ];

    /* src/CharmSearcher.svelte generated by Svelte v3.38.2 */
    const file$6 = "src/CharmSearcher.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[8] = list;
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[10] = list;
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (48:8) {#each [...Array(skillFilters.filter(i => i).length + 1).keys()] as i}
    function create_each_block_1$3(ctx) {
    	let div;
    	let autocomplete0;
    	let updating_selectedItem;
    	let t0;
    	let autocomplete1;
    	let updating_selectedItem_1;
    	let t1;
    	let current;

    	function autocomplete0_selectedItem_binding(value) {
    		/*autocomplete0_selectedItem_binding*/ ctx[4](value, /*i*/ ctx[7]);
    	}

    	let autocomplete0_props = {
    		items: allSkillDetails,
    		labelFieldName: "name",
    		valueFieldName: "name",
    		keywordsFunction: func_1,
    		placeholder: "スキル" + (/*i*/ ctx[7] + 1),
    		showClear: true,
    		hideArrow: true,
    		className: "autocomplete-skill"
    	};

    	if (/*skillFilters*/ ctx[0][/*i*/ ctx[7]] !== void 0) {
    		autocomplete0_props.selectedItem = /*skillFilters*/ ctx[0][/*i*/ ctx[7]];
    	}

    	autocomplete0 = new SimpleAutocomplete({
    			props: autocomplete0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(autocomplete0, "selectedItem", autocomplete0_selectedItem_binding));

    	function autocomplete1_selectedItem_binding(value) {
    		/*autocomplete1_selectedItem_binding*/ ctx[5](value, /*i*/ ctx[7]);
    	}

    	let autocomplete1_props = {
    		items: [...Array(MAX_SKILL_LEVEL + 1).keys()],
    		placeholder: "Lv",
    		hideArrow: true,
    		className: "autocomplete-skill-level"
    	};

    	if (/*skillLevelFilters*/ ctx[1][/*i*/ ctx[7]] !== void 0) {
    		autocomplete1_props.selectedItem = /*skillLevelFilters*/ ctx[1][/*i*/ ctx[7]];
    	}

    	autocomplete1 = new SimpleAutocomplete({
    			props: autocomplete1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(autocomplete1, "selectedItem", autocomplete1_selectedItem_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(autocomplete0.$$.fragment);
    			t0 = space();
    			create_component(autocomplete1.$$.fragment);
    			t1 = space();
    			add_location(div, file$6, 48, 10, 1273);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(autocomplete0, div, null);
    			append_dev(div, t0);
    			mount_component(autocomplete1, div, null);
    			append_dev(div, t1);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const autocomplete0_changes = {};
    			if (dirty & /*skillFilters*/ 1) autocomplete0_changes.placeholder = "スキル" + (/*i*/ ctx[7] + 1);

    			if (!updating_selectedItem && dirty & /*skillFilters, Array*/ 1) {
    				updating_selectedItem = true;
    				autocomplete0_changes.selectedItem = /*skillFilters*/ ctx[0][/*i*/ ctx[7]];
    				add_flush_callback(() => updating_selectedItem = false);
    			}

    			autocomplete0.$set(autocomplete0_changes);
    			const autocomplete1_changes = {};

    			if (!updating_selectedItem_1 && dirty & /*skillLevelFilters, Array, skillFilters*/ 3) {
    				updating_selectedItem_1 = true;
    				autocomplete1_changes.selectedItem = /*skillLevelFilters*/ ctx[1][/*i*/ ctx[7]];
    				add_flush_callback(() => updating_selectedItem_1 = false);
    			}

    			autocomplete1.$set(autocomplete1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(autocomplete0.$$.fragment, local);
    			transition_in(autocomplete1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(autocomplete0.$$.fragment, local);
    			transition_out(autocomplete1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(autocomplete0);
    			destroy_component(autocomplete1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(48:8) {#each [...Array(skillFilters.filter(i => i).length + 1).keys()] as i}",
    		ctx
    	});

    	return block;
    }

    // (71:8) {#each [...Array(MAX_SLOTS).keys()] as i}
    function create_each_block$4(ctx) {
    	let autocomplete;
    	let updating_selectedItem;
    	let current;

    	function autocomplete_selectedItem_binding(value) {
    		/*autocomplete_selectedItem_binding*/ ctx[6](value, /*i*/ ctx[7]);
    	}

    	let autocomplete_props = {
    		items: [...Array(3).keys()].map(func_2),
    		placeholder: "スロット" + (/*i*/ ctx[7] + 1),
    		showClear: true,
    		hideArrow: true,
    		className: "autocomplete-slot-level"
    	};

    	if (/*slots*/ ctx[2][/*i*/ ctx[7]] !== void 0) {
    		autocomplete_props.selectedItem = /*slots*/ ctx[2][/*i*/ ctx[7]];
    	}

    	autocomplete = new SimpleAutocomplete({
    			props: autocomplete_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(autocomplete, "selectedItem", autocomplete_selectedItem_binding));

    	const block = {
    		c: function create() {
    			create_component(autocomplete.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(autocomplete, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const autocomplete_changes = {};

    			if (!updating_selectedItem && dirty & /*slots, Array, MAX_SLOTS*/ 4) {
    				updating_selectedItem = true;
    				autocomplete_changes.selectedItem = /*slots*/ ctx[2][/*i*/ ctx[7]];
    				add_flush_callback(() => updating_selectedItem = false);
    			}

    			autocomplete.$set(autocomplete_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(autocomplete.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(autocomplete.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(autocomplete, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(71:8) {#each [...Array(MAX_SLOTS).keys()] as i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div4;
    	let div3;
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let div2;
    	let div0;
    	let t3;
    	let t4;
    	let div1;
    	let t5;
    	let br2;
    	let t6;
    	let current;
    	let each_value_1 = [...Array(/*skillFilters*/ ctx[0].filter(func).length + 1).keys()];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = [...Array(MAX_SLOTS).keys()];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			t0 = text("登録された護石から性能検索を行います。");
    			br0 = element("br");
    			t1 = text("\n    スキルを装飾品で付けられる護石も検索対象になります。");
    			br1 = element("br");
    			t2 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t3 = text("スキル:\n        ");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			div1 = element("div");
    			t5 = text("スロット:");
    			br2 = element("br");
    			t6 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(br0, file$6, 42, 23, 1074);
    			add_location(br1, file$6, 43, 30, 1109);
    			attr_dev(div0, "id", "skills");
    			attr_dev(div0, "class", "svelte-1mbfa6t");
    			add_location(div0, file$6, 45, 6, 1153);
    			add_location(br2, file$6, 69, 13, 2186);
    			attr_dev(div1, "id", "slots");
    			attr_dev(div1, "class", "svelte-1mbfa6t");
    			add_location(div1, file$6, 68, 6, 2156);
    			attr_dev(div2, "id", "charm-search-form");
    			add_location(div2, file$6, 44, 4, 1118);
    			attr_dev(div3, "id", "charm-searcher");
    			attr_dev(div3, "class", "svelte-1mbfa6t");
    			add_location(div3, file$6, 41, 2, 1025);
    			attr_dev(div4, "class", "tab-content svelte-1mbfa6t");
    			add_location(div4, file$6, 40, 0, 997);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, t0);
    			append_dev(div3, br0);
    			append_dev(div3, t1);
    			append_dev(div3, br1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t3);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, t5);
    			append_dev(div1, br2);
    			append_dev(div1, t6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Array, MAX_SKILL_LEVEL, skillLevelFilters, skillFilters, allSkillDetails*/ 3) {
    				each_value_1 = [...Array(/*skillFilters*/ ctx[0].filter(func).length + 1).keys()];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$3(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*Array, MAX_SLOTS, slots*/ 4) {
    				each_value = [...Array(MAX_SLOTS).keys()];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const MAX_SKILL_LEVEL = 7;
    const MAX_SLOTS = 3;
    const func = i => i;
    const func_1 = s => `${s.name} ${s.hiragana} ${s.englishCharacters}`;
    const func_2 = i => i + 1;

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots$1 = {}, $$scope } = $$props;
    	validate_slots("CharmSearcher", slots$1, []);
    	let { charmManager } = $$props;
    	let skillFilters = [];
    	let skillLevelFilters = [];
    	let slots = [];
    	const writable_props = ["charmManager"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CharmSearcher> was created with unknown prop '${key}'`);
    	});

    	function autocomplete0_selectedItem_binding(value, i) {
    		if ($$self.$$.not_equal(skillFilters[i], value)) {
    			skillFilters[i] = value;
    			$$invalidate(0, skillFilters);
    		}
    	}

    	function autocomplete1_selectedItem_binding(value, i) {
    		if ($$self.$$.not_equal(skillLevelFilters[i], value)) {
    			skillLevelFilters[i] = value;
    			($$invalidate(1, skillLevelFilters), $$invalidate(0, skillFilters));
    		}
    	}

    	function autocomplete_selectedItem_binding(value, i) {
    		if ($$self.$$.not_equal(slots[i], value)) {
    			slots[i] = value;
    			$$invalidate(2, slots);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ("charmManager" in $$props) $$invalidate(3, charmManager = $$props.charmManager);
    	};

    	$$self.$capture_state = () => ({
    		AutoComplete: SimpleAutocomplete,
    		allSkillDetails,
    		charmManager,
    		MAX_SKILL_LEVEL,
    		MAX_SLOTS,
    		skillFilters,
    		skillLevelFilters,
    		slots
    	});

    	$$self.$inject_state = $$props => {
    		if ("charmManager" in $$props) $$invalidate(3, charmManager = $$props.charmManager);
    		if ("skillFilters" in $$props) $$invalidate(0, skillFilters = $$props.skillFilters);
    		if ("skillLevelFilters" in $$props) $$invalidate(1, skillLevelFilters = $$props.skillLevelFilters);
    		if ("slots" in $$props) $$invalidate(2, slots = $$props.slots);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*skillFilters, skillLevelFilters*/ 3) {
    			{
    				for (const i in skillFilters) {
    					if (skillFilters[i] && skillLevelFilters[i] == null) {
    						$$invalidate(1, skillLevelFilters[i] = 1, skillLevelFilters);
    					}

    					if (skillFilters[i] == null) {
    						skillFilters.splice(i, 1);
    						skillLevelFilters.splice(i, 1);
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*slots*/ 4) {
    			$$invalidate(2, slots = slots.sort((a, b) => b - a));
    		}
    	};

    	return [
    		skillFilters,
    		skillLevelFilters,
    		slots,
    		charmManager,
    		autocomplete0_selectedItem_binding,
    		autocomplete1_selectedItem_binding,
    		autocomplete_selectedItem_binding
    	];
    }

    class CharmSearcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { charmManager: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CharmSearcher",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*charmManager*/ ctx[3] === undefined && !("charmManager" in props)) {
    			console.warn("<CharmSearcher> was created without expected prop 'charmManager'");
    		}
    	}

    	get charmManager() {
    		throw new Error("<CharmSearcher>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charmManager(value) {
    		throw new Error("<CharmSearcher>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/SvelteTable.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1$1 } = globals;
    const file$5 = "src/SvelteTable.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[33] = list[i];
    	child_ctx[35] = i;
    	return child_ctx;
    }

    const get_after_row_slot_changes = dirty => ({ row: dirty[0] & /*c_rows*/ 8192 });
    const get_after_row_slot_context = ctx => ({ row: /*row*/ ctx[33], n: /*n*/ ctx[35] });

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	return child_ctx;
    }

    const get_row_slot_changes = dirty => ({ row: dirty[0] & /*c_rows*/ 8192 });
    const get_row_slot_context = ctx => ({ row: /*row*/ ctx[33], n: /*n*/ ctx[35] });

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	return child_ctx;
    }

    const get_header_slot_changes = dirty => ({
    	sortOrder: dirty[0] & /*sortOrder*/ 2,
    	sortBy: dirty[0] & /*sortBy*/ 1
    });

    const get_header_slot_context = ctx => ({
    	sortOrder: /*sortOrder*/ ctx[1],
    	sortBy: /*sortBy*/ ctx[0]
    });

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	child_ctx[41] = list;
    	child_ctx[42] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[43] = list[i];
    	return child_ctx;
    }

    // (117:4) {#if showFilterHeader}
    function create_if_block_4$1(ctx) {
    	let tr;
    	let each_value_3 = /*columns*/ ctx[3];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(tr, "class", "svelte-uczycn");
    			add_location(tr, file$5, 117, 6, 3608);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filterSelections, columns, asStringArray, classNameSelect, filterValues*/ 37388) {
    				each_value_3 = /*columns*/ ctx[3];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(117:4) {#if showFilterHeader}",
    		ctx
    	});

    	return block;
    }

    // (123:58) 
    function create_if_block_6(ctx) {
    	let select;
    	let option;
    	let select_class_value;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*filterValues*/ ctx[12][/*col*/ ctx[36].key];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	function select_change_handler() {
    		/*select_change_handler*/ ctx[25].call(select, /*col*/ ctx[36]);
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = undefined;
    			option.value = option.__value;
    			add_location(option, file$5, 124, 16, 3944);
    			attr_dev(select, "class", select_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameSelect*/ ctx[9])) + " svelte-uczycn"));
    			if (/*filterSelections*/ ctx[2][/*col*/ ctx[36].key] === void 0) add_render_callback(select_change_handler);
    			add_location(select, file$5, 123, 14, 3841);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*filterSelections*/ ctx[2][/*col*/ ctx[36].key]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", select_change_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*filterValues, columns*/ 4104) {
    				each_value_4 = /*filterValues*/ ctx[12][/*col*/ ctx[36].key];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}

    			if (dirty[0] & /*classNameSelect*/ 512 && select_class_value !== (select_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameSelect*/ ctx[9])) + " svelte-uczycn"))) {
    				attr_dev(select, "class", select_class_value);
    			}

    			if (dirty[0] & /*filterSelections, columns, filterValues*/ 4108) {
    				select_option(select, /*filterSelections*/ ctx[2][/*col*/ ctx[36].key]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(123:58) ",
    		ctx
    	});

    	return block;
    }

    // (121:12) {#if col.searchValue !== undefined}
    function create_if_block_5$1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[24].call(input, /*col*/ ctx[36]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			add_location(input, file$5, 121, 14, 3721);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*filterSelections*/ ctx[2][/*col*/ ctx[36].key]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*filterSelections, columns, filterValues*/ 4108 && input.value !== /*filterSelections*/ ctx[2][/*col*/ ctx[36].key]) {
    				set_input_value(input, /*filterSelections*/ ctx[2][/*col*/ ctx[36].key]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(121:12) {#if col.searchValue !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (126:16) {#each filterValues[col.key] as option}
    function create_each_block_4(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[43].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*option*/ ctx[43].value;
    			option.value = option.__value;
    			add_location(option, file$5, 126, 18, 4054);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filterValues, columns*/ 4104 && t_value !== (t_value = /*option*/ ctx[43].name + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*filterValues, columns*/ 4104 && option_value_value !== (option_value_value = /*option*/ ctx[43].value)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(126:16) {#each filterValues[col.key] as option}",
    		ctx
    	});

    	return block;
    }

    // (119:8) {#each columns as col}
    function create_each_block_3(ctx) {
    	let th;
    	let t;

    	function select_block_type(ctx, dirty) {
    		if (/*col*/ ctx[36].searchValue !== undefined) return create_if_block_5$1;
    		if (/*filterValues*/ ctx[12][/*col*/ ctx[36].key] !== undefined) return create_if_block_6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			th = element("th");
    			if (if_block) if_block.c();
    			t = space();
    			add_location(th, file$5, 119, 10, 3654);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			if (if_block) if_block.m(th, null);
    			append_dev(th, t);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(th, t);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(119:8) {#each columns as col}",
    		ctx
    	});

    	return block;
    }

    // (148:10) {:else}
    function create_else_block_1$1(ctx) {
    	let th;
    	let t0_value = /*col*/ ctx[36].title + "";
    	let t0;
    	let t1;
    	let t2;
    	let th_class_value;
    	let if_block = /*sortBy*/ ctx[0] === /*col*/ ctx[36].key && create_if_block_3$1(ctx);

    	const block = {
    		c: function create() {
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(th, "class", th_class_value = "" + (null_to_empty(/*col*/ ctx[36].headerClass) + " svelte-uczycn"));
    			add_location(th, file$5, 148, 12, 4703);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t0);
    			append_dev(th, t1);
    			if (if_block) if_block.m(th, null);
    			append_dev(th, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*columns*/ 8 && t0_value !== (t0_value = /*col*/ ctx[36].title + "")) set_data_dev(t0, t0_value);

    			if (/*sortBy*/ ctx[0] === /*col*/ ctx[36].key) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$1(ctx);
    					if_block.c();
    					if_block.m(th, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*columns, filterValues*/ 4104 && th_class_value !== (th_class_value = "" + (null_to_empty(/*col*/ ctx[36].headerClass) + " svelte-uczycn"))) {
    				attr_dev(th, "class", th_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(148:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (138:10) {#if col.sortable}
    function create_if_block_1$2(ctx) {
    	let th;
    	let t0_value = /*col*/ ctx[36].title + "";
    	let t0;
    	let t1;
    	let t2;
    	let th_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*sortBy*/ ctx[0] === /*col*/ ctx[36].key && create_if_block_2$2(ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[26](/*col*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(th, "class", th_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](["isSortable", /*col*/ ctx[36].headerClass])) + " svelte-uczycn"));
    			add_location(th, file$5, 138, 12, 4372);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t0);
    			append_dev(th, t1);
    			if (if_block) if_block.m(th, null);
    			append_dev(th, t2);

    			if (!mounted) {
    				dispose = listen_dev(th, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*columns*/ 8 && t0_value !== (t0_value = /*col*/ ctx[36].title + "")) set_data_dev(t0, t0_value);

    			if (/*sortBy*/ ctx[0] === /*col*/ ctx[36].key) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					if_block.m(th, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*columns, filterValues*/ 4104 && th_class_value !== (th_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](["isSortable", /*col*/ ctx[36].headerClass])) + " svelte-uczycn"))) {
    				attr_dev(th, "class", th_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(138:10) {#if col.sortable}",
    		ctx
    	});

    	return block;
    }

    // (153:14) {#if sortBy === col.key}
    function create_if_block_3$1(ctx) {
    	let t_value = (/*sortOrder*/ ctx[1] === 1
    	? /*iconAsc*/ ctx[4]
    	: /*iconDesc*/ ctx[5]) + "";

    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sortOrder, iconAsc, iconDesc*/ 50 && t_value !== (t_value = (/*sortOrder*/ ctx[1] === 1
    			? /*iconAsc*/ ctx[4]
    			: /*iconDesc*/ ctx[5]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(153:14) {#if sortBy === col.key}",
    		ctx
    	});

    	return block;
    }

    // (144:14) {#if sortBy === col.key}
    function create_if_block_2$2(ctx) {
    	let t_value = (/*sortOrder*/ ctx[1] === 1
    	? /*iconAsc*/ ctx[4]
    	: /*iconDesc*/ ctx[5]) + "";

    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sortOrder, iconAsc, iconDesc*/ 50 && t_value !== (t_value = (/*sortOrder*/ ctx[1] === 1
    			? /*iconAsc*/ ctx[4]
    			: /*iconDesc*/ ctx[5]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(144:14) {#if sortBy === col.key}",
    		ctx
    	});

    	return block;
    }

    // (137:8) {#each columns as col}
    function create_each_block_2$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*col*/ ctx[36].sortable) return create_if_block_1$2;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(137:8) {#each columns as col}",
    		ctx
    	});

    	return block;
    }

    // (135:62)        
    function fallback_block_2(ctx) {
    	let tr;
    	let each_value_2 = /*columns*/ ctx[3];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(tr, file$5, 135, 6, 4295);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*asStringArray, columns, handleClickCol, sortOrder, iconAsc, iconDesc, sortBy*/ 98363) {
    				each_value_2 = /*columns*/ ctx[3];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(135:62)        ",
    		ctx
    	});

    	return block;
    }

    // (177:14) {:else}
    function create_else_block$2(ctx) {
    	let html_tag;

    	let raw_value = (/*col*/ ctx[36].renderValue
    	? /*col*/ ctx[36].renderValue(/*row*/ ctx[33])
    	: /*col*/ ctx[36].value(/*row*/ ctx[33])) + "";

    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*columns, c_rows*/ 8200 && raw_value !== (raw_value = (/*col*/ ctx[36].renderValue
    			? /*col*/ ctx[36].renderValue(/*row*/ ctx[33])
    			: /*col*/ ctx[36].value(/*row*/ ctx[33])) + "")) html_tag.p(raw_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(177:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (171:14) {#if col.renderComponent}
    function create_if_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		/*col*/ ctx[36].renderComponent.props || {},
    		{ row: /*row*/ ctx[33] },
    		{ col: /*col*/ ctx[36] }
    	];

    	var switch_value = /*col*/ ctx[36].renderComponent.component || /*col*/ ctx[36].renderComponent;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*columns, c_rows*/ 8200)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty[0] & /*columns*/ 8 && get_spread_object(/*col*/ ctx[36].renderComponent.props || {}),
    					dirty[0] & /*c_rows*/ 8192 && { row: /*row*/ ctx[33] },
    					dirty[0] & /*columns*/ 8 && { col: /*col*/ ctx[36] }
    				])
    			: {};

    			if (switch_value !== (switch_value = /*col*/ ctx[36].renderComponent.component || /*col*/ ctx[36].renderComponent)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(171:14) {#if col.renderComponent}",
    		ctx
    	});

    	return block;
    }

    // (166:10) {#each columns as col}
    function create_each_block_1$2(ctx) {
    	let td;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let td_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*col*/ ctx[36].renderComponent) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[27](/*row*/ ctx[33], /*col*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			if_block.c();
    			t = space();
    			attr_dev(td, "class", td_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15]([/*col*/ ctx[36].class, /*classNameCell*/ ctx[11]])) + " svelte-uczycn"));
    			add_location(td, file$5, 166, 12, 5238);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			if_blocks[current_block_type_index].m(td, null);
    			append_dev(td, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(td, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(td, t);
    			}

    			if (!current || dirty[0] & /*columns, classNameCell, filterValues*/ 6152 && td_class_value !== (td_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15]([/*col*/ ctx[36].class, /*classNameCell*/ ctx[11]])) + " svelte-uczycn"))) {
    				attr_dev(td, "class", td_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(166:10) {#each columns as col}",
    		ctx
    	});

    	return block;
    }

    // (164:40)          
    function fallback_block_1(ctx) {
    	let tr;
    	let tr_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*columns*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[28](/*row*/ ctx[33], ...args);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(tr, "class", tr_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameRow*/ ctx[10])) + " svelte-uczycn"));
    			add_location(tr, file$5, 164, 8, 5111);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(tr, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*asStringArray, columns, classNameCell, handleClickCell, c_rows*/ 305160) {
    				each_value_1 = /*columns*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tr, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*classNameRow*/ 1024 && tr_class_value !== (tr_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameRow*/ ctx[10])) + " svelte-uczycn"))) {
    				attr_dev(tr, "class", tr_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(164:40)          ",
    		ctx
    	});

    	return block;
    }

    // (163:4) {#each c_rows as row, n}
    function create_each_block$3(ctx) {
    	let t;
    	let current;
    	const row_slot_template = /*#slots*/ ctx[23].row;
    	const row_slot = create_slot(row_slot_template, ctx, /*$$scope*/ ctx[22], get_row_slot_context);
    	const row_slot_or_fallback = row_slot || fallback_block_1(ctx);
    	const after_row_slot_template = /*#slots*/ ctx[23]["after-row"];
    	const after_row_slot = create_slot(after_row_slot_template, ctx, /*$$scope*/ ctx[22], get_after_row_slot_context);

    	const block = {
    		c: function create() {
    			if (row_slot_or_fallback) row_slot_or_fallback.c();
    			t = space();
    			if (after_row_slot) after_row_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (row_slot_or_fallback) {
    				row_slot_or_fallback.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);

    			if (after_row_slot) {
    				after_row_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (row_slot) {
    				if (row_slot.p && (!current || dirty[0] & /*$$scope, c_rows*/ 4202496)) {
    					update_slot(row_slot, row_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_row_slot_changes, get_row_slot_context);
    				}
    			} else {
    				if (row_slot_or_fallback && row_slot_or_fallback.p && dirty[0] & /*classNameRow, c_rows, columns, classNameCell*/ 11272) {
    					row_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (after_row_slot) {
    				if (after_row_slot.p && (!current || dirty[0] & /*$$scope, c_rows*/ 4202496)) {
    					update_slot(after_row_slot, after_row_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_after_row_slot_changes, get_after_row_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row_slot_or_fallback, local);
    			transition_in(after_row_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row_slot_or_fallback, local);
    			transition_out(after_row_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (row_slot_or_fallback) row_slot_or_fallback.d(detaching);
    			if (detaching) detach_dev(t);
    			if (after_row_slot) after_row_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(163:4) {#each c_rows as row, n}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let table;
    	let thead;
    	let t0;
    	let thead_class_value;
    	let t1;
    	let tbody;
    	let tbody_class_value;
    	let table_class_value;
    	let current;
    	let if_block = /*showFilterHeader*/ ctx[14] && create_if_block_4$1(ctx);
    	const header_slot_template = /*#slots*/ ctx[23].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[22], get_header_slot_context);
    	const header_slot_or_fallback = header_slot || fallback_block_2(ctx);
    	let each_value = /*c_rows*/ ctx[13];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			if (if_block) if_block.c();
    			t0 = space();
    			if (header_slot_or_fallback) header_slot_or_fallback.c();
    			t1 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(thead, "class", thead_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameThead*/ ctx[7])) + " svelte-uczycn"));
    			add_location(thead, file$5, 115, 2, 3529);
    			attr_dev(tbody, "class", tbody_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameTbody*/ ctx[8])) + " svelte-uczycn"));
    			add_location(tbody, file$5, 161, 2, 4987);
    			attr_dev(table, "class", table_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameTable*/ ctx[6])) + " svelte-uczycn"));
    			add_location(table, file$5, 114, 0, 3481);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			if (if_block) if_block.m(thead, null);
    			append_dev(thead, t0);

    			if (header_slot_or_fallback) {
    				header_slot_or_fallback.m(thead, null);
    			}

    			append_dev(table, t1);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*showFilterHeader*/ ctx[14]) if_block.p(ctx, dirty);

    			if (header_slot) {
    				if (header_slot.p && (!current || dirty[0] & /*$$scope, sortOrder, sortBy*/ 4194307)) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_header_slot_changes, get_header_slot_context);
    				}
    			} else {
    				if (header_slot_or_fallback && header_slot_or_fallback.p && dirty[0] & /*columns, sortOrder, iconAsc, iconDesc, sortBy*/ 59) {
    					header_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty[0] & /*classNameThead*/ 128 && thead_class_value !== (thead_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameThead*/ ctx[7])) + " svelte-uczycn"))) {
    				attr_dev(thead, "class", thead_class_value);
    			}

    			if (dirty[0] & /*$$scope, c_rows, asStringArray, classNameRow, handleClickRow, columns, classNameCell, handleClickCell*/ 4631560) {
    				each_value = /*c_rows*/ ctx[13];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*classNameTbody*/ 256 && tbody_class_value !== (tbody_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameTbody*/ ctx[8])) + " svelte-uczycn"))) {
    				attr_dev(tbody, "class", tbody_class_value);
    			}

    			if (!current || dirty[0] & /*classNameTable*/ 64 && table_class_value !== (table_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameTable*/ ctx[6])) + " svelte-uczycn"))) {
    				attr_dev(table, "class", table_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot_or_fallback, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot_or_fallback, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if (if_block) if_block.d();
    			if (header_slot_or_fallback) header_slot_or_fallback.d(detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let c_rows;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SvelteTable", slots, ['header','row','after-row']);
    	const dispatch = createEventDispatcher();
    	let { columns } = $$props;
    	let { rows } = $$props;
    	let { sortBy = "" } = $$props;
    	let { sortOrder = 1 } = $$props;
    	let { iconAsc = "▲" } = $$props;
    	let { iconDesc = "▼" } = $$props;
    	let { classNameTable = "" } = $$props;
    	let { classNameThead = "" } = $$props;
    	let { classNameTbody = "" } = $$props;
    	let { classNameSelect = "" } = $$props;
    	let { classNameRow = "" } = $$props;
    	let { classNameCell = "" } = $$props;
    	let { filterSelections = {} } = $$props;
    	let sortFunction = () => "";

    	let showFilterHeader = columns.some(c => {
    		// check if there are any filter or search headers
    		return c.filterOptions !== undefined || c.searchValue !== undefined;
    	});

    	let filterValues = {};
    	let searchValues = {};
    	let columnByKey = {};

    	columns.forEach(col => {
    		$$invalidate(21, columnByKey[col.key] = col, columnByKey);
    	});

    	const asStringArray = v => [].concat(v).filter(v => typeof v === "string" && v !== "").join(" ");

    	const calculateFilterValues = () => {
    		$$invalidate(12, filterValues = {});

    		columns.forEach(c => {
    			if (typeof c.filterOptions === "function") {
    				$$invalidate(12, filterValues[c.key] = c.filterOptions(rows), filterValues);
    			} else if (Array.isArray(c.filterOptions)) {
    				// if array of strings is provided, use it for name and value
    				$$invalidate(12, filterValues[c.key] = c.filterOptions.map(val => ({ name: val, value: val })), filterValues);
    			}
    		});
    	};

    	
    	

    	const updateSortOrder = colKey => {
    		if (colKey === sortBy) {
    			$$invalidate(1, sortOrder = sortOrder === 1 ? -1 : 1);
    		} else {
    			$$invalidate(1, sortOrder = 1);
    		}
    	};

    	const handleClickCol = (event, col) => {
    		updateSortOrder(col.key);
    		$$invalidate(0, sortBy = col.key);
    		dispatch("clickCol", { event, col, key: col.key });
    	};

    	const handleClickRow = (event, row) => {
    		dispatch("clickRow", { event, row });
    	};

    	const handleClickCell = (event, row, key) => {
    		dispatch("clickCell", { event, row, key });
    	};

    	const writable_props = [
    		"columns",
    		"rows",
    		"sortBy",
    		"sortOrder",
    		"iconAsc",
    		"iconDesc",
    		"classNameTable",
    		"classNameThead",
    		"classNameTbody",
    		"classNameSelect",
    		"classNameRow",
    		"classNameCell",
    		"filterSelections"
    	];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SvelteTable> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler(col) {
    		filterSelections[col.key] = this.value;
    		$$invalidate(2, filterSelections);
    		$$invalidate(3, columns);
    		$$invalidate(12, filterValues);
    	}

    	function select_change_handler(col) {
    		filterSelections[col.key] = select_value(this);
    		$$invalidate(2, filterSelections);
    		$$invalidate(3, columns);
    		$$invalidate(12, filterValues);
    	}

    	const click_handler = (col, e) => handleClickCol(e, col);

    	const click_handler_1 = (row, col, e) => {
    		handleClickCell(e, row, col.key);
    	};

    	const click_handler_2 = (row, e) => {
    		handleClickRow(e, row);
    	};

    	$$self.$$set = $$props => {
    		if ("columns" in $$props) $$invalidate(3, columns = $$props.columns);
    		if ("rows" in $$props) $$invalidate(19, rows = $$props.rows);
    		if ("sortBy" in $$props) $$invalidate(0, sortBy = $$props.sortBy);
    		if ("sortOrder" in $$props) $$invalidate(1, sortOrder = $$props.sortOrder);
    		if ("iconAsc" in $$props) $$invalidate(4, iconAsc = $$props.iconAsc);
    		if ("iconDesc" in $$props) $$invalidate(5, iconDesc = $$props.iconDesc);
    		if ("classNameTable" in $$props) $$invalidate(6, classNameTable = $$props.classNameTable);
    		if ("classNameThead" in $$props) $$invalidate(7, classNameThead = $$props.classNameThead);
    		if ("classNameTbody" in $$props) $$invalidate(8, classNameTbody = $$props.classNameTbody);
    		if ("classNameSelect" in $$props) $$invalidate(9, classNameSelect = $$props.classNameSelect);
    		if ("classNameRow" in $$props) $$invalidate(10, classNameRow = $$props.classNameRow);
    		if ("classNameCell" in $$props) $$invalidate(11, classNameCell = $$props.classNameCell);
    		if ("filterSelections" in $$props) $$invalidate(2, filterSelections = $$props.filterSelections);
    		if ("$$scope" in $$props) $$invalidate(22, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		columns,
    		rows,
    		sortBy,
    		sortOrder,
    		iconAsc,
    		iconDesc,
    		classNameTable,
    		classNameThead,
    		classNameTbody,
    		classNameSelect,
    		classNameRow,
    		classNameCell,
    		filterSelections,
    		sortFunction,
    		showFilterHeader,
    		filterValues,
    		searchValues,
    		columnByKey,
    		asStringArray,
    		calculateFilterValues,
    		updateSortOrder,
    		handleClickCol,
    		handleClickRow,
    		handleClickCell,
    		c_rows
    	});

    	$$self.$inject_state = $$props => {
    		if ("columns" in $$props) $$invalidate(3, columns = $$props.columns);
    		if ("rows" in $$props) $$invalidate(19, rows = $$props.rows);
    		if ("sortBy" in $$props) $$invalidate(0, sortBy = $$props.sortBy);
    		if ("sortOrder" in $$props) $$invalidate(1, sortOrder = $$props.sortOrder);
    		if ("iconAsc" in $$props) $$invalidate(4, iconAsc = $$props.iconAsc);
    		if ("iconDesc" in $$props) $$invalidate(5, iconDesc = $$props.iconDesc);
    		if ("classNameTable" in $$props) $$invalidate(6, classNameTable = $$props.classNameTable);
    		if ("classNameThead" in $$props) $$invalidate(7, classNameThead = $$props.classNameThead);
    		if ("classNameTbody" in $$props) $$invalidate(8, classNameTbody = $$props.classNameTbody);
    		if ("classNameSelect" in $$props) $$invalidate(9, classNameSelect = $$props.classNameSelect);
    		if ("classNameRow" in $$props) $$invalidate(10, classNameRow = $$props.classNameRow);
    		if ("classNameCell" in $$props) $$invalidate(11, classNameCell = $$props.classNameCell);
    		if ("filterSelections" in $$props) $$invalidate(2, filterSelections = $$props.filterSelections);
    		if ("sortFunction" in $$props) $$invalidate(20, sortFunction = $$props.sortFunction);
    		if ("showFilterHeader" in $$props) $$invalidate(14, showFilterHeader = $$props.showFilterHeader);
    		if ("filterValues" in $$props) $$invalidate(12, filterValues = $$props.filterValues);
    		if ("searchValues" in $$props) searchValues = $$props.searchValues;
    		if ("columnByKey" in $$props) $$invalidate(21, columnByKey = $$props.columnByKey);
    		if ("c_rows" in $$props) $$invalidate(13, c_rows = $$props.c_rows);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*columnByKey, sortBy*/ 2097153) {
    			{
    				let col = columnByKey[sortBy];

    				if (col !== undefined && col.sortable === true && typeof col.value === "function") {
    					$$invalidate(20, sortFunction = r => col.value(r));
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*rows, filterSelections, columnByKey, sortFunction, sortOrder*/ 3670022) {
    			$$invalidate(13, c_rows = rows.filter(r => {
    				// get search and filter results/matches
    				return Object.keys(filterSelections).every(f => {
    					// check search (text input) matches
    					let resSearch = filterSelections[f] === "" || columnByKey[f].searchValue && (columnByKey[f].searchValue(r) + "").toLocaleLowerCase().indexOf((filterSelections[f] + "").toLocaleLowerCase()) >= 0;

    					// check filter (dropdown) matches
    					let resFilter = resSearch || filterSelections[f] === undefined || // default to value() if filterValue() not provided in col
    					filterSelections[f] === (typeof columnByKey[f].filterValue === "function"
    					? columnByKey[f].filterValue(r)
    					: columnByKey[f].value(r));

    					return resFilter;
    				});
    			}).map(r => Object.assign({}, r, { $sortOn: sortFunction(r) })).sort((a, b) => {
    				if (a.$sortOn > b.$sortOn) return sortOrder; else if (a.$sortOn < b.$sortOn) return -sortOrder;
    				return 0;
    			}));
    		}

    		if ($$self.$$.dirty[0] & /*columns, rows*/ 524296) {
    			{
    				// if filters are enabled, watch rows and columns
    				if (showFilterHeader && columns && rows) {
    					calculateFilterValues();
    				}
    			}
    		}
    	};

    	return [
    		sortBy,
    		sortOrder,
    		filterSelections,
    		columns,
    		iconAsc,
    		iconDesc,
    		classNameTable,
    		classNameThead,
    		classNameTbody,
    		classNameSelect,
    		classNameRow,
    		classNameCell,
    		filterValues,
    		c_rows,
    		showFilterHeader,
    		asStringArray,
    		handleClickCol,
    		handleClickRow,
    		handleClickCell,
    		rows,
    		sortFunction,
    		columnByKey,
    		$$scope,
    		slots,
    		input_input_handler,
    		select_change_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class SvelteTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$5,
    			create_fragment$5,
    			safe_not_equal,
    			{
    				columns: 3,
    				rows: 19,
    				sortBy: 0,
    				sortOrder: 1,
    				iconAsc: 4,
    				iconDesc: 5,
    				classNameTable: 6,
    				classNameThead: 7,
    				classNameTbody: 8,
    				classNameSelect: 9,
    				classNameRow: 10,
    				classNameCell: 11,
    				filterSelections: 2
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvelteTable",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*columns*/ ctx[3] === undefined && !("columns" in props)) {
    			console.warn("<SvelteTable> was created without expected prop 'columns'");
    		}

    		if (/*rows*/ ctx[19] === undefined && !("rows" in props)) {
    			console.warn("<SvelteTable> was created without expected prop 'rows'");
    		}
    	}

    	get columns() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set columns(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sortBy() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sortBy(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sortOrder() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sortOrder(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconAsc() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconAsc(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconDesc() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconDesc(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classNameTable() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classNameTable(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classNameThead() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classNameThead(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classNameTbody() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classNameTbody(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classNameSelect() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classNameSelect(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classNameRow() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classNameRow(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classNameCell() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classNameCell(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterSelections() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterSelections(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const fRefleshCharmTable = writable(false);

    /* src/CharmList.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1, console: console_1$1 } = globals;
    const file$4 = "src/CharmList.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (214:2) {:else}
    function create_else_block$1(ctx) {
    	let sveltetable;
    	let current;

    	sveltetable = new SvelteTable({
    			props: {
    				columns: /*columns*/ ctx[1],
    				rows: /*charms*/ ctx[0],
    				classNameTable: ["table table-striped table-hover table-responsible"],
    				classNameThead: ["table-dark hide-first-child.disabled"],
    				$$slots: {
    					"after-row": [
    						create_after_row_slot,
    						({ n, row }) => ({ 12: n, 13: row }),
    						({ n, row }) => (n ? 4096 : 0) | (row ? 8192 : 0)
    					],
    					row: [
    						create_row_slot,
    						({ n, row }) => ({ 12: n, 13: row }),
    						({ n, row }) => (n ? 4096 : 0) | (row ? 8192 : 0)
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	sveltetable.$on("clickCol", /*onSort*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(sveltetable.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sveltetable, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sveltetable_changes = {};
    			if (dirty & /*charms*/ 1) sveltetable_changes.rows = /*charms*/ ctx[0];

    			if (dirty & /*$$scope, n, charms, row*/ 1060865) {
    				sveltetable_changes.$$scope = { dirty, ctx };
    			}

    			sveltetable.$set(sveltetable_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sveltetable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sveltetable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sveltetable, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(214:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (210:2) {#if charms == null}
    function create_if_block$1(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Loading...";
    			attr_dev(span, "class", "visually-hidden");
    			add_location(span, file$4, 211, 6, 7421);
    			attr_dev(div, "class", "spinner-border text-info svelte-77aprl");
    			attr_dev(div, "role", "status");
    			add_location(div, file$4, 210, 4, 7362);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(210:2) {#if charms == null}",
    		ctx
    	});

    	return block;
    }

    // (232:12) {:else}
    function create_else_block_2(ctx) {
    	let html_tag;

    	let raw_value = (/*col*/ ctx[17].renderValue
    	? /*col*/ ctx[17].renderValue(/*row*/ ctx[13])
    	: /*col*/ ctx[17].value(/*row*/ ctx[13])) + "";

    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 8192 && raw_value !== (raw_value = (/*col*/ ctx[17].renderValue
    			? /*col*/ ctx[17].renderValue(/*row*/ ctx[13])
    			: /*col*/ ctx[17].value(/*row*/ ctx[13])) + "")) html_tag.p(raw_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(232:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (226:12) {#if col.renderComponent}
    function create_if_block_5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		/*col*/ ctx[17].renderComponent.props || {},
    		{ row: /*row*/ ctx[13] },
    		{ col: /*col*/ ctx[17] }
    	];

    	var switch_value = /*col*/ ctx[17].renderComponent.component || /*col*/ ctx[17].renderComponent;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*columns, row*/ 8194)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*columns*/ 2 && get_spread_object(/*col*/ ctx[17].renderComponent.props || {}),
    					dirty & /*row*/ 8192 && { row: /*row*/ ctx[13] },
    					dirty & /*columns*/ 2 && { col: /*col*/ ctx[17] }
    				])
    			: {};

    			if (switch_value !== (switch_value = /*col*/ ctx[17].renderComponent.component || /*col*/ ctx[17].renderComponent)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(226:12) {#if col.renderComponent}",
    		ctx
    	});

    	return block;
    }

    // (222:8) {#each columns as col}
    function create_each_block_1$1(ctx) {
    	let td;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_5, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*col*/ ctx[17].renderComponent) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[5](/*col*/ ctx[17], /*row*/ ctx[13], /*n*/ ctx[12], ...args);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			if_block.c();
    			t = space();
    			attr_dev(td, "class", "" + (null_to_empty([/*col*/ ctx[17].class].join(" ")) + " svelte-77aprl"));
    			add_location(td, file$4, 222, 10, 7893);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			if_blocks[current_block_type_index].m(td, null);
    			append_dev(td, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(td, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(222:8) {#each columns as col}",
    		ctx
    	});

    	return block;
    }

    // (221:6) 
    function create_row_slot(ctx) {
    	let tr;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*columns*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[6](/*row*/ ctx[13], ...args);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(tr, "slot", "row");
    			add_location(tr, file$4, 220, 6, 7786);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(tr, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*columns, row*/ 8194) {
    				each_value_1 = /*columns*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tr, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_row_slot.name,
    		type: "slot",
    		source: "(221:6) ",
    		ctx
    	});

    	return block;
    }

    // (239:8) {#if row.isSubstitutableCharmsShown}
    function create_if_block_2$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3, create_if_block_4, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*row*/ ctx[13].substitutableCharms == null) return 0;
    		if (/*row*/ ctx[13].substitutableCharms.length === 0) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(239:8) {#if row.isSubstitutableCharmsShown}",
    		ctx
    	});

    	return block;
    }

    // (244:10) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let each_value = /*row*/ ctx[13].substitutableCharms;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "row-substitutes");
    			add_location(div, file$4, 244, 12, 8833);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 8192) {
    				each_value = /*row*/ ctx[13].substitutableCharms;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 150 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 150 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(244:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (242:57) 
    function create_if_block_4(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(242:57) ",
    		ctx
    	});

    	return block;
    }

    // (240:10) {#if row.substitutableCharms == null}
    function create_if_block_3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "searching...";
    			set_style(div, "width", "100%");
    			set_style(div, "border-bottom", "solid 1px #ddd");
    			add_location(div, file$4, 240, 12, 8644);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(240:10) {#if row.substitutableCharms == null}",
    		ctx
    	});

    	return block;
    }

    // (246:12) {#each row.substitutableCharms as c}
    function create_each_block$2(ctx) {
    	let div;
    	let t0_value = /*c*/ ctx[14].rowid + "";
    	let t0;
    	let t1;
    	let t2_value = /*c*/ ctx[14].skill1 + "";
    	let t2;
    	let t3_value = /*c*/ ctx[14].skill1Level + "";
    	let t3;
    	let t4;
    	let t5_value = /*c*/ ctx[14].skill2 + "";
    	let t5;
    	let t6_value = /*c*/ ctx[14].skill2Level + "";
    	let t6;
    	let t7;
    	let t8_value = /*c*/ ctx[14].slot1 + "";
    	let t8;
    	let t9;
    	let t10_value = /*c*/ ctx[14].slot2 + "";
    	let t10;
    	let t11;
    	let t12_value = /*c*/ ctx[14].slot3 + "";
    	let t12;
    	let t13;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(": ");
    			t2 = text(t2_value);
    			t3 = text(t3_value);
    			t4 = text(", ");
    			t5 = text(t5_value);
    			t6 = text(t6_value);
    			t7 = text(", ");
    			t8 = text(t8_value);
    			t9 = text("-");
    			t10 = text(t10_value);
    			t11 = text("-");
    			t12 = text(t12_value);
    			t13 = space();
    			set_style(div, "width", "100%");
    			set_style(div, "text-align", "left");
    			set_style(div, "padding", "0.3rem 2rem");
    			add_location(div, file$4, 246, 14, 8961);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, t5);
    			append_dev(div, t6);
    			append_dev(div, t7);
    			append_dev(div, t8);
    			append_dev(div, t9);
    			append_dev(div, t10);
    			append_dev(div, t11);
    			append_dev(div, t12);
    			append_dev(div, t13);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 8192 && t0_value !== (t0_value = /*c*/ ctx[14].rowid + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*row*/ 8192 && t2_value !== (t2_value = /*c*/ ctx[14].skill1 + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*row*/ 8192 && t3_value !== (t3_value = /*c*/ ctx[14].skill1Level + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*row*/ 8192 && t5_value !== (t5_value = /*c*/ ctx[14].skill2 + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*row*/ 8192 && t6_value !== (t6_value = /*c*/ ctx[14].skill2Level + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*row*/ 8192 && t8_value !== (t8_value = /*c*/ ctx[14].slot1 + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*row*/ 8192 && t10_value !== (t10_value = /*c*/ ctx[14].slot2 + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*row*/ 8192 && t12_value !== (t12_value = /*c*/ ctx[14].slot3 + "")) set_data_dev(t12, t12_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(246:12) {#each row.substitutableCharms as c}",
    		ctx
    	});

    	return block;
    }

    // (255:8) {#if charms[n].isScrennshotShown}
    function create_if_block_1$1(ctx) {
    	let div;
    	let canvas;
    	let canvas_id_value;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			canvas = element("canvas");
    			attr_dev(canvas, "id", canvas_id_value = "charm-table-row-" + /*n*/ ctx[12] + "-screenshot");
    			set_style(canvas, "width", "100%");
    			attr_dev(canvas, "class", "svelte-77aprl");
    			add_location(canvas, file$4, 256, 12, 9385);
    			set_style(div, "width", "100%");
    			set_style(div, "border-bottom", "solid 1px #ddd");
    			add_location(div, file$4, 255, 10, 9281);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, canvas);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*n*/ 4096 && canvas_id_value !== (canvas_id_value = "charm-table-row-" + /*n*/ ctx[12] + "-screenshot")) {
    				attr_dev(canvas, "id", canvas_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 100 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 100 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(255:8) {#if charms[n].isScrennshotShown}",
    		ctx
    	});

    	return block;
    }

    // (238:6) 
    function create_after_row_slot(ctx) {
    	let div;
    	let t;
    	let div_id_value;
    	let current;
    	let if_block0 = /*row*/ ctx[13].isSubstitutableCharmsShown && create_if_block_2$1(ctx);
    	let if_block1 = /*charms*/ ctx[0][/*n*/ ctx[12]].isScrennshotShown && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "slot", "after-row");
    			attr_dev(div, "id", div_id_value = "charm-table-row-" + /*n*/ ctx[12]);
    			set_style(div, "width", "100%");
    			attr_dev(div, "class", "svelte-77aprl");
    			add_location(div, file$4, 237, 6, 8457);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*row*/ ctx[13].isSubstitutableCharmsShown) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*row*/ 8192) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*charms*/ ctx[0][/*n*/ ctx[12]].isScrennshotShown) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*charms, n*/ 4097) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*n*/ 4096 && div_id_value !== (div_id_value = "charm-table-row-" + /*n*/ ctx[12])) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_after_row_slot.name,
    		type: "slot",
    		source: "(238:6) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*charms*/ ctx[0] == null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block.c();
    			attr_dev(div0, "id", "charm-list");
    			attr_dev(div0, "class", "svelte-77aprl");
    			add_location(div0, file$4, 208, 0, 7313);
    			attr_dev(div1, "class", "tab-content svelte-77aprl");
    			add_location(div1, file$4, 207, 0, 7287);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div0, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const N_CHARM_SLOT_MAX = 3;

    function instance$4($$self, $$props, $$invalidate) {
    	let $fRefleshCharmTable;
    	validate_store(fRefleshCharmTable, "fRefleshCharmTable");
    	component_subscribe($$self, fRefleshCharmTable, $$value => $$invalidate(4, $fRefleshCharmTable = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CharmList", slots, []);

    	const columns = [
    		{
    			key: "id",
    			title: "ID",
    			value: v => v.rowid,
    			sortable: true,
    			filterOptions: rows => {
    				const UNIT = 50;

    				// generate groupings of 1-50, 51-100, etc...
    				let nums = {};

    				rows.forEach(row => {
    					let num = Math.floor(row.rowid / UNIT);

    					if (nums[num] === undefined) nums[num] = {
    						name: `${num * UNIT + 1} 〜 ${(num + 1) * UNIT}`,
    						value: num
    					};
    				});

    				// fix order
    				nums = Object.entries(nums).sort().reduce((o, [k, v]) => (o[k] = v, o), {});

    				return Object.values(nums);
    			},
    			filterValue: v => Math.floor((v.rowid - 1) / 50)
    		},
    		{
    			key: "skill1",
    			title: "スキル1",
    			value: v => v.skill1,
    			filterOptions: allSkills,
    			sortable: true
    		},
    		{
    			key: "skill1Level",
    			title: "スキル1 Lv",
    			value: v => v.skill1Level,
    			filterOptions: [0, 1, 2, 3, 4, 5, 6, 7],
    			sortable: true
    		},
    		{
    			key: "skill2",
    			title: "スキル2",
    			value: v => v.skill2,
    			filterOptions: allSkills,
    			sortable: true
    		},
    		{
    			key: "skill2Level",
    			title: "スキル2 Lv",
    			value: v => v.skill2Level,
    			filterOptions: [0, 1, 2, 3, 4, 5, 6, 7],
    			sortable: true
    		},
    		...Array.from({ length: N_CHARM_SLOT_MAX }, (_, i) => i + 1).map(i => ({
    			key: `slot${i}`,
    			title: `スロット${i}`,
    			value: v => v[`slot${i}`],
    			renderValue: v => v[`slot${i}`] || "-",
    			sortable: true,
    			filterOptions: [0, 1, 2, 3]
    		})),
    		{
    			key: "evaluation",
    			title: "合計Lv",
    			value: v => v.evaluation || "-",
    			// filterOptions: rows => [...new Set(rows.map(i => i.evaluation))],
    			filterOptions: [...Array(21).keys()],
    			sortable: true
    		},
    		{
    			key: "image",
    			title: "画像",
    			value: v => v.imagename ? "有り" : "無し",
    			renderValue: v => v.imagename
    			? "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-camera-fill\" viewBox=\"0 0 16 16\"> <path d=\"M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z\"/> <path d=\"M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z\"/> </svg>"
    			: "",
    			sortable: true,
    			filterOptions: ["有り", "無し"],
    			onClick: toggleScreenshot
    		},
    		{
    			key: "substitutableCharms",
    			title: "代替",
    			value: v => (v.substitutableCharms?.length) ? "有り" : "無し",
    			renderValue: v => {
    				const question = "<span style=\"color: gray\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-question-square-fill\" viewBox=\"0 0 16 16\"> <path d=\"M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.496 6.033a.237.237 0 0 1-.24-.247C5.35 4.091 6.737 3.5 8.005 3.5c1.396 0 2.672.73 2.672 2.24 0 1.08-.635 1.594-1.244 2.057-.737.559-1.01.768-1.01 1.486v.105a.25.25 0 0 1-.25.25h-.81a.25.25 0 0 1-.25-.246l-.004-.217c-.038-.927.495-1.498 1.168-1.987.59-.444.965-.736.965-1.371 0-.825-.628-1.168-1.314-1.168-.803 0-1.253.478-1.342 1.134-.018.137-.128.25-.266.25h-.825zm2.325 6.443c-.584 0-1.009-.394-1.009-.927 0-.552.425-.94 1.01-.94.609 0 1.028.388 1.028.94 0 .533-.42.927-1.029.927z\"/> </svg> </span>";
    				const up = "<span style=\"color: mediumseagreen\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-arrow-up-square-fill\" viewBox=\"0 0 16 16\"> <path d=\"M2 16a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2zm6.5-4.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 1 0z\"/> </svg> </span>";

    				return v.substitutableCharms == null
    				? question
    				: v.substitutableCharms.length ? up : "";
    			},
    			sortable: true,
    			filterOptions: ["有り", "無し"]
    		}
    	];

    	// fields
    	let charmManager = new MHRiseCharmManager();

    	let charms = null;

    	// init
    	const init = async () => {
    		if (charmManager == null) {
    			setTimeout(init, 1000);
    		} else {
    			await updateCharmTable();
    			searchSubstitutableCharms();
    		}
    	};

    	init();

    	// functions
    	async function updateCharmTable() {
    		$$invalidate(0, charms = [...await charmManager.searchCharms("select rowid,* from charms")].map(row => {
    			row.evaluation = skillToSlotLevel[row.skill1] * row.skill1Level + skillToSlotLevel[row.skill2] * row.skill2Level + row.slot1 + row.slot2 + row.slot3;
    			return row;
    		}));
    	}

    	async function searchSubstitutableCharms() {
    		while (typeof Module.getSubstitutesAll !== "function") {
    			await new Promise(r => setTimeout(r, 100));
    		}

    		const res = Module.getSubstitutesAll(JSON.stringify(charms)); // use wasm module
    		const substitutes = JSON.parse(res);

    		for (const i in charms) {
    			const [baseId, upperIds] = substitutes[0] || [Number.MAX_SAFE_INTEGER, []];

    			if (charms[i].rowid > baseId) {
    				console.log("internal error");
    			} else if (charms[i].rowid < baseId) {
    				$$invalidate(0, charms[i].substitutableCharms = [], charms);
    			} else {
    				$$invalidate(0, charms[i].substitutableCharms = upperIds.map(u => charms[u - 1]), charms);
    				substitutes.shift();
    			}
    		}
    	} // for (const [baseId, upperIds] of substitutes) {
    	//   charms[baseId - 1].substitutableCharms = upperIds.map(i => charms[i - 1])

    	// }
    	// handlers
    	function onSort(event) {
    		// close all accordion
    		charms.forEach(i => i.isScrennshotShown = i.isSubstitutableCharmsShown = false);
    	}

    	function onClickRow({ row }) {
    		const index = row.rowid - 1;
    		$$invalidate(0, charms[index].isSubstitutableCharmsShown = !charms[index].isSubstitutableCharmsShown, charms);
    	}

    	async function toggleScreenshot({ e, row, index }) {
    		e.stopPropagation();
    		const toShow = !charms[index].isScrennshotShown;
    		$$invalidate(0, charms[index].isScrennshotShown = toShow, charms);

    		if (toShow) {
    			// console.log(charms[index].imagename)
    			const screenshot = await charmManager.getScreenshot(row.imagename);

    			// await new Promise((resolve) => requestAnimationFrame(resolve))
    			cv.imshow(`charm-table-row-${index}-screenshot`, screenshot);
    		}
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<CharmList> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (col, row, n, e) => {
    		if (col.onClick) {
    			col.onClick({ e, row, col, index: n });
    		}
    	};

    	const click_handler_1 = (row, e) => onClickRow({ row });

    	$$self.$capture_state = () => ({
    		slide,
    		SvelteTable,
    		MHRiseCharmManager,
    		skillToSlotLevel,
    		allSkills,
    		fRefleshCharmTable,
    		N_CHARM_SLOT_MAX,
    		columns,
    		charmManager,
    		charms,
    		init,
    		updateCharmTable,
    		searchSubstitutableCharms,
    		onSort,
    		onClickRow,
    		toggleScreenshot,
    		$fRefleshCharmTable
    	});

    	$$self.$inject_state = $$props => {
    		if ("charmManager" in $$props) charmManager = $$props.charmManager;
    		if ("charms" in $$props) $$invalidate(0, charms = $$props.charms);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$fRefleshCharmTable*/ 16) {
    			if ($fRefleshCharmTable) {
    				(async () => {
    					console.log("reflesh table");
    					set_store_value(fRefleshCharmTable, $fRefleshCharmTable = false, $fRefleshCharmTable);
    					await updateCharmTable();
    					searchSubstitutableCharms();
    				})();
    			}
    		}
    	};

    	return [
    		charms,
    		columns,
    		onSort,
    		onClickRow,
    		$fRefleshCharmTable,
    		click_handler,
    		click_handler_1
    	];
    }

    class CharmList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CharmList",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/VideoReader.svelte generated by Svelte v3.38.2 */

    const file$3 = "src/VideoReader.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let video;
    	let track;
    	let video_id_value;
    	let video_src_value;
    	let video_alt_value;
    	let video_style_value;
    	let t0;
    	let div0;
    	let progress_1;
    	let t1;
    	let span;
    	let t2_value = Math.floor(/*progress*/ ctx[4] * 100) + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			video = element("video");
    			track = element("track");
    			t0 = space();
    			div0 = element("div");
    			progress_1 = element("progress");
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			t3 = text("%");
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$3, 85, 4, 2250);
    			attr_dev(video, "id", video_id_value = "video" + /*index*/ ctx[0]);
    			attr_dev(video, "class", "video-preview svelte-syjktf");
    			if (video.src !== (video_src_value = /*videoData*/ ctx[1])) attr_dev(video, "src", video_src_value);
    			attr_dev(video, "width", videoWidth);
    			attr_dev(video, "height", videoHeight);
    			attr_dev(video, "alt", video_alt_value = "preview" + /*index*/ ctx[0]);
    			attr_dev(video, "style", video_style_value = /*isVideoVisible*/ ctx[2] ? "" : "display: none");
    			add_location(video, file$3, 77, 2, 1983);
    			progress_1.value = /*progress*/ ctx[4];
    			attr_dev(progress_1, "class", "svelte-syjktf");
    			add_location(progress_1, file$3, 89, 4, 2298);
    			attr_dev(span, "class", "progress-text svelte-syjktf");
    			add_location(span, file$3, 90, 4, 2341);
    			add_location(div0, file$3, 88, 2, 2288);
    			attr_dev(div1, "class", "video-reader svelte-syjktf");
    			add_location(div1, file$3, 76, 0, 1954);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, video);
    			append_dev(video, track);
    			/*video_binding*/ ctx[9](video);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, progress_1);
    			append_dev(div0, t1);
    			append_dev(div0, span);
    			append_dev(span, t2);
    			append_dev(span, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*index*/ 1 && video_id_value !== (video_id_value = "video" + /*index*/ ctx[0])) {
    				attr_dev(video, "id", video_id_value);
    			}

    			if (dirty & /*videoData*/ 2 && video.src !== (video_src_value = /*videoData*/ ctx[1])) {
    				attr_dev(video, "src", video_src_value);
    			}

    			if (dirty & /*index*/ 1 && video_alt_value !== (video_alt_value = "preview" + /*index*/ ctx[0])) {
    				attr_dev(video, "alt", video_alt_value);
    			}

    			if (dirty & /*isVideoVisible*/ 4 && video_style_value !== (video_style_value = /*isVideoVisible*/ ctx[2] ? "" : "display: none")) {
    				attr_dev(video, "style", video_style_value);
    			}

    			if (dirty & /*progress*/ 16) {
    				prop_dev(progress_1, "value", /*progress*/ ctx[4]);
    			}

    			if (dirty & /*progress*/ 16 && t2_value !== (t2_value = Math.floor(/*progress*/ ctx[4] * 100) + "")) set_data_dev(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*video_binding*/ ctx[9](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const FRAME_RATE = 29.97;
    const videoWidth = 1280;
    const videoHeight = 720;

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VideoReader", slots, []);
    	let { nSplits } = $$props;
    	let { index } = $$props;
    	let { videoName } = $$props;
    	let { videoData } = $$props;
    	let { isVideoVisible = false } = $$props;
    	let { charmScanner } = $$props;
    	let { onFinish } = $$props;
    	let beginTime, endTime;
    	let domVideo;
    	let capture;
    	let frame = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
    	let progress = 0;

    	(async () => {
    		await new Promise(r => requestAnimationFrame(r));
    		await new Promise(r => $$invalidate(3, domVideo.oncanplay = r, domVideo));
    		capture = new cv.VideoCapture(domVideo);
    		beginTime = index * domVideo.duration / nSplits;
    		endTime = (index + 1) * domVideo.duration / nSplits;
    		domVideo.addEventListener("seeked", processCurrentFrame);

    		// console.log( domVideo.currentTime, domVideo.duration, index, nSplits, beginTime, endTime )
    		if (domVideo.currentTime != beginTime) {
    			$$invalidate(3, domVideo.currentTime = beginTime, domVideo);
    		} else {
    			processCurrentFrame();
    		}
    	})();

    	const processCurrentFrame = async () => {
    		// console.log( {currentTime: domVideo.currentTime, endTime} )
    		if (endTime - domVideo.currentTime < 1 / FRAME_RATE) {
    			charmScanner.countCharms();

    			// console.log(nScanedCharms)
    			// insertScript = charmScanner.generateInsertScript()
    			$$invalidate(4, progress = 1);

    			// console.log(charmScanner.charms)
    			onFinish();

    			return;
    		}

    		capture.read(frame);
    		charmScanner.scan(frame, videoName); // TODO: コールバックにして汎用クラスにする
    		seekFrames(1, FRAME_RATE);
    		$$invalidate(4, progress = (domVideo.currentTime - beginTime) / (endTime - beginTime));
    	};

    	const seekFrames = (nFrames, fps) => {
    		const currentFrame = domVideo.currentTime * fps;
    		const newPosition = 0.00001 + (currentFrame + nFrames) / fps;

    		// plus 0.00001 is workaround for safari
    		$$invalidate(3, domVideo.currentTime = Math.min(endTime, newPosition), domVideo);
    	};

    	const writable_props = [
    		"nSplits",
    		"index",
    		"videoName",
    		"videoData",
    		"isVideoVisible",
    		"charmScanner",
    		"onFinish"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VideoReader> was created with unknown prop '${key}'`);
    	});

    	function video_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			domVideo = $$value;
    			$$invalidate(3, domVideo);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("nSplits" in $$props) $$invalidate(5, nSplits = $$props.nSplits);
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("videoName" in $$props) $$invalidate(6, videoName = $$props.videoName);
    		if ("videoData" in $$props) $$invalidate(1, videoData = $$props.videoData);
    		if ("isVideoVisible" in $$props) $$invalidate(2, isVideoVisible = $$props.isVideoVisible);
    		if ("charmScanner" in $$props) $$invalidate(7, charmScanner = $$props.charmScanner);
    		if ("onFinish" in $$props) $$invalidate(8, onFinish = $$props.onFinish);
    	};

    	$$self.$capture_state = () => ({
    		FRAME_RATE,
    		videoWidth,
    		videoHeight,
    		nSplits,
    		index,
    		videoName,
    		videoData,
    		isVideoVisible,
    		charmScanner,
    		onFinish,
    		beginTime,
    		endTime,
    		domVideo,
    		capture,
    		frame,
    		progress,
    		processCurrentFrame,
    		seekFrames
    	});

    	$$self.$inject_state = $$props => {
    		if ("nSplits" in $$props) $$invalidate(5, nSplits = $$props.nSplits);
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("videoName" in $$props) $$invalidate(6, videoName = $$props.videoName);
    		if ("videoData" in $$props) $$invalidate(1, videoData = $$props.videoData);
    		if ("isVideoVisible" in $$props) $$invalidate(2, isVideoVisible = $$props.isVideoVisible);
    		if ("charmScanner" in $$props) $$invalidate(7, charmScanner = $$props.charmScanner);
    		if ("onFinish" in $$props) $$invalidate(8, onFinish = $$props.onFinish);
    		if ("beginTime" in $$props) beginTime = $$props.beginTime;
    		if ("endTime" in $$props) endTime = $$props.endTime;
    		if ("domVideo" in $$props) $$invalidate(3, domVideo = $$props.domVideo);
    		if ("capture" in $$props) capture = $$props.capture;
    		if ("frame" in $$props) frame = $$props.frame;
    		if ("progress" in $$props) $$invalidate(4, progress = $$props.progress);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		index,
    		videoData,
    		isVideoVisible,
    		domVideo,
    		progress,
    		nSplits,
    		videoName,
    		charmScanner,
    		onFinish,
    		video_binding
    	];
    }

    class VideoReader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			nSplits: 5,
    			index: 0,
    			videoName: 6,
    			videoData: 1,
    			isVideoVisible: 2,
    			charmScanner: 7,
    			onFinish: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VideoReader",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nSplits*/ ctx[5] === undefined && !("nSplits" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'nSplits'");
    		}

    		if (/*index*/ ctx[0] === undefined && !("index" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'index'");
    		}

    		if (/*videoName*/ ctx[6] === undefined && !("videoName" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'videoName'");
    		}

    		if (/*videoData*/ ctx[1] === undefined && !("videoData" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'videoData'");
    		}

    		if (/*charmScanner*/ ctx[7] === undefined && !("charmScanner" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'charmScanner'");
    		}

    		if (/*onFinish*/ ctx[8] === undefined && !("onFinish" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'onFinish'");
    		}
    	}

    	get nSplits() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nSplits(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get videoName() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoName(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get videoData() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoData(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isVideoVisible() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isVideoVisible(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charmScanner() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charmScanner(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onFinish() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onFinish(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/CharmScanner.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$2 = "src/CharmScanner.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (106:6) {#each $videoReaderProps as props}
    function create_each_block$1(ctx) {
    	let videoreader;
    	let current;
    	const videoreader_spread_levels = [/*props*/ ctx[21]];
    	let videoreader_props = {};

    	for (let i = 0; i < videoreader_spread_levels.length; i += 1) {
    		videoreader_props = assign(videoreader_props, videoreader_spread_levels[i]);
    	}

    	videoreader = new VideoReader({ props: videoreader_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(videoreader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(videoreader, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const videoreader_changes = (dirty & /*$videoReaderProps*/ 256)
    			? get_spread_update(videoreader_spread_levels, [get_spread_object(/*props*/ ctx[21])])
    			: {};

    			videoreader.$set(videoreader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(videoreader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(videoreader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(videoreader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(106:6) {#each $videoReaderProps as props}",
    		ctx
    	});

    	return block;
    }

    // (112:33) 
    function create_if_block_2(ctx) {
    	let t0;
    	let t1_value = 1 + Number(/*currentFileIndex*/ ctx[4]) + "";
    	let t1;
    	let t2;
    	let t3_value = /*files*/ ctx[2].length + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			t0 = text("Processing ");
    			t1 = text(t1_value);
    			t2 = text("/");
    			t3 = text(t3_value);
    			t4 = text(" file. Please wait...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentFileIndex*/ 16 && t1_value !== (t1_value = 1 + Number(/*currentFileIndex*/ ctx[4]) + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*files*/ 4 && t3_value !== (t3_value = /*files*/ ctx[2].length + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(t4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(112:33) ",
    		ctx
    	});

    	return block;
    }

    // (110:6) {#if isScanFinished}
    function create_if_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Completed!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(110:6) {#if isScanFinished}",
    		ctx
    	});

    	return block;
    }

    // (134:6) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading Files...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(134:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (124:6) {#if fInitialized}
    function create_if_block(ctx) {
    	let input;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div = element("div");
    			div.textContent = "Click to Select Movie";
    			set_style(input, "display", "none");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "accept", ".mp4");
    			input.multiple = true;
    			attr_dev(input, "class", "svelte-199ged2");
    			add_location(input, file$2, 124, 8, 3051);
    			if (img.src !== (img_src_value = "https://static.thenounproject.com/png/625182-200.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-199ged2");
    			add_location(img, file$2, 131, 8, 3272);
    			attr_dev(div, "class", "svelte-199ged2");
    			add_location(div, file$2, 132, 8, 3388);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			/*input_binding*/ ctx[13](input);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*onFileSelected*/ ctx[9], false, false, false),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[12]),
    					listen_dev(img, "click", /*click_handler*/ ctx[14], false, false, false),
    					listen_dev(
    						div,
    						"click",
    						function () {
    							if (is_function(/*domInput*/ ctx[1].click)) /*domInput*/ ctx[1].click.apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[13](null);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(124:6) {#if fInitialized}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div5;
    	let div4;
    	let div0;
    	let t0;
    	let t1;
    	let div2;
    	let textarea;
    	let t2;
    	let div1;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let div3;
    	let current;
    	let each_value = /*$videoReaderProps*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	function select_block_type(ctx, dirty) {
    		if (/*isScanFinished*/ ctx[5]) return create_if_block_1;
    		if (/*files*/ ctx[2].length > 0) return create_if_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*fInitialized*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div2 = element("div");
    			textarea = element("textarea");
    			t2 = space();
    			div1 = element("div");
    			t3 = text("Found ");
    			t4 = text(/*nScanedCharms*/ ctx[6]);
    			t5 = text(" charms in this scan.");
    			t6 = space();
    			div3 = element("div");
    			if_block1.c();
    			attr_dev(div0, "id", "status");
    			attr_dev(div0, "class", "svelte-199ged2");
    			add_location(div0, file$2, 104, 4, 2528);
    			attr_dev(textarea, "placeholder", "納刀術,2,ひるみ軽減,1,1,0,0");
    			textarea.value = /*exportData*/ ctx[7];
    			attr_dev(textarea, "class", "svelte-199ged2");
    			add_location(textarea, file$2, 118, 6, 2856);
    			attr_dev(div1, "class", "svelte-199ged2");
    			add_location(div1, file$2, 119, 6, 2930);
    			attr_dev(div2, "id", "result");
    			attr_dev(div2, "class", "svelte-199ged2");
    			add_location(div2, file$2, 117, 4, 2832);
    			attr_dev(div3, "id", "upload");
    			attr_dev(div3, "class", "svelte-199ged2");
    			add_location(div3, file$2, 122, 4, 3000);
    			attr_dev(div4, "id", "scanner");
    			attr_dev(div4, "class", "svelte-199ged2");
    			add_location(div4, file$2, 103, 2, 2505);
    			attr_dev(div5, "class", "tab-content svelte-199ged2");
    			add_location(div5, file$2, 102, 0, 2477);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div0, t0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div2, textarea);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			if_block1.m(div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$videoReaderProps*/ 256) {
    				each_value = /*$videoReaderProps*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, t0);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (!current || dirty & /*exportData*/ 128) {
    				prop_dev(textarea, "value", /*exportData*/ ctx[7]);
    			}

    			if (!current || dirty & /*nScanedCharms*/ 64) set_data_dev(t4, /*nScanedCharms*/ ctx[6]);

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);

    			if (if_block0) {
    				if_block0.d();
    			}

    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const VIDEO_WIDTH = 1280; // switch のキャプチャ解像度
    const VIDEO_HEIGHT = 720;
    const VIDEO_FRAME_RATE = 29.97;

    function instance$2($$self, $$props, $$invalidate) {
    	let $videoReaderProps,
    		$$unsubscribe_videoReaderProps = noop,
    		$$subscribe_videoReaderProps = () => ($$unsubscribe_videoReaderProps(), $$unsubscribe_videoReaderProps = subscribe(videoReaderProps, $$value => $$invalidate(8, $videoReaderProps = $$value)), videoReaderProps);

    	let $fRefleshCharmTable;
    	validate_store(fRefleshCharmTable, "fRefleshCharmTable");
    	component_subscribe($$self, fRefleshCharmTable, $$value => $$invalidate(17, $fRefleshCharmTable = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_videoReaderProps());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CharmScanner", slots, []);
    	const N_VIDEO_SPLITS = (navigator.hardwareConcurrency || 8) / 2;
    	let { charmScanner } = $$props;
    	let { charmManager } = $$props;
    	let { fInitialized } = $$props;
    	let domInput; // input 要素
    	let files = []; // 選択されたローカルファイル

    	// video reader
    	let videoReaderProps = writable([]);

    	validate_store(videoReaderProps, "videoReaderProps");
    	$$subscribe_videoReaderProps();
    	let countFinishVideoRead;
    	let isVideoReadFinished;

    	// progress
    	let currentFileIndex = -1;

    	let isScanFinished = false;

    	// result
    	let nScanedCharms = 0;

    	let exportData = "";

    	function initVideoReaders() {
    		$$subscribe_videoReaderProps($$invalidate(3, videoReaderProps = writable([])));
    		countFinishVideoRead = 0;
    		isVideoReadFinished = false;
    	}

    	async function onFileSelected(e) {
    		const files = e.target.files;

    		if (files == null) {
    			return;
    		}

    		$$invalidate(5, isScanFinished = false);

    		// console.log(files)
    		for (let i = 0; i < files.length; i++) {
    			$$invalidate(4, currentFileIndex = i);
    			const file = files[i];
    			console.log(file.name, Date());
    			initVideoReaders();
    			const reader = new FileReader();
    			reader.readAsDataURL(file);

    			await new Promise(resolve => {
    					reader.onload = resolve;
    				});

    			for (let i = 0; i < N_VIDEO_SPLITS; i++) {
    				const index = $videoReaderProps.length;

    				set_store_value(
    					videoReaderProps,
    					$videoReaderProps[index] = {
    						index,
    						videoName: file.name,
    						videoData: reader.result,
    						charmScanner,
    						nSplits: N_VIDEO_SPLITS,
    						onFinish: onFinishVideoRead
    					},
    					$videoReaderProps
    				);
    			}

    			// console.log($videoReaderProps)
    			await new Promise(resolve => requestAnimationFrame(resolve));

    			await new Promise(resolve => {
    					setInterval(
    						() => {
    							$$invalidate(6, nScanedCharms = charmScanner.countCharms());
    							$$invalidate(7, exportData = charmScanner.exportAsText());

    							if (isVideoReadFinished) {
    								resolve();
    							}
    						},
    						1000
    					);
    				});

    			const charms = charmScanner.getCharms();
    			await charmManager.registerCharms(charms);
    		}

    		const charms = charmScanner.getCharms();
    		console.log(JSON.stringify(charms));

    		// await charmManager.registerCharms(charms)
    		$$invalidate(5, isScanFinished = true);

    		set_store_value(fRefleshCharmTable, $fRefleshCharmTable = true, $fRefleshCharmTable);
    	}

    	function onFinishVideoRead() {
    		if (++countFinishVideoRead !== N_VIDEO_SPLITS) {
    			return;
    		}

    		isVideoReadFinished = true;
    	}

    	const writable_props = ["charmScanner", "charmManager", "fInitialized"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<CharmScanner> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		files = this.files;
    		$$invalidate(2, files);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			domInput = $$value;
    			$$invalidate(1, domInput);
    		});
    	}

    	const click_handler = () => {
    		domInput.click();
    	};

    	$$self.$$set = $$props => {
    		if ("charmScanner" in $$props) $$invalidate(10, charmScanner = $$props.charmScanner);
    		if ("charmManager" in $$props) $$invalidate(11, charmManager = $$props.charmManager);
    		if ("fInitialized" in $$props) $$invalidate(0, fInitialized = $$props.fInitialized);
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		VideoReader,
    		fRefleshCharmTable,
    		VIDEO_WIDTH,
    		VIDEO_HEIGHT,
    		VIDEO_FRAME_RATE,
    		N_VIDEO_SPLITS,
    		charmScanner,
    		charmManager,
    		fInitialized,
    		domInput,
    		files,
    		videoReaderProps,
    		countFinishVideoRead,
    		isVideoReadFinished,
    		currentFileIndex,
    		isScanFinished,
    		nScanedCharms,
    		exportData,
    		initVideoReaders,
    		onFileSelected,
    		onFinishVideoRead,
    		$videoReaderProps,
    		$fRefleshCharmTable
    	});

    	$$self.$inject_state = $$props => {
    		if ("charmScanner" in $$props) $$invalidate(10, charmScanner = $$props.charmScanner);
    		if ("charmManager" in $$props) $$invalidate(11, charmManager = $$props.charmManager);
    		if ("fInitialized" in $$props) $$invalidate(0, fInitialized = $$props.fInitialized);
    		if ("domInput" in $$props) $$invalidate(1, domInput = $$props.domInput);
    		if ("files" in $$props) $$invalidate(2, files = $$props.files);
    		if ("videoReaderProps" in $$props) $$subscribe_videoReaderProps($$invalidate(3, videoReaderProps = $$props.videoReaderProps));
    		if ("countFinishVideoRead" in $$props) countFinishVideoRead = $$props.countFinishVideoRead;
    		if ("isVideoReadFinished" in $$props) isVideoReadFinished = $$props.isVideoReadFinished;
    		if ("currentFileIndex" in $$props) $$invalidate(4, currentFileIndex = $$props.currentFileIndex);
    		if ("isScanFinished" in $$props) $$invalidate(5, isScanFinished = $$props.isScanFinished);
    		if ("nScanedCharms" in $$props) $$invalidate(6, nScanedCharms = $$props.nScanedCharms);
    		if ("exportData" in $$props) $$invalidate(7, exportData = $$props.exportData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fInitialized,
    		domInput,
    		files,
    		videoReaderProps,
    		currentFileIndex,
    		isScanFinished,
    		nScanedCharms,
    		exportData,
    		$videoReaderProps,
    		onFileSelected,
    		charmScanner,
    		charmManager,
    		input_change_handler,
    		input_binding,
    		click_handler
    	];
    }

    class CharmScanner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			charmScanner: 10,
    			charmManager: 11,
    			fInitialized: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CharmScanner",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*charmScanner*/ ctx[10] === undefined && !("charmScanner" in props)) {
    			console_1.warn("<CharmScanner> was created without expected prop 'charmScanner'");
    		}

    		if (/*charmManager*/ ctx[11] === undefined && !("charmManager" in props)) {
    			console_1.warn("<CharmScanner> was created without expected prop 'charmManager'");
    		}

    		if (/*fInitialized*/ ctx[0] === undefined && !("fInitialized" in props)) {
    			console_1.warn("<CharmScanner> was created without expected prop 'fInitialized'");
    		}
    	}

    	get charmScanner() {
    		throw new Error("<CharmScanner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charmScanner(value) {
    		throw new Error("<CharmScanner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charmManager() {
    		throw new Error("<CharmScanner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charmManager(value) {
    		throw new Error("<CharmScanner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fInitialized() {
    		throw new Error("<CharmScanner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fInitialized(value) {
    		throw new Error("<CharmScanner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/NavOptions.svelte generated by Svelte v3.38.2 */

    const navOptions = [
    	// { tabTitle: 'Usage',   component: Usage },
    	{
    		tabTitle: "護石スキャン",
    		component: CharmScanner,
    		iconData: [
    			"M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5zM3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7z"
    		]
    	},
    	{
    		tabTitle: "護石管理",
    		component: CharmList,
    		iconData: [
    			"M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 2h-4v3h4V4zm0 4h-4v3h4V8zm0 4h-4v3h3a1 1 0 0 0 1-1v-2zm-5 3v-3H6v3h4zm-5 0v-3H1v2a1 1 0 0 0 1 1h3zm-4-4h4V8H1v3zm0-4h4V4H1v3zm5-3v3h4V4H6zm4 4H6v3h4V8z"
    		]
    	},
    	{
    		tabTitle: "護石スペック検索",
    		component: CharmSearcher,
    		iconData: [
    			"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
    		]
    	},
    	{
    		tabTitle: "護石エクスポート",
    		component: CharmIxporter,
    		iconData: [
    			"M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z"
    		]
    	},
    	{
    		tabTitle: "ヘルプ",
    		component: Description,
    		iconData: [
    			"M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z",
    			"m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"
    		]
    	}
    ];

    /* src/Nav.svelte generated by Svelte v3.38.2 */
    const file$1 = "src/Nav.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[10] = list;
    	child_ctx[11] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (35:12) {#each (option.iconData || []) as iconData}
    function create_each_block_2(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", /*iconData*/ ctx[13]);
    			add_location(path, file$1, 35, 14, 1071);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(35:12) {#each (option.iconData || []) as iconData}",
    		ctx
    	});

    	return block;
    }

    // (27:4) {#each navOptions as option, i}
    function create_each_block_1(ctx) {
    	let li;
    	let button;
    	let svg;
    	let t0;
    	let span;
    	let t1_value = /*option*/ ctx[9].tabTitle + "";
    	let t1;
    	let button_class_value;
    	let t2;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*option*/ ctx[9].iconData || [];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			svg = svg_element("svg");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "height", "19");
    			attr_dev(svg, "fill", "currentColor");
    			add_location(svg, file$1, 33, 10, 917);
    			set_style(span, "display", /*isNavigationOpen*/ ctx[0] ? "inline" : "none");
    			attr_dev(span, "class", "svelte-nk63sn");
    			add_location(span, file$1, 38, 10, 1139);
    			attr_dev(button, "id", /*i*/ ctx[11]);

    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*currentNavOptionId*/ ctx[4] == /*i*/ ctx[11]
    			? "active navigation-link"
    			: "navigation-link") + " svelte-nk63sn"));

    			attr_dev(button, "role", "tab");
    			add_location(button, file$1, 28, 8, 709);
    			attr_dev(li, "class", "navigation-item svelte-nk63sn");
    			add_location(li, file$1, 27, 6, 672);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, svg);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			append_dev(button, t0);
    			append_dev(button, span);
    			append_dev(span, t1);
    			append_dev(li, t2);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*switchComponent*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navOptions*/ 0) {
    				each_value_2 = /*option*/ ctx[9].iconData || [];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty & /*isNavigationOpen*/ 1) {
    				set_style(span, "display", /*isNavigationOpen*/ ctx[0] ? "inline" : "none");
    			}

    			if (dirty & /*currentNavOptionId*/ 16 && button_class_value !== (button_class_value = "" + (null_to_empty(/*currentNavOptionId*/ ctx[4] == /*i*/ ctx[11]
    			? "active navigation-link"
    			: "navigation-link") + " svelte-nk63sn"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(27:4) {#each navOptions as option, i}",
    		ctx
    	});

    	return block;
    }

    // (46:4) {#each navOptions as option, i}
    function create_each_block(ctx) {
    	let div;
    	let switch_instance;
    	let updating_onActivate;
    	let t;
    	let div_class_value;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			fInitialized: /*fInitialized*/ ctx[1],
    			charmScanner: /*charmScanner*/ ctx[2],
    			charmManager: /*charmManager*/ ctx[3]
    		}
    	];

    	function switch_instance_onActivate_binding(value) {
    		/*switch_instance_onActivate_binding*/ ctx[7](value, /*i*/ ctx[11]);
    	}

    	var switch_value = navOptions[/*i*/ ctx[11]].component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		if (/*onActivate*/ ctx[5][/*i*/ ctx[11]] !== void 0) {
    			switch_instance_props.onActivate = /*onActivate*/ ctx[5][/*i*/ ctx[11]];
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		binding_callbacks.push(() => bind(switch_instance, "onActivate", switch_instance_onActivate_binding));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();

    			attr_dev(div, "class", div_class_value = "h-100 " + (/*currentNavOptionId*/ ctx[4] == /*i*/ ctx[11]
    			? "d-block"
    			: "d-none"));

    			add_location(div, file$1, 46, 6, 1354);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			const switch_instance_changes = (dirty & /*fInitialized, charmScanner, charmManager*/ 14)
    			? get_spread_update(switch_instance_spread_levels, [
    					{
    						fInitialized: /*fInitialized*/ ctx[1],
    						charmScanner: /*charmScanner*/ ctx[2],
    						charmManager: /*charmManager*/ ctx[3]
    					}
    				])
    			: {};

    			if (!updating_onActivate && dirty & /*onActivate*/ 32) {
    				updating_onActivate = true;
    				switch_instance_changes.onActivate = /*onActivate*/ ctx[5][/*i*/ ctx[11]];
    				add_flush_callback(() => updating_onActivate = false);
    			}

    			if (switch_value !== (switch_value = navOptions[/*i*/ ctx[11]].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					binding_callbacks.push(() => bind(switch_instance, "onActivate", switch_instance_onActivate_binding));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty & /*currentNavOptionId*/ 16 && div_class_value !== (div_class_value = "h-100 " + (/*currentNavOptionId*/ ctx[4] == /*i*/ ctx[11]
    			? "d-block"
    			: "d-none"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(46:4) {#each navOptions as option, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let ul;
    	let t;
    	let div0;
    	let current;
    	let each_value_1 = navOptions;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = navOptions;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "navigation svelte-nk63sn");
    			set_style(ul, "width", /*isNavigationOpen*/ ctx[0] ? "14rem" : "3.2rem");
    			add_location(ul, file$1, 25, 2, 551);
    			attr_dev(div0, "class", "navigation-content svelte-nk63sn");
    			add_location(div0, file$1, 44, 2, 1279);
    			attr_dev(div1, "id", "container");
    			attr_dev(div1, "class", "svelte-nk63sn");
    			add_location(div1, file$1, 24, 0, 528);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, ul);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul, null);
    			}

    			append_dev(div1, t);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentNavOptionId, switchComponent, isNavigationOpen, navOptions*/ 81) {
    				each_value_1 = navOptions;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (!current || dirty & /*isNavigationOpen*/ 1) {
    				set_style(ul, "width", /*isNavigationOpen*/ ctx[0] ? "14rem" : "3.2rem");
    			}

    			if (dirty & /*currentNavOptionId, navOptions, fInitialized, charmScanner, charmManager, onActivate*/ 62) {
    				each_value = navOptions;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Nav", slots, []);
    	let { isNavigationOpen } = $$props;
    	let { fInitialized } = $$props;
    	let { charmScanner } = $$props;
    	let { charmManager } = $$props;
    	let currentNavOptionId = 2;
    	let currentNavOption = navOptions[currentNavOptionId];
    	let onActivate = {};

    	function switchComponent(e) {
    		$$invalidate(4, currentNavOptionId = e.srcElement.closest("button").id);
    		currentNavOption = navOptions[currentNavOptionId];

    		if (onActivate[currentNavOptionId]) {
    			onActivate[currentNavOptionId]();
    		}
    	}

    	const writable_props = ["isNavigationOpen", "fInitialized", "charmScanner", "charmManager"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	function switch_instance_onActivate_binding(value, i) {
    		if ($$self.$$.not_equal(onActivate[i], value)) {
    			onActivate[i] = value;
    			$$invalidate(5, onActivate);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ("isNavigationOpen" in $$props) $$invalidate(0, isNavigationOpen = $$props.isNavigationOpen);
    		if ("fInitialized" in $$props) $$invalidate(1, fInitialized = $$props.fInitialized);
    		if ("charmScanner" in $$props) $$invalidate(2, charmScanner = $$props.charmScanner);
    		if ("charmManager" in $$props) $$invalidate(3, charmManager = $$props.charmManager);
    	};

    	$$self.$capture_state = () => ({
    		navOptions,
    		isNavigationOpen,
    		fInitialized,
    		charmScanner,
    		charmManager,
    		currentNavOptionId,
    		currentNavOption,
    		onActivate,
    		switchComponent
    	});

    	$$self.$inject_state = $$props => {
    		if ("isNavigationOpen" in $$props) $$invalidate(0, isNavigationOpen = $$props.isNavigationOpen);
    		if ("fInitialized" in $$props) $$invalidate(1, fInitialized = $$props.fInitialized);
    		if ("charmScanner" in $$props) $$invalidate(2, charmScanner = $$props.charmScanner);
    		if ("charmManager" in $$props) $$invalidate(3, charmManager = $$props.charmManager);
    		if ("currentNavOptionId" in $$props) $$invalidate(4, currentNavOptionId = $$props.currentNavOptionId);
    		if ("currentNavOption" in $$props) currentNavOption = $$props.currentNavOption;
    		if ("onActivate" in $$props) $$invalidate(5, onActivate = $$props.onActivate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isNavigationOpen,
    		fInitialized,
    		charmScanner,
    		charmManager,
    		currentNavOptionId,
    		onActivate,
    		switchComponent,
    		switch_instance_onActivate_binding
    	];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			isNavigationOpen: 0,
    			fInitialized: 1,
    			charmScanner: 2,
    			charmManager: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*isNavigationOpen*/ ctx[0] === undefined && !("isNavigationOpen" in props)) {
    			console.warn("<Nav> was created without expected prop 'isNavigationOpen'");
    		}

    		if (/*fInitialized*/ ctx[1] === undefined && !("fInitialized" in props)) {
    			console.warn("<Nav> was created without expected prop 'fInitialized'");
    		}

    		if (/*charmScanner*/ ctx[2] === undefined && !("charmScanner" in props)) {
    			console.warn("<Nav> was created without expected prop 'charmScanner'");
    		}

    		if (/*charmManager*/ ctx[3] === undefined && !("charmManager" in props)) {
    			console.warn("<Nav> was created without expected prop 'charmManager'");
    		}
    	}

    	get isNavigationOpen() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isNavigationOpen(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fInitialized() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fInitialized(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charmScanner() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charmScanner(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charmManager() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charmManager(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let hamburger;
    	let updating_isOpen;
    	let t0;
    	let h1;
    	let t2;
    	let div0;
    	let nav;
    	let t3;
    	let div1;
    	let current;

    	function hamburger_isOpen_binding(value) {
    		/*hamburger_isOpen_binding*/ ctx[4](value);
    	}

    	let hamburger_props = {};

    	if (/*isNavigationOpen*/ ctx[0] !== void 0) {
    		hamburger_props.isOpen = /*isNavigationOpen*/ ctx[0];
    	}

    	hamburger = new Hamburger({ props: hamburger_props, $$inline: true });
    	binding_callbacks.push(() => bind(hamburger, "isOpen", hamburger_isOpen_binding));

    	const nav_spread_levels = [
    		{
    			isNavigationOpen: /*isNavigationOpen*/ ctx[0],
    			fInitialized: /*fInitialized*/ ctx[1],
    			charmScanner: /*charmScanner*/ ctx[2],
    			charmManager: /*charmManager*/ ctx[3]
    		}
    	];

    	let nav_props = {};

    	for (let i = 0; i < nav_spread_levels.length; i += 1) {
    		nav_props = assign(nav_props, nav_spread_levels[i]);
    	}

    	nav = new Nav({ props: nav_props, $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			header = element("header");
    			create_component(hamburger.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = `${TITLE}`;
    			t2 = space();
    			div0 = element("div");
    			create_component(nav.$$.fragment);
    			t3 = space();
    			div1 = element("div");
    			div1.textContent = `v${VERSION}`;
    			attr_dev(h1, "class", "svelte-1py2mvt");
    			add_location(h1, file, 25, 3, 658);
    			attr_dev(header, "class", "svelte-1py2mvt");
    			add_location(header, file, 23, 2, 598);
    			attr_dev(div0, "id", "nav-wrapper");
    			attr_dev(div0, "class", "svelte-1py2mvt");
    			add_location(div0, file, 27, 2, 689);
    			attr_dev(div1, "id", "version");
    			attr_dev(div1, "class", "svelte-1py2mvt");
    			add_location(div1, file, 30, 2, 805);
    			attr_dev(main, "class", "svelte-1py2mvt");
    			add_location(main, file, 22, 0, 589);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, header);
    			mount_component(hamburger, header, null);
    			append_dev(header, t0);
    			append_dev(header, h1);
    			append_dev(main, t2);
    			append_dev(main, div0);
    			mount_component(nav, div0, null);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const hamburger_changes = {};

    			if (!updating_isOpen && dirty & /*isNavigationOpen*/ 1) {
    				updating_isOpen = true;
    				hamburger_changes.isOpen = /*isNavigationOpen*/ ctx[0];
    				add_flush_callback(() => updating_isOpen = false);
    			}

    			hamburger.$set(hamburger_changes);

    			const nav_changes = (dirty & /*isNavigationOpen, fInitialized, charmScanner, charmManager*/ 15)
    			? get_spread_update(nav_spread_levels, [
    					{
    						isNavigationOpen: /*isNavigationOpen*/ ctx[0],
    						fInitialized: /*fInitialized*/ ctx[1],
    						charmScanner: /*charmScanner*/ ctx[2],
    						charmManager: /*charmManager*/ ctx[3]
    					}
    				])
    			: {};

    			nav.$set(nav_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hamburger.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hamburger.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(hamburger);
    			destroy_component(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TITLE = "MHRise Charm Scanner";
    const VERSION = "0.5.0";

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let isNavigationOpen = false;
    	let fInitialized = false;
    	let charmScanner;
    	let charmManager;

    	window.addEventListener("load", async () => {
    		$$invalidate(2, charmScanner = new MHRiseCharmScanner());
    		$$invalidate(3, charmManager = new MHRiseCharmManager());
    		await charmScanner.init();
    		$$invalidate(1, fInitialized = true);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function hamburger_isOpen_binding(value) {
    		isNavigationOpen = value;
    		$$invalidate(0, isNavigationOpen);
    	}

    	$$self.$capture_state = () => ({
    		MHRiseCharmManager,
    		MHRiseCharmScanner,
    		Hamburger,
    		Nav,
    		TITLE,
    		VERSION,
    		isNavigationOpen,
    		fInitialized,
    		charmScanner,
    		charmManager
    	});

    	$$self.$inject_state = $$props => {
    		if ("isNavigationOpen" in $$props) $$invalidate(0, isNavigationOpen = $$props.isNavigationOpen);
    		if ("fInitialized" in $$props) $$invalidate(1, fInitialized = $$props.fInitialized);
    		if ("charmScanner" in $$props) $$invalidate(2, charmScanner = $$props.charmScanner);
    		if ("charmManager" in $$props) $$invalidate(3, charmManager = $$props.charmManager);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isNavigationOpen,
    		fInitialized,
    		charmScanner,
    		charmManager,
    		hamburger_isOpen_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		// name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
