<template>
  <view class="memo-detail-container">
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
      <text class="navbar-title">{{ isNewMemo ? '新建备忘录' : '备忘详情' }}</text>
      <view class="delete-button" v-if="!isNewMemo" @click="confirmDelete">
        <text class="icon icon-trash"></text>
      </view>
      <view class="placeholder" v-else></view>
    </view>

    <!-- 备忘录详情内容 -->
    <view class="memo-content">
      <view class="memo-detail-card">
        <input 
          class="memo-title-input" 
          v-model="memoDetail.title" 
          placeholder="请输入标题" 
          maxlength="50"
          :focus="isNewMemo"
        />
        <view class="title-separator"></view>
        <textarea 
          class="memo-text-input" 
          v-model="memoDetail.content" 
          placeholder="请输入备忘录内容" 
          maxlength="2000"
          auto-height
        />
      </view>
    </view>

    <!-- 底部按钮区域 -->
    <view class="bottom-buttons">
      <button class="save-button" @click="saveMemo">
        <view class="button-content">
          <text class="icon icon-save"></text>
          <text>{{ isNewMemo ? '创建' : '保存' }}</text>
        </view>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import * as memoApi from '@/api/memo';
import '@/static/css/icons.css';

// 是否为新建备忘录
const isNewMemo = ref(false);
// 加载状态
const loading = ref(false);
// 网络错误状态
const networkError = ref(false);
// 当前时间
const currentTime = ref(formatCurrentTime());
// 定时器
let timeInterval;

// 备忘录详情数据
const memoDetail = ref({
  id: null,
  title: '',
  content: ''
});

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

// 页面加载，获取路由参数
onLoad((options) => {
  console.log('路由参数:', options);
  
  // 初始更新时间
  updateTime();
  // 每分钟更新一次时间
  timeInterval = setInterval(updateTime, 60000);
  
  // 检查是否为新建模式
  if (options.isNew === '1') {
    console.log('进入新建模式');
    isNewMemo.value = true;
    // 清空备忘录数据
    memoDetail.value = {
      id: null,
      title: '',
      content: ''
    };
  } else if (options.id) {
    console.log('进入编辑模式, ID:', options.id);
    // 查看/编辑现有备忘录
    isNewMemo.value = false;
    getMemoDetail(options.id);
  } else {
    console.log('无有效参数，默认为新建模式');
    isNewMemo.value = true;
  }
});

// 从服务器获取备忘录详情
const getMemoDetail = async (id) => {
  try {
    loading.value = true;
    networkError.value = false;
    
    uni.showLoading({
      title: '加载中...'
    });
    
    console.log('获取备忘录详情，ID:', id);
    console.log('请求API:', `http://localhost:8080/api/memo/detail/${id}`);
    
    const response = await memoApi.getMemoDetail(id);
    
    console.log('备忘录详情响应:', response);
    
    if (response && response.code === 200 && response.data) {
      isNewMemo.value = false; // 确保标记为非新建模式
      memoDetail.value = { ...response.data };
    } else {
      console.error('备忘录详情返回错误:', response);
      
      uni.showToast({
        title: response?.message || '获取数据失败',
        icon: 'none'
      });
      
      // 如果找不到，返回备忘录列表
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  } catch (error) {
    console.error('获取备忘录详情错误:', error);
    networkError.value = true;
    
    uni.showToast({
      title: '获取数据失败，请重试',
      icon: 'none'
    });
    
    // 发生错误，返回备忘录列表
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } finally {
    loading.value = false;
    uni.hideLoading();
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 创建备忘录
const createMemo = async () => {
  try {
    loading.value = true;
    
    console.log('创建备忘录:', memoDetail.value);
    console.log('请求API: http://localhost:8080/api/memo/create');
    
    const response = await memoApi.createMemo({
      title: memoDetail.value.title,
      content: memoDetail.value.content
    });
    
    console.log('创建备忘录响应:', response);
    
    if (response && response.code === 200) {
      uni.showToast({
        title: '创建成功',
        icon: 'success'
      });
      
      // 先发送刷新消息，确保事件先被触发
      uni.$emit('refreshMemoList');
      console.log('已发送刷新备忘录列表事件');
      
      // 创建成功后跳回备忘录列表页面
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/memo/index',
          success: () => {
            console.log('跳转到备忘录列表页面成功');
          },
          fail: (error) => {
            console.error('跳转到备忘录列表页面失败:', error);
          }
        });
      }, 1000);
    } else {
      uni.showToast({
        title: response?.message || '创建失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('创建备忘录错误:', error);
    
    uni.showToast({
      title: '创建失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    uni.hideLoading();
  }
};

// 更新备忘录
const updateMemo = async () => {
  try {
    loading.value = true;
    
    console.log('更新备忘录:', memoDetail.value);
    console.log(`请求API: http://localhost:8080/api/memo/update/${memoDetail.value.id}`);
    
    const response = await memoApi.updateMemo(memoDetail.value.id, {
      title: memoDetail.value.title,
      content: memoDetail.value.content
    });
    
    console.log('更新备忘录响应:', response);
    
    if (response && response.code === 200) {
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 先发送刷新消息，确保事件先被触发
      uni.$emit('refreshMemoList');
      console.log('已发送刷新备忘录列表事件');
      
      // 更新成功后跳回备忘录列表页面
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/memo/index',
          success: () => {
            console.log('跳转到备忘录列表页面成功');
          },
          fail: (error) => {
            console.error('跳转到备忘录列表页面失败:', error);
          }
        });
      }, 1000);
    } else {
      uni.showToast({
        title: response?.message || '保存失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('更新备忘录错误:', error);
    
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    uni.hideLoading();
  }
};

// 保存备忘录
const saveMemo = () => {
  // 防止重复提交
  if (loading.value) return;
  
  // 表单验证
  if (!memoDetail.value.title.trim()) {
    uni.showToast({
      title: '请输入标题',
      icon: 'none'
    });
    return;
  }
  
  uni.showLoading({
    title: isNewMemo.value ? '创建中...' : '保存中...'
  });
  
  // 根据操作类型调用不同的API
  if (isNewMemo.value) {
    createMemo();
  } else {
    updateMemo();
  }
};

// 确认删除
const confirmDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除此备忘录吗？',
    confirmColor: '#6A64F1',
    success: (res) => {
      if (res.confirm) {
        deleteMemo();
      }
    }
  });
};

