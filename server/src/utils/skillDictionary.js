/**
 * High-Fidelity Categorized Skill Dictionary & Taxonomy Engine.
 * Provides strict boundary matching, category classifications, and collision prevention
 * to avoid false positives (e.g., Java vs JavaScript, C vs C++, Go vs common verbs, Next vs next).
 */

const SKILL_TAXONOMY = {
  // ===================== LANGUAGES =====================
  'javascript': {
    canonical: 'JavaScript',
    category: 'Languages',
    aliases: ['js', 'ecmascript', 'es6', 'es6+'],
    collisionGuard: (text, idx, matchedTerm) => {
      // If matched term is 'js', ensure it is NOT preceded by a dot (e.g., in Next.js, Node.js, Vue.js)
      if (matchedTerm.toLowerCase() === 'js') {
        const precedingChar = text[idx] || '';
        if (precedingChar === '.') return false;
      }
      return true;
    }
  },
  'typescript': {
    canonical: 'TypeScript',
    category: 'Languages',
    aliases: ['ts'],
    collisionGuard: (text, idx, matchedTerm) => {
      if (matchedTerm.toLowerCase() === 'ts') {
        const precedingChar = text[idx] || '';
        if (precedingChar === '.') return false;
      }
      return true;
    }
  },
  'python': {
    canonical: 'Python',
    category: 'Languages',
    aliases: ['py', 'python3', 'python 3', 'python2'],
    collisionGuard: (text, idx) => true
  },
  'java': {
    canonical: 'Java',
    category: 'Languages',
    aliases: ['core java', 'java 8', 'java 11', 'java 17', 'java 21', 'java ee', 'java se'],
    // CRITICAL COLLISION GUARD: Must never match when part of "JavaScript"
    collisionGuard: (text, idx, matchedTerm) => {
      const windowAfter = text.slice(idx, idx + 15).toLowerCase();
      if (windowAfter.includes('javascript') || windowAfter.includes('java script')) return false;
      return true;
    }
  },
  'c++': {
    canonical: 'C++',
    category: 'Languages',
    aliases: ['cpp', 'c plus plus', 'c/c++'],
    collisionGuard: (text, idx) => true
  },
  'c#': {
    canonical: 'C#',
    category: 'Languages',
    aliases: ['csharp', 'c sharp', 'c#.net'],
    collisionGuard: (text, idx) => true
  },
  'c': {
    canonical: 'C',
    category: 'Languages',
    aliases: ['ansi c', 'c programming'],
    // STRICT GUARD: Match 'C' only in language contexts (e.g., "C/C++", "Languages: C,", "C, C++", "C, Python")
    strictOnly: true,
    customMatcher: (text) => {
      // Look for explicit C programming contexts
      const cContextRegex = /(?:languages?|skills?|technologies?)[:\s][^\n]*\bC\b(?:\s*[,/|]\s*(?:C\+\+|Python|Java|Rust|Go|C#))|\bC\s*[/,]\s*C\+\+|\bansi\s+c\b|\bc\s+programming\b/i;
      return cContextRegex.test(text);
    }
  },
  'go': {
    canonical: 'Go',
    category: 'Languages',
    aliases: ['golang', 'go language', 'go lang'],
    strictOnly: true,
    customMatcher: (text) => {
      // Must not match English verb "go" or "go-to"
      if (/\bgolang\b/i.test(text) || /\bgo\s+language\b/i.test(text)) return true;
      // Match "Go" in language lists (e.g. "Python, Go, Rust" or "Languages: ... Go ...")
      return /(?:languages?|backend|stack)[:\s][^\n]*\bGo\b/i.test(text) || /\b(?:Python|Java|Rust|C\+\+|TypeScript|Node\.?js)\s*,\s*Go\b/i.test(text) || /\bGo\s*,\s*(?:Python|Java|Rust|C\+\+|TypeScript|Docker)\b/i.test(text);
    }
  },
  'rust': {
    canonical: 'Rust',
    category: 'Languages',
    aliases: ['rustlang'],
    collisionGuard: (text, idx) => true
  },
  'ruby': {
    canonical: 'Ruby',
    category: 'Languages',
    aliases: ['ruby on rails', 'rails'],
    collisionGuard: (text, idx) => true
  },
  'php': {
    canonical: 'PHP',
    category: 'Languages',
    aliases: ['php7', 'php8'],
    collisionGuard: (text, idx) => true
  },
  'swift': {
    canonical: 'Swift',
    category: 'Languages',
    aliases: ['swiftui'],
    collisionGuard: (text, idx) => true
  },
  'kotlin': {
    canonical: 'Kotlin',
    category: 'Languages',
    aliases: [],
    collisionGuard: (text, idx) => true
  },
  'sql': {
    canonical: 'SQL',
    category: 'Languages',
    aliases: ['structured query language', 't-sql', 'pl/sql'],
    collisionGuard: (text, idx) => true
  },
  'html5': {
    canonical: 'HTML5',
    category: 'Languages',
    aliases: ['html', 'html 5'],
    collisionGuard: (text, idx) => true
  },
  'css3': {
    canonical: 'CSS3',
    category: 'Languages',
    aliases: ['css', 'css 3'],
    collisionGuard: (text, idx) => true
  },
  'r': {
    canonical: 'R',
    category: 'Languages',
    aliases: ['r programming', 'r language'],
    strictOnly: true,
    customMatcher: (text) => {
      return /\br\s+programming\b/i.test(text) || /\br\s+language\b/i.test(text) || /(?:languages?|tools?)[:\s][^\n]*\bR\s*[,/]\s*(?:Python|SQL|Matlab)/i.test(text);
    }
  },
  'scala': {
    canonical: 'Scala',
    category: 'Languages',
    aliases: [],
    collisionGuard: (text, idx) => true
  },

  // ===================== FRONTEND =====================
  'react': {
    canonical: 'React',
    category: 'Frontend',
    aliases: ['reactjs', 'react.js', 'react js', 'react native'],
    collisionGuard: (text, idx) => {
      // Avoid matching "reaction" or "reactive programming" unless React is isolated
      const windowAfter = text.slice(idx, idx + 10).toLowerCase();
      if (windowAfter.startsWith('reaction') || windowAfter.startsWith('reactive')) return false;
      return true;
    }
  },
  'next.js': {
    canonical: 'Next.js',
    category: 'Frontend',
    // ELIMINATED 'next' to prevent false positive matching on common English word
    aliases: ['nextjs', 'next.js', 'next js'],
    collisionGuard: (text, idx) => true
  },
  'vue.js': {
    canonical: 'Vue.js',
    category: 'Frontend',
    aliases: ['vue', 'vuejs', 'vue.js', 'vue 3', 'vue 2'],
    collisionGuard: (text, idx) => true
  },
  'angular': {
    canonical: 'Angular',
    category: 'Frontend',
    aliases: ['angularjs', 'angular.js', 'angular 2+', 'angular 14', 'angular 15', 'angular 16'],
    collisionGuard: (text, idx) => true
  },
  'svelte': {
    canonical: 'Svelte',
    category: 'Frontend',
    aliases: ['sveltekit'],
    collisionGuard: (text, idx) => true
  },
  'redux': {
    canonical: 'Redux',
    category: 'Frontend',
    aliases: ['redux toolkit', 'rtk', 'redux-thunk', 'redux-saga'],
    collisionGuard: (text, idx) => true
  },
  'tailwind css': {
    canonical: 'Tailwind CSS',
    category: 'Frontend',
    aliases: ['tailwind', 'tailwindcss'],
    collisionGuard: (text, idx) => true
  },
  'bootstrap': {
    canonical: 'Bootstrap',
    category: 'Frontend',
    aliases: ['bootstrap 5', 'bootstrap 4', 'twitter bootstrap'],
    collisionGuard: (text, idx) => true
  },
  'sass': {
    canonical: 'Sass/SCSS',
    category: 'Frontend',
    aliases: ['scss', 'sass'],
    collisionGuard: (text, idx) => true
  },

  // ===================== BACKEND & RUNTIME =====================
  'node.js': {
    canonical: 'Node.js',
    category: 'Backend',
    // ELIMINATED 'node' alone to avoid matching cluster/tree node
    aliases: ['nodejs', 'node.js', 'node js'],
    collisionGuard: (text, idx) => true
  },
  'express.js': {
    canonical: 'Express.js',
    category: 'Backend',
    aliases: ['expressjs', 'express.js', 'express'],
    collisionGuard: (text, idx) => true
  },
  'nest.js': {
    canonical: 'NestJS',
    category: 'Backend',
    aliases: ['nestjs', 'nest.js'],
    collisionGuard: (text, idx) => true
  },
  'django': {
    canonical: 'Django',
    category: 'Backend',
    aliases: ['django rest framework', 'drf'],
    collisionGuard: (text, idx) => true
  },
  'flask': {
    canonical: 'Flask',
    category: 'Backend',
    aliases: [],
    collisionGuard: (text, idx) => true
  },
  'fastapi': {
    canonical: 'FastAPI',
    category: 'Backend',
    aliases: ['fast api'],
    collisionGuard: (text, idx) => true
  },
  'spring boot': {
    canonical: 'Spring Boot',
    category: 'Backend',
    // ELIMINATED generic 'spring' to prevent false positive on "Spring 2024"
    aliases: ['springboot', 'spring boot', 'spring framework', 'spring mvc', 'spring cloud', 'spring data'],
    collisionGuard: (text, idx) => true
  },
  '.net': {
    canonical: '.NET',
    category: 'Backend',
    aliases: ['dotnet', '.net core', 'asp.net', 'asp.net core', '.net 6', '.net 7', '.net 8'],
    collisionGuard: (text, idx) => true
  },

  // ===================== DATABASES & STORAGE =====================
  'mongodb': {
    canonical: 'MongoDB',
    category: 'Databases',
    aliases: ['mongo', 'mongoose'],
    collisionGuard: (text, idx) => true
  },
  'postgresql': {
    canonical: 'PostgreSQL',
    category: 'Databases',
    aliases: ['postgres', 'psql', 'pg'],
    collisionGuard: (text, idx) => true
  },
  'mysql': {
    canonical: 'MySQL',
    category: 'Databases',
    aliases: ['my sql'],
    collisionGuard: (text, idx) => true
  },
  'redis': {
    canonical: 'Redis',
    category: 'Databases',
    aliases: ['redis cache'],
    collisionGuard: (text, idx) => true
  },
  'sqlite': {
    canonical: 'SQLite',
    category: 'Databases',
    aliases: ['sqlite3'],
    collisionGuard: (text, idx) => true
  },
  'elasticsearch': {
    canonical: 'Elasticsearch',
    category: 'Databases',
    aliases: ['elastic search', 'elk stack', 'opensearch'],
    collisionGuard: (text, idx) => true
  },
  'dynamodb': {
    canonical: 'DynamoDB',
    category: 'Databases',
    aliases: ['aws dynamodb', 'dynamo db'],
    collisionGuard: (text, idx) => true
  },
  'supabase': {
    canonical: 'Supabase',
    category: 'Databases',
    aliases: [],
    collisionGuard: (text, idx) => true
  },
  'firebase': {
    canonical: 'Firebase',
    category: 'Databases',
    aliases: ['firestore', 'firebase realtime database'],
    collisionGuard: (text, idx) => true
  },
  'cassandra': {
    canonical: 'Apache Cassandra',
    category: 'Databases',
    aliases: ['cassandra'],
    collisionGuard: (text, idx) => true
  },

  // ===================== CLOUD & DEVOPS =====================
  'aws': {
    canonical: 'AWS',
    category: 'Cloud & DevOps',
    aliases: ['amazon web services', 'amazon aws', 'ec2', 's3', 'aws lambda', 'ecs', 'eks', 'cloudformation'],
    collisionGuard: (text, idx) => true
  },
  'azure': {
    canonical: 'Microsoft Azure',
    category: 'Cloud & DevOps',
    aliases: ['azure', 'azure devops', 'azure cloud'],
    collisionGuard: (text, idx) => true
  },
  'gcp': {
    canonical: 'Google Cloud Platform',
    category: 'Cloud & DevOps',
    aliases: ['google cloud', 'gcp', 'google cloud platform'],
    collisionGuard: (text, idx) => true
  },
  'docker': {
    canonical: 'Docker',
    category: 'Cloud & DevOps',
    aliases: ['docker compose', 'containerization', 'containers'],
    collisionGuard: (text, idx) => true
  },
  'kubernetes': {
    canonical: 'Kubernetes',
    category: 'Cloud & DevOps',
    aliases: ['k8s', 'helm'],
    collisionGuard: (text, idx) => true
  },
  'ci/cd': {
    canonical: 'CI/CD',
    category: 'Cloud & DevOps',
    aliases: ['cicd', 'continuous integration', 'continuous deployment', 'github actions', 'gitlab ci', 'jenkins'],
    collisionGuard: (text, idx) => true
  },
  'terraform': {
    canonical: 'Terraform',
    category: 'Cloud & DevOps',
    aliases: ['iac', 'infrastructure as code'],
    collisionGuard: (text, idx) => true
  },
  'linux': {
    canonical: 'Linux',
    category: 'Cloud & DevOps',
    aliases: ['unix', 'ubuntu', 'debian', 'centos', 'bash', 'shell scripting'],
    collisionGuard: (text, idx) => true
  },
  'nginx': {
    canonical: 'Nginx',
    category: 'Cloud & DevOps',
    aliases: ['reverse proxy'],
    collisionGuard: (text, idx) => true
  },
  'ansible': {
    canonical: 'Ansible',
    category: 'Cloud & DevOps',
    aliases: [],
    collisionGuard: (text, idx) => true
  },

  // ===================== ARCHITECTURE & PROTOCOLS =====================
  'rest api': {
    canonical: 'RESTful APIs',
    category: 'Architecture',
    aliases: ['restful apis', 'rest', 'rest api', 'rest apis', 'restful api', 'restful'],
    collisionGuard: (text, idx) => true
  },
  'graphql': {
    canonical: 'GraphQL',
    category: 'Architecture',
    aliases: ['apollo', 'apollo graphql'],
    collisionGuard: (text, idx) => true
  },
  'microservices': {
    canonical: 'Microservices',
    category: 'Architecture',
    aliases: ['microservice architecture', 'distributed systems'],
    collisionGuard: (text, idx) => true
  },
  'grpc': {
    canonical: 'gRPC',
    category: 'Architecture',
    aliases: ['protocol buffers', 'protobuf'],
    collisionGuard: (text, idx) => true
  },
  'websockets': {
    canonical: 'WebSockets',
    category: 'Architecture',
    aliases: ['socket.io', 'websocket'],
    collisionGuard: (text, idx) => true
  },
  'kafka': {
    canonical: 'Apache Kafka',
    category: 'Architecture',
    aliases: ['kafka', 'event-driven architecture'],
    collisionGuard: (text, idx) => true
  },
  'rabbitmq': {
    canonical: 'RabbitMQ',
    category: 'Architecture',
    aliases: ['message queues', 'amqp'],
    collisionGuard: (text, idx) => true
  },
  'system design': {
    canonical: 'System Design',
    category: 'Architecture',
    aliases: ['software architecture', 'high availability', 'scalability'],
    collisionGuard: (text, idx) => true
  },

  // ===================== TESTING & QUALITY =====================
  'jest': {
    canonical: 'Jest',
    category: 'Testing',
    aliases: [],
    collisionGuard: (text, idx) => true
  },
  'cypress': {
    canonical: 'Cypress',
    category: 'Testing',
    aliases: ['cypress.io'],
    collisionGuard: (text, idx) => true
  },
  'playwright': {
    canonical: 'Playwright',
    category: 'Testing',
    aliases: [],
    collisionGuard: (text, idx) => true
  },
  'selenium': {
    canonical: 'Selenium',
    category: 'Testing',
    aliases: ['selenium webdriver'],
    collisionGuard: (text, idx) => true
  },
  'unit testing': {
    canonical: 'Unit Testing',
    category: 'Testing',
    aliases: ['tdd', 'test driven development', 'integration testing', 'e2e testing', 'automated testing'],
    collisionGuard: (text, idx) => true
  },
  'pytest': {
    canonical: 'PyTest',
    category: 'Testing',
    aliases: [],
    collisionGuard: (text, idx) => true
  },
  'junit': {
    canonical: 'JUnit',
    category: 'Testing',
    aliases: ['junit5'],
    collisionGuard: (text, idx) => true
  },

  // ===================== TOOLS & MANAGEMENT =====================
  'git': {
    canonical: 'Git',
    category: 'Tools',
    aliases: ['github', 'gitlab', 'version control', 'bitbucket'],
    collisionGuard: (text, idx) => true
  },
  'jira': {
    canonical: 'Jira',
    category: 'Tools',
    // ELIMINATED 'agile', 'scrum', 'kanban' from Jira aliases
    aliases: ['atlassian jira', 'jira software'],
    collisionGuard: (text, idx) => true
  },
  'postman': {
    canonical: 'Postman',
    category: 'Tools',
    aliases: ['insomnia api'],
    collisionGuard: (text, idx) => true
  },

  // ===================== AI & DATA SCIENCE =====================
  'machine learning': {
    canonical: 'Machine Learning',
    category: 'AI & Data Science',
    aliases: ['ml', 'scikit-learn', 'sklearn'],
    collisionGuard: (text, idx) => true
  },
  'deep learning': {
    canonical: 'Deep Learning',
    category: 'AI & Data Science',
    aliases: ['neural networks', 'cnn', 'rnn', 'transformers'],
    collisionGuard: (text, idx) => true
  },
  'tensorflow': {
    canonical: 'TensorFlow',
    category: 'AI & Data Science',
    aliases: ['keras'],
    collisionGuard: (text, idx) => true
  },
  'pytorch': {
    canonical: 'PyTorch',
    category: 'AI & Data Science',
    aliases: ['torch'],
    collisionGuard: (text, idx) => true
  },
  'nlp': {
    canonical: 'Natural Language Processing',
    category: 'AI & Data Science',
    aliases: ['natural language processing', 'llm', 'large language models', 'langchain', 'huggingface', 'rag'],
    collisionGuard: (text, idx) => true
  },
  'pandas': {
    canonical: 'Pandas',
    category: 'AI & Data Science',
    aliases: [],
    collisionGuard: (text, idx) => true
  },
  'numpy': {
    canonical: 'NumPy',
    category: 'AI & Data Science',
    aliases: [],
    collisionGuard: (text, idx) => true
  },

  // ===================== METHODOLOGIES & SOFT SKILLS =====================
  'agile': {
    canonical: 'Agile',
    category: 'Methodologies',
    aliases: ['agile development', 'agile methodology', 'kanban', 'sprint planning'],
    collisionGuard: (text, idx) => true
  },
  'scrum': {
    canonical: 'Scrum',
    category: 'Methodologies',
    aliases: ['scrum master', 'daily standups', 'sprints'],
    collisionGuard: (text, idx) => true
  },
  'code review': {
    canonical: 'Code Review',
    category: 'Methodologies',
    aliases: ['peer reviews', 'pr reviews'],
    collisionGuard: (text, idx) => true
  },
  'leadership': {
    canonical: 'Leadership',
    category: 'Soft Skills',
    aliases: ['team lead', 'mentoring', 'cross-functional leadership', 'stakeholder management'],
    collisionGuard: (text, idx) => true
  }
};

// ===================== LOOKUP INDEXING =====================
const ALIAS_TO_CANONICAL = {};
const CANONICAL_TO_ENTRY = {};

Object.keys(SKILL_TAXONOMY).forEach((key) => {
  const item = SKILL_TAXONOMY[key];
  CANONICAL_TO_ENTRY[item.canonical.toLowerCase()] = item;

  // Primary key mapping
  ALIAS_TO_CANONICAL[key.toLowerCase()] = item.canonical;
  ALIAS_TO_CANONICAL[item.canonical.toLowerCase()] = item.canonical;

  // Alias mappings
  item.aliases.forEach((alias) => {
    ALIAS_TO_CANONICAL[alias.toLowerCase()] = item.canonical;
  });
});

/**
 * Normalizes any skill representation or variant to its canonical name.
 * @param {string} rawSkill
 * @returns {string} Canonical skill name or formatted string
 */
const normalizeSkill = (rawSkill) => {
  if (!rawSkill || typeof rawSkill !== 'string') return '';
  const cleaned = rawSkill.trim().toLowerCase();

  if (ALIAS_TO_CANONICAL[cleaned]) {
    return ALIAS_TO_CANONICAL[cleaned];
  }

  // If not in predefined dictionary, return clean title-cased token
  return rawSkill
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Returns skill category (Languages, Frontend, Backend, etc.)
 * @param {string} skillName
 * @returns {string}
 */
const getSkillCategory = (skillName) => {
  const norm = normalizeSkill(skillName).toLowerCase();
  if (CANONICAL_TO_ENTRY[norm]) {
    return CANONICAL_TO_ENTRY[norm].category;
  }
  return 'Other';
};

/**
 * High-fidelity skill extraction from free text with collision prevention.
 *
 * @param {string} text
 * @returns {string[]} Deduplicated canonical skills
 */
const extractSkillsFromText = (text) => {
  if (!text || typeof text !== 'string') return [];
  const foundSkills = new Set();
  const lowerText = ` ${text.toLowerCase()} `;

  // 1. Process custom-matcher skills (e.g. C, Go, R)
  Object.keys(SKILL_TAXONOMY).forEach((key) => {
    const entry = SKILL_TAXONOMY[key];
    if (entry.customMatcher && entry.customMatcher(text)) {
      foundSkills.add(entry.canonical);
    }
  });

  // 2. Process standard dictionary entries with strict collision checks
  Object.keys(SKILL_TAXONOMY).forEach((key) => {
    const entry = SKILL_TAXONOMY[key];
    if (entry.strictOnly) return; // Handled by customMatcher

    // Check primary key and all aliases
    const terms = [key, entry.canonical.toLowerCase(), ...entry.aliases];

    for (const term of terms) {
      if (!term || term.length < 2) continue;

      // Build regex with strict boundary checks
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])(${escaped})(?=[^a-zA-Z0-9_#+]|$)`, 'gi');

      let match;
      while ((match = regex.exec(lowerText)) !== null) {
        const matchIdx = match.index;

        // Run collision guard if present
        if (entry.collisionGuard && !entry.collisionGuard(lowerText, matchIdx, match[1])) {
          continue;
        }

        foundSkills.add(entry.canonical);
        break; // Match found for this entry, no need to check other aliases
      }

      if (foundSkills.has(entry.canonical)) break;
    }
  });

  return Array.from(foundSkills);
};

module.exports = {
  SKILL_TAXONOMY,
  SKILL_MAP: SKILL_TAXONOMY, // Backward compatibility
  ALIAS_LOOKUP: ALIAS_TO_CANONICAL, // Backward compatibility
  normalizeSkill,
  getSkillCategory,
  extractSkillsFromText
};
