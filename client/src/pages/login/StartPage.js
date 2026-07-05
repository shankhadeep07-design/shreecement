import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom';
import LamsLogo from '../../assets/images/lams-logo.png'
import {loadCSS} from '../../helper/common';
import gsap from 'gsap'
import $ from 'jquery';
import {sluggify} from '../../helper/common'

export default function StartPage() {

    const [loading, setLoading] = useState(true);

    var productKeyRef = useRef(null);

    var progressFormRef = useRef(null);

    const animationRef = useRef(null);

    const [productKeyValidated, setProductKeyValidated] = useState(false);
    const [formData, setFormData] = useState({});

    function handleSuccess(response) {
        const thankYou = progressFormRef.current.querySelector('#progress-form__thank-you');
        while (progressFormRef.current.firstElementChild !== thankYou) {
            progressFormRef.current.removeChild(progressFormRef.current.firstElementChild);
        }
        thankYou.removeAttribute('hidden');
    }

    function handleError(error) {
        const submitButton = progressFormRef.current.querySelector('[type="submit"]');
        var errorText = "";
        if (progressFormRef.current.contains(submitButton)) {
            if(submitButton.previousElementSibling.previousElementSibling)
                errorText = submitButton.previousElementSibling.previousElementSibling
            else
                errorText = document.createElement('p');

            submitButton.removeAttribute('disabled');
            submitButton.textContent = 'Submit';

            errorText.classList.add('m-0', 'form__error-text');
            errorText.textContent = `Error message: ${error}`;

            submitButton.parentElement.prepend(errorText);
        }
    }


    async function postData(url = '', data = {}) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return response.json();
    }



    async function submitForm(e){
        e.preventDefault();
        const form = e.currentTarget,
        API = `${process.env.REACT_APP_API_URL}/admin/users/submit-admin` ;
        const formData = new FormData(form);
            const formTime = new Date().getTime(),
            formFields = {};
        for (const [name, value] of formData) {
            formFields[name] = value;
        }

        formFields['app_name'] = `${sluggify(process.env.REACT_APP_NAME)}`;

        var submitData =  {
            'fields': formFields,
            'meta': {
                'submittedAt': formTime,
                'ipAddress': 'local'
            }
        };
        var response = await postData(API, submitData)
        if(response.status){
            handleSuccess(response)
        }else{
            handleError(response.message);
        }
    }


    function togglePassword(e){
        // element.addEventListener('click', function() {

            var classList = e.target.classList;
            e.target.previousElementSibling.classList.toggle('font-size-24');
            if (classList.contains('fa-eye')) {
                e.target.classList.remove('fa-eye');
                e.target.classList.add('fa-eye-slash');
                e.target.previousElementSibling.type = "text"
            } else {
                e.target.classList.remove('fa-eye-slash');
                e.target.classList.add('fa-eye');
                e.target.previousElementSibling.type = "password"
            }
        // })
    }

    useEffect(() => {
        function ready(fn) {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                setTimeout(fn, 1);
                document.removeEventListener('DOMContentLoaded', fn);
            } else {
                document.addEventListener('DOMContentLoaded', fn);
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            var form = document.getElementById('progress-form');

            form.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    // Optionally, focus the next input field if desired
                    let inputs = Array.from(form.elements);
                    let index = inputs.indexOf(event.target);
                    if (index > -1 && index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                }
            });
        });

        ready(function() {
            const progressForm = document.getElementById('progress-form');

            const tabItems = progressForm.querySelectorAll('[role="tab"]'),
                tabPanels = progressForm.querySelectorAll('[role="tabpanel"]');
            let currentStep = 0;
            const isValidPhone = val => {
                const regex = new RegExp(/^[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?$/);

                return regex.test(val);
            };
            const isValidEmail = val => {
                const regex = new RegExp(
                    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );

                return regex.test(val);
            };
            const validateText = field => {
                const val = field.value.trim();

                if (val === '' && field.required) {
                    return {
                        isValid: false
                    };
                } else {
                    return {
                        isValid: true
                    };
                }
            };
            const validateProductKey = field => {
                const val = field.value.trim();
                var regex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

                if (val === '' && field.required) {
                    return {
                        isValid: false,
                    };
                } else if (val !== '') {
                    if (regex.test(val)) {
                        return {
                            isValid: true,
                        };
                    } else {
                        return {
                            isValid: false,
                            message: 'Please provide a valid product key.'
                        };
                    }
                } else {
                    return {
                        isValid: true
                    };
                }
            };
            const validateSelect = field => {
                const val = field.value.trim();

                if (val === '' && field.required) {
                    return {
                        isValid: false,
                        message: 'Please select an option from the dropdown menu.'
                    };
                } else {
                    return {
                        isValid: true
                    };
                }
            };
            const validateGroup = fieldset => {
                const choices = fieldset.querySelectorAll('input[type="radio"], input[type="checkbox"]');

                let isRequired = false,
                    isChecked = false;

                for (const choice of choices) {
                    if (choice.required) {
                        isRequired = true;
                    }

                    if (choice.checked) {
                        isChecked = true;
                    }
                }

                if (!isChecked && isRequired) {
                    return {
                        isValid: false,
                        message: 'Please make a selection.'
                    };
                } else {
                    return {
                        isValid: true
                    };
                }
            };
            const validateChoice = field => {
                return validateGroup(field.closest('fieldset'));
            };
            const validatePhone = field => {
                const val = field.value.trim();

                if (val === '' && field.required) {
                    return {
                        isValid: false
                    };
                } else if (val !== '' && !isValidPhone(val)) {
                    return {
                        isValid: false,
                        message: 'Please provide a valid phone number.'
                    };
                } else {
                    return {
                        isValid: true
                    };
                }
            };
            const validateEmail = field => {
                const val = field.value.trim();

                if (val === '' && field.required) {
                    return {
                        isValid: false
                    };
                } else if (val !== '' && !isValidEmail(val)) {
                    return {
                        isValid: false,
                        message: 'Please provide a valid email address.'
                    };
                } else {
                    return {
                        isValid: true
                    };
                }
            };
            const getValidationData = field => {
                // if(field.getAttribute('product-key')){
                //     var field = field.getAttribute('product-key');
                //     return {
                //         isValid: false
                //     };
                // }else{
                switch (field.type) {
                    case 'text':
                        if (field.getAttribute('data-type') == 'product-key') {
                            return validateProductKey(field)
                        } else {
                            return validateText(field);
                        }
                    case 'textarea':
                        return validateText(field);
                    case 'select-one':
                        return validateSelect(field);
                    case 'fieldset':
                        return validateGroup(field);
                    case 'radio':
                    case 'checkbox':
                        return validateChoice(field);
                    case 'tel':
                        return validatePhone(field);
                    case 'email':
                        return validateEmail(field);
                    case 'password':
                        return {
                            isValid: true
                        };
                    default:
                        throw new Error(
                            `The provided field type '${field.tagName}:${field.type}' is not supported in this form.`
                        );
                }
                // }

            };
            const isValid = field => {
                return getValidationData(field).isValid;
            };
            const validateStep = currentStep => {
                const fields = tabPanels[currentStep].querySelectorAll(
                    'fieldset, input:not([type="radio"]):not([type="checkbox"]), select, textarea, input[data-type="product-key"], input[type="password"]');

                const invalidFields = [...fields].filter(field => {
                    return !isValid(field);
                });

                return new Promise((resolve, reject) => {
                    if (invalidFields && !invalidFields.length) {
                        resolve();
                    } else {
                        reject(invalidFields);
                    }
                });
            };
            const FIELD_PARENT_CLASS = 'form__field',
                FIELD_ERROR_CLASS = 'form__error-text';

            function updateChoice(fieldset, status, errorId = '') {
                const choices = fieldset.querySelectorAll('[type="radio"], [type="checkbox"]');

                for (const choice of choices) {
                    if (status) {
                        choice.setAttribute('aria-invalid', 'true');
                        choice.setAttribute('aria-describedby', errorId);
                    } else {
                        choice.removeAttribute('aria-invalid');
                        choice.removeAttribute('aria-describedby');
                    }
                }
            }

            function reportError(field, message = 'Please complete this required field.') {
                const fieldParent = field.closest(`.${FIELD_PARENT_CLASS}`);

                if (progressForm.contains(fieldParent)) {
                    let fieldError = fieldParent.querySelector(`.${FIELD_ERROR_CLASS}`),
                        fieldErrorId = '';

                    if (!fieldParent.contains(fieldError)) {
                        fieldError = document.createElement('p');

                        if (field.matches('fieldset')) {
                            fieldErrorId = `${field.id}__error`;

                            updateChoice(field, true, fieldErrorId);
                        } else if (field.matches('[type="radio"], [type="checkbox"]')) {
                            fieldErrorId = `${field.closest('fieldset').id}__error`;

                            updateChoice(field.closest('fieldset'), true, fieldErrorId);
                        } else {
                            fieldErrorId = `${field.id}__error`;

                            field.setAttribute('aria-invalid', 'true');
                            field.setAttribute('aria-describedby', fieldErrorId);
                        }

                        fieldError.id = fieldErrorId;
                        fieldError.classList.add(FIELD_ERROR_CLASS);

                        fieldParent.appendChild(fieldError);
                    }

                    fieldError.textContent = message;
                }
            }

            function reportSuccess(field) {
                const fieldParent = field.closest(`.${FIELD_PARENT_CLASS}`);

                if (progressForm.contains(fieldParent)) {
                    const fieldError = fieldParent.querySelector(`.${FIELD_ERROR_CLASS}`);

                    if (fieldParent.contains(fieldError)) {
                        if (field.matches('fieldset')) {
                            updateChoice(field, false);
                        } else if (field.matches('[type="radio"], [type="checkbox"]')) {
                            updateChoice(field.closest('fieldset'), false);
                        } else {
                            field.removeAttribute('aria-invalid');
                            field.removeAttribute('aria-describedby');
                        }

                        fieldParent.removeChild(fieldError);
                    }
                }
            }

            function reportValidity(field) {
                const validation = getValidationData(field);

                if (!validation.isValid && validation.message) {
                    reportError(field, validation.message);
                } else if (!validation.isValid) {
                    reportError(field);
                } else {
                    reportSuccess(field);
                }
            }

            function deactivateTabs() {
                tabItems.forEach(tab => {
                    tab.setAttribute('aria-selected', 'false');
                    tab.setAttribute('tabindex', '-1');
                });
                tabPanels.forEach(panel => {
                    panel.setAttribute('hidden', '');
                });
            }

            function activateTab(index) {
                const thisTab = tabItems[index],
                    thisPanel = tabPanels[index];

                // Close all other tabs
                deactivateTabs();

                // Focus the activated tab for accessibility
                thisTab.focus();

                // Set the interacted tab to active
                thisTab.setAttribute('aria-selected', 'true');
                thisTab.removeAttribute('tabindex');

                // Display the associated tab panel
                thisPanel.removeAttribute('hidden');

                // Update the current step with the interacted tab's index value
                currentStep = index;
            }

            function clickTab(e) {
                activateTab([...tabItems].indexOf(e.currentTarget));
            }

            function arrowTab(e) {
                const {
                    keyCode,
                    target
                } = e;
                const targetPrev = target.previousElementSibling,
                    targetNext = target.nextElementSibling,
                    targetFirst = target.parentElement.firstElementChild,
                    targetLast = target.parentElement.lastElementChild;

                const isDisabled = node => node.hasAttribute('aria-disabled');

                switch (keyCode) {
                    case 37: // Left arrow
                        if (progressForm.contains(targetPrev) && !isDisabled(targetPrev)) {
                            activateTab(currentStep - 1);
                        } else if (!isDisabled(targetLast)) {
                            activateTab(tabItems.length - 1);
                        }
                        break;
                    case 39: // Right arrow
                        if (progressForm.contains(targetNext) && !isDisabled(targetNext)) {
                            activateTab(currentStep + 1);
                        } else if (!isDisabled(targetFirst)) {
                            activateTab(0);
                        }
                        break;
                }
            }
            tabItems[0].addEventListener('click', clickTab);
            tabItems[0].addEventListener('keydown', arrowTab);

            function handleProgress(isComplete) {
                const currentTab = tabItems[currentStep],
                    nextTab = tabItems[currentStep + 1];

                if (isComplete) {
                    currentTab.setAttribute('data-complete', 'true');
                    if (progressForm.contains(nextTab)) {
                        nextTab.removeAttribute('aria-disabled');

                        nextTab.addEventListener('click', clickTab);
                        nextTab.addEventListener('keydown', arrowTab);
                    }

                } else {
                    currentTab.setAttribute('data-complete', 'false');
                }
            }
            const debounce = (fn, delay = 500) => {
                let timeoutID;

                return (...args) => {
                    if (timeoutID) {
                        clearTimeout(timeoutID);
                    }

                    timeoutID = setTimeout(() => {
                        fn.apply(null, args);
                        timeoutID = null;
                    }, delay);
                };
            };
            progressForm.addEventListener('input', debounce(e => {
                const {
                    target
                } = e;

                validateStep(currentStep).then(() => {

                    // Update the progress bar (step complete)
                    // handleProgress(true);

                }).catch(() => {

                    // Update the progress bar (step incomplete)
                    // handleProgress(false);

                });

                // Display or remove any error messages
                reportValidity(target);
            }));
            progressForm.addEventListener('click', e => {
                const {
                    target
                } = e;

                if (target.matches('[data-action="next"]')) {
                    validateStep(currentStep).then(async () => {

                        if(target.matches('[data-type="first-continue"]')){
                            var url = process.env.REACT_APP_PRODUCT_VALIDATION_URL;
                            var body = {
                                "product_key" : document.getElementById("product-key").value
                            }
                            fetch(url, {
                                method: 'POST',
                                body : JSON.stringify(body),
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).then(response => {
                                if (!response.ok) {
                                    console.log('Network response was not ok ' + response.statusText);
                                }
                                return response.json(); // Parse the JSON response
                            }).then(data => {
                                if(!data.status){
                                    reportError(document.getElementById("product-key"), data.message)
                                    return;
                                }else{
                                    setProductKeyValidated(true);
                                    productKeyRef.current.setAttribute('readonly', '');
                                    handleProgress(true);
                                    activateTab(currentStep + 1);
                                }
                            })
                        }
                        if(target.matches('[data-type="second-continue"]')){
                            handleProgress(true);
                            activateTab(currentStep + 1);
                            return;
                        }
                        if(target.matches('[data-type="third-continue"]')){
                            handleProgress(true);
                            activateTab(currentStep + 1);
                            return;
                        }
                    }).catch(invalidFields => {
                        handleProgress(false);
                        invalidFields.forEach(field => {
                            reportValidity(field);
                        });
                        invalidFields[0].focus();
                    });
                }

                if (target.matches('[data-action="prev"]')) {
                    activateTab(currentStep - 1);
                }
            });
            async function getIP(url = 'https://api.ipify.org?format=json') {

                return new Promise((resolve, reject) => {
                    var ip = {
                        "ip": "local"
                    }
                    resolve(ip);
                })
                // const response = await fetch(url, {
                //     method: 'GET',
                //     headers: {
                //         'Content-Type': 'application/json'
                //     }
                // });

                // if (!response.ok) {
                //     throw new Error(response.statusText);
                // }

                // return response.json();
            }
            

            function disableSubmit() {
                const submitButton = progressForm.querySelector('[type="submit"]');
                if (progressForm.contains(submitButton)) {
                    submitButton.setAttribute('disabled', '');
                    submitButton.textContent = 'Submitting...';

                }
            }
            document.getElementById('product-key').addEventListener('keyup', function(event) {
                var inputField = event.target;
                var value = inputField.value.toUpperCase();
                value = value.replace(/[^A-Z0-9]/g, '');
                var formattedValue = '';
                for (var i = 0; i < value.length; i++) {
                    if (i > 0 && i % 4 === 0) {
                        formattedValue += '-';
                    }
                    formattedValue += value[i];
                }
                formattedValue = formattedValue.substring(0, 24);
                inputField.value = formattedValue;
            });

            // document.querySelectorAll('.toggle-password').forEach((element) => {
            //     element.addEventListener('click', function() {
            //         var classList = this.classList;
            //         this.previousElementSibling.classList.toggle('font-size-24');
            //         if (classList.contains('fa-eye')) {
            //             this.classList.remove('fa-eye');
            //             this.classList.add('fa-eye-slash');
            //             this.previousElementSibling.type = "text"
            //         } else {
            //             this.classList.remove('fa-eye-slash');
            //             this.classList.add('fa-eye');
            //             this.previousElementSibling.type = "password"
            //         }
            //     })
            // })
        });

        return () => {
            return false;
        }
    },[])



    function changeFormdata(e) {
        setFormData((prevData) => {
            var key = e.target.id;
            var value = e.target.value
            var data = {
                ...prevData,
                [key] : value
            };
            return data
        })
    }


    function animateComponent(){
        const el = animationRef.current;
        gsap.from(el, {
            opacity : 0,
            duration : 1,
            y : 100,
        })
        gsap.to(el, {
            opacity : 1,
            duration : 1,
            y : 0,
        })
        gsap.to(el, {
            opacity : 0,
            delay : 1.5,
            duration : 1,
            y : -100,
        })

        gsap.from('#form-container', {
            opacity : 0,
            duration : 1,
            delay : 2.5,
            y: "-10%",
            x: "-50%",
        })
        gsap.to('#form-container', {
            opacity : 1,
            duration : 1,
            delay : 2.5,
            y : "-50%",
            x: "-50%",
        })
    }
    
    useEffect(() => {    
        const fullUrl = window.location.pathname;
        const loadAndAnimate = async () => {
            try {
              loadCSS(`${process.env.REACT_APP_BASE_NAME}assets/css/startregistration.css`).then((link) => {
                animateComponent();
              }).catch((err) => {
                console.log(err);
              })
            } catch (error) {
              console.error(error);
            }
        };

        loadAndAnimate();
    }, []);






  return (
    <div id="container" style={{height: "100vh"}}>
        <div style={{width: "100%", height:"100%", display:"flex", justifyContent:"center", flexDirection: "column", alignItems:"center"}}>
            <img id="animate-logo" ref={animationRef} src ={LamsLogo} style={{width : "350px", opacity: 0}}/>
        </div>
        <div className="mx-auto mt-0 main-container" id="form-container" style={{opacity : 0, textAlign: 'left'}}>
            <form id="progress-form" ref={progressFormRef} onSubmit={submitForm} className="p-4 progress-form" action="https://httpbin.org/post" lang="en" novalidate>
                <img className="logo" data-wow-offset="1" alt="Logo" src={LamsLogo}/>
                <div className="d-flex align-items-start mb-3 sm:mb-5 progress-form__tabs" role="tablist">
                    <button id="progress-form__tab-1" className="flex-1 px-0 pt-2 progress-form__tabs-item" type="button"
                        role="tab" aria-controls="progress-form__panel-1" aria-selected="true">
                        <span className="d-block step" aria-hidden="true">Step 1 <span className="sm:d-none">of 3</span></span>
                        Product Key
                    </button>
                    <button id="progress-form__tab-2" className="flex-1 px-0 pt-2 progress-form__tabs-item" type="button"
                        role="tab" aria-controls="progress-form__panel-2" aria-selected="false" tabindex="-1"
                        aria-disabled="true">
                        <span className="d-block step" aria-hidden="true">Step 2 <span className="sm:d-none">of 3</span></span>
                        Admin Information
                    </button>
                    <button id="progress-form__tab-3" className="flex-1 px-0 pt-2 progress-form__tabs-item" type="button"
                        role="tab" aria-controls="progress-form__panel-3" aria-selected="false" tabindex="-1"
                        aria-disabled="true">
                        <span className="d-block step" aria-hidden="true">Step 3 <span className="sm:d-none">of 3</span></span>
                        Authentication
                    </button>
                </div>
                <section id="progress-form__panel-1" role="tabpanel" aria-labelledby="progress-form__tab-1"
                    tabindex="0">
                    <div className="mt-3 form__field">
                        <label for="product-key">
                            Enter product key
                            <span data-required="true" aria-hidden="true"></span>
                        </label>
                        <div>
                            <input ref={productKeyRef} id="product-key" onKeyUp={(e) => changeFormdata(e)} autocomplete="off" data-type="product-key" maxlength="24" type="text" name="product-key"
                            required placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"/>
                            {
                                productKeyValidated &&
                                <span className='key-validated-icon'>
                                    <i className="fa-solid fa-circle-check"></i>
                                </span>
                            }
                            
                        </div>
                        
                    </div>
                    <div
                        className="d-flex flex-column-reverse sm:flex-row align-items-center justify-center sm:justify-end mt-4 sm:mt-5">
                        
                        <button type="button" data-action="next" data-type="first-continue">
                            Continue
                        </button>
                    </div>
                </section>
                <section id="progress-form__panel-2" role="tabpanel" aria-labelledby="progress-form__tab-2"
                    tabindex="0" hidden>
                    <div className="sm:d-grid sm:grid-col-2 sm:mt-3">
                        <div className="mt-3 sm:mt-0 form__field">
                            <label for="first-name">
                                First name
                                <span data-required="true" aria-hidden="true"></span>
                            </label>
                            <input id="first-name" onKeyUp={(e) => changeFormdata(e)} type="text" name="first-name" autocomplete="given-name" required/>
                        </div>

                        <div className="mt-3 sm:mt-0 form__field">
                            <label for="last-name">
                                Last name
                                <span data-required="true" aria-hidden="true"></span>
                            </label>
                            <input id="last-name" onKeyUp={(e) => changeFormdata(e)} type="text" name="last-name" autocomplete="family-name" required/>
                        </div>
                    </div>

                    <div className="mt-3 form__field">
                        <label for="email-address">
                            Email address
                            <span data-required="true" aria-hidden="true"></span>
                        </label>
                        <input id="email-address" onKeyUp={(e) => changeFormdata(e)} type="email" name="email-address" autocomplete="email"
                            inputmode="email" required/>
                    </div>

                    <div className="mt-3 form__field">
                        <label for="phone-number">
                            Phone number (optional)
                        </label>
                        <input id="phone-number" onKeyUp={(e) => changeFormdata(e)} type="tel" name="phone-number" autocomplete="tel" inputmode="tel"/>
                    </div>
                    
                    <div className="d-flex align-items-center justify-center sm:justify-end mt-4 sm:mt-5">
                        <button type="button" className="mt-1 sm:mt-0 button--simple" data-action="prev">
                            Back
                        </button>
                        <button type="button" data-action="next" data-type="second-continue">
                            Continue
                        </button>
                    </div>
                </section>
                <section id="progress-form__panel-3" role="tabpanel" aria-labelledby="progress-form__tab-3"
                    tabindex="0" hidden>
                    <div className="mt-3 form__field">
                        <label for="password">
                            Enter password
                        </label>
                        <div>
                            <input id="password" onKeyUp={(e) => changeFormdata(e)} className="font-size-24" type="password" name="password" autocomplete="password" inputmode="password"/>
                            <span toggle="#password" onClick={togglePassword} className="fa-regular fa-eye field-icon toggle-password"></span>
                        </div>
                        
                    </div>

                    <div className="mt-3 form__field">
                        <label for="re-password">
                            Re-Enter password
                        </label>
                        <input id="re-password" onKeyUp={(e) => changeFormdata(e)} className="font-size-24" type="password" name="re-password" autocomplete="re-password" inputmode="re-password"/>
                        <span toggle="#re-password" onClick={togglePassword} className="fa-regular fa-eye field-icon toggle-password"></span>
                    </div>

                    <div
                        className="d-flex flex-column-reverse sm:flex-row align-items-center justify-center sm:justify-end mt-4 sm:mt-5">
                        <button type="button" className="mt-1 sm:mt-0 button--simple" data-action="prev">
                            Back
                        </button>
                        <button type="submit" data-type="third-continue">
                            Submit
                        </button>
                    </div>
                </section>
                <section id="progress-form__thank-you" hidden>
                    <div className="checkmark-container">
                        <div className="checkmark">
                            <svg className="star" height="19" viewBox="0 0 19 19" width="19"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M8.296.747c.532-.972 1.393-.973 1.925 0l2.665 4.872 4.876 2.66c.974.532.975 1.393 0 1.926l-4.875 2.666-2.664 4.876c-.53.972-1.39.973-1.924 0l-2.664-4.876L.76 10.206c-.972-.532-.973-1.393 0-1.925l4.872-2.66L8.296.746z">
                                </path>
                            </svg>
                            <svg className="star" height="19" viewBox="0 0 19 19" width="19"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M8.296.747c.532-.972 1.393-.973 1.925 0l2.665 4.872 4.876 2.66c.974.532.975 1.393 0 1.926l-4.875 2.666-2.664 4.876c-.53.972-1.39.973-1.924 0l-2.664-4.876L.76 10.206c-.972-.532-.973-1.393 0-1.925l4.872-2.66L8.296.746z">
                                </path>
                            </svg>
                            <svg className="star" height="19" viewBox="0 0 19 19" width="19"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M8.296.747c.532-.972 1.393-.973 1.925 0l2.665 4.872 4.876 2.66c.974.532.975 1.393 0 1.926l-4.875 2.666-2.664 4.876c-.53.972-1.39.973-1.924 0l-2.664-4.876L.76 10.206c-.972-.532-.973-1.393 0-1.925l4.872-2.66L8.296.746z">
                                </path>
                            </svg>
                            <svg className="star" height="19" viewBox="0 0 19 19" width="19"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M8.296.747c.532-.972 1.393-.973 1.925 0l2.665 4.872 4.876 2.66c.974.532.975 1.393 0 1.926l-4.875 2.666-2.664 4.876c-.53.972-1.39.973-1.924 0l-2.664-4.876L.76 10.206c-.972-.532-.973-1.393 0-1.925l4.872-2.66L8.296.746z">
                                </path>
                            </svg>
                            <svg className="star" height="19" viewBox="0 0 19 19" width="19"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M8.296.747c.532-.972 1.393-.973 1.925 0l2.665 4.872 4.876 2.66c.974.532.975 1.393 0 1.926l-4.875 2.666-2.664 4.876c-.53.972-1.39.973-1.924 0l-2.664-4.876L.76 10.206c-.972-.532-.973-1.393 0-1.925l4.872-2.66L8.296.746z">
                                </path>
                            </svg>
                            <svg className="star" height="19" viewBox="0 0 19 19" width="19"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M8.296.747c.532-.972 1.393-.973 1.925 0l2.665 4.872 4.876 2.66c.974.532.975 1.393 0 1.926l-4.875 2.666-2.664 4.876c-.53.972-1.39.973-1.924 0l-2.664-4.876L.76 10.206c-.972-.532-.973-1.393 0-1.925l4.872-2.66L8.296.746z">
                                </path>
                            </svg>
                            <svg className="checkmark__check" height="36" viewBox="0 0 48 36" width="48"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M47.248 3.9L43.906.667a2.428 2.428 0 0 0-3.344 0l-23.63 23.09-9.554-9.338a2.432 2.432 0 0 0-3.345 0L.692 17.654a2.236 2.236 0 0 0 .002 3.233l14.567 14.175c.926.894 2.42.894 3.342.01L47.248 7.128c.922-.89.922-2.34 0-3.23">
                                </path>
                            </svg>
                            <svg className="checkmark__background" height="115" viewBox="0 0 120 115" width="120"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M107.332 72.938c-1.798 5.557 4.564 15.334 1.21 19.96-3.387 4.674-14.646 1.605-19.298 5.003-4.61 3.368-5.163 15.074-10.695 16.878-5.344 1.743-12.628-7.35-18.545-7.35-5.922 0-13.206 9.088-18.543 7.345-5.538-1.804-6.09-13.515-10.696-16.877-4.657-3.398-15.91-.334-19.297-5.002-3.356-4.627 3.006-14.404 1.208-19.962C10.93 67.576 0 63.442 0 57.5c0-5.943 10.93-10.076 12.668-15.438 1.798-5.557-4.564-15.334-1.21-19.96 3.387-4.674 14.646-1.605 19.298-5.003C35.366 13.73 35.92 2.025 41.45.22c5.344-1.743 12.628 7.35 18.545 7.35 5.922 0 13.206-9.088 18.543-7.345 5.538 1.804 6.09 13.515 10.696 16.877 4.657 3.398 15.91.334 19.297 5.002 3.356 4.627-3.006 14.404-1.208 19.962C109.07 47.424 120 51.562 120 57.5c0 5.943-10.93 10.076-12.668 15.438z">
                                </path>
                            </svg>
                        </div>
                    </div>
                    <p className="text-center mt-0">Thank you for your registration!</p>
                    <p className="text-center mt-0">
                        <span>Please log in using this provided link.</span>
                        <div>
                            <a href={`${process.env.REACT_APP_BASE_NAME}`} className="btn btn-dark text-white text-decoration-none">Login</a>
                        </div>
                        
                    </p>
                </section>
            </form>
        </div>
    </div>
  )
}
