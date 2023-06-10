import { reactive } from "vue";
import { events } from "./event";

export function useBlockDragger(focusData, lastSelectBlock, data) {
    let dragState = {
        startX: 0,
        startY: 0,
        dragging: false
    }
    let markLine = reactive({
        x: null,
        y: null
    })
    const mousemove = (e) => {
        let { clientX: moveX, clientY: moveY } = e;

        if (!dragState.dragging) {
            dragState.dragging = true;
            events.emit('start');
        }

        let left = moveX - dragState.startX + dragState.startLeft;
        let top = moveY - dragState.startY + dragState.startTop;

        let y = null;
        let x = null;
        for (let i = 0; i < dragState.lines.y.length; i++) {
            const { top: t, showTop: s } = dragState.lines.y[i];
            if (Math.abs(t - top) < 5) {
                y = s;
                moveY = dragState.startY - dragState.startTop + t;
                // 快速贴边
                break;
            }
        }
        for (let i = 0; i < dragState.lines.x.length; i++) {
            const { left: l, showLeft: s } = dragState.lines.x[i];
            if (Math.abs(l - left) < 5) {
                x = s;
                moveX = dragState.startX - dragState.startLeft + l;
                // 快速贴边
                break;
            }
        }

        markLine.x = x;
        markLine.y = y;

        let durX = moveX - dragState.startX;
        let durY = moveY - dragState.startY;
        focusData.value.focus.forEach((block, idx) => {
            block.top = dragState.startPos[idx].top + durY;
            block.left = dragState.startPos[idx].left + durX;
        })
    }
    const mouseup = (e) => {
        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mouseup', mouseup)
        markLine.x = null
        markLine.y = null
        if (dragState.dragging) {
            events.emit('end');
        }
    }
    const mousedown = (e) => {

        const { width: BWidth, height: BHeight } = lastSelectBlock.value

        dragState = {
            startX: e.clientX,
            startY: e.clientY,
            startLeft: lastSelectBlock.value.left,
            startTop: lastSelectBlock.value.top,
            dragging: false,
            startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
            lines: (() => {
                // 以其他没有选中的block的位置做辅助线
                const { unfocus } = focusData.value;
                // 纵线x， 横线y
                let line = { x: [], y: [] };
                [...unfocus, {
                    top: 0,
                    left: 0,
                    width: data.value.container.width,
                    height: data.value.container.height
                }].forEach((block) => {
                    const { top: ATop, left: ALeft, width: AWidth, height: AHeight } = block;
                    line.y.push({ showTop: ATop, top: ATop });
                    line.y.push({ showTop: ATop, top: ATop - BHeight });
                    line.y.push({ showTop: ATop + AHeight / 2, top: ATop + AHeight / 2 - BHeight / 2 });
                    line.y.push({ showTop: ATop + AHeight, top: ATop + AHeight });
                    line.y.push({ showTop: ATop + AHeight, top: ATop + AHeight - BHeight });

                    line.x.push({ showLeft: ALeft, left: ALeft });
                    line.x.push({ showLeft: ALeft, left: ALeft - BWidth });
                    line.x.push({ showLeft: ALeft + AWidth / 2, left: ALeft + AWidth / 2 - BWidth / 2 });
                    line.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth });
                    line.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth - BWidth });
                })
                return line
            })()
        }
        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
    }
    return {
        mousedown,
        markLine
    }
}