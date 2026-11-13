/**
 * Canonical Schema.org Structured Data generator for Build Your Business.
 * Provides unified, valid JSON-LD graph generation across all website routes.
 */

export const SITE_URL = 'https://build-your-business.pages.dev';
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const LOGO_ID = `${SITE_URL}/#logo`;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/brand/build-your-business-og.png`;
export const LOGO_URL = `${SITE_URL}/brand/build-your-business-logo.png`;

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

/**
 * Returns the canonical Organization entity for Build Your Business.
 */
export function getOrganizationEntity() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    "name": "Build Your Business",
    "url": `${SITE_URL}/`,
    "logo": {
      "@type": "ImageObject",
      "@id": LOGO_ID,
      "url": LOGO_URL,
      "contentUrl": LOGO_URL,
      "caption": "Build Your Business",
      "width": 900,
      "height": 303
    }
  };
}

/**
 * Returns the canonical WebSite entity.
 */
export function getWebSiteEntity() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    "url": `${SITE_URL}/`,
    "name": "Build Your Business",
    "description": "Practical, step-by-step guides and frameworks for finding ideas, validating demand, and launching your business without outside capital.",
    "publisher": {
      "@id": ORGANIZATION_ID
    },
    "inLanguage": "en-US"
  };
}

/**
 * Builds a Schema.org BreadcrumbList.
 */
export function getBreadcrumbList(currentPath: string, items: BreadcrumbItem[]) {
  const canonicalPath = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;
  const normalizedPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  const breadcrumbId = `${SITE_URL}${normalizedPath}#breadcrumb`;

  return {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId,
    "itemListElement": items.map((item, index) => {
      const itemUrl = item.url 
        ? (item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url.startsWith('/') ? '' : '/'}${item.url}`)
        : undefined;

      const listItem: Record<string, any> = {
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name
      };
      if (itemUrl) {
        listItem.item = itemUrl;
      }
      return listItem;
    })
  };
}

/**
 * Schema graph for the Homepage (/).
 */
export function getHomepageSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationEntity(),
      getWebSiteEntity(),
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        "url": `${SITE_URL}/`,
        "name": "Build Your Business | Practical Startup Guides & Frameworks",
        "description": "Practical guidance to help you start lean and grow a real business. Explore structured guides, core business frameworks, and step-by-step execution playbooks.",
        "isPartOf": { "@id": WEBSITE_ID },
        "about": { "@id": ORGANIZATION_ID },
        "inLanguage": "en-US",
        "breadcrumb": { "@id": `${SITE_URL}/#breadcrumb` }
      },
      getBreadcrumbList('/', [
        { name: 'Home', url: '/' }
      ])
    ]
  };
}

/**
 * Schema graph for the Blog Index (/blog/).
 */
export function getBlogIndexSchema(posts: Array<{ id: string; data: { title: string } }>) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationEntity(),
      getWebSiteEntity(),
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/blog/#webpage`,
        "url": `${SITE_URL}/blog/`,
        "name": "Business Guides & Articles | Build Your Business",
        "description": "Explore practical business guides and articles on starting lean, generating ideas, validating customer demand, and writing a simple business plan.",
        "isPartOf": { "@id": WEBSITE_ID },
        "inLanguage": "en-US",
        "breadcrumb": { "@id": `${SITE_URL}/blog/#breadcrumb` },
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": posts.length,
          "itemListElement": posts.map((post, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "url": `${SITE_URL}/blog/${post.id}/`,
            "name": post.data.title
          }))
        }
      },
      getBreadcrumbList('/blog/', [
        { name: 'Home', url: '/' },
        { name: 'Articles', url: '/blog/' }
      ])
    ]
  };
}

/**
 * Schema graph for an individual Article (/blog/[slug]/).
 */
