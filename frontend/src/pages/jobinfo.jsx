// JobInfoCard.jsx
import React from 'react';
import '../styles/jobinfo.css';
import { MapPin, Building, DollarSign, Clock, Users, Globe, Brain } from 'lucide-react';
// import { use } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const JobInfoCard = () => {
  
  const navigate =useNavigate();
    const {state}=useLocation();
      if (!state) {
    return <p className="job-card-error">No job data found. Please go back and select a job.</p>;
  }

  const {
    job_title,
    employer_name,
    employer_logo,
    job_location,
    job_employment_type,
    job_posted_at,
    job_benefits = [],
    job_description,
    job_apply_link,
    salary_range
  } = state;

  const formatBenefits = (benefits) => {
    return benefits?.map(benefit => 
      benefit.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  };

  const truncateDescription = (text, maxLength = 300) => {
    if (text.length <= maxLength) return text;
    return text;
  };

  const handleMockInterview = () => {
    // Add your mock interview logic here
    navigate('/mockinterview', {
      state: {description : job_description, title: job_title}
    });
    // You can navigate to a mock interview page or open a modal
  };

  return (
    <div className="job-card-container">
      <div className="job-card-header">
        <div className="job-card-header-content">
          <img src={employer_logo} alt={`${employer_name} logo`} className="job-card-logo" />
          <div className="job-card-title-section">
            <h1 className="job-card-title">{job_title}</h1>
            <div className="job-card-header-info">
              <div className="job-card-header-item"><Building size={16} /><span className="job-card-company">{employer_name}</span></div>
              <div className="job-card-header-item"><MapPin size={16} /><span>{job_location}</span></div>
              <div className="job-card-header-item"><Clock size={16} /><span>{job_posted_at}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="job-card-content">
        <div className="job-card-grid">
          <div className="job-card-detail">
            <div className="job-card-detail-header"><Users size={20} className="icon-blue" /><h3>Employment Type</h3></div>
            <p>{job_employment_type}</p>
          </div>

          <div className="job-card-detail">
            <div className="job-card-detail-header"><DollarSign size={20} className="icon-green" /><h3>Salary Range</h3></div>
            <p>{salary_range}</p>
          </div>

          <div className="job-card-detail">
            <div className="job-card-detail-header"><Globe size={20} className="icon-purple" /><h3>Benefits</h3></div>
            <div className="job-card-benefits">
              {formatBenefits(job_benefits)?.map((benefit, index) => (
                <span key={index} className="job-card-benefit-tag">{benefit}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="job-card-action-buttons">
          <a href={job_apply_link} target="_blank" rel="noopener noreferrer" className="job-card-apply-button">
            Apply Now
          </a>
          <button onClick={handleMockInterview} className="job-card-mock-interview-button">
            <Brain size={16} />
            AI Mock Interview
          </button>
        </div>

        {job_description && (
          <div className="job-card-description-section">
            <h3>About This Role</h3>
            <div className="job-card-description-box"><p>{truncateDescription(job_description)}</p></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobInfoCard;