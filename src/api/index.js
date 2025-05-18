// 基础API配置

// API基础配置
const BASE_URL = 'http://localhost:8080/api';
// 请求超时时间（毫秒）
const TIMEOUT = 15000;

// 请求方法封装
const request = async (url, options = {}) => {
  // 完整请求路径
  const fullUrl = `${BASE_URL}${url}`;
  
  console.log(`===== 发起API请求 =====`);
  console.log(`完整URL: ${fullUrl}`);
  
  // 默认请求头
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 如果需要身份验证，添加Token
  const token = uni.getStorageSync('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // 请求配置
  const requestOptions = {
    method: options.method || 'GET',
    header: headers,  // uni.request使用header而非headers
    timeout: TIMEOUT, // 设置超时时间
    ...options,
  };

  // 处理请求体
  if (options.data && ['POST', 'PUT', 'PATCH'].includes(requestOptions.method)) {
    requestOptions.data = JSON.stringify(options.data);
  }

  // 打印请求信息
  console.log('API请求:', {
    url: fullUrl,
    method: requestOptions.method,
    headers: requestOptions.header,
    data: requestOptions.data
  });

  // 发送请求
  try {
    return new Promise((resolve, reject) => {
      uni.request({
        url: fullUrl,
        method: requestOptions.method,
        header: requestOptions.header,
        data: requestOptions.data,
        timeout: TIMEOUT,
        success: (res) => {
          console.log('API响应成功:', res);
          
          const { statusCode, data } = res;
          
          // 处理HTTP状态码
          if (statusCode >= 200 && statusCode < 300) {
            resolve(data);
          } else if (statusCode === 401) {
            // 处理401未授权错误
            // 清除Token并跳转到登录页
            uni.removeStorageSync('token');
            uni.removeStorageSync('userId');
            uni.removeStorageSync('username');
            
            uni.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none'
            });
            uni.navigateTo({ url: '/pages/login/index' });
            reject(data || { message: '未授权或登录已过期' });
          } else {
            // 处理其他错误
            reject(data || { message: `请求失败，状态码: ${statusCode}` });
          }
        },
        fail: (err) => {
          console.error('API请求失败:', err);
          
          // 针对不同错误类型给出更具体的错误信息
          let errMsg = '网络请求失败';
          if (err.errMsg) {
            if (err.errMsg.includes('timeout')) {
              errMsg = '请求超时，请检查网络连接';
            } else if (err.errMsg.includes('fail')) {
              errMsg = '服务器连接失败，请稍后重试';
            }
          }
          
          reject({ message: errMsg, originalError: err });
        }
      });
    });
  } catch (error) {
    console.error('API请求异常:', error);
    return Promise.reject({ message: '请求发生异常', originalError: error });
  }
};

// 导出请求方法
export default {
  get: (url, params, options = {}) => {
    const queryString = params 
      ? '?' + Object.keys(params)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
          .join('&')
      : '';
    return request(`${url}${queryString}`, { ...options, method: 'GET' });
  },
  post: (url, data, options = {}) => request(url, { ...options, method: 'POST', data }),
  put: (url, data, options = {}) => request(url, { ...options, method: 'PUT', data }),
  delete: (url, options = {}) => request(url, { ...options, method: 'DELETE' })
}; 