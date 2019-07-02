<template>
    <div ref="gantt"></div>
</template>

<script>
import 'dhtmlx-gantt';
export default {
    name : 'gantt',
    props: {
        tasks: {
            type: Object,
            default() {
                return {data : [], links : []};
            }
        }
    },

    mounted() {
        window.gantt.init(this.$refs.gantt);
        window.gantt.parse(this.$props.tasks);
    }
};
</script>

<style>
.gantt_layout_root{
    height: 500px!important;
}
@import "~dhtmlx-gantt/codebase/dhtmlxgantt.css";
</style>