<template>
  <div class="card">
    <header class="card-header text-center">
      <slot name="header"></slot>
    </header>
    <slot></slot>
    <section class="card-body" v-if="$slots.body">
      <slot name="body"></slot>
    </section>
    <div class="card-footer text-center" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
