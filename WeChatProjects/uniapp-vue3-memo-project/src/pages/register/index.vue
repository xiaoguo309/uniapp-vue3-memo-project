<template>
  <view class="register-container">
    <!-- 状态栏 -->
    <view class="status-bar">
      <text class="time">{{ currentTime }}</text>
      <view class="icons">
        <text class="icon icon-signal"></text>
        <text class="icon icon-wifi"></text>
        <text class="icon icon-battery"></text>
      </view>
    </view>

    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="back-button" @click="goBack">
        <text class="icon icon-back"></text>
      </view>
      <view class="navbar-title">注册账号</view>
      <view class="placeholder"></view>
    </view>

    <!-- 注册内容区 -->
    <view class="register-content">
      <!-- Logo -->
      <view class="logo">
        <view class="logo-circle">
          <text class="icon icon-clipboard"></text>
        </view>
      </view>

      <!-- 欢迎文本 -->
      <view class="welcome-text">
        <text class="title">创建账号</text>
        <text class="subtitle">请填写以下信息完成注册</text>
      </view>

      <!-- 输入表单 -->
      <view class="input-section">
        <view class="input-label">用户名/手机号</view>
        <view class="input-group">
          <input 
            type="text" 
            v-model="registerForm.username" 
            placeholder="请输入用户名或手机号" 
            class="input-field"
          />
          <text class="icon icon-user input-icon"></text>
        </view>
      </view>

      <view class="input-section">
        <view class="input-label">密码</view>
        <view class="input-group">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            v-model="registerForm.password" 
            placeholder="请输入密码" 
            class="input-field"
          />
          <text 
            class="icon input-icon"
            :class="showPassword ? 'icon-eye' : 'icon-eye-close'" 
            @click="togglePasswordVisibility" 
          ></text>
        </view>
      </view>

      <view class="input-section">
        <view class="input-label">确认密码</view>
        <view class="input-group">
          <input 
            :type="showConfirmPassword ? 'text' : 'password'" 
            v-model="registerForm.confirmPassword" 
            placeholder="请再次输入密码" 
            class="input-field"
          />
          <text 
            class="icon input-icon"
            :class="showConfirmPassword ? 'icon-eye' : 'icon-eye-close'" 
            @click="toggleConfirmPasswordVisibility" 
          ></text>
        </view>
      </view>

      <!-- 用户协议 -->
      <view class="agreement" :class="{ 'agreement-active': registerForm.agreement }">
        <checkbox-group @change="checkboxChange">
          <label class="agreement-label">
            <checkbox 
              value="agree" 
              :checked="registerForm.agreement" 
              color="#6A64F1" 
              style="transform:scale(0.7)" 
            />
            <text class="agreement-text">我已阅读并同意 
              <text class="link" @click.stop="showAgreement">《用户协议》</text>和
              <text class="link" @click.stop="showPrivacy">《隐私政策》</text>
            </text>
          </label>
        </checkbox-group>
      </view>

      <!-- 错误信息提示 -->
      <view v-if="errorMsg" class="error-message">
        <text class="icon icon-warning"></text>
        <text>{{ errorMsg }}</text>
      </view>

      <!-- 注册按钮 -->
      <button class="register-button" @click="handleRegister">注 册</button>

      <!-- 登录链接 -->
      <view class="login-link">
        <text>已有账号? </text>
        <text class="link" @click="goBack">返回登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import '@/static/css/icons.css';
import * as authApi from '@/api/auth';

// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  agreement: false
});

// 错误信息
const errorMsg = ref('');

// 当前时间
const currentTime = ref(formatCurrentTime());
// 定时器
let timeInterval;

// 密码显示控制
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 格式化当前时间为HH:MM格式
function formatCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 更新时间
function updateTime() {
  currentTime.value = formatCurrentTime();
}

// 切换密码可见性
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// 切换确认密码可见性
const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

// checkbox-group的change事件处理函数
const checkboxChange = (e) => {
  console.log('checkbox change事件触发，当前值:', e.detail.value);
  registerForm.agreement = e.detail.value.includes('agree');
  console.log('协议勾选状态(通过checkbox切换):', registerForm.agreement);
};

