import {
    FileTextOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Card,
    Descriptions,
    Divider,
    Typography
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userDetails } from '../../../auth/auth';
import { projectImpactAssessmentDetailsApi } from '../../../services/Project-service';


export default function ViewProjectImpactAssessment() {
    const tpia_id = useParams()?.tpia_id;
    const [projectImpactAssessmentData, setProjectImpactAssessmentData] = useState(null);

    const userDetail = userDetails();

    const id = tpia_id;



    const fetchDetails = () => {
        projectImpactAssessmentDetailsApi({ tpia_id })
            .then(({ data }) => {
                if (!data) return;
                setProjectImpactAssessmentData(data);
            })
            .catch((error) =>
                toast.error(
                    error?.response?.data?.originalError ||
                    error?.response?.data?.message
                )
            );
    };

    useEffect(() => {
        if (tpia_id) {
            fetchDetails();
        }
    }, [tpia_id]);


    if (!projectImpactAssessmentData) {
        return <p style={{ padding: 20 }}>Loading impact assessment details...</p>;
    }



    return (
        <div style={{ padding: '10px 10px', background: '#f5f6fa', minHeight: '100vh' }}>
            <Card style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Typography.Title level={3} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    Project Impact Assessment Details
                </Typography.Title>

                <Divider orientation="left" style={{ fontWeight: 'bold', color: '#444' }}>
                    <FileTextOutlined /> Introduction
                </Divider>

                <Descriptions
                    column={2}
                    size="middle"
                    labelStyle={{ fontWeight: 500 }}
                    contentStyle={{ background: '#fafafa', padding: '8px 12px', borderRadius: 6 }}
                >

                    <Descriptions.Item label="Actual Beneficiary">
                        {projectImpactAssessmentData?.tpia_actual_beneficiary || 'N/A'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Before & After Comparison">
                        {projectImpactAssessmentData?.tpia_before_after_comparison || 'N/A'}
                    </Descriptions.Item>

                    <Descriptions.Item label="80G Certificate Applicable">
                        {projectImpactAssessmentData?.tpia_is_80g_applicable || 'N/A'}
                    </Descriptions.Item>

                    <Descriptions.Item label="CSR-1 Form Number">
                        {projectImpactAssessmentData?.tpia_csr1_form_number || 'N/A'}
                    </Descriptions.Item>

                </Descriptions>
                <div className="mt-3 border rounded  shadow-sm">
                    <div className="card-header px-3 py-2">
                        <h5 orientation="left mb-0">All Documents</h5>
                    </div>

                    <div className="card-body p-3 ">
                        {(projectImpactAssessmentData?.documents || []).length > 0 ? (
                            <Descriptions column={1} size="middle">
                                {projectImpactAssessmentData?.documents.map((doc, index) => (
                                    <Descriptions.Item
                                        key={doc?.tdoc_id}
                                        label={`Document ${index + 1} (${doc?.doc_purpose || "General"
                                            })`}
                                    >
                                        {doc?.doc_path ? (
                                            <a
                                                href={doc?.full_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                style={{ color: "#bc7e56" }}
                                            >
                                                Download (
                                                {doc?.doc_ext?.replace(".", "").toUpperCase() || "File"})
                                            </a>
                                        ) : (
                                            "Not available"
                                        )}
                                    </Descriptions.Item>
                                ))}
                            </Descriptions>
                        ) : (
                            <p style={{ marginLeft: 16 }}>No documents uploaded.</p>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
