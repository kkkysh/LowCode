import { computed, defineComponent, provide, ref, watch } from "vue";
import './editor.css'
import EditorBlock from './editor-block'
import EditorLeftItem from './editor-left-item'
import EditorOperator from './editor-operator'
import deepcopy from 'deepcopy'
import { useFocus } from "./useFocus";
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand";
import { $dialog } from "../components/Dialog";
import { $dropdown, DropdownItem } from "../components/Dropdown";
import { ElButton } from "element-plus";

export default defineComponent({
    props: {
        modelValue: { type: Object },
        formData: { type: Object }
    },
    emits: ['update:modelValue'],
    setup(props, ctx) {

        const previewRef = ref(true);
        const editorRef = ref(false);

        const data = computed({
            get() {
                return props.modelValue;
            },
            set(newValue) {
                ctx.emit('update:modelValue', deepcopy(newValue))
            }
        })

        const containerStyles = computed(() => ({
            width: data.value.container.width + 'px',
            height: data.value.container.height + 'px'
        }))

        const containerRef = ref(null)

        // 菜单拖拽后，在内容区增加block后更新data数据
        const updateblocks = (component) => {
            let blocks = data.value.blocks
            data.value = {
                ...data.value, blocks: [
                    ...blocks, { ...component }
                ]
            }
        }
        // 获取焦点，并实现多个拖拽
        let { containerMousedown, blockMouseDown, focusData, lastSelectBlock, selectIndex } = useFocus(data, previewRef, (e) => {
            mousedown(e);
        });
        let { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data);

        const { commands } = useCommand(data, focusData);

        const onContextMenuBlock = (e, block) => {
            e.preventDefault();
            $dropdown({
                el: e.target,
                content: () => {
                    return <>
                        <DropdownItem label="删除" onClick={() => commands.delete()}></DropdownItem>
                        <DropdownItem label="置顶" onClick={() => commands.placeTop()}></DropdownItem>
                        <DropdownItem label="置底" onClick={() => commands.placeBottom()}></DropdownItem>
                        <DropdownItem label="查看" onClick={() => {
                            $dialog({
                                title: '查看节点数据',
                                content: JSON.stringify(block)
                            })
                        }}></DropdownItem>
                        <DropdownItem label="导入" onClick={() => {
                            $dialog({
                                title: '导入节点数据',
                                content: '',
                                footer: true,
                                onConfirm(text) {
                                    text = JSON.parse(text);
                                    commands.updateBlock(text, block)
                                }
                            })
                        }}></DropdownItem>
                    </>
                }
            })
        }

        const buttons = [
            { label: '撤销', handler: () => commands.undo() },
            { label: '重做', handler: () => commands.redo() },
            {
                label: '导入', handler: () => {
                    $dialog({
                        title: '导入json数据',
                        content: '',
                        footer: true,
                        onConfirm(text) {
                            commands.updateContainer(JSON.parse(text));
                        }
                    })
                }
            },
            {
                label: '导出', handler: () => {
                    $dialog({
                        title: '导出json数据',
                        content: JSON.stringify(data.value),
                        footer: false,
                    })
                }
            },
            { label: '置顶', handler: () => commands.placeTop() },
            { label: '置底', handler: () => commands.placeBottom() },
            { label: '删除', handler: () => commands.delete() },
            { label: () => previewRef.value ? '预览' : '编辑', handler: () => previewRef.value = !previewRef.value },
            { label: '退出', handler: () => editorRef.value = !editorRef.value }
        ]

        return () => editorRef.value ?
            <>
                <ElButton onClick={() => editorRef.value = !editorRef.value}>继续编辑</ElButton>
                { JSON.stringify(props.formData) }
                <div
                    class="editor-container-canvas-content"
                    style={containerStyles.value}
                >
                    {
                        (data.value.blocks.map((block, index) => (
                            <EditorBlock
                                block={block}
                                class={'editor-block-preview'}
                                formData={props.formData}
                            ></EditorBlock>
                        )))
                    }
                </div>
            </>
            :
            <div class="editor">
                <div class="editor-left">
                    <EditorLeftItem containerRef={containerRef} onUpdateblocks={updateblocks}></EditorLeftItem>
                </div>
                <div class="editor-top">
                    {
                        (buttons.map(button => (
                            <button class="editor-top-button" onClick={button.handler}>
                                {typeof button.label === 'function' ? button.label() : button.label}
                            </button>
                        )))
                    }
                </div>
                <div class="editor-right">
                    <EditorOperator
                        block={lastSelectBlock.value}
                        data={data.value}
                        updateContainer={commands.updateContainer}
                        updateBlock={commands.updateBlock}
                    >
                    </EditorOperator>
                </div>
                <div class="editor-container">
                    {/* 滚动条 */}
                    <div class="editor-container-canvas">
                        {/* 内容 */}
                        <div
                            class="editor-container-canvas-content"
                            style={containerStyles.value}
                            ref={containerRef}
                            onMousedown={containerMousedown}
                        >
                            {
                                (data.value.blocks.map((block, index) => (
                                    <EditorBlock
                                        block={block}
                                        onMousedown={(e) => blockMouseDown(e, block, index)}
                                        onContextmenu={(e) => onContextMenuBlock(e, block)}
                                        class={block.focus && previewRef.value ? 'editor-block-focus' : ''}
                                        class={!previewRef.value ? 'editor-block-preview' : ''}
                                        formData={props.formData}
                                    ></EditorBlock>
                                )))
                            }
                            {markLine.x != null && <div class="line-x" style={{ left: markLine.x + 'px' }}></div>}
                            {markLine.y != null && <div class="line-y" style={{ top: markLine.y + 'px' }}></div>}
                        </div>
                    </div>
                </div>
            </div >
    }
})