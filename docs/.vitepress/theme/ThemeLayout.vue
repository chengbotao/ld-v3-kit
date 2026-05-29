<script setup>
  import DefaultTheme from 'vitepress/theme';

  const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #aside-outline-after>
      <div class="donate-group">
        <div class="qr-code">
          <img src="/donate.jpg" alt="投喂一份大大大～鸡腿🍗" />
        </div>
        <p class="donate-group-text">投喂一份大大大～鸡腿🍗</p>
      </div>
    </template>
  </Layout>
</template>

<style scoped>
  /* aside 投喂 */
  .donate-group {
    padding: 5px;
    margin-top: 20px;
    text-align: center;
  }

  .qr-code {
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgb(0, 0, 0 / 10%);
  }

  .qr-code img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .donate-group-text {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    color: var(--vp-c-text-secondary);
  }
</style>
