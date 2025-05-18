<template>
  <view class="login-container">
    <!-- 状态栏 -->
    <view class="status-bar">
      <text class="time">{{ currentTime }}</text>
      <view class="icons">
        <text class="icon icon-signal"></text>
        <text class="icon icon-wifi"></text>
        <text class="icon icon-battery"></text>
      </view>
    </view>

    <!-- 登录内容区 -->
    <view class="login-content">
      <!-- Logo -->
      <view class="logo">
        <view class="logo-circle">
          <text class="icon icon-clipboard"></text>
        </view>
      </view>

      <!-- 欢迎文本 -->
      <view class="welcome-text">
        <text class="title">欢迎回来</text>
        <text class="subtitle">请登录您的账号继续使用</text>
      </view>

      <!-- 输入表单 -->
      <view class="input-section">
        <view class="input-label">用户名/手机号</view>
        <view class="input-group">
          <input 
            type="text" 
            v-model="loginForm.username" 
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
            v-model="loginForm.password" 
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

      <!-- 记住我和忘记密码 -->
      <view class="remember-forgot">
        <view class="remember-me">
          <checkbox 
            :checked="loginForm.rememberMe"
            @change="loginForm.rememberMe = !loginForm.rememberMe" 
            color="#6A64F1" 
            style="transform:scale(0.7)"
          />
          <text>记住我</text>
        </view>
        <view class="forgot-password">
          <text @click="forgotPassword">忘记密码?</text>
        </view>
      </view>

      <!-- 登录按钮 -->
      <button class="login-button" @click="handleLogin">登 录</button>

      <!-- 其他登录方式 -->
      <view class="social-login-container">
        <view class="divider">
          <text>其他登录方式</text>
        </view>
        <view class="social-icons">
          <view class="social-icon wechat" @click="socialLogin('wechat')">
            <text class="icon icon-wechat"></text>
          </view>
          <view class="social-icon qq" @click="socialLogin('qq')">
            <text class="icon icon-qq"></text>
          </view>
          <view class="social-icon alipay" @click="socialLogin('alipay')">
            <text class="icon icon-alipay"></text>
          </view>
        </view>
      </view>

      <!-- 注册链接 -->
      <view class="signup-link">
        <text>还没有账号? </text>
        <text class="link" @click="goToRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/stores/user';
import * as authApi from '@/api/auth';
import '@/static/css/icons.css';

// 用户存储
const userStore = useUserStore();

// 当前时间
const currentTime = ref(formatCurrentTime());
// 定时器
let timeInterval;

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
});

// 密码显示控制
const showPassword = ref(false);

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

// 登录处理
const handleLogin = async () => {
  if (!loginForm.username) {
    uni.showToast({
      title: '请输入用户名或手机号',
      icon: 'none'
    });
    return;
  }
  
  if (!loginForm.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    });
    return;
  }
  
  // 登录逻辑
  uni.showLoading({
    title: '登录中...'
  });
  
  try {
    // 调用登录API
    const response = await authApi.login({
      username: loginForm.username,
      password: loginForm.password,
      rememberMe: loginForm.rememberMe
    });
    
    console.log('登录响应:', response);
    
    // 处理登录响应
    if (response.code === 200) {
      // 存储用户信息和Token
      userStore.setUserInfo(response.data);
      
      uni.hideLoading();
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
      // 登录成功后跳转
      uni.switchTab({
        url: '/pages/memo/index'
      });
    } else {
      uni.hideLoading();
      uni.showToast({
        title: response.message || '登录失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('登录错误:', error);
    uni.hideLoading();
    uni.showToast({
      title: error.message || '登录失败，请检查网络连接',
      icon: 'none'
    });
  }
};

// 社交账号登录
const socialLogin = (type) => {
  uni.showToast({
    title: `${type}登录功能开发中`,
    icon: 'none'
  });
};

// 忘记密码
const forgotPassword = () => {
  uni.showToast({
    title: '忘记密码功能开发中',
    icon: 'none'
  });
};

// 跳转到注册页面
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/index'
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
/* 登录容器 */
.login-container {
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

.login-content {
  padding: 20rpx 50rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Logo样式 */
.logo {
  text-align: center;
  margin: 10rpx 0 25rpx;
}

.logo-circle {
  width: 130rpx;
  height: 130rpx;
  border-radius: 30rpx;
  background: linear-gradient(135deg, #6A64F1, #8A7EFC);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  
  .icon {
    font-size: 65rpx;
    color: #ffffff;
  }
}

/* 欢迎文本 */
.welcome-text {
  text-align: center;
  margin-bottom: 35rpx;
  
  .title {
    font-size: 44rpx;
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

/* 记住我和忘记密码 */
.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25rpx;
  margin-top: 5rpx;
}

.remember-me {
  display: flex;
  align-items: center;
  
  text {
    font-size: 24rpx;
    color: #666;
    margin-left: 6rpx;
  }
}

.forgot-password {
  text {
    font-size: 24rpx;
    color: #6A64F1;
  }
}

/* 登录按钮 */
.login-button {
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

/* 社交登录 */
.social-login-container {
  margin-bottom: 25rpx;
}

.divider {
  position: relative;
  text-align: center;
  margin-bottom: 20rpx;
  
  text {
    background-color: #fff;
    padding: 0 20rpx;
    font-size: 24rpx;
    color: #888;
    position: relative;
    z-index: 1;
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #e1e1e1;
    z-index: 0;
  }
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 25rpx;
}

.social-icon {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .icon {
    font-size: 36rpx;
    color: #666;
  }
  
  &.wechat .icon {
    color: #07C160;
  }
  
  &.qq .icon {
    color: #1DA1F2;
  }
  
  &.alipay .icon {
    color: #1677FF;
  }
}

/* 注册链接 */
.signup-link {
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