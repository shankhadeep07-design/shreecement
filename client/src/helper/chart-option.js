
export const pai_chart_fun = () => {
    
    return {
        exportEnabled: true,
        animationEnabled: true,
        title: {
          text: "Pai Chart",
        },
        data: [{
          type: "pie",
          startAngle: 75,
          toolTipContent: "<b>{label}</b>: {y}%",
          showInLegend: "true",
          legendText: "{label}",
          indexLabelFontSize: 16,
          indexLabel: "{label} - {y}%",
          dataPoints: [
            { y: 18, label: "Direct" },
            { y: 49, label: "Organic Search" },
            { y: 9, label: "Paid Search" },
            { y: 5, label: "Referral" },
            { y: 19, label: "Social" }
          ]
        }]
      }
}

export const line_chart_fun = () => {

    return {
        theme: "light2",
        animationEnabled: true,
        exportEnabled: true,
        title: {
            text: "Line "
        },
        axisY: {
            title: "Line"
        },
        data: [
        {
            type: "area",
            xValueFormatString: "YYYY",
            yValueFormatString: "#,##0.## Million",
            dataPoints: [
                { x: new Date(2017, 0), y: 7.6},
                { x: new Date(2016, 0), y: 7.3},
                { x: new Date(2015, 0), y: 6.4},
                { x: new Date(2014, 0), y: 5.3},
                { x: new Date(2013, 0), y: 4.5},
                { x: new Date(2012, 0), y: 3.8},
                { x: new Date(2011, 0), y: 3.2}
            ]
        }
        ]
    }
}