export function getArticleSchema(entry: {
  id: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    author: string;
    image?: string;
  };
}) {
  const articleUrl = `${SITE_URL}/blog/${entry.id}/`;
  const resolvedImageUrl = entry.data.image
    ? (entry.data.image.startsWith('http') ? entry.data.image : `${SITE_URL}${entry.data.image.startsWith('/') ? '' : '/'}${entry.data.image}`)
    : DEFAULT_OG_IMAGE;

  const isTeam = entry.data.author.toLowerCase().includes('team') || entry.data.author === 'Build Your Business';
  const authorEntity = isTeam
    ? {
        "@type": "Organization",
        "name": entry.data.author,
        "url": `${SITE_URL}/`
      }
    : {
        "@type": "Person",
        "name": entry.data.author
      };

  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationEntity(),
      getWebSiteEntity(),
      {
        "@type": "BlogPosting",
        "@id": `${articleUrl}#article`,
        "isPartOf": { "@id": WEBSITE_ID },
        "headline": entry.data.title,
        "description": entry.data.description,
        "url": articleUrl,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": articleUrl
        },
        "datePublished": entry.data.pubDate.toISOString(),
        "author": authorEntity,
        "publisher": { "@id": ORGANIZATION_ID },
        "image": [resolvedImageUrl],
        "inLanguage": "en-US",
        "breadcrumb": { "@id": `${articleUrl}#breadcrumb` }
      },
      getBreadcrumbList(`/blog/${entry.id}/`, [
        { name: 'Home', url: '/' },
        { name: 'Articles', url: '/blog/' },
        { name: entry.data.title, url: `/blog/${entry.id}/` }
      ])
    ]
  };
}

/**
 * Schema graph for the About page (/about/).
 */
export function getAboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationEntity(),
      getWebSiteEntity(),
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/about/#webpage`,
        "url": `${SITE_URL}/about/`,
        "name": "About Build Your Business | Practical Business Guidance",
        "description": "Learn about Build Your Business: our mission to provide practical, evidence-based business guidance without the get-rich-quick hype or academic theory.",
        "isPartOf": { "@id": WEBSITE_ID },
        "inLanguage": "en-US",
        "about": { "@id": ORGANIZATION_ID },
        "mainEntity": { "@id": ORGANIZATION_ID },
        "breadcrumb": { "@id": `${SITE_URL}/about/#breadcrumb` }
      },
      getBreadcrumbList('/about/', [
        { name: 'Home', url: '/' },
        { name: 'About', url: '/about/' }
      ])
    ]
  };
}

/**
 * Schema graph for the Guides page (/guides/).
 */
export function getGuidesPageSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationEntity(),
      getWebSiteEntity(),
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/guides/#webpage`,
        "url": `${SITE_URL}/guides/`,
        "name": "Practical Business Guides | Build Your Business",
        "description": "Follow our structured, step-by-step business guides. Learn the sequential path from finding an idea and validating demand to planning and launching lean.",
        "isPartOf": { "@id": WEBSITE_ID },
        "inLanguage": "en-US",
        "breadcrumb": { "@id": `${SITE_URL}/guides/#breadcrumb` }
      },
      getBreadcrumbList('/guides/', [
        { name: 'Home', url: '/' },
        { name: 'Guides', url: '/guides/' }
      ])
    ]
  };
}

/**
 * Schema graph for the Resources page (/resources/).
 */
export function getResourcesPageSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationEntity(),
      getWebSiteEntity(),
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/resources/#webpage`,
        "url": `${SITE_URL}/resources/`,
        "name": "Business Frameworks & Toolkits | Build Your Business",
        "description": "Curated business frameworks, mental models, and working tools. Learn how to validate customer demand, structure business models, and plan daily operations.",
        "isPartOf": { "@id": WEBSITE_ID },
        "inLanguage": "en-US",
        "breadcrumb": { "@id": `${SITE_URL}/resources/#breadcrumb` }
      },
      getBreadcrumbList('/resources/', [
        { name: 'Home', url: '/' },
        { name: 'Resources', url: '/resources/' }
      ])
    ]
  };
}
