export interface JobRole {
  id: string;
  title: string;
  category: string;
}

/**
 * Get list of available job roles
 */
export function getRoles(): JobRole[] {
  return [
    { id: 'data-analyst', title: 'Data Analyst', category: 'Analytics' },
    { id: 'software-engineer', title: 'Software Engineer', category: 'Engineering' },
    { id: 'product-manager', title: 'Product Manager', category: 'Management' },
    { id: 'cloud-engineer', title: 'Cloud Engineer', category: 'Engineering' },
    { id: 'devops-engineer', title: 'DevOps Engineer', category: 'Engineering' },
    { id: 'data-scientist', title: 'Data Scientist', category: 'Analytics' },
    { id: 'frontend-developer', title: 'Frontend Developer', category: 'Engineering' },
    { id: 'backend-developer', title: 'Backend Developer', category: 'Engineering' },
    { id: 'fullstack-developer', title: 'Full Stack Developer', category: 'Engineering' },
    { id: 'ux-designer', title: 'UX Designer', category: 'Design' },
    { id: 'ui-designer', title: 'UI Designer', category: 'Design' },
    { id: 'project-manager', title: 'Project Manager', category: 'Management' },
    { id: 'business-analyst', title: 'Business Analyst', category: 'Analytics' },
    { id: 'qa-engineer', title: 'QA Engineer', category: 'Engineering' },
    { id: 'security-engineer', title: 'Security Engineer', category: 'Engineering' },
  ];
}

/**
 * Get role by ID
 */
export function getRoleById(id: string): JobRole | undefined {
  return getRoles().find(role => role.id === id);
}
