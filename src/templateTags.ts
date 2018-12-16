import {I18nPath} from "./LinguiRouter";

export const i18nTo = (path: string | TemplateStringsArray, ...expressions: any[]): I18nPath => {
  if (Array.isArray(path)) {
    return [Array.from(path), expressions];
  } else if (typeof path === 'string') {
    return [[path], []];
  } else {
    return [[], []];
  }
};

export const i18nPath = (path: string | TemplateStringsArray, ...expressions: any[]): string => {
  if (expressions.length > 0) {
    throw new RangeError('i18nPath can\'t take template string literals with any expressions');
  }

  return typeof path === 'string' ? path : path.join('');
};
