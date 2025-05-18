// 身份认证相关API
import request from './index';

// 身份认证API路径
const AUTH_URL = '/auth';

/**
 * 用户注册
 * @param {Object} data - 注册数据
 * @param {string} data.username - 用户名/手机号
 * @param {string} data.password - 密码
 * @returns {Promise} - 返回注册结果
 */
export const register = (data) => {
  return request.post(`${AUTH_URL}/register`, data);
};

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {string} data.username - 用户名/手机号
 * @param {string} data.password - 密码
 * @returns {Promise} - 返回登录结果，包含token等信息
 */
export const login = (data) => {
  return request.post(`${AUTH_URL}/login`, data);
};

/**
 * 退出登录
 * @returns {Promise} - 返回退出结果
 */
export const logout = () => {
  return request.post(`${AUTH_URL}/logout`);
};

/**
 * 检查登录状态
 * @returns {Promise} - 返回登录状态
 */
export const checkLoginStatus = () => {
  return request.get(`${AUTH_URL}/status`);
};

/**
 * 忘记密码请求
 * @param {Object} data - 请求数据
 * @param {string} data.email - 邮箱或手机号
 * @returns {Promise} - 返回处理结果
 */
export const forgotPassword = (data) => {
  return request.post(`${AUTH_URL}/forgot-password`, data);
};

/**
 * 重置密码
 * @param {Object} data - 重置数据
 * @param {string} data.token - 重置令牌
 * @param {string} data.password - 新密码
 * @returns {Promise} - 返回重置结果
 */
export const resetPassword = (data) => {
  return request.post(`${AUTH_URL}/reset-password`, data);
}; 