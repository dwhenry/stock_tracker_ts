/**
 * Build FormData from an HTML form (DOM API). Used so TypeScript accepts the
 * form argument when the global FormData is the Node/undici one that takes 0 args.
 */
export function formDataFromElement(form: HTMLFormElement): FormData {
  return new (FormData as unknown as new (form: HTMLFormElement) => FormData)(
    form
  );
}
