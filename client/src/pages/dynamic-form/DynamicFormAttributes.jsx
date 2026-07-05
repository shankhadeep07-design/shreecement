import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Form } from 'react-bootstrap';
import 'react-calendar/dist/Calendar.css';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import { AiTwotoneDelete } from "react-icons/ai";
import Multiselect from 'react-multiselect-dropdown-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import '../../assets/css/modal-custom.css';
import { dynamicFormEditApi, dynamicFormEditTabApi } from '../../Services/DynamicForm-service';
import { getMasterDetailsApi } from '../../Services/Master-service';
const DynamicFormAttributes = forwardRef(({ config, form_id, item_id, lastInsertedId, mode, user_id, form_short_name, onCompleteFormSubmit, onDateChange, projectDuration, onKeyUpHandler = null, budgetTotal, companyCode, category, table_name, column_name, is_type_form, onFirstColumnDataChange }, ref) => {
    /******** Define States ********/
    const navigate = useNavigate();
    const [manageDynamicForm, setManageDynamicForm] = useState([]);
    const [formStructure, setFormStructure] = useState([]);
    const [addMoreSections, setAddMoreSections] = useState({});
    const [formData, setFormData] = useState({});
    const [selectedOptions, setSelectedOptions] = useState({});
    const [preFilledData, setPreFilledData] = useState(null);
    const [selectedValue, setSelectedValue] = useState('');
    const [previousValue, setPreviousValue] = useState('');
    const [clickLastCount, setClickLastCount] = useState(0);
    const [clickFirstCount, setClickFirstCount] = useState(0);
    const [paramData, setParamData] = useState({});
    const [labels, setLabels] = useState({});
    let [parentValue, setParentValue] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [selectedGP, setSelectedGP] = useState(null);
    const [selectedVillage, setSelectedVillage] = useState(null);
    const [durations, setDurations] = useState(projectDuration);
    const [budgetTotalAmount, setBudgetTotalAmount] = useState(0);
    const [modeType, setModeType] = useState(mode);
    const [firstColumnData, setFirstColumnData] = useState(null);
    const [quillValue, setQuillValue] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [validationErrors, setValidationErrors] = useState({});
    /******** Using useEffect for rendering calling config function ********/
    useEffect(() => {
        // Set default values on component mount
        const insertedIdField = formStructure.find((el) => el.is_last_inserted_id);
        if (insertedIdField?.field_name) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [insertedIdField.field_name]: item_id || "",
            }));
        }

        const userIdFields = formStructure.filter((el) => el.is_user_id); // Find all fields with is_user_id true
        if (userIdFields.length > 0) {
            setFormData((prevFormData) => {
                const updatedFormData = { ...prevFormData };
                userIdFields.forEach((field) => {
                    if (field.field_name) {
                        updatedFormData[field.field_name] = user_id || "";
                    }
                });
                return updatedFormData;
            });
        }

        const budgetField = formStructure.find(el => el.is_budget_total_field);
        if (budgetField && budgetField.field_name) {
            formData[budgetField.field_name] = 0;
        }

        // let formOrderFields = formStructure.filter(el => el.form_order);
        // if (formOrderFields.length > 0) {
        //     setFormData((prevFormData) => {
        //         const updatedFormData = { ...prevFormData };
        //         formOrderFields.forEach((field) => {
        //             if (field.field_name) {
        //                 updatedFormData[field.field_name] = '0';
        //             }
        //         });
        //         return updatedFormData;
        //     });
        // }

        // const totalField = formStructure.find(el => el.is_total);
        // if (totalField && totalField.field_name) {
        //     setFormData((prevFormData) => ({
        //         ...prevFormData,
        //         [totalField.field_name]: '0',
        //     }));
        // }

    }, [formStructure]); // Run this effect when `formStructure` changes
    useEffect(() => {
        setModeType(() => mode);
        setBudgetTotalAmount(() => budgetTotal);
        setDurations(projectDuration);
    }, [modeType, budgetTotal, projectDuration, budgetTotalAmount])
    useEffect(() => {
        const editDynamicForm = async () => {
            try {
                if (item_id != '' && item_id != null) {
                    let preFilledDataResponse;
                    if (is_type_form === 'tab') {
                        preFilledDataResponse = await dynamicFormEditTabApi(table_name, column_name, item_id);
                        const getFirstValue = preFilledDataResponse.getfirstcolumndata[0];
                        setFirstColumnData(getFirstValue);
                        if (onFirstColumnDataChange) {
                            onFirstColumnDataChange(firstColumnData);
                        }
                    } else {
                        preFilledDataResponse = await dynamicFormEditApi(form_short_name, form_id, item_id);
                    }
                    const preFilledData = preFilledDataResponse.data[0];
                    setFormData(preFilledData);
                    const initialSections = {};
                    const generalSections = [];
                    const configWithPreFilledData = config.map((objFirst, indexFirst) => {
                        if (Array.isArray(objFirst.FormMasterDetailsModel)) {
                            let i = 0;
                            objFirst.FormMasterDetailsModel.forEach((objSecond, indexSecond) => {
                                if (objSecond.section_type === 'tabular') {
                                    if (Array.isArray(objSecond.form_structure) && objSecond.form_structure.length > 0) {
                                        objSecond.form_structure.forEach((objThird, indexThird) => {
                                            if (Array.isArray(objThird.field_name) && objThird.field_name.length > 0) {
                                                objThird.field_name.forEach((objFourth, indexThird) => {
                                                    getNameById(objFourth.field_name, objFourth.data_source, objFourth.options);
                                                    setFormStructure(objFourth);
                                                    generalSections[i] = objFourth;
                                                    i++;
                                                })
                                            }
                                        })
                                    }
                                }
                                if (objSecond.section_type === 'add_more') {
                                    const key = `${indexFirst}-${indexSecond}-${objSecond.form_structure[0].field_name}`;
                                    if (Array.isArray(objSecond.form_structure[0].json_fields) && objSecond.form_structure[0].json_fields.length > 0) {
                                        const newField = objSecond.form_structure[0].json_fields.reduce((acc, item) => {
                                            acc[item.field_name] = ''; // Initialize with empty string or default value
                                            return acc;
                                        }, {});
                                        initialSections[key] = [newField];
                                    }
                                }
                                if (objSecond.section_type === 'general') {
                                    if (Array.isArray(objSecond.form_structure) && objSecond.form_structure.length > 0) {
                                        objSecond.form_structure.forEach((objThird, indexThird) => {
                                            getNameById(objThird.field_name, objThird.data_source, objThird.options);
                                            if (objThird.sub_section_type === 'add_more') {
                                                if (Array.isArray(objThird.form_structure) && objThird.form_structure.length > 0) {
                                                    const key = `${indexFirst}-${indexSecond}-${indexThird}-${objSecond.section_name}`;
                                                    const newField = objThird.form_structure.reduce((acc, item) => {
                                                        item.field_name.forEach((field) => {
                                                            acc[field.field_name] = ''; // Initialize with empty string or default value
                                                        });
                                                        return acc;
                                                    }, {});
                                                    initialSections[key] = [newField];
                                                }
                                            }
                                            generalSections[i] = objThird;
                                            i++;
                                        })
                                    }
                                }
                            });
                        }
                        return objFirst;
                    });
                    setManageDynamicForm(configWithPreFilledData);
                    if (preFilledData && typeof preFilledData === 'object') {
                        Object.keys(preFilledData).forEach((mainKey) => {
                            const value = preFilledData[mainKey];
                            if (typeof value === 'object' && value !== null) {
                                Object.keys(value).forEach((key) => {
                                    if (Array.isArray(value[key])) {
                                        const addMoreArray = value[key];
                                        const addMoreSubArray = [];
                                        addMoreArray.forEach((obj, indexA) => {
                                            if (obj) {
                                                addMoreSubArray[indexA] = {};
                                                Object.keys(obj).forEach((propertyKey) => {
                                                    addMoreSubArray[indexA][propertyKey] = obj[propertyKey] || '';
                                                });
                                            }
                                        });
                                        initialSections[key] = addMoreSubArray;
                                    }
                                });
                            }
                        });
                    }
                    setFormStructure(generalSections);
                    setAddMoreSections(initialSections);
                } else {
                    setManageDynamicForm(config);
                    if (Array.isArray(config) && config.length > 0) {
                        const initialSections = {};
                        const generalSections = [];
                        config.forEach((objFirst, indexFirst) => {
                            if (Array.isArray(objFirst.FormMasterDetailsModel)) {
                                let i = 0;
                                objFirst.FormMasterDetailsModel.forEach((objSecond, indexSecond) => {
                                    if (objSecond.section_type === 'tabular') {
                                        if (Array.isArray(objSecond.form_structure) && objSecond.form_structure.length > 0) {
                                            objSecond.form_structure.forEach((objThird, indexThird) => {
                                                if (Array.isArray(objThird.field_name) && objThird.field_name.length > 0) {
                                                    objThird.field_name.forEach((objFourth, indexThird) => {
                                                        setFormStructure(objFourth);
                                                        generalSections[i] = objFourth;
                                                        i++;
                                                    })
                                                }
                                            })
                                        }
                                    }
                                    if (objSecond.section_type === 'add_more') {
                                        const key = `${indexFirst}-${indexSecond}-${objSecond.form_structure[0].field_name}`;
                                        if (Array.isArray(objSecond.form_structure[0].json_fields) && objSecond.form_structure[0].json_fields.length > 0) {
                                            const newField = objSecond.form_structure[0].json_fields.reduce((acc, item) => {
                                                acc[item.field_name] = ''; // Initialize with empty string or default value
                                                return acc;
                                            }, {});
                                            initialSections[key] = [newField]; // Initialize with one default row
                                        }
                                    }
                                    if (objSecond.section_type === 'general') {
                                        if (Array.isArray(objSecond.form_structure) && objSecond.form_structure.length > 0) {
                                            objSecond.form_structure.forEach((objThird, indexThird) => {
                                                setFormStructure(objThird.form_structure);
                                                if (objThird.sub_section_type === 'add_more') {
                                                    if (Array.isArray(objThird.form_structure) && objThird.form_structure.length > 0) {
                                                        const key = `${indexFirst}-${indexSecond}-${indexThird}-${objSecond.section_name}`;
                                                        const newField = objThird.form_structure.reduce((acc, item) => {
                                                            item.field_name.forEach((field) => {
                                                                acc[field.field_name] = ''; // Initialize with empty string or default value
                                                            });
                                                            return acc;
                                                        }, {});
                                                        initialSections[key] = [newField]; // Initialize with one default row
                                                    }
                                                }
                                                generalSections[i] = objThird;
                                                i++;
                                            })
                                        }
                                    }
                                });
                            }
                        });
                        setFormStructure(generalSections);
                        setAddMoreSections(initialSections);
                    }
                }
            }
            catch (error) {
                console.error('Error fetching edit data.', error)
            }
        }
        editDynamicForm();
    }, [config, item_id, preFilledData]);
    /******** Function to validate a field ********/
    const validateField = (value, element) => {
        if (element.required && !value) {
            return false;
        }
        return true;
    };
    /******** Using handle change funtion to update states for text, normal select dropdown, checkbox ********/
    const handleChange = (e, sectionKey, formOrder, sectionName = null, indexItem, isQuill = false, fieldId, onKeyUp = false, projectDuration) => {
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        const isDatePicker = e instanceof Date;
        if (isDatePicker) {
            const name = sectionName;  // Use sectionName or another way to identify the field
            const value = formatDate(e); // The date selected
            if (sectionKey) {
                setAddMoreSections((prevSections) => {
                    const newSections = { ...prevSections };
                    if (Array.isArray(newSections[sectionKey])) {
                        newSections[sectionKey][indexItem][name] = value;
                    }
                    return newSections;
                });
            } else {
                setFormData((prevFormData) => {
                    const newFormData = { ...prevFormData, [name]: value }
                    if (fieldId === 'start_date' || fieldId === 'end_date') {
                        onDateChange(fieldId, value);
                        const durationField = formStructure.find(el => el.is_duration_field);
                        if (durationField && durationField.field_name && durations) {
                            newFormData[durationField.field_name] = durations;
                        }
                    }
                    const companyCodeField = formStructure.find(el => el.is_company_code);
                    if (companyCodeField && companyCodeField.field_name) {
                        newFormData[companyCodeField.field_name] = 'OMCL (Odisha Mining Corp LTD)';
                    }
                    const categoryField = formStructure.find(el => el.is_category);
                    if (categoryField && categoryField.field_name) {
                        newFormData[categoryField.field_name] = 'Contribution';
                    }
                    return newFormData;
                });
            }
        } else if (isQuill) {
            const name = sectionName;  // Use sectionName or another way to identify the field
            const value = e; // ReactQuill returns the value directly
            if (sectionKey) {
                setAddMoreSections((prevSections) => {
                    const newSections = { ...prevSections };
                    if (Array.isArray(newSections[sectionKey])) {
                        newSections[sectionKey][indexItem][name] = value;
                    }
                    return newSections;
                });
            } else {
                setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
            }
            setQuillValue(value);
        } else if (e.target.type === 'file') {
            const { name, files } = e.target;
            const file = files[0]; // Assuming single file upload, handle multiple files if needed
            if (sectionKey) {
                setAddMoreSections((prevSections) => {
                    const newSections = { ...prevSections };
                    if (Array.isArray(newSections[sectionKey])) {
                        newSections[sectionKey][indexItem][name] = file;
                    }
                    return newSections;
                });
            } else {
                setFormData((prevFormData) => ({ ...prevFormData, [name]: file }));
            }
        } else {
            const { name, value, type, checked } = e.target;
            // Check if the field type is text and it's being handled on key up
            if (type === 'text' && onKeyUp === true) {
                // Update the form data first
                const updatedFormData = {
                    ...formData, // Spread the current state 
                    [name]: value // Update the field with the new value
                };
                // Calculate the sum of all fields with `is_add: true`
                const sum = formStructure
                    .filter((field) => field.is_add && field.field_type === 'text' && field.form_order === formOrder) // Filter the `is_add` fields
                    .reduce((acc, field) => {
                        const fieldValue = parseFloat(updatedFormData[field.field_name]) || 0; // Get the current value
                        return acc + fieldValue; // Add it to the accumulator
                    }, 0);
            

                let formOrderFields = formStructure.filter(el => el.form_order);

                if (formOrderFields.length > 0) {
                    formOrderFields.forEach((field) => {
                        if (field.form_order === formOrder) {
                          
                            const totalField = formStructure.find(el => el.form_order === formOrder && el.is_total);
                       
                            formData[totalField.field_name] = sum.toFixed(2) || 0;
                        }
                    });
                }
            }
            // if (type === 'text' && onKeyUp === true && onKeyUpHandler) {
            //     onKeyUpHandler(fieldId, value);
            // }
            const updateField = (fieldName, fieldValue) => {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    [fieldName]: fieldValue,
                }));

            };
            if (sectionKey) {
                setAddMoreSections((prevSections) => {
                    const newSections = { ...prevSections };
                    if (Array.isArray(newSections[sectionKey])) {
                        newSections[sectionKey][indexItem][name] = value;
                    }
                    return newSections;
                })
            } else {
                updateField(name, type === 'checkbox' ? e.target.checked : value);
            }
        }
    }
    /******** Using handle select change funtion to update states for select2 dropdown ********/
    const handleSelectChange = (selectedOption, actionMeta, sectionKey, indexItem) => {
        const { name } = actionMeta;

        setSelectedValue(selectedOption.value);
        setParentValue(selectedOption.value);
        if (sectionKey) {
            setAddMoreSections((prevSections) => {
                const newSections = { ...prevSections };
                if (Array.isArray(newSections[sectionKey])) {
                    newSections[sectionKey][indexItem][name] = { value: selectedOption.value !== '' ? selectedOption.value : '', label: selectedOption.label !== '' ? selectedOption.label : '' };
                }
                return newSections;
            })
        } else {
            setFormData((prevFormData) => ({ ...prevFormData, [name]: { value: selectedOption.value !== '' ? selectedOption.value : '', label: selectedOption.label !== '' ? selectedOption.label : '' } }))
            const toggleOnlyField = formStructure.find(el => el.toggle);
            if (toggleOnlyField && toggleOnlyField.field_name) {
                setFormStructure((prevStructure) => {
                    const newStructure = [...prevStructure];
                    const readOnlyFieldIndex = newStructure.findIndex(el => el.read_only !== undefined && el.toggle !== true); // Find any field with 'read_only'
                    const toggleOnlyFieldIndex = newStructure.findIndex(el => el.toggle !== undefined);

                    if (readOnlyFieldIndex !== -1) {
                        const readOnlyField = newStructure[readOnlyFieldIndex];
                        // Explicitly set 'read_only' based on selectedOption.readOnly
                        readOnlyField.read_only = selectedOption.readOnly;
                       
                    }
                    return newStructure;
                });
            }
            
        }
    }
    /******** Function to handle data fetching when select is clicked ********/
    const handleSelectClick = async (field_name, field_name_is_dependent, data_source, is_dependent, dependent_on, dependent_position, options, sectionKey, index) => {
        if (!previousValue) {
            setPreviousValue(data_source);
        }
        if (dependent_on === 'district') { // Block depends on District
            parentValue = selectedDistrict;
        } else if (dependent_on === 'block') { // GP depends on Block
            parentValue = selectedBlock;
        } else if (dependent_on === 'grampanchayat') { // Village depends on GP
            parentValue = selectedGP;
        }
        if (data_source === 'default' && !selectedOptions[field_name]) {
            const response = JSON.parse(JSON.stringify(options)) || [];
            setSelectedOptions((prevOptions) => ({ ...prevOptions, [field_name]: response }))
        }
        else if (data_source !== 'default') {
            if (dependent_position !== 'last') {
                setClickLastCount(0);
                if (previousValue === data_source) {
                    setClickFirstCount(0);
                }
                setClickFirstCount((prevCount) => prevCount + 1);
                let param = {
                    field_name_is_dependent,
                    is_dependent,
                    dependent_on,
                    selected_value: selectedValue,
                    parent_value: (parentValue === null) ? parentValue : selectedValue
                };
                try {
                    const response = await getMasterDetailsApi(param, data_source);
                    setSelectedOptions((prevOptions) => ({
                        ...prevOptions, [field_name]: response.data.map(data => ({
                            value: data.value,
                            label: data.label
                        }))
                    }))
                } catch (error) {
                }
                if (data_source === 'districts') {
                    setSelectedDistrict(selectedValue); // Update District
                } else if (data_source === 'blocks') {
                    setSelectedBlock(selectedValue); // Update Block
                } else if (data_source === 'grampanchyats') {
                    setSelectedGP(selectedValue); // Update GP
                } else if (data_source === 'villages') {
                    setSelectedVillage(selectedValue); // Update Village
                }
            }
            if (dependent_position === 'last') {
                setClickLastCount(prevCount => prevCount + 1);
                if (clickLastCount === 0) {
                    let param = {
                        field_name_is_dependent,
                        is_dependent,
                        dependent_on,
                        selected_value: selectedValue,
                        selected_previous_value: previousValue,
                    };
                    try {
                        const response = await getMasterDetailsApi(param, data_source);
                        setSelectedOptions((prevOptions) => ({
                            ...prevOptions, [field_name]: response.data.map(data => ({
                                value: data.value,
                                label: data.label
                            }))
                        }))
                    } catch (error) {
                    }
                }
            }
        }
    }
    /********* Using Add More Function **********/
    const addMoreFields = (key, formStructure) => {
        setAddMoreSections((previousSections) => {
            const newSection = { ...previousSections };
            const newField = formStructure.json_fields.reduce((acc, item) => {
                acc[item.field_name] = ''; // Initialize with empty string or default value
                return acc;
            }, {});
            if (!newSection[key]) {
                newSection[key] = [];
            }
            newSection[key] = (newSection[key] || []).concat(newField);
            return newSection;
        })
    }
    /********** Using Remove Add More Function ********/
    const removeAddMoreFields = (sectionKey, itemIndex) => {
        setAddMoreSections((prevSections) => {
            const newSection = { ...prevSections };
            if (Array.isArray(newSection[sectionKey])) {
                newSection[sectionKey] = newSection[sectionKey].filter((_, i) => (i) !== itemIndex)
            }
            return newSection;
        })
    }
    /***************** Get Name By Id ***************/
    const getNameById = async (field_name, dataSource, options) => {
        let param = {
            is_dependent: 'false',
            selected_value: '',
        };
        if (dataSource != undefined && dataSource != "default") {
            try {
                const response = await getMasterDetailsApi(param, dataSource);
                setLabels((prevOptions) => ({
                    ...prevOptions, [field_name]: response.data.map(data => ({
                        value: data.value,
                        label: data.label
                    }))
                }))
            } catch (error) {
            }
        }
        if (dataSource != undefined && dataSource == "default") {
            try {
                const response = JSON.parse(JSON.stringify(options)) || [];
                setLabels((prevOptions) => ({ ...prevOptions, [field_name]: response }))
            } catch (error) {
            }
        }
    };
    /******** Using render element funtion to render dynamic form elements ********/
    const renderElement = (element, formStructure, index, sectionKey = null, sectionType = null, user_id, projectDuration, budgetTotalAmount, modeType) => {
        
        const getDataValue = () => {
            if (Array.isArray(addMoreSections[sectionKey])) {
                return element.field_name && addMoreSections[sectionKey][index] && addMoreSections[sectionKey][index][element.field_name]
                    ? addMoreSections[sectionKey][index][element.field_name]
                    : '';
            } else {
                return formData && element.field_name ? formData[element.field_name] || null : null;
            }
        };
        const dataValue = getDataValue();
        
        const isValid = !validationErrors[element.field_name];
        let inputClass = '';
        if (sectionType === 'general' || sectionType === 'tabular') {
            inputClass = isValid ? "form-control" : "form-control is-invalid";
        } else {
            inputClass = isValid ? "form-control form-control-sm" : "form-control is-invalid";
        }

        if (element.is_duration_field) {
            if (dataValue) {
                return (
                    <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                        <input type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} value={dataValue} readOnly={element.read_only} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index, null, null, null, dataValue)} />
                        {!isValid && <div className="text-danger">{element.message}</div>}
                    </div>
                )
            } else {
                return (
                    <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                        <input type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} value={projectDuration} readOnly={element.read_only} onChange={(e) =>
                            handleChange(e, sectionKey, element.sectionName, index, null, null, null, projectDuration)} />
                        {!isValid && <div className="text-danger">{element.message}</div>}
                    </div>
                )
            }
        }
        if (element.is_budget_total_field) {
            if (dataValue && budgetTotalAmount === undefined) {
                return (
                    <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                        <input type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} value={dataValue} readOnly={element.read_only} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index, null, null, null, dataValue)} />
                        {!isValid && <div className="text-danger">{element.message}</div>}
                    </div>
                )
            } else if (!dataValue && budgetTotalAmount !== undefined) {
                return (
                    <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                        <input type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} value={budgetTotalAmount} readOnly={element.read_only} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index, null, null, budgetTotalAmount)} />
                        {!isValid && <div className="text-danger">{element.message}</div>}
                    </div>
                )
            }
        }
        if (element.is_company_code) {
            return (
                <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                    <input type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} value={companyCode} readOnly={element.read_only} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} />
                    {!isValid && <div className="text-danger">{element.message}</div>}
                </div>
            )
        }
        if (element.is_last_inserted_id) {
            return (
                <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                    <input type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} value={dataValue} readOnly={element.read_only} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index, null, null, null, lastInsertedId)} />
                    {!isValid && <div className="text-danger">{element.message}</div>}
                </div>
            )
        }
        if (element.is_total) {
            return (
                <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                    <input type={element.field_type} className={`${inputClass} ${modeType === 'view' || element.read_only ? 'fade-color' : ''}`} name={element.field_name} placeholder={element.placeholder} value={dataValue} readOnly={element.read_only} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index, null, null, null, lastInsertedId)} />
                    {!isValid && <div className="text-danger">{element.message}</div>}
                </div>
            )
        }
        if (element.field_type === 'label') {
            if (element.sectionName === 'general_add_more') {
                if (element.labelName === 'label_add_more') {
                    return (
                        <span key={element.label}><strong>{element.label}</strong></span>
                    );
                }
            } else {
                if (sectionType === 'general') {
                    return (
                        <div className={`py-0 fw-semi-bold ${element.field_width ? 'col-' + element.field_width : 'col-3'}`} key={element.label}>
                            <span key={element.label}><strong>{element.label}</strong></span>
                            {element.required}{element.required && element.required === true ? (<span className='text-danger'>*</span>) : null}
                        </div>
                    );
                } else {
                    return (
                        <div className={`py-0 fw-semi-bold ${element.field_width ? 'col-' + element.field_width : 'col-3'}`} key={element.label}>
                            <span key={element.label}><strong>{element.label}</strong></span>
                            {element.required}{element.required && element.required === true ? (<span className='text-danger'>*</span>) : null}
                        </div>
                    );
                }
            }
        } else if (element.field_type === 'sub-header') {
            return (
                <hr style={{ border: '1px solid black' }}></hr>
            );
        } else if (element.field_type === 'text') {
            if (element.sectionName === 'general_add_more') {
                if (sectionType === 'general') {
                    if (element.itemIndex !== 0) {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <input type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} value={dataValue} readOnly={element.read_only} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} />
                                </div>
                                <div className="col-2">
                                    <AiTwotoneDelete style={{ color: 'red' }} onClick={() => removeAddMoreFields(element.sectionKey, element.itemIndex)} />
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <input type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} value={dataValue} readOnly={element.read_only} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} />
                                </div>
                            </div>
                        );
                    }
                } else {
                    return (
                        <input type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} value={dataValue} readOnly={element.read_only} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} />
                    )
                }
            } else {
                if (sectionType === 'general' || sectionType === 'tabular') {
                    return (
                        <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                            <input
                                type={element.field_type}
                                className={`${inputClass} ${modeType === 'view' || element.read_only ? 'fade-color' : ''}`}
                                name={element.field_name}
                                placeholder={element.placeholder}
                                value={dataValue || ""}
                                readOnly={modeType === 'view' ? true : element.read_only}
                                onChange={(e) => {
                                    if (element.is_number) {
                                        const regex = /^\d*\.?\d*$/;
                                        // const regex = /^[0-9]*$/; // Only allow numeric values
                                        if (!regex.test(e.target.value)) {
                                            return; // Prevent non-numeric input
                                        }
                                    }
                                    handleChange(e, sectionKey, element.formOrder, element.sectionName, index);
                                }}
                                onKeyUp={(e) => handleChange(e, sectionKey, element.formOrder, element.sectionName, index, null, element.field_id, true)}
                            />
                            {!isValid && <div className="text-danger">{element.message}</div>}
                        </div>
                    )
                } else {
                    return (
                        // <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                        <>
                            <input
                                type={element.field_type}
                                className={`${inputClass} ${element.modeType === 'view' || element.read_only ? 'fade-color' : ''}`}
                                name={element.field_name}
                                placeholder={element.placeholder}
                                value={dataValue || ""}
                                readOnly={element.modeType === 'view' ? true : element.read_only}
                                onChange={(e) => {
                                    if (element.is_number) {
                                        const regex = /^\d*\.?\d*$/;
                                        // const regex = /^[0-9]*$/; // Only allow numeric values
                                        if (!regex.test(e.target.value)) {
                                            return; // Prevent non-numeric input
                                        }
                                    }
                                    handleChange(e, sectionKey, element.formOrder, element.sectionName, index);
                                }}
                                onKeyUp={(e) => handleChange(e, sectionKey, element.formOrder,

                                    element.sectionName, index, null, element.field_id, true)}
                            />
                            {!isValid && <div className="text-danger">{element.message}</div>}
                        </>
                        // </div>
                    )
                }
            }
        } else if (element.field_type === 'hidden') {
            if (element.sectionName === 'general_add_more') {
                if (sectionType === 'general') {
                    if (element.itemIndex !== 0) {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <input type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} value={dataValue} readOnly={element.read_only} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} />
                                </div>
                                <div className="col-2">
                                    <AiTwotoneDelete style={{ color: 'red' }} onClick={() => removeAddMoreFields(element.sectionKey, element.itemIndex)} />
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <input type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} value={dataValue} readOnly={element.read_only} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} />
                                </div>
                            </div>
                        );
                    }
                } else {
                    return (
                        <input type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} value={dataValue} readOnly={element.read_only} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} />
                    )
                }
            } else {
                if (sectionType === 'general') {
                    return (
                        <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                            <input type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} defaultValue={user_id} readOnly={element.read_only} />
                            {!isValid && <div className="text-danger">{element.message}</div>}
                        </div>
                    )
                } else {
                    return (
                        <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                            <input type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} defaultValue={user_id} readOnly={element.read_only} />
                            {!isValid && <div className="text-danger">{element.message}</div>}
                        </div>
                    )
                }
            }
        } else if (element.field_type === 'textarea') {
            if (element.sectionName === 'general_add_more') {
                if (sectionType === 'general') {
                    if (element.itemIndex !== 0) {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <textarea name={element.field_name} className={inputClass} id={element.field_name} placeholder={element.field_placeholder} value={dataValue} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)}></textarea>
                                </div>
                                <div className="col-2">
                                    <AiTwotoneDelete style={{ color: 'red' }} onClick={() => removeAddMoreFields(element.sectionKey, element.itemIndex)} />
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <textarea name={element.field_name} className={inputClass} id={element.field_name} placeholder={element.field_placeholder} value={dataValue} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)}></textarea>
                                </div>
                            </div>
                        );
                    }
                } else {
                    return (
                        <textarea name={element.field_name} className={inputClass} id={element.field_name} placeholder={element.field_placeholder} value={dataValue} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)}></textarea>
                    )
                }
            } else {
                if (sectionType === 'general') {
                    if (element.is_textarea === 'true') {
                        return (
                            <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                                <ReactQuill theme="snow" name={element.field_name} id={element.field_name} placeholder={element.field_placeholder} value={dataValue} onChange={(e) => handleChange(e, sectionKey, element.field_name, index, true)} />
                                {/* <ReactQuill theme="snow" name={element.field_name} id={element.field_name} placeholder={element.field_placeholder} value={quillValue} onChange={(e) => handleChange(e, sectionKey, element.field_name, index, true)} /> */}
                                {/* <ReactQuill theme="snow" value={value} onChange={setValue} /> */}
                            </div>
                        )
                    } else {
                        return (
                            <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                                <textarea name={element.field_name} className={`${inputClass} ${modeType === 'view' || element.read_only ? 'fade-color' : ''}`} readOnly={modeType === 'view' ? true : element.read_only} id={element.field_name} placeholder={element.field_placeholder} value={dataValue} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)}></textarea>
                                {!isValid && <div className="text-danger">{element.message}</div>}
                            </div>
                        )
                    }
                } else {
                    if (element.is_textarea === 'true') {
                        return (
                            <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                                <ReactQuill theme="snow" name={element.field_name} id={element.field_name} placeholder={element.field_placeholder} value={quillValue} onChange={(e) => handleChange(e, sectionKey, element.field_name, index, true)} />
                                {/* <ReactQuill theme="snow" value={value} onChange={setValue} /> */}
                            </div>
                        )
                    } else {
                        return (
                            <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                                <textarea name={element.field_name} className={`${inputClass} ${element.modeType === 'view' || element.read_only ? 'fade-color' : ''}`} readOnly={element.modeType === 'view' ? true : element.read_only} id={element.field_name} placeholder={element.field_placeholder} value={dataValue} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)}></textarea>
                                {!isValid && <div className="text-danger">{element.message}</div>}
                            </div>
                        )
                    }
                }
            }
        } else if (element.field_type === 'date') {
            if (element.sectionName === 'general_add_more') {
                if (sectionType === 'general') {
                    if (element.itemIndex !== 0) {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <DatePicker type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} value={dataValue} selected={startDate} />
                                </div>
                                <div className="col-2">
                                    <AiTwotoneDelete style={{ color: 'red' }} onClick={() => removeAddMoreFields(element.sectionKey, element.itemIndex)} />
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <DatePicker type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} value={dataValue} selected={startDate} />
                                </div>
                            </div>
                        );
                    }
                } else {
                    return (
                        <DatePicker type={element.field_type} className={inputClass} name={element.field_name} placeholder={element.placeholder} value={dataValue} selected={startDate} />
                    )
                }
            } else {
                if (sectionType === 'general') {
                    return (
                        <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                            <DatePicker type={element.field_type} className={`${inputClass} ${modeType === 'view' || element.read_only ? 'fade-color' : ''}`} name={element.field_name} id={element.field_id} placeholder={element.placeholder} value={dataValue} selected={startDate} onChange={(e) => {
                                if (modeType !== 'view') {
                                    handleChange(e, sectionKey, element.formOrder, element.field_name, index, false, element.field_id)
                                }
                            }}
                                readOnly={modeType === 'view'} // Make the DatePicker read-only in view mode
                                disabled={modeType === 'view'} // Disable the DatePicker in view mode
                            />
                            {!isValid && <div className="text-danger">{element.message}</div>}
                        </div>
                    )
                } else {
                    return (
                        // <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                        <>
                            <DatePicker type={element.field_type} className={`${inputClass} ${element.modeType === 'view' || element.read_only ? 'fade-color' : ''}`} name={element.field_name} id={element.field_id} placeholder={element.placeholder} value={dataValue} selected={startDate}
                                onChange={(e) => {
                                    if (element.modeType !== 'view') {
                                        handleChange(e, sectionKey, element.formOrder, element.field_name, index, false, element.field_id)
                                    }
                                }}
                                readOnly={element.modeType === 'view'} // Make the DatePicker read-only in view mode
                                disabled={element.modeType === 'view'} // Disable the DatePicker in view mode
                            />
                            {!isValid && <div className="text-danger">{element.message}</div>}
                        </>
                        // </div>
                    )
                }
            }
        } else if (element.field_type === 'select') {
            if (element.sectionName === 'general_add_more') {
                if (sectionType === 'general') {
                    if (element.itemIndex !== 0) {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <div className="row" style={{ margin: '10px' }}>
                                        <div className="col-12">
                                            <Select
                                                name={element.field_name}
                                                id={element.field_name}
                                                options={selectedOptions[element.field_name] || []}
                                                onFocus={() => handleSelectClick(element.field_name, element.data_source, element.options, sectionKey, index)}
                                                onChange={(selectedOption, actionMeta) => handleSelectChange(selectedOption, actionMeta, sectionKey, index)}
                                                value={{ value: dataValue, label: dataValue }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-2">
                                    <AiTwotoneDelete style={{ color: 'red' }} onClick={() => removeAddMoreFields(element.sectionKey, element.itemIndex)} />
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <div className="row" style={{ margin: '10px' }}>
                                        <div className="col-12">
                                            <Select
                                                name={element.field_name}
                                                id={element.field_name}
                                                options={selectedOptions[element.field_name] || []}
                                                onFocus={() => handleSelectClick(element.field_name, element.data_source, element.options, sectionKey, index)}
                                                onChange={(selectedOption, actionMeta) => handleSelectChange(selectedOption, actionMeta, sectionKey, index)}
                                                value={{ value: dataValue, label: dataValue }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                } else {
                    return (
                        <Select
                            name={element.field_name}
                            id={element.field_name}
                            options={selectedOptions[element.field_name] || []}
                            onFocus={() => handleSelectClick(element.field_name, element.data_source, element.options, sectionKey, index)}
                            onChange={(selectedOption, actionMeta) => handleSelectChange(selectedOption, actionMeta, sectionKey, index)}
                            value={{ value: dataValue, label: dataValue }}
                        />
                    )
                }
            } else {
                if (sectionType === 'general' || sectionType === 'tabular') {
                    return (
                        <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                            <Select
                                name={element.field_name}
                                id={element.field_name}
                                options={selectedOptions[element.field_name] || []}
                                onMenuOpen={() => {
                                    if (modeType !== 'view' || element.read_only !== true) {
                                        handleSelectClick(element.field_name, element.field_name_is_dependent, element.data_source, element.is_dependent, element.dependent_on, element.dependent_position, element.options, sectionKey, index)
                                    }
                                }}
                                onChange={(selectedOption, actionMeta) => {
                                    if (modeType !== 'view' || element.read_only !== true) {
                                        handleSelectChange(selectedOption, actionMeta, sectionKey, index)
                                    }
                                }}
                                value={{
                                    value: formData?.[element.field_name]?.value ||
                                        labels?.[element.field_name]?.find(option => option.value === dataValue)?.value || null, // Use the stored value
                                    label: formData?.[element.field_name]?.label ||
                                        labels?.[element.field_name]?.find(option => option.value === dataValue)?.label || null  // Use the stored label
                                }}
                                className={inputClass}
                                isDisabled={modeType === 'view' || element.read_only === true}
                            />
                            {!isValid && <div className="text-danger">{element.message}</div>}
                        </div>
                    )
                } else {
                    return (
                        <>
                            {/* <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}> */}
                            <Select
                                name={element.field_name}
                                id={element.field_name}
                                options={selectedOptions[element.field_name] || []}
                                onMenuOpen={() => {
                                    if (element.modeType !== 'view') {
                                        handleSelectClick(element.field_name, element.field_name_is_dependent, element.data_source, element.is_dependent, element.dependent_on, element.dependent_position, element.options, sectionKey, index)
                                    }
                                }}
                                onChange={(selectedOption, actionMeta) => {
                                    if (element.modeType !== 'view') {
                                        handleSelectChange(selectedOption, actionMeta, sectionKey, index)
                                    }
                                }}
                                value={{
                                    value: addMoreSections?.[sectionKey]?.[index]?.[element.field_name]?.value || '',
                                    label: addMoreSections?.[sectionKey]?.[index]?.[element.field_name]?.label || ''
                                }}
                                className={inputClass}
                                isDisabled={element.modeType === 'view'}
                            />
                            {!isValid && <div className="text-danger">{element.message}</div>}
                            {/* </div> */}
                            {/* <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}> */}
                            {/* <Select
                                name={element.field_name}
                                id={element.field_name}
                                options={selectedOptions[element.field_name] || []}
                                onFocus={() => {
                                    handleSelectClick(element.field_name, element.data_source, element.options, sectionKey, index)
                                }}
                                onChange={(selectedOption, actionMeta) => handleSelectChange(selectedOption, actionMeta, sectionKey, index)}
                                value={{
                                    value: formData[element.field_name]?.value || selectedValue, // Use the stored value
                                    label: formData[element.field_name]?.label || selectedOptions[element.field_name]?.find(option => option.value === selectedOptions[element.field_name]?.label)  // Use the stored label
                                }}
                                className={inputClass}
                            />
                            {!isValid && <div className="text-danger">{element.message}</div>} */}
                            {/* </div> */}
                        </>
                    )
                }
            }
        } else if (element.field_type === 'multiselect') {
            if (element.sectionName === 'general_add_more') {
                if (sectionType === 'general') {
                    if (element.itemIndex !== 0) {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <div className="row" style={{ margin: '10px' }}>
                                        <div className="col-12">
                                            <Multiselect
                                                name={element.field_name}
                                                id={element.field_name}
                                                options={selectedOptions[element.field_name] || []}
                                                onFocus={() => handleSelectClick(element.field_name, element.data_source, element.options, sectionKey, index)}
                                                onChange={(selectedOption, actionMeta) => handleSelectChange(selectedOption, actionMeta, sectionKey, index)}
                                                value={{ value: dataValue, label: dataValue }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-2">
                                    <AiTwotoneDelete style={{ color: 'red' }} onClick={() => removeAddMoreFields(element.sectionKey, element.itemIndex)} />
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <div className="row" style={{ margin: '10px' }}>
                                        <div className="col-12">
                                            <Multiselect
                                                name={element.field_name}
                                                id={element.field_name}
                                                options={selectedOptions[element.field_name] || []}
                                                onFocus={() => handleSelectClick(element.field_name, element.data_source, element.options, sectionKey, index)}
                                                onChange={(selectedOption, actionMeta) => handleSelectChange(selectedOption, actionMeta, sectionKey, index)}
                                                value={{ value: dataValue, label: dataValue }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                } else {
                    return (
                        <Multiselect
                            name={element.field_name}
                            id={element.field_name}
                            options={selectedOptions[element.field_name] || []}
                            onFocus={() => handleSelectClick(element.field_name, element.data_source, element.options, sectionKey, index)}
                            onChange={(selectedOption, actionMeta) => handleSelectChange(selectedOption, actionMeta, sectionKey, index)}
                            value={{ value: dataValue, label: dataValue }}
                        />
                    )
                }
            } else {
                if (sectionType === 'general') {
                    return (
                        <div className={`${element.field_width ? 'col-' + element.field_width : 'col-3'} py-0`}>
                            <Multiselect
                                name={element.field_name}
                                id={element.field_name}
                                options={selectedOptions[element.field_name] || []}
                                onFocus={() => handleSelectClick(element.field_name, element.data_source, element.options, sectionKey, index, dataValue)}
                                onChange={(selectedOption, actionMeta) => handleSelectChange(selectedOption, actionMeta, sectionKey, index)}
                                value={{ value: dataValue, label: dataValue }}
                            />
                        </div>
                    )
                } else {
                    return (
                        <Multiselect
                            name={element.field_name}
                            id={element.field_name}
                            options={selectedOptions[element.field_name] || []}
                            onFocus={() => handleSelectClick(element.field_name, element.data_source, element.options, sectionKey, index, dataValue)}
                            onChange={(selectedOption, actionMeta) => handleSelectChange(selectedOption, actionMeta, sectionKey, index)}
                            value={{ value: dataValue, label: dataValue }}
                        />
                    )
                }
            }
        } else if (element.field_type === 'checkbox') {
            const isChecked = preFilledData && preFilledData[element.field_name] !== undefined ? preFilledData[element.field_name] : null;
            if (element.sectionName === 'general_add_more') {
                if (sectionType === 'general') {
                    if (element.itemIndex !== 0) {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <div className="row" style={{ margin: '10px' }}>
                                        <div className="col-12">
                                            <input type={element.field_type} name={element.field_name} id={element.field_type} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} checked={dataValue} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-2">
                                    <AiTwotoneDelete style={{ color: 'red' }} onClick={() => removeAddMoreFields(element.sectionKey, element.itemIndex)} />
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <div className="row" style={{ margin: '10px' }}>
                                        <div className="col-12">
                                            <input type={element.field_type} name={element.field_name} id={element.field_type} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} checked={dataValue} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                } else {
                    return (
                        <input type={element.field_type} name={element.field_name} id={element.field_type} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} checked={dataValue} />
                    )
                }
            } else {
                if (sectionType === 'general') {
                    return (
                        <div className={`py-0 fw-semi-bold ${element.field_width ? 'col-' + element.field_width : 'col-3'}`} key={element.label}><input type={element.field_type} name={element.field_name} id={element.field_type} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} checked={dataValue} /></div>
                    );
                } else {
                    return (
                        <input type={element.field_type} name={element.field_name} id={element.field_type} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} checked={dataValue} />
                    )
                }
            }
        } else if (element.field_type === 'file') {
            if (element.sectionName === 'general_add_more') {
                if (sectionType === 'general') {
                    if (element.itemIndex !== 0) {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <div className="row" style={{ margin: '10px' }}>
                                        <div className="col-12">
                                            <input type="file" className={inputClass} name={element.field_name} id={element.field_name} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-2">
                                    <AiTwotoneDelete style={{ color: 'red' }} onClick={() => removeAddMoreFields(element.sectionKey, element.itemIndex)} />
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div className="row" style={{ margin: '10px' }}>
                                <div className="col-10">
                                    <div className="row" style={{ margin: '10px' }}>
                                        <div className="col-12">
                                            <input type="file" className={inputClass} name={element.field_name} id={element.field_name} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                } else {
                    return (
                        <input type="file" className={inputClass} name={element.field_name} id={element.field_name} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} />
                    )
                }
            } else {
                if (sectionType === 'general') {
                    return (
                        <div className="col-3 py-0 fw-semi-bold" key={element.label}><input type="file" className={inputClass} name={element.field_name} id={element.field_name} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} /></div>
                    );
                } else {
                    return (
                        <input type="file" className={inputClass} name={element.field_name} id={element.field_name} onChange={(e) => handleChange(e, sectionKey, element.sectionName, index)} />
                    );
                }
            }
        } else if (element.field_type === 'icon') {
            if (element.itemIndex !== 0 && element.modeType !== 'view') {
                return (<AiTwotoneDelete style={{ color: 'red' }} onClick={() => removeAddMoreFields(element.sectionKey, element.itemIndex)} />)
            }
        }
        else {
            return null;
        }
    };
    /************* Final Submit ***********/
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const errors = {};
        const formDataObject = new FormData();
        (formStructure || []).reduce((acc, element) => {
            const key = element.field_name;
            if (!key) {
                return acc; // Skip this iteration if key is null or undefined
            }
            const value = formData?.[key]?.value ?? formData?.[key] ?? '';
            // const value = formData[key]?.value ?? formData[key] ?? '';
            const isValid = validateField(value, element);
            if (!isValid) {
                errors[key] = 'This field is required'; // Add a suitable error message
            }
            return acc;
        }, {});
        setValidationErrors(errors);
        if (Object.keys(errors).length === 0) {
            if (formData && typeof formData === 'object') {
                Object.keys(formData).forEach(key => {
                    if (typeof formData[key] === 'object' && formData[key] instanceof File) {
                        const appendValue = formData[key].value !== undefined ? formData[key].value : '';
                        if (appendValue) formDataObject.append(key, appendValue); // Append only if valid
                    } else {
                        if (typeof formData[key] === 'object' && formData[key] !== null && 'value' in formData[key]) {
                            const appendValue = formData[key].value !== undefined ? formData[key].value : '';
                            if (appendValue) formDataObject.append(key, appendValue); // Append only if valid
                        } else {
                            const appendValue = (formData[key] !== undefined && formData[key] !== null) ? formData[key] : '';
                            if (appendValue && typeof appendValue !== 'object') formDataObject.append(key, appendValue); // Append only if valid
                        }
                    }
                });
            }
            let finalData = {}; // This will hold the final structure
            if (addMoreSections && typeof addMoreSections === 'object') {
                
                Object.keys(addMoreSections).forEach(key => {
                    const sectionKey = key; // Use the full key
                    let sectionArray = [];
                    let hasFile = false;
                    addMoreSections[key].forEach((item, index) => {
                        let itemObject = { ...item }; // Shallow copy of the item object
                        if (item.file_doc instanceof File) {
                            itemObject.file_icon = item.file_doc.name; // or handle the file as needed
                            formDataObject.append(`file_${sectionKey}_[]`, item.file_doc);
                            hasFile = true;
                        }
                        sectionArray.push(itemObject);
                    });
                    if (hasFile || sectionArray.some(item => Object.values(item).some(value => value !== ""))) {
                        finalData[sectionKey] = sectionArray;
                    }
                });
            }
            if (Object.keys(finalData).length === 0) {
                console.error("No valid data to send");
            } else {
                Object.keys(finalData).forEach(sectionKey => {
                    const key = sectionKey.split('-').pop();
                    if (Array.isArray(finalData[sectionKey]) && finalData[sectionKey].length > 0) {
                        formDataObject.append(key, JSON.stringify({ [sectionKey]: finalData[sectionKey] }));
                    }
                });
            }
            if (Array.isArray(config)) {
                if (item_id !== '') {
                    if (is_type_form === 'tab') {
                        formDataObject.append('table_name', table_name);
                        formDataObject.append('column_name', column_name);
                        formDataObject.append('form_type', is_type_form);
                    }
                    formDataObject.append('tcon_id[0][0]', item_id);
                }
                formDataObject.append('tcon_form_id', config[0]?.id);
            }
            onCompleteFormSubmit(formDataObject);
        }
    };
    useImperativeHandle(ref, () => ({
        submitForm: () => {
            handleSubmit();
        }
    }));
    /******** Using render section funtion to render dynamic form ********/
    const renderSection = (section) => {
        return (
            <Form encType="multipart/form-data" key={section.id} onSubmit={handleSubmit}>
                {Array.isArray(section) && section.length > 0 ? (
                    <>
                        {
                            section.map((objFirst, indexFirst) => (
                                Array.isArray(objFirst.FormMasterDetailsModel) ? (
                                    objFirst.FormMasterDetailsModel.map((objSecond, indexSecond) => (
                                        objSecond.section_type === 'tabular' ? (
                                            <React.Fragment key={`${indexFirst}-${indexSecond}`}>
                                                <fieldset className="border shadow-sm mb-3 rounded-3 p-3">
                                                    <legend className="float-none w-auto px-3">{objSecond.section_name}</legend>
                                                    <table className="table table-striped table-bordered table-hover" key={`${indexFirst}-${indexSecond}`}>
                                                        <thead>
                                                            <tr>
                                                                {Array.isArray(objSecond.form_structure) ? (
                                                                    objSecond.form_structure.map((objThird, indexThird) => (
                                                                        <th className={objThird.column_alignment} width={objThird.column_width} key={`${indexFirst}-${indexSecond}-${indexThird}`}>
                                                                            {objThird.column_name}
                                                                        </th>
                                                                    ))
                                                                ) : null}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {Array.from({ length: Math.max(...objSecond.form_structure.map(objThird => objThird.field_name.length)) }).map((_, rowIndex) => (
                                                                <tr key={`row-${rowIndex}`}>
                                                                    {objSecond.form_structure.map((objThird, indexThird) => (
                                                                        <td key={`${indexFirst}-${indexSecond}-${indexThird}-${rowIndex}`}>
                                                                            {renderElement(objThird.field_name[rowIndex] || '', '', '', '', objSecond.section_type, rowIndex, user_id, projectDuration, budgetTotalAmount, modeType)}
                                                                            {/* {renderElement(objThird.field_name[rowIndex] || '', objSecond.form_structure, rowIndex, user_id, projectDuration, budgetTotalAmount)} */}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </fieldset>
                                            </React.Fragment>
                                        ) : objSecond.section_type === 'add_more' ? (
                                            <React.Fragment key={`${indexFirst}-${indexSecond}-${objSecond.form_structure[0].field_name}`}>
                                                <fieldset className="border shadow-sm mb-3 rounded-3 p-3">
                                                    <legend className="float-none w-auto px-3">{objSecond.section_name}</legend>
                                                    {modeType !== 'view' ? (
                                                        <div class="col-12 text-end pb-1">
                                                            <button type="button" className="btn btn-sm btn-dark" onClick={() => addMoreFields(`${indexFirst}-${indexSecond}-${objSecond.form_structure[0].field_name}`, objSecond.form_structure[0])}> Add New </button>
                                                        </div>
                                                    ) : null}
                                                    <div className="table-responsive">
                                                        <table style={{ minWidth: '1863px' }} className="table table-striped table-bordered table-hover" key={`${indexFirst}-${indexSecond}-${objSecond.form_structure[0].field_name}`}>
                                                            <thead>
                                                                <tr key={`${indexFirst}-${indexSecond}-${objSecond.form_structure[0].field_name}`}>
                                                                    <td colSpan={objSecond.form_structure[0].json_fields.length}></td>
                                                                </tr>
                                                                <tr>
                                                                    {Array.isArray(objSecond.form_structure[0].json_fields) ? (
                                                                        objSecond.form_structure[0].json_fields.map((objThird, indexThird) => (
                                                                            <th className={objThird.column_alignment} width={objThird.column_width} key={`${indexFirst}-${indexSecond}-${indexThird}`}>
                                                                                {objThird.column_name}
                                                                            </th>
                                                                        ))
                                                                    ) : null}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {Array.isArray(addMoreSections[`${indexFirst}-${indexSecond}-${objSecond.form_structure[0].field_name}`]) && addMoreSections[`${indexFirst}-${indexSecond}-${objSecond.form_structure[0].field_name}`].map((item, itemIndex) => (
                                                                    <tr key={`add-more-${indexFirst}-${indexSecond}-${itemIndex}`}>
                                                                        {objSecond.form_structure[0].json_fields.map((objThird, indexThird) => (
                                                                            <td key={`${indexFirst}-${indexSecond}-${indexThird}-${itemIndex}`} className={objThird.field_alignment}>
                                                                                {renderElement({
                                                                                    ...objThird || '',
                                                                                    sectionKey: `${indexFirst}-${indexSecond}-${objSecond.form_structure[0].field_name}`,
                                                                                    sectionName: 'add_more',
                                                                                    itemIndex,
                                                                                    modeType
                                                                                }, objSecond.form_structure, itemIndex, `${indexFirst}-${indexSecond}-${objSecond.form_structure[0].field_name}`, user_id, projectDuration, budgetTotalAmount, modeType)}
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </fieldset>
                                            </React.Fragment>
                                        ) : objSecond.section_type === 'general' ? (
                                            <React.Fragment key={`${indexFirst}-${indexSecond}-${objSecond.section_name}`}>
                                                <fieldset className="border shadow-sm mb-3 rounded-3 p-3" style={{ display: objSecond.section_name ? 'block' : 'none' }}>
                                                    <legend className="float-none w-auto px-3">{objSecond.section_name}</legend>
                                                    <div className="row g-3 align-items-center" key={`${indexFirst}-${indexSecond}`}>
                                                        {objSecond.form_structure.map((objThird, indexThird) => (
                                                            <React.Fragment key={`${indexFirst}-${indexSecond}-${indexThird}`}>
                                                                {renderElement({
                                                                    ...objThird,
                                                                    formOrder: objSecond.form_order,
                                                                    selectedValue,
                                                                } || '', '', '', '', objSecond.section_type, user_id, projectDuration, budgetTotalAmount, modeType)}
                                                                {objThird.sub_section_type === 'add_more' ? (
                                                                    <React.Fragment key={`${indexFirst}-${indexSecond}-${indexThird}-add-more`}>
                                                                        <div className="col-3 py-0">
                                                                            {renderElement({
                                                                                label: objThird.form_structure[0]?.field_name[0]?.label,
                                                                                field_type: 'label',
                                                                                labelName: 'label_add_more',
                                                                                sectionName: 'general_add_more'
                                                                            }, '', '', '', objSecond.section_type, user_id, projectDuration, budgetTotalAmount, modeType)}
                                                                        </div>
                                                                        <div className="col-3 py-0">
                                                                            <button type="button" className="btn btn-sm btn-dark float-right" onClick={() => addMoreFields(`${indexFirst}-${indexSecond}-${indexThird}-${objSecond.section_name}`, objThird.form_structure)}>Add New</button>
                                                                            {Array.isArray(addMoreSections[`${indexFirst}-${indexSecond}-${indexThird}-${objSecond.section_name}`]) && addMoreSections[`${indexFirst}-${indexSecond}-${indexThird}-${objSecond.section_name}`].map((item, itemIndex) => (
                                                                                objThird.form_structure.map((objFourth, indexFourth) => (
                                                                                    <React.Fragment key={`${indexFirst}-${indexSecond}-${indexThird}-${indexFourth}-${objSecond.section_name}`}>
                                                                                        {renderElement({
                                                                                            ...objFourth.field_name[0] || '',
                                                                                            sectionKey: `${indexFirst}-${indexSecond}-${indexThird}-${objSecond.section_name}`,
                                                                                            sectionName: 'general_add_more',
                                                                                            itemIndex,
                                                                                        }, objSecond.form_structure, itemIndex, `${indexFirst}-${indexSecond}-${indexThird}-${objSecond.section_name}`, objSecond.section_type, user_id, projectDuration, budgetTotalAmount, modeType)}
                                                                                    </React.Fragment>
                                                                                ))
                                                                            ))}
                                                                        </div>
                                                                    </React.Fragment>
                                                                ) : null
                                                                }
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </fieldset>
                                            </React.Fragment>
                                        ) : null
                                    ))
                                ) : null
                            ))
                        }
                        {/* <button type="submit" className="btn btn-sm btn-dark float-right"> Submit </button> */}
                    </>
                ) : null}
            </Form>
        );
    };
    /********** Return Jsx for final output ********/
    return (
        <span>
            {renderSection(manageDynamicForm)}
        </span>
    );
});
export default DynamicFormAttributes;
