// 备忘录相关API
import request from './index';

// 备忘录API路径
const MEMO_URL = '/memo';

/**
 * 获取备忘录列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.limit - 每页数量，默认20
 * @param {string} params.keyword - 搜索关键词(可选)
 * @param {string} params.sortBy - 排序字段(可选，默认创建时间)
 * @param {string} params.sortOrder - 排序方式(可选，"asc"或"desc"，默认"desc")
 * @returns {Promise} - 返回备忘录列表
 */
export const getMemoList = (params) => {
  return request.get(`${MEMO_URL}/list`, params);
};

/**
 * 获取备忘录详情
 * @param {number|string} id - 备忘录ID
 * @returns {Promise} - 返回备忘录详情
 */
export const getMemoDetail = (id) => {
  return request.get(`${MEMO_URL}/detail/${id}`);
};

/**
 * 创建备忘录
 * @param {Object} data - 备忘录数据
 * @param {string} data.title - 备忘录标题
 * @param {string} data.content - 备忘录内容
 * @returns {Promise} - 返回创建结果
 */
export const createMemo = (data) => {
  return request.post(`${MEMO_URL}/create`, data);
};

/**
 * 更新备忘录
 * @param {number|string} id - 备忘录ID
 * @param {Object} data - 备忘录数据
 * @param {string} data.title - 备忘录标题
 * @param {string} data.content - 备忘录内容
 * @returns {Promise} - 返回更新结果
 */
export const updateMemo = (id, data) => {
  return request.put(`${MEMO_URL}/update/${id}`, data);
};

/**
 * 删除备忘录
 * @param {number|string} id - 备忘录ID
 * @returns {Promise} - 返回删除结果
 */
export const deleteMemo = (id) => {
  return request.delete(`${MEMO_URL}/delete/${id}`);
};

/**
 * 搜索备忘录
 * @param {Object} params - 搜索参数
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.page - 页码，默认1
 * @param {number} params.limit - 每页数量，默认20
 * @returns {Promise} - 返回搜索结果
 */
export const searchMemo = (params) => {
  return request.get(`${MEMO_URL}/search`, params);
}; 