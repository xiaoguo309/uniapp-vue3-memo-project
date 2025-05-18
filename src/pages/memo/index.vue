<template>
  <view class="memo-container">
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
      <text class="navbar-title">我的备忘录</text>
      <view class="search-button" @click="searchMemo">
        <text class="icon icon-search"></text>
      </view>
    </view>

    <!-- 备忘录列表 -->
    <view class="memo-content">
      <!-- 加载中状态 - 仅在初次加载且列表为空时显示 -->
      <view v-if="loading && memoList.length === 0 && !networkError" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 网络错误状态 -->
      <view v-else-if="networkError" class="error-container" @click="retryLoadData">
        <view class="error-icon">
          <text class="icon icon-warning"></text>
        </view>
        <text class="error-text">连接服务器超时，点击屏幕重试</text>
      </view>
      
      <!-- 空状态 -->
      <view v-else-if="isEmpty && !loading" class="empty-container">
        <view class="empty-icon">
          <text class="icon icon-clipboard"></text>
        </view>
        <text class="empty-text">暂无备忘录</text>
        <text class="empty-subtext">点击右下角按钮创建新的备忘录</text>
      </view>
      
      <!-- 备忘录列表 -->
      <view v-else class="memo-grid">
        <view class="memo-card" v-for="item in memoList" :key="item.id" @click="viewMemo(item)">
          <view class="memo-title">{{ item.title }}</view>
          <view class="memo-text">{{ item.content }}</view>
          <view class="memo-time">{{ formatDate(item.updatedAt) }}</view>
        </view>
      </view>
      
      <!-- 加载更多按钮 - 只在有更多数据且不在加载中时显示 -->
      <view v-if="hasMore && memoList.length > 0 && !loading" class="load-more" @click="loadMore">
        <text>加载更多</text>
      </view>
      
      <!-- 加载中提示 - 只在加载更多数据时显示 -->
      <view v-if="loading && memoList.length > 0" class="load-more">
        <view class="loading-dot-container">
          <view class="loading-dot"></view>
          <view class="loading-dot"></view>
          <view class="loading-dot"></view>
        </view>
      </view>
    </view>

    <!-- 添加备忘录按钮 -->
    <view class="add-button" @click="addMemo">
      <view class="plus-icon">
        <view class="horizontal-line"></view>
        <view class="vertical-line"></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useMemoStore } from '@/stores/memo';
import { onShow } from '@dcloudio/uni-app';
import '@/static/css/icons.css';

// 获取备忘录存储
const memoStore = useMemoStore();
// 备忘录数据
const memoList = ref([]);
// 加载状态
const loading = ref(false);
// 是否有更多数据
const hasMore = ref(true);
// 当前页码
const page = ref(1);
// 每页数量
const limit = ref(20);
// 是否显示空状态
const isEmpty = ref(false);
// 网络错误状态
const networkError = ref(false);
// 记录上次刷新时间，避免频繁刷新
const lastRefreshTime = ref(0);
// 控制下拉刷新指示器的显示
const isRefreshing = ref(false);
// 是否已经完成首次加载
const loadedOnce = ref(false);
// 当前时间
const currentTime = ref(formatCurrentTime());
// 定时器
let timeInterval;

// 格式化日期方法
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '无效日期';
    }
    
    // 格式化为更友好的格式：yyyy-MM-dd HH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '日期错误';
  }
};

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

// 加载备忘录列表
const loadMemoList = async (refresh = false) => {
  try {
    loading.value = true;
    // 重置网络错误状态
    networkError.value = false;
    
    if (refresh) {
      // 如果是刷新，重置页码和列表
      page.value = 1;
      memoList.value = [];
    }
    
    console.log('===== 开始加载备忘录列表 =====');
    console.log('请求参数:', { page: page.value, limit: limit.value });
    
    // 调用存储中的方法获取备忘录列表
    await memoStore.fetchMemoList({
      page: page.value,
      limit: limit.value
    }, refresh);
    
    console.log('获取备忘录列表成功:', memoStore.memoList);
    
    // 更新本地数据
    memoList.value = memoStore.memoList;
    
    // 更新分页状态
    hasMore.value = memoStore.hasMore && memoStore.memoList.length > 0;
    isEmpty.value = memoList.value.length === 0;
    
    // 完成下拉刷新
    uni.stopPullDownRefresh();
  } catch (error) {
    console.error('===== 加载备忘录列表失败 =====', error);
    networkError.value = true;
    // 完成下拉刷新
    uni.stopPullDownRefresh();
  } finally {
    loading.value = false;
  }
};

