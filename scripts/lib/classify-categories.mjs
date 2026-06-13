/**
 * classify-categories.mjs
 * Keyword-based category classifier for Google Cloud badges.
 *
 * Categories (matching existing content/categories/*.json):
 *   ai-and-ml, data-analytics, cloud-infrastructure,
 *   security, networking, devops, application-development
 *
 * Classification is GENERATED from badge names — not hardcoded per badge.
 */

/**
 * Ordered rules: first match wins.
 * Each rule has a list of keywords (case-insensitive) and a category ID.
 */
const CLASSIFICATION_RULES = [
  {
    category: 'ai-and-ml',
    keywords: [
      'machine learning', 'ml ', ' ml,', 'artificial intelligence', ' ai ', 'ai,',
      'vertex ai', 'gemini', 'generative ai', 'gen ai', 'llm', 'large language',
      'natural language', 'speech', 'vision api', 'translation api',
      'tensorflow', 'automl', 'bigquery ml', 'bqml', 'imagen', 'nlp',
      'sentiment analysis', 'text embedding', 'multimodal', 'diffusion',
      'prompt design', 'prompt engineering', 'foundation model',
      'responsible ai', 'ai apis', 'ml apis', 'cloud natural language',
      'dialogflow', 'document ai', 'video intelligence', 'cloud translation',
      'prepare data for ml', 'use machine learning', 'create ml models',
      'analyze speech and language', 'using the google cloud speech',
      'analyze sentiment', 'knowledge catalog',
    ],
  },
  {
    category: 'data-analytics',
    keywords: [
      'bigquery', 'big query', 'data warehouse', 'analytics',
      'dataflow', 'dataprep', 'pubsub', 'pub/sub', 'pub sub',
      'data studio', 'looker', 'data fusion', 'cloud composer',
      'streaming analytics', 'apache beam', 'spark', 'apache spark',
      'data lake', 'data pipeline', 'etl', 'elt',
      'cloud spanner', 'firestore', 'bigtable', 'data cloud',
      'share data', 'derive insights', 'connected sheets',
      'predictive data analysis', 'perform predictive',
      'build a data warehouse', 'organize and govern',
    ],
  },
  {
    category: 'cloud-infrastructure',
    keywords: [
      'compute engine', 'cloud storage', 'cloud run', 'gke',
      'kubernetes engine', 'kubernetes', 'container',
      'app engine', 'cloud functions', 'serverless',
      'firebase', 'cloud build', 'artifact registry',
      'cloud sql', 'cloud memorystore', 'persistent disk',
      'virtual machine', 'vm ', 'load balanc', 'autoscal',
      'cloud shell', 'google cloud console', 'gcloud',
      'infrastructure as code', 'terraform',
      'build infrastructure', 'build a website',
      'basics of google cloud compute', 'set up an app dev environment',
      'cloud storage and data protection', 'implement cloud storage',
      'arcade adventure', 'modern app deployment',
      'manage kubernetes', 'deploy kubernetes',
      'optimize costs for google kubernetes',
      'cloud spanner instances',
      'monitoring in google cloud', 'monitor and log',
      'monitor environments', 'implementing cloud load balancing',
      'google cloud observability',
    ],
  },
  {
    category: 'security',
    keywords: [
      'security', 'iam', 'identity and access', 'access management',
      'cloud kms', 'key management', 'encryption',
      'vpc', 'firewall', 'cloud armor', 'identity-aware proxy', 'iap',
      'secret manager', 'confidential', 'security command center',
      'compliance', 'audit', 'data protection', 'zero trust',
      'implement cloud security', 'cloud security fundamentals',
    ],
  },
  {
    category: 'networking',
    keywords: [
      'networking', 'network', 'vpc', 'vpn', 'cdn', 'dns',
      'load balancer', 'ncc', 'network connectivity', 'cloud interconnect',
      'cloud nat', 'peering', 'subnet', 'firewall rules',
      'set up a google cloud network', 'connecting cloud networks',
      'cloud load balancing',
    ],
  },
  {
    category: 'devops',
    keywords: [
      'devops', 'ci/cd', 'cicd', 'cloud deploy', 'cloud build',
      'continuous integration', 'continuous delivery', 'continuous deployment',
      'jenkins', 'git', 'source repositories', 'artifact registry',
      'terraform', 'ansible', 'helm', 'argocd',
      'implement devops', 'implement ci/cd', 'implement ci cd',
    ],
  },
  {
    category: 'application-development',
    keywords: [
      'app development', 'application development', 'flutter',
      'firebase', 'cloud run', 'cloud functions',
      'develop serverless', 'serverless app',
      'develop genai apps', 'streamlit',
      'api', 'rest api', 'web app', 'website',
      'google sheets', 'workspace', 'gmail', 'calendar', 'drive',
      'collaboration', 'productivity',
      'implement cloud collaboration',
    ],
  },
];

// Fallback if no rule matches
const DEFAULT_CATEGORY = 'cloud-infrastructure';

/**
 * Classifies a badge into a category based on its name and any other text.
 * @param {string} name - Badge name
 * @param {string[]} extraText - Additional text to check (description, technologies)
 * @returns {string} Category ID
 */
export function classifyCategory(name, extraText = []) {
  const haystack = [name, ...extraText].join(' ').toLowerCase();

  for (const rule of CLASSIFICATION_RULES) {
    for (const keyword of rule.keywords) {
      if (haystack.includes(keyword.toLowerCase())) {
        return rule.category;
      }
    }
  }

  return DEFAULT_CATEGORY;
}

/**
 * Returns the display name for a category ID.
 */
export const CATEGORY_META = {
  'ai-and-ml':               { name: 'AI & Machine Learning', shortName: 'AI & ML',    icon: 'Brain',        colorToken: '--color-ai-ml' },
  'data-analytics':          { name: 'Data Analytics',         shortName: 'Analytics', icon: 'ChartBar',     colorToken: '--color-data' },
  'cloud-infrastructure':    { name: 'Cloud Infrastructure',   shortName: 'Infra',     icon: 'Cloud',        colorToken: '--color-infra' },
  'security':                { name: 'Security',               shortName: 'Security',  icon: 'ShieldCheck',  colorToken: '--color-security' },
  'networking':              { name: 'Networking',             shortName: 'Network',   icon: 'Globe',        colorToken: '--color-network' },
  'devops':                  { name: 'DevOps',                 shortName: 'DevOps',    icon: 'GitBranch',    colorToken: '--color-devops' },
  'application-development': { name: 'Application Development', shortName: 'App Dev',  icon: 'Code',         colorToken: '--color-appdev' },
};
