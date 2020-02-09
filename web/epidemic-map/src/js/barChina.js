import {Utils} from "../js/utils";

// 因图例1数值相对较大，同一比例尺下其它图例容易被湮没，故图形分左右两部分分别呈现
// 网格分三部分，1 - Y轴文字， 2 - 图形1， 3 - 图形2
let option = {
    tooltip : {
        trigger: 'axis',
        axisPointer : { type : 'shadow' }
    },
    legend: {
        show: true,
        right: 10,
        top: 50,
        data: ["确诊", "疑似", "死亡", "治愈"]
    },
    grid: [
        {
            left: 90,
            top: '88',
            bottom: '3%',
            // containLabel: true
        },
        {
            left: 93,
            width: '55%',
            top: '88',
            bottom: '3%',
            containLabel: false
        },
        {
            right: '20',
            width: '25%',
            top: '68',
            bottom: '3%',
            containLabel: true
        },
    ],
    xAxis:  [
        {
            left: '10px',
            show: false, 
        },
        {
            type: 'value',
            show: false,
            position: 'top',
            gridIndex: 1
        },
        {
            type: 'value',
            show: false,
            position: 'top',
            gridIndex: 2
        },
    ],
    yAxis: [
        {
            type: 'category',
            inverse: true,
            data: ['福建','广州','厦门','南宁','北京','长沙','重庆'],
            axisLine: {show: false},
            axisTick: {show: false},
            axisLabel: {
                interval: 0,
                margin: 85,
                textStyle: {
                    color: '#455A74',
                    align: 'left',
                    fontSize: 14
                },
                rich: {
                    a: {
                        color: '#fff',
                        backgroundColor: '#FAAA39',
                        width: 20,
                        height: 20,
                        align: 'center',
                        borderRadius: 2
                    },
                    b: {
                        color: '#fff',
                        backgroundColor: '#4197FD',
                        width: 20,
                        height: 20,
                        align: 'center',
                        borderRadius: 2
                    }
                },
                formatter: function (params, i) {
                    return '{' + (i < 3 ? 'a' : 'b') + '|' + (i + 1) + '}' + '  ' + params.substr(0, 4);
                }
            }
        }, 
        {
            gridIndex: 1,
            type: 'category',
            inverse: true,
            show: false,
            data: ['福建','广州','厦门','南宁','北京','长沙','重庆'],
            axisLine: {show: false},
            axisTick: {show: false},
        }, 
        {
            gridIndex: 2,
            type: 'category',
            inverse: true,
            show: false,
            data: ['福建','广州','厦门','南宁','北京','长沙','重庆'],
            axisLine: {show: false},
            axisTick: {show: false},
        }
    ],
    series: [
        {
            name: '确诊',
            type: 'bar',
            barWidth: 20,
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: [320, 302, 301, 334, 390, 330, 320]
        },
        {
            name: '疑似',
            type: 'bar',
            stack: true,
            barWidth: 20,
            xAxisIndex: 2,
            yAxisIndex: 2,
            data: [200, 302, 301, 334, 390, 330, 320]
        }
    ]
};

let legend = ["确诊", "疑似", "死亡", "治愈"];
// 全局变量，重新加载时需重新初始化
let maxValues = [0, 0, 0, 0];
let superOption = {
    baseOption: {
        timeline: {
            data: ["2016", "2017"],
            axisType: "category",
            autoPlay: true,
            playInterval: 1500,
            left: "0",
            right: "1%",
            top: "0%",
            width: "99%",
            symbolSize: 10,
            label: {
                formatter: function (d) { return d.substr(5); }
            },
            checkpointStyle: {
                borderColor: "#777",
                borderWidth: 2
            },
            controlStyle: {
                showNextBtn: true,
                showPrevBtn: true,
                normal: {
                    color: "#ff8800",
                    borderColor: "#ff8800"
                },
                emphasis: {
                    color: "#aaa",
                    borderColor: "#aaa"
                }
            }
        },
        legend: option.legend,
        tooltip: option.tooltip,
        grid: option.grid,
        xAxis: option.xAxis,
        yAxis: option.yAxis,
        series: option.series,
        animationDurationUpdate: 1500,
        animationEasingUpdate: "quinticInOut"
    },
    options: []
};

let chart = {
    name: "barChina",
    option: option,
    superOption: superOption,
    initData: null,
    instance: null,
    useMaxValue: true
};


/*
Params:
 srcData: [[code, value1, name, value2, value3, value4, time]]
 id: 图形容器Div的ID
 names: {code: name} (简称区域名映射表，来自地图文件)
 注：柱状图属于地图的补充描述，使用同一份数据
    柱状图分项使用地图区域名称简称，该名称来自于地图文件，使用行政区域代码对应关联，
    代码-名称映射表在地图数据转换时生成，并缓存，故柱状图绘制顺序应晚于对应地图绘制。
*/
function getOption (srcData, names, _option) {
    let dt = [[], [], [], []];
    srcData.sort((a, b) => { return b[1] - a[1]}).forEach(d => {
        // 图例对应数据索引位置
        [1, 3, 4, 5].forEach((idx, i) => {
            dt[i].push(d[idx]);
            if (d[idx] > maxValues[i]) maxValues[i] = d[idx];
        });
    });
    /// 左-地区名称，中-图1，右-图2
    for (let i = 0; i < 3; i++) {
        _option['yAxis'][i]['data'] = srcData.map(d => names[d[0]] || d[2]);
    }
    _option['series'] = legend.map((d, i) => {
        return {
            name: legend[i],
            type: 'bar',
            barWidth: 20,
            stack: i < 1 ? false : true,
            xAxisIndex: i < 1 ? 1 : 2,
            yAxisIndex: i < 1 ? 1 : 2,
            itemStyle:{
                normal: {
                    barBorderRadius: [2, 2, 2, 2],
                    color: Utils.Colors[i],
                    shadowBlur: [0, 0, 0, 10],
                    shadowColor: Utils.Colors[i],
                }
            },
            label: {
                normal: {
                    show: i < 1 || i == 3,
                    distance: 5,
                    position: 'right' // insideRight
                }
            },
            data: dt[i]
        };
    });

    return _option;
}

// 针对事件序列数据，数据上升一个维度
// param:   dts : {'2020-02-01': []}
function getOptions (dts, names) {
    // 理论上讲tms是有序的，若不是则应在此处排序
    let tms = Object.keys(dts);
    superOption.baseOption.timeline.data = tms;
    superOption.options = tms.map(k => {
        let _option = { title: {text: ''}, yAxis: [{data: []}, {data: []}, {data: []}] }
        return getOption(dts[k], names, _option);
    });
    return superOption;
}

chart.initData = function (srcData, id, names, allTime) {
    let _option = option;
    _option['legend']['data'] = legend;
    maxValues = [0, 0, 0, 0];
    if (!allTime) {
        _option = getOption(srcData, names, _option);
    } else {
        _option = getOptions(srcData, names);
    }
    // 数据尺度同一使用全局最大值为上限
    if (chart.useMaxValue) {
        option.xAxis[1]['max'] = maxValues[0];
        option.xAxis[2]['max'] = maxValues[1] + maxValues[2] + maxValues[3];
    }
    console.log(option);
    console.log(superOption);
    let myChart = Utils.drawGraph(_option, id);

    myChart.dispatchAction({ type: 'legendUnSelect', name: "疑似" })
};

let chart2 = chart;
export default chart2;