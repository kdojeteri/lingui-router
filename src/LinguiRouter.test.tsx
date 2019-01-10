import {RouterI18n} from "./LinguiRouter";

describe('LinguiRouter', () => {
  it("should un-translate a location", () => {
    const i18n = new RouterI18n(
      'en',
      {'cs': {'/object/:objectId/person/:personId': '/objekt/:objectId/osoba/:personId'}}
    );

    expect(i18n.untranslateLocation('/cs/objekt/12/osoba/9638112')).toBe('/object/12/person/9638112');
  });
});
