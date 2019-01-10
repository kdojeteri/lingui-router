import {RouterI18n} from "./LinguiRouter";

describe('LinguiRouter', () => {
  it("should un-translate a location", () => {
    const i18n = new RouterI18n(
      'en',
      {'cs': {'/object/:objectId/person/:personId': '/objekt/:objectId/osoba/:personId'}}
    );

    expect(i18n.untranslateLocation('/cs/objekt/12/osoba/9638112')).toBe('/object/12/person/9638112');
  });

  it("should remove language prefix, given an unknown pathname", () => {
    const i18n = new RouterI18n(
      'en',
      {'en': {}}
    );

    expect(i18n.untranslateLocation('/en/object/12/person/9638112')).toBe('/object/12/person/9638112');
  });
});
