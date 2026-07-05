import React,{useState,useEffect} from 'react'

//React Bootstrap
//import {Modal,Button,Dropdown} from "react-bootstrap";

//Services call
import { getAllVillagesApi } from '../../services/Village-service';

//Component
import { VillageDataList } from './VillageDataList';
import {useLoading} from '../../context/LoadingContext'

export default function VillageWiseDataShow({divisionId}) {

    const [villagesList, setVillagesList] = useState([]);
    const [villageId,setVillageId] = useState(''); 
    useEffect(() => {
        getVillages();
    }, []);

    const getVillages = () => {

        var divi_id = {
            "unit_id" : divisionId
        }

      getAllVillagesApi(divi_id).then((res) => {

        setVillagesList(res.data);
      }).catch((error) => {

      });
    }


  return (
    <>
      
          <ul className="tabs nav nav-tabs" id="myTab" role="tablist">

              {
                  villagesList.map((village,index) => (
                      <li className="nav-item" role="presentation" key={index+1}>
                          <button className="nav-link" onClick={(e) => setVillageId(village.tvl_village_id) } id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">
                          {village.tvl_village_name}
                          </button>
                      </li>
                  ))
              }

          </ul>

              {
                (villageId !== '')?
                  <div className="tab-content" id="myTabContent">
                    <div className="tab-pane fade active show" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                        <VillageDataList key={villageId} villageId = {villageId}/>
                    </div>
                  </div>
                :''
              }

          
      
    </>
  )
}
