import React, { useState, useEffect } from "react";
import { dashboardVillageDetailsApi } from "../../services/Dashboard-service";
import {useLoading} from '../../context/LoadingContext'
export const VillageDataList = ({ villageId }) => {
  const [villagesData, setVillagesData] = useState([]);
  useEffect(() => {
    getVillageDetails();
  }, []);

  const getVillageDetails = () => {

    var divi_id = {
      village_id: villageId,
    };

    dashboardVillageDetailsApi(divi_id)
      .then((res) => {
        setVillagesData(res.data);
      })
      .catch((error) => {});
  };

  return (
    <>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th> Panjreh Village Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <p>
                Acquired Area (acre)<span>{villagesData.total_area}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p>
                No.of Plots<span>{villagesData.total_no_of_plots}</span>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
