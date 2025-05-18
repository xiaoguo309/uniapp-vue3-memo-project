// API访问hook
import { getCurrentInstance } from 'vue';
import api from '@/api/api';

/**
 * 获取API服务
 * @returns {Object} API服务对象
 */
export function useApi() {
  // 优先从组件实例获取，支持选项式API访问
  const instance = getCurrentInstance();
  if (instance) {
    return instance.appContext.config.globalProperties.$api;
  }
  
  // 直接返回API对象，支持组合式API访问
  return api;
} 