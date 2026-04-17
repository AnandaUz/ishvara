declare module "*.html?raw" {
  const content: string;
  export default content;
}

interface Window {
  fbq: any;
}

declare var fbq: any;
