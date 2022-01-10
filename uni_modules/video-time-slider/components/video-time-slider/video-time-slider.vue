<!-- 
 @Author: liyoro
 @Version 1.0.0
 用于视频回播的时间选择插件，24小时
 -->

<template>
	<div>
		<view class='wrapper horizontal-box' id='scale-wrapper' :style="{background: stylesObj.bgoutside}">
			<!-- 选中的竖条  -->
			<view class='zz' :style="{backgroundColor: stylesObj.lineSelect}" />
			<scroll-view class='scroll-view' :scroll-x="true" :scroll-left="centerNum" :scroll-with-animation="true"
				@scroll="bindscroll" :show-scrollbar="false" :enhanced="true">
				<view class='scroll-wrapper'>
					<!-- 左补白  -->
					<view class='seat seat-left' :style="{width: windowWidth/2 + 'px'}" />
					<!-- 标尺容器 -->
					<view class='scale-container'>
						<!-- 标尺数显示，长度：每格长度*个数 -->
						<view class='scale-vaule-wrapper' :style="{width: single*grid + 'px', color: stylesObj.fontColor, fontSize: stylesObj.fontSize + 'px'}">
							<view class='scale-value first-scale-value' :style="{width: single + 'px'}">00:00</view>
							<view style="display: flex;">
								<view class='scale-vaule' v-for="(it, index) in grid" :key="index" :style="{width: single + 'px'}">
									{{index%2==0?'':dateArr[index]}}
								</view>
							</view>
						</view>
						<!-- 刻度点 -->
						<view class='scale-wrapper'>
							<view class='scale-grip-item' v-for="(it, idx) in max" :key="idx"
								:style="{width: single + 'px', height: idx%2==0?'6px':'10px', borderColor: stylesObj.line}" />
						</view>
						<!-- 时间分段 -->
						<view class="scale-active">
							<view class='scale-active-time' v-for="(it, idt) in newActiveTime" :key="idt" :style="{marginLeft: idt>0?newActiveTime[idt][0]-newActiveTime[idt-1][2] + 'px':newActiveTime[idt][0] + 'px'}">
								<view class="scale-active-item" :style="{width: it[1] + 'px'}" />
							</view>
						</view>
					</view>
					<!-- 右补白 -->
					<view class='seat seat-right' :style="{width: windowWidth/2 + 'px'}" />
				</view>
			</scroll-view>
		</view>
	</div>
</template>

