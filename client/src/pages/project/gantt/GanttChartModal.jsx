import React from "react";
import Highcharts from "highcharts/highcharts-gantt";
import HighchartsReact from "highcharts-react-official";
import dayjs from "dayjs";

// 🔹 Flatten hierarchical tasks into Highcharts-compatible format
const flattenTasks = (items, parentId = null, day = 1000 * 60 * 60 * 24) => {
  if (!items) return [];

  if (!Array.isArray(items)) {
    items = [items];
  }

  return items.reduce((acc, item) => {
    const plannedStart = item.atim_planned_start_dt;
    const plannedEnd = item.atim_planned_end_dt;
    const actualStart = item.atim_actual_start_dt;
    const actualEnd = item.atim_actual_end_dt;

    // Parent task (with percentage in name)
    const parentTask = {
      id: item.atim_id,
      parent: parentId || undefined,
      name: `${item.atim_activities} <span style="color:red;"><b>${item.atim_wightage || 0}%</b></span>`,
      start: plannedStart ? dayjs(plannedStart).valueOf() : null,
      end: plannedEnd ? dayjs(plannedEnd).valueOf() + day : null,
    };

    // Plan child
    const planTask = plannedStart && plannedEnd ? {
      id: `Plan_${item.atim_id}`,
      parent: item.atim_id,
      name: "Plan",
      start: dayjs(plannedStart).valueOf(),
      end: dayjs(plannedEnd).valueOf() + day,
      color: "#db69c1",
      customText: `${dayjs(plannedEnd).diff(dayjs(plannedStart), "day") + 1} days`,
    } : null;

    // Actual child
    const actualTask = actualStart ? {
      id: `Actual_${item.atim_id}`,
      parent: item.atim_id,
      name: "Actual",
      start: dayjs(actualStart).valueOf(),
      end: actualEnd ? dayjs(actualEnd).valueOf() + day : new Date().getTime() + day,
      color: "#74d1d6",
      customText: actualEnd
        ? `${dayjs(actualEnd).diff(dayjs(actualStart), "day") + 1} days`
        : `${dayjs().diff(dayjs(actualStart), "day")} days (In Progress)`,
    } : null;

    const children =
      item.children && item.children.length > 0
        ? flattenTasks(item.children, item.atim_id, day)
        : [];

    return acc.concat(
      parentTask,
      planTask ? [planTask] : [],
      actualTask ? [actualTask] : [],
      children
    );
  }, []);
};

const GanttChartModal = ({ data }) => {
  const today = new Date();
  const day = 1000 * 60 * 60 * 24;

  // Normalize today
  today.setUTCHours(0, 0, 0, 0);

  const tasks = flattenTasks(data, null, day);

  console.log("tasks", tasks);
  

  const options = {
    chart: { height: 500 },
    title: { text: "Gantt View" },
    subtitle: { text: "Planned vs Actual", align: "left" },

    plotOptions: {
      gantt: {
        dataLabels: {
          enabled: true,
          formatter: function () {
            if (this.point.customText) {
              return this.point.customText;
            }
            return this.point.name;
          },
          useHTML: true,
        },
      },
    },

    xAxis: [
      {
        labels: {
          formatter() {
            const unitName = this.tickPositionInfo.unitName;
            const format =
              unitName === "week" ? "%b" : this.dateTimeLabelFormat;
            return Highcharts.dateFormat(format, this.value);
          },
        },
      },
      {
        labels: {
          formatter() {
            return Highcharts.dateFormat(
              this.dateTimeLabelFormat + " custom",
              this.value
            );
          },
        },
      },
    ],

    yAxis: { uniqueNames: true },

    navigator: {
      enabled: true,
      liveRedraw: true,
      series: {
        type: "gantt",
        pointPlacement: 0.5,
        pointPadding: 0.25,
      },
      yAxis: { min: 0, max: 3, reversed: true, categories: [] },
    },

    scrollbar: { enabled: true },

    rangeSelector: { enabled: true, selected: 0 },

    series: [
      {
        name: "CSR Project",
        data: tasks,
      },
    ],

    tooltip: {
      borderColor: "#E91E49",
      borderRadius: 5,
      borderWidth: 2,
      useHTML: true,
      formatter: function () {
        return `
          <b>${this.point.name}</b><br/>
          <b>Start:</b> ${Highcharts.dateFormat("%d-%m-%Y", this.point.start)}<br/>
          <b>End:</b> ${Highcharts.dateFormat("%d-%m-%Y", this.point.end - day)}
        `;
      },
    },
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      constructorType="ganttChart"
      options={options}
    />
  );
};

export default GanttChartModal;
