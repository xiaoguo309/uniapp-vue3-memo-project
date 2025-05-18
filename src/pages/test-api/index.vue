<template>
  <view class="container">
    <view class="title">API 测试页面</view>
    
    <view class="form-section">
      <input type="text" v-model="username" placeholder="用户名" class="input" />
      <input type="password" v-model="password" placeholder="密码" class="input" />
      <button @click="testLogin" class="button">测试登录</button>
    </view>
    
    <view v-if="result" class="result-section">
      <view class="result-title">请求结果:</view>
      <textarea :value="JSON.stringify(result, null, 2)" disabled class="result-output"></textarea>
    </view>
    
    <button @click="goBack" class="button back-button">返回</button>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import * as authApi from '@/api/auth';

const username = ref('');
const password = ref('');
const result = ref(null);

// 测试登录API
const testLogin = async () => {
  if (!username.value || !password.value) {
    uni.showToast({
      title: '请输入用户名和密码',
      icon: 'none'
    });
    return;
  }
  
  try {
    uni.showLoading({ title: '请求中...' });
    
    console.log('开始调用登录API');
    console.log('请求URL:', 'http://localhost:8080/api/auth/login');
    console.log('请求参数:', {
      username: username.value,
      password: password.value,
      rememberMe: false
    });
    
    const response = await authApi.login({
      username: username.value,
      password: password.value,
      rememberMe: false
    });
    
    console.log('API响应:', response);
    result.value = response;
    
    uni.hideLoading();
  } catch (error) {
    console.error('API错误:', error);
    result.value = { error: error.message || '请求失败' };
    uni.hideLoading();
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss">
.container {
  padding: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  text-align: center;
}

.form-section {
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.input {
  background-color: #fff;
  border-radius: 6rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.button {
  background-color: #6A64F1;
  color: #fff;
  margin-top: 20rpx;
}

.result-section {
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.result-title {
  font-weight: bold;
  margin-bottom: 10rpx;
}

.result-output {
  background-color: #fff;
  border-radius: 6rpx;
  padding: 20rpx;
  width: 100%;
  height: 300rpx;
}

.back-button {
  background-color: #f0f0f0;
  color: #333;
}
</style> 