import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { dynamicFormDetailsApi } from '../../Services/DynamicForm-service';
import { getCurrentUserDetails } from "../../auth/auth";
import { useParams } from 'react-router-dom';
import DynamicFormAttributes from './DynamicFormAttributes';
import { error } from 'jquery';
const DynamicForm = forwardRef(({ form_id, item_id = null, lastInsertedId = null, mode, onCompleteFormSubmit, onDateChange, projectDuration, onKeyUpHandler, budgetTotal, companyCode, category, table_name, column_name, is_type_form, onFirstColumnDataChange }, ref) => {
    /******** Define States ********/
    const hasFetched = useRef(false);
    const [manageDynamicForm, setManageDynamicForm] = useState([]);
    const [manageDynamicFormId, setManageDynamicFormId] = useState(0);
    const [manageDynamicTable, setManageDynamicTable] = useState('');
    const [budgetTotal2, setBudgetTotal2] = useState();
    const [userId, setUserId] = useState(null);
    const [formData, setFormData] = useState(null);
    useEffect(() => {
        if (item_id) {
            // fetchFormData(item_id); // Custom function to fetch form data
        }
    }, [item_id]);
    const fetchFormData = async (id) => {
        try {
            const response = await fetch(`/api/form-data/${id}`);
            const data = await response.json();
            setFormData(data); // Update local state with fetched data
        } catch (error) {
            console.error('Error fetching form data:', error);
        }
    };
    useEffect(() => {
        setBudgetTotal2(budgetTotal);
    }, [budgetTotal])
    /******** Using useEffect for rendering calling api function ********/
    useEffect(() => {
        if (hasFetched.current) return;
        dynamicFormDetailsApiCall();
        hasFetched.current = true;
    }, [])
    /******** api call *********/
    const dynamicFormDetailsApiCall = async (e) => {
        try {
            const response = await dynamicFormDetailsApi(form_id);
            if (Array.isArray(response.dynamicformfieldslist)) {
                setManageDynamicFormId(response.dynamicformfieldslist[0]?.id);
                setManageDynamicTable(response.dynamicformfieldslist[0]?.form_short_name);
                setManageDynamicForm(response.dynamicformfieldslist);   
                setUserId(getCurrentUserDetails());
            } else {
                setManageDynamicForm([]);
                console.error('Expected an array but got:', response.dynamicformfieldslist);
            }
        }
        catch {
        }
        return false;
    }
    /********* Using useEffect to log state changes using manageDynamicForm array object */
    /************ Return Jsx for final output **********/
    return (
        <>
            {Array.isArray(manageDynamicForm) && (
                <DynamicFormAttributes ref={ref} config={manageDynamicForm} form_id={manageDynamicFormId} item_id={item_id} lastInsertedId={lastInsertedId} mode={mode} user_id={userId} form_short_name={manageDynamicTable} onCompleteFormSubmit={onCompleteFormSubmit} onDateChange={onDateChange} projectDuration={projectDuration} onKeyUpHandler={onKeyUpHandler} budgetTotal={budgetTotal2} companyCode={companyCode} category={category} table_name={table_name} column_name={column_name} is_type_form={is_type_form} onFirstColumnDataChange={onFirstColumnDataChange} />
            )}
        </>
    )
});
export default DynamicForm;