import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSeoForPath } from '../constants/seo';

const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const removeEl = (selector) => {
  const el = document.head.querySelector(selector);
  if (el) el.remove();
};

/**
 * Keeps <title>, description, canonical, Open Graph and robots tags in step
 * with the current route. Google renders JavaScript, so it reads these;
 * crawlers that don't run JS see the home-page values from index.html.
 * Renders nothing.
 */
const RouteSeo = ({ notFound = false }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getSeoForPath(pathname, { knownRoute: !notFound });

    document.title = seo.title;
    setMeta('name', 'description', seo.description);
    setMeta('property', 'og:title', seo.title);
    setMeta('property', 'og:description', seo.description);
    setMeta('name', 'twitter:title', seo.title);
    setMeta('name', 'twitter:description', seo.description);

    if (seo.canonical) {
      let link = document.head.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', seo.canonical);
      setMeta('property', 'og:url', seo.canonical);
    } else {
      removeEl('link[rel="canonical"]');
    }

    if (seo.noindex) {
      setMeta('name', 'robots', 'noindex, follow');
    } else {
      removeEl('meta[name="robots"]');
    }
  }, [pathname, notFound]);

  return null;
};

export default RouteSeo;
