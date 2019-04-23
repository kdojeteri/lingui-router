import {RouterI18n} from "./LinguiRouter";

describe('LinguiRouter', () => {
  it("should un-translate a location", () => {
    const i18n = new RouterI18n(
      'en',
      {'cs': {'/object/:objectId/person/:personId': '/objekt/:objectId/osoba/:personId'}}
    );

    expect(i18n.untranslatePathname('/cs/objekt/12/osoba/9638112')).toBe('/object/12/person/9638112');
  });

  it("should remove language prefix, given an unknown pathname", () => {
    const i18n = new RouterI18n(
      'en',
      {'en': {}}
    );

    expect(i18n.untranslatePathname('/en/object/12/person/9638112')).toBe('/object/12/person/9638112');
  });

  it("should only try to translate pathnames, not search or hash parts", () => {
    const i18n = new RouterI18n(
      'cs',
      {'cs': {'/greet/:objectId': '/pozdravit/:objectId'}}
    );

    expect(i18n.link('/greet/12?show-profile')).toBe('/cs/pozdravit/12?show-profile');
  })
});
