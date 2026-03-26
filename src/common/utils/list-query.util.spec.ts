import { getPagination, getSearchTerm } from './list-query.util';

describe('list-query.util', () => {
  it('getPagination should return defaults when query is empty', () => {
    expect(getPagination({})).toEqual({ skip: 0, take: 20 });
  });

  it('getPagination should compute skip/take from page and limit', () => {
    expect(getPagination({ page: 3, limit: 10 })).toEqual({ skip: 20, take: 10 });
  });

  it('getSearchTerm should return undefined for empty values', () => {
    expect(getSearchTerm({})).toBeUndefined();
    expect(getSearchTerm({ q: '   ' })).toBeUndefined();
  });

  it('getSearchTerm should trim non-empty value', () => {
    expect(getSearchTerm({ q: '  hello  ' })).toBe('hello');
  });
});