// 加载更多数据
const loadMore = async () => {
  // 防止重复点击加载
  if (loading.value || !hasMore.value) return;
  
  try {
    loading.value = true;
    console.log('加载更多数据，页码:', page.value + 1);
    page.value++;
    
    // 调用存储中的方法获取更多备忘录
    await memoStore.loadMore({
      page: page.value,
      limit: limit.value
    });
    
    // 更新本地数据
    memoList.value = memoStore.memoList;
    hasMore.value = memoStore.hasMore && memoList.value.length < memoStore.pagination.total;
    
    console.log('加载更多成功，当前数据条数:', memoList.value.length);
    console.log('是否还有更多:', hasMore.value);
  } catch (error) {
    console.error('加载更多数据失败:', error);
    // 加载失败时恢复页码
    page.value--;
    uni.showToast({
      title: '加载更多失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 查看备忘录详情
const viewMemo = (memo) => {
  // 导航到详情页
  console.log('查看备忘录：', memo.id);
  uni.navigateTo({
    url: `/pages/memo/detail?id=${memo.id}`
  });
};

// 添加新备忘录
const addMemo = () => {
  // 导航到详情页并传递isNew参数表示新建备忘录
  uni.navigateTo({
    url: '/pages/memo/detail?isNew=1'
  });
};

// 搜索备忘录
const searchMemo = () => {
  uni.navigateTo({
    url: '/pages/memo/search'
  });
};

// 页面加载时获取数据
onMounted(() => {
  // 初始更新时间
  updateTime();
  // 每分钟更新一次时间
  timeInterval = setInterval(updateTime, 60000);
  
  // 监听刷新事件，从创建/编辑页返回时刷新列表
  uni.$on('refreshMemoList', () => {
    console.log('收到刷新备忘录列表事件');
    loadMemoList(true);
  });

  // 检查网络连接
  uni.getNetworkType({
    success: (res) => {
      if (res.networkType === 'none') {
        networkError.value = true;
        uni.showToast({
          title: '网络连接不可用',
          icon: 'none'
        });
      } else {
        console.log('当前网络类型:', res.networkType);
        loadMemoList(true);
      }
    },
    fail: () => {
      console.error('无法获取网络状态');
      loadMemoList(true);
    }
  });
});

// 在页面卸载时取消监听器和定时器，避免内存泄漏
onUnmounted(() => {
  uni.$off('refreshMemoList');
  clearInterval(timeInterval);
});

// 新增直接测试API的方法
const testApiDirectly = () => {
  console.log('===== 直接测试API请求 =====');
  
  // 获取token
  const token = uni.getStorageSync('token') || '';
  
  // 直接发送请求
  uni.request({
    url: 'http://localhost:8080/api/memo/list',
    method: 'GET',
    header: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    data: {
      page: 1,
      limit: 20
    },
    success: (res) => {
      console.log('直接请求API成功:', res);
      uni.showToast({
        title: '请求成功',
        icon: 'success'
      });
    },
    fail: (err) => {
      console.error('直接请求API失败:', err);
      networkError.value = true;
    }
  });
};

// 重试加载数据
const retryLoadData = async () => {
  // 检查网络连接
  uni.getNetworkType({
    success: (res) => {
      if (res.networkType === 'none') {
        uni.showToast({
          title: '网络连接不可用，请检查网络设置',
          icon: 'none'
        });
      } else {
        console.log('重试加载 - 当前网络类型:', res.networkType);
        // 刷新列表数据
        loadMemoList(true);
      }
    },
    fail: () => {
      console.error('无法获取网络状态');
      // 即使无法获取网络状态，也尝试刷新
      loadMemoList(true);
    }
  });
};

// uni-app 页面生命周期
// 页面下拉刷新触发
uni.$on('pullDownRefresh', () => {
  loadMemoList(true);
});

// 定义页面下拉刷新处理方法
function onPullDownRefresh() {
  console.log('页面触发下拉刷新');
  loadMemoList(true);
}

// 页面每次显示时触发
onShow(() => {
  // 不自动刷新页面
});
</script>

<style lang="scss">
/* 备忘录容器 */
.memo-container {
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
}

.navbar-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  width: 100%;
  text-align: center;
}

.search-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 30rpx;
  
  .icon {
    font-size: 40rpx;
    color: #6A64F1;
  }
}

/* 备忘录内容区 */
.memo-content {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
}

.memo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.memo-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 25rpx;
  min-height: 200rpx;
  box-shadow: 0 6rpx 15rpx rgba(106, 100, 241, 0.08);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(106, 100, 241, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 10rpx rgba(106, 100, 241, 0.05);
  }
}

.memo-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 15rpx;
}

.memo-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  flex: 1;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.memo-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

/* 添加按钮 */
.add-button {
  position: fixed;
  right: 40rpx;
  bottom: 140rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #6A64F1, #8A7EFC);
  box-shadow: 0 10rpx 20rpx rgba(106, 100, 241, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  
  .plus-icon {
    position: relative;
    width: 40rpx;
    height: 40rpx;
  }
  
  .horizontal-line, .vertical-line {
    position: absolute;
    background-color: #fff;
    border-radius: 4rpx;
  }
  
  .horizontal-line {
    width: 40rpx;
    height: 6rpx;
    top: 17rpx;
    left: 0;
  }
  
  .vertical-line {
    width: 6rpx;
    height: 40rpx;
    left: 17rpx;
    top: 0;
  }
}

/* 加载中状态 */
.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid rgba(106, 100, 241, 0.2);
  border-top: 4rpx solid #6A64F1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 26rpx;
  color: #666;
}

/* 网络错误状态 */
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.error-icon {
  font-size: 80rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.error-text {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
}

/* 空状态 */
.empty-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 80rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.empty-subtext {
  font-size: 24rpx;
  color: #999;
}

/* 加载更多 */
.load-more {
  width: 100%;
  height: 80rpx;
  background-color: #fff;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 15rpx rgba(106, 100, 241, 0.08);
  border: 1px solid rgba(106, 100, 241, 0.1);
  transition: background-color 0.2s;
  
  &:active {
    background-color: rgba(106, 100, 241, 0.05);
  }
}

.loading-dot-container {
  display: flex;
  align-items: center;
}

.loading-dot {
  width: 10rpx;
  height: 10rpx;
  background-color: #6A64F1;
  border-radius: 50%;
  margin: 0 2rpx;
  animation: dot-blink 1s infinite;
}

@keyframes dot-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style> 