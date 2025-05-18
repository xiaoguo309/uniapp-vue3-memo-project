import {
	createSSRApp
} from "vue";
import App from "./App.vue";
import pinia from './stores';
import api from './api/api';

export function createApp() {
	const app = createSSRApp(App);
	
	// 使用Pinia状态管理
	app.use(pinia);
	
	// 挂载API到全局
	app.config.globalProperties.$api = api;
	
	// 全局错误处理
	app.config.errorHandler = (err, vm, info) => {
		console.error('Vue Error:', err);
		console.error('Error Info:', info);
	};
	
	// 全局未处理的Promise错误
	window.addEventListener('unhandledrejection', (event) => {
		console.error('Unhandled Promise Rejection:', event.reason);
	});
	
	return {
		app,
	};
}
