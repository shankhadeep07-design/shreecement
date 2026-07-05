// UnitsDropdown.js
import React, { useState, useEffect, useRef } from "react";
import Dropdown from "./DropDown";
import {
  dashBoardTimeLineData,
  dashBoardTimeLineDataWeekly,
  dashBoardTotalAcquiredArea,
  dashBoardTotalArea,
  dashBoardTotalGovtLand,
  dashBoardTotalLegalCases,
  dashBoardTotalLegalCasesClosedOrPending,
  dashBoardTotalPrivateLand,
  dashBoardTotalProcuredArea,
  dashBoardTotalPurchasedArea,
  dashboardDistrictNAmes,
  dashboardStateNames,
  dashboardTalukasNAmes,
  dashboardUnitNAmes,
  dashboardVillageNAmes,
} from "../../services/Dashboard-service";
import { useLoading } from "../../context/LoadingContext";
import acquiredarea from "../../assets/images/acquired-area.png";
import NoPlots from "../../assets/images/no-plots.png";
import disputeLand from "../../assets/images/dispute-land.png";
import Employment from "../../assets/images/employment.png";
import { Button } from "react-bootstrap";
import SetPageTitle from "../../Components/SetPageTitle";
import { Chart } from "react-google-charts";
import ScaleLoader from "react-spinners/ScaleLoader";

import chart1icon from "../../assets/images/chart-1.png";

import Highcharts from "highcharts";
import Highcharts3D from "highcharts/highcharts-3d";
import accessibility from "highcharts/modules/accessibility"; // Import the 3D module

import "../../assets/css/dashboard.css";

import $ from "jquery";
import DashboarShimmer from "../shimmers/DashboardShimmer";

