import { ElButton, ElDialog, ElInput } from "element-plus";
import { computed, createVNode, defineComponent, onMounted, reactive, render, ref, onBeforeUnmount, provide, inject } from "vue";


export const DropdownItem = defineComponent({
    props: {
        label: String
    },
    setup(props) {
        let { label } = props;
        let hide = inject('hide')
        return () => <div class="dropdown-item" onClick={hide}>
            <span>{label}</span>
        </div>
    }
})

const DropdownComponent = defineComponent({
    props: {
        option: { type: Object }
    },
    setup(props, ctx) {
        const state = reactive({
            option: props.option,
            isShow: false,
            top: 0,
            left: 0
        })
        ctx.expose({
            showDropdown(option) {
                state.option = option;
                state.isShow = true;
                let { top, left, height } = option.el.getBoundingClientRect();
                state.top = top + height;
                state.left = left;
            }
        })
        provide('hide', ()=>{
            state.isShow = false
        })
        const styles = computed(() => ({
            top: state.top + 'px',
            left: state.left + 'px'
        }))
        const classes = computed(() => [
            'dropdown',
            {
                'dropdown-isShow': state.isShow
            }
        ])
        const el = ref(null)
        const onMousedownDocument = (e) => {
            if (!el.value.contains(e.target)) {
                state.isShow = false;
            }
        }
        onMounted(() => {
            document.body.addEventListener('mousedown', onMousedownDocument, true)
        })
        onBeforeUnmount(() => {
            document.body.removeEventListener('mousedown', onMousedownDocument, true)
        })
        return () => {
            return <div class={classes.value} style={styles.value} ref={el}>
                {state.option.content()}
            </div>
        }
    }
})
let vm;
export function $dropdown(option) {
    if (!vm) {
        let el = document.createElement('div');
        // 将组建渲染为虚拟节点
        vm = createVNode(DropdownComponent, { option });
        // 渲染成真实节点扔到页面中
        document.body.appendChild((render(vm, el), el));
    }
    let { showDropdown } = vm.component.exposed;
    showDropdown(option)
}