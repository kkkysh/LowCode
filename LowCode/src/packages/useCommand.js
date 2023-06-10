import deepcopy from "deepcopy";
import { events } from "./event";
import { onUnmounted } from "vue";

export function useCommand(data, focusData) {
    const state = {
        current: -1,
        queue: [],
        commands: {},
        commandArray: [],
        destroyList: []
    }

    const registry = (command) => {
        state.commandArray.push(command);
        state.commands[command.name] = (...args) => {
            const { redo, undo } = command.execute(...args);
            redo();
            if (!command.pushQueue) {
                return
            }
            let { queue, current } = state
            if (queue.length > 0) {
                queue.slice(0, current + 1);
                state.queue = queue;
            }
            queue.push({ redo, undo })
            state.current = current + 1
        }
    }

    registry({
        name: 'redo',
        keyboard: 'ctrl+y',
        execute() {
            return {
                redo() {
                    let item = state.queue[state.current + 1];
                    if (item) {
                        item.redo && item.redo();
                        state.current++;
                    }
                }
            }
        }
    });

    registry({
        name: 'undo',
        keyboard: 'ctrl+z',
        execute() {
            return {
                redo() {
                    if (state.current === -1) return;
                    let item = state.queue[state.current];
                    if (item) {
                        item.undo && item.undo();
                        state.current--;
                    }
                }
            }
        }
    });

    registry({
        name: 'updateContainer',
        pushQueue: true,
        execute(newValue) {
            let state = {
                before: data.value,
                after: newValue
            }
            return {
                redo: () => {
                    data.value = state.after
                },
                undo: () => {
                    data.value = state.before
                }
            }
        }
    });

    registry({
        name: 'updateBlock',
        pushQueue: true,
        execute(newBlock, oldBlock) {
            let state = {
                before: data.value.blocks,
                after: (() => {
                    let blocks = [...data.value.blocks];
                    const index = data.value.blocks.indexOf(oldBlock);
                    if (index > -1) {
                        blocks.splice(index, 1, newBlock)
                    }
                    return blocks
                })()
            }
            return {
                redo: () => {
                    data.value = { ...data.value, blocks: state.after }
                },
                undo: () => {
                    data.value = { ...data.value, blocks: state.before}
                }
            }
        }
    });

    registry({
        name: 'drag',
        pushQueue: true,
        init() {
            this.before = null
            const start = () => this.before = deepcopy(data.value.blocks)
            const end = () => state.commands.drag()
            events.on('start', start)
            events.on('end', end)
            return () => {
                events.off('start', start)
                events.off('end', end)
            }
        },
        execute() {
            let before = this.before
            let after = data.value.blocks
            return {
                redo() {
                    data.value = { ...data.value, blocks: after }
                },
                undo() {
                    data.value = { ...data.value, blocks: before }
                }

            }
        }
    });

    registry({
        name: 'placeTop',
        pushQueue: true,
        execute() {
            let before = deepcopy(data.value.blocks)
            let after = (() => {
                let { focus, unfocus } = focusData.value;
                let maxZIndex = unfocus.reduce((pre, cur) => {
                    return cur.zIndex > pre ? cur.zIndex : pre;
                }, -Infinity)
                focus.forEach(block => block.zIndex = maxZIndex + 1);
                return data.value.blocks
            })()
            return {
                redo: () => {
                    data.value = { ...data.value, blocks: after }
                },
                undo: () => {
                    data.value = { ...data.value, blocks: before }
                }
            }
        }
    });

    registry({
        name: 'placeBottom',
        pushQueue: true,
        execute() {
            let before = deepcopy(data.value.blocks)
            let after = (() => {
                let { focus, unfocus } = focusData.value;
                let minZIndex = unfocus.reduce((pre, cur) => {
                    return cur.zIndex < pre ? cur.zIndex : pre;
                }, Infinity) - 1;
                if (minZIndex < 0) {
                    const dur = Math.abs(minZIndex);
                    minZIndex = 0;
                    unfocus.forEach(block => block.zIndex += dur);
                }
                focus.forEach(block => block.zIndex = minZIndex);
                return data.value.blocks
            })()
            return {
                redo: () => {
                    data.value = { ...data.value, blocks: after }
                },
                undo: () => {
                    data.value = { ...data.value, blocks: before }
                }
            }
        }
    });

    registry({
        name: 'delete',
        pushQueue: true,
        execute() {
            let state = {
                before: deepcopy(data.value.blocks),
                after: focusData.value.unfocus
            }
            return {
                redo: () => {
                    data.value = { ...data.value, blocks: state.after }
                },
                undo: () => {
                    data.value = { ...data.value, blocks: state.before }
                }
            }
        }
    })

    const keyboard = (() => {
        const keyCodes = {
            90: 'z',
            89: 'y'
        }
        const onKeydown = (e) => {
            const { ctrlKey, keyCode } = e;
            let keyString = [];
            if (ctrlKey) keyString.push('ctrl');
            keyString.push(keyCodes[keyCode]);
            keyString = keyString.join('+');
            state.commandArray.forEach(({ keyboard, name }) => {
                if (!keyboard) return;
                if (keyboard === keyString) {
                    state.commands[name]();
                    e.preventDefault();
                }
            })

        }
        const init = () => {
            window.addEventListener('keydown', onKeydown)
            return () => {
                window.removeEventListener('keydown', onKeydown)
            }
        }
        return init
    })();

    (() => {
        state.destroyList.push(keyboard());
        state.commandArray.forEach(command => command.init && state.destroyList.push(command.init()))
    })();

    onUnmounted(() => {
        state.destroyList.forEach(fn => fn && fn())
    });

    return state
}