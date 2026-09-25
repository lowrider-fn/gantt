<template>
    <div class="app__toolbar">
        <div class="app__scale">
            <button
                v-for="option in scaleOptions"
                :id="option.id"
                :key="option.id"
                type="button"
                :disabled="activeScale === option.id"
                @click="$emit('scale-change', option.id)"
            >
                {{ option.text }}
            </button>
        </div>
        <p class="app__disclaimer">
            Данные вымышленные. Все совпадения случайны.
        </p>
        <div v-if="hasChanges" class="app__actions">
            <button type="button" @click="$emit('save')">
                Сохранить
            </button>
            <button type="button" @click="$emit('cancel')">
                Отменить
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name : 'GanttToolbar',
    props: {
        scaleOptions: {
            type    : Array,
            required: true,
        },
        activeScale: {
            type    : String,
            required: true,
        },
        hasChanges: {
            type   : Boolean,
            default: false,
        },
    },
};
</script>