// 删除备忘录
const deleteMemo = async () => {
  try {
    loading.value = true;
    
    uni.showLoading({
      title: '删除中...'
    });
    
    console.log('删除备忘录:', memoDetail.value.id);
    console.log(`请求API: http://localhost:8080/api/memo/delete/${memoDetail.value.id}`);
    
    const response = await memoApi.deleteMemo(memoDetail.value.id);
    
    console.log('删除备忘录响应:', response);
    
    if (response && response.code === 200) {
      uni.hideLoading();
      uni.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      // 先发送刷新消息，确保事件先被触发
      uni.$emit('refreshMemoList');
      console.log('已发送刷新备忘录列表事件');
      
      // 删除成功后跳回备忘录列表页面
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/memo/index',
          success: () => {
            console.log('跳转到备忘录列表页面成功');
          },
          fail: (error) => {
            console.error('跳转到备忘录列表页面失败:', error);
          }
        });
      }, 1000);
    } else {
      uni.hideLoading();
      uni.showToast({
        title: response?.message || '删除失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('删除备忘录错误:', error);
    
    uni.hideLoading();
    uni.showToast({
      title: '删除失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 在页面卸载时清除定时器，避免内存泄漏
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
    timeInterval = null;
  }
});
</script>

<style lang="scss">
/* 备忘录详情容器 */
.memo-detail-container {
  min-height: 100vh;
  background-color: #f5f8ff;
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
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 30rpx;
  height: 90rpx;
  background: linear-gradient(to right, #f0f4ff, #f5f8ff);
  border-bottom: 1px solid rgba(106, 100, 241, 0.1);
  position: relative;
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(106, 100, 241, 0.1);
  border-radius: 50%;
  
  .icon {
    font-size: 38rpx;
    color: #3B37B3;
    font-weight: bold;
  }
}

.navbar-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.delete-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 50%;
  
  .icon {
    font-size: 38rpx;
    color: #E94646;
    font-weight: bold;
  }
}

.placeholder {
  width: 60rpx;
  height: 60rpx;
}

/* 备忘录内容 */
.memo-content {
  flex: 1;
  padding: 30rpx;
  padding-bottom: 120rpx; /* 为底部按钮留出空间 */
  overflow-y: auto;
}

.memo-detail-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  min-height: calc(85vh - 120rpx); /* 减去底部按钮的高度 */
  box-shadow: 0 6rpx 15rpx rgba(106, 100, 241, 0.08);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(106, 100, 241, 0.1);
}

.memo-title-input {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  padding: 10rpx 0;
  border: none;
  background-color: transparent;
  width: 100%;
}

.title-separator {
  width: 100%;
  height: 1px;
  background-color: rgba(106, 100, 241, 0.1);
  margin: 20rpx 0 30rpx 0;
}

.memo-text-input {
  font-size: 28rpx;
  color: #666;
  line-height: 1.7;
  flex: 1;
  width: 100%;
  min-height: 400rpx;
  border: none;
  background-color: transparent;
  padding: 0;
}

/* 底部按钮区域 */
.bottom-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 110rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 30rpx;
  background-color: #fff;
  box-shadow: 0 -4rpx 15rpx rgba(106, 100, 241, 0.05);
  z-index: 10;
  box-sizing: border-box;
}

.save-button {
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  width: 80%;
  max-width: 400rpx;
  background: linear-gradient(135deg, #6A64F1, #8A7EFC);
  color: #fff;
  box-shadow: 0 5rpx 10rpx rgba(106, 100, 241, 0.2);
  transition: all 0.2s;
  font-size: 28rpx;
  font-weight: 500;
  text-align: center;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  box-sizing: border-box;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
  
  &::after {
    border: none;
  }
  
  .button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
  
  .icon {
    font-size: 32rpx;
    margin-right: 10rpx;
    display: inline-flex;
    align-items: center;
    height: 100%;
  }
}
</style> 