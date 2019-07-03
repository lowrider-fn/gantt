<template>
    
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

    methods: {
        setScaleConfig(level) {
            switch (level) {
            case 'day':
                gantt.config.scale_unit    = 'day';
                gantt.config.step          = 1;
                gantt.config.date_scale    = '%d %M';
                gantt.templates.date_scale = null;
 
                gantt.config.scale_height = 27;
 
                gantt.config.subscales = [];
                break;
            case 'week':
                var weekScaleTemplate = function (date) {
                    var dateToStr = gantt.date.date_to_str('%d %M');
                    var endDate   = gantt.date.add(gantt.date.add(date, 1, 'week'), -1, 'day');
                    return dateToStr(date) + ' - ' + dateToStr(endDate);
                };
 
                gantt.config.scale_unit    = 'week';
                gantt.config.step          = 1;
                gantt.templates.date_scale = weekScaleTemplate;
 
                gantt.config.scale_height = 50;
 
                gantt.config.subscales = [
                    {unit : 'day', step : 1, date : '%D'}
                ];
                break;
            case 'month':
                gantt.config.scale_unit    = 'month';
                gantt.config.date_scale    = '%F, %Y';
                gantt.templates.date_scale = null;
 
                gantt.config.scale_height = 50;
 
                gantt.config.subscales = [
                    {unit : 'day', step : 1, date : '%j, %D'}
                ];
 
                break;
            case 'year':
                gantt.config.scale_unit    = 'year';
                gantt.config.step          = 1;
                gantt.config.date_scale    = '%Y';
                gantt.templates.date_scale = null;
 
                gantt.config.min_column_width = 50;
                gantt.config.scale_height     = 90;
 
                gantt.config.subscales = [
                    {unit : 'month', step : 1, date : '%M'}
                ];
                break;
            }
        }
    }
};
</script>

<style>
