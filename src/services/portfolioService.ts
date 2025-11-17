import { logger } from '../utils/logger';

interface PortfolioData {
  personal: {
    name: string;
    title: string;
    email: string;
    phone?: string;
    location: string;
    linkedin?: string;
    github?: string;
    website?: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string;
    achievements: string[];
    technologies: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    achievements?: string[];
  }>;
  skills: {
    technical: Array<{
      category: string;
      skills: string[];
    }>;
    soft: string[];
  };
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    role: string;
    startDate: string;
    endDate: string | null;
    url?: string;
    github?: string;
    highlights: string[];
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    url?: string;
  }>;
}

class PortfolioService {
  // In production, this would fetch from Cloud Storage, Firestore, or Cloud SQL
  // For this demo, we're using static data
  private portfolioData: PortfolioData = {
    personal: {
      name: 'John Doe',
      title: 'Full Stack Developer & Cloud Architect',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      website: 'https://johndoe.dev',
      summary:
        'Experienced Full Stack Developer with 8+ years of expertise in building scalable cloud-native applications. Specialized in microservices architecture, containerization, and Google Cloud Platform. Passionate about clean code, DevOps practices, and continuous learning.',
    },
    experience: [
      {
        id: 'exp-1',
        company: 'Tech Corp',
        position: 'Senior Cloud Engineer',
        location: 'San Francisco, CA',
        startDate: '2021-01',
        endDate: null,
        current: true,
        description:
          'Lead development of cloud-native applications on Google Cloud Platform, managing infrastructure as code and implementing CI/CD pipelines.',
        achievements: [
          'Reduced infrastructure costs by 40% through optimization and auto-scaling',
          'Implemented multi-region deployment strategy improving availability to 99.99%',
          'Mentored team of 5 junior developers on cloud best practices',
        ],
        technologies: ['GCP', 'Kubernetes', 'Terraform', 'Go', 'Python', 'TypeScript'],
      },
      {
        id: 'exp-2',
        company: 'StartUp Inc',
        position: 'Full Stack Developer',
        location: 'Remote',
        startDate: '2018-06',
        endDate: '2020-12',
        current: false,
        description:
          'Developed and maintained full-stack web applications using modern JavaScript frameworks and cloud services.',
        achievements: [
          'Built real-time analytics dashboard serving 10,000+ daily users',
          'Improved application performance by 60% through code optimization',
          'Established testing practices achieving 85% code coverage',
        ],
        technologies: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'University of California',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        location: 'Berkeley, CA',
        startDate: '2014-09',
        endDate: '2018-05',
        gpa: '3.8/4.0',
        achievements: [
          'Dean\'s List all semesters',
          'President of Computer Science Club',
          'Published research on distributed systems',
        ],
      },
    ],
    skills: {
      technical: [
        {
          category: 'Cloud Platforms',
          skills: ['Google Cloud Platform', 'AWS', 'Azure'],
        },
        {
          category: 'Languages',
          skills: ['TypeScript', 'Python', 'Go', 'Java', 'SQL'],
        },
        {
          category: 'Frameworks',
          skills: ['React', 'Node.js', 'Express', 'FastAPI', 'Next.js'],
        },
        {
          category: 'DevOps',
          skills: ['Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Cloud Build'],
        },
        {
          category: 'Databases',
          skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Firestore', 'Cloud SQL'],
        },
      ],
      soft: [
        'Technical Leadership',
        'Agile/Scrum',
        'Problem Solving',
        'Communication',
        'Mentoring',
      ],
    },
    projects: [
      {
        id: 'proj-1',
        name: 'Cloud Native E-commerce Platform',
        description:
          'Microservices-based e-commerce platform built on GCP with Cloud Run, handling 1M+ transactions monthly',
        technologies: ['Cloud Run', 'Firestore', 'Cloud CDN', 'Pub/Sub', 'TypeScript'],
        role: 'Lead Developer',
        startDate: '2022-01',
        endDate: '2022-12',
        github: 'https://github.com/johndoe/ecommerce-platform',
        highlights: [
          'Achieved 99.9% uptime with zero-downtime deployments',
          'Implemented event-driven architecture using Cloud Pub/Sub',
          'Integrated payment processing with Stripe and PayPal',
        ],
      },
      {
        id: 'proj-2',
        name: 'Real-time Analytics Dashboard',
        description:
          'Real-time data visualization platform processing IoT sensor data from 10,000+ devices',
        technologies: ['React', 'D3.js', 'WebSockets', 'BigQuery', 'Cloud Functions'],
        role: 'Full Stack Developer',
        startDate: '2021-06',
        endDate: '2021-11',
        url: 'https://analytics.example.com',
        highlights: [
          'Processed 1M+ data points per second',
          'Built interactive charts with sub-second update latency',
          'Implemented data aggregation pipeline using BigQuery',
        ],
      },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'Google Cloud Professional Cloud Architect',
        issuer: 'Google Cloud',
        issueDate: '2022-03',
        expiryDate: '2024-03',
        credentialId: 'GCP-PCA-123456',
        url: 'https://www.credential.net/example',
      },
      {
        id: 'cert-2',
        name: 'Certified Kubernetes Administrator',
        issuer: 'Cloud Native Computing Foundation',
        issueDate: '2021-09',
        expiryDate: '2024-09',
        credentialId: 'CKA-789012',
      },
    ],
  };

  async getPortfolioData(): Promise<PortfolioData> {
    try {
      // In production, fetch from Cloud Storage, Firestore, or Cloud SQL
      // Example: const data = await firestore.collection('portfolio').doc('main').get();
      logger.info('Fetching portfolio data');
      return this.portfolioData;
    } catch (error) {
      logger.error('Error fetching portfolio data:', error);
      throw error;
    }
  }

  async getSection(section: string): Promise<any> {
    try {
      const data = await this.getPortfolioData();
      return data[section as keyof PortfolioData] || null;
    } catch (error) {
      logger.error(`Error fetching section ${section}:`, error);
      throw error;
    }
  }
}

export const portfolioService = new PortfolioService();