// 注册处理
const handleRegister = async () => {
  // 重置错误信息
  errorMsg.value = '';
  
  // 刷新确认协议状态
  console.log('注册表单数据:', JSON.stringify(registerForm));
  console.log('协议勾选状态:', registerForm.agreement ? '已勾选' : '未勾选');
  
  // 表单验证
  if (!registerForm.username) {
    uni.showToast({
      title: '请输入用户名或手机号',
      icon: 'none'
    });
    return;
  }
  
  if (!registerForm.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    });
    return;
  }
  
  if (registerForm.password !== registerForm.confirmPassword) {
    uni.showToast({
      title: '两次输入密码不一致',
      icon: 'none'
    });
    return;
  }
  
  // 双重检查协议是否勾选
  if (registerForm.agreement !== true) {
    console.error('协议未勾选，无法注册');
    uni.showToast({
      title: '请阅读并同意用户协议',
      icon: 'none',
      duration: 2000
    });
    return;
  }
  
  // 准备注册数据
  const registerData = {
    username: registerForm.username,
    password: registerForm.password,
    confirmPassword: registerForm.confirmPassword,
    agreeTerms: registerForm.agreement
  };
  
  // 显示加载提示
  uni.showLoading({
    title: '注册中...'
  });
  
  try {
    // 调用注册API
    console.log('调用注册API:', 'http://localhost:8080/api/auth/register');
    console.log('注册数据:', registerData);
    
    const response = await authApi.register(registerData);
    
    console.log('注册API响应:', response);
    
    // 隐藏加载提示
    uni.hideLoading();
    
    if (response && response.code === 200) {
      // 注册成功
      uni.showToast({
        title: '注册成功',
        icon: 'success'
      });
      
      // 延迟跳转到登录页
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages/login/index',
          success: () => {
            console.log('跳转到登录页面成功');
          },
          fail: (error) => {
            console.error('跳转到登录页面失败:', error);
            // 如果重定向失败，尝试使用navigateTo
            uni.navigateTo({
              url: '/pages/login/index'
            });
          }
        });
      }, 1500);
    } else {
      // 注册失败
      errorMsg.value = response?.message || '注册失败';
      uni.showToast({
        title: errorMsg.value,
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('注册错误:', error);
    
    // 隐藏加载提示
    uni.hideLoading();
    
    // 显示错误信息
    errorMsg.value = error?.message || '注册失败，请稍后再试';
    uni.showToast({
      title: errorMsg.value,
      icon: 'none'
    });
  }
};

// 显示用户协议
const showAgreement = () => {
  uni.showToast({
    title: '用户协议功能开发中',
    icon: 'none'
  });
};

// 显示隐私政策
const showPrivacy = () => {
  uni.showToast({
    title: '隐私政策功能开发中',
    icon: 'none'
  });
};

// 返回登录页
const goBack = () => {
  uni.redirectTo({
    url: '/pages/login/index',
    fail: (error) => {
      console.error('跳转到登录页面失败:', error);
      // 如果重定向失败，尝试使用navigateBack
      uni.navigateBack({
        delta: 1
      });
    }
  });
};

// 页面加载时初始化时间更新
onMounted(() => {
  // 初始更新时间
  updateTime();
  // 每分钟更新一次时间
  timeInterval = setInterval(updateTime, 60000);
});

// 在页面卸载时清除定时器，避免内存泄漏
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
    timeInterval = null;
  }
});
</script>

<style lang="scss">
/* 注册容器 */
.register-container {
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 状态栏样式 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20rpx;
  height: 40px;
}

.time {
  font-size: 26rpx;
  font-weight: 600;
}

.icons {
  display: flex;
  align-items: center;
  
  .icon {
    margin-left: 10rpx;
    font-size: 26rpx;
  }
}

/* 导航栏 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 30rpx;
  height: 80rpx;
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  
  .icon {
    font-size: 40rpx;
    color: #333;
  }
}

.navbar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
}

.placeholder {
  width: 60rpx;
}

.register-content {
  padding: 10rpx 50rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Logo样式 */
.logo {
  text-align: center;
  margin: 10rpx 0 20rpx;
}

.logo-circle {
  width: 100rpx;
  height: 100rpx;
  border-radius: 25rpx;
  background: linear-gradient(135deg, #6A64F1, #8A7EFC);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  
  .icon {
    font-size: 50rpx;
    color: #ffffff;
  }
}

/* 欢迎文本 */
.welcome-text {
  text-align: center;
  margin-bottom: 30rpx;
  
  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .subtitle {
    font-size: 26rpx;
    color: #888;
  }
}

/* 输入框样式 */
.input-section {
  margin-bottom: 20rpx;
}

.input-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  
  .input-field {
    background-color: #f9f9f9;
    border: 1px solid #e1e1e1;
    border-radius: 20rpx;
    height: 80rpx;
    padding: 0 30rpx;
    width: 100%;
    font-size: 28rpx;
  }
  
  .input-field:focus {
    border-color: #6A64F1;
    box-shadow: 0 0 0 3px rgba(106, 100, 241, 0.1);
    background-color: #fff;
  }
  
  .input-icon {
    position: absolute;
    right: 30rpx;
    color: #999;
    font-size: 30rpx;
  }
}

/* 用户协议 */
.agreement {
  margin-bottom: 25rpx;
  margin-top: 5rpx;
  padding: 10rpx;
  border-radius: 10rpx;
  transition: background-color 0.3s;
  
  &.agreement-active {
    background-color: rgba(106, 100, 241, 0.05);
  }
  
  .agreement-label {
    display: flex;
    align-items: flex-start;
  }
  
  .agreement-text {
    font-size: 24rpx;
    color: #666;
    margin-left: 6rpx;
    line-height: 1.4;
    padding-top: 6rpx;
    
    .link {
      color: #6A64F1;
      font-weight: 500;
    }
  }
}

/* 错误信息提示 */
.error-message {
  background-color: rgba(255, 93, 93, 0.05);
  border: 1px solid rgba(255, 93, 93, 0.2);
  border-radius: 10rpx;
  padding: 12rpx 15rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  
  .icon {
    font-size: 28rpx;
    color: #FF5D5D;
    margin-right: 10rpx;
  }
  
  text {
    font-size: 24rpx;
    color: #FF5D5D;
  }
}

/* 注册按钮 */
.register-button {
  background: linear-gradient(135deg, #6A64F1, #8A7EFC);
  color: white;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  width: 100%;
  margin-bottom: 25rpx;
  border: none;
  box-shadow: 0 10rpx 20rpx rgba(106, 100, 241, 0.2);
  
  &:active {
    transform: translateY(2rpx);
  }
}

/* 登录链接 */
.login-link {
  text-align: center;
  margin-top: auto;
  padding-top: 15rpx;
  padding-bottom: 20rpx;
  
  text {
    font-size: 24rpx;
    color: #888;
  }
  
  .link {
    color: #6A64F1;
    font-weight: 600;
  }
}
</style> 