const filterLibrary = {
  ecommerce: {
    name: 'E-commerce Master Search',
    person_titles: ['Owner', 'Founder', 'Co-Founder', 'CEO', 'President', 'Managing Partner'],
    person_seniorities: ['owner', 'c_suite', 'partner'],
    organization_locations: ['United States'],
    organization_num_employees_ranges: ['1,50'],
    revenue_range: { min: 750000, max: 10000000 },
    organization_founded_year_range: { min: 2015, max: 2026 },
    organization_industry_tag_ids_keywords: [
      'Retail', 'Consumer Goods', 'Apparel and Fashion',
      'Health, Wellness and Fitness', 'Food and Beverages',
      'Sporting Goods', 'Cosmetics'
    ],
    technologies: ['Shopify', 'BigCommerce', 'WooCommerce', 'Magento', 'Adobe Commerce'],
    organization_not_keywords: []
  },
  legal: {
    name: 'Legal Master Search',
    person_titles: ['Owner', 'Founder', 'Managing Partner', 'Partner', 'Principal', 'Managing Director'],
    person_seniorities: ['owner', 'c_suite', 'partner'],
    organization_locations: ['United States'],
    organization_num_employees_ranges: ['1,50'],
    revenue_range: { min: 750000, max: 10000000 },
    organization_founded_year_range: { min: 2015, max: 2026 },
    organization_industry_tag_ids_keywords: ['Legal Services', 'Law Practice'],
    technologies: [],
    organization_not_keywords: ['Solo', 'Pro Se', 'Self Help', 'Pro-Se']
  },
  realestate: {
    name: 'Real Estate Master Search',
    person_titles: ['Owner', 'Founder', 'Broker-Owner', 'Principal Broker', 'Managing Broker', 'Managing Partner', 'President'],
    person_seniorities: ['owner', 'c_suite', 'partner'],
    organization_locations: ['United States'],
    organization_num_employees_ranges: ['1,50'],
    revenue_range: { min: 750000, max: 10000000 },
    organization_founded_year_range: { min: 2015, max: 2026 },
    organization_industry_tag_ids_keywords: ['Real Estate', 'Commercial Real Estate', 'Real Estate Investment', 'Property Management'],
    technologies: [],
    organization_not_keywords: ['Remax', 'RE/MAX', 'Keller Williams', 'KW', 'Coldwell Banker', 'Coldwell', 'Century 21', 'Berkshire Hathaway', 'BHHS', 'Sotheby', 'Compass', 'eXp Realty']
  },
  staffing: {
    name: 'Staffing Master Search',
    person_titles: ['Owner', 'Founder', 'Co-Founder', 'CEO', 'President', 'Managing Partner', 'Managing Director'],
    person_seniorities: ['owner', 'c_suite', 'partner'],
    organization_locations: ['United States'],
    organization_num_employees_ranges: ['1,50'],
    revenue_range: { min: 750000, max: 10000000 },
    organization_founded_year_range: { min: 2015, max: 2026 },
    organization_industry_tag_ids_keywords: ['Staffing and Recruiting', 'Human Resources Services', 'Executive Search'],
    technologies: [],
    organization_not_keywords: ['Robert Half', 'Adecco', 'Randstad', 'Kelly Services', 'ManpowerGroup', 'Aerotek', 'Kforce', 'Allegis']
  },
  agency: {
    name: 'Agency Master Search',
    person_titles: ['Owner', 'Founder', 'Co-Founder', 'CEO', 'President', 'Managing Director', 'Managing Partner'],
    person_seniorities: ['owner', 'c_suite', 'partner'],
    organization_locations: ['United States'],
    organization_num_employees_ranges: ['1,50'],
    revenue_range: { min: 750000, max: 10000000 },
    organization_founded_year_range: { min: 2015, max: 2026 },
    organization_industry_tag_ids_keywords: ['Marketing and Advertising', 'Design', 'Public Relations and Communications', 'Digital Marketing', 'Graphic Design', 'Web Design', 'Branding'],
    technologies: [],
    organization_not_keywords: ['Wpromote', 'Tinuiti', 'Power Digital', 'Jellyfish', 'Brainlabs', 'Croud', 'Dentsu', 'Publicis', 'WPP', 'Omnicom', 'Interpublic']
  }
};

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('filter-details-modal');
    const closeBtn = document.querySelector('.close-modal');
    const cards = document.querySelectorAll('.filter-card');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const triggerBtn = document.getElementById('trigger-btn');
    const statusMessage = document.getElementById('status-message');

    let currentIndustry = null;

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const industry = card.getAttribute('data-industry');
            currentIndustry = industry;
            const data = filterLibrary[industry];
            
            modalTitle.textContent = data.name;
            
            // Build modal content
            let html = '';
            
            const renderItem = (label, value) => {
                if (!value || (Array.isArray(value) && value.length === 0)) return '';
                let displayValue = '';
                if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                } else if (typeof value === 'object') {
                    displayValue = `${value.min.toLocaleString()} - ${value.max.toLocaleString()}`;
                } else {
                    displayValue = value;
                }
                return `
                    <div class="filter-detail-item">
                        <strong>${label}</strong>
                        <span>${displayValue}</span>
                    </div>
                `;
            };

            html += renderItem('Titles', data.person_titles);
            html += renderItem('Seniorities', data.person_seniorities);
            html += renderItem('Locations', data.organization_locations);
            html += renderItem('Employees', data.organization_num_employees_ranges);
            html += renderItem('Revenue', data.revenue_range ? `$${(data.revenue_range.min/1000).toLocaleString()}k - $${(data.revenue_range.max/1000000).toLocaleString()}M` : null);
            html += renderItem('Founded Year', data.organization_founded_year_range);
            html += renderItem('Industries', data.organization_industry_tag_ids_keywords);
            html += renderItem('Technologies', data.technologies);
            html += renderItem('Excluded Keywords', data.organization_not_keywords);

            modalBody.innerHTML = html;
            
            // Reset status
            statusMessage.className = 'hidden';
            statusMessage.textContent = '';
            
            // Show modal
            modal.classList.remove('hidden');
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    triggerBtn.addEventListener('click', async () => {
        if (!currentIndustry) return;

        triggerBtn.disabled = true;
        triggerBtn.textContent = 'Triggering...';
        triggerBtn.style.opacity = '0.7';

        const webhookUrl = 'https://coolblu.app.n8n.cloud/webhook-test/apollo-clay-instantly';

        try {
            // Uncomment the below code to make the actual fetch request to your n8n instance
            
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    industry_key: currentIndustry,
                    // Pass other required keys per your n8n setup if needed
                    // apollo_api_key: 'YOUR_KEY',
                    // clay_webhook_url: 'YOUR_URL'
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            

            // Simulated delay if fetch is commented out
            // await new Promise(resolve => setTimeout(resolve, 1500));

            statusMessage.textContent = 'Success! Workflow triggered for ' + filterLibrary[currentIndustry].name;
            statusMessage.className = 'status-message status-success';
        } catch (error) {
            statusMessage.textContent = 'Failed to trigger workflow. Ensure n8n is running and webhook URL is correct.';
            statusMessage.className = 'status-message status-error';
            console.error('Error:', error);
        } finally {
            triggerBtn.disabled = false;
            triggerBtn.textContent = 'Trigger Search';
            triggerBtn.style.opacity = '1';
        }
    });
});
