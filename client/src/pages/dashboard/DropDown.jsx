// Dropdown.js
import React from 'react';
import Select from 'react-select';
import {useLoading} from '../../context/LoadingContext'
function Dropdown({ options, value, onChange, placeholder,label }) {
  return (
    <>
        <label htmlFor="exampleFormControlInput1" className="form-label">
          {label}
        </label>

        <Select
          value={value}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          menuPortalTarget={document.body}
        />

    </>
  );
}

export default Dropdown;
