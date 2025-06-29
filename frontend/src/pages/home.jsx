import React from 'react';
import '../styles/Home.css'; // Assuming you have a CSS file for styling
import JobCard from '../components/card';
import { useEffect,useState } from 'react';


function Home() {

    const [jobListings, setJobListings] = useState([]);
    useEffect(()=>{
  
        const fetchJobListings = async () => {
            try {
                const response = await fetch('https://jsearch.p.rapidapi.com/search?query=developer%20jobs%20in%20chicago&page=1&num_pages=1&country=us&date_posted=all',
                    {
                        method: 'GET',
                        headers: {
                        'x-rapidapi-key': import.meta.env.API_KEY,
                        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
                        }
                    }
                );
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setJobListings(data);
                console.log(data); 
            } catch (error) {
                console.error('Error fetching job listings:', error);
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
        <JobCard/>
      </section>
    </div>
  );
}

export default Home;
