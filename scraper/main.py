from jobspy import scrape_jobs
from datetime import datetime

def main():
    # Scrape jobs
    jobs_df = scrape_jobs(
        site_name=["indeed", "linkedin", "glassdoor"],
        search_term="Web developer",
        location="India",
        job_type="fulltime",
        results_wanted=5,
        verbose=0,
        linkedin_fetch_description=True,
        hyperlinks=True,
        hours_old=24,
        country_indeed='India',
        is_remote=True
    )

    # Set default values for empty job_type and date_posted
    jobs_df['job_type'] = jobs_df['job_type'].fillna('full-time')
    jobs_df['date_posted'] = jobs_df['date_posted'].fillna(datetime.now())
    # Save to CSV as backup
    jobs_df.to_csv("scraped_jobs.csv", index=True)

if __name__ == "__main__":
    main()
