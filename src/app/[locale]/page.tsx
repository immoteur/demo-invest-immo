import { PropertyList } from '@/components/PropertyList';
import { departments, findDepartment } from '@/lib/departments';
import { fetchPropertiesByDepartment, getDpeFilterLabels, getMaxResults } from '@/lib/immoteur';

const DEFAULT_DEPARTMENT_CODE = '75';

type SearchParams = {
  department?: string | string[];
  [key: string]: string | string[] | undefined;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const resolvedParams = await Promise.resolve(searchParams);
  const getParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);
  const departmentParam = getParam(resolvedParams.department);
  const departmentCode = (departmentParam ?? DEFAULT_DEPARTMENT_CODE).toUpperCase();
  const selectedDepartment =
    findDepartment(departmentCode) ?? findDepartment(DEFAULT_DEPARTMENT_CODE) ?? departments[0];

  const maxResults = getMaxResults();
  const dpeLabels = getDpeFilterLabels();
  const classifiedsPromise = fetchPropertiesByDepartment(selectedDepartment.code, {
    maxResults,
  });

  return (
    <PropertyList
      selectedDepartment={selectedDepartment}
      maxResults={maxResults}
      dpeLabels={dpeLabels}
      responsePromise={classifiedsPromise}
    />
  );
}
