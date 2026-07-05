import React from "react";
import { Upload, Image, Popconfirm } from "antd";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-hot-toast";

const { Dragger } = Upload;

export default function GalleryUploader({
  fileLists,
  setFileLists,
  onDeleteImage
}) {

  const beforeUpload = (file) => {

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP allowed");
      return Upload.LIST_IGNORE;
    }

    const isLt10MB = file.size / 1024 / 1024 < 10;

    if (!isLt10MB) {
      toast.error("Image must be smaller than 10MB");
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  const handleChange = ({ fileList }) => {
    setFileLists(fileList);
  };

  const removeImage = async (file) => {

    try {

      if (file.tdoc_id && onDeleteImage) {
        await onDeleteImage(file.tdoc_id);
      }

      const updated = fileLists.filter((f) => f.uid !== file.uid);
      setFileLists(updated);

    } catch (err) {
      toast.error("Failed to delete image");
    }

  };

  return (
    <div>

      <Dragger
        multiple
        accept="image/*"
        beforeUpload={beforeUpload}
        fileList={fileLists}
        showUploadList={false}
        onChange={handleChange}
        style={{ padding: 20 }}
      >

        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: 40, color: "#1677ff" }} />
        </p>

        <p className="ant-upload-text">
          Drag & Drop gallery images here
        </p>

        <p className="ant-upload-hint">
          Upload multiple images (JPG, PNG)
        </p>

      </Dragger>


      {fileLists.length > 0 && (

        <div className="gallery-preview-grid">

          {fileLists.map((file) => {

            const src =
              file.url ||
              (file.originFileObj
                ? URL.createObjectURL(file.originFileObj)
                : "");

            return (

              <div className="gallery-card" key={file.uid}>

                <Image
                  src={src}
                  width="100%"
                  height={120}
                  style={{
                    objectFit: "cover",
                    borderRadius: 6
                  }}
                />

                <div className="gallery-card-action">

                  <Popconfirm
                    title="Delete image?"
                    onConfirm={() => removeImage(file)}
                  >

                    <DeleteOutlined
                      style={{
                        color: "red",
                        fontSize: 16,
                        cursor: "pointer"
                      }}
                    />

                  </Popconfirm>

                </div>

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
}