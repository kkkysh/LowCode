import { defineComponent } from "vue";

export default defineComponent({
    props: {
        block: { type: Object },
        component: { type: Object }
    },
    setup(props) {
        const { width, height } = props.component.resize || {};
        let data = {};
        const onmousemove = (e) => {
            let { clientX, clientY } = e;
            let { startX, startY, startWidth, startHeight, startLeft, startTop, direction } = data;

            if (direction.horizontal === 'center') {
                clientX = startX;
            }
            if (direction.vertical === 'center') {
                clientY = startY;
            }

            let durX = clientX - startX;
            let durY = clientY - startY;

            if (direction.vertical === 'start') {
                durY = -durY;
                props.block.top = startTop - durY;
            }
            if (direction.horizontal === 'start') {
                durX = -durX;
                props.block.left = startLeft - durX;
            }

            const width = startWidth + durX;
            const height = startHeight + durY;

            props.block.width = width;
            props.block.height = height;
            props.block.hasResize = true;
        }
        const onmouseup = (e) => {
            document.body.removeEventListener('mousemove', onmousemove);
            document.body.removeEventListener('mouseup', onmouseup);
        }
        const onmousedown = (e, direction) => {
            e.stopPropagation();
            data = {
                startX: e.clientX,
                startY: e.clientY,
                startWidth: props.block.width,
                startHeight: props.block.height,
                startLeft: props.block.left,
                startTop: props.block.top,
                direction
            }
            document.body.addEventListener('mousemove', onmousemove);
            document.body.addEventListener('mouseup', onmouseup)
        }
        return () => {
            return <>
                {
                    width && <>
                        <div class="block-resize block-resize-left" onMousedown={e => onmousedown(e, { horizontal: 'start', vertical: 'center' })}></div>
                        <div class="block-resize block-resize-right" onMousedown={e => onmousedown(e, { horizontal: 'end', vertical: 'center' })}></div>
                    </>
                }
                {
                    height && <>
                        <div class="block-resize block-resize-top" onMousedown={e => onmousedown(e, { horizontal: 'center', vertical: 'start' })}></div>
                        <div class="block-resize block-resize-bottom" onMousedown={e => onmousedown(e, { horizontal: 'center', vertical: 'end' })}></div>
                    </>
                }
                {
                    height && width && <>
                        <div class="block-resize block-resize-top-left" onMousedown={e => onmousedown(e, { horizontal: 'start', vertical: 'start' })}></div>
                        <div class="block-resize block-resize-bottom-left" onMousedown={e => onmousedown(e, { horizontal: 'start', vertical: 'end' })}></div>
                        <div class="block-resize block-resize-top-right" onMousedown={e => onmousedown(e, { horizontal: 'end', vertical: 'start' })}></div>
                        <div class="block-resize block-resize-bottom-right" onMousedown={e => onmousedown(e, { horizontal: 'end', vertical: 'end' })}></div>
                    </>
                }
            </>
        }
    }
})