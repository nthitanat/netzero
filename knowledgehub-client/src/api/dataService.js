// Mock data services for Knowledge Hub
// Using JSON files instead of API calls for Phase 1

import communitiesData from '../data/communities.json';
import productsData from '../data/products.json';
import coursesData from '../data/courses.json';
import articlesData from '../data/articles.json';

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Communities Service
export const getAllCommunities = async (params = {}) => {
  await delay();
  let communities = [...communitiesData];
  
  // Filter by region
  if (params.region) {
    communities = communities.filter(c => c.region === params.region);
  }
  
  // Filter by category
  if (params.category) {
    communities = communities.filter(c => c.category === params.category);
  }
  
  // Filter by target market
  if (params.targetMarket) {
    communities = communities.filter(c => 
      c.targetMarkets.includes(params.targetMarket)
    );
  }
  
  return {
    data: {
      communities,
      total: communities.length
    }
  };
};

export const getCommunityBySlug = async (slug) => {
  await delay();
  const community = communitiesData.find(c => c.slug === slug);
  
  if (!community) {
    throw new Error('Community not found');
  }
  
  // Get related products
  const products = productsData.filter(p => p.communityId === community.id);
  
  // Get related courses
  const courses = coursesData.filter(c => c.communityId === community.id);
  
  return {
    data: {
      community,
      products,
      courses
    }
  };
};

// Products Service
export const getAllProducts = async (params = {}) => {
  await delay();
  let products = [...productsData];
  
  // Filter by category
  if (params.category) {
    products = products.filter(p => p.category === params.category);
  }
  
  // Filter by community
  if (params.communityId) {
    products = products.filter(p => p.communityId === params.communityId);
  }
  
  // Filter by availability
  if (params.available !== undefined) {
    products = products.filter(p => p.available === params.available);
  }
  
  // Filter by featured
  if (params.featured !== undefined) {
    products = products.filter(p => p.featured === params.featured);
  }
  
  // Filter by target market
  if (params.targetMarket) {
    products = products.filter(p => 
      p.localization.targetMarkets.includes(params.targetMarket)
    );
  }
  
  return {
    data: {
      products,
      total: products.length
    }
  };
};

export const getProductById = async (id) => {
  await delay();
  const product = productsData.find(p => p.id === id);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Get community info
  const community = communitiesData.find(c => c.id === product.communityId);
  
  return {
    data: {
      product,
      community
    }
  };
};

// Courses Service
export const getAllCourses = async (params = {}) => {
  await delay();
  let courses = [...coursesData];
  
  // Filter by community
  if (params.communityId) {
    courses = courses.filter(c => c.communityId === params.communityId);
  }
  
  // Filter by level
  if (params.level) {
    courses = courses.filter(c => c.level === params.level);
  }
  
  // Filter by featured
  if (params.featured !== undefined) {
    courses = courses.filter(c => c.featured === params.featured);
  }
  
  // Filter by language
  if (params.language) {
    courses = courses.filter(c => c.language.includes(params.language));
  }
  
  // CU courses only (null communityId)
  if (params.cuOnly) {
    courses = courses.filter(c => c.communityId === null);
  }
  
  return {
    data: {
      courses,
      total: courses.length
    }
  };
};

export const getCourseById = async (id) => {
  await delay();
  const course = coursesData.find(c => c.id === id);
  
  if (!course) {
    throw new Error('Course not found');
  }
  
  // Get community info if exists
  let community = null;
  if (course.communityId) {
    community = communitiesData.find(c => c.id === course.communityId);
  }
  
  return {
    data: {
      course,
      community
    }
  };
};

// Articles Service
export const getAllArticles = async (params = {}) => {
  await delay();
  let articles = [...articlesData];
  
  // Filter by category
  if (params.category) {
    articles = articles.filter(a => a.category === params.category);
  }
  
  // Filter by tag
  if (params.tag) {
    articles = articles.filter(a => a.tags.includes(params.tag));
  }
  
  // Sort by date (newest first)
  articles.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
  
  return {
    data: {
      articles,
      total: articles.length
    }
  };
};

export const getArticleById = async (id) => {
  await delay();
  const article = articlesData.find(a => a.id === id);
  
  if (!article) {
    throw new Error('Article not found');
  }
  
  return {
    data: {
      article
    }
  };
};

// Search Service (simple implementation)
export const searchAll = async (query, filters = {}) => {
  await delay();
  const searchQuery = query.toLowerCase();
  
  let results = {
    communities: [],
    products: [],
    courses: [],
    articles: []
  };
  
  // Search in communities
  results.communities = communitiesData.filter(c => 
    c.name.th.toLowerCase().includes(searchQuery) ||
    c.name.en.toLowerCase().includes(searchQuery) ||
    c.story.th.toLowerCase().includes(searchQuery) ||
    c.story.en.toLowerCase().includes(searchQuery)
  );
  
  // Search in products
  results.products = productsData.filter(p => 
    p.name.th.toLowerCase().includes(searchQuery) ||
    p.name.en.toLowerCase().includes(searchQuery) ||
    p.description.th.toLowerCase().includes(searchQuery) ||
    p.description.en.toLowerCase().includes(searchQuery)
  );
  
  // Search in courses
  results.courses = coursesData.filter(c => 
    c.title.th.toLowerCase().includes(searchQuery) ||
    c.title.en.toLowerCase().includes(searchQuery) ||
    c.description.th.toLowerCase().includes(searchQuery) ||
    c.description.en.toLowerCase().includes(searchQuery)
  );
  
  // Search in articles
  results.articles = articlesData.filter(a => 
    a.title.th.toLowerCase().includes(searchQuery) ||
    a.title.en.toLowerCase().includes(searchQuery) ||
    a.excerpt.th.toLowerCase().includes(searchQuery) ||
    a.excerpt.en.toLowerCase().includes(searchQuery)
  );
  
  return {
    data: {
      query,
      results,
      total: results.communities.length + results.products.length + 
             results.courses.length + results.articles.length
    }
  };
};

// Stats/Analytics (for dashboard)
export const getStats = async () => {
  await delay();
  
  return {
    data: {
      communities: communitiesData.length,
      products: productsData.length,
      courses: coursesData.length,
      articles: articlesData.length,
      totalMembers: communitiesData.reduce((sum, c) => sum + c.stats.members, 0)
    }
  };
};

// Helper functions for detail pages (return data directly)
export const getProductsByCommunity = async (communityId) => {
  await delay();
  return productsData.filter(p => p.communityId === communityId);
};

export const getCoursesByCommunity = async (communityId) => {
  await delay();
  return coursesData.filter(c => c.communityId === communityId);
};
