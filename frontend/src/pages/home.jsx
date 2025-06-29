import React from 'react';
import '../styles/Home.css'; // Assuming you have a CSS file for styling
import JobCard from '../components/card';
import { useEffect, useState } from 'react';

function Home() {
    const [jobListings, setJobListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJobListings = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://jsearch.p.rapidapi.com/search?query=developer%20jobs%20in%20chicago&page=1&num_pages=1&country=us&date_posted=all',
                    {
                        method: 'GET',
                        headers: {
                            // Fixed: Use VITE_API_KEY for Vite projects
                            'x-rapidapi-key': import.meta.env.VITE_API_KEY,
                            'x-rapidapi-host': 'jsearch.p.rapidapi.com'
                        }
                    }
                );
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                // Fixed: Access the data array from the API response
                setJobListings(data.data || []);
                console.log(data); 
            } catch (error) {
                console.error('Error fetching job listings:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJobListings();
    }, []);

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>JobTracker</h1>
                <p>Track your job applications with ease</p>
            </header>

            <section className="features-section">
                <h2>Why Use JobTracker?</h2>
                <ul>
                    <li>📌 Organize all your job applications in one place</li>
                    <li>📅 Track interview dates and deadlines</li>
                    <li>📊 Visualize your progress</li>
                </ul>
            </section>

            <section className='job-listing-section'>
                <h2>Latest Job Listings</h2>
                
                {loading && <p>Loading job listings...</p>}
                
                {error && <p className="error">Error: {error}</p>}
                
                {!loading && !error && jobListings.length === 0 && (
                    <p>No job listings found.</p>
                )}
                
                {/* Fixed: Added return statement and proper key prop */}
                {!loading && !error && jobListings.length > 0 && 
                    jobListings.map((job, index) => (
                        <JobCard key={job.job_id || index} props={job} />
                    ))
                }
            </section>
        </div>
    );
}

export default Home;