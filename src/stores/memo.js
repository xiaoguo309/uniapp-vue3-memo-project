// 备忘录状态管理
import { defineStore } from 'pinia';
import * as memoApi from '@/api/memo';

// 备忘录状态Store
export const useMemoStore = defineStore('memo', {
  // 状态
  state: () => ({
    memoList: [],
    currentMemo: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
    loading: false,
    error: null,
  }),
  
  // 计算属性
  getters: {
    // 是否有更多数据
    hasMore: (state) => {
      // 如果总数大于已加载数据，则有更多数据
      return state.memoList.length > 0 && 
             state.pagination.page * state.pagination.limit < state.pagination.total;
    },
    
    // 是否为空列表
    isEmpty: (state) => {
      return state.memoList.length === 0;
    },
  },
  
  // 方法
  actions: {
    /**
     * 获取备忘录列表
     * @param {Object} params - 查询参数
     * @param {boolean} refresh - 是否刷新列表
     */
    async fetchMemoList(params = {}, refresh = false) {
      try {
        this.loading = true;
        this.error = null;
        
        // 如果刷新，重置页码
        if (refresh) {
          this.pagination.page = 1;
          this.memoList = [];
        }
        
        // 构建查询参数
        const queryParams = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...params,
        };
        
        console.log('===== 发送备忘录列表请求 =====');
        console.log('API路径: /memo/list');
        console.log('请求参数:', queryParams);
        
        // 发送请求
        const response = await memoApi.getMemoList(queryParams);
        
        console.log('===== 备忘录列表响应 =====', response);
        
        if (response && response.code === 200 && response.data) {
          // 更新状态
          const { total, page, limit, list } = response.data;
          
          console.log('备忘录总数:', total);
          console.log('当前页码:', page);
          console.log('每页条数:', limit);
          console.log('备忘录列表:', list);
          
          if (!Array.isArray(list)) {
            console.error('备忘录列表不是数组:', list);
            throw new Error('备忘录数据格式错误');
          }
          
          // 更新分页信息
          this.pagination.total = total || 0;
          this.pagination.page = page || 1;
          this.pagination.limit = limit || 20;
          
          // 更新列表
          if (refresh) {
            this.memoList = list;
          } else {
            this.memoList = [...this.memoList, ...list];
          }
        } else {
          console.error('响应格式不正确:', response);
          this.error = (response && response.message) || '获取备忘录列表失败';
          throw new Error(this.error);
        }
      } catch (error) {
        console.error('获取备忘录列表失败:', error);
        this.error = error.message || '获取备忘录列表失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 加载更多备忘录
     * @param {Object} params - 查询参数
     */
    async loadMore(params = {}) {
      if (this.loading || !this.hasMore) return;
      
      try {
        this.loading = true;
        this.error = null;
        
        // 构建查询参数
        const queryParams = {
          page: params.page || this.pagination.page + 1,
          limit: params.limit || this.pagination.limit,
          ...params,
        };
        
        console.log('加载更多备忘录:', queryParams);
        
        // 发送请求
        const response = await memoApi.getMemoList(queryParams);
        
        if (response && response.code === 200 && response.data) {
          // 更新状态
          const { total, page, limit, list } = response.data;
          
          console.log('加载更多响应:', {
            总数: total,
            页码: page,
            每页条数: limit,
            本次数据条数: list.length
          });
          
          if (!Array.isArray(list)) {
            console.error('备忘录列表不是数组:', list);
            throw new Error('备忘录数据格式错误');
          }
          
          // 更新分页信息
          this.pagination.total = total || 0;
          this.pagination.page = page || this.pagination.page + 1;
          this.pagination.limit = limit || this.pagination.limit;
          
          // 更新列表 - 追加新数据
          this.memoList = [...this.memoList, ...list];
          
          // 检查是否还有更多数据
          if (list.length === 0 || this.memoList.length >= total) {
            console.log('没有更多数据了');
          }
        } else {
          console.error('加载更多响应格式不正确:', response);
          this.error = (response && response.message) || '加载更多失败';
          throw new Error(this.error);
        }
      } catch (error) {
        console.error('加载更多失败:', error);
        this.error = error.message || '加载更多失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 获取备忘录详情
     * @param {number|string} id - 备忘录ID
     */
    async fetchMemoDetail(id) {
      try {
        this.loading = true;
        this.error = null;
        
        // 发送请求
        const response = await memoApi.getMemoDetail(id);
        
        if (response.code === 200) {
          // 更新当前备忘录
          this.currentMemo = response.data;
        } else {
          this.error = response.message || '获取备忘录详情失败';
          uni.showToast({
            title: this.error,
            icon: 'none'
          });
        }
        
        return response.data;
      } catch (error) {
        this.error = error.message || '获取备忘录详情失败';
        uni.showToast({
          title: this.error,
          icon: 'none'
        });
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 创建备忘录
     * @param {Object} data - 备忘录数据
     */
    async createMemo(data) {
      try {
        this.loading = true;
        this.error = null;
        
        // 发送请求
        const response = await memoApi.createMemo(data);
        
        if (response.code === 200) {
          // 添加到列表头部
          this.memoList = [response.data, ...this.memoList];
          
          uni.showToast({
            title: '创建成功',
            icon: 'success'
          });
        } else {
          this.error = response.message || '创建备忘录失败';
          uni.showToast({
            title: this.error,
            icon: 'none'
          });
        }
        
        return response;
      } catch (error) {
        this.error = error.message || '创建备忘录失败';
        uni.showToast({
          title: this.error,
          icon: 'none'
        });
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 更新备忘录
     * @param {number|string} id - 备忘录ID
     * @param {Object} data - 备忘录数据
     */
    async updateMemo(id, data) {
      try {
        this.loading = true;
        this.error = null;
        
        // 发送请求
        const response = await memoApi.updateMemo(id, data);
        
        if (response.code === 200) {
          // 更新列表中的备忘录
          const index = this.memoList.findIndex(memo => memo.id === id);
          if (index !== -1) {
            this.memoList[index] = response.data;
          }
          
          // 更新当前备忘录
          if (this.currentMemo && this.currentMemo.id === id) {
            this.currentMemo = response.data;
          }
          
          uni.showToast({
            title: '更新成功',
            icon: 'success'
          });
        } else {
          this.error = response.message || '更新备忘录失败';
          uni.showToast({
            title: this.error,
            icon: 'none'
          });
        }
        
        return response;
      } catch (error) {
        this.error = error.message || '更新备忘录失败';
        uni.showToast({
          title: this.error,
          icon: 'none'
        });
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 删除备忘录
     * @param {number|string} id - 备忘录ID
     */
    async deleteMemo(id) {
      try {
        this.loading = true;
        this.error = null;
        
        // 发送请求
        const response = await memoApi.deleteMemo(id);
        
        if (response.code === 200) {
          // 从列表中删除
          this.memoList = this.memoList.filter(memo => memo.id !== id);
          
          // 如果当前备忘录被删除，清空当前备忘录
          if (this.currentMemo && this.currentMemo.id === id) {
            this.currentMemo = null;
          }
          
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });
        } else {
          this.error = response.message || '删除备忘录失败';
          uni.showToast({
            title: this.error,
            icon: 'none'
          });
        }
        
        return response;
      } catch (error) {
        this.error = error.message || '删除备忘录失败';
        uni.showToast({
          title: this.error,
          icon: 'none'
        });
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 搜索备忘录
     * @param {Object} params - 搜索参数
     */
    async searchMemos(params) {
      try {
        this.loading = true;
        this.error = null;
        
        // 构建搜索参数
        const searchParams = {
          page: 1,
          limit: this.pagination.limit,
          ...params,
        };
        
        // 发送请求
        const response = await memoApi.searchMemo(searchParams);
        
        if (response.code === 200) {
          // 更新状态
          const { total, page, limit, list } = response.data;
          
          // 更新分页信息
          this.pagination.total = total;
          this.pagination.page = page;
          this.pagination.limit = limit;
          
          // 更新列表
          this.memoList = list;
        } else {
          this.error = response.message || '搜索备忘录失败';
          uni.showToast({
            title: this.error,
            icon: 'none'
          });
        }
        
        return response;
      } catch (error) {
        this.error = error.message || '搜索备忘录失败';
        uni.showToast({
          title: this.error,
          icon: 'none'
        });
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
}); 