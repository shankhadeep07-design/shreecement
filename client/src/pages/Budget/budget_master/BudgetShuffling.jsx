import React, { useEffect, useState } from "react";
import { Modal, Button, ModalFooter } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import Select from 'react-select';
import { Select as AntdSelect } from 'antd';
import {  useNavigate } from 'react-router-dom'; 
// import { getFinancialYearApi,fetchAllRegion, fetchMines,getMineApi, getScheduleViiApi,getSdgByategoryIdApi,getSubCategoryBySdgIdApi } from "../../services/Master-service";
// import { budgetShufflingSubmitApi ,budgetTotalApi} from "../../services/Budget-service";
// import { useLoading } from '../../context/LoadingProvider';
import { LuIndianRupee } from "react-icons/lu";

export default function BudgetShuffling() {

    const navigate = useNavigate();
    // let { loading, setLoading } = useLoading();
    const [year, setYear] = useState('');
    const [transferType, setTransferType] = useState('both');

    const [fromBudget, setFromBudget] = useState({
        tbad_budget_type: '',        // Budget Type
        tbad_fy_id: '',             // Financial Year
        tbad_region_id: '',           // Mine
        tbad_mine_id: '',           // Mine
        tbad_sch_vii_id: '',        // Schedule Seven
        tbad_sdg_id: '',        // Schedule Seven
        tbad_sub_category_id: '',        // Schedule Seven
        tbad_total_budget: '',           // Total Budget
        tbad_used_budget: '',            // Used
        tbad_remaining_budget: '',       // Remaining
        tbad_amount: '',            // Amount
        tbad_allocation_type: 'deallocation',
    });

    const [toBudget, setToBudget] = useState({
        tbad_budget_type: '',        // Budget Type
        tbad_fy_id: '',             // Financial Year
        tbad_region_id: '',           // Mine
        tbad_mine_id: '',           // Mine
        tbad_sch_vii_id: '',        // Schedule Seven
        tbad_sdg_id: '',        // Schedule Seven
        tbad_sub_category_id: '',
        tbad_total_budget: '',           // Total Budget
        tbad_used_budget: '',            // Used
        tbad_remaining_budget: '',       // Remaining
        tbad_amount: '',           // Amount
        tbad_allocation_type: 'allocation',
    });

    const [transferOptions, setTransferOptions] = useState([
        { value: 'both', label: 'Both' },
        { value: 'deallocation', label: 'Deallocation' },
    ]);
    
    const [fromOptions, setFromOptions] = useState([
        { value: 'csr', label: 'CSR' },
        { value: 'pd', label: 'PD' },
        { value: 'contribution', label: 'Contribution' },
        { value: 'advertisement', label: 'Advertisement' },
        { value: 'sponsor', label: 'Sponsor' },
    ]);

    const [toOptions, setToOptions] = useState([
        { value: 'csr', label: 'CSR' },
        { value: 'pd', label: 'PD' },
        { value: 'contribution', label: 'Contribution' },
        { value: 'advertisement', label: 'Advertisement' },
        { value: 'sponsor', label: 'Sponsor' },
    ]);

    const allOptions = [
        { value: 'csr', label: 'CSR' },
        { value: 'pd', label: 'PD' },
        { value: 'contribution', label: 'Contribution' },
        { value: 'advertisement', label: 'Advertisement' },
        { value: 'sponsor', label: 'Sponsor' },
    ];

    const limitedOptions = [
        { value: 'contribution', label: 'Contribution' },
        { value: 'advertisement', label: 'Advertisement' },
        { value: 'sponsor', label: 'Sponsor' }
    ];


    const [showMineAndScheduleVIIForm, setShowMineAndScheduleVIIForm] = useState(false);
    const [showMineAndScheduleVIITo, setShowMineAndScheduleVIITo] = useState(false);

    const [fyList, setFyList] = useState([]);
    const [regionList, setRegionList] = useState([]);
    const [mineFromList, setFromMineList] = useState([]);
    const [mineToList, setToMineList] = useState([]);
    const [categoryFromList, setCategoryFromList] = useState([]);
    const [categoryToList, setCategoryToList] = useState([]);
    const [sdgFromList, setSdgFromList] = useState([]);
    const [sdgToList, setSdgToList] = useState([]);
    const [subCategoryFromList, setSubCategoryFromList] = useState([]);
    const [subCategoryToList, setSubCategoryToList] = useState([]);
  
    const [totalBudgetFrom, setTotalBudgetFrom] = useState(0);
    const [usedBudgetFrom, setUsedBudgetFrom] = useState(0);
    const [remainingBudgetFrom, setRemainingBudgetFrom] = useState(0);
    const [totalBudgetTo, setTotalBudgetTo] = useState(0);
    const [usedBudgetTo, setUsedBudgetTo] = useState(0);
    const [remainingBudgetTo, setRemainingBudgetTo] = useState(0);


    const handleBudgetTransferList = (rowdata) => {
  
        navigate("/admin/budget/budget-transfer-master");
    
    };

    const getMineList = (regionId,type) => {
        // Ensure region_ids is always an array
        var reg_data = { region_ids: Array.isArray(regionId) ? regionId : [regionId] };
      
        // fetchMines(reg_data)
        //   .then((data) => {
        //     if(type === 'from'){
        //         setFromMineList(data.data)
        //     }else{
        //         setToMineList(data.data)
        //     }
        // }).catch((error) => toast.error(error));
    };

    const getSdgList = (categoryId,type) => {
        // Ensure region_ids is always an array
        var reg_data = { category_id:categoryId };
      
        // getSdgByategoryIdApi(reg_data)
        //   .then((data) => {
        //     if(type === 'from'){
        //         setSdgFromList(data.data)
        //     }else{
        //         setSdgToList(data.data)
        //     }
        // }).catch((error) => toast.error(error));
    };

    const getSubCategoryList = (sdg_id,type) => {
        // Ensure region_ids is always an array
        var reg_data = { sdg_id: sdg_id };
      
        // getSubCategoryBySdgIdApi(reg_data)
        //   .then((data) => {
        //     if(type === 'from'){
        //         setSubCategoryFromList(data.data)
        //     }else{
        //         setSubCategoryToList(data.data)
        //     }
        // }).catch((error) => toast.error(error));
    };
    
    const handleYearChange = (field, value) => {
        setYear(value);
        setFromBudget(prevState => ({
            ...prevState,
            ['tbad_fy_id']: value
        }));

        setToBudget(prevState => ({
            ...prevState,
            ['tbad_fy_id']: value
        }));

    };

    const handleTransfetTypeChange = (field, value) => {
        setTransferType(value);
    };
    
    const handleFromChange = (field, value) => {
        setFromBudget((prevState) => {
            const updatedState = {
                ...prevState,
                [field]: value, // Update the field dynamically
            };
        
            return {
                ...updatedState,
                tbad_mine_id: (updatedState.tbad_budget_type === 'csr' || updatedState.tbad_budget_type === 'pd') 
                    ? updatedState.tbad_mine_id 
                    : null,
                tbad_region_id: (updatedState.tbad_budget_type === 'csr' || updatedState.tbad_budget_type === 'pd' || updatedState.tbad_budget_type === 'sponsor') 
                    ? updatedState.tbad_region_id 
                    : null,
                tbad_sch_vii_id: (updatedState.tbad_budget_type === 'csr' || updatedState.tbad_budget_type === 'pd') 
                    ? updatedState.tbad_sch_vii_id 
                    : null,
                tbad_sdg_id: (updatedState.tbad_budget_type === 'csr' || updatedState.tbad_budget_type === 'pd') 
                    ? updatedState.tbad_sdg_id 
                    : null,
                tbad_sub_category_id: (updatedState.tbad_budget_type === 'csr' || updatedState.tbad_budget_type === 'pd') 
                    ? updatedState.tbad_sub_category_id 
                    : null,
            };
        });

        // console.log("From Budget:", field, value);



        // Handle budget type logic for "From"
        if (field === "tbad_budget_type") {
            if (value === "csr" || value === "pd") {
                setShowMineAndScheduleVIIForm(true);
            } else {
                setShowMineAndScheduleVIIForm(false);
                setShowMineAndScheduleVIITo(false);
            }

            if (value === "sponsor" || value === "csr" || value === "pd") {
                setToOptions(allOptions);
            } else if (value === "contribution" || value === "advertisement") {
                setToOptions(limitedOptions);
            }
            setToBudget({ tbad_budget_type: null });
        }else if (field === "tbad_region_id") {
            getMineList(value,'from');
        
        }else if (field === "tbad_sch_vii_id") {
            getSdgList(value,'from');
        }else if (field === "tbad_sdg_id") {
            getSubCategoryList(value,'from');
        }

        
    };

    const handleToChange = ( field,value) => {

        setToBudget(prevState => ({
            ...prevState,
            [field]: value
        }));
        // Handle budget type logic for "To"
        if (field === "tbad_budget_type") {
            if (value === "csr" || value === "pd") {
                setShowMineAndScheduleVIITo(true);
            } else {
                setShowMineAndScheduleVIITo(false);
            }

        }else if (field === "tbad_region_id") {
            getMineList(value,'to');
        }else if (field === "tbad_sch_vii_id") {
            getSdgList(value,'to');
        
        }else if (field === "tbad_sdg_id") {
            getSubCategoryList(value,'to');
        }
    };


    const budgetTotalApiFun = (type) => {
        var budgetData = {};
        if (type === "from") {
          
            budgetData = fromBudget;
        } else {
            budgetData = toBudget;
        }

        budgetTotalApi(budgetData)
            .then((data) => {
                if (data?.data?.[0]) {
                    // const { total_budget, used_budget, remaining_budget } = data.data[0];
                    const { grand_total_budget, total_deallocation, remaining_budget,total_used_amount } = data.data[0];
                    
                    if (type === "from") {
                        setTotalBudgetFrom(grand_total_budget);
                        setUsedBudgetFrom(total_deallocation);
                        setRemainingBudgetFrom(remaining_budget-total_used_amount);
                    } else {
                        setTotalBudgetTo(grand_total_budget);
                        setUsedBudgetTo(total_deallocation);
                        setRemainingBudgetTo(remaining_budget);
                    }
                } else {
                    toast.error("Invalid data format from API");
                }

                // console.log(data);
            })
            .catch((error) => {
                console.error(error);
                toast.error("An error occurred while fetching budget data");
            });
    };


    useEffect(() => {
        // getFinancialYearApi().then((data) => setFyList(data.data)).catch((error) => toast.error(error));
        // fetchAllRegion().then((data) => setRegionList(data.data)).catch((error) => toast.error(error));
        // // getMineApi().then((data) => setMineList(data.data)).catch((error) => toast.error(error));
        // getScheduleViiApi().then((data) => {
            
        //     setCategoryFromList(data.data);
        //     setCategoryToList(data.data);
        // }).catch((error) => toast.error(error));
    }, []);

    const fyOptions = fyList.map((state) => ({ value: state.tfin_id, label: state.tfin_year_label }));
    const mineFromOptions = mineFromList.map((state) => ({ value: state.tmin_id, label: state.tmin_mine_name }));
    const mineToOptions = mineToList.map((state) => ({ value: state.tmin_id, label: state.tmin_mine_name }));
    const scheduleViiOptions = categoryFromList.map((item) => ({ value: item.tcat_id, label: item.tcat_category_name }));
    const categoryToOptions = categoryToList.map((item) => ({ value: item.tcat_id, label: item.tcat_category_name }));

    // const sdgFromOptions = sdgFromList.map((item) => ({ value: item.tcat_id, label: item.tcat_category_name }));
    // const sdgToOptions = sdgToList.map((item) => ({ value: item.tcat_id, label: item.tcat_category_name }));
    // const subCategoryFromOptions = subCategoryFromList.map((item) => ({ value: item.tcat_id, label: item.tcat_category_name }));
    // const subCategoryToOptions = subCategoryToList.map((item) => ({ value: item.tcat_id, label: item.tcat_category_name }));


    useEffect(() => {
        // console.log(fromBudget);

        if (fromBudget.tbad_fy_id) {
            budgetTotalApiFun('from');
        }

           
    }, [fromBudget]);

    useEffect(() => {
        if (fromBudget.tbad_fy_id) {
            budgetTotalApiFun('to');
        }
           
    }, [toBudget]);


    const [yearError, setYearError] = useState('');
    const [transferTypeError, setTransferTypeError] = useState('');
    const [fromAmountError, setFromAmountError] = useState('');

    const BudgetShufflingSubmit = async (event) => {
        event.preventDefault();
    
        let hasError = false;

        // console.log("From Budget:", fromBudget);

        if (!fromBudget.tbad_fy_id) {
            setYearError('Please select the year field.');
            hasError = true;
        } else {
            setYearError('');
        }

        if (!fromBudget.tbad_budget_type) {
            setTransferTypeError('Please select the type field.');
            hasError = true;
        } else {
            setTransferTypeError('');
        }

        if (!fromBudget.tbad_amount) {
            setFromAmountError('Please add the amount.');
            hasError = true;
        } else {
            setFromAmountError('');
        }

        if (hasError) return; // Stop submission if any error exists
        if (parseFloat(fromBudget?.tbad_amount ?? 0) <= 0) {
            setFromAmountError("Amount must be greater than zero");
            return;
        }        
        else if(parseFloat(fromBudget?.tbad_amount??0)>parseFloat(remainingBudgetFrom??0)){
            setFromAmountError("Amount cannot be greater than remaining amount");
            return;
        }else{
            setFromAmountError('');
           }
        // setLoading(true);
    
        // Prepare formData with additional budget fields
        const formData = {
            year,
            transfer_type: 'both',
            from_budget: {
                ...fromBudget,
                tbad_total_budget: totalBudgetFrom || 0,
                tbad_used_budget: usedBudgetFrom || 0,
                tbad_remaining_budget: remainingBudgetFrom || 0,
            },
            to_budget: {
                ...toBudget,
                tbad_total_budget: totalBudgetTo || 0,
                tbad_used_budget: usedBudgetTo || 0,
                tbad_remaining_budget: remainingBudgetTo || 0,
                tbad_amount: fromBudget.tbad_amount || 0,
            },
        };
    
        try {
            // const response = await budgetShufflingSubmitApi(formData);
            // setLoading(false);
            // // console.log(response);return
            // if (response.status) {
            //     toast.success(response.message);

            //     navigate("/admin/budget_shuffling/budget-transfer-successful/"+response.data.transaction_id);
    
            //     // Resetting all states to initial values
            //     // setYear(null);
            //     // setTransferType('both');

                
            //     // setFromBudget({
            //     //     tbad_budget_type: null,
            //     //     tbad_fy_id: '',
            //     //     tbad_mine_id: '',
            //     //     tbad_sch_vii_id: '',
            //     //     tbad_total_budget: 0,
            //     //     tbad_used_budget: 0,
            //     //     tbad_remaining_budget: 0,
            //     //     tbad_amount: 0,
            //     //     tbad_allocation_type: 'deallocation',
            //     // });
    
            //     // setToBudget({
            //     //     tbad_budget_type: null,
            //     //     tbad_fy_id: '',
            //     //     tbad_mine_id: '',
            //     //     tbad_sch_vii_id: '',
            //     //     tbad_total_budget: 0,
            //     //     tbad_used_budget: 0,
            //     //     tbad_remaining_budget: 0,
            //     //     tbad_amount: 0,
            //     //     tbad_allocation_type: 'allocation',
            //     // });
    
            //     // setTotalBudgetFrom(0);
            //     // setUsedBudgetFrom(0);
            //     // setRemainingBudgetFrom(0);
            //     // setTotalBudgetTo(0);
            //     // setUsedBudgetTo(0);
            //     // setRemainingBudgetTo(0);
            //     // setShowMineAndScheduleVIITo(false);
            //     // setShowMineAndScheduleVIIForm(false);
    
            //     // Optionally, call budgetList() here if you need to refresh the budget list
            // } else {
            //   toast.error(error?.response?.data?.message);
                
            // }
        } catch (error) {
            // setLoading(false);
                   toast.error(error?.response?.data?.message);

        }
    };
    

    return (
        <>
        
        {/* <div className="d-sm-flex d-block align-items-center justify-content-between page-header-breadcrumb">
            <h4 className="fw-medium mb-0">Budget Transfer</h4>
            <div className="ms-sm-1 ms-0">
                <nav>
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item"><a href="javascript:void(0);">Budget Transfer</a></li>
                        <li className="breadcrumb-item active" aria-current="page">list</li>
                    </ol>
                </nav>
            </div>
        </div> */}
    
        <div className="main-content app-content">
            <div className="container-fluid">
                <div className="row">
                    <div className="home-content">
                        <div className="card pb-3">
                            <div
                                className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3"
                                style={{ overflow: "hidden", display: "block" }}
                                >
                                <div className="card-title" style={{ float: "left" }}>
                                    Budget Transfer
                                </div>
                                <div style={{ float: "right" }}>
                                    <button onClick={() => handleBudgetTransferList(null)} className='btn btn-sm btn-dark py-1'>Back</button>
                                
                                </div>
                            </div>
                            
                            <div className="card-body">

                                <div className="row">
                                    <div className="col-md-3"></div>
                                    <div className="col-md-3"></div>
                                    <div className="col-md-3"></div>
                                    <div className="col-md-3">
                                        <Select
                                            options={fyOptions} // Replace with actual options for financial year
                                            value={fyOptions.find(option => option.value === year)}
                                            onChange={(option) => handleYearChange('year', option.value)}
                                            placeholder="Select Financial Year"
                                        />
                                         {yearError && <span className="text-danger">{yearError}</span>}
                                    </div>
                                    {/* <div className="col-md-3">
                                        <Select
                                                options={transferOptions} // Replace with actual options for financial year
                                                value={transferOptions.find(option => option.value === transferType)}
                                                onChange={(option) => handleTransfetTypeChange('transfer_type', option.value)}
                                                placeholder="Select Transfer Type"
                                            />
                                    </div> */}
                                </div>
    
                                <div class="row">
                                    <div class="col-md-12" id="AnnualPlanBudgetDistributionBox">
                                        <form action="" onSubmit={BudgetShufflingSubmit} method="POST" id="budget_transfer_form">
                                           
                                            <div class="row mt-3">
                                                <div class="col-lg-12">
                                                    <div class="border rounded p-2">
    
                                                        <h5 class="f-small">Transfer Details</h5>
                                                        <div class="table-responsive border">
                                                        <table className="table dataTable table-bordered mt-0">
                                                            <thead>
                                                                <tr>
                                                                    <td></td>
                                                                    <td className="text-center"><h5 className="my-1">From</h5></td>
                                                                    <td className="text-center"><h5 className="my-1">To</h5></td>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                <tr>
                    <th className="w-25">Budget Type</th>
                    <td>
                        <AntdSelect
                        showSearch
                        placeholder="Select Budget Type"
                            options={fromOptions}
                            value={fromOptions.find(option => option.value === fromBudget.tbad_budget_type)}
                            onChange={(option) => handleFromChange('tbad_budget_type', option)}
                            style={{ width: '100%' }}
                        />
                          {transferTypeError && <span className="text-danger">{transferTypeError}</span>}
                                                                    
                    </td>
                    <td>
                        <AntdSelect
                        showSearch
                        placeholder="Select Budget Type"
                            options={toOptions}
                            value={toOptions.find(option => option.value === toBudget.tbad_budget_type)}
                            onChange={(option) => handleToChange('tbad_budget_type', option)}
                            style={{ width: '100%' }}
                        />
                    </td>
                </tr>
               
                <tr>
                    <th className="w-25">Factory</th>
                    <td>
                        {(showMineAndScheduleVIIForm || fromBudget.tbad_budget_type === "sponsor") && (
                            <Select
                                options={regionList} // Populate with mine options
                                value={fromOptions.find(option => option.value === fromBudget.tbad_region_id)}
                                onChange={(option) => handleFromChange('tbad_region_id', option.value)}
                            />
                        )}
                    </td>
                    <td>
                        {(showMineAndScheduleVIITo || toBudget.tbad_budget_type === "sponsor") && (
                            <Select
                                options={regionList} // Populate with mine options
                                value={toOptions.find(option => option.value === toBudget.tbad_region_id)}
                                onChange={(option) => handleToChange('tbad_region_id', option.value)}
                            />
                        )}
                    </td>
                </tr>
                <tr>
                    <th className="w-25">Theme</th>
                    <td>
                        {showMineAndScheduleVIIForm && (
                            <Select
                                options={mineFromOptions} // Populate with mine options
                                value={fromOptions.find(option => option.value === fromBudget.tbad_mine_id)}
                                onChange={(option) => handleFromChange('tbad_mine_id', option.value)}
                            />
                        )}
                    </td>
                    <td>
                        {showMineAndScheduleVIITo && (
                            <Select
                                options={mineToOptions} // Populate with mine options
                                value={toOptions.find(option => option.value === toBudget.tbad_mine_id)}
                                onChange={(option) => handleToChange('tbad_mine_id', option.value)}
                            />
                        )}
                    </td>
                </tr>
                <tr>
                    <th className="w-25">Schedule VII</th>
                    <td>
                        {showMineAndScheduleVIIForm && (
                            <Select
                                options={scheduleViiOptions} // Populate with Schedule VII options
                                value={fromOptions.find(option => option.value === fromBudget.tbad_sch_vii_id)}
                                onChange={(option) => handleFromChange('tbad_sch_vii_id', option.value)}
                            />
                        )}
                    </td>
                    <td>
                        {showMineAndScheduleVIITo && (
                            <Select
                                options={categoryToOptions} // Populate with Schedule VII options
                                value={toOptions.find(option => option.value === toBudget.tbad_sch_vii_id)}
                                onChange={(option) => handleToChange('tbad_sch_vii_id', option.value)}
                            />
                        )}
                    </td>
                </tr>

                <tr>
                    <th className="w-25">SDF</th>
                    <td>
                        {showMineAndScheduleVIIForm && (
                            <Select
                                options={sdgFromList} // Populate with Schedule VII options
                                value={fromOptions.find(option => option.value === fromBudget.tbad_sdg_id)}
                                onChange={(option) => handleFromChange('tbad_sdg_id', option.value)}
                            />
                        )}
                    </td>
                    <td>
                        {showMineAndScheduleVIITo && (
                            <Select
                                options={sdgToList} // Populate with Schedule VII options
                                value={toOptions.find(option => option.value === toBudget.tbad_sdg_id)}
                                onChange={(option) => handleToChange('tbad_sdg_id', option.value)}
                            />
                        )}
                    </td>
                </tr>

                <tr>
                    <th className="w-25">Sub Category</th>
                    <td>
                        {showMineAndScheduleVIIForm && (
                            <Select
                                options={subCategoryFromList} // Populate with Schedule VII options
                                value={fromOptions.find(option => option.value === fromBudget.tbad_sub_category_id)}
                                onChange={(option) => handleFromChange('tbad_sub_category_id', option.value)}
                            />
                        )}
                    </td>
                    <td>
                        {showMineAndScheduleVIITo && (
                            <Select
                                options={subCategoryToList} // Populate with Schedule VII options
                                value={toOptions.find(option => option.value === toBudget.tbad_sub_category_id)}
                                onChange={(option) => handleToChange('tbad_sub_category_id', option.value)}
                            />
                        )}
                    </td>
                </tr>

                <tr className="table-primary">
                    <th className="w-25">Total Budget <span className="text-danger">( <LuIndianRupee/>)</span></th>
                    <td>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="00.00"
                            value={totalBudgetFrom}
                            onChange={(e) => handleFromChange('total_budget', e.target.value)} // Adjust as needed
                            readOnly
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="00.00"
                            value={totalBudgetTo}
                            onChange={(e) => handleToChange('total_budget', e.target.value)} // Adjust as needed
                            readOnly
                        />
                    </td>
                </tr>
                <tr>
                    <th className="w-25">Used <span className="text-danger">( <LuIndianRupee/>)</span></th>
                    <td>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="00.00"
                            value={usedBudgetFrom}
                            onChange={(e) => handleFromChange('used_budget', e.target.value)} // Adjust as needed
                            readOnly
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="00.00"
                            value={usedBudgetTo}
                            onChange={(e) => handleToChange('used_budget', e.target.value)} // Adjust as needed
                            readOnly
                        />
                    </td>
                </tr>
                <tr>
                    <th className="w-25">Remaining <span className="text-danger">( <LuIndianRupee/>)</span></th>
                    <td>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="00.00"
                            value={remainingBudgetFrom}
                            onChange={(e) => handleFromChange('remaining_budget', e.target.value)} // Adjust as needed
                            readOnly
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="00.00"
                            value={remainingBudgetTo}
                            onChange={(e) => handleToChange('remaining_budget', e.target.value)} // Adjust as needed
                            readOnly
                        />
                    </td>
                </tr>
                <tr>
                    <th className="w-25">Amount <span className="text-danger">( <LuIndianRupee/>)</span></th>
                    <td>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="00.00"
                            value={fromBudget.tbad_amount}
                            
                            onChange={(e) => {
                                const value = e.target.value;
                                if (!isNaN(value) && value >= 0) { // Check if the value is a number and not negative
                                    handleFromChange("tbad_amount", value);
                                }
                              }}
                        />
                          {fromAmountError && <span className="text-danger">{fromAmountError}</span>}
                                                                    
                    </td>
                    <td>
                        {/* <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="00.00"
                            value={toBudget.tbad_amount}
                            onChange={(e) => handleToChange('tbad_amount', e.target.value)} // Adjust as needed
                        /> */}
                    </td>
                </tr>
            </tbody>
                                                        </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
    
    
    
                                            
    
    
                                            {/*<div class="border rounded p-2 mt-3">
                                                <div class="row my-2">                          
    
                                                    <div class="col-md-3">
                                                        <label for="file" class="form-label mb-0">File</label>
                                                        <input type="file" name="file[]" class="form-control form-control-sm" id="file"/>
                                                        <p id="tapbd_file_error"></p>
                                                    </div>
                                                    <div class="col-md-9">
                                                        <label for="tapbd_remarks" class="form-label mb-0">Remarks</label>
                                                        <textarea name="tapbd_remarks" id="tapbd_remarks" class="form-control form-control-sm" rows="2"></textarea>
                                                        <p id="tapbd_remarks_error"></p>
                                                    </div>
    
                                                </div>
                                            </div>
                                            */}
    
    
                                            <div className="row my-4 text-right">
                                                <div className="col-md-12 text-right  text-end ">
                                                  <button class="btn btn-info btn-sm text-white" type="submit"> Transfer Amount</button>
                                               
                                                </div>
                                           </div>
    
    
                                        </form>
                                    </div>
    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    
    
            </div>
        </div>
        <Toaster position="top-right" reverseOrder={false} />
        </>
      )
}
