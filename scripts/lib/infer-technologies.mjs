/**
 * infer-technologies.mjs
 * Technology inference engine for Google Cloud badges.
 *
 * Extracts technology IDs from badge names using keyword matching.
 * Returns only technologies that are actually mentioned — no fabrication.
 */

/**
 * Technology definitions: each has an ID, display name, and trigger keywords.
 * Keywords are matched against the badge name (case-insensitive).
 */
const TECHNOLOGY_DEFS = [
  // AI / ML Platform
  {
    id: 'vertex-ai',
    name: 'Vertex AI',
    description: 'Google Cloud\'s unified ML platform for building, deploying, and scaling AI/ML models.',
    category: 'ai-and-ml',
    gcpProductUrl: 'https://cloud.google.com/vertex-ai',
    keywords: ['vertex ai', 'vertex-ai', 'vertex ai studio'],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Google\'s multimodal large language model family, available via Vertex AI and Google AI Studio.',
    category: 'ai-and-ml',
    gcpProductUrl: 'https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini',
    keywords: ['gemini'],
  },
  {
    id: 'cloud-natural-language-api',
    name: 'Cloud Natural Language API',
    description: 'Pre-trained ML models for natural language understanding including sentiment, entity, and syntax analysis.',
    category: 'ai-and-ml',
    gcpProductUrl: 'https://cloud.google.com/natural-language',
    keywords: ['natural language api', 'cloud natural language', 'analyze sentiment', 'analyze speech and language'],
  },
  {
    id: 'cloud-speech-api',
    name: 'Cloud Speech-to-Text API',
    description: 'Transcribes audio to text using Google\'s deep learning neural networks.',
    category: 'ai-and-ml',
    gcpProductUrl: 'https://cloud.google.com/speech-to-text',
    keywords: ['speech api', 'speech-to-text', 'cloud speech', 'google cloud speech'],
  },
  {
    id: 'cloud-vision-api',
    name: 'Cloud Vision API',
    description: 'Integrates Google Vision AI features including label detection, OCR, and image classification.',
    category: 'ai-and-ml',
    gcpProductUrl: 'https://cloud.google.com/vision',
    keywords: ['vision api', 'cloud vision', 'image classification'],
  },
  {
    id: 'cloud-translation-api',
    name: 'Cloud Translation API',
    description: 'Neural Machine Translation API for translating text between thousands of language pairs.',
    category: 'ai-and-ml',
    gcpProductUrl: 'https://cloud.google.com/translate',
    keywords: ['translation api', 'cloud translation'],
  },
  {
    id: 'video-intelligence-api',
    name: 'Video Intelligence API',
    description: 'Annotates videos with labels, detects explicit content, and transcribes speech in video.',
    category: 'ai-and-ml',
    gcpProductUrl: 'https://cloud.google.com/video-intelligence',
    keywords: ['video intelligence'],
  },
  {
    id: 'bigquery-ml',
    name: 'BigQuery ML',
    description: 'Create and execute ML models in BigQuery using SQL queries.',
    category: 'ai-and-ml',
    gcpProductUrl: 'https://cloud.google.com/bigquery/docs/bqml-introduction',
    keywords: ['bigquery ml', 'bqml', 'create ml models with bigquery', 'predictive data analysis in bigquery'],
  },
  {
    id: 'imagen',
    name: 'Imagen',
    description: 'Google\'s text-to-image diffusion model, available on Vertex AI.',
    category: 'ai-and-ml',
    gcpProductUrl: 'https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview',
    keywords: ['imagen', 'text-to-image'],
  },

  // Data & Analytics
  {
    id: 'bigquery',
    name: 'BigQuery',
    description: 'Google Cloud\'s fully managed, serverless data warehouse for analytics at any scale.',
    category: 'data-analytics',
    gcpProductUrl: 'https://cloud.google.com/bigquery',
    keywords: ['bigquery', 'big query', 'bq '],
  },
  {
    id: 'pub-sub',
    name: 'Pub/Sub',
    description: 'Asynchronous and scalable messaging service for microservices, streaming, and event-driven systems.',
    category: 'data-analytics',
    gcpProductUrl: 'https://cloud.google.com/pubsub',
    keywords: ['pub/sub', 'pub sub', 'pubsub'],
  },
  {
    id: 'dataflow',
    name: 'Dataflow',
    description: 'Managed stream and batch data processing service built on Apache Beam.',
    category: 'data-analytics',
    gcpProductUrl: 'https://cloud.google.com/dataflow',
    keywords: ['dataflow'],
  },
  {
    id: 'cloud-spanner',
    name: 'Cloud Spanner',
    description: 'Fully managed, mission-critical relational database with unlimited scale and 99.999% availability.',
    category: 'data-analytics',
    gcpProductUrl: 'https://cloud.google.com/spanner',
    keywords: ['cloud spanner', 'spanner'],
  },
  {
    id: 'looker',
    name: 'Looker',
    description: 'Business intelligence and data visualization platform on Google Cloud.',
    category: 'data-analytics',
    gcpProductUrl: 'https://cloud.google.com/looker',
    keywords: ['looker', 'data studio', 'connected sheets'],
  },
  {
    id: 'knowledge-catalog',
    name: 'Data Catalog (Knowledge Catalog)',
    description: 'Metadata management service for discovery, understanding, and governance of data.',
    category: 'data-analytics',
    gcpProductUrl: 'https://cloud.google.com/data-catalog',
    keywords: ['knowledge catalog', 'data catalog'],
  },

  // Compute & Infrastructure
  {
    id: 'compute-engine',
    name: 'Compute Engine',
    description: 'Scalable, high-performance virtual machines running on Google infrastructure.',
    category: 'cloud-infrastructure',
    gcpProductUrl: 'https://cloud.google.com/compute',
    keywords: ['compute engine', 'virtual machine', 'vm instance', 'basics of google cloud compute',
               'implementing cloud load balancing', 'monitoring in google cloud'],
  },
  {
    id: 'cloud-storage',
    name: 'Cloud Storage',
    description: 'Object storage for companies of all sizes, serving data from edge to cloud.',
    category: 'cloud-infrastructure',
    gcpProductUrl: 'https://cloud.google.com/storage',
    keywords: ['cloud storage', 'gcs', 'use apis to work with cloud storage',
               'cloud storage and data protection', 'implement cloud storage'],
  },
  {
    id: 'cloud-run',
    name: 'Cloud Run',
    description: 'Fully managed container platform that scales stateless containers automatically.',
    category: 'cloud-infrastructure',
    gcpProductUrl: 'https://cloud.google.com/run',
    keywords: ['cloud run', 'cloud-run'],
  },
  {
    id: 'kubernetes-engine',
    name: 'Google Kubernetes Engine',
    description: 'Managed Kubernetes service for containerized application deployment, management, and scaling.',
    category: 'cloud-infrastructure',
    gcpProductUrl: 'https://cloud.google.com/kubernetes-engine',
    keywords: ['kubernetes engine', 'gke', 'kubernetes', 'manage kubernetes', 'deploy kubernetes',
               'optimize costs for google kubernetes'],
  },
  {
    id: 'cloud-functions',
    name: 'Cloud Functions',
    description: 'Serverless execution environment for building and connecting cloud services.',
    category: 'cloud-infrastructure',
    gcpProductUrl: 'https://cloud.google.com/functions',
    keywords: ['cloud functions', 'serverless app'],
  },
  {
    id: 'app-engine',
    name: 'App Engine',
    description: 'Fully managed serverless platform for enterprise-level web applications.',
    category: 'cloud-infrastructure',
    gcpProductUrl: 'https://cloud.google.com/appengine',
    keywords: ['app engine'],
  },
  {
    id: 'terraform',
    name: 'Terraform',
    description: 'Open-source Infrastructure as Code tool for provisioning and managing Google Cloud resources.',
    category: 'cloud-infrastructure',
    gcpProductUrl: 'https://cloud.google.com/docs/terraform',
    keywords: ['terraform'],
  },
  {
    id: 'cloud-monitoring',
    name: 'Cloud Monitoring',
    description: 'Full-stack monitoring, logging, and diagnostics for applications on Google Cloud.',
    category: 'cloud-infrastructure',
    gcpProductUrl: 'https://cloud.google.com/monitoring',
    keywords: ['cloud monitoring', 'monitoring', 'google cloud observability',
               'monitor environments', 'monitor and log', 'cloud operations', 'prometheus'],
  },

  // Security
  {
    id: 'iam',
    name: 'Identity and Access Management',
    description: 'Fine-grained access control for Google Cloud resources.',
    category: 'security',
    gcpProductUrl: 'https://cloud.google.com/iam',
    keywords: ['iam', 'identity and access', 'access management', 'service account',
               'implement cloud security', 'cloud security fundamentals', 'custom iam roles'],
  },
  {
    id: 'cloud-kms',
    name: 'Cloud KMS',
    description: 'Manage cryptographic keys for cloud services.',
    category: 'security',
    gcpProductUrl: 'https://cloud.google.com/kms',
    keywords: ['cloud kms', 'key management', 'encryption', 'confidential space'],
  },
  {
    id: 'security-command-center',
    name: 'Security Command Center',
    description: 'Risk and threat reporting service for Google Cloud resources.',
    category: 'security',
    gcpProductUrl: 'https://cloud.google.com/security-command-center',
    keywords: ['security command center'],
  },

  // Networking
  {
    id: 'vpc',
    name: 'Virtual Private Cloud',
    description: 'Managed networking functionality for Google Cloud resources.',
    category: 'networking',
    gcpProductUrl: 'https://cloud.google.com/vpc',
    keywords: ['vpc', 'virtual private cloud', 'set up a google cloud network', 'google cloud network'],
  },
  {
    id: 'network-connectivity-center',
    name: 'Network Connectivity Center',
    description: 'Centralized hub-and-spoke architecture for connecting network resources.',
    category: 'networking',
    gcpProductUrl: 'https://cloud.google.com/network-connectivity/docs/network-connectivity-center',
    keywords: ['ncc', 'network connectivity center', 'connecting cloud networks'],
  },
  {
    id: 'cloud-load-balancing',
    name: 'Cloud Load Balancing',
    description: 'High-performance, scalable load balancing for Google Cloud.',
    category: 'networking',
    gcpProductUrl: 'https://cloud.google.com/load-balancing',
    keywords: ['load balanc', 'cloud load balancing'],
  },

  // DevOps & CI/CD
  {
    id: 'cloud-build',
    name: 'Cloud Build',
    description: 'Serverless CI/CD platform for building, testing, and deploying on Google Cloud.',
    category: 'devops',
    gcpProductUrl: 'https://cloud.google.com/build',
    keywords: ['cloud build', 'ci/cd', 'cicd', 'implement ci/cd', 'implement devops'],
  },
  {
    id: 'artifact-registry',
    name: 'Artifact Registry',
    description: 'Universal package manager for container images and language packages.',
    category: 'devops',
    gcpProductUrl: 'https://cloud.google.com/artifact-registry',
    keywords: ['artifact registry'],
  },
  {
    id: 'cloud-deploy',
    name: 'Cloud Deploy',
    description: 'Continuous delivery service for deploying applications to GKE, Cloud Run, and more.',
    category: 'devops',
    gcpProductUrl: 'https://cloud.google.com/deploy',
    keywords: ['cloud deploy'],
  },
  {
    id: 'cloud-source-repositories',
    name: 'Cloud Source Repositories',
    description: 'Private Git repositories hosted on Google Cloud.',
    category: 'devops',
    gcpProductUrl: 'https://cloud.google.com/source-repositories',
    keywords: ['source repositories', 'cloud source'],
  },

  // Application Development
  {
    id: 'firebase',
    name: 'Firebase',
    description: 'Google\'s platform for building mobile and web applications with real-time database, auth, and hosting.',
    category: 'application-development',
    gcpProductUrl: 'https://firebase.google.com',
    keywords: ['firebase'],
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Collaboration and productivity tools including Gmail, Drive, Docs, Sheets, and Meet.',
    category: 'application-development',
    gcpProductUrl: 'https://workspace.google.com',
    keywords: ['workspace', 'gmail', 'google drive', 'google sheets', 'google meet',
               'collaboration', 'implement cloud collaboration', 'google calendar', 'appsheet'],
  },
];

/**
 * Given a badge name (and optional extra text), infers which technology IDs apply.
 * Returns only IDs of technologies actually mentioned — never fabricated.
 *
 * @param {string} name - Badge name
 * @param {string[]} extraText - Additional text (description, etc.)
 * @returns {string[]} Array of technology IDs
 */
export function inferTechnologies(name, extraText = []) {
  const haystack = [name, ...extraText].join(' ').toLowerCase();
  const matched = new Set();

  for (const tech of TECHNOLOGY_DEFS) {
    for (const keyword of tech.keywords) {
      if (haystack.includes(keyword.toLowerCase())) {
        matched.add(tech.id);
        break; // One keyword match per tech is enough
      }
    }
  }

  return [...matched];
}

/**
 * Returns all unique technologies referenced across all badges,
 * de-duplicated and sorted by ID.
 * @param {Array<{technologies: string[]}>} badges
 * @returns {typeof TECHNOLOGY_DEFS}
 */
export function collectUsedTechnologies(badges) {
  const usedIds = new Set(badges.flatMap(b => b.technologies ?? []));
  return TECHNOLOGY_DEFS.filter(t => usedIds.has(t.id));
}

export { TECHNOLOGY_DEFS };
