import { FilterItem } from "./FilterTypes";
import { MASTER_FILTER_CATALOG } from "./FilterParser";

export class FilterRepository {
  private filters: FilterItem[] = [];

  constructor() {
    this.loadCatalog();
  }

  private loadCatalog(): void {
    // Parse catalog: Filter enabled items matching Type == 'FILTERS' or 'Filter'
    this.filters = MASTER_FILTER_CATALOG.filter(
      (item) => (item.type === "FILTERS" || item.type === "Filter") && item.enabled
    );
  }

  public getAllFilters(): FilterItem[] {
    return this.filters;
  }

  public getCategories(): string[] {
    const categoriesSet = new Set<string>();
    this.filters.forEach((f) => {
      if (f.category) categoriesSet.add(f.category);
    });
    return Array.from(categoriesSet);
  }

  public getFiltersByCategory(category: string): FilterItem[] {
    if (category === "All") return this.filters;
    return this.filters.filter((f) => f.category === category);
  }

  public getFilterById(id: string): FilterItem | undefined {
    return this.filters.find((f) => f.id === id);
  }

  public searchFilters(query: string): FilterItem[] {
    if (!query.trim()) return this.filters;
    const q = query.toLowerCase().trim();
    return this.filters.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
    );
  }
}

export const filterRepository = new FilterRepository();
