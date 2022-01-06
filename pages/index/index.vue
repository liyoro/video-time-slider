<template>
	<div class="content">
		<div>
			<view class='scale-value'>无录像时间段：{{curVal}}</view>
			<view class='scale-value'>有录像时间段：{{curActiveVal}}</view>
			<view class='scale-view'>
				<video-time-slider :curDate="2021-11-29"
					:activeTime="[['01:12', '03:43'],['05:22', '07:33'],['12:02', '17:39']]" 
					@value="curValue"
					@active-value="activeValue" />
			</view>
		</div>
	</div>
</template>

<script>
	import videoTimeSlider from '@/uni_modules/video-time-slider/components/video-time-slider/video-time-slider.vue'
	
	export default {
		name: '',
		components: {
			videoTimeSlider
		},
		data() {
			return {
				curVal: '00:00',
				curActiveVal: '00:00'
			};
		},
		mounted() {},
		methods: {
			curValue(msg) {
				this.curVal = msg
			},
			activeValue(msg) {
				this.curActiveVal = msg
			}
		},
	};
</script>

<style lang="less" scoped>
	.content {
		display: flex;
		flex-direction: column;
		padding: 0 30rpx 30rpx 30rpx;
		box-sizing: border-box;
		background: #fff;
	}

	.scale-value {
		text-align: center;
		color: #6643e7;
	}

	.scale-view {
		width: 100%;
		height: 176rpx;
		flex: 1;
	}
</style>
