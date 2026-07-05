import React, {useState, useEffect} from 'react'
import { FaPlus, FaTimes, FaRegTrashAlt, FaDownload } from "react-icons/fa";
import { getAllOptions, documentListApi } from "../Services/ModuleMasterService";
const DocumentList = ({DocProp}) => {
    const [documentsTableData, setDocumentsTableData] = useState({});
    useEffect(()=> {
        documentListApi(DocProp).then(res=>{
            const docs = res.data;
            const docsList = docs.reduce((acc, doc) => {
                acc[doc.original_file_name] = doc.file_path;
                return acc;
            }, {});
            setDocumentsTableData(docsList);
        }).catch(err=>{
            console.log(err);
        });
    }, [DocProp])

  return (
    <>
        <table className="table dataTable">
               
                <tbody>
                    
                  {
                    (Object.entries(documentsTableData).length) ?
                      Object.entries(documentsTableData).map((data, index) => {
                        return (
                          
                          <tr key={index}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center">{data[0]}</td>
                            <td className="text-center">
                              <a className="btn btn-sm btn-primary" target="_blank" rel="noopener noreferrer" href={process.env.REACT_APP_API_URL+"/"+data[1]} download>
                                <FaDownload/>
                              </a>
                            </td>
                          </tr>
                        )
                      })
                    :
                    <tr>
                      <td colSpan={3} className="text-center">No documents available.</td>
                    </tr>
                  }
                  
                </tbody>
              </table>
    </>
  )
}

export default DocumentList