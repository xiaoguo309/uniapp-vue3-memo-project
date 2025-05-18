// 用户状态管理
import { defineStore } from 'pinia';

// 用户状态Store
export const useUserStore = defineStore('user', {
  // 状态
  state: () => ({
    token: uni.getStorageSync('token') || '', 
    userId: uni.getStorageSync('userId') || null,
    username: uni.getStorageSync('username') || '',
    isLoggedIn: !!uni.getStorageSync('token'),
  }),
  
  // 计算属性
  getters: {
    // 是否已登录
    loggedIn: (state) => state.isLoggedIn,
    
    // 获取用户信息
    userInfo: (state) => ({
      userId: state.userId,
      username: state.username,
    }),
  },
  
  // 方法
  actions: {
    /**
     * 保存用户登录信息
     * @param {Object} data - 用户登录信息
     * @param {string} data.token - 用户Token
     * @param {number|string} data.userId - 用户ID
     * @param {string} data.username - 用户名
     * @param {number} data.expiresIn - Token有效期(秒)
     */
    setUserInfo(data) {
      // 更新状态
      this.token = data.token;
      this.userId = data.userId;
      this.username = data.username;
      this.isLoggedIn = true;
      
      // 保存到本地存储
      uni.setStorageSync('token', data.token);
      uni.setStorageSync('userId', data.userId);
      uni.setStorageSync('username', data.username);
    },
    
    /**
     * 清除用户信息
     */
    clearUserInfo() {
      // 清除状态
      this.token = '';
      this.userId = null;
      this.username = '';
      this.isLoggedIn = false;
      
      // 清除本地存储
      uni.removeStorageSync('token');
      uni.removeStorageSync('userId');
      uni.removeStorageSync('username');
    },
  },
}); 