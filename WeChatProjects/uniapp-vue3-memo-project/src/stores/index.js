// 统一导出Store
import { createPinia } from 'pinia';

// 导出Store模块
export * from './user';
export * from './memo';

// 创建Pinia实例
const pinia = createPinia();

export default pinia; 