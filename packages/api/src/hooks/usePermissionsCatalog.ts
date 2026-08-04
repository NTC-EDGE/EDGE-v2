import useSWR from 'swr';
import { apiClient } from '../apiClient';

export interface PermissionCatalogItem {
  key: string;
  category: string;
  label: string;
  tag?: string;
  description?: string;
}

export interface PermissionCategoryGroup {
  id: string;
  title: string;
  options: { id: string; label: string; tag?: string; description?: string }[];
}

export interface UsePermissionsCatalogReturn {
  permissionItems: PermissionCatalogItem[];
  categories: PermissionCategoryGroup[];
  isLoading: boolean;
  isError: boolean;
}

export function usePermissionsCatalog(): UsePermissionsCatalogReturn {
  const { data, error, isLoading } = useSWR<PermissionCatalogItem[]>(
    '/api/v2/permissions',
    async (url: string) => {
      const res = await apiClient.get<PermissionCatalogItem[]>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  const items = Array.isArray(data) ? data : [];

  // Dynamically group items into category cards directly from API response
  const categoryMap = new Map<
    string,
    { id: string; title: string; options: { id: string; label: string; tag?: string; description?: string }[] }
  >();

  items.forEach((item) => {
    const catId = item.category.toLowerCase().replace(/\s+/g, '_');
    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, {
        id: catId,
        title: item.category,
        options: [],
      });
    }
    categoryMap.get(catId)?.options.push({
      id: item.key,
      label: item.label,
      tag: item.tag,
      description: item.description,
    });
  });

  const categories = Array.from(categoryMap.values());

  return {
    permissionItems: items,
    categories,
    isLoading,
    isError: Boolean(error),
  };
}
