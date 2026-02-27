// src/global.d.ts
export {};

declare global {
  interface NodeRequire {
    (id: string): any;
  }

  interface Window {
    require: NodeRequire;
  }

  const Swal: any;

}
