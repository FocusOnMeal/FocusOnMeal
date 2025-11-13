import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/member/login': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                // POST 요청만 프록시
                bypass: function(req, res, options) {
                    if (req.method !== 'POST') {
                        return req.url; // GET 요청은 프록시 안 함
                    }
                }
            },
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true
            },
            '/react': {
                target: 'http://localhost:8888',
                changeOrigin: true,
                rewrite: path => path.replace(/^\/react/, '')
            }
        }
    }
})
