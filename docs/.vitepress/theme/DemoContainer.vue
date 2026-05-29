<script lang="ts" setup>
  import { computed, defineAsyncComponent, inject, ref } from 'vue';
  import { clipboard } from 'ld-v3-kit';

  defineOptions({
    name: 'DemoContainer',
  });

  const sourceVisible = ref(false);

  const props = defineProps<{
    source: string;
    path: string;
    rawSource: string;
    description: string;
    extension: string;
  }>();

  const decodedDescription = computed(() => decodeURIComponent(props.description));
  const decodedSource = computed(() => decodeURIComponent(props.source));

  const demoModules = inject('demoModules');
  const sourceModule = defineAsyncComponent(demoModules[props.path]);
  const handleClick = () => {
    sourceVisible.value = !sourceVisible.value;
  };
  const copyCode = async () => {
    try {
      await clipboard(decodeURIComponent(props.rawSource));
    } catch (e) {
      console.log(e);
    }
  };
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-html="decodedDescription" />

  <section class="example">
    <div class="example-showcase">
      <component :is="sourceModule"></component>
    </div>
    <div class="example-toolbar">
      <i class="fa-solid fa-copy example-toolbar__item" @click="copyCode"></i>
      <i class="fa-solid fa-code example-toolbar__item" @click="handleClick"></i>
    </div>
    <Transition name="ld-fade-in-linear">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-show="sourceVisible" class="example-source" v-html="decodedSource"></div>
    </Transition>
    <Transition name="ld-fade-in-linear">
      <div
        v-show="sourceVisible"
        class="example-float-control"
        role="button"
        tabindex="0"
        @click="handleClick"
      >
        <i class="fa-solid fa-arrow-up"></i>
        <span>隐藏示例源代码</span>
      </div>
    </Transition>
  </section>
</template>

<style lang="scss" scoped>
  .example {
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;

    &-showcase {
      padding: 1.5rem;
      margin: 0.5px;
      overflow: auto;
    }

    &-toolbar {
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 2.5rem;
      border-top: 1px solid #dee2e6;

      &__item {
        margin: 0 0.5rem;
        cursor: pointer;
        transition: 0.2s;
      }
    }

    &-source {
      :deep(.language-vue) {
        margin: 0 !important;
        border-radius: 0 !important;
      }
    }

    &-float-control {
      display: flex;
      align-items: center;
      justify-content: center;
      border-top: 1px solid #dee2e6;
      height: 44px;
      box-sizing: border-box;
      background-color: #ffffff;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      margin-top: -1px;
      color: #6c757d;
      cursor: pointer;
      position: sticky;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10;

      span {
        font-size: 14px;
        margin-left: 10px;
      }

      &:hover {
        color: #007bff;
      }
    }
  }

  .ld-fade-in-linear-enter-active,
  .ld-fade-in-linear-leave-active {
    transition: opacity 0.2s linear;
  }

  .ld-fade-in-linear-enter-from,
  .ld-fade-in-linear-leave-to {
    opacity: 0;
  }
</style>
