import { useEffect } from 'react';

interface OGMetaOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function useOGMeta({ title, description, image, url }: OGMetaOptions) {
  useEffect(() => {
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) || 
               document.querySelector(`meta[name="${property}"]`);
      if (el) {
        el.setAttribute('content', content);
      }
    };

    if (title) {
      document.title = title;
      setMeta('og:title', title);
      setMeta('twitter:title', title);
    }
    if (description) {
      setMeta('og:description', description);
      setMeta('twitter:description', description);
      const descEl = document.querySelector('meta[name="description"]');
      if (descEl) descEl.setAttribute('content', description);
    }
    if (url) {
      setMeta('og:url', url);
      setMeta('twitter:url', url);
    }

    return () => {
      document.title = 'WishDay - Create Beautiful Wishes with Magical Animations';
    };
  }, [title, description, image, url]);
}
