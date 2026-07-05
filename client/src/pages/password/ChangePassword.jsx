import { useState } from 'react';
import { Toaster, toast } from "react-hot-toast";
import { changePasswordApi } from '../../services/User-service';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [error, setError] = useState('');

  const isStrongPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const validateFields = ({ old_password, new_password, confirm_password }) => {
    if (!old_password) return 'Old password is required.';
    if (!isStrongPassword(new_password)) {
      return 'New password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
    }
    if (new_password !== confirm_password) {
      return 'New password and confirm password do not match.';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      setError(validateFields(updated));
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateFields(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await changePasswordApi(formData);
      if (response.status === 1) {
        toast.success(response.message);
        setFormData({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
        setError('');
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <>
      {/* <div className="d-sm-flex d-block align-items-center justify-content-between page-header-breadcrumb">
        <h4 className="fw-medium mb-0">Change Password</h4>
        <div className="ms-sm-1 ms-0">
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a href="#">Activity</a></li>
              <li className="breadcrumb-item active" aria-current="page">Change Password</li>
            </ol>
          </nav>
        </div>
      </div> */}

      <div className="main-content app-content">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-md-12">
              <div className="card custom-card shadow">
                <div className="card-header">
                  <h5 className="card-title mb-0">Change Password</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row align-items-end">
                      <div className="col-md-3 mb-3">
                        <label className="form-label">Old Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="old_password"
                          value={formData.old_password}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="new_password"
                          value={formData.new_password}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="confirm_password"
                          value={formData.confirm_password}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-2 mb-3 d-grid">
                        <button type="submit" className="btn btn-primary">
                          Submit
                        </button>
                      </div>
                    </div>
                    {error && <div className="text-danger mb-3">{error}</div>}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}