<script>
	import {getDateArray, dateToGrid, secondToDate, compareTime, isInDate } from './utils.js'
	
	export default {
		name: 'video-time-slider',
		components: {},
		props: {
			curDate: {
				type: String,
				default: "2021-11-24"
			},
			activeTime: {
				type: Array,
				default: () => []
			},
			// 自定义样式
			styles: {
				type: Object,
				default: () => {}
			}
		},
		data() {
			return {
				// 最小值
				min: 0,
				// 最大值
				max: 48,
				// 每个格子的实际行度 （单位px ，相对默认值），值太小会挤一起
				single: 25,
				defaultStyles: {
					line: '#dbdbdb', // 刻度颜色
					bginner: '#fbfbfb', // 前景色颜色
					bgoutside: '#ffffff', // 背景色颜色
					lineSelect: '#ea3639', // 选中线颜色
					fontColor: '#404040', // 刻度数字颜色
					fontSize: 12, // 字体大小
				},
				windowHeight: 0,
				windowWidth: '',
				horizontalTime: null,
				grid: '',
				centerNum: '',
				stylesObj: {},
				// 刻度上时间数组，30分钟分隔
				dateArr: [],
				// 可播放时间
				newActiveTime: [],
				// 可播放时间点--开始点值
				activeMinTime: '',
				// 可播放时间点--终点值
				activeMaxTime: '',
				timer: null
			};
		},
		computed: {},
		watch: {
			activeTime() {
				this.goTo('00:00:00')
			}
		},
		onReady() {
			const min = parseInt(this.min, 10) || 0
			const max = parseInt(this.max, 10) || 100
			this.min = min
			this.max = max
			this.init()
		},
		created() {},
		mounted() {},
		methods: {
			// 初始化
			init() {
				let ts = new Date(this.curDate + " 00:00:00")
				let te = new Date(this.curDate + " 23:59:59")
				// 86400
				this.dateArr = getDateArray(ts, te, 30)
				
				let newActiveTime = []
				
				this.activeTime.forEach((item)=> {
					let it1 = item[0]
					let it2 = item[1]
					let t1 = dateToGrid(it1, this.max)
					let t2 = dateToGrid(it2, this.max)
					
					// 初始位置距左边距离
					let poi = t1 * this.single
					
					// 时间在刻度上长度
					let len = (t2-t1).toFixed(2) * this.single
					
					// 可播放区域最右距离刻度0点的距离，用于>0位置在刻度上的位置定位
					let left = poi + len
					
					newActiveTime.push([poi, len, left])
				})
				this.newActiveTime = newActiveTime
				
				this.activeMinTime = this.activeTime[0][0]
				this.activeMaxTime = this.activeTime[this.activeTime.length-1][1]
				
				// this.goTo(this.activeMinTime)
				
				// 设置默认值
				const min = this.min || 0
				const max = this.max || 0
				/**
				 * grid 外层的刻度尺，里面有10个小刻度尺(10个小刻度尺直接拿10遍历出来)
				 * 整数：
				 *  需要除以10，此时里面的一个小刻度尺代表1
				 *  例如：30-80 此时需要5个外层刻度尺。
				 * 小数：
				 *  不需要除以10，此时里面的一个小刻度尺代表0.1
				 *  例如：30-80 此时需要50个外层刻度尺。
				 *
				 */
				let grid = (max - min)
				
				this.stylesObj = Object.assign(this.defaultStyles, this.styles)
				this.grid = grid
				
				//  获取节点信息，获取节点宽度
				const query = this.createSelectorQuery().in(this)
				query.select('#scale-wrapper').boundingClientRect(() => {
					// res.top; // 这个组件内 #the-id 节点的上边界坐标
				}).exec((e) => {
					// console.log(111, e)
					this.windowWidth = e[0].width
					this.windowHeight = e[0].height
				})
			},
			// 滚动
			bindscroll(e) {
				// 移动的距离
				let offset = e.detail.scrollLeft
				
				// 选中的值
				let value
				
				value = this.min + (offset / this.single)
				value = value.toFixed(2)
				if (value > this.max) value = this.max
				
				let ct = value * (86400 / this.max)
				value = secondToDate(ct)
				
				// 刻度值在可播放时间最大值的范围外，跳转最大值刻度
				if (compareTime(value, this.activeMaxTime)) {
					this.goTo(this.activeMaxTime)
				}
				
				// 滚动结束才返回时间点
				if (this.timer) {
					clearTimeout(this.timer)
				}
				
				this.timer = setTimeout(() => {
					// console.log("stop:", value)
					// 返回刻度所在可播放时间点
					if (isInDate(this.curDate, this.activeTime, value)) {
						this.$emit('active-value', value)
					}
					// 返回普通时间点
					else {
						this.$emit('value', value)
					}
				}, 500)
				
				// 返回刻度所在时间点
				// this.$emit('value', value)
			},
			// 刻度跳转
			// {value}时间
			goTo(value) {
				let ct = dateToGrid(value, this.max)
				
				const diff = ct
				const centerNum = diff * this.single
				
				// 限制刻度
				this.centerNum = centerNum+60
				setTimeout(() => {
					this.centerNum = centerNum
				}, 500)
				// console.log('goTo:', centerNum)
			},
			
		}
	};
</script>

<style lang="scss" scoped>
	view,text {
		box-sizing: border-box;
	}

	.wrapper {
		position: relative;
		height: 176rpx;
		// height: 18rpx;
	}

	.horizontal-box {
		.scroll-view {
			height: 100%;
		}

		// padding-top: 7%;
		.scroll-wrapper {
			position: relative;
			display: flex;
			height: 100%;
		}

		.scale-container {
			
		}

		.zz {
			position: absolute;
			left: 50%;
			top: 30%;
			transform: translate(-50%);
			height: 45%;
			width: 2px;
			background-color: #ea3639;
			z-index: 10;
		}

		.scale-wrapper {
			display: flex;
			border-top: 1px solid #dddddd;
			z-index: 6;
		}

		.scale-grip {
			position: relative;
			height: 100rpx;
			display: flex;

			&::before {
				content: "";
				position: absolute;
				top: 0;
				border-width: 1px;
				border-color: inherit;
				border-style: solid;
				height: 100%;
				transform: translateX(-50%);
				left: 0rpx;
			}

			&:last-child {
				&::after {
					content: "";
					position: absolute;
					top: 0;
					right: 0;
					border-width: 1px;
					border-color: inherit;
					border-style: solid;
					height: 100%;
				}
			}
		}

		.scale-grip-item {
			height: 60%;
			padding-top: 10rpx;

			&:not(:last-child) {
				border-right: 6rpx solid #000000;
			}
		}

		.scale-vaule-wrapper {
			position: relative;
			display: flex;
			text-align: center;
			z-index: 6;
		}

		.scale-vaule {
			padding: 10rpx 0;
			transform: translateX(50%);
		}

		.first-scale-value {
			position: absolute;
			left: 0;
			top: 10rpx;
			transform: translateX(-50%);
		}

		.seat {
			flex-shrink: 0;
			box-sizing: border-box;
			// width: 44px;
			// border-top: 1px solid #ddd;
		}

		.seat-left {
			// border-left: 6rpx solid #000000;
		}

		.seat-right {
			// border-right: 6rpx solid #000000;
		}
		.scale-active {
			display: flex;
			height: 44rpx;
			z-index: 5;
			.scale-active-time {
				display: flex;
				.scale-active-item {
					height: 100%;
					background-color: #01b7d4;
				}
			}
		}
	}
</style>
