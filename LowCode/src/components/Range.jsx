import { computed, defineComponent, render } from "vue";


export default defineComponent({
    props: {
        start: {type: Number},
        end: {type: Number}
    },
    emits: ['update:start', 'update:end'],
    setup(props, ctx) {
        const start = computed({
            get() {
                return props.start;
            },
            set(newValue) {
                ctx.emit('update:end', newValue);
            }
        })
        const end = computed({
            get() {
                return props.end;
            },
            set(newValue) {
                ctx.emit('update:end', newValue);
            }
        })
        return () => {
            return <div class="range">
                <input class="range-input" type="text" v-model={start.value}/>
                <span style="margin:0 4px; display:inline-flex;">~</span>
                <input class="range-input" type="text" v-model={end.value}/>
            </div>
        }
    }
})