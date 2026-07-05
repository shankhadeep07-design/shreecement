import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Modal, Space, DatePicker, TimePicker, Upload, Select, message, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { event_review_form_submitApi } from '../../services/Event-service';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function EventReviewFormModal({ isModalOpen, handleOk, handleCancel, event_id, getEventReviewForms, initialValues = {} }) {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    let eventId = event_id;

    useEffect(() => {
        if (initialValues && Object.keys(initialValues).length > 0) {
            form.setFieldsValue({
                terf_id: initialValues.terf_id,
                terf_event_id: eventId,
                terf_name: initialValues.terf_name,
                terf_event_join_date: dayjs(initialValues.terf_event_join_date),
                terf_event_join_time: dayjs(initialValues.terf_event_join_time, 'HH:mm:ss'),
                terf_event_end_date: dayjs(initialValues.terf_event_end_date),
                terf_event_end_time: dayjs(initialValues.terf_event_end_time, 'HH:mm:ss'),
                terf_remarks: initialValues.terf_remarks,
                terf_status: initialValues.terf_status,
            });
        }
    }, [initialValues, form, eventId]);

    const onFinish = async (values) => {
        Modal.confirm({
            title: 'Are you sure you want to submit the review form?',
            content: 'Please confirm that all event details are correct before proceeding.',
            okText: 'Yes, Submit',
            cancelText: 'Cancel',
            onOk: async () => {
                const formData = new FormData();

                if (initialValues.terf_id) formData.append('terf_id', initialValues.terf_id);
                formData.append('terf_event_id', eventId);
                formData.append('terf_name', values.terf_name);
                formData.append('terf_event_join_date', values.terf_event_join_date.format('YYYY-MM-DD'));
                formData.append('terf_event_join_time', values.terf_event_join_time.format('HH:mm:ss'));
                formData.append('terf_event_end_date', values.terf_event_end_date.format('YYYY-MM-DD'));
                formData.append('terf_event_end_time', values.terf_event_end_time.format('HH:mm:ss'));
                formData.append('terf_remarks', values.terf_remarks);
                formData.append('terf_status', values.terf_status);

                // Append all selected images (max 5)
                if (fileList.length > 0) {
                    fileList.forEach(file => {
                        formData.append('files', file.originFileObj);
                    });
                }

                try {
                    const res = await event_review_form_submitApi(formData);
                    if (res.status === true) {
                        message.success('Event review form submitted successfully');
                        form.resetFields();
                        setFileList([]);
                        handleOk(res.data);
                        getEventReviewForms();
                    } else {
                        message.error(res.message || 'Submission failed');
                    }
                } catch (error) {
                    message.error(error?.response?.data?.message || 'Submission failed');
                }
            },
        });
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isImage) message.error('Only image files allowed!');
        if (!isLt2M) message.error('Image must be smaller than 2MB!');
        return isImage && isLt2M;
    };

    const handleUploadChange = ({ fileList }) => {
        setFileList(fileList);
    };

    return (
        <Modal
            title="Event Review Form"
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            width={'70%'}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                {/* Hidden field for edit */}
                <Form.Item name="terf_id" hidden>
                    <Input />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="terf_event_join_date" label="Join Date" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="terf_event_join_time" label="Join Time" rules={[{ required: true }]}>
                            <TimePicker style={{ width: '100%' }} format="HH:mm" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="terf_event_end_date" label="End Date" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="terf_event_end_time" label="End Time" rules={[{ required: true }]}>
                            <TimePicker style={{ width: '100%' }} format="HH:mm" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="terf_remarks" label="Remarks" rules={[{ required: true }]}>
                            <TextArea rows={3} placeholder="Write remarks here..." />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="Upload Images"
                            rules={[{ required: true, message: 'Please upload at least one image' }]}
                            style={{ marginBottom: '24px' }}
                        >
                            <Upload
  multiple
  listType="picture"
  beforeUpload={beforeUpload}
  fileList={fileList}
  onChange={handleUploadChange}
  maxCount={5}
  accept="image/*"
>
  <Button icon={<UploadOutlined />}>Upload</Button>
</Upload>

                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">Submit</Button>
                        <Button onClick={() => { form.resetFields(); setFileList([]); }}>Reset</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
}
