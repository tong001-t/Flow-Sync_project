const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0', // 🟢 允许局域网访问（手机/同学电脑）
    port: 8080      // 你的端口号
  }
})