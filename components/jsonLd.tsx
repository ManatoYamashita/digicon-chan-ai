import {Thing, WithContext} from 'schema-dts';

export function JsonLd<T extends Thing>(json: WithContext<T>): string {
  return (`<script type="application/ld+json">${JSON.stringify(json)}</script>`);
}

export default JsonLd;