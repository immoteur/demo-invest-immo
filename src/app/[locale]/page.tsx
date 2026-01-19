import { PropertyList } from '@/components/PropertyList';
import {
  ALL_DEPARTMENT_CODE,
  departments,
  findDepartment,
  type DepartmentSelection,
} from '@/lib/departments';
import {
  fetchPropertiesByDepartmentSafe,
  getAllowNoDepartment,
  getDpeFilterLabels,
  getPropertyTypes,
  getMaxResults,
} from '@/lib/immoteur';

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
  const allowNoDepartment = getAllowNoDepartment();
  const normalizedParam = departmentParam?.trim() ?? '';
  const wantsAll =
    allowNoDepartment &&
    (normalizedParam.length === 0 || normalizedParam.toLowerCase() === ALL_DEPARTMENT_CODE);

  let selectedDepartment: DepartmentSelection;

  if (wantsAll) {
    selectedDepartment = {
      code: ALL_DEPARTMENT_CODE,
      name: 'All',
    };
  } else {
    const departmentCode = (normalizedParam || DEFAULT_DEPARTMENT_CODE).toUpperCase();
    selectedDepartment =
      findDepartment(departmentCode) ??
      (allowNoDepartment
        ? { code: ALL_DEPARTMENT_CODE, name: 'All' }
        : (findDepartment(DEFAULT_DEPARTMENT_CODE) ?? departments[0]));
  }

  const maxResults = getMaxResults();
  const dpeLabels = getDpeFilterLabels();
  const propertyTypes = getPropertyTypes();
  const classifiedsPromise = fetchPropertiesByDepartmentSafe(selectedDepartment.code, {
    maxResults,
  });

  return (
    <PropertyList
      selectedDepartment={selectedDepartment}
      allowNoDepartment={allowNoDepartment}
      maxResults={maxResults}
      dpeLabels={dpeLabels}
      propertyTypes={propertyTypes}
      responsePromise={classifiedsPromise}
    />
  );
}
