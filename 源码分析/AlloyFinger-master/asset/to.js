// 动画帧兼容
(function () {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];  // vendors供应商，销售商
    // 没有requestAnimationFrame走此逻辑
    // for循环当中做了判断 ,[妙啊]
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      // 如果没值，会直接赋值
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    // 如果还是没有这个值，用setTimeout模拟动画帧
    if (!window.requestAnimationFrame){
        window.requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame){
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());


var To=function (el, property, value, time, ease, onEnd,onChange ) {
    var t = 0;
    var current = el[property]; //拿到初始值
    var dv = value - current;  // 起始值和结束值 之间的差值【也就是总距离】
    var beginTime = new Date();
    var self = this;
    var currentEase=ease||function(a){return a }; //如果没有传值就触发函数
    this.tickID=null;
    var toTick = function () {
        var dt = new Date() - beginTime;
        // var d=Math.ceil(time/16.7) //次数
        // 时间间隔
        if (dt >= time) {
        // if (t >=d) {
            el[property] = value;
            // 触发onchang,触发onend
            onChange && onChange(value);
            onEnd && onEnd(value);
            // 清除定时器
            cancelAnimationFrame(self.tickID);
            self.toTick=null;
            return;
        }
        //一直循环除触发此函数
        // 时间间隔/总时间 =>越来越大
        el[property] = current+dv * currentEase(dt / time) ; //初始值+总距离*(时间间隔/总时间)
        // t++
        // console.log(d,t)
        // el[property] =  Tween['easeBoth'](t,current,dv,d);
        self.tickID=requestAnimationFrame(toTick);
        // 把当前的值传过去
        onChange && onChange(el[property]);
    };
    toTick();
    To.List.push(this);
};

To.List=[];
// 静态方法
To.stopAll=function(){
    for(var i= 0,len=To.List.length;i<len;i++){
        cancelAnimationFrame(To.List[i].tickID);
    }
    To.List.length=0;
};
// 传入dom元素
To.stop=function(to) {
    cancelAnimationFrame(to.tickID);
};


/*
tween:
t, 当前执行动画第几次
b, 起始值
c, 起始值和结束值之间的差值
d  动画执行总次数
返回值： 当前次 元素应在在的一个位置
*/
var Tween = {
	linear: function (t, b, c, d){
		return c*t/d + b;
	},
	easeIn: function(t, b, c, d){
		return c*(t/=d)*t + b;
	},
	easeOut: function(t, b, c, d){
		return -c *(t/=d)*(t-2) + b;
	},
	easeBoth: function(t, b, c, d){
		if ((t/=d/2) < 1) {
			return c/2*t*t + b;
		}
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInStrong: function(t, b, c, d){
		return c*(t/=d)*t*t*t + b;
	},
	easeOutStrong: function(t, b, c, d){
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeBothStrong: function(t, b, c, d){
		if ((t/=d/2) < 1) {
			return c/2*t*t*t*t + b;
		}
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	elasticIn: function(t, b, c, d, a, p){
		if (t === 0) {
			return b;
		}
		if ( (t /= d) == 1 ) {
			return b+c;
		}
		if (!p) {
			p=d*0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p/4;
		} else {
			var s = p/(2*Math.PI) * Math.asin (c/a);
		}
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	elasticOut: function(t, b, c, d, a, p){
		if (t === 0) {
			return b;
		}
		if ( (t /= d) == 1 ) {
			return b+c;
		}
		if (!p) {
			p=d*0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p/(2*Math.PI) * Math.asin (c/a);
		}
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	elasticBoth: function(t, b, c, d, a, p){
		if (t === 0) {
			return b;
		}
		if ( (t /= d/2) == 2 ) {
			return b+c;
		}
		if (!p) {
			p = d*(0.3*1.5);
		}
		if ( !a || a < Math.abs(c) ) {
			a = c;
			var s = p/4;
		}
		else {
			var s = p/(2*Math.PI) * Math.asin (c/a);
		}
		if (t < 1) {
			return - 0.5*(a*Math.pow(2,10*(t-=1)) *
					Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		}
		return a*Math.pow(2,-10*(t-=1)) *
				Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
	},
	backIn: function(t, b, c, d, s){
		if (typeof s == 'undefined') {
		   s = 1.70158;
		}
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	backOut: function(t, b, c, d, s){
		if (typeof s == 'undefined') {
			s = 2.70158;  //回缩的距离
		}
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	backBoth: function(t, b, c, d, s){
		if (typeof s == 'undefined') {
			s = 1.70158;
		}
		if ((t /= d/2 ) < 1) {
			return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		}
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	bounceIn: function(t, b, c, d){
		return c - Tween['bounceOut'](d-t, 0, c, d) + b;
	},
	bounceOut: function(t, b, c, d){
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
		}
		return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
	},
	bounceBoth: function(t, b, c, d){
		if (t < d/2) {
			return Tween['bounceIn'](t*2, 0, c, d) * 0.5 + b;
		}
		return Tween['bounceOut'](t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
	}
};