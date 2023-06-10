import { ElButton, ElDialog, ElInput } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";


const DialogComponent = defineComponent({
    props: {
        option: { type: Object }
    },
    setup(props, ctx) {
        const state = reactive({
            isShow: false,
            option: props.option
        })
        ctx.expose({
            showDialog(option) {
                state.option = option
                state.isShow = true;
            }
        })
        const onCancel = () => {
            state.isShow = false
        }
        const onConfirm = () => {
            state.isShow = false
            state.option.onConfirm && state.option.onConfirm(state.option.content)
        }

        return () => {
            return <ElDialog v-model={state.isShow} title={state.option.title}>
                {{
                    default: () => <ElInput type="textarea" v-model={state.option.content} rows={10}></ElInput>,
                    footer: () => state.option.footer && <div>
                            <ElButton onClick={onCancel}>取消</ElButton>
                            <ElButton type="primary" onClick={onConfirm}>确定</ElButton>
                        </div>
                }}
            </ElDialog>
        }
    }
})
let vm;
export function $dialog(option) {
    if (!vm) {
        let el = document.createElement('div');
        // 将组建渲染为虚拟节点
        vm = createVNode(DialogComponent, { option });
        // 渲染成真实节点扔到页面中
        document.body.appendChild((render(vm, el), el));
    }
    let { showDialog } = vm.component.exposed;
    showDialog(option)
}