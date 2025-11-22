/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

declare module 'swiper/css' {
  const content: string;
  export default content;
}

declare module 'swiper/css/*' {
  const content: string;
  export default content;
}

