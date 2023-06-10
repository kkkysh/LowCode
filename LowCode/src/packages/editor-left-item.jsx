import { defineComponent, inject } from "vue";
import { events } from "./event";

export default defineComponent ({
    props: {
        containerRef: {type: Object}
    },
    emits: ['updateblocks'],
    setup(props, ctx) {
        const config = inject('config')
        const componentList = config.componentList
        const containerRef = props.containerRef
        let currentComponent = null
        const dragenter = (e) => {
            e.dataTransfer.dropEffect = 'move';
        }
        const dragover = (e) => {
            e.preventDefault();
        }
        const dragleave = (e) => {
            e.dataTransfer.dropEffect = 'none';
        }
        const drop = (e) => {
            let updateData = {
                top: e.offsetY,
                left: e.offsetX,
                zIndex: 1,
                key: currentComponent.key,
                alignCenter: true,
                props: {},
                model: {}
            }
            ctx.emit('updateblocks', updateData)
            currentComponent = null
        }
        const dragstart = (e, component) => {
            // dragenter 进入元素，添加一个移动标识
            containerRef.value.addEventListener('dragenter', dragenter)
            // dragover 
            containerRef.value.addEventListener('dragover', dragover)
            // dragleave
            containerRef.value.addEventListener('dragleave',dragleave)
            // drop
            containerRef.value.addEventListener('drop', drop)
            currentComponent = component
            events.emit('start');
        }

        const dragend = (e) => {
            containerRef.value.removeEventListener('dragenter', dragenter)
            containerRef.value.removeEventListener('dragover', dragover)
            containerRef.value.removeEventListener('dragleave',dragleave)
            containerRef.value.removeEventListener('drop', drop)
            events.emit('end');
        }

        return () => (
            componentList.map((item) => (
                <div 
                    class="editor-left-item" 
                    draggable 
                    ondragstart={e=>dragstart(e, item)}
                    ondragend={dragend}
                >
                    <span>{ item.label }</span>
                    <div class="editor-left-item-preview">{ item.preview() }</div>
                </div>
            ))
        )
    }
})