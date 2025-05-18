<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
  // 全局处理下拉刷新
  onPullDownRefresh: function() {
    console.log('App - 全局下拉刷新');
    uni.$emit('pullDownRefresh');
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 1000);
  },
  // 处理网络错误
  onError: function(err) {
    console.error('App Error:', err);
  }
}
</script>

<style>
/*每个页面公共css */
</style>
