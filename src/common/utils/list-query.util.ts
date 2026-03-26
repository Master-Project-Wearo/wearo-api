import { ListQueryDto } from '../dto/list-query.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export function getPagination(query: ListQueryDto) {
  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_LIMIT;

  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function getSearchTerm(query: ListQueryDto) {
  const term = query.q?.trim();
  return term && term.length > 0 ? term : undefined;
}
