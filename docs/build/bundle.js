
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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


    function getMostMatchedImage(image, templates, point, maskBinaryThreshold = 63, diffBinaryThreshold = 63) {
      let minDiffCount = Number.MAX_SAFE_INTEGER;
      let candidate = null;

      // console.log(templates)
      for (const [name, template] of Object.entries(templates)) {
        const diff = countImageDiffAtPoint(image, template, point, maskBinaryThreshold, diffBinaryThreshold);
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

    class MHRiseCharmScanner {
      MAX_PAGE = 34
      COLUMNS_PER_PAGE = 10
      ROWS_PER_PAGE    = 5

      POINT_RARITY       = new cv.Point(1190, 176)
      POINT_SLOTS        = new cv.Point(1160, 200)
      POINT_SKILL1       = new cv.Point(1033, 266)
      POINT_SKILL2       = new cv.Point(1033, 317)
      POINT_SKILL_LEVEL1 = new cv.Point(1190, 289)
      POINT_SKILL_LEVEL2 = new cv.Point(1190, 340)
      POINT_PAGE         = new cv.Point(787, 582)

      POINT_CHARM_AREA_LEFT_TOP = new cv.Point(634, 359)
      SIZE_CHARM_AREA           = new cv.Size(357, 199)

      nCharms = 0
      charms = {}
      templates = null

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
            '0-0-0':                    fetchImage('img/templates/slot/0.jpg'),
            '1-0-0':                    fetchImage('img/templates/slot/1.jpg'),
            '1-1-0':                   fetchImage('img/templates/slot/11.jpg'),
            '1-1-1':                  fetchImage('img/templates/slot/111.jpg'),
            '2-0-0':                    fetchImage('img/templates/slot/2.jpg'),
            '2-1-0':                   fetchImage('img/templates/slot/21.jpg'),
            '2-1-1':                  fetchImage('img/templates/slot/211.jpg'),
            '2-2-0':                   fetchImage('img/templates/slot/22.jpg'),
            '2-2-1':                  fetchImage('img/templates/slot/221.jpg'),
            '3-0-0':                    fetchImage('img/templates/slot/3.jpg'),
            '3-1-0':                   fetchImage('img/templates/slot/31.jpg'),
            '3-1-1':                  fetchImage('img/templates/slot/311.jpg'),
            '3-2-0':                   fetchImage('img/templates/slot/32.jpg'),
            '3-2-1':                  fetchImage('img/templates/slot/321.jpg'),
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

      store(params) {
        const {page, row, col} = params;
        this.charms[page][row][col] = params;
        this.nCharms++;
      }

      scan(screenshot) {
        const page          = this._getCurrentPage(screenshot);
        const [pos, match]  = this._getCurrentCharmPos(screenshot);

        if ( match < 0.35 ) {
          // 放置すると blink するので一致度が低い時はスキップ
          // console.log(`low match degress ${match} for charm position searching. skip`)
          return null
        }

        const [col, row]    = pos;
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
        this.store({page, row, col, rarity, slots, skills, skillLevels});
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
        return [
          getMostMatchedImage(screenshot, this.templates.lvl, this.POINT_SKILL_LEVEL1, 0, 95),
          getMostMatchedImage(screenshot, this.templates.lvl, this.POINT_SKILL_LEVEL2, 0, 95),
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

    /* src/App.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (115:4) {:else}
    function create_else_block(ctx) {
    	let img;
    	let img_src_value;
    	let t;
    	let div;

    	function select_block_type_1(ctx, dirty) {
    		if (/*fInitialized*/ ctx[0]) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			div = element("div");
    			if_block.c();
    			attr_dev(img, "class", "preview svelte-1697s2b");
    			if (img.src !== (img_src_value = "sample/sample-img.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "preview-sample");
    			add_location(img, file, 115, 6, 3322);
    			set_style(div, "height", "540px");
    			set_style(div, "width", "960px");
    			set_style(div, "display", "flex");
    			set_style(div, "align-items", "center");
    			set_style(div, "justify-content", "center");
    			add_location(div, file, 117, 6, 3402);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(115:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (111:4) {#if video}
    function create_if_block(ctx) {
    	let video_1;
    	let track;
    	let video_1_src_value;

    	const block = {
    		c: function create() {
    			video_1 = element("video");
    			track = element("track");
    			attr_dev(track, "kind", "captions");
    			add_location(track, file, 112, 8, 3265);
    			attr_dev(video_1, "class", "preview svelte-1697s2b");
    			if (video_1.src !== (video_1_src_value = /*video*/ ctx[4])) attr_dev(video_1, "src", video_1_src_value);
    			attr_dev(video_1, "alt", "preview");
    			add_location(video_1, file, 111, 6, 3184);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video_1, anchor);
    			append_dev(video_1, track);
    			/*video_1_binding*/ ctx[11](video_1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*video*/ 16 && video_1.src !== (video_1_src_value = /*video*/ ctx[4])) {
    				attr_dev(video_1, "src", video_1_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video_1);
    			/*video_1_binding*/ ctx[11](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(111:4) {#if video}",
    		ctx
    	});

    	return block;
    }

    // (129:6) {:else}
    function create_else_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Loading Files...";
    			add_location(div, file, 129, 8, 3957);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(129:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (119:6) {#if fInitialized}
    function create_if_block_1(ctx) {
    	let div1;
    	let input;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div0;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			input = element("input");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "Click to Select Movie";
    			set_style(input, "display", "none");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "accept", ".mp4");
    			attr_dev(input, "class", "svelte-1697s2b");
    			add_location(input, file, 120, 10, 3601);
    			if (img.src !== (img_src_value = "https://static.thenounproject.com/png/625182-200.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1697s2b");
    			add_location(img, file, 125, 10, 3803);
    			attr_dev(div0, "class", "svelte-1697s2b");
    			add_location(div0, file, 126, 10, 3887);
    			attr_dev(div1, "id", "upload");
    			attr_dev(div1, "class", "svelte-1697s2b");
    			add_location(div1, file, 119, 8, 3539);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input);
    			/*input_binding*/ ctx[14](input);
    			append_dev(div1, t0);
    			append_dev(div1, img);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*change_handler*/ ctx[12], false, false, false),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[13]),
    					listen_dev(div1, "click", /*click_handler*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*input_binding*/ ctx[14](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(119:6) {#if fInitialized}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let div0;
    	let p;
    	let t2;
    	let br0;
    	let t3;
    	let a0;
    	let t5;
    	let br1;
    	let t6;
    	let br2;
    	let t7;
    	let br3;
    	let t8;
    	let a1;
    	let t10;
    	let br4;
    	let t11;
    	let div2;
    	let t12;
    	let div1;
    	let progress_1;
    	let t13;
    	let t14_value = Math.floor(/*$progress*/ ctx[8] * 100) + "";
    	let t14;
    	let t15;
    	let t16;
    	let div4;
    	let div3;
    	let t17;
    	let t18;
    	let t19;
    	let t20;
    	let textarea;

    	function select_block_type(ctx, dirty) {
    		if (/*video*/ ctx[4]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = `${title}`;
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			t2 = text("モンスターハンターライズの護石を自動読み取りするツールです。");
    			br0 = element("br");
    			t3 = text("\n   Nintendo Switch の 30 秒キャプチャ動画を用意するだけで, 護石のスキルやスロットが読み取れます。\n   (");
    			a0 = element("a");
    			a0.textContent = "動画例";
    			t5 = text(")");
    			br1 = element("br");
    			t6 = space();
    			br2 = element("br");
    			t7 = text("\n   出力形式は、<スキル1>,<スキル1Lv>,<スキル2>,<スキル2Lv>,<スロット1Lv>,<スロット2Lv>,<スロット3Lv> です。");
    			br3 = element("br");
    			t8 = space();
    			a1 = element("a");
    			a1.textContent = "泣きシミュさん";
    			t10 = text(" でそのままインポートできます。");
    			br4 = element("br");
    			t11 = space();
    			div2 = element("div");
    			if_block.c();
    			t12 = space();
    			div1 = element("div");
    			progress_1 = element("progress");
    			t13 = space();
    			t14 = text(t14_value);
    			t15 = text("%");
    			t16 = space();
    			div4 = element("div");
    			div3 = element("div");
    			t17 = text("Found ");
    			t18 = text(/*nScanedCharms*/ ctx[6]);
    			t19 = text(" charms.");
    			t20 = space();
    			textarea = element("textarea");
    			attr_dev(h1, "class", "svelte-1697s2b");
    			add_location(h1, file, 96, 1, 2638);
    			add_location(br0, file, 99, 33, 2805);
    			attr_dev(a0, "href", "sample/input.mp4");
    			add_location(a0, file, 101, 4, 2876);
    			add_location(br1, file, 101, 39, 2911);
    			add_location(br2, file, 102, 3, 2919);
    			add_location(br3, file, 103, 116, 3040);
    			attr_dev(a1, "href", "https://mhrise.wiki-db.com/sim/");
    			add_location(a1, file, 104, 3, 3048);
    			add_location(br4, file, 104, 72, 3117);
    			set_style(p, "margin", "auto");
    			set_style(p, "max-width", "100%");
    			set_style(p, "width", "54rem");
    			set_style(p, "height", "6rem");
    			set_style(p, "text-align", "left");
    			add_location(p, file, 98, 4, 2684);
    			attr_dev(div0, "id", "description");
    			attr_dev(div0, "class", "svelte-1697s2b");
    			add_location(div0, file, 97, 2, 2657);
    			progress_1.value = /*$progress*/ ctx[8];
    			attr_dev(progress_1, "class", "svelte-1697s2b");
    			add_location(progress_1, file, 135, 6, 4037);
    			add_location(div1, file, 134, 4, 4025);
    			attr_dev(div2, "id", "status");
    			attr_dev(div2, "class", "svelte-1697s2b");
    			add_location(div2, file, 109, 2, 3144);
    			add_location(div3, file, 157, 6, 4762);
    			textarea.value = /*exportData*/ ctx[7];
    			attr_dev(textarea, "class", "svelte-1697s2b");
    			add_location(textarea, file, 158, 6, 4809);
    			attr_dev(div4, "id", "result");
    			attr_dev(div4, "class", "svelte-1697s2b");
    			add_location(div4, file, 155, 2, 4709);
    			attr_dev(main, "class", "svelte-1697s2b");
    			add_location(main, file, 95, 0, 2630);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, div0);
    			append_dev(div0, p);
    			append_dev(p, t2);
    			append_dev(p, br0);
    			append_dev(p, t3);
    			append_dev(p, a0);
    			append_dev(p, t5);
    			append_dev(p, br1);
    			append_dev(p, t6);
    			append_dev(p, br2);
    			append_dev(p, t7);
    			append_dev(p, br3);
    			append_dev(p, t8);
    			append_dev(p, a1);
    			append_dev(p, t10);
    			append_dev(p, br4);
    			append_dev(main, t11);
    			append_dev(main, div2);
    			if_block.m(div2, null);
    			append_dev(div2, t12);
    			append_dev(div2, div1);
    			append_dev(div1, progress_1);
    			append_dev(div1, t13);
    			append_dev(div1, t14);
    			append_dev(div1, t15);
    			append_dev(main, t16);
    			append_dev(main, div4);
    			append_dev(div4, div3);
    			append_dev(div3, t17);
    			append_dev(div3, t18);
    			append_dev(div3, t19);
    			append_dev(div4, t20);
    			append_dev(div4, textarea);
    			/*textarea_binding*/ ctx[16](textarea);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, t12);
    				}
    			}

    			if (dirty & /*$progress*/ 256) {
    				prop_dev(progress_1, "value", /*$progress*/ ctx[8]);
    			}

    			if (dirty & /*$progress*/ 256 && t14_value !== (t14_value = Math.floor(/*$progress*/ ctx[8] * 100) + "")) set_data_dev(t14, t14_value);
    			if (dirty & /*nScanedCharms*/ 64) set_data_dev(t18, /*nScanedCharms*/ ctx[6]);

    			if (dirty & /*exportData*/ 128) {
    				prop_dev(textarea, "value", /*exportData*/ ctx[7]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    			/*textarea_binding*/ ctx[16](null);
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

    const title = "MHRise Charm Scanner";

    function instance($$self, $$props, $$invalidate) {
    	let $progress;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let scanner;
    	let fInitialized = false;
    	let fFinished = false;
    	let domInput; // input 要素
    	let files; // 選択されたローカルファイル
    	let domVideo; // video 要素
    	let video; // data uri
    	let capture; // opencv の VideoCapture

    	// result
    	let domTextareaForScript;

    	let nScanedCharms = 0;
    	let exportData = "";
    	const progress = writable(0);
    	validate_store(progress, "progress");
    	component_subscribe($$self, progress, value => $$invalidate(8, $progress = value));

    	window.addEventListener("load", async () => {
    		scanner = new MHRiseCharmScanner();
    		await scanner.init();
    		$$invalidate(0, fInitialized = true);
    	});

    	const onFileSelected = async e => {
    		const VIDEO_WIDTH = 1280;
    		const VIDEO_HEIGHT = 720;
    		const files = e.target.files;

    		if (files && files[0]) {
    			const reader = new FileReader();
    			reader.readAsDataURL(files[0]);

    			await new Promise(resolve => {
    					reader.onload = resolve;
    				});

    			$$invalidate(4, video = reader.result);
    			await new Promise(r => setTimeout(r, 50)); // sleep
    			$$invalidate(3, domVideo.width = VIDEO_WIDTH, domVideo); // necessary for capture.read()
    			$$invalidate(3, domVideo.height = VIDEO_HEIGHT, domVideo);
    			await new Promise(resolve => domVideo.addEventListener("canplay", resolve));

    			// if ( capture ) { capture.delete() }
    			capture = new cv.VideoCapture(domVideo);

    			const screenshot = new cv.Mat(VIDEO_HEIGHT, VIDEO_WIDTH, cv.CV_8UC4);
    			await new Promise(r => setTimeout(r, 200)); // sleep
    			let loopCount = 0;
    			const FRAME_RATE = 29.97;

    			while (domVideo.duration != domVideo.currentTime) {
    				capture.read(screenshot);
    				scanner.scan(screenshot);
    				const promiseSeek = new Promise(r => domVideo.addEventListener("seeked", r));
    				seekFrames(domVideo, 1, FRAME_RATE);
    				progress.set(domVideo.currentTime / domVideo.duration);
    				await promiseSeek;

    				if (++loopCount % 10 === 0) {
    					$$invalidate(6, nScanedCharms = scanner.countCharms());
    					$$invalidate(7, exportData = scanner.exportAsText());
    				}
    			}

    			progress.set(1);
    			console.log(scanner.charms);
    			fFinished = true;
    			screenshot.delete();
    			reader.delete();
    		}

    		$$invalidate(6, nScanedCharms = scanner.countCharms());
    		$$invalidate(7, exportData = scanner.exportAsText());
    	}; // exportData = scanner.generateInsertScript()

    	const seekFrames = (video, nFrames, fps = 29.97) => {
    		const currentFrame = video.currentTime * fps;
    		const newPosition = 0.00001 + (currentFrame + nFrames) / fps;

    		// plus 0.00001 is workaround for safari
    		video.currentTime = Math.min(video.duration, newPosition);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function video_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			domVideo = $$value;
    			$$invalidate(3, domVideo);
    		});
    	}

    	const change_handler = e => onFileSelected(e);

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

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			domTextareaForScript = $$value;
    			$$invalidate(5, domTextareaForScript);
    		});
    	}

    	$$self.$capture_state = () => ({
    		writable,
    		MHRiseCharmScanner,
    		fetchImage,
    		title,
    		scanner,
    		fInitialized,
    		fFinished,
    		domInput,
    		files,
    		domVideo,
    		video,
    		capture,
    		domTextareaForScript,
    		nScanedCharms,
    		exportData,
    		progress,
    		onFileSelected,
    		seekFrames,
    		$progress
    	});

    	$$self.$inject_state = $$props => {
    		if ("scanner" in $$props) scanner = $$props.scanner;
    		if ("fInitialized" in $$props) $$invalidate(0, fInitialized = $$props.fInitialized);
    		if ("fFinished" in $$props) fFinished = $$props.fFinished;
    		if ("domInput" in $$props) $$invalidate(1, domInput = $$props.domInput);
    		if ("files" in $$props) $$invalidate(2, files = $$props.files);
    		if ("domVideo" in $$props) $$invalidate(3, domVideo = $$props.domVideo);
    		if ("video" in $$props) $$invalidate(4, video = $$props.video);
    		if ("capture" in $$props) capture = $$props.capture;
    		if ("domTextareaForScript" in $$props) $$invalidate(5, domTextareaForScript = $$props.domTextareaForScript);
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
    		domVideo,
    		video,
    		domTextareaForScript,
    		nScanedCharms,
    		exportData,
    		$progress,
    		progress,
    		onFileSelected,
    		video_1_binding,
    		change_handler,
    		input_change_handler,
    		input_binding,
    		click_handler,
    		textarea_binding
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
