module.exports = {
  devServer: {
    proxy: {
      '/users': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        logLevel: 'debug',
        followRedirects: true,
        secure: false,
        onProxyReq: function(proxyReq) {
          console.log(`Прокси запрос к: ${proxyReq.path}`);
          proxyReq.removeHeader('Origin');
        }
      },
      '/sets': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        logLevel: 'debug',
        followRedirects: true,
        secure: false
      },
      '/minifigures': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        logLevel: 'debug',
        followRedirects: true,
        secure: false
      },
      '/tags': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        logLevel: 'debug',
        followRedirects: true,
        secure: false
      }
    }
  },
  lintOnSave: false
} 