/**
 * @Author: liyoro
 * 
 * 封装组件需要用到的方法
 * 
 */

function padLeftZero(str) {
	return ('00' + str).substr(str.length)
}

// 返回24小时内时间数组，30分钟分隔
export function getDateArray(startDate, endDate, space) {
	if (!endDate) {
		endDate = new Date()
	}
	if (!startDate) {
		startDate = new Date(new Date().getTime() - 1 * 60 * 60 * 1000)
	}
	// let newend = this.formatDate(startDate, 'yyyy-MM-dd hh:mm')
	// let newstart = this.formatDate(endDate, 'yyyy-MM-dd hh:mm')
	// let newstart = this.formatDate(startDate, 'hh:mm')

	// dateArray.push(newstart)

	if (!space) {
		space = 30 * 60 * 1000
	} else {
		space = space * 60 * 1000
	}
	let endTime = endDate.getTime()
	let startTime = startDate.getTime()
	let mod = endTime - startTime
	if (mod <= space) {
		return
	}
	let dateArray = []
	while (mod >= space) {
		let d = new Date()
		d.setTime(startTime + space)
		// let newd = this.formatDate(d, 'yyyy-MM-dd hh:mm')
		let newd = formatDate(d, 'hh:mm')
		dateArray.push(newd)
		mod = mod - space
		startTime = startTime + space
	}
	let newend = formatDate(endDate, 'hh:mm')
	dateArray.push(newend)

	return dateArray.sort(function(a, b) {
		return Date.parse(a) - Date.parse(b)
	})
}

// 时间戳转时间
export function formatDate(date, fmt) {
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
	}
	let o = {
		'M+': date.getMonth() + 1,
		'd+': date.getDate(),
		'h+': date.getHours(),
		'm+': date.getMinutes(),
		's+': date.getSeconds()
	}
	for (let k in o) {
		if (new RegExp(`(${k})`).test(fmt)) {
			let str = o[k] + ''
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
		}
	}
	return fmt
}

// 秒格式化为 {时:分:秒} 格式
export function secondToDate(result) {
	// let h = Math.floor(result / 3600)
	// let m = Math.floor((result / 60 % 60))
	// let s = Math.floor((result % 60))

	let h = Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600)
	let m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result /
		60 % 60))
	let s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60))

	result = h + ":" + m + ":" + s
	// console.log('secondToDate:', result)

	return result
}

// 时间转刻度位置
export function dateToGrid(result, max) {
	let h, m, s, t

	let arr = result.split(':')
	if (arr.length == 3) {
		h = arr[0]
		m = arr[1]
		s = arr[2]
		t = h * 3600 + m * 60 + Number(s)
	} else if (arr.length == 2) {
		h = arr[0]
		m = arr[1]
		t = h * 3600 + m * 60
	}
	let ct = t / 86400 * max
	// console.log('dateToGrid:', t,ct)
	return ct
}

// 时间{curDateStr}是否在时间{beginDateStr~endDateStr}之内
export function isDuringDate(curDateStr, beginDateStr, endDateStr) {
	let curDate = new Date(curDateStr),
		beginDate = new Date(beginDateStr),
		endDate = new Date(endDateStr)
	if (curDate >= beginDate && curDate <= endDate) {
		return true
	}
	return false
}

// 判断{value}是否是{activeTime}内的时间
export function isInDate(curDate, activeTime, value) {
	let bool = activeTime.some((item) => {
		let it1 = curDate + ' ' + item[0]
		let it2 = curDate + ' ' + item[1]

		let cur = curDate + ' ' + value

		let res = isDuringDate(cur, it1, it2)

		if (res == true) {
			return true
		}
	})
	// console.log('isInDate:', value, bool)
	return bool
}

//比较两个时间大小, 是否 t1 > t2。如 11:30 和 10:00, 返回true
export function compareTime(t1, t2) {
	let d = new Date()
	let ft1 = d.setHours(t1.split(":")[0], t1.split(":")[1])
	let ft2 = d.setHours(t2.split(":")[0], t2.split(":")[1])
	return ft1 > ft2
}