function UnitsDropdown({ permissions }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [talukas, setTalukas] = useState([]);
  const [selectedTaluka, setSelectedTaluka] = useState(null);
  const [unitName, setUnitName] = useState([]);
  const [selectedUnitName, setSelectedUnitName] = useState(null);
  const [villageName, setVillageName] = useState([]);
  const [selectVillageName, setSelectVillageName] = useState(null);
  const [state_id, setStateId] = useState(null);
  const [district_id, setDistrictId] = useState(null);
  const [taluka_id, setTalukaId] = useState(null);
  const [unit_id, setUnitId] = useState(null);
  const [village_id, setVillageId] = useState(null);
  const [isVillageSelected, setIsVillageSelected] = useState(false);
  const [filterData, setFilterData] = useState();
  const [numbersAtFirstRender, setNumbersAtFirstRender] = useState({
    total_required_area: 0,
    total_area_purchased: 0,
    total_area_acquired: 0,
    total_procured_area: 0,
    total_legal_cases: 0,
    total_pending_cases: 0,
    total_closed_cases: 0,
    total_private_land: 0,
    total_govt_land: 0,
    timeWise_total_area: 0,
    timeWise_acquired_area: 0,
    timeWise_purchased_area: 0,
  });

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default selected year
  const [selectedMonth, setSelectedMonth] = useState("000"); // Months are 0-indexed const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Months are 0-indexed
  const [landProgressData, setLandProgressData] = useState([]);

  const [shimmerLoader, setShimmerLoader] = useState(true);

  const [chartKey, setChartKey] = useState(0);

  const observeWidthChanges = (element, callback) => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        callback(width);
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  };
  const updateChart = () => {
    setChartKey((prevKey) => prevKey + 1);
  };
  useEffect(() => {
    const element = document.getElementsByClassName("body-wrapper");
    const unobserveWidthChanges = observeWidthChanges(element[0], updateChart);
  }, []);

  useEffect(() => {
    dashboardStateNames().then((states) => {
      setStates(states.data);
    });
  }, []);

  const renderStates = () => {
    return states.map((data) => ({
      label: data.tsl_state_name,
      value: data.tsl_state_id,
    }));
  };

  const renderDistricts = () => {
    return districts.map((data) => ({
      label: data.tdl_district_name,
      value: data.tdl_district_id,
    }));
  };

  const renderTalukas = () => {
    return talukas.map((data) => ({
      label: data.ttll_taluka_name,
      value: data.ttll_taluka_id,
    }));
  };

  const renderUnitNames = () => {
    return unitName.map((data) => ({
      label: data.tun_name,
      value: data.tun_id,
    }));
  };

  const renderVillages = () => {
    return villageName.map((data) => ({
      label: data.tvl_village_name,
      value: data.tvl_village_id,
    }));
  };

  const getDashBoardData = (state, district, taluka, unit, village) => {};
  const getAllDataAtFirstRender = () => {
    // Call all API functions concurrently and wait for all promises to resolve
    return Promise.all([
      dashBoardTotalArea(),
      dashBoardTotalPurchasedArea(),
      dashBoardTotalAcquiredArea(),
      dashBoardTotalProcuredArea(),
      dashBoardTotalLegalCases(),
    ]);
  };

  const onChangeFetchData = async (queryParams) => {
    try {
      const stateDataPromise = dashBoardTotalArea(queryParams);
      const acquiredAreaPromise = dashBoardTotalAcquiredArea(queryParams);
      const purchasedAreaPromise = dashBoardTotalPurchasedArea(queryParams);
      const legalCasesPromise =
        dashBoardTotalLegalCasesClosedOrPending(queryParams);
      const privateLandPromise = dashBoardTotalPrivateLand(queryParams);
      const govtLandPromise = dashBoardTotalGovtLand(queryParams);
      const procuredLandPromise = dashBoardTotalProcuredArea(queryParams);

      const [
        stateData,
        acquiredArea,
        purchasedArea,
        legalCases,
        privateLand,
        govtLand,
        procuredLand,
      ] = await Promise.all([
        stateDataPromise,
        acquiredAreaPromise,
        purchasedAreaPromise,
        legalCasesPromise,
        privateLandPromise,
        govtLandPromise,
        procuredLandPromise,
      ]);

      return {
        total_required_area: stateData.data,
        total_area_acquired: acquiredArea.data,
        total_area_purchased: purchasedArea.data,
        total_legal_cases: legalCases.result.totalCases,
        total_pending_cases: legalCases.result.totalPendingCases,
        total_closed_cases: legalCases.result.totalClosedCases,
        total_private_land: privateLand.data,
        total_govt_land: govtLand.data,
        total_procured_area: procuredLand.data,
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  useEffect(() => {
    getAllDataAtFirstRender()
      .then((results) => {
        const [
          totalArea,
          totalPurchasedArea,
          totalAcquiredArea,
          totalProcuredArea,
        ] = results;
        setNumbersAtFirstRender((prevRes) => ({
          ...prevRes,
          total_required_area: totalArea.data,
          total_area_purchased: totalPurchasedArea.data,
          total_area_acquired: totalAcquiredArea.data,
          total_procured_area: totalProcuredArea.data,
        }));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    dashBoardTotalLegalCasesClosedOrPending().then((response) => {
      setNumbersAtFirstRender((prevRes) => ({
        ...prevRes,
        total_legal_cases: response.result.totalCases,
        total_pending_cases: response.result.totalPendingCases, // Assuming response.result contains the total legal cases
        total_closed_cases: response.result.totalClosedCases,
      }));
    });
    dashBoardTotalPrivateLand().then((response) => {
      setNumbersAtFirstRender((prevRes) => ({
        ...prevRes,
        total_private_land: parseFloat(response.data), // Assuming response.result contains the total legal cases
      }));
    });
    dashBoardTotalGovtLand().then((response) => {
      setNumbersAtFirstRender((prevRes) => ({
        ...prevRes,
        total_govt_land: parseFloat(response.data), // Assuming response.result contains the total legal cases
      }));
    });
    dashBoardTimeLineData(new Date().getFullYear()).then((data) => {
      // setResponseData(data);
      const result = formatMonthlyData(data); // Call formatMonthlyData with the fetched data
      setLandProgressData([
        ["Date", "Total Area", { role: "annotation" }],
        ...result, // Spread the formatted data
      ]);
    });
    setTimeout(() => {
      setShimmerLoader(false);
    }, 2000);
  }, []);

  const handleResetLandProgress = () => {
    setSelectedMonth("000");
    dashBoardTimeLineData(new Date().getFullYear()).then((data) => {
      // setResponseData(data);
      const result = formatMonthlyData(data); // Call formatMonthlyData with the fetched data
      setLandProgressData([
        ["Date", "Total Area", { role: "annotation" }],
        ...result, // Spread the formatted data
      ]);
      setNumbersAtFirstRender((prevRes) => ({
        ...prevRes,
        timeWise_total_area: data.data.totalArea,
        timeWise_acquired_area: data.data.totalAcquired, // Assuming you want to set acquired area separately
        timeWise_purchased_area: data.data.totalPurchased, // Assuming you want to set purchased area separately
      }));
    });
  };

  const handleStateChange = (selectedOption) => {
    const state_id_1 = selectedOption.value;
    setSelectedState(selectedOption);
    setSelectedDistrict(null);
    setSelectedTaluka(null);
    setSelectedUnitName(null);
    setSelectVillageName(null);

    // Set state_id_1 in component state
    setStateId(state_id_1);

    dashboardDistrictNAmes(state_id_1).then((districts) => {
      const allDistricts = districts.data;
      setDistricts(allDistricts);
    });
    const queryParams = {
      state_id: state_id_1,
    };
    onChangeFetchData(queryParams)
      .then((data) => {
        setNumbersAtFirstRender((prevRes) => ({
          ...prevRes,
          ...data,
        }));
      })
      .catch((error) => {
        // Handle error
        console.error("Error:", error);
      });

    if (selectedMonth === "000") {
      dashBoardTimeLineData(selectedYear, selectedMonth, state_id_1).then(
        (data) => {
          const result = formatMonthlyData(data); // Call formatWeeklyData with the fetched data
          setLandProgressData([
            ["Date", "Total Area", { role: "annotation" }],
            ...result, // Spread the formatted data
          ]);
        }
      );
    } else {
      dashBoardTimeLineDataWeekly(selectedYear, selectedMonth, state_id_1).then(
        (data) => {
          const result = formatWeeklyData(data); // Call formatWeeklyData with the fetched data

          setLandProgressData([
            ["Date", "Total Area", { role: "annotation" }],
            ...result, // Spread the formatted data
          ]);
        }
      );
    }

    getDashBoardData(state_id, district_id);

    setFilterData({
      ...filterData,
      ["state_id"]: state_id_1,
      ["district_id"]: "",
      ["taluka_id"]: "",
      ["unit_id"]: "",
      ["village_id"]: "",
    });
  };

  const handleDistrictChange = (selectedOption) => {
    var district_id_2 = selectedOption.value;
    setSelectedDistrict(selectedOption);
    setSelectedTaluka(null);
    setSelectedUnitName(null);
    setSelectVillageName(null);
    setDistrictId(district_id_2);

    dashboardTalukasNAmes(state_id, district_id_2).then((talukas) => {
      const allTalukas = talukas;
      setTalukas(allTalukas.data);
    });
    const queryParams = {
      district_id: district_id_2,
    };

    onChangeFetchData(queryParams)
      .then((data) => {
        setNumbersAtFirstRender((prevRes) => ({
          ...prevRes,
          ...data,
        }));
      })
      .catch((error) => {
        // Handle error
        console.error("Error:", error);
      });

    if (selectedMonth === "000") {
      dashBoardTimeLineData(
        selectedYear,
        selectedMonth,
        state_id,
        district_id_2
      ).then((data) => {
        const result = formatMonthlyData(data); // Call formatWeeklyData with the fetched data
        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    } else {
      dashBoardTimeLineDataWeekly(
        selectedYear,
        selectedMonth,
        state_id,
        district_id_2
      ).then((data) => {
        const result = formatWeeklyData(data); // Call formatWeeklyData with the fetched data
        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    }

    setFilterData({
      ...filterData,
      ["district_id"]: district_id_2,
      ["taluka_id"]: "",
      ["unit_id"]: "",
      ["village_id"]: "",
    });
  };

  const handleTalukaChange = (selectedOption) => {
    var taluka_id_2 = selectedOption.value;
    setSelectedTaluka(selectedOption);
    setTalukaId(taluka_id_2);
    setSelectedUnitName(null);
    setSelectVillageName(null);

    dashboardUnitNAmes(state_id, district_id, taluka_id_2).then((units) => {
      const allUnits = units;
      setUnitName(allUnits.data);
    });

    const queryParams = {
      taluka_id: taluka_id_2,
    };

    onChangeFetchData(queryParams)
      .then((data) => {
        setNumbersAtFirstRender((prevRes) => ({
          ...prevRes,
          ...data,
        }));
      })
      .catch((error) => {
        // Handle error
        console.error("Error:", error);
      });

    if (selectedMonth === "000") {
      dashBoardTimeLineData(
        selectedYear,
        selectedMonth,
        state_id,
        district_id,
        taluka_id_2
      ).then((data) => {
        const result = formatMonthlyData(data); // Call formatWeeklyData with the fetched data

        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    } else {
      dashBoardTimeLineDataWeekly(
        selectedYear,
        selectedMonth,
        state_id,
        district_id,
        taluka_id_2
      ).then((data) => {
        const result = formatWeeklyData(data); // Call formatWeeklyData with the fetched data
        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    }

    setFilterData({
      ...filterData,
      ["taluka_id"]: taluka_id_2,
      ["unit_id"]: "",
      ["village_id"]: "",
    });
  };

  const handleUnitNameChange = (selectedOption) => {
    var unit_id_2 = selectedOption.value;
    setSelectedUnitName(selectedOption);
    // setUnit_id_state(unit_id);
    setSelectVillageName(null);
    setUnitId(unit_id);

    dashboardVillageNAmes(state_id, district_id, taluka_id, unit_id_2).then(
      (villages) => {
        const allVillages = villages;
        setVillageName(allVillages.data);
      }
    );

    const queryParams = {
      unit_id: unit_id_2,
    };

    onChangeFetchData(queryParams)
      .then((data) => {
        setNumbersAtFirstRender((prevRes) => ({
          ...prevRes,
          ...data,
        }));
      })
      .catch((error) => {
        // Handle error
        console.error("Error:", error);
      });

    if (selectedMonth === "000") {
      dashBoardTimeLineData(
        selectedYear,
        selectedMonth,
        state_id,
        district_id,
        taluka_id,
        unit_id_2
      ).then((data) => {
        const result = formatMonthlyData(data); // Call formatWeeklyData with the fetched data

        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    } else {
      dashBoardTimeLineDataWeekly(
        selectedYear,
        selectedMonth,
        state_id,
        district_id,
        taluka_id,
        unit_id_2
      ).then((data) => {
        const result = formatWeeklyData(data); // Call formatWeeklyData with the fetched data

        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    }

    setFilterData({
      ...filterData,
      ["unit_id"]: unit_id_2,
      ["village_id"]: "",
    });
  };

  const handleVillageNameChange = (selectedOption) => {
    var village_id_2 = selectedOption.value;
    setSelectVillageName(selectedOption);

    const queryParams = {
      village_id: village_id_2,
    };

    setVillageId(village_id);

    onChangeFetchData(queryParams)
      .then((data) => {
        setNumbersAtFirstRender((prevRes) => ({
          ...prevRes,
          ...data,
        }));
      })
      .catch((error) => {
        // Handle error
        console.error("Error:", error);
      });

    if (selectedMonth === "000") {
      dashBoardTimeLineData(
        selectedYear,
        selectedMonth,
        state_id,
        district_id,
        taluka_id,
        unit_id,
        village_id_2
      ).then((data) => {
        const result = formatMonthlyData(data); // Call formatWeeklyData with the fetched data

        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    } else {
      dashBoardTimeLineDataWeekly(
        selectedYear,
        selectedMonth,
        state_id,
        district_id,
        taluka_id,
        unit_id,
        village_id_2
      ).then((data) => {
        const result = formatWeeklyData(data); // Call formatWeeklyData with the fetched data
        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    }

    setFilterData({
      ...filterData,
      ["village_id"]: village_id_2,
    });

    setIsVillageSelected(!isVillageSelected);
  };

  const handleReset = () => {
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedTaluka(null);
    setSelectedUnitName(null);
    setSelectVillageName(null);
    setSelectedMonth("000");
    getAllDataAtFirstRender(null)
      .then((results) => {
        // Handle the results of all API calls here
        const [
          totalArea,
          totalPurchasedArea,
          totalAcquiredArea,
          totalProcuredArea,
        ] = results;
        setNumbersAtFirstRender({
          total_required_area: totalArea.data,
          total_area_purchased: totalPurchasedArea.data,
          total_area_acquired: totalAcquiredArea.data,
          total_procured_area: totalProcuredArea.data,
        });
      })
      .catch((error) => {
        // Handle errors if any of the API calls fail
        console.error("Error:", error);
      });
    dashBoardTotalLegalCasesClosedOrPending().then((response) => {
      setNumbersAtFirstRender((prevRes) => ({
        ...prevRes,
        total_legal_cases: response.result.totalCases,
        total_pending_cases: response.result.totalPendingCases, // Assuming response.result contains the total legal cases
        total_closed_cases: response.result.totalClosedCases,
      }));
    });
    dashBoardTotalPrivateLand().then((response) => {
      setNumbersAtFirstRender((prevRes) => ({
        ...prevRes,
        total_private_land: response.data, // Assuming response.result contains the total legal cases
      }));
    });
    dashBoardTotalGovtLand().then((response) => {
      setNumbersAtFirstRender((prevRes) => ({
        ...prevRes,
        total_govt_land: response.data, // Assuming response.result contains the total legal cases
      }));
    });

    dashBoardTimeLineData(selectedYear, selectedMonth).then((data) => {
      const result = formatMonthlyData(data); // Call formatWeeklyData with the fetched data
      setLandProgressData([
        ["Date", "Total Area", { role: "annotation" }],
        ...result, // Spread the formatted data
      ]);
    });
  };

  // Initialize the 3D module
  Highcharts3D(Highcharts);

  // Initialize the accessibility module
  accessibility(Highcharts);

  // Set accessibility.enabled to true
  Highcharts.setOptions({
    accessibility: {
      enabled: true,
    },
  });

  const renderTotalAreaChart = [
    ["Land", "Area", { role: "style" }, { role: "annotation" }],
    [
      "Total Required Area",
      parseFloat(numbersAtFirstRender.total_required_area),
      "#1b9e77",
      parseFloat(numbersAtFirstRender.total_required_area).toFixed(2), // Add annotation for the first bar
    ],
    [
      "Government Area",
      parseInt(numbersAtFirstRender.total_govt_land),
      "#d95f02",
      parseInt(numbersAtFirstRender.total_govt_land).toString(), // Add annotation for the second bar
    ],
    [
      "Private Area",
      parseFloat(numbersAtFirstRender.total_private_land),
      "#7570b3",
      parseFloat(numbersAtFirstRender.total_private_land).toFixed(2), // Add annotation for the third bar
    ],
  ];
  const renderTotalLegalCasesChart = [
    ["Land", "number", { role: "style" }, { role: "annotation" }],
    [
      "Total Legal Cases",
      parseInt(numbersAtFirstRender.total_legal_cases),
      "#4285f4",
      parseInt(numbersAtFirstRender.total_legal_cases),
    ],
    [
      "Pending",
      parseInt(numbersAtFirstRender.total_pending_cases),
      "orange",
      parseInt(numbersAtFirstRender.total_pending_cases),
    ],
    [
      "Closed",
      parseInt(numbersAtFirstRender.total_closed_cases),
      "#1b9e77",
      parseInt(numbersAtFirstRender.total_closed_cases),
    ],
  ];

  // Helper function to convert numeric month to month name
  function getMonthName(month) {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return monthNames[month - 1]; // Month index starts from 0
  }
  // Initialize an empty array to store the formatted data

  const formatMonthlyData = (responseData) => {
    const formattedData = [];

    // Iterate over the data array and format each entry
    responseData?.data?.forEach((entry) => {
      // Create a new array representing a row of data
      const rowData = [];

      // Push the month and year as a string into the row
      const monthName = getMonthName(entry.month);
      rowData.push(`${monthName}`);

      // Push the count into the row, parsed as an integer
      rowData.push(parseInt(entry.count));
      rowData.push(parseInt(entry.count));

      // Push the row into the formattedData array
      formattedData.push(rowData);
    });

    return formattedData; // Return the formatted data
  };
  const formatWeeklyData = (responseData) => {
    const formattedData = [];

    // Initialize a map to store records by week index
    const weeklyRecords = new Map();

    // Iterate over the response data and store records by week index
    responseData?.data?.forEach((entry) => {
      const weekIndex = entry.week_index;
      const numRecords = parseInt(entry.num_records);

      // If the week index doesn't exist in the map, create a new array for it
      if (!weeklyRecords.has(weekIndex)) {
        weeklyRecords.set(weekIndex, [0, 0]); // Initialize with zeros
      }

      // Update the total number of records for the corresponding week index
      weeklyRecords.get(weekIndex)[1] = numRecords;
    });

    // Populate formattedData with data for each week up to week 5
    for (let weekNumber = 1; weekNumber <= 5; weekNumber++) {
      const weekIndex = `Week ${weekNumber}`;
      const records = weeklyRecords.get(weekNumber) || [0, 0]; // If no data for the week, populate with zeros
      formattedData.push([weekIndex, records[1], records[1]]);
    }

    return formattedData; // Return the formatted data
  };

  const landProgressOptions = {
    subtitle: "Total Procured Area,Purchased , and Acquired",
    legend: { position: "bottom", alignment: "center" },
    chartArea: { left: 45, top: 30, right: 10, bottom: 55 },
    animation: {
      startup: true,
      easing: "linear",
      duration: 500,
    },
  };

  const purchasedVsAcquired = [
    ["Cases", "Area", { role: "style" }, { role: "annotation" }],
    [
      "Balance Area",
      parseFloat(
        parseFloat(numbersAtFirstRender.total_required_area) -
          parseFloat(numbersAtFirstRender.total_procured_area)
      ),
      "#63946",
      parseFloat(
        parseFloat(numbersAtFirstRender.total_required_area) -
          parseFloat(numbersAtFirstRender.total_procured_area)
      ).toFixed(2),
    ],
    [
      "Purchased Area",
      parseFloat(numbersAtFirstRender.total_area_purchased),
      "#EDAE49",
      parseFloat(numbersAtFirstRender.total_area_purchased),
    ],
    [
      "Acquired Area",
      parseFloat(numbersAtFirstRender.total_area_acquired),
      "3376BD",
      parseFloat(numbersAtFirstRender.total_area_acquired),
    ],
  ];

  const renderTotalAreaChartOptions = {
    chartArea: { width: "100%" },
    // colors: ["#3366CC", "#DC3912", "#FF9900"],
    colors: ["#1b9e77", "#d95f02", "#7570b3"],
    animation: {
      startup: true,
      easing: "linear",
      duration: 500,
    },
  };

  const renderTotalLegalCasesChartOptions = {
    chartArea: { width: "100%" },
    colors: ["#109618", "#FF9900", "#DC3912"],
    animation: {
      startup: true,
      easing: "linear",
      duration: 500,
    },
  };

  const renderTotalPrivateLandChartOptions = {
    chartArea: { width: "100%" },
    // colors: ["#109618", "#FF9900", "#DC3912"],
    pieHole: 0.4,
    is3D: false,
    legend: { position: "bottom", alignment: "center" },
    chartArea: { left: 0, top: 5, right: 0, bottom: 25 },
    animation: {
      startup: true,
      easing: "linear",
      duration: 500,
    },
  };

  // Function to handle changes in the selected year
  const handleYearChange = (event) => {
    const year = parseInt(event.target.value); // Parse the input value to an integer
    setSelectedMonth("000");
    setSelectedYear(year);
    if (
      selectedMonth == "000" ||
      state_id ||
      district_id ||
      taluka_id ||
      unit_id ||
      village_id
    ) {
      dashBoardTimeLineData(
        year,
        selectedMonth,
        state_id,
        district_id,
        unit_id,
        village_id
      ).then((data) => {
        const result = formatMonthlyData(data); // Call formatMonthlyData with the fetched data

        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    } else if (
      selectedMonth == "000" ||
      state_id ||
      district_id ||
      taluka_id ||
      unit_id
    ) {
      dashBoardTimeLineData(
        year,
        selectedMonth,
        state_id,
        district_id,
        taluka_id,
        unit_id
      ).then((data) => {
        const result = formatMonthlyData(data); // Call formatMonthlyData with the fetched data

        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    } else if (selectedMonth == "000" || state_id || district_id || taluka_id) {
      dashBoardTimeLineData(
        year,
        selectedMonth,
        state_id,
        district_id,
        taluka_id
      ).then((data) => {
        const result = formatMonthlyData(data); // Call formatMonthlyData with the fetched data

        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    } else if (selectedMonth == "000" || state_id || district_id) {
      dashBoardTimeLineData(year, selectedMonth, state_id, district_id).then(
        (data) => {
          const result = formatMonthlyData(data); // Call formatMonthlyData with the fetched data

          setLandProgressData([
            ["Date", "Total Area", { role: "annotation" }],
            ...result, // Spread the formatted data
          ]);
        }
      );
    } else if (selectedMonth == "000" || state_id) {
      dashBoardTimeLineData(year, selectedMonth, state_id).then((data) => {
        const result = formatMonthlyData(data); // Call formatMonthlyData with the fetched data

        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    }
  };

  const handleMonthChange = (event) => {
    const month = parseInt(event.target.value); // Parse the input value to an integer
    setSelectedMonth(month);
    // Update the selected year state
    if (state_id || district_id || taluka_id || unit_id || village_id) {
      dashBoardTimeLineDataWeekly(
        selectedYear,
        month,
        state_id,
        district_id,
        unit_id,
        village_id
      ).then((data) => {
        const result = formatWeeklyData(data); // Call formatWeeklyData with the fetched data

        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    } else if (state_id || district_id || taluka_id || unit_id) {
      dashBoardTimeLineDataWeekly(
        selectedYear,
        month,
        state_id,
        district_id,
        taluka_id,
        unit_id
      ).then((data) => {
        const result = formatWeeklyData(data); // Call formatWeeklyData with the fetched data

        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    } else if (state_id || district_id || taluka_id) {
      dashBoardTimeLineDataWeekly(
        selectedYear,
        month,
        state_id,
        district_id,
        taluka_id
      ).then((data) => {
        const result = formatWeeklyData(data); // Call formatWeeklyData with the fetched data

        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    } else if (state_id || district_id) {
      dashBoardTimeLineDataWeekly(
        selectedYear,
        month,
        state_id,
        district_id
      ).then((data) => {
        const result = formatWeeklyData(data); // Call formatWeeklyData with the fetched data

        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    } else if (state_id) {
      dashBoardTimeLineDataWeekly(selectedYear, month, state_id).then(
        (data) => {
          const result = formatWeeklyData(data); // Call formatWeeklyData with the fetched data

          setLandProgressData([
            ["Date", "Total Area", { role: "annotation" }],
            ...result, // Spread the formatted data
          ]);
        }
      );
    } else if (selectedYear && month) {
      dashBoardTimeLineDataWeekly(selectedYear, month).then((data) => {
        const result = formatWeeklyData(data); // Call formatWeeklyData with the fetched data

        setLandProgressData([
          ["Date", "Total Area", { role: "annotation" }],
          ...result, // Spread the formatted data
        ]);
      });
    }
  };

  return (
    <div className="card dashboard-container-card">
      {shimmerLoader && <DashboarShimmer />}

      <div style={{ display: shimmerLoader ? "none" : "block" }}>
        {/* ===== FILTER SECTION STARTS ===== */}
        <div
          className="card-body border bg-light mb-3 py-0"
          style={{ borderRadius: "7px" }}
        >
          <div className="row">
            <div className="col-lg-12">
              <div className="dashboard-heading">
                <h5>Dashboard </h5>
              </div>
              {(permissions?.indexOf("filter") > -1 || permissions == "*") && (
                <div className="dashboard-filter-search-container mb-3">
                  <div className="filter-search">
                    <Dropdown
                      options={renderStates()}
                      value={selectedState}
                      onChange={handleStateChange}
                      placeholder="Select state"
                    />
                  </div>
                  <div className="filter-search">
                    <Dropdown
                      options={renderDistricts()}
                      value={selectedDistrict}
                      onChange={handleDistrictChange}
                      placeholder="Select district"
                    />
                  </div>
                  <div className="filter-search">
                    <Dropdown
                      options={renderTalukas()}
                      value={selectedTaluka}
                      onChange={handleTalukaChange}
                      placeholder="Select taluka"
                    />
                  </div>
                  <div className="filter-search">
                    <Dropdown
                      options={renderUnitNames()}
                      value={selectedUnitName}
                      onChange={handleUnitNameChange}
                      placeholder="Select unit"
                    />
                  </div>
                  <div className="filter-search">
                    <Dropdown
                      options={renderVillages()}
                      value={selectVillageName}
                      onChange={handleVillageNameChange}
                      placeholder="Select a village"
                    />
                  </div>

                  <div className="filter-search-button">
                    <div className="">
                      <Button
                        className="btn btn-secondary"
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* ===== FILTER SECTION ENDS ===== */}

        {/* ===== TOP DASHBOARD CARDS SECTION STARTS ===== */}
        <div className="card-body py-0">
          {!permissions && (
            <div className="text-center">
              You don't have permission to access this module.
            </div>
          )}
          <div className="row">
            <div className="dashboard-container px-0">
              <div className="row pb-2">
                {/* Total Required Area */}
                {(permissions?.indexOf("total_required_area") > -1 ||
                  permissions == "*") && (
                  <div className="col-xl-4 mt-2">
                    <div className="gradient-style1 text-white box-shadow border-radius-10 height-100-p widget-style3">
                      <div className="d-flex flex-wrap align-items-center">
                        <div className="widget-icon">
                          <div className="icon">
                            <img src={acquiredarea} className="w-100" alt="" />
                          </div>
                        </div>
                        <div className="widget-data">
                          <div className="weight-400 font-16">
                            Total Required Area{" "}
                            <small style={{ fontSize: "10px" }}>acre</small>
                          </div>
                          <div className="weight-300 font-30">
                            {numbersAtFirstRender.total_required_area}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Purchased Area */}
                {(permissions?.indexOf("area_purchased") > -1 ||
                  permissions == "*") && (
                  <div className="col-xl-4 mt-2">
                    <div className="gradient-style4 text-white box-shadow border-radius-10 height-100-p widget-style3">
                      <div className="d-flex flex-wrap align-items-center">
                        <div className="widget-icon">
                          <div className="icon">
                            <img src={Employment} className="w-100" alt="" />
                          </div>
                        </div>
                        <div className="widget-data">
                          <div className="weight-400 font-16">
                            Area Purchased {""}
                            <small style={{ fontSize: "10px" }}>acre</small>
                          </div>
                          <div className="weight-300 font-30">
                            {numbersAtFirstRender.total_area_purchased}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Acquired Areas */}
                {(permissions?.indexOf("area_acquired") > -1 ||
                  permissions == "*") && (
                  <div className="col-xl-4 mt-2">
                    <div className="gradient-style3 text-white box-shadow border-radius-10 height-100-p widget-style3">
                      <div className="d-flex flex-wrap align-items-center">
                        <div className="widget-icon">
                          <div className="icon">
                            <img src={disputeLand} className="w-100" alt="" />
                          </div>
                        </div>
                        <div className="widget-data">
                          <div className="weight-400 font-16">
                            Area Acquired {""}
                            <small style={{ fontSize: "10px" }}>acre</small>
                          </div>
                          <div className="weight-300 font-30">
                            {numbersAtFirstRender.total_area_acquired}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Area Procured */}
                {(permissions?.indexOf("area_procured") > -1 ||
                  permissions == "*") && (
                  <div className="col-xl-4 mt-2">
                    <div className="gradient-style2 text-white box-shadow border-radius-10 height-100-p widget-style3">
                      <div className="d-flex flex-wrap align-items-center">
                        <div className="widget-icon">
                          <div className="icon">
                            <img src={NoPlots} className="w-100" alt="" />
                          </div>
                        </div>
                        <div className="widget-data">
                          <div className="weight-400 font-16">
                            Area Procured {""}
                            {/* (Purchased + Acquired) */}
                            <small style={{ fontSize: "10px" }}>acre</small>
                          </div>
                          <div className="weight-300 font-30">
                            {numbersAtFirstRender.total_procured_area}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Total alanced Area */}

                {(permissions?.indexOf("balance_area") > -1 ||
                  permissions == "*") && (
                  <div className="col-xl-4 mt-2">
                    <div className="gradient-style2 text-white box-shadow border-radius-10 height-100-p widget-style3">
                      <div className="d-flex flex-wrap align-items-center">
                        <div className="widget-icon">
                          <div className="icon">
                            <img src={NoPlots} className="w-100" alt="" />
                          </div>
                        </div>
                        <div className="widget-data">
                          <div className="weight-400 font-16">
                            Balance Area {""}
                            <small style={{ fontSize: "10px" }}>acre</small>
                          </div>
                          <div className="weight-300 font-30">
                            {(
                              parseFloat(
                                numbersAtFirstRender.total_required_area
                              ) -
                              parseFloat(
                                numbersAtFirstRender.total_procured_area
                              )
                            ).toFixed(4)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Total Legal Cases */}
                {(permissions?.indexOf("legal_cases") > -1 ||
                  permissions == "*") && (
                  <div className="col-xl-4 mt-2">
                    <div className="gradient-style2 text-white box-shadow border-radius-10 height-100-p widget-style3">
                      <div className="d-flex flex-wrap align-items-center">
                        <div className="widget-icon">
                          <div className="icon">
                            <img src={NoPlots} className="w-100" alt="" />
                          </div>
                        </div>
                        <div className="widget-data">
                          <div className="weight-400 font-16">
                            Legal Cases
                            {/* <small style={{ fontSize: "10px" }}>acre</small> */}
                          </div>
                          <div className="weight-300 font-30">
                            {numbersAtFirstRender.total_legal_cases}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="row">
            {(permissions?.indexOf("area_status_chart") > -1 ||
              permissions == "*") && (
              <div className="col-md-4 pb-2 px-0">
                <div className="card mb-0">
                  <div className="card-header py-1">
                    <h5 className="mb-0 dashboard-card-header">
                      <img src={chart1icon} className="header-icon" alt="" />
                      Area Status (in acre)
                    </h5>
                  </div>
                  <div className="card-body">
                    <Chart
                      width={"100%"}
                      height={"100%"}
                      chartType="ColumnChart"
                      data={renderTotalAreaChart}
                      options={renderTotalAreaChartOptions}
                    />
                  </div>
                </div>
              </div>
            )}

            {(permissions?.indexOf("purchase_vs_acquired_chart") > -1 ||
              permissions == "*") && (
              <div className="col-md-4 pb-2 px-0">
                <div className="card mb-0">
                  <div className="card-header py-1">
                    <h5 className="mb-0 dashboard-card-header">
                      <img src={chart1icon} className="header-icon" alt="" />{" "}
                      Purchased V/S Acquired (in acre)
                    </h5>
                  </div>
                  <div className="card-body">
                    {/* <Chart
                        width={'100%'}
                        height={'100%'}
                        chartType="ColumnChart"
                        data={purchasedVsAcquired}
                        options={renderTotalPrivateLandChartOptions}
                        // key={chartKey}
                      /> */}

                    <Chart
                      width={"100%"}
                      height={"100%"}
                      chartType="PieChart"
                      data={purchasedVsAcquired}
                      options={renderTotalPrivateLandChartOptions}
                      // key={chartKey}
                    />
                  </div>{" "}
                </div>{" "}
              </div>
            )}

            {(permissions?.indexOf("legal_case_chart") > -1 ||
              permissions == "*") && (
              <div className="col-md-4 pb-2 px-0">
                <div className="card mb-0">
                  <div className="card-header py-1">
                    <h5 className="mb-0 dashboard-card-header">
                      <img src={chart1icon} className="header-icon" alt="" />{" "}
                      Legal Case
                    </h5>
                  </div>
                  <div className="card-body">
                    <Chart
                      width={"100%"}
                      height={"100%"}
                      chartType="ColumnChart"
                      data={renderTotalLegalCasesChart}
                      options={renderTotalLegalCasesChartOptions}
                      // key={chartKey}
                    />
                  </div>{" "}
                </div>{" "}
              </div>
            )}
          </div>
          {(permissions?.indexOf("land_progress_chart") > -1 ||
            permissions == "*") && (
            <div className="row">
              <div className="col-md-12 pb-2 px-0">
                <div className="card mb-0">
                  <div className="card-header d-flex justify-content-between align-items-center py-1">
                    <h5 className="mb-0 dashboard-card-header">
                      <img src={chart1icon} className="header-icon" alt="" />
                      Land Progress
                    </h5>
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="mx-2 fw-bold">Year:</label>
                      <input
                        className="form-control form-control-sm bg-white"
                        type="number"
                        min="1900" // Assuming a reasonable minimum year
                        max="2100" // Assuming a reasonable maximum year
                        value={selectedYear}
                        onChange={handleYearChange}
                      />
                      <label className="mx-3 fw-bold nowrap">
                        Week For Month:
                      </label>
                      <select
                        className="form-control form-control-sm bg-white"
                        value={selectedMonth}
                        onChange={handleMonthChange}
                      >
                        <option value="000">All</option>
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                        {/* Add other months as needed */}
                      </select>
                      <Button className="bt btn-sm mx-2">
                        <div onClick={handleResetLandProgress}>Reset</div>
                      </Button>
                    </div>
                  </div>
                  <div className="card-body">
                    {/* Dropdowns for selecting start and end dates */}

                    {/* Render data for purchase area */}
                    <Chart
                      chartType="ColumnChart"
                      data={landProgressData}
                      options={landProgressOptions}
                      width="100%"
                      height="400px"
                      // key={chartKey}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* ===== TOP DASHBOARD CARDS SECTION ENDS ===== */}
      </div>
    </div>
  );
}

export default UnitsDropdown;
