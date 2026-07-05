import { useEffect } from 'react'
function AddMoreDocumentUpload({ rows, setRows, title, existData }) {
    var firstObj = {
        id: Date.now(),
        doc_id: "",
        title: "",
        file: '',
        exist_file_url: '',
        file_original_name : ''
    }
    useEffect(() => {
        if (existData) {
            var newArr = existData?.map((obj, index) => {
                var data = obj;
                var id = Date.now();
                return {
                    ...firstObj,
                    id: (id+index),
                    doc_id: data?.id,
                    title: data?.doc_title,
                    exist_file_url: `${process.env.REACT_APP_API_URL}/${data?.file_path}`,
                    file_original_name: data?.original_file_name,
                };
            })
            setRows([]);
            setRows(newArr);
        } else {
            setRows([firstObj]);
        }
    }, [existData])

    function addMoreRow() {
        setRows((prevObj) => {
            var tempObj = firstObj;
            tempObj.id = Date.now();
            return [...prevObj, tempObj]
        })
    }
    function deleteRow(id) {
        setRows(rows.filter((row) => row.id !== id));
    }

    function handleAddMoreInputChange(e, index, type) {
        setRows((prevObj) => {
            if (type == 'title')
                prevObj[index][type] = e.target.value;
            else if (type == 'file') {
                // e.target.files[0]['id'] = prevObj[index]['id'];
                prevObj[index][type] = e.target.files[0];
            }
            return [...prevObj];
        })
    }


 
    return (
        <>
            <div className='row'>
                <div className='col-lg-12 px-0 d-flex justify-content-between align-items-center'>
                    <div className='w-100'>
                       
                    </div>
                   
                </div>
                
            </div>
            <div className=''>
                {
                    rows?.map((obj, index) => {
                        return (
                            <div className='d-flex align-items-center mb-4' key={obj?.id}>
                                <div className='w-100'>
                                    <input type="text" required value={obj?.title} onChange={(e) => { handleAddMoreInputChange(e, index, 'title') }} placeholder='Document Title' id="" className='form-control' />
                                </div>
                                <div className='w-100' style={{ marginLeft: "15px" }}>
                                    <input type="file" required name={`file-${obj?.id}`} onChange={(e) => { handleAddMoreInputChange(e, index, 'file') }} id="" className='form-control' />
                                    {
                                        (obj?.exist_file_url) && 
                                            <a href={`${obj?.exist_file_url}`} target='_blank' rel="noopener noreferrer">{obj?.file_original_name}</a>
                                    }
                                </div>
                                {
                                    (rows?.length > 1) &&
                                    <div style={{ marginLeft: "15px" }}>
                                        <button type="button" data-id={`${obj?.id}`} className='btn btn-sm btn-danger' onClick={(e) => { deleteRow(obj?.id) }}>
                                            <i class="fa-solid fa-minus"></i>
                                        </button>
                                    </div>
                                }
                            </div>
                        )
                    })
                }
            </div>
        </>


    )
}

export default AddMoreDocumentUpload;