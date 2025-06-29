import React from 'react';
import '../styles/card.css';

function JobCard({ title, company, location, salary, experience, applyLink }) {
  return (
    <div className="job-card">
      <h2 className="job-title">{title}</h2>
      <p className="company-name">{company}</p>
      <p className="job-location">📍 {location}</p>
      {salary && <p className="salary">💰 {salary}</p>}
      {experience && <p className="experience">🧠 {experience} experience</p>}
      <a className="apply-button" href={applyLink} target="_blank" rel="noopener noreferrer">
        Apply Now
      </a>
    </div>
  );
}

export default JobCard;
