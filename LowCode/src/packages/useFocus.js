import { computed, ref } from "vue";

export function useFocus(data, previewRef, callback) {

    const selectIndex = ref(-1);
    const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value])

    const focusData = computed(() => {
        let focus = [];
        let unfocus = [];
        data.value.blocks.forEach(block => (block.focus ? focus : unfocus).push(block));
        return {focus, unfocus}
    })
    const clearBlockFocus = () => {
        data.value.blocks.forEach(block => block.focus = false)
    }
    const containerMousedown = () => {
        if (!previewRef.value) return;
        clearBlockFocus();
        selectIndex.value = -1;
    }
    const blockMouseDown = (e, block, index) => {
        if (!previewRef.value) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
            block.focus = !block.focus
        }
        else {
            if (!block.focus) {
                clearBlockFocus()
                block.focus = true;
            }
            else {
                block.focus = false;
            }
        }
        selectIndex.value = index;
        callback(e);
    }
    return {
        containerMousedown,
        blockMouseDown,
        focusData,
        lastSelectBlock,
        selectIndex
    }
}