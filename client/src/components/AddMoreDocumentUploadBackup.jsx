import { useRef, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { addRow, setAllRows} from "../redux/slices/AddMoreFileSlice";
function AddMoreDocumentUpload({doc_list}) {
    var dispatch = useDispatch();
    var addMoreState = useSelector((state) => state.AddMoreFileSlice);

    function addMoreRow() {
        var tempObj = {...addMoreState?.firstObj};
        tempObj.id = Date.now();
        dispatch(addRow(tempObj));
    }
    function deleteRow(id) {
        var rows = [...addMoreState?.rows];
        var newRows = rows?.filter((row) => row.id != id);
        dispatch(setAllRows(newRows));
    }


    function handleInputChange(e, index, type){
        var rows = [...addMoreState?.rows];
        var obj = {...rows[index]};
        if(type == 'title')
            obj[type] = e.target.value;
        else if(type == 'file'){
            const file = e.target.files[0];
            obj[type] = {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            };
        }
        rows[index] = obj;
        dispatch(setAllRows(rows));
    }
    return (
        <div>
            {
                addMoreState?.rows?.map((obj, index) => {
                    return (
                        <div className='d-flex align-items-center mb-4' key={obj?.id}>
                            <div className='w-100'>
                                <input type="text" value={obj?.title} onChange={(e) => {handleInputChange(e,index,'title')}} placeholder='Document Title' id="" className='form-control' />
                            </div>
                            <div className='w-100' style={{ marginLeft: "15px" }}>
                                <input type="file" onChange={(e) => {handleInputChange(e,index,'file')}} id="" className='form-control' />
                            </div>
                            <div style={{ marginLeft: "15px" }}>
                                <button type="button" className='btn btn-sm btn-success' onClick={addMoreRow}>
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                            <div style={{ marginLeft: "15px" }}>
                                {
                                    (addMoreState?.rows?.length > 1) &&
                                        <button type="button" data-id = {`${obj?.id}`} className='btn btn-sm btn-danger' onClick={(e) => { deleteRow(obj?.id) }}>
                                            <i class="fa-solid fa-minus"></i>
                                        </button>
                                }
                            </div>
                        </div>
                    )
                })
            }

        </div>

    )
}

export default AddMoreDocumentUpload;