module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        logLevel: 'debug',
        followRedirects: true,
        secure: false,
        onProxyReq: function(proxyReq) {
          console.log(`Прокси запрос к: ${proxyReq.path}`);
          proxyReq.removeHeader('Origin');
        }
      }
    }
  },
  lintOnSave: false
} 