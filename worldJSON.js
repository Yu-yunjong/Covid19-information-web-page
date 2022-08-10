$(document).ready( function() {
		$.getJSON('world.json', function(jsonDATA) {
		//$.getJSON('https://opendata.ecdc.europa.eu/covid19/casedistribution/json', function(jsonDATA) {
			var tagList = "";
			var data = jsonDATA.records;
			var cnt = 2;
			var cases, deaths;
			
			// 오늘 날짜 구하기
			function getToday(){
				var today = new Date();
				return today.getFullYear() + "-" + ("0" + (today.getMonth()+1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2);
			}
			
			today = getToday();
			$('#endDate').val(today);// 오늘 날짜 삽입

			//combobox 값 추가
			$('#country').append("<option value='0' name='1'>" + data[1].countriesAndTerritories + "</option>");//0번국가 추가(누락)
			for (i=0; i < data.length-1; i++){
				if (data[i].countriesAndTerritories != data[i+1].countriesAndTerritories){
					$('#country').append("<option value=\'" + i + "\' name=\'" + cnt + "\'>" + data[i+1].countriesAndTerritories + "</option>");
					cnt++;
				}
			}
			//console.log(data);
			
			// selectbox 에서 값을 변경(선택)할경우
			$('#country').change(function(){
				cases = [];
				deaths = [];
				
				var selectNum = eval($('#country > option:selected').attr('name'));	//선택된 selectbox의 index
				var nextSelectNum = eval($('#country > option').eq(selectNum + 1).attr('name'));
				var start = eval($('#country').val());
				var end = eval($('#country > option').eq(nextSelectNum).val());

				var num = 0;	// 누적 확진자수
				var deathNum = 0;	// 누적 사망자수
				if ($('#country > option:selected').attr('name') == $('#country > option').last().attr('name')){
					end = eval(data.length)-1;
				}

				for(var i=end; i>start; i--){
					num += eval(data[i].cases);
					deathNum += eval(data[i].deaths);
					cases.push([data[i].year + "-" + data[i].month + "-" + data[i].day, num]);
					deaths.push([data[i].year + "-" + data[i].month + "-" + data[i].day, deathNum]);
				}
				
				makeChart();
				});
				
	function makeChart() {
					// 차트 그리기
				$('#chart1').empty();
				$.jqplot._noToImageButton = true;

			    var plot1 = $.jqplot("chart1", [cases, deaths], {
			        seriesColors: ["rgb(211, 235, 59)","rgba(78, 135, 194, 0.7)"],
			        title: '코로나19 누적 확진자 수',
			        highlighter: {
			            show: true,
			            sizeAdjust: 1,
			            tooltipOffset: 9
			        },
			        grid: {
			            background: 'rgba(57,57,57,0.0)',
			            drawBorder: true,
			            shadow: false,
			            gridLineColor: '#BDBDBD',
			            gridLineWidth: 1
			        },
			        legend: {
			            show: true,
			            placement: 'outside'
			        },
			        seriesDefaults: {
			            rendererOptions: {
			                smooth: true,
			                animation: {
			                    show: true
			                }
			            },
			            showMarker: false	// 점
			        },
			        series: [
			            {
			                fill: false,
			                label: '확진자수',
			                formatString: "%"
			            },
			            {
			                label: '사망자수'
			            }
			        ],
			        axesDefaults: {
			            rendererOptions: {
			                baselineWidth: 1.5,
			                baselineColor: '#444444',
			                drawBaseline: true
			            }
			        },
			        axes: {
			            xaxis: {
			                renderer: $.jqplot.DateAxisRenderer,
			                tickRenderer: $.jqplot.CanvasAxisTickRenderer,
			                tickOptions: {
			                    formatString: "%m-%d",
			                    angle: -30,
			                    textColor: '#5F00FF'
			                },
			                min: $('#startDate').val(),
			                max: $('#endDate').val(),
			                tickInterval: "1 months",
			                drawMajorGridlines: true
			            },
			            yaxis: {
			                renderer: $.jqplot.LogAxisRenderer,
			                pad: 0,

			                rendererOptions: {
			                    minorTicks: 1
			                },
			                tickOptions: {
			                    formatString: "%'d",
			                    showMark: false
			                }
			            }
			        }
			    });
			 
			      $('.jqplot-highlighter-tooltip').addClass('ui-corner-all');
}
			});
	});
				

	$('#btnLoad2').click( function() {

});

