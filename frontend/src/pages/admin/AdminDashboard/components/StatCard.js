// src/pages/AdminDashboard/components/StatCard.js
import React from 'react';
import { Link } from 'react-router-dom';

function StatCard({ title, value, unit, linkTo }) {
    return (
        <div className="col-md-6 mb-4">
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 className="card-title text-muted">{title}</h5>
                            <span className="fw-bold fs-4">
                                {value} {unit && <span className="fs-6 text-muted">{unit}</span>}
                            </span>
                        </div>
                        <Link to={linkTo} className="btn btn-sm btn-outline-secondary">More</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatCard;