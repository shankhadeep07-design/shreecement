import React, { useEffect, useState } from "react";

import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";

import "react-confirm-alert/src/react-confirm-alert.css"; // Import css

import { Card, Table } from "react-bootstrap";
const ImpactIndicatorReport = () => {
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

                        <div className="initiated-DailyNavodaya-table-container">

                            <hr className="my-1" />
                            <div className="mt-2 table table-bordered">
                                <div>
                                    <Card className="mb-3 shadow-sm">
                                        <Card.Header className="bg-light rounded-top">
                                            <legend className="float-none w-auto px-3">Impact Indicators of Various Activities</legend>
                                        </Card.Header>
                                        <Card.Body>
                                            <Table striped bordered hover>
                                                <thead>
                                                    <tr>
                                                        <th></th>
                                                        <th></th>
                                                        <th>2022-2023</th>
                                                        <th>2023-2024</th>
                                                    </tr>
                                                </thead>
                                                <tbody>

                                                    <tr>
                                                        <td rowspan="2">Anganwadi</td>
                                                        <td>All children completing preschool education joined the first standard school.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>All children in the age group of 3-5 are enrolled in Anganwadi.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <br/>

                                                    <tr>
                                                        <td rowspan="4">Govt School Support</td>
                                                        <td>Zero school dropouts </td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>80 % children in the ZP schools achieve Minimum Learning Levels appropriate to their level.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Improvement in pass percentage in high schools (% students obtained first division)</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>No. Schools maintaining the infra provided and using them for learning improvement of children</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <br/>

                                                    <tr>
                                                        <td rowspan="1">ASLC</td>
                                                        <td>80% of enrolled students shows improved results compare to baseline.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <br/>

                                                    <tr>
                                                        <td rowspan="6">Digital Learning Program</td>
                                                        <td>At least 20% increase in Minimum Learning Levels for students being administered E-learning appropriate to their level</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Reduction in the percentage of school dropouts</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Improvement in attendance and enrollment</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>All teachers to be trained at least once in year (no of training conducted)</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Improvement in pass percentage in high schools where ever applicable</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Improvement in periodic test scores</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <br/>

                                                    <tr>
                                                        <td rowspan="2">E-Center</td>
                                                        <td>1. 90% of enrolled students shows improved results compare to baseline.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>2. 90% students should achieve Minimum Learning Level.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <br/>

                                                    <tr>
                                                        <td rowspan="2">Navodaya Coaching</td>
                                                        <td>100% eligible students enrolled in coaching</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>No of students selected in terms of enrollment in Navodaya School (5%)</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <br/>
                                                    <tr>
                                                        <td rowspan="1">Village Resource Center</td>
                                                        <td>70% users facilitated to access appropriate govt. schemes and job related information.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <br/>

                                                    <tr>
                                                        <td rowspan="3">MMU</td>
                                                        <td>100% beneficiary have Digital card / history available online for all MMU patients.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>90% of the visiting patients receive medicine as prescribed.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>90% users are stable on chronic diseases.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <br/>
                                                    <tr>
                                                        <td rowspan="3">Health Clinics</td>
                                                        <td>100% beneficiary have Digital card / history available online for all MMU patients.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>90% of the visiting patients receive medicine as prescribed.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>90% users are stable on chronic diseases.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <br/>

                                                    <tr>
                                                        <td rowspan="3">Health Camp</td>
                                                        <td>90% of the visiting patients receive medicine as prescribed in each camp</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>90% of referred patients visited higher hospitals</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>90% users are satisfied from the camp.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <br/>

                                                    <tr>
                                                        <td rowspan="5">Nutrition Center</td>
                                                        <td>1. 80 % of delivery report normal baby wt.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>2. 70% of PLM are not anemic. </td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>3. 100% Institutional delivery.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>4. 100% of lactating mothers following EBF for six month.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>5. 95% PLM and baby are immunized.</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <br/>

                                                    <tr>
                                                        <td rowspan="2">ISL</td>
                                                        <td>1. 100 % of HHs using ISL</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>2. ODF village/Community (70% villages are ODF)</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <br/>

                                                    <tr>
                                                        <td rowspan="2">Community Toilets</td>
                                                        <td>1. 80% of identified users using CT</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>2. % of cases got reduced with reference to open defecation</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <br/>

                                                    <tr>
                                                        <td rowspan="2">Pratibha Library</td>
                                                        <td>•No of jobs secured in terms of enrollment (10%)</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>•No of higher education opportunities secured in terms of enrollment (10%)</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <br/>

                                                    <tr>
                                                        <td rowspan="2">VTC</td>
                                                        <td>90% of the enrolled candidate complete the course</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>70% of trained candidates placed in wage/self employment</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <br/>

                                                    <tr>
                                                        <td rowspan="3">Farm Livelihoods</td>
                                                        <td>At least 70% of targeted farmers adopt and continue new practices</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>20% increase in annual yield through the new practices</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>At least 10% annual increase of income</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <br/>

                                                    <tr>
                                                        <td rowspan="3">Enterprise</td>
                                                        <td>Suitable enterprises identified</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>No. of individuals who started enterprises</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Individual enterprise getting Rs 3000 monthly profit
                                                        Members of group enterprise earn at least around Rs 2,500 per month</td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>


                                                </tbody>
                                            </Table>
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

export default ImpactIndicatorReport