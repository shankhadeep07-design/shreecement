import React, { useEffect, useRef, useState } from "react";

import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";

import "react-confirm-alert/src/react-confirm-alert.css"; // Import css

import { Card } from "react-bootstrap";
import { getAllDetailsGallery } from "../../Services/Health-service";

import { useReactToPrint } from "react-to-print";

const ViewGallery = () => {
    const textareaRef = useRef(null);

    const params = useParams();
    const tglry_id = params.id;
    const contentRef = useRef(null);
    const handlePrint = useReactToPrint({ contentRef });
    const [detailsData, setDetailsData] = useState(null); // Initialize with null
    const [docsData, setDocsData] = useState([]); // Initialize with null
    const [pillarData, setPillarData] = useState([]); // Initialize with null

    const fetchDailyASLCDetails = async () => {
        try {
            const response = await getAllDetailsGallery(tglry_id);

            if (response.status === 1) {
                setDetailsData(response?.data);
                setDocsData(response?.docsData);
                setPillarData(response?.pillarData);
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error fetching ASLC details:", error);
            toast.error("Failed to fetch ASLC details. Please try again later.");
        }
    };

    useEffect(() => {
        fetchDailyASLCDetails();
    }, [tglry_id]); // Include dependencies to avoid stale closures

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5002/api/v1";


    const getFileAction = (file) => {
        const ext = file?.doc_ext?.toLowerCase();
        const isPdf = ext === '.pdf';
        const isExcel = ['.xls', '.xlsx'].includes(ext);
        const isWord = ['.doc', '.docx'].includes(ext);
        const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);

        const fileUrl = `${apiUrl}/uploads/${file?.file_path?.replace(/\\/g, "/")}`;

        if (isPdf) {
            // Show PDF inline in an iframe
            return <iframe src={fileUrl} width="100%" height="600px" title="PDF Viewer" />;
        } else if (isExcel || isWord) {
            // Provide download link for Word and Excel files
            return (
                <a href={fileUrl} download={file?.file_name}>
                    <button className="px-4 py-2 my-2">
                        Download {file?.file_name}
                    </button>
                </a>
            );
        } else if (isImage) {
            // Show image inline

            return (

                <div class="row">
                    <div className="my-4">
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            <img
                                src={fileUrl}
                                alt={file?.file_name}
                                crossOrigin="anonymous"
                                style={{ maxHeight: '150px', objectFit: 'cover', cursor: 'pointer' }}
                                className="max-w-full h-auto rounded border"
                            />
                        </a>
                        <div className="mt-2 ">
                            <label className="block text-sm text-gray-700">{file?.file_name}</label>
                        </div>
                    </div>
                </div>

            );
        } else {
            // Handle unsupported file types
            return <p>Unsupported file type: {ext}</p>;
        }
    };



    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{ duration: 2000 }}
                reverseOrder={false}></Toaster>

            <span className="position-absolute trigger"></span>

            <div className="home-content">
                <div className="card pb-3">

                    <div className="card-body at-elevation-z6 table-box" style={{ maxHeight: "calc(100vh - 23vh);", overflowX: 'auto' }}>

                        <div className="initiated-DailyASLC-table-container">
                            <h6>View Gallery</h6>
                            <hr className="my-1" />
                            <div className="mt-2 table table-bordered">
                                <div style={{ float: "right" }}>
                                    <button
                                        className="btn btn-primary m-2 py-1"
                                        onClick={handlePrint}
                                    >
                                        Print
                                    </button>
                                </div>
                                <div>
                                    <Card className="mb-3 shadow-sm">
                                        <Card.Header className="bg-light rounded-top">
                                            <legend className="float-none w-auto px-3">Gallery</legend>

                                        </Card.Header>
                                        <Card.Body>
                                            {detailsData ? (
                                                <div>
                                                    {detailsData[0] ? (
                                                        <>
                                                            <div ref={contentRef} style={{ margin: "1rem" }}>
                                                                <div class="row">
                                                                    <div class="col-md-6">
                                                                        <div class="mb-3">
                                                                            <label for="tbpe_title" class="form-label">Pillar</label>
                                                                            <input
                                                                                type="text"
                                                                                value={pillarData.map(item => item.tpsm_name).join(', ')}
                                                                                readOnly
                                                                                className="form-control"
                                                                                id="tbpe_title"
                                                                                name="tbpe_title"
                                                                                placeholder="Enter Title"
                                                                                required
                                                                            />

                                                                        </div>
                                                                    </div>
                                                                    <div class="col-md-6">
                                                                        <div class="mb-3">
                                                                            <label for="tbpe_title" class="form-label">Activity</label>
                                                                            <input type="text" value={detailsData[0]?.tglry_activity} readonly class="form-control" id="tbpe_title" name="tbpe_title" placeholder="Enter Title" required />
                                                                        </div>
                                                                    </div>



                                                                    <div class="col-md-6">
                                                                        <div class="mb-3">
                                                                            <label for="tbpe_date" class="form-label">Date</label>
                                                                            <input type="text" value={detailsData[0]?.tglry_date} readonly={true} class="form-control" id="tbpe_date" name="tbpe_date" placeholder="Select Date" required />
                                                                        </div>
                                                                    </div>

                                                                    {/* <div class="col-md-12">
                                                                        <div class="mb-3">
                                                                            <label for="tbpe_date" class="form-label">Date</label>
                                                                            <textarea
                                                                                readOnly
                                                                                className="form-control"
                                                                                id={`tbpe_description`}
                                                                                name="tbpe_description"
                                                                                placeholder="Enter Description"
                                                                                rows="12"
                                                                                style={{ resize: 'vertical', overflowX: 'auto', overflowY: 'auto', width: '100%' }}
                                                                                value={detailsData[0]?.tbpe_description} // Correct way to bind dynamic content
                                                                                ref={textareaRef} // Attach ref to the textarea
                                                                            />
                                                                            
                                                                        </div>
                                                                    </div> */}
                                                                </div>

                                                                <div className="row">
                                                                    {docsData?.map((file) => (
                                                                        <> {getFileAction(file)}</>
                                                                        // <div key={file?.tdocu_id} className="file-action">
                                                                        //     <h3>{file?.file_name}</h3>
                                                                        // </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <p>No details found for this ID.</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p>Loading...</p>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </>
    )
}

export default ViewGallery;