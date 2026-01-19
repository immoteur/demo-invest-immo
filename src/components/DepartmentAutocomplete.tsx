'use client';

import { Select, SelectItem } from '@heroui/react';
import type { Key } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';
import { ALL_DEPARTMENT_CODE, type DepartmentOption } from '@/lib/departments';

type DepartmentAutocompleteProps = {
  departments: readonly DepartmentOption[];
  selectedCode: string;
  isSkeleton?: boolean;
};

export function DepartmentAutocomplete({
  departments,
  selectedCode,
  isSkeleton = false,
}: DepartmentAutocompleteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const handleSelectionChange = (keys: 'all' | Set<Key>) => {
    if (keys === 'all') return;
    const [nextKey] = keys;
    if (!nextKey) return;
    const nextValue = String(nextKey);
    if (nextValue === selectedCode) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('department', nextValue);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select
      aria-label={t('filters.department')}
      label={t('filters.department')}
      labelPlacement="outside"
      placeholder={t('filters.departmentPlaceholder')}
      selectedKeys={new Set([selectedCode])}
      selectionMode="single"
      disallowEmptySelection
      onSelectionChange={handleSelectionChange}
      size="lg"
      variant="flat"
      radius="lg"
      className={`w-full max-w-sm ${isSkeleton ? 'pointer-events-none opacity-60' : ''}`}
      isDisabled={isSkeleton}
      classNames={{
        trigger: 'bg-card soft-ring',
        label: 'text-muted text-xs uppercase tracking-[0.2em]',
        value: 'text-foreground',
      }}
    >
      {departments.map((department) => {
        const isAll = department.code === ALL_DEPARTMENT_CODE;
        const label = isAll ? department.name : `${department.code} - ${department.name}`;
        const textValue = isAll ? department.name : `${department.code} ${department.name}`;
        return (
          <SelectItem key={department.code} textValue={textValue}>
            {label}
          </SelectItem>
        );
      })}
    </Select>
  );
}
