import {i18nPath, i18nTo} from "./templateTags";

describe('i18nTo function', function () {
  it('when used as a function, should return the same thing as a i18nTo`` tagged template string', function () {
    expect(i18nTo('/test/testId')).toEqual(i18nTo`/test/testId`);
  });

  it('should return its arguments when used as a tagged template string', function () {
    const TEST_ID = 'testId';
    expect(i18nTo`/test/${TEST_ID}`).toEqual([['/test/', ''], [TEST_ID]]);
  });
});

describe('i18nPath function', () => {
  it('can be called as a function', function () {
    expect(() => i18nPath('/test/:testId')).not.toThrow();
  });

  it('can be used as a template string literal tag', function () {
    expect(() => i18nPath`/test/:testId`).not.toThrow();
  });

  it('should fail if an expression is interpolated in the template string literal', function() {
    expect(() => i18nPath`/a/${'test'}`).toThrow();
  })
});
