<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<style>
:root {
  --color-dark-blue: #4E4FEB;
  --color-light-blue: #068FFF;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.v-application {
  width: 100vw !important;
  min-height: 100vh !important;
  display: flex;
}

.v-application__wrap {
  width: 100%;
  min-height: 100vh;
}
</style>