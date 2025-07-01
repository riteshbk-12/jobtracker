import React from 'react';
import '../styles/card.css';
import { useNavigate } from 'react-router-dom';

function JobCard({ props}) {
  const navigate= useNavigate();
  return (
    <div className="job-card" onClick={()=>navigate('/jobinfo', {state:props})}>
      <h2 className="job-title">{props.job_title}</h2>
      <p className="company-name">{props.employer_name}</p>
      <p className="job-location">📍 {props.job_location}</p>
      {props.job_salary && <p className="salary">💰 {props.job_salary}</p>}
      {props.job_experience && <p className="experience">🧠 {props.job_experience} experience</p>}
      <a className="apply-button" href={props.job_apply_link} target="_blank" rel="noopener noreferrer">
        Apply Now
      </a>
    </div>
  );
}

export default JobCard;
