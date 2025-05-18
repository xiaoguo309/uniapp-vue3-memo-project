<template>
  <view class="my-container">
    <!-- 状态栏 -->
    <view class="status-bar">
      <text class="time">9:41</text>
      <view class="icons">
        <text class="icon icon-signal"></text>
        <text class="icon icon-wifi"></text>
        <text class="icon icon-battery"></text>
      </view>
    </view>

    <!-- 顶部导航栏 -->
    <view class="navbar">
      <text class="navbar-title">个人中心</text>
    </view>

    <!-- 用户信息 -->
    <view class="user-card">
      <view class="avatar">
        <text class="avatar-text">{{ userStore.username ? userStore.username.charAt(0).toUpperCase() : 'U' }}</text>
      </view>
      <view class="user-info">
        <text class="username">{{ userStore.username || '用户名' }}</text>
        <text class="user-id">ID: {{ userStore.userId || '--' }}</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-list">
      <view class="menu-item" @click="goToSettings">
        <text class="icon icon-setting menu-icon"></text>
        <text class="menu-text">设置</text>
        <text class="icon icon-right arrow-icon"></text>
      </view>
      
      <view class="menu-item" @click="goToAbout">
        <text class="icon icon-info menu-icon"></text>
        <text class="menu-text">关于</text>
        <text class="icon icon-right arrow-icon"></text>
      </view>
      
      <view class="menu-item" @click="handleLogout">
        <text class="icon icon-logout menu-icon"></text>
        <text class="menu-text">退出登录</text>
        <text class="icon icon-right arrow-icon"></text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user';
import * as authApi from '@/api/auth';
import '@/static/css/icons.css';

// 获取用户存储
const userStore = useUserStore();

// 进入设置页面
const goToSettings = () => {
  uni.showToast({
    title: '设置功能开发中',
    icon: 'none'
  });
};

// 进入关于页面
const goToAbout = () => {
  uni.showToast({
    title: '关于功能开发中',
    icon: 'none'
  });
};

// 退出登录
const handleLogout = async () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '退出中...' });
          
          // 调用退出登录API
          await authApi.logout();
          
          // 清除本地用户信息
          userStore.clearUserInfo();
          
          uni.hideLoading();
          uni.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          
          // 返回登录页
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/index'
            });
          }, 1000);
        } catch (error) {
          console.error('退出登录失败:', error);
          
          // 即使API失败也清除本地用户信息
          userStore.clearUserInfo();
          
          uni.hideLoading();
          uni.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          
          // 返回登录页
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/index'
            });
          }, 1000);
        }
      }
    }
  });
};
</script>

<style lang="scss">
/* 个人中心容器 */
.my-container {
  min-height: 100vh;
  background-color: #f5f8ff;
  position: relative;
}

/* 状态栏样式 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20rpx;
  height: 40px;
  background-color: #f0f4ff;
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
  justify-content: center;
  align-items: center;
  padding: 10rpx 30rpx;
  height: 90rpx;
  background: linear-gradient(to right, #f0f4ff, #f5f8ff);
  border-bottom: 1px solid rgba(106, 100, 241, 0.1);
}

.navbar-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

/* 用户信息卡片 */
.user-card {
  margin: 30rpx;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 6rpx 15rpx rgba(106, 100, 241, 0.08);
  border: 1px solid rgba(106, 100, 241, 0.1);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: linear-gradient(135deg, #6A64F1, #8A7EFC);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.avatar-text {
  font-size: 60rpx;
  color: #fff;
  font-weight: 600;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.user-id {
  font-size: 24rpx;
  color: #999;
}

/* 菜单列表 */
.menu-list {
  margin: 30rpx;
}

.menu-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 15rpx rgba(106, 100, 241, 0.08);
  border: 1px solid rgba(106, 100, 241, 0.1);
  transition: background-color 0.2s;
  
  &:active {
    background-color: rgba(106, 100, 241, 0.05);
  }
}

.menu-icon {
  font-size: 36rpx;
  color: #6A64F1;
  margin-right: 20rpx;
}

.menu-text {
  font-size: 30rpx;
  color: #333;
  flex: 1;
}

.arrow-icon {
  font-size: 30rpx;
  color: #999;
}
</style> 