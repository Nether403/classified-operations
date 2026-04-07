import { useEffect } from "react";

const SITE_NAME = "PORTFOLIO OS";

export function useSEO({
  title,
  description,
  classification,
}: {
  title?: string;
  description?: string;
  classification?: string;
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    function setMeta(name: string, content: string) {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    }

    function setOG(property: string, content: string) {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.content = content;
    }

    if (description) setMeta("description", description);
    setOG("og:title", fullTitle);
    if (description) setOG("og:description", description);
    setOG("og:site_name", SITE_NAME);
    setOG("og:type", "website");
    if (classification) setMeta("classification", classification);

    return () => {
      document.title = SITE_NAME;
    };
  }, [title, description, classification]);
}